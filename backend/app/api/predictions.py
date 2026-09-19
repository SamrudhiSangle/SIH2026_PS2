import uuid
from pathlib import Path
from typing import Any, Dict, Optional

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


def _persist_prediction(result: Dict[str, Any]) -> None:
    db = SessionLocal()
    try:
        repo = PredictionRepository(db)
        repo.save_prediction(result)
    finally:
        db.close()


def _model_error(model_name: str) -> Dict[str, Any]:
    return {
        "model": model_name,
        "model_version": "unknown",
        "model_status": "ERROR",
        "status": "ERROR",
        "processing_time_ms": 0,
        "detections": [],
        "metadata": {},
        "message": "Model inference failed.",
    }


@router.post("/predict/ghostvision")
async def predict_ghostvision(request: Request, file: UploadFile = File(...)):
    return await _handle_prediction(request, "ghostvision", file)


@router.post("/predict/subpipe")
async def predict_subpipe(request: Request, file: UploadFile = File(...)):
    return await _handle_prediction(request, "subpipe", file)


@router.post("/predict/all")
async def predict_all(request: Request, file: UploadFile = File(...)):
    manager = request.app.state.model_manager
    if file is None:
        raise HTTPException(status_code=400, detail="Image file required")

    try:
        temp_path = save_uploaded_temp_file(file)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    request_id = str(uuid.uuid4())
    service = InferenceService(manager)
    model_results: Dict[str, Dict[str, Any]] = {}
    combined_detections = []

    try:
        for model_name in ("ghostvision", "subpipe"):
            try:
                result = service.predict(model_name, str(temp_path), request_id)
            except Exception:
                result = _model_error(model_name)

            model_results[model_name] = result
            for detection in result.get("detections", []):
                combined_detections.append({"model": model_name, **detection})

        model_results["shipwreck"] = {
            "model": "shipwreck",
            "model_version": "mock",
            "model_status": "MOCK",
            "status": "MOCK",
            "processing_time_ms": 0,
            "detections": [],
            "metadata": {},
            "message": "Shipwreck model not available yet",
        }

        result = {
            "request_id": request_id,
            "model": "all",
            "model_version": "combined",
            "model_status": "COMBINED",
            "status": "SUCCESS" if all(item["status"] != "ERROR" for item in model_results.values()) else "PARTIAL_SUCCESS",
            "processing_time_ms": sum(item.get("processing_time_ms", 0) for item in model_results.values()),
            "input_filename": file.filename,
            "models": model_results,
            "combined_detections": combined_detections,
            "detections": combined_detections,
            "metadata": {
                "reliability": service.reliability.evaluate({"detections": combined_detections}, str(temp_path)),
            },
            "message": None,
        }
        _persist_prediction(result)
        return result
    finally:
        cleanup_temp_file(temp_path)


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


@router.post("/predict/{model_name}")
async def predict_generic(request: Request, model_name: str, file: Optional[UploadFile] = File(default=None)):
    return await _handle_prediction(request, model_name, file)
