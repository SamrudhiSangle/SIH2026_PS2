"""Health check response schema."""

from typing import Dict
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health check response containing service state and model availability."""

    status: str = Field(default="ok", description="Operational status of backend service")
    service: str = Field(default="sonar-backend", description="Backend service identifier")
    models: Dict[str, str] = Field(
        default_factory=lambda: {
            "cylinder": "available",
            "ghostvision": "available",
            "mine": "available",
            "shipwreck": "available",
            "subpipe": "available",
            "natural_seabed": "unavailable",
        },
        description="Availability status of each Side-Scan Sonar detection model",
    )
