from typing import List, Optional

from pydantic import BaseModel, Field


class ModelInfo(BaseModel):
    name: str
    status: str
    type: str
    classes: List[str]


class ModelListResponse(BaseModel):
    models: List[ModelInfo]


class ModelHealth(BaseModel):
    name: str
    status: str
    version: Optional[str] = None
    type: Optional[str] = None
    classes: List[str] = Field(default_factory=list)
