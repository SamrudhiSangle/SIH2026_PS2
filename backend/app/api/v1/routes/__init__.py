"""V1 API routes router configuration."""

from fastapi import APIRouter
from app.api.v1.routes import analysis, health, inference, models

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(models.router, tags=["models"])
api_router.include_router(inference.router, prefix="/inference", tags=["inference"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
