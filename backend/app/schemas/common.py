"""Common shared Pydantic schemas for the application."""

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str = Field(..., description="Operational status of the service", json_schema_extra={"example": "ok"})
    service: str = Field(..., description="Service identifier", json_schema_extra={"example": "sonar-backend"})
    version: str = Field(..., description="API version identifier", json_schema_extra={"example": "v1"})
