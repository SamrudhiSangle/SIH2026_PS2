from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class Detection(BaseModel):
    class_name: str
    confidence: float
    bbox: BoundingBox


class PredictionResponse(BaseModel):
    request_id: str
    model: str
    model_version: str
    model_status: str
    status: str
    processing_time_ms: int
    detections: List[Detection] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    message: Optional[str] = None
