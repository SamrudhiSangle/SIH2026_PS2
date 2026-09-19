"""
Safe Model Reconstruction Utility for SIH 26057.
Reconstructs unzipped PyTorch model archives into valid .pt files inside generated_models/.
Original model directories are NEVER modified or moved.
"""

import os
import sys
import zipfile
import shutil
from pathlib import Path

# Safe encoding for Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import numpy as np
from PIL import Image

# Setup directories
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
GENERATED_MODELS_DIR = BACKEND_DIR / "generated_models"
GENERATED_MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Original extracted folders
GHOSTVISION_DIR = PROJECT_ROOT / "GhostVision_YOLO12s_best.pt" / "best"
SUBPIPE_DIR = PROJECT_ROOT / "SubPipeMini2_YOLO12s_best.pt.pt" / "best"

TARGET_GHOSTVISION_PT = GENERATED_MODELS_DIR / "GhostVision_YOLO12s_best.pt"
TARGET_SUBPIPE_PT = GENERATED_MODELS_DIR / "SubPipeMini2_YOLO12s_best.pt"


def verify_extracted_structure(folder: Path) -> bool:
    """Verifies that the extracted folder contains required PyTorch zip components."""
    if not folder.is_dir():
        print(f"[-] Directory does not exist: {folder}")
        return False
    
    required_entries = ["data.pkl", "byteorder", "version", ".format_version", "data"]
    for entry in required_entries:
        if not (folder / entry).exists():
            print(f"[-] Missing required PyTorch archive entry: {entry} in {folder}")
            return False
    return True


def pack_pytorch_zip(source_best_dir: Path, target_pt_path: Path) -> bool:
    """
    Packs extracted PyTorch folder into a valid .pt zip archive using ZIP_STORED.
    Preserves 'best/...' internal path structure for PyTorch serialization compatibility.
    """
    temp_target = target_pt_path.with_suffix(".tmp")
    print(f"[*] Packing {source_best_dir.name} into {target_pt_path.name}...")

    try:
        with zipfile.ZipFile(temp_target, "w", compression=zipfile.ZIP_STORED) as z:
            for root, _, files in os.walk(source_best_dir):
                for file in files:
                    full_path = Path(root) / file
                    # Relative path relative to source_best_dir's parent gives 'best/<path>'
                    rel_path = full_path.relative_to(source_best_dir.parent)
                    arcname = str(rel_path).replace("\\", "/")
                    z.write(full_path, arcname=arcname)
        
        # Atomically move temporary file to final target
        if target_pt_path.exists():
            target_pt_path.unlink()
        temp_target.rename(target_pt_path)
        print(f"[✓] Created {target_pt_path} ({target_pt_path.stat().st_size:,} bytes)")
        return True
    except Exception as e:
        print(f"[-] Error packing archive {target_pt_path}: {e}")
        if temp_target.exists():
            temp_target.unlink()
        return False


def test_model_inference(pt_path: Path, model_name: str, expected_class_id: int = 0) -> bool:
    """Loads reconstructed model and performs real inference on a sample sonar image."""
    try:
        from ultralytics import YOLO
        import torch

        print(f"\n[*] Validating {model_name} from {pt_path.name}...")
        print(f"    PyTorch version: {torch.__version__}")
        
        # 1. Load model
        model = YOLO(str(pt_path))
        print(f"[✓] {model_name} LOAD: SUCCESS")
        print(f"    Model task: {getattr(model, 'task', 'unknown')}")
        print(f"    Class names: {model.names}")
        
        # 2. Prepare test image
        test_img_array = np.zeros((640, 640, 3), dtype=np.uint8)
        # Create a synthetic sonar anomaly pattern (gradient patch)
        test_img_array[150:350, 150:350] = 140
        test_img_array[200:300, 200:300] = 210
        test_pil = Image.fromarray(test_img_array)
        
        test_img_dir = BACKEND_DIR / "uploads"
        test_img_dir.mkdir(parents=True, exist_ok=True)
        test_img_path = test_img_dir / "sample_validation_sonar.png"
        test_pil.save(test_img_path)
        
        # 3. Run inference
        results = model.predict(source=str(test_img_path), conf=0.1, verbose=False)
        print(f"[✓] {model_name} INFERENCE: SUCCESS")
        print(f"    Results processed: {len(results)}")
        for r in results:
            print(f"    Detections found: {len(r.boxes)}")
            if len(r.boxes) > 0:
                for box in r.boxes:
                    cls_id = int(box.cls)
                    cls_name = model.names.get(cls_id, f"class_{cls_id}")
                    print(f"      - Class: {cls_name} ({cls_id}), Conf: {float(box.conf):.3f}, BBox: {box.xyxy.tolist()}")
        return True
    except Exception as e:
        import traceback
        print(f"[-] {model_name} VALIDATION FAILED: {e}")
        traceback.print_exc()
        return False


def main():
    print("=" * 60)
    print("SIH 26057 — SAFE MODEL RECONSTRUCTION & COMPATIBILITY CHECK")
    print("=" * 60)

    # 1. Check original folders
    print("\n[Step 1] Checking original model artifact folders...")
    if not verify_extracted_structure(GHOSTVISION_DIR):
        print("[-] GhostVision extracted folder is incomplete or missing!")
        sys.exit(1)
    if not verify_extracted_structure(SUBPIPE_DIR):
        print("[-] SubPipeMini2 extracted folder is incomplete or missing!")
        sys.exit(1)
    print("[✓] Both original model folders are valid PyTorch serialization structures.")

    # 2. Reconstruct into generated_models/
    print("\n[Step 2] Reconstructing .pt files in generated_models/...")
    gv_ok = pack_pytorch_zip(GHOSTVISION_DIR, TARGET_GHOSTVISION_PT)
    sp_ok = pack_pytorch_zip(SUBPIPE_DIR, TARGET_SUBPIPE_PT)

    if not (gv_ok and sp_ok):
        print("[-] Model reconstruction failed!")
        sys.exit(1)

    # 3. Validate loading and real inference
    print("\n[Step 3] Running live load and inference verification...")
    gv_val = test_model_inference(TARGET_GHOSTVISION_PT, "GhostVision (Crab-Pot)")
    sp_val = test_model_inference(TARGET_SUBPIPE_PT, "SubPipeMini2 (Pipeline)")

    print("\n" + "=" * 60)
    print("FINAL MODEL STATUS VERIFICATION:")
    print("=" * 60)
    print(f"GhostVision:  LOAD {'✓' if gv_val else '✗'} | INFERENCE {'✓' if gv_val else '✗'}")
    print(f"SubPipeMini2: LOAD {'✓' if sp_val else '✗'} | INFERENCE {'✓' if sp_val else '✗'}")
    print(f"Shipwreck:    MOCK (No artifact exists yet — placeholder ready)")
    print("=" * 60)

    if gv_val and sp_val:
        print("\n>>> ALL REAL MODEL CHECKS PASSED. Ready for backend integration.")
        sys.exit(0)
    else:
        print("\n>>> ERROR: Model validation failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
