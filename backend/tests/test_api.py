import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from PIL import Image
from sqlalchemy import text

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_sih.db")

from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


def create_test_image(path: Path, size: int = 640):
    image = Image.new("RGB", (size, size), color=(10, 20, 30))
    for x in range(150, 350):
        for y in range(150, 350):
            image.putpixel((x, y), (130, 130, 130))
    image.save(path)
    return path


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_get_models(client):
    response = client.get("/api/models")
    assert response.status_code == 200
    payload = response.json()
    assert "models" in payload
    names = {item["name"] for item in payload["models"]}
    assert {"ghostvision", "subpipe", "shipwreck"}.issubset(names)


def test_ghostvision_model_availability():
    from app.main import app

    manager = app.state.model_manager
    model = manager.get_model("ghostvision")
    assert model is not None
    assert model.name == "ghostvision"
    assert model.status in {"READY", "ERROR"}


def test_subpipe_model_availability():
    from app.main import app

    manager = app.state.model_manager
    model = manager.get_model("subpipe")
    assert model is not None
    assert model.name == "subpipe"
    assert model.status in {"READY", "ERROR"}


def test_shipwreck_mock_response(client):
    response = client.post("/api/predict/shipwreck", files={"file": ("sample.png", b"not really an image", "image/png")})
    assert response.status_code == 200
    body = response.json()
    assert body["model"] == "shipwreck"
    assert body["model_status"] == "MOCK"
    assert body["detections"] == []


def test_invalid_model(client):
    response = client.post("/api/predict/unknown_model")
    assert response.status_code == 404


def test_invalid_file(client):
    response = client.post(
        "/api/predict/ghostvision",
        files={"file": ("bad.txt", b"hello world", "text/plain")},
    )
    assert response.status_code == 400


def test_standard_prediction_response(client):
    image_path = Path("test_image_predict.png")
    create_test_image(image_path)
    with image_path.open("rb") as fh:
        response = client.post(
            "/api/predict/ghostvision",
            files={"file": ("ghostvision_test.png", fh.read(), "image/png")},
        )
    assert response.status_code == 200
    body = response.json()
    assert body["model"] == "ghostvision"
    assert body["status"] == "SUCCESS"
    assert "detections" in body
    assert "request_id" in body
    image_path.unlink(missing_ok=True)


def test_database_persistence(client):
    image_path = Path("test_db_predict.png")
    create_test_image(image_path)
    with image_path.open("rb") as fh:
        response = client.post(
            "/api/predict/subpipe",
            files={"file": ("subpipe_test.png", fh.read(), "image/png")},
        )
    assert response.status_code == 200
    result = response.json()
    request_id = result["request_id"]

    from app.database import get_db_session

    with get_db_session() as db:
        prediction = db.execute(
            text("SELECT COUNT(*) FROM predictions WHERE request_id = :request_id"),
            {"request_id": request_id},
        ).scalar_one()
        assert prediction == 1

    image_path.unlink(missing_ok=True)


def test_review_status_update(client):
    from app.database import get_db_session
    from app.database.models import Detection, Prediction

    with get_db_session() as db:
        prediction = Prediction(
            request_id="review-test-request",
            model_name="ghostvision",
            model_version="1.0",
            status="SUCCESS",
            processing_time_ms=1,
            input_filename="review_test.png",
            result_json='{}',
        )
        db.add(prediction)
        db.flush()

        detection = Detection(
            prediction_id=prediction.id,
            class_name="Crab-Pot",
            confidence=0.94,
            x1=10,
            y1=20,
            x2=30,
            y2=40,
            review_status="pending",
        )
        db.add(detection)
        db.commit()
        detection_id = detection.id

        response = client.patch(f"/api/reviews/{detection_id}", json={"review_status": "confirmed"})
        assert response.status_code == 200
        assert response.json()["review_status"] == "confirmed"
