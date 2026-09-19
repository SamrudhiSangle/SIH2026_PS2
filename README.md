# SIH 26057 - Backend for Intelligent Marine Object Detection

This repository contains the backend implementation for the SIH 26057 project. The project is built around a FastAPI service that accepts uploaded images, runs AI-based object detection models, stores prediction records, and supports review/status tracking for predictions and detections.

## Project status

The backend has been implemented and validated successfully. The application is running as a FastAPI service with health checks, model management, prediction APIs, database persistence, and review endpoints.

The project has also been pushed to GitHub:

- https://github.com/SamrudhiSangle/SIH2026_PS2.git

## What has been completed

### 1. Backend architecture

- Created a clean FastAPI backend structure under `backend/app`
- Configured application settings using environment-based configuration
- Added centralized logging and request tracking
- Implemented startup lifecycle to load all registered models at boot
- Added CORS support and middleware for request logging

### 2. AI model integration

The project preserves and loads validated model artifacts without modifying the trained files:

- `backend/generated_models/GhostVision_YOLO12s_best.pt`
- `backend/generated_models/SubPipeMini2_YOLO12s_best.pt`

A model manager layer was created to register and manage model instances. The models are wrapped in a reusable base abstraction and expose a common inference interface.

Implemented model adapters:

- `GhostVisionModel` for GhostVision YOLO detection
- `SubPipeModel` for SubPipeMini2 YOLO detection
- `ShipwreckModel` as a mock placeholder because no actual shipwreck model artifact is available yet

### 3. Prediction API

The backend exposes prediction endpoints for image uploads:

- `POST /api/predict/ghostvision`
- `POST /api/predict/subpipe`
- `POST /api/predict/shipwreck`
- `POST /api/predict/{model_name}` (generic model route)

These endpoints:

- validate the uploaded file
- save temporary files
- run the relevant model
- collect detection results
- store prediction metadata in the database
- clean up temporary uploaded data

### 4. Database and persistence

A SQLite database layer was implemented with SQLAlchemy.

The persistence layer includes:

- `Prediction` table for request-level metadata
- `Detection` table for per-object detection records
- repository methods for saving and retrieving prediction results

The database records include:

- request ID
- model name and version
- status
- processing time
- filename
- raw JSON result payload
- detection-level review status

### 5. Review system

The project includes review endpoints to update detection status dynamically:

- `GET /api/reviews`
- `GET /api/reviews/{detection_id}`
- `PATCH /api/reviews/{detection_id}`

This allows review operations such as:

- pending
- confirmed
- rejected
- flagged

### 6. Health and status endpoints

The backend includes:

- `GET /health`
- `GET /api/models`
- `GET /` (root endpoint)

These endpoints verify the service health and list available models.

### 7. Testing and verification

The project includes automated tests covering core behavior:

- health checks
- model listing
- invalid model handling
- invalid file handling
- prediction processing flow
- database persistence validation
- review patching logic

The tests were executed successfully using pytest and passed.

## Project structure

```text
Samu SIH/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health.py
│   │   │   ├── models.py
│   │   │   ├── predictions.py
│   │   │   └── reviews.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── logging.py
│   │   ├── database/
│   │   │   ├── database.py
│   │   │   ├── models.py
│   │   │   └── repository.py
│   │   ├── models/
│   │   │   ├── base_model.py
│   │   │   ├── ghostvision_model.py
│   │   │   ├── model_manager.py
│   │   │   ├── shipwreck_model.py
│   │   │   └── subpipe_model.py
│   │   ├── services/
│   │   │   ├── file_service.py
│   │   │   ├── inference_service.py
│   │   │   └── reliability/
│   │   ├── main.py
│   │   └── __init__.py
│   ├── generated_models/
│   │   ├── GhostVision_YOLO12s_best.pt
│   │   └── SubPipeMini2_YOLO12s_best.pt
│   ├── scripts/
│   ├── tests/
│   ├── requirements.txt
│   ├── run.py
│   ├── .env
│   ├── .env.example
│   └── sih.db
├── GhostVision_YOLO12s_best.pt/
├── SubPipeMini2_YOLO12s_best.pt.pt/
├── .git/
├── .gitignore
├── README.md
└── .github/ (if applicable in future)
```

## Technologies used

- Python
- FastAPI
- Uvicorn
- Pydantic
- SQLAlchemy
- SQLite
- Ultralytics
- PyTorch
- Pillow
- OpenCV
- pytest

## How to run the backend

From the project root:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

Or directly:

```bash
cd backend
.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Then open:

- http://127.0.0.1:8000/docs
- http://127.0.0.1:8000/redoc

## Important implementation notes

- The trained model assets were treated as validated artifacts and preserved intact.
- The project does not recreate or overwrite the original model files.
- `ShipwreckModel` is currently a mock implementation because no real shipwreck detection model exists in the repo yet.
- The backend is structured so that a real shipwreck model can be plugged in later without changing the API contracts.

## Summary

This project has progressed from a basic repo state to a working backend service with:

- model registration and loading
- image-based inference endpoints
- DB-backed prediction persistence
- review tracking
- API-level validation
- automated tests
- GitHub publication

This marks a functional backend foundation for the SIH marine/underwater detection system.
