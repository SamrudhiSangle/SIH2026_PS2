from fastapi import APIRouter, HTTPException

from app.database.database import SessionLocal
from app.database.repository import PredictionRepository
from app.schemas.review import ReviewStatusUpdate

router = APIRouter(prefix="/api")


@router.get("/reviews")
async def list_reviews():
    db = SessionLocal()
    try:
        repo = PredictionRepository(db)
        rows = repo.list_reviews()
        return [
            {
                "id": row.id,
                "prediction_id": row.prediction_id,
                "class_name": row.class_name,
                "confidence": row.confidence,
                "review_status": row.review_status,
                "latitude": row.latitude,
                "longitude": row.longitude,
            }
            for row in rows
        ]
    finally:
        db.close()


@router.patch("/reviews/{detection_id}")
async def update_review(detection_id: int, payload: ReviewStatusUpdate):
    db = SessionLocal()
    try:
        repo = PredictionRepository(db)
        row = repo.update_review_status(detection_id, payload.review_status)
        if row is None:
            raise HTTPException(status_code=404, detail="Review record not found")
        return {
            "id": row.id,
            "prediction_id": row.prediction_id,
            "class_name": row.class_name,
            "confidence": row.confidence,
            "review_status": row.review_status,
            "latitude": row.latitude,
            "longitude": row.longitude,
        }
    finally:
        db.close()
