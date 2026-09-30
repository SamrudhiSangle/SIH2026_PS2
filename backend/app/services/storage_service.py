"""Storage service for Sonar evidence images.

Supports local filesystem storage and Supabase Storage with dedicated bucket
'sonar-evidence' and standardized object paths:
    sonar-evidence/{analysis_id}/original/{filename}
"""

import logging
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class StorageError(Exception):
    """Base exception for evidence storage operations."""
    pass


class StorageProvider(ABC):
    """Abstract interface for evidence storage providers."""

    @abstractmethod
    def save_file(self, storage_path: str, data: bytes, content_type: str) -> str:
        """Save raw bytes to the specified storage path and return the path."""
        pass

    @abstractmethod
    def get_file(self, storage_path: str) -> bytes:
        """Retrieve raw bytes from the specified storage path."""
        pass

    @abstractmethod
    def delete_file(self, storage_path: str) -> bool:
        """Delete file at the specified storage path."""
        pass

    @abstractmethod
    def file_exists(self, storage_path: str) -> bool:
        """Check if file exists at the specified storage path."""
        pass


class LocalStorageProvider(StorageProvider):
    """Local filesystem storage provider for development, testing, and offline modes."""

    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = Path(base_dir or settings.LOCAL_STORAGE_DIR).resolve()
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _resolve_path(self, storage_path: str) -> Path:
        """Resolve storage path relative to base directory, stripping redundant bucket prefix."""
        clean_path = storage_path.replace("\\", "/").strip("/")
        # If path starts with bucket name, strip it to avoid nested duplicate folders
        bucket_prefix = f"{settings.SUPABASE_STORAGE_BUCKET}/"
        if clean_path.startswith(bucket_prefix):
            clean_path = clean_path[len(bucket_prefix):]

        target = (self.base_dir / clean_path).resolve()
        # Prevent directory traversal attacks
        if not str(target).startswith(str(self.base_dir)):
            raise StorageError(f"Invalid path traversal attempt: {storage_path}")
        return target

    def save_file(self, storage_path: str, data: bytes, content_type: str) -> str:
        try:
            target = self._resolve_path(storage_path)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
            logger.info(f"Saved local evidence: {target} ({len(data)} bytes)")
            return storage_path
        except Exception as e:
            logger.error(f"Failed to write local evidence file: {e}")
            raise StorageError(f"Local storage write failed: {e}") from e

    def get_file(self, storage_path: str) -> bytes:
        target = self._resolve_path(storage_path)
        if not target.exists() or not target.is_file():
            raise StorageError(f"Evidence file not found: {storage_path}")
        try:
            return target.read_bytes()
        except Exception as e:
            logger.error(f"Failed to read local evidence file: {e}")
            raise StorageError(f"Local storage read failed: {e}") from e

    def delete_file(self, storage_path: str) -> bool:
        try:
            target = self._resolve_path(storage_path)
            if target.exists() and target.is_file():
                target.unlink()
                # Clean up empty parent directories up to base_dir
                parent = target.parent
                while parent != self.base_dir and not any(parent.iterdir()):
                    parent.rmdir()
                    parent = parent.parent
                return True
            return False
        except Exception as e:
            logger.warning(f"Failed to delete local evidence file: {e}")
            return False

    def file_exists(self, storage_path: str) -> bool:
        try:
            target = self._resolve_path(storage_path)
            return target.exists() and target.is_file()
        except Exception:
            return False


class SupabaseStorageProvider(StorageProvider):
    """Supabase REST API object storage provider."""

    def __init__(self, url: str, service_key: str, bucket: str = "sonar-evidence"):
        self.url = url.rstrip("/")
        self.service_key = service_key
        self.bucket = bucket
        self.headers = {
            "Authorization": f"Bearer {service_key}",
            "apiKey": service_key,
        }

    def _object_key(self, storage_path: str) -> str:
        """Strip bucket prefix if present for object key in bucket."""
        clean = storage_path.replace("\\", "/").strip("/")
        if clean.startswith(f"{self.bucket}/"):
            return clean[len(self.bucket) + 1 :]
        return clean

    def save_file(self, storage_path: str, data: bytes, content_type: str) -> str:
        object_key = self._object_key(storage_path)
        api_url = f"{self.url}/storage/v1/object/{self.bucket}/{object_key}"
        headers = {
            **self.headers,
            "Content-Type": content_type or "application/octet-stream",
            "x-upsert": "true",
        }
        try:
            with httpx.Client(timeout=30.0) as client:
                res = client.post(api_url, content=data, headers=headers)
                if res.status_code not in (200, 201):
                    raise StorageError(f"Supabase upload failed ({res.status_code}): {res.text}")
            return storage_path
        except Exception as e:
            logger.error(f"Supabase upload error: {e}")
            raise StorageError(f"Supabase storage write failed: {e}") from e

    def get_file(self, storage_path: str) -> bytes:
        object_key = self._object_key(storage_path)
        api_url = f"{self.url}/storage/v1/object/authenticated/{self.bucket}/{object_key}"
        try:
            with httpx.Client(timeout=30.0) as client:
                res = client.get(api_url, headers=self.headers)
                if res.status_code == 404:
                    raise StorageError(f"Evidence not found in Supabase: {storage_path}")
                if res.status_code != 200:
                    raise StorageError(f"Supabase download failed ({res.status_code}): {res.text}")
                return res.content
        except Exception as e:
            logger.error(f"Supabase download error: {e}")
            raise StorageError(f"Supabase storage read failed: {e}") from e

    def delete_file(self, storage_path: str) -> bool:
        object_key = self._object_key(storage_path)
        api_url = f"{self.url}/storage/v1/object/{self.bucket}/{object_key}"
        try:
            with httpx.Client(timeout=30.0) as client:
                res = client.delete(api_url, headers=self.headers)
                return res.status_code in (200, 204)
        except Exception as e:
            logger.warning(f"Supabase delete error: {e}")
            return False

    def file_exists(self, storage_path: str) -> bool:
        try:
            self.get_file(storage_path)
            return True
        except Exception:
            return False


class StorageService:
    """High-level evidence storage manager."""

    def __init__(self, provider: Optional[StorageProvider] = None):
        if provider is not None:
            self.provider = provider
        elif (
            settings.STORAGE_PROVIDER.lower() == "supabase"
            and settings.SUPABASE_URL
            and settings.SUPABASE_SERVICE_ROLE_KEY
        ):
            self.provider = SupabaseStorageProvider(
                url=settings.SUPABASE_URL,
                service_key=settings.SUPABASE_SERVICE_ROLE_KEY,
                bucket=settings.SUPABASE_STORAGE_BUCKET,
            )
        else:
            self.provider = LocalStorageProvider(settings.LOCAL_STORAGE_DIR)

    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Sanitize filename to prevent directory traversal and invalid characters."""
        safe_name = Path(filename).name
        # Keep alphanumeric, dots, underscores, dashes
        cleaned = "".join(c for c in safe_name if c.isalnum() or c in "._- ")
        return cleaned.strip() or "evidence.png"

    def build_storage_path(self, analysis_id: str, filename: str) -> str:
        """Construct standard storage path: sonar-evidence/{analysis_id}/original/{filename}."""
        safe_filename = self.sanitize_filename(filename)
        return f"{settings.SUPABASE_STORAGE_BUCKET}/{analysis_id}/original/{safe_filename}"

    def save_evidence(
        self,
        analysis_id: str,
        filename: str,
        data: bytes,
        content_type: str = "image/png",
    ) -> str:
        """Save sonar evidence image and return the standard storage path."""
        storage_path = self.build_storage_path(analysis_id, filename)
        return self.provider.save_file(storage_path, data, content_type)

    def get_evidence(self, storage_path: str) -> bytes:
        """Retrieve raw evidence image bytes."""
        return self.provider.get_file(storage_path)

    def delete_evidence(self, storage_path: str) -> bool:
        """Delete evidence image by storage path."""
        return self.provider.delete_file(storage_path)


storage_service = StorageService()
