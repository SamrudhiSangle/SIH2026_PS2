from __future__ import annotations

import time
from typing import Any, Dict, List

from app.core.logging import log_request_event
from app.services.reliability.reliability_engine import ReliabilityEngine


class InferenceService:
    def __init__(self, model_manager):
        self.model_manager = model_manager
        self.reliability = ReliabilityEngine()

    def predict(self, model_name: str, image_path: str, request_id: str) -> Dict[str, Any]:
        model = self.model_manager.get_model(model_name)
        log_request_event("model selected", request_id, model=model_name)

        start = time.perf_counter()
        log_request_event("inference started", request_id, model=model_name)
        raw_result = model.predict(image_path)
        processing_ms = int((time.perf_counter() - start) * 1000)

        result = {
            "request_id": request_id,
            "model": model_name,
            "model_version": getattr(model, "version", "1.0"),
            "model_status": getattr(model, "status", "READY"),
            "status": raw_result.get("status", "SUCCESS"),
            "processing_time_ms": processing_ms,
            "detections": raw_result.get("detections", []),
            "metadata": {},
            "message": raw_result.get("message"),
        }

        if model_name == "ghostvision":
            result["metadata"]["class_names"] = ["Crab-Pot"]
        elif model_name == "subpipe":
            result["metadata"]["class_names"] = ["Pipeline"]

        reliability = self.reliability.evaluate(raw_result, image_path)
        result["metadata"]["reliability"] = reliability

        log_request_event("inference completed", request_id, model=model_name, processing_ms=processing_ms, status=result["status"])
        return result
