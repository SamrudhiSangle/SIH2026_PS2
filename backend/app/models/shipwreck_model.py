from __future__ import annotations

from typing import Any, Dict

from app.models.base_model import BaseModel


class ShipwreckModel(BaseModel):
    def __init__(self):
        super().__init__("shipwreck", "YOLO")
        self.version = "mock"
        self.status = "MOCK"
        self.class_names = []
        self.model = None

    def load(self) -> Dict[str, Any]:
        self.status = "MOCK"
        return {"name": self.name, "status": self.status, "type": self.model_type, "classes": self.class_names}

    def predict(self, image_path: str) -> Dict[str, Any]:
        return {
            "model": self.name,
            "model_status": "MOCK",
            "status": "SUCCESS",
            "detections": [],
            "message": "Shipwreck model is not available yet.",
        }

    def health(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "status": self.status,
            "version": self.version,
            "type": self.model_type,
            "classes": self.class_names,
        }
