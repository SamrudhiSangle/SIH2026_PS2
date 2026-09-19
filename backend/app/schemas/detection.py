from typing import Optional

from pydantic import BaseModel


class DetectionRecord(BaseModel):
    id: int
    prediction_id: int
    class_name: str
    confidence: float
    x1: Optional[float] = None
    y1: Optional[float] = None
    x2: Optional[float] = None
    y2: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    risk_score: Optional[float] = None
    review_status: str = "pending"
