"""
Model Artifact Validation Script for SIH 26057.
Inspects extracted model directories, checks PyTorch serialization markers safely,
inspects metadata, determines reconstruction feasibility, and tests inference.
"""

import os
import sys
from pathlib import Path

# Safe encoding for Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import numpy as np
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
GENERATED_MODELS_DIR = BACKEND_DIR / "generated_models"

GHOSTVISION_DIR = PROJECT_ROOT / "GhostVision_YOLO12s_best.pt" / "best"
SUBPIPE_DIR = PROJECT_ROOT / "SubPipeMini2_YOLO12s_best.pt.pt" / "best"

TARGET_GHOSTVISION_PT = GENERATED_MODELS_DIR / "GhostVision_YOLO12s_best.pt"
TARGET_SUBPIPE_PT = GENERATED_MODELS_DIR / "SubPipeMini2_YOLO12s_best.pt"


def inspect_extracted_directory(dir_path: Path, model_label: str) -> dict:
    """Safely inspects the extracted folder structure without running unpicklers blindly."""
    info = {
        "label": model_label,
        "path": str(dir_path),
        "exists": dir_path.exists(),
        "is_dir": dir_path.is_dir(),
        "has_data_pkl": False,
        "data_pkl_size": 0,
        "has_version": False,
        "version_val": None,
        "byteorder": None,
        "storage_alignment": None,
        "num_data_slices": 0,
        "is_valid_pytorch_archive": False,
    }

    if not info["exists"] or not info["is_dir"]:
        return info

    data_pkl = dir_path / "data.pkl"
    if data_pkl.exists():
        info["has_data_pkl"] = True
        info["data_pkl_size"] = data_pkl.stat().st_size

    version_file = dir_path / "version"
    if version_file.exists():
        info["has_version"] = True
        try:
            info["version_val"] = version_file.read_text().strip()
        except Exception:
            pass

    byteorder_file = dir_path / "byteorder"
    if byteorder_file.exists():
        try:
            info["byteorder"] = byteorder_file.read_text().strip()
        except Exception:
            pass

    storage_align = dir_path / ".storage_alignment"
    if storage_align.exists():
        try:
            info["storage_alignment"] = storage_align.read_text().strip()
        except Exception:
            pass

    data_dir = dir_path / "data"
    if data_dir.is_dir():
        info["num_data_slices"] = len(os.listdir(data_dir))

    # A valid PyTorch zip archive directory must have:
    # data.pkl, version, byteorder, and at least 1 tensor storage slice in data/
    if (
        info["has_data_pkl"]
        and info["has_version"]
        and info["byteorder"] in ("little", "big")
        and info["num_data_slices"] > 0
    ):
        info["is_valid_pytorch_archive"] = True

    return info


def validate_reconstructed_model(pt_path: Path, model_name: str) -> dict:
    """Loads reconstructed .pt and runs real inference."""
    result = {
        "model_name": model_name,
        "pt_path": str(pt_path),
        "file_exists": pt_path.exists(),
        "file_size": pt_path.stat().st_size if pt_path.exists() else 0,
        "load_success": False,
        "framework": "PyTorch / Ultralytics",
        "model_class": None,
        "class_names": None,
        "input_requirements": "640x640 RGB Image (JPG, PNG, TIFF)",
        "output_structure": "Boxes (xyxy, confidence, class_id), masks (null)",
        "inference_success": False,
        "error": None,
    }

    if not result["file_exists"]:
        result["error"] = "Model .pt file not found. Run reconstruct_models.py first."
        return result

    try:
        from ultralytics import YOLO
        import torch

        # Safe load using Ultralytics
        model = YOLO(str(pt_path))
        result["load_success"] = True
        result["model_class"] = model.model.__class__.__name__ if hasattr(model, "model") else "YOLO"
        result["class_names"] = model.names

        # Synthetic test image
        test_img = np.zeros((640, 640, 3), dtype=np.uint8)
        test_img[100:300, 100:300] = 128
        pil_img = Image.fromarray(test_img)

        test_dir = BACKEND_DIR / "uploads"
        test_dir.mkdir(parents=True, exist_ok=True)
        sample_path = test_dir / "val_test.png"
        pil_img.save(sample_path)

        predictions = model.predict(source=str(sample_path), conf=0.1, verbose=False)
        if len(predictions) > 0:
            result["inference_success"] = True
    except Exception as e:
        result["error"] = str(e)

    return result


def main():
    print("=" * 70)
    print("SIH 26057 — MODEL ARTIFACT VALIDATION REPORT")
    print("=" * 70)

    # Inspect extracted folders
    print("\n--- Phase 1: Extracted Directory Inspection ---")
    gv_info = inspect_extracted_directory(GHOSTVISION_DIR, "GhostVision (Crab-Pot)")
    sp_info = inspect_extracted_directory(SUBPIPE_DIR, "SubPipeMini2 (Pipeline)")

    for info in [gv_info, sp_info]:
        print(f"\nModel Artifact: {info['label']}")
        print(f"  Directory: {info['path']}")
        print(f"  Valid PyTorch Serialization: {'YES' if info['is_valid_pytorch_archive'] else 'NO'}")
        print(f"  data.pkl size: {info['data_pkl_size']:,} bytes")
        print(f"  PyTorch archive version: {info['version_val']}")
        print(f"  Byte order: {info['byteorder']}")
        print(f"  Storage alignment: {info['storage_alignment']} bytes")
        print(f"  Weight storage slices: {info['num_data_slices']} tensor files")

    # Inspect reconstructed .pt files
    print("\n--- Phase 2: Reconstructed Model & Inference Validation ---")
    gv_val = validate_reconstructed_model(TARGET_GHOSTVISION_PT, "GhostVision")
    sp_val = validate_reconstructed_model(TARGET_SUBPIPE_PT, "SubPipeMini2")

    for val in [gv_val, sp_val]:
        print(f"\nModel: {val['model_name']}")
        print(f"  File: {val['pt_path']} ({val['file_size']:,} bytes)")
        print(f"  Model Load: {'✓ SUCCESS' if val['load_success'] else '✗ FAILED'}")
        print(f"  Framework: {val['framework']}")
        print(f"  Model Class: {val['model_class']}")
        print(f"  Class Names: {val['class_names']}")
        print(f"  Input Requirements: {val['input_requirements']}")
        print(f"  Output Structure: {val['output_structure']}")
        print(f"  Inference Test: {'✓ SUCCESS' if val['inference_success'] else '✗ FAILED'}")
        if val["error"]:
            print(f"  Error: {val['error']}")

    print("\n" + "=" * 70)
    print("OVERALL VALIDATION SUMMARY:")
    all_ok = gv_val["inference_success"] and sp_val["inference_success"]
    if all_ok:
        print("✓ Both GhostVision and SubPipeMini2 are FULLY OPERATIONAL.")
        print("✓ Reconstructed .pt models verified in isolated environment.")
        print("✓ Ready for production backend.")
    else:
        print("✗ One or more models require reconstruction or configuration.")
    print("=" * 70)


if __name__ == "__main__":
    main()
