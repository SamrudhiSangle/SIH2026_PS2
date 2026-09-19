from __future__ import annotations

import os
import tempfile
import uuid
from pathlib import Path
from typing import BinaryIO, Optional

from fastapi import UploadFile

from app.core.config import settings


def validate_upload_file(file: UploadFile) -> None:
    if not file.filename:
        raise ValueError("Missing filename")

    extension = Path(file.filename).suffix.lower()
    if extension not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise ValueError(f"Unsupported file type: {extension}")

    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)
    if size <= 0:
        raise ValueError("Uploaded file is empty")
    if size > settings.max_upload_bytes:
        raise ValueError("File exceeds maximum allowed size")


def save_uploaded_temp_file(file: UploadFile) -> Path:
    validate_upload_file(file)
    file.file.seek(0)
    suffix = Path(file.filename).suffix.lower()
    safe_name = f"{uuid.uuid4()}{suffix}"
    temp_dir = settings.upload_path
    temp_path = temp_dir / safe_name
    with temp_path.open("wb") as dest:
        dest.write(file.file.read())
    return temp_path


def cleanup_temp_file(path: Optional[Path | str]) -> None:
    if not path:
        return
    try:
        Path(path).unlink(missing_ok=True)
    except Exception:
        pass
