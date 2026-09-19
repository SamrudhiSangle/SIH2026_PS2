from __future__ import annotations

import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.health import router as health_router
from app.api.models import router as models_router
from app.api.predictions import router as predictions_router
from app.api.reviews import router as reviews_router
from app.core.config import settings
from app.core.logging import log_request_event, setup_logging
from app.database.database import init_db
from app.models.ghostvision_model import GhostVisionModel
from app.models.model_manager import ModelManager
from app.models.shipwreck_model import ShipwreckModel
from app.models.subpipe_model import SubPipeModel


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    init_db()

    manager = ModelManager()
    manager.register_model(GhostVisionModel())
    manager.register_model(SubPipeModel())
    manager.register_model(ShipwreckModel())

    print("Loading GhostVision...")
    try:
        manager.get_model("ghostvision").load()
        print("✓ READY")
    except Exception as exc:  # pragma: no cover - startup diagnostics
        manager.get_model("ghostvision").status = "ERROR"
        print(f"✗ ERROR: {exc}")

    print("Loading SubPipeMini2...")
    try:
        manager.get_model("subpipe").load()
        print("✓ READY")
    except Exception as exc:  # pragma: no cover - startup diagnostics
        manager.get_model("subpipe").status = "ERROR"
        print(f"✗ ERROR: {exc}")

    print("Loading Shipwreck...")
    manager.get_model("shipwreck").load()
    if manager.get_model("shipwreck").status == "MOCK":
        print("⚠ MOCK")
    else:
        print("✓ READY")

    print("Backend ready.")
    app.state.model_manager = manager
    yield


app = FastAPI(
    title="SIH 26057 Backend",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    log_request_event("request started", request_id)
    start = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception as exc:  # pragma: no cover - error path
        duration_ms = (time.perf_counter() - start) * 1000
        log_request_event("request failed", request_id, processing_ms=duration_ms, status="ERROR", extra=f"error={exc}")
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

    duration_ms = (time.perf_counter() - start) * 1000
    log_request_event("request completed", request_id, processing_ms=duration_ms, status=str(response.status_code))
    response.headers["X-Request-ID"] = request_id
    return response


app.include_router(health_router)
app.include_router(models_router)
app.include_router(predictions_router)
app.include_router(reviews_router)


@app.get("/")
async def root():
    return {"message": "SIH 26057 backend"}
