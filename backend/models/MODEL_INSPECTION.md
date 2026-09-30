# Model Inspection

This document details the in-depth inspection of all trained model artifacts located in `backend/models/`, extracted directly from the serialized PyTorch checkpoints (`data.pkl` and model configuration headers) without modifying any model files or guessing parameters.

---

## Model 1: Cylinder Model
- **Path**: `backend/models/Cylinder model/best/` (contains `data.pkl`, `version`, `byteorder`, `.format_version`, `data/`)
- **Format**: Unpacked PyTorch ZIP Archive / Checkpoint Directory (TorchScript/PyTorch serialization format v3)
- **Framework**: PyTorch / Ultralytics (version `8.4.164`)
- **Architecture**: YOLO12s (`yolov12s.yaml`, scale: `s`, backbone: `Conv`, `C3k2`, `A2C2f`)
- **Task**: Object Detection (`detect`, `ultralytics.nn.tasks.DetectionModel`)
- **Input Size**: `1536 × 1536` (`train_args.imgsz: 1536`)
- **Classes**: 1
- **Class Mapping**: `{0: 'Cylinder'}`
- **Confidence / NMS Settings**:
  - `train_args.conf`: `None` (not pinned; runtime default 0.25 applies)
  - `train_args.iou`: `0.7`
  - `train_args.max_det`: `300`
  - `train_args.agnostic_nms`: `False`
- **Directly Loadable by Ultralytics**: NO (Ultralytics expects a single `.pt` file; folder contains unpacked `best/` tree)
- **Load Status**: Not loadable with current environment
- **Dependencies**: Missing `torch`, `torchvision`, `ultralytics>=8.4.0`
- **Issues Preventing Inference**:
  1. Missing PyTorch and Ultralytics dependencies in backend environment.
  2. Unpacked directory structure requires packaging into `.pt` archive or custom checkpoint loading.
  3. Directory name contains spaces (`Cylinder model`).
  4. Non-standard input resolution (`1536px` vs standard `640px`) requiring custom tile handling.
- **Notes**:
  - Training metadata: batch size 2, 30 epochs, dataset path `/content/Cylinder2_YOLO/dataset.yaml`, timestamp `2026-09-28T15:37:28 UTC`.
  - Total directory size: 19,082,358 bytes (~18.20 MB).

---

## Model 2: GhostVision
- **Path**: `backend/models/GhostVision_YOLO12s_best.pt/best/` (contains `data.pkl`, `version`, `byteorder`, `.format_version`, `data/`)
- **Format**: Unpacked PyTorch ZIP Archive / Checkpoint Directory (TorchScript/PyTorch serialization format v3)
- **Framework**: PyTorch / Ultralytics (version `8.4.152`)
- **Architecture**: YOLO12s (`yolov12s.yaml`, scale: `s`, backbone: `Conv`, `C3k2`, `A2C2f`)
- **Task**: Object Detection (`detect`, `ultralytics.nn.tasks.DetectionModel`)
- **Input Size**: `640 × 640` (`train_args.imgsz: 640`)
- **Classes**: 1
- **Class Mapping**: `{0: 'Crab-Pot'}`
- **Confidence / NMS Settings**:
  - `train_args.conf`: `None` (not pinned; runtime default 0.25 applies)
  - `train_args.iou`: `0.7`
  - `train_args.max_det`: `300`
  - `train_args.agnostic_nms`: `False`
- **Directly Loadable by Ultralytics**: NO (Ultralytics expects a single `.pt` file; directory name ends in `.pt` but contains an unpacked `best/` tree)
- **Load Status**: Not loadable with current environment
- **Dependencies**: Missing `torch`, `torchvision`, `ultralytics>=8.4.0`
- **Issues Preventing Inference**:
  1. Missing PyTorch and Ultralytics dependencies in backend environment.
  2. Unpacked directory structure requires packaging into `.pt` archive or custom checkpoint loading.
  3. Class name `'Crab-Pot'` represents ghost gear / traps and requires semantic normalization to project terms.
- **Notes**:
  - Training metadata: batch size 16, 50 epochs, dataset path `/content/ghostvision_finetune/dataset.yaml`, timestamp `2026-09-14T21:00:59 UTC`.
  - Total directory size: 18,837,867 bytes (~17.97 MB).

---

## Model 3: Mine Detector
- **Path**: `backend/models/Mine_YOLO12s_best.pt/best/` (contains `data.pkl`, `version`, `byteorder`, `.format_version`, `data/`)
- **Format**: Unpacked PyTorch ZIP Archive / Checkpoint Directory (TorchScript/PyTorch serialization format v3)
- **Framework**: PyTorch / Ultralytics (version `8.3.189`)
- **Architecture**: YOLO12s (`yolov12s.yaml`, scale: `s`, backbone: `Conv`, `C3k2`, `A2C2f`)
- **Task**: Object Detection (`detect`, `ultralytics.nn.tasks.DetectionModel`)
- **Input Size**: `640 × 640` (`train_args.imgsz: 640`)
- **Classes**: 2
- **Class Mapping**: `{0: 'MILCO', 1: 'NOMBO'}`
- **Confidence / NMS Settings**:
  - `train_args.conf`: `None` (not pinned; runtime default 0.25 applies)
  - `train_args.iou`: `0.7`
  - `train_args.max_det`: `300`
  - `train_args.agnostic_nms`: `False`
- **Directly Loadable by Ultralytics**: NO (Ultralytics expects a single `.pt` file; directory name ends in `.pt` but contains an unpacked `best/` tree)
- **Load Status**: Not loadable with current environment
- **Dependencies**: Missing `torch`, `torchvision`, `ultralytics>=8.3.0`
- **Issues Preventing Inference**:
  1. Missing PyTorch and Ultralytics dependencies in backend environment.
  2. Unpacked directory structure requires packaging into `.pt` archive or custom checkpoint loading.
- **Notes**:
  - Classes reflect standard naval mine warfare terminology:
    - **`MILCO`**: Mine-Like Contact (high-confidence target requiring immediate inspection).
    - **`NOMBO`**: Non-Mine Mine-Like Bottom Object (acoustic anomaly mimicking a mine but non-hazardous).
  - Training metadata: batch size 1, 25 epochs, dataset path `C:\Users\HIMU\Downloads\sss-mines.v1i.yolov12\data.yaml`, timestamp `2026-09-29T00:25:16 UTC`.
  - Total directory size: 18,836,421 bytes (~17.96 MB).

---

## Model 4: Shipwreck Detector
- **Path**: `backend/models/shipwreak model/best/` (contains `data.pkl`, `version`, `byteorder`, `.format_version`, `data/`)
- **Format**: Unpacked PyTorch ZIP Archive / Checkpoint Directory (TorchScript/PyTorch serialization format v3)
- **Framework**: PyTorch / Ultralytics (version `8.4.163`)
- **Architecture**: YOLO26n (`yolo26n.yaml`, scale: `n`, end-to-end NMS-free nano architecture with `SPPF` and `C2PSA`)
- **Task**: Object Detection (`detect`, `ultralytics.nn.tasks.DetectionModel`)
- **Input Size**: `640 × 640` (`train_args.imgsz: 640`)
- **Classes**: 4
- **Class Mapping**: `{0: 'Class_0', 1: 'MILCO', 2: 'NOMBO', 3: 'Shipwreck'}`
- **Confidence / NMS Settings**:
  - `train_args.conf`: `None` (runtime default 0.25 applies)
  - `train_args.iou`: `0.7`
  - `train_args.max_det`: `300`
  - `train_args.agnostic_nms`: `False`
  - `model.yaml`: `end2end: True`, `reg_max: 1` (NMS-free end-to-end architecture)
- **Directly Loadable by Ultralytics**: NO (Ultralytics expects a single `.pt` file; folder contains unpacked `best/` tree)
- **Load Status**: Not loadable with current environment
- **Dependencies**: Missing `torch`, `torchvision`, `ultralytics>=8.4.0`
- **Issues Preventing Inference**:
  1. Missing PyTorch and Ultralytics dependencies in backend environment.
  2. Unpacked directory structure requires packaging into `.pt` archive or custom checkpoint loading.
  3. Directory name has a spelling typo (`shipwreak model`) and spaces.
  4. Multi-class model overlap: this model detects `Shipwreck`, but also `MILCO`, `NOMBO`, and `Class_0` (which overlaps with the dedicated Mine detector).
- **Notes**:
  - Training metadata: batch size 16, 200 epochs, dataset path `/content/sih_combined_dataset/data.yaml`, timestamp `2026-09-27T17:44:17 UTC`.
  - Total directory size: 5,281,477 bytes (~5.04 MB).

---

## Model 5: SubPipeMini2 (Subsea Pipeline Detector)
- **Path**: `backend/models/SubPipeMini2_YOLO12s_best.pt.pt/best/` (contains `data.pkl`, `version`, `byteorder`, `.format_version`, `data/`)
- **Format**: Unpacked PyTorch ZIP Archive / Checkpoint Directory (TorchScript/PyTorch serialization format v3)
- **Framework**: PyTorch / Ultralytics (version `8.4.153`)
- **Architecture**: YOLO12s (`yolov12s.yaml`, scale: `s`, backbone: `Conv`, `C3k2`, `A2C2f`)
- **Task**: Object Detection (`detect`, `ultralytics.nn.tasks.DetectionModel`)
- **Input Size**: `640 × 640` (`train_args.imgsz: 640`)
- **Classes**: 1
- **Class Mapping**: `{0: 'Pipeline'}`
- **Confidence / NMS Settings**:
  - `train_args.conf`: `None` (not pinned; runtime default 0.25 applies)
  - `train_args.iou`: `0.7`
  - `train_args.max_det`: `300`
  - `train_args.agnostic_nms`: `False`
- **Directly Loadable by Ultralytics**: NO (Ultralytics expects a single `.pt` file; folder contains unpacked `best/` tree)
- **Load Status**: Not loadable with current environment
- **Dependencies**: Missing `torch`, `torchvision`, `ultralytics>=8.4.0`
- **Issues Preventing Inference**:
  1. Missing PyTorch and Ultralytics dependencies in backend environment.
  2. Unpacked directory structure requires packaging into `.pt` archive or custom checkpoint loading.
  3. Directory name contains duplicate extension (`.pt.pt`).
- **Notes**:
  - Training metadata: batch size 16, 50 epochs, dataset path `/content/SubPipeMiniSSS_YOLO/dataset.yaml`, timestamp `2026-09-15T20:47:29 UTC`.
  - Total directory size: 18,797,175 bytes (~17.93 MB).

---

## Model 6: Natural Seabed
- **Path**: *UNKNOWN / MISSING* (not present in `backend/models/` or repository)
- **Format**: *UNKNOWN*
- **Framework**: *UNKNOWN*
- **Architecture**: *UNKNOWN*
- **Task**: *UNKNOWN*
- **Input Size**: *UNKNOWN*
- **Classes**: *UNKNOWN*
- **Class Mapping**: UNKNOWN — requires model/data configuration inspection
- **Load Status**: Missing from repository
- **Dependencies**: *UNKNOWN*
- **Issues Preventing Inference**: Model weights are absent.
- **Notes**: The 6th model designated for natural seabed discrimination is not present.

---

## Exact Class Mapping

### Model: Cylinder Model
| Class ID | Class Name |
|----------|------------|
| 0 | Cylinder |

### Model: GhostVision
| Class ID | Class Name |
|----------|------------|
| 0 | Crab-Pot |

### Model: Mine Detector
| Class ID | Class Name |
|----------|------------|
| 0 | MILCO |
| 1 | NOMBO |

### Model: Shipwreck Detector
| Class ID | Class Name |
|----------|------------|
| 0 | Class_0 |
| 1 | MILCO |
| 2 | NOMBO |
| 3 | Shipwreck |

### Model: SubPipeMini2
| Class ID | Class Name |
|----------|------------|
| 0 | Pipeline |

### Model: Natural Seabed
UNKNOWN — requires model/data configuration inspection

---

## Backend Integration Readiness

| Model | Loadable | Architecture | Task | Classes Known | Ready for Inference |
|---|---|---|---|---|---|
| **Cylinder** | NO (Missing dependencies & unpacked format) | YOLO12s | Detection | YES (`{0: 'Cylinder'}`) | NO |
| **GhostVision** | NO (Missing dependencies & unpacked format) | YOLO12s | Detection | YES (`{0: 'Crab-Pot'}`) | NO |
| **Mines** | NO (Missing dependencies & unpacked format) | YOLO12s | Detection | YES (`{0: 'MILCO', 1: 'NOMBO'}`) | NO |
| **Shipwreck** | NO (Missing dependencies & unpacked format) | YOLO26n | Detection | YES (`{0: 'Class_0', 1: 'MILCO', 2: 'NOMBO', 3: 'Shipwreck'}`) | NO |
| **SubPipes** | NO (Missing dependencies & unpacked format) | YOLO12s | Detection | YES (`{0: 'Pipeline'}`) | NO |
| **Natural Seabed** | NO (Model missing) | UNKNOWN | UNKNOWN | NO | NO |
