# Side-Scan Sonar ML Models Registry

This document records the inventory, formats, class mappings, dependency requirements, and current status of machine learning models located in `backend/models/`.

---

## Discovered Models Inventory

| Model | File / Directory | Format | Intended Class | Status |
|---|---|---|---|---|
| **GhostVision** | `GhostVision_YOLO12s_best.pt/` | Unpacked PyTorch Checkpoint (`best/` folder with `data.pkl`, tensors) | Ghost gear / abandoned nets & synthetic polymer hazards | Discovered (Requires PyTorch / Ultralytics runtime; unpacked folder) |
| **SubPipes** | `SubPipeMini2_YOLO12s_best.pt.pt/` | Unpacked PyTorch Checkpoint (`best/` folder with `data.pkl`, tensors) | Subsea pipelines & industrial conduits | Discovered (Duplicate `.pt.pt` extension; requires PyTorch / Ultralytics) |
| **Shipwreck** | `shipwreak model/` | Unpacked PyTorch Checkpoint (`best/` folder with `data.pkl`, tensors) | Maritime shipwrecks, sunken hulls & structures | Discovered (Typo in folder name `shipwreak`; ~5.04 MB; requires PyTorch / Ultralytics) |
| **Mines** | `Mine_YOLO12s_best.pt/` | Unpacked PyTorch Checkpoint (`best/` folder with `data.pkl`, tensors) | Naval ordnance, subsea mines & explosive hazards | Discovered (Requires PyTorch / Ultralytics runtime; unpacked folder) |
| **Cylinder** | `Cylinder model/` | Unpacked PyTorch Checkpoint (`best/` folder with `data.pkl`, tensors) | Subsea industrial cylinders & storage drums | Discovered (Folder has spaces; requires PyTorch / Ultralytics runtime) |
| **Natural Seabed** | *Not Found* | *N/A* | Natural seabed features (sand ripples, biogenic reefs, bedrock outcrops for false-positive filtering) | **MISSING** (Not present in `backend/models/`) |

---

## File Format & Architecture Analysis

### 1. Internal Format
All 5 present models share an identical internal structure:
- Each item is a directory containing a child directory named `best/`.
- Inside `best/` are the internal components of a standard PyTorch ZIP archive (`torch.save` format version 3):
  - `.format_version`: `1`
  - `byteorder`: `little`
  - `version`: `3`
  - `data.pkl`: Python pickle header containing model metadata, architecture configuration, and layer definitions.
  - `data/` or numbered files: Serialized tensor storage buffers.

### 2. File Size & Model Scale
- `GhostVision_YOLO12s_best.pt`: ~18.84 MB (~17.97 MiB) — consistent with YOLO12s (small) architecture.
- `SubPipeMini2_YOLO12s_best.pt.pt`: ~18.80 MB (~17.93 MiB) — consistent with YOLO12s (small) architecture.
- `Mine_YOLO12s_best.pt`: ~18.84 MB (~17.96 MiB) — consistent with YOLO12s (small) architecture.
- `Cylinder model`: ~19.08 MB (~18.20 MiB) — consistent with YOLO12s (small) architecture.
- `shipwreak model`: ~5.28 MB (~5.04 MiB) — consistent with a YOLO nano architecture or compact feature extractor.

---

## Dependency & Runtime Compatibility

**Can the current environment load these models?**
> **NO.** The current `backend` virtual environment (`.venv`) does not have the necessary machine learning runtimes installed.

- **Current dependencies**: `fastapi`, `uvicorn`, `pydantic`, `pydantic-settings`, `python-dotenv`, `numpy`, `pillow`, `opencv-python-headless`, `pytest`, `httpx`.
- **Missing dependencies**:
  - `torch` & `torchvision` (PyTorch core runtime)
  - `ultralytics` (for YOLO12 / YOLO checkpoint loading and inference)
  - Optional for optimized production serving: `onnx`, `onnxruntime`

---

## Identified Ambiguities & Discrepancies

1. **Missing 6th Model (Natural Seabed)**:
   - The project target lists 6 models (`GhostVision`, `SubPipes`, `Shipwreck`, `Mines`, `Cylinder`, `Natural Seabed`).
   - The `Natural Seabed` model is not present in `backend/models/`. A dedicated detector, negative classifier, or texture descriptor will be required before natural vs. artificial seabed discrimination can run.

2. **Unpacked Archive Folders vs. Single Checkpoint Files**:
   - The files were provided as extracted directories rather than packaged `.pt` archive files.
   - For standard framework consumption (e.g. `ultralytics.YOLO("model.pt")` or `torch.load("model.pt")`), the model loader expects either a packed zipfile or a designated checkpoint path.

3. **Inconsistent Naming Conventions**:
   - `GhostVision_YOLO12s_best.pt` has `.pt` as a directory name.
   - `SubPipeMini2_YOLO12s_best.pt.pt` has a double extension `.pt.pt` as a directory name.
   - `shipwreak model` contains a typographical error (`shipwreak` instead of `shipwreck`) and spaces in the path.
   - `Cylinder model` contains spaces and lacks architecture/version identifiers in the path name.
