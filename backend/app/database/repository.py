from __future__ import annotations

import json
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from app.database.models import Detection, Prediction


class PredictionRepository:
    def __init__(self, db: Session):
        self.db = db

    def save_prediction(self, payload: Dict[str, Any]) -> Prediction:
        prediction = Prediction(
            request_id=payload["request_id"],
            model_name=payload["model"],
            model_version=payload.get("model_version", "1.0"),
            status=payload.get("status", "SUCCESS"),
            processing_time_ms=payload.get("processing_time_ms", 0),
            input_filename=payload.get("input_filename"),
            result_json=json.dumps(payload),
        )
        self.db.add(prediction)
        self.db.flush()

        for detection in payload.get("detections", []):
            rect = detection.get("bbox", {})
            self.db.add(
                Detection(
                    prediction_id=prediction.id,
                    class_name=detection.get("class_name", "unknown"),
                    confidence=float(detection.get("confidence", 0.0)),
                    x1=rect.get("x1"),
                    y1=rect.get("y1"),
                    x2=rect.get("x2"),
                    y2=rect.get("y2"),
                    review_status="pending",
                )
            )

        self.db.commit()
        self.db.refresh(prediction)
        return prediction

    def list_reviews(self) -> List[Detection]:
        return self.db.query(Detection).all()

    def update_review_status(self, detection_id: int, review_status: str) -> Optional[Detection]:
        detection = self.db.query(Detection).filter(Detection.id == detection_id).first()
        if detection is None:
            return None
        detection.review_status = review_status
        self.db.commit()
        self.db.refresh(detection)
        return detection
