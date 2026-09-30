"""Sonar Image Preprocessing Service.

Handles image validation, format verification, safe in-memory decoding,
and standardization (supporting JPEG, PNG, TIFF, BMP, WebP) for Side-Scan Sonar.
"""

import io
from dataclasses import dataclass
from pathlib import Path
from typing import Optional, Set
import numpy as np
from PIL import Image, ImageOps


class ImageValidationError(ValueError):
    """Raised when an uploaded file fails validation or cannot be decoded."""
    pass


class UnsupportedFormatError(ImageValidationError):
    """Raised when an uploaded file format is not supported."""
    pass


@dataclass
class PreprocessedImage:
    """Standardized preprocessed image ready for ML inference."""

    pil_image: Image.Image
    np_array: np.ndarray
    filename: str
    width: int
    height: int
    channels: int
    format: str
    size_bytes: int


# Supported file extensions and MIME content-types
SUPPORTED_EXTENSIONS: Set[str] = {".jpg", ".jpeg", ".png", ".tif", ".tiff", ".bmp", ".webp"}

SUPPORTED_MIME_TYPES: Set[str] = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/tiff",
    "image/tif",
    "image/bmp",
    "image/webp",
    "image/x-png",
    "image/x-tiff",
}

# Max allowed image file size in bytes (100 MB)
MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024

# Minimum acceptable pixel dimensions
MIN_DIMENSION_PX = 16


def validate_file_metadata(filename: Optional[str], content_type: Optional[str], size_bytes: int) -> None:
    """Validate filename extension, MIME type, and file size before decoding."""
    if size_bytes == 0:
        raise ImageValidationError("Uploaded image file is empty (0 bytes).")

    if size_bytes > MAX_FILE_SIZE_BYTES:
        max_mb = MAX_FILE_SIZE_BYTES // (1024 * 1024)
        raise ImageValidationError(f"File size exceeds maximum permitted limit of {max_mb} MB.")

    clean_name = (filename or "").strip().lower()
    has_valid_ext = any(clean_name.endswith(ext) for ext in SUPPORTED_EXTENSIONS)
    has_valid_mime = (
        content_type in SUPPORTED_MIME_TYPES
        or content_type == "application/octet-stream"
        or content_type is None
    )

    if not (has_valid_ext or (content_type in SUPPORTED_MIME_TYPES)):
        ext_list = ", ".join(sorted(SUPPORTED_EXTENSIONS))
        raise UnsupportedFormatError(
            f"Unsupported file format '{content_type or clean_name}'. Supported formats: {ext_list}."
        )


def preprocess_image_bytes(
    file_bytes: bytes,
    filename: str = "sonar_input.png",
    content_type: Optional[str] = None,
) -> PreprocessedImage:
    """Safely decode and preprocess image bytes into standard RGB format.

    Handles high dynamic range (16-bit) and multi-channel TIFF sonar files
    by normalizing to 8-bit RGB without modifying original files.
    """
    size_bytes = len(file_bytes)
    validate_file_metadata(filename, content_type, size_bytes)

    try:
        raw_pil = Image.open(io.BytesIO(file_bytes))
        raw_pil.verify()
    except Exception as e:
        raise ImageValidationError(f"Uploaded file is corrupted or not a valid image: {e}") from e

    # Re-open after verify() (PIL design requirement)
    try:
        pil_img = Image.open(io.BytesIO(file_bytes))
        img_format = pil_img.format or Path(filename).suffix.upper().lstrip(".")
        orig_w, orig_h = pil_img.size

        if orig_w < MIN_DIMENSION_PX or orig_h < MIN_DIMENSION_PX:
            raise ImageValidationError(
                f"Image dimensions ({orig_w}x{orig_h}) are smaller than minimum allowed {MIN_DIMENSION_PX}x{MIN_DIMENSION_PX}."
            )

        # Handle 16-bit or special modes (common in raw sonar TIFFs)
        if pil_img.mode in ("I;16", "I;16L", "I;16B", "I", "F"):
            arr = np.array(pil_img, dtype=np.float32)
            arr_min, arr_max = arr.min(), arr.max()
            if arr_max > arr_min:
                norm_arr = ((arr - arr_min) / (arr_max - arr_min) * 255.0).astype(np.uint8)
            else:
                norm_arr = np.zeros_like(arr, dtype=np.uint8)
            pil_img = Image.fromarray(norm_arr).convert("RGB")
        elif pil_img.mode != "RGB":
            pil_img = pil_img.convert("RGB")

        np_array = np.array(pil_img)
        channels = np_array.shape[2] if len(np_array.shape) == 3 else 1

        return PreprocessedImage(
            pil_image=pil_img,
            np_array=np_array,
            filename=filename,
            width=orig_w,
            height=orig_h,
            channels=channels,
            format=img_format,
            size_bytes=size_bytes,
        )
    except ImageValidationError:
        raise
    except Exception as e:
        raise ImageValidationError(f"Failed to decode image data: {e}") from e
