from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

from ultralytics import YOLO

from app.core.config import settings
from app.models.base_model import BaseModel


class SubPipeModel(BaseModel):
    def __init__(self):
        super().__init__("subpipe", "YOLO")
        self.model = None
        self.model_path = settings.subpipe_path
        self.version = "1.0"
        self.class_names = ["Pipeline"]

    def load(self) -> Dict[str, Any]:
        if not self.model_path.exists():
            self.status = "ERROR"
            raise FileNotFoundError(f"SubPipe model not found: {self.model_path}")

        self.model = YOLO(str(self.model_path))
        self.status = "READY"
        return {"name": self.name, "status": self.status, "type": self.model_type, "classes": self.class_names}

    def predict(self, image_path: str) -> Dict[str, Any]:
        if self.model is None:
            self.load()
        results = self.model.predict(source=str(image_path), conf=0.25, imgsz=640, verbose=False)
        detections = self.normalize_detections(results)
        return {
            "model": self.name,
            "model_status": self.status,
            "status": "SUCCESS",
            "detections": detections,
            "message": "",
        }

    def health(self) -> Dict[str, Any]:
        return super().health()
