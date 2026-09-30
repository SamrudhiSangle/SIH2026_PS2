# SIH26057 Side-Scan Sonar — Backend Integration Guide

This document defines the REST API contract, request/response formats, frontend field mappings, and configuration for integrating the FastAPI backend with the SONAROPS frontend.

---

## 1. Local Backend Connection & Environment

| Property | Value |
|---|---|
| **Local Base URL** | `http://127.0.0.1:8000` |
| **API Version Prefix** | `/api/v1` |
| **Swagger UI Documentation** | `http://127.0.0.1:8000/docs` |
| **ReDoc Documentation** | `http://127.0.0.1:8000/redoc` |

### CORS Configuration
The backend automatically allows cross-origin requests from standard Vite and React development ports:
- `http://localhost:5173` & `http://127.0.0.1:5173` (Vite dev server)
- `http://localhost:5174` & `http://127.0.0.1:5174` (Alternative Vite dev port)
- `http://localhost:4173` & `http://127.0.0.1:4173` (Vite preview server)
- `http://localhost:3000` & `http://127.0.0.1:3000` (React/Next dev server)

Configurable via `CORS_ORIGINS` in `backend/.env`.

---

## 2. Model Registry & Accepted Model Identifiers

The backend manages 5 verified trained models. Clients can request any individual model or any comma-separated combination.

| Model Key | Canonical Aliases | Architecture | Raw Class(es) | Frontend Semantic Label |
|---|---|---|---|---|
| `cylinder` | `cylinderdetector` | YOLO12s (1536px native) | `Cylinder` | `Industrial Cylinder / Drum` |
| `ghostvision` | `ghostgear`, `crabpot` | YOLO12s (640px native) | `Crab-Pot` | `Abandoned Fishing Gear (Crab Pot / Trap)` |
| `mines` | `mine`, `minedetector` | YOLO12s (640px native) | `MILCO`, `NOMBO` | `Mine-Like Contact (MILCO)`, `Non-Mine Mine-Like Bottom Object (NOMBO)` |
| `shipwreck` | `shipwreckdetector`, `wreck` | YOLO26n (640px native) | `Class_0`, `MILCO`, `NOMBO`, `Shipwreck` | `Class_0 (Unknown / Unlabeled)`, `Mine-Like Contact`, `Non-Mine Bottom Object`, `Maritime Shipwreck / Hull` |
| `subpipes` | `pipeline`, `subpipe`, `subpipemini2` | YOLO12s (640px native) | `Pipeline` | `Subsea Pipeline / Conduit` |

> **Known Limitation — Natural Seabed Model**: The Natural Seabed model is unavailable. Requesting `natural_seabed` returns HTTP 400 with a descriptive notification. The pipeline functions with all 5 available models.

---

## 3. API Endpoints

### 3.1. `POST /api/v1/analysis/analyze`
Executes end-to-end quality validation, model inference, detection normalization, database persistence, and evidence image storage.

#### Request Format (`multipart/form-data`)
| Parameter | Type | Required | Validation Range / Format | Description |
|---|---|---|---|---|
| `image` | Binary File | **Yes** | Image formats: `.png`, `.jpg`, `.jpeg`, `.tif`, `.tiff`, `.bmp`, `.webp` (<= 50MB) | Sonar image stream. |
| `selected_models` | Form String | No | Comma-separated or JSON list | Subset of verified models (`cylinder,ghostvision,mines,shipwreck,subpipes`). Defaults to all 5 verified models. |
| `latitude` | Float / String | No | `[-90.0, 90.0]` | WGS84 Survey Latitude in decimal degrees. Strictly `null` if no GPS exists. |
| `longitude` | Float / String | No | `[-180.0, 180.0]` | WGS84 Survey Longitude in decimal degrees. Strictly `null` if no GPS exists. |
| `depth` | Float / String | No | `>= 0.0` (non-negative numeric) | Sensor or seabed depth in meters. |
| `heading` | Float / String | No | `[0.0, 360.0)` | Towfish heading in decimal degrees. |
| `timestamp` | String | No | ISO-8601 (e.g. `2026-09-30T10:00:00Z` or `2026-09-30`) | Survey ping capture timestamp. |
| `confidence` | Float / String | No | `[0.0, 1.0]` | Detection confidence cutoff threshold. |
| `iou` | Float / String | No | `[0.0, 1.0]` | Non-Maximum Suppression (NMS) IoU threshold. |

#### Survey Geolocation vs Image-Space Detection Coordinates
The system maintains strict architectural separation between **real-world survey navigation** and **image-space anomaly detections**:
- **Survey Geolocation**: Captured via survey telemetry (`latitude`, `longitude`, `depth`, `heading`, `timestamp`). If either `latitude` or `longitude` is absent, `geolocation_available` is set to `false`, and no mock/fake coordinates are ever fabricated from image dimensions or bounding boxes.
- **Image-Space Detection Geometry**: Detections produced by the computer vision models exist strictly within the 2D pixel geometry of the acoustic swath (`bbox.x1`, `bbox.y1`, `bbox.x2`, `bbox.y2`, `bbox.width`, `bbox.height`, and normalized ratios).

#### Response Format (`application/json`)
```json
{
  "analysis_id": "SONAR-FE92B5445CF8",
  "status": "completed",
  "image": {
    "filename": "sonar_ping_01.jpg",
    "width": 1024,
    "height": 560,
    "channels": 3,
    "format": "JPEG",
    "size_bytes": 197533
  },
  "metadata": {
    "latitude": 18.9169,
    "longitude": 72.8365,
    "depth": 48.2,
    "heading": 85.0,
    "timestamp": "2026-09-30T10:00:00Z",
    "geolocation_available": true
  },
  "geolocation": {
    "latitude": 18.9169,
    "longitude": 72.8365,
    "depth_m": 48.2,
    "depth": 48.2,
    "heading": 85.0,
    "timestamp": "2026-09-30T10:00:00Z",
    "geolocation_available": true
  },
  "detections": [
    {
      "id": "DET-01",
      "code": "01",
      "model": "cylinder",
      "class_id": 0,
      "raw_class": "Cylinder",
      "display_class": "Cylinder",
      "className": "CYLINDER",
      "type": "Cylinder",
      "status": "PENDING REVIEW",
      "confidence": 0.0831,
      "confidence_percent": 8.3,
      "bbox": {
        "x1": 304.8,
        "y1": 325.62,
        "x2": 409.22,
        "y2": 463.79,
        "width": 104.42,
        "height": 138.17,
        "norm_x1": 0.2977,
        "norm_y1": 0.5815,
        "norm_w": 0.102,
        "norm_h": 0.2467,
        "x": 29.77,
        "y": 58.15,
        "w": 10.2,
        "h": 24.67
      },
      "geoLat": 18.9169,
      "geoLon": 72.8365,
      "latitude": 18.9169,
      "longitude": 72.8365,
      "coordinateReference": "WGS 84 / UTM ZONE 43N",
      "metadataSource": "Side-Scan Sonar Telemetry",
      "imagePosition": {
        "x": 29.77,
        "y": 58.15,
        "display": "X: 30%, Y: 58%"
      },
      "evidenceImage": "/api/v1/analysis/SONAR-FE92B5445CF8/evidence"
    }
  ],
  "summary": {
    "total_detections": 1,
    "objects_by_type": {
      "Cylinder": 1
    },
    "highest_confidence": 0.0831,
    "average_confidence": 0.0831,
    "models_executed": [
      "cylinder"
    ],
    "execution_time_ms": 6709.0
  },
  "evidence_url": "/api/v1/analysis/SONAR-FE92B5445CF8/evidence"
}
```

*When metadata is absent (e.g. image-only upload):*
```json
"metadata": {
  "latitude": null,
  "longitude": null,
  "depth": null,
  "heading": null,
  "timestamp": null,
  "geolocation_available": false
}
```

---

---

### 3.2. `GET /api/v1/analysis`
Returns a paginated list of previous sonar survey analyses with optional status and detection class filtering.

#### Request Query Parameters
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `page` | Integer | No | `1` | Page number (1-indexed, `>= 1`). |
| `page_size` | Integer | No | `20` | Items per page (`1` to `100`). |
| `status` | String | No | `None` | Filter by analysis execution status (e.g. `completed`, `failed`). |
| `detection_type` | String | No | `None` | Filter by detected anomaly class (e.g. `Cylinder`, `Ghost Gear`, `Shipwreck`). |

#### Response Format (`HTTP 200 OK`)
```json
{
  "total": 1,
  "page": 1,
  "page_size": 20,
  "total_pages": 1,
  "items": [
    {
      "analysis_id": "SONAR-FE92B5445CF8",
      "status": "completed",
      "created_at": "2026-09-30T02:00:00Z",
      "image": {
        "filename": "sonar_ping_01.jpg",
        "width": 1024,
        "height": 560,
        "channels": 3,
        "format": "JPEG",
        "size_bytes": 197533
      },
      "metadata": {
        "latitude": 18.9169,
        "longitude": 72.8365,
        "depth": 48.2,
        "heading": 85.0,
        "timestamp": "2026-09-30T10:00:00Z",
        "geolocation_available": true
      },
      "geolocation": {
        "latitude": 18.9169,
        "longitude": 72.8365,
        "depth_m": 48.2,
        "depth": 48.2,
        "heading": 85.0,
        "timestamp": "2026-09-30T10:00:00Z",
        "geolocation_available": true
      },
      "detections": [
        {
          "id": "DET-01",
          "code": "01",
          "model": "cylinder",
          "class_id": 0,
          "raw_class": "Cylinder",
          "display_class": "Cylinder",
          "category": "Cylinder",
          "className": "CYLINDER",
          "type": "Cylinder",
          "status": "PENDING REVIEW",
          "confidence": 0.0831,
          "confidence_percent": 8.3,
          "bbox": {
            "x1": 304.8,
            "y1": 325.62,
            "x2": 409.22,
            "y2": 463.79,
            "width": 104.42,
            "height": 138.17,
            "norm_x1": 0.2977,
            "norm_y1": 0.5815,
            "norm_w": 0.102,
            "norm_h": 0.2467,
            "x": 29.77,
            "y": 58.15,
            "w": 10.2,
            "h": 24.67
          },
          "geoLat": 18.9169,
          "geoLon": 72.8365,
          "latitude": 18.9169,
          "longitude": 72.8365,
          "coordinateReference": "WGS 84 / UTM ZONE 43N",
          "metadataSource": "Side-Scan Sonar Telemetry",
          "imagePosition": {
            "x": 29.77,
            "y": 58.15,
            "display": "X: 30%, Y: 58%"
          },
          "evidenceImage": "/api/v1/analysis/SONAR-FE92B5445CF8/evidence"
        }
      ],
      "summary": {
        "total_detections": 1,
        "objects_by_type": { "Cylinder": 1 },
        "highest_confidence": 0.0831,
        "average_confidence": 0.0831,
        "models_executed": ["cylinder"],
        "execution_time_ms": 6709.0
      },
      "evidence": {
        "original_filename": "sonar_ping_01.jpg",
        "content_type": "image/jpeg",
        "size_bytes": 197533,
        "storage_path": "evidence/SONAR-FE92B5445CF8/sonar_ping_01.jpg",
        "access_url": "/api/v1/analysis/SONAR-FE92B5445CF8/evidence",
        "created_at": "2026-09-30T02:00:00Z"
      },
      "evidence_url": "/api/v1/analysis/SONAR-FE92B5445CF8/evidence"
    }
  ]
}
```

---

### 3.3. `GET /api/v1/analysis/{analysis_id}`
Returns complete details of a single persisted analysis session by its unique analysis ID.

#### Request Path Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `analysis_id` | String | **Yes** | Analysis session UUID (e.g. `SONAR-FE92B5445CF8`). |

#### Response Codes
- `HTTP 200 OK`: Analysis found and returned with all detections, summary, survey metadata, and evidence storage information.
- `HTTP 404 Not Found`: If `analysis_id` does not exist (`{"detail": "Analysis with ID '...' not found."}`).

---

### 3.4. `GET /api/v1/analysis/{analysis_id}/evidence`
Streams the raw original sonar evidence image associated with an analysis session without exposing internal credentials or storage paths.

#### Request Path Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `analysis_id` | String | **Yes** | Analysis session UUID. |

#### Response Codes & Headers
- `HTTP 200 OK`: Binary image data streamed with headers:
  - `Content-Type`: `image/png`, `image/jpeg`, etc.
  - `Content-Disposition`: `inline; filename="<original_filename>"`
- `HTTP 404 Not Found`: Evidence file or analysis record not found.

---

### 3.5. `GET /api/v1/models`
Returns metadata, input resolutions, availability statuses, and semantic class mappings for all models.

#### Request
No request parameters.

#### Response Format (`HTTP 200 OK`)
```json
{
  "models": [
    {
      "id": "cylinder",
      "name": "Cylinder Anomaly Detector",
      "display_name": "Cylinder Anomaly Detector",
      "architecture": "YOLO12s",
      "input_resolution": [1536, 1536],
      "task": "detect",
      "status": "available",
      "class_mappings": [
        {
          "class_id": 0,
          "raw_class_name": "Cylinder",
          "display_name": "Industrial Cylinder / Drum"
        }
      ],
      "notes": "Trained at native 1536x1536 resolution for metallic cylindrical hazard detection."
    },
    {
      "id": "ghostvision",
      "name": "GhostVision Gear Detector",
      "display_name": "GhostVision Gear Detector",
      "architecture": "YOLO12s",
      "input_resolution": [640, 640],
      "task": "detect",
      "status": "available",
      "class_mappings": [
        {
          "class_id": 0,
          "raw_class_name": "Crab-Pot",
          "display_name": "Abandoned Fishing Gear (Crab Pot / Trap)"
        }
      ],
      "notes": "Specialized in detecting acoustic acoustic signatures of derelict traps and ghost nets."
    },
    {
      "id": "mines",
      "name": "Mine / MILCO Detector",
      "display_name": "Mine / MILCO Detector",
      "architecture": "YOLO12s",
      "input_resolution": [640, 640],
      "task": "detect",
      "status": "available",
      "class_mappings": [
        {
          "class_id": 0,
          "raw_class_name": "MILCO",
          "display_name": "Mine-Like Contact (MILCO)"
        },
        {
          "class_id": 1,
          "raw_class_name": "NOMBO",
          "display_name": "Non-Mine Mine-Like Bottom Object (NOMBO)"
        }
      ],
      "notes": "Identifies naval ordnance targets and non-mine seabed obstacles."
    },
    {
      "id": "shipwreck",
      "name": "Shipwreck Hull Detector",
      "display_name": "Shipwreck Hull Detector",
      "architecture": "YOLO26n",
      "input_resolution": [640, 640],
      "task": "detect",
      "status": "available",
      "class_mappings": [
        {
          "class_id": 0,
          "raw_class_name": "Class_0",
          "display_name": "Class_0 (Unknown / Unlabeled)"
        },
        {
          "class_id": 1,
          "raw_class_name": "MILCO",
          "display_name": "Mine-Like Contact"
        },
        {
          "class_id": 2,
          "raw_class_name": "NOMBO",
          "display_name": "Non-Mine Bottom Object"
        },
        {
          "class_id": 3,
          "raw_class_name": "Shipwreck",
          "display_name": "Maritime Shipwreck / Hull"
        }
      ],
      "notes": "Detects structural anomalies and historical wreckage."
    },
    {
      "id": "subpipes",
      "name": "Subsea Pipeline Detector",
      "display_name": "Subsea Pipeline Detector",
      "architecture": "YOLO12s",
      "input_resolution": [640, 640],
      "task": "detect",
      "status": "available",
      "class_mappings": [
        {
          "class_id": 0,
          "raw_class_name": "Pipeline",
          "display_name": "Subsea Pipeline / Conduit"
        }
      ],
      "notes": "Detects exposed offshore oil/gas pipelines and infrastructure conduits."
    }
  ],
  "total": 5,
  "unavailable_models": [
    "natural_seabed"
  ]
}
```

---

### 3.6. `GET /api/v1/health`
Lightweight health check probe reporting backend operational status and individual model readiness.

#### Response Format (`HTTP 200 OK`)
```json
{
  "status": "ok",
  "service": "sonar-backend",
  "models": {
    "cylinder": "available",
    "ghostvision": "available",
    "mine": "available",
    "shipwreck": "available",
    "subpipe": "available",
    "natural_seabed": "unavailable"
  }
}
```

---

### 3.7. `DELETE /api/v1/analysis/{analysis_id}`
Permanently deletes an analysis session, cascades deletion of detections and evidence records, and removes the evidence image file from disk.

#### Response Format (`HTTP 200 OK`)
```json
{
  "status": "deleted",
  "analysis_id": "SONAR-FE92B5445CF8",
  "message": "Analysis 'SONAR-FE92B5445CF8' and associated evidence removed successfully."
}
```

---

## 4. Frontend-to-Backend Field Mapping

The backend directly provides the attributes expected by frontend views (`DetectionsView`, `WorkspaceView`, `ReportView`):

| Frontend Field (`DetectionsView` / `WorkspaceView`) | Backend Field (`AnalysisDetection` / `bbox`) | Description / Format |
|---|---|---|
| `det.id` | `det.id` | Unique identifier (e.g. `"DET-01"`) |
| `det.code` | `det.code` | Number string code (e.g. `"01"`) |
| `det.className` / `det.class` | `det.className` | Uppercase display class (`"CYLINDER"`, `"GHOST GEAR"`) |
| `det.display_class` | `det.display_class` | Normalized title case (`"Cylinder"`, `"Ghost Gear"`) |
| `det.type` | `det.type` | Anomaly semantic category |
| `det.confidence` | `det.confidence` | Float score `[0.0 - 1.0]` |
| `det.confidence` (display %) | `det.confidence_percent` | Percentage score `[0.0 - 100.0]` |
| `det.status` | `det.status` | Initial status `"PENDING REVIEW"` |
| `det.box.x` (`left: ${det.box.x}%`) | `det.bbox.x` | Percentage X `[0 - 100%]` |
| `det.box.y` (`top: ${det.box.y}%`) | `det.bbox.y` | Percentage Y `[0 - 100%]` |
| `det.box.w` (`width: ${det.box.w}%`) | `det.bbox.w` | Percentage width `[0 - 100%]` |
| `det.box.h` (`height: ${det.box.h}%`) | `det.bbox.h` | Percentage height `[0 - 100%]` |
| `det.geoLat` / `det.latitude` | `det.geoLat` / `det.latitude` | Decimal latitude (or `null` if no telemetry) |
| `det.geoLon` / `det.longitude` | `det.geoLon` / `det.longitude` | Decimal longitude (or `null` if no telemetry) |
| `det.coordinateReference` | `det.coordinateReference` | CRS (e.g. `"WGS 84 / UTM ZONE 43N"` or `"UNAVAILABLE"`) |
| `det.imagePosition` | `det.imagePosition` | Formatted coordinate object (`{"x": 29.8, "y": 58.2, "display": "X: 30%, Y: 58%"}`) |
| `det.evidenceImage` | `det.evidenceImage` | Relative URL (`/api/v1/analysis/{analysis_id}/evidence`) |
| `summary.totalDetections` | `summary.total_detections` | Total count of anomalies |
| `summary.models_executed` | `summary.models_executed` | List of models executed |
| `summary.execution_time_ms`| `summary.execution_time_ms`| Total processing duration in milliseconds |
| `evidence_url` | `evidence_url` | Relative endpoint to fetch the stored evidence image |

---

## 5. Input Validation & Sonar Image Gate

To prevent wasted GPU/CPU resources on accidental non-sonar uploads (e.g. photos, selfies, screenshots, documents), the backend implements a dedicated validation gate in `app.services.sonar_image_validator.sonar_validator`.

### 5.1. Validation Pipeline Flow

```
Upload Stream (POST /api/v1/analysis/analyze)
     │
     ▼
[ 1. Basic Content & Safety Validation ]
   • Payload size check (<= 50 MB)
   • Allowed file extensions: .png, .jpg, .jpeg, .tif, .tiff, .bmp, .webp
   • MIME content-type validation (image/png, image/jpeg, image/tiff, image/bmp, image/webp)
   • PIL header verification & decompression bomb protection (<= 100 MP)
   • Safe in-memory OpenCV decoding
     │
     ├─── Corrupted/Empty/Oversized ──► HTTP 400 Bad Request
     ├─── Unsupported Extension/MIME ──► HTTP 415 Unsupported Media Type
     │
     ▼ (Pass)
[ 2. Sonar-Likeness Heuristic Gate ]
   • Aspect ratio boundary: max(w/h, h/w) <= 30.0
   • Blank canvas rejection: mean_lum > 248 and std_lum < 2.0
   • Document canvas rejection: scanned white pages / text sheets (> 80% near-white pixels)
   • Solid black canvas rejection: mean_lum < 1.0 and std_lum < 1.0
   • Acoustic palette evaluation:
       - Grayscale / near-monochrome (color_diff < 18.0) -> ACCEPT (raw acoustic backscatter)
       - Low saturation (sat < 35) -> ACCEPT (deep water acoustic return)
       - Colormapped sonar (copper, amber, cyan/blue waterfall):
           • Computes circular directional variance of hue across colored pixels
           • If circular variance > 0.35 and color_diff > 20.0 -> REJECT (polychromatic natural photograph)
           • If circular variance <= 0.35 -> ACCEPT (single acoustic palette colormap)
     │
     ├─── Clearly Non-Sonar ──► HTTP 422 Unprocessable Entity
     │
     ▼ Valid Sonar (even with 0 detections)
[ 3. Multi-Model AI Inference ]
     │
     ▼
[ 4. Normalization & Persistence ]
     │
     ▼
[ 5. HTTP 200 AnalysisResponse ]
```

### 5.2. Rejection Response Format (`HTTP 422 Unprocessable Entity`)

When a clearly non-sonar image (natural photo, selfie, document, screenshot) is uploaded, the API terminates immediately before running model inference and returns a clean, frontend-friendly JSON payload:

```json
{
  "error": "INVALID_SONAR_IMAGE",
  "message": "The uploaded image does not appear to be a valid Side-Scan Sonar image.",
  "details": "Please upload a valid Side-Scan Sonar survey image."
}
```

Internal model errors and stack traces are strictly hidden from the operator.

### 5.3. Other Input Validation Error Codes

| Status Code | Condition | Example Response |
|---|---|---|
| `HTTP 400 Bad Request` | Corrupted image stream, empty file, payload > 50 MB, or decompression bomb | `{"detail": "Corrupted or invalid image stream: ..."}` |
| `HTTP 415 Unsupported Media Type` | File extension or MIME type not in allowed list | `{"detail": "Unsupported file format '.pdf'. Allowed formats: ..."}` |
| `HTTP 422 Unprocessable Entity` | Valid image but fails acoustic sonar-likeness evaluation | `{"error": "INVALID_SONAR_IMAGE", "message": "...", "details": "..."}` |

### 5.4. Important Conservative Heuristic Properties

1. **Zero Detections Accepted**: A genuine Side-Scan Sonar image containing only empty seabed or smooth water with no anomaly detections is **legitimately accepted** (`HTTP 200`, `total_detections: 0`). Detections count is never used to judge sonar validity.
2. **Conservative Heuristic Gate**: This is an acoustic visual and spectral heuristic gate designed to catch obvious non-sonar uploads. It is **not a mathematically guaranteed sonar classifier**, but rather a conservative barrier that protects inference pipelines from processing obvious non-sonar imagery (consumer photos, web screenshots, scanned documents) while ensuring genuine acoustic swaths across diverse palettes (monochrome, amber, copper, bronze, ocean cyan) pass reliably.

