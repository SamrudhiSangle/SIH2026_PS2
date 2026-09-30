"""Sonar Image Validation Service.

Validates uploaded files before ML inference:
1. File integrity and format safety (decoding, decompression bomb prevention, file size).
2. Sonar-likeness validation using conservative acoustic heuristics (grayscale/monochrome
   palette, hue directional circular variance, contrast distribution).
"""

import io
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Optional, Tuple
import cv2
import numpy as np
from PIL import Image

from app.services.preprocessing_service import ImageValidationError, UnsupportedFormatError

logger = logging.getLogger(__name__)

# Safety and dimension boundaries
MAX_ALLOWED_FILE_BYTES = 50 * 1024 * 1024  # 50 MB
MAX_ALLOWED_PIXELS = 100_000_000            # 100 MP limit (decompression bomb protection)
MIN_DIMENSION = 32
MAX_ASPECT_RATIO = 30.0

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp", ".webp"}
ALLOWED_MIME_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/tiff",
    "image/tif",
    "image/bmp",
    "image/webp",
    "image/x-png",
    "image/x-tiff",
    "application/octet-stream",
}


class NonSonarImageError(Exception):
    """Raised when an uploaded file is a valid image but clearly not a Side-Scan Sonar image."""

    def __init__(
        self,
        message: str = "The uploaded image does not appear to be a valid Side-Scan Sonar image.",
        details: Optional[str] = None,
    ):
        super().__init__(message)
        self.message = message
        self.details = details or "Please upload a valid Side-Scan Sonar survey image."


@dataclass(frozen=True)
class SonarLikenessReport:
    """Diagnostic metrics from sonar-likeness evaluation."""

    is_valid: bool
    description: str
    color_diff: float
    circular_variance: float
    aspect_ratio: float


def evaluate_sonar_likeness(img_rgb: np.ndarray) -> Tuple[bool, str, SonarLikenessReport]:
    """Evaluate whether an RGB image exhibits acoustic side-scan sonar characteristics.

    Conservative heuristic approach:
    1. Grayscale / near-monochrome imagery is automatically recognized as raw acoustic data.
    2. Colormapped false-color sonar (copper, amber, cyan/blue) displays a tightly clustered
       single-hue distribution (low circular variance of hue).
    3. Natural optical photographs with broad polychromatic spectra (conflicting hues across
       the color wheel, e.g. blue sky, green foliage, skin tones, red objects) are rejected.
    """
    h, w = img_rgb.shape[:2]

    # Aspect ratio validation
    aspect = max(w / h, h / w)
    if aspect > MAX_ASPECT_RATIO:
        report = SonarLikenessReport(
            is_valid=False,
            description="Extreme aspect ratio incompatible with sonar waterfalls",
            color_diff=0.0,
            circular_variance=0.0,
            aspect_ratio=aspect,
        )
        return False, report.description, report

    # Check for blank white canvas (empty document/sheet)
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    mean_lum = float(np.mean(gray))
    std_lum = float(np.std(gray))
    if mean_lum > 248.0 and std_lum < 2.0:
        report = SonarLikenessReport(
            is_valid=False,
            description="Image is a blank or solid white canvas",
            color_diff=0.0,
            circular_variance=0.0,
            aspect_ratio=aspect,
        )
        return False, report.description, report

    # Check for predominantly white document canvas (scanned pages, diagrams)
    near_white_fraction = float(np.mean(gray > 240))
    if near_white_fraction > 0.80 and mean_lum > 215.0:
        report = SonarLikenessReport(
            is_valid=False,
            description="Image is predominantly a white canvas or document rather than sonar imagery",
            color_diff=0.0,
            circular_variance=0.0,
            aspect_ratio=aspect,
        )
        return False, report.description, report

    # Check for solid black canvas
    if mean_lum < 1.0 and std_lum < 1.0:
        report = SonarLikenessReport(
            is_valid=False,
            description="Image is a solid black canvas with zero acoustic return",
            color_diff=0.0,
            circular_variance=0.0,
            aspect_ratio=aspect,
        )
        return False, report.description, report

    # Inter-channel color divergence (mean |R-G| + |G-B| + |B-R|) / 3
    sample = img_rgb if (h <= 512 and w <= 512) else img_rgb[::2, ::2]
    r = sample[:, :, 0].astype(np.float32)
    g = sample[:, :, 1].astype(np.float32)
    b = sample[:, :, 2].astype(np.float32)
    color_diff = float((np.mean(np.abs(r - g)) + np.mean(np.abs(g - b)) + np.mean(np.abs(b - r))) / 3.0)

    # 1. Grayscale or near-grayscale: Raw acoustic backscatter
    if color_diff < 18.0:
        report = SonarLikenessReport(
            is_valid=True,
            description="Monochrome or near-grayscale acoustic backscatter",
            color_diff=round(color_diff, 2),
            circular_variance=0.0,
            aspect_ratio=round(aspect, 2),
        )
        return True, report.description, report

    # 2. False-color / colormapped sonar vs polychromatic optical photograph
    hsv = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2HSV)
    h_chan = hsv[:, :, 0]
    s_chan = hsv[:, :, 1]
    v_chan = hsv[:, :, 2]

    # Mask for pixels with discernible color (excluding deep shadows and bright specular highlights)
    colored_mask = (v_chan > 25) & (s_chan > 35)
    total_colored = int(np.sum(colored_mask))

    if total_colored < 200:
        # Near-neutral saturation across the entire image
        report = SonarLikenessReport(
            is_valid=True,
            description="Low-saturation acoustic imagery",
            color_diff=round(color_diff, 2),
            circular_variance=0.0,
            aspect_ratio=round(aspect, 2),
        )
        return True, report.description, report

    # Compute circular variance of hue: Var = 1 - ||mean_unit_vector||
    h_angles = h_chan[colored_mask].astype(float) * (2.0 * np.pi / 180.0)
    sin_sum = float(np.sum(np.sin(h_angles)))
    cos_sum = float(np.sum(np.cos(h_angles)))
    r_len = np.sqrt(sin_sum**2 + cos_sum**2) / total_colored
    circular_variance = float(1.0 - r_len)

    # Polychromatic rejection: genuine sonar palettes have circular variance < 0.20.
    # Natural photos with competing hues (sky, plants, clothes) have variance > 0.40.
    if circular_variance > 0.35 and color_diff > 20.0:
        report = SonarLikenessReport(
            is_valid=False,
            description=(
                f"Image exhibits a polychromatic optical spectrum (circular variance {circular_variance:.2f}, "
                f"color diff {color_diff:.1f}) typical of natural photographs rather than acoustic sonar backscatter"
            ),
            color_diff=round(color_diff, 2),
            circular_variance=round(circular_variance, 3),
            aspect_ratio=round(aspect, 2),
        )
        return False, report.description, report

    report = SonarLikenessReport(
        is_valid=True,
        description=f"Colormapped acoustic imagery (circular variance {circular_variance:.3f})",
        color_diff=round(color_diff, 2),
        circular_variance=round(circular_variance, 3),
        aspect_ratio=round(aspect, 2),
    )
    return True, report.description, report


class SonarImageValidator:
    """Validates uploaded sonar images before ML inference."""

    @staticmethod
    def validate_upload(
        file_bytes: bytes,
        filename: str = "sonar_input.png",
        content_type: Optional[str] = None,
    ) -> SonarLikenessReport:
        """Perform comprehensive file integrity, security, and sonar-likeness validation.

        Raises:
            UnsupportedFormatError: If file extension or MIME type is unsupported.
            ImageValidationError: If image is corrupted, truncated, or exceeds size limits.
            NonSonarImageError: If the image is valid but clearly not side-scan sonar.
        """
        # 1. Payload size check
        if not file_bytes:
            raise ImageValidationError("Uploaded image file is empty.")

        if len(file_bytes) > MAX_ALLOWED_FILE_BYTES:
            raise ImageValidationError(
                f"File size exceeds maximum allowed limit of {MAX_ALLOWED_FILE_BYTES // (1024 * 1024)} MB."
            )

        # 2. Format / extension and MIME validation
        ext = Path(filename).suffix.lower()
        if ext and ext not in ALLOWED_EXTENSIONS:
            raise UnsupportedFormatError(
                f"Unsupported file format '{ext}'. Allowed formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}."
            )

        if content_type:
            cleaned_mime = content_type.split(";")[0].strip().lower()
            if cleaned_mime not in ALLOWED_MIME_TYPES:
                raise UnsupportedFormatError(
                    f"Unsupported MIME content type '{content_type}'. Allowed types: {', '.join(sorted(ALLOWED_MIME_TYPES))}."
                )

        # 3. Safe PIL decode & decompression bomb prevention
        try:
            Image.MAX_IMAGE_PIXELS = MAX_ALLOWED_PIXELS
            with Image.open(io.BytesIO(file_bytes)) as pil_img:
                # Decompression bomb check
                w, h = pil_img.size
                if (w * h) > MAX_ALLOWED_PIXELS:
                    raise ImageValidationError(
                        f"Image dimensions ({w}x{h}) exceed maximum pixel limit of {MAX_ALLOWED_PIXELS} (decompression bomb protection)."
                    )
                if w < MIN_DIMENSION or h < MIN_DIMENSION:
                    raise ImageValidationError(
                        f"Image dimensions ({w}x{h}) are too small (minimum {MIN_DIMENSION}x{MIN_DIMENSION} required)."
                    )
                detected_fmt = (pil_img.format or "").upper()
                if detected_fmt not in {"JPEG", "JPG", "PNG", "TIFF", "TIF", "BMP", "WEBP"}:
                    raise UnsupportedFormatError(
                        f"Unsupported decoded image format '{detected_fmt}'. Supported formats: PNG, JPEG, TIFF, BMP, WebP."
                    )
                pil_img.verify()
        except (UnsupportedFormatError, ImageValidationError):
            raise
        except Image.DecompressionBombError as e:
            raise ImageValidationError(
                f"Image exceeds maximum safe dimension limit (decompression bomb protection): {e}"
            ) from e
        except Exception as e:
            logger.warning(f"PIL verification failed for '{filename}': {e}")
            raise ImageValidationError(f"Corrupted or invalid image stream: {e}") from e

        # 4. Safe OpenCV BGR/RGB decoding
        np_arr = np.frombuffer(file_bytes, np.uint8)
        img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img_bgr is None:
            raise ImageValidationError("Unable to decode image pixels from uploaded byte stream.")

        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

        # 5. Sonar-likeness validation
        is_sonar, reason, report = evaluate_sonar_likeness(img_rgb)
        if not is_sonar:
            logger.info(f"Rejected non-sonar upload '{filename}': {reason}")
            raise NonSonarImageError(
                message="The uploaded image does not appear to be a valid Side-Scan Sonar image.",
                details="Please upload a valid Side-Scan Sonar survey image.",
            )

        return report


sonar_validator = SonarImageValidator()
