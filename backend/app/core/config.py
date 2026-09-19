"""Application Configuration with Pydantic Settings."""

import json
from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base directories
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = BACKEND_DIR.parent


class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "SIH 26057 — Underwater Debris & Pipeline Detection"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = False

    # Models
    GHOSTVISION_MODEL_PATH: str = "generated_models/GhostVision_YOLO12s_best.pt"
    SUBPIPE_MODEL_PATH: str = "generated_models/SubPipeMini2_YOLO12s_best.pt"
    SHIPWRECK_MODEL_PATH: str = ""
    SHIPWRECK_MODEL_MODE: str = "mock"

    # Database
    DATABASE_URL: str = "sqlite:///./sih.db"

    # Uploads
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 25
    ALLOWED_IMAGE_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".tif", ".tiff"]

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    def resolve_path(self, path_str: str) -> Path:
        """Resolves path relative to BACKEND_DIR if not absolute."""
        if not path_str:
            return Path()
        p = Path(path_str)
        if p.is_absolute():
            return p
        # Check relative to backend dir
        backend_rel = (BACKEND_DIR / p).resolve()
        if backend_rel.exists():
            return backend_rel
        # Check relative to project root
        root_rel = (PROJECT_ROOT / p).resolve()
        if root_rel.exists():
            return root_rel
        return backend_rel

    @property
    def ghostvision_path(self) -> Path:
        return self.resolve_path(self.GHOSTVISION_MODEL_PATH)

    @property
    def subpipe_path(self) -> Path:
        return self.resolve_path(self.SUBPIPE_MODEL_PATH)

    @property
    def shipwreck_path(self) -> Path:
        return self.resolve_path(self.SHIPWRECK_MODEL_PATH)

    @property
    def upload_path(self) -> Path:
        p = self.resolve_path(self.UPLOAD_DIR)
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024


settings = Settings()
