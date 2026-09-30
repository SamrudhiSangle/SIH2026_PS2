"""Unit tests for Inference Service and Normalized Result Format."""

import numpy as np
import pytest
from PIL import Image
from app.schemas.inference import BoundingBox, DetectionResult, InferenceResponse
from app.services.inference import inference_service


def test_predict_ghostvision_structure():
    """Verify predict returns a strictly compliant InferenceResponse structure."""
    dummy_img = np.zeros((640, 640, 3), dtype=np.uint8)
    response = inference_service.predict("ghostvision", dummy_img)

    assert isinstance(response, InferenceResponse)
    assert response.model_name == "ghostvision"
    assert response.model_architecture == "YOLO12s"
    assert response.image_width == 640
    assert response.image_height == 640
    assert isinstance(response.detections, list)
    assert response.detections_count == len(response.detections)
    assert response.inference_time_ms > 0.0


def test_predict_cylinder_resolution():
    """Verify Cylinder prediction handles native 1536x1536 resolution."""
    dummy_img = np.zeros((1536, 1536, 3), dtype=np.uint8)
    response = inference_service.predict("cylinder", dummy_img)

    assert isinstance(response, InferenceResponse)
    assert response.model_name == "cylinder"
    assert response.model_architecture == "YOLO12s"
    assert response.image_width == 1536
    assert response.image_height == 1536


def test_predict_with_pil_image():
    """Verify predict accepts PIL Image instances."""
    pil_img = Image.new("RGB", (640, 640), color=(30, 45, 60))
    response = inference_service.predict("subpipes", pil_img)

    assert isinstance(response, InferenceResponse)
    assert response.model_name == "subpipes"
    assert response.image_width == 640
    assert response.image_height == 640


def test_normalized_bounding_box_logic():
    """Verify BoundingBox schema enforces correct pixel and normalized dimensions."""
    bbox = BoundingBox(
        x1=100.0,
        y1=150.0,
        x2=200.0,
        y2=250.0,
        width=100.0,
        height=100.0,
        norm_x1=0.156,
        norm_y1=0.234,
        norm_w=0.156,
        norm_h=0.156,
    )
    assert bbox.width == 100.0
    assert bbox.height == 100.0
    assert 0.0 <= bbox.norm_x1 <= 1.0
    assert 0.0 <= bbox.norm_w <= 1.0


def test_detection_result_raw_and_semantic_preservation():
    """Verify DetectionResult preserves both raw class name and semantic display label."""
    bbox = BoundingBox(
        x1=50.0, y1=50.0, x2=150.0, y2=150.0, width=100.0, height=100.0,
        norm_x1=0.08, norm_y1=0.08, norm_w=0.16, norm_h=0.16
    )
    det = DetectionResult(
        model_name="mines",
        class_id=0,
        raw_class_name="MILCO",
        semantic_class_name="Mine-Like Contact (MILCO)",
        confidence=0.88,
        bounding_box=bbox,
        image_width=640,
        image_height=640,
    )
    assert det.raw_class_name == "MILCO"
    assert "Mine-Like Contact" in det.semantic_class_name
