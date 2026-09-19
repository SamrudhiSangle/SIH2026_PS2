from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Dict, List


class BaseModel(ABC):
    name: str = ""
    version: str = "1.0"
    status: str = "UNINITIALIZED"
    model_type: str = "YOLO"
    class_names: List[str] = []

    def __init__(self, model_name: str, model_type: str = "YOLO"):
        self.name = model_name
        self.model_type = model_type
        self.status = "UNINITIALIZED"
        self.class_names = []

    @abstractmethod
    def load(self) -> Dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    def predict(self, image_path: str) -> Dict[str, Any]:
        raise NotImplementedError

    def health(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "status": self.status,
            "version": self.version,
            "type": self.model_type,
            "classes": self.class_names,
        }

    def normalize_detections(self, result_list: List[Any]) -> List[Dict[str, Any]]:
        detections: List[Dict[str, Any]] = []
        for result in result_list:
            boxes = getattr(result, "boxes", None)
            if boxes is None or len(boxes) == 0:
                continue
            for box in boxes:
                cls_id = int(box.cls[0]) if hasattr(box.cls, "__len__") else int(box.cls)
                conf = float(box.conf[0]) if hasattr(box.conf, "__len__") else float(box.conf)
                x1, y1, x2, y2 = [float(value) for value in box.xyxy[0].tolist()]
                detections.append(
                    {
                        "class_name": self.class_names[cls_id] if cls_id < len(self.class_names) else str(cls_id),
                        "confidence": round(conf, 4),
                        "bbox": {"x1": int(round(x1)), "y1": int(round(y1)), "x2": int(round(x2)), "y2": int(round(y2))},
                    }
                )
        return detections
