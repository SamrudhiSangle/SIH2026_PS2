import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, HTTPException, Request, UploadFile, status

from app.database.database import SessionLocal
from app.database.repository import PredictionRepository
from app.services.file_service import cleanup_temp_file, save_uploaded_temp_file
from app.services.inference_service import InferenceService

router = APIRouter(prefix="/api")


async def _handle_prediction(request: Request, model_name: str, file: Optional[UploadFile] = None):
    manager = request.app.state.model_manager
    if model_name not in manager.models:
        raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found")

    if file is None:
        raise HTTPException(status_code=400, detail="Image file required")

    try:
        temp_path = save_uploaded_temp_file(file)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    request_id = str(uuid.uuid4())
    service = InferenceService(manager)
    try:
        result = service.predict(model_name, str(temp_path), request_id)
        result["input_filename"] = file.filename

        db = SessionLocal()
        try:
            repo = PredictionRepository(db)
            repo.save_prediction(result)
        finally:
            db.close()

        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inference failed: {exc}") from exc
    finally:
        cleanup_temp_file(temp_path)


@router.post("/predict/{model_name}")
async def predict_generic(request: Request, model_name: str, file: Optional[UploadFile] = File(default=None)):
    return await _handle_prediction(request, model_name, file)


@router.post("/predict/ghostvision")
async def predict_ghostvision(request: Request, file: UploadFile = File(...)):
    return await _handle_prediction(request, "ghostvision", file)


@router.post("/predict/subpipe")
async def predict_subpipe(request: Request, file: UploadFile = File(...)):
    return await _handle_prediction(request, "subpipe", file)


@router.post("/predict/shipwreck")
async def predict_shipwreck(request: Request, file: UploadFile = File(None)):
    if file is None:
        return {
            "request_id": str(uuid.uuid4()),
            "model": "shipwreck",
            "model_version": "mock",
            "model_status": "MOCK",
            "status": "SUCCESS",
            "processing_time_ms": 0,
            "detections": [],
            "metadata": {},
            "message": "Shipwreck model is not available yet.",
        }

    return await _handle_prediction(request, "shipwreck", file)
