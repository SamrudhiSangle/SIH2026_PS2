from typing import Optional

from pydantic import BaseModel


class ReviewStatusUpdate(BaseModel):
    review_status: str


class ReviewRecord(BaseModel):
    id: int
    prediction_id: int
    class_name: str
    confidence: float
    review_status: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
