"""Structured Logging for SIH 26057."""

import logging
import sys

# Format with timestamps and clean output
LOG_FORMAT = "%(asctime)s | %(levelname)-7s | %(name)s | %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def setup_logging() -> None:
    """Configures root and application loggers."""
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(fmt=LOG_FORMAT, datefmt=DATE_FORMAT))

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)

    # Remove existing handlers to avoid duplicates
    for h in root_logger.handlers[:]:
        root_logger.removeHandler(h)
    root_logger.addHandler(handler)

    # Silence overly verbose external loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("ultralytics").setLevel(logging.WARNING)


logger = logging.getLogger("sih.backend")


def log_request_event(
    event: str,
    request_id: str,
    model: str = "",
    processing_ms: float = 0.0,
    status: str = "",
    extra: str = "",
) -> None:
    """Standardized structured log helper."""
    parts = [f"event={event}", f"request_id={request_id}"]
    if model:
        parts.append(f"model={model}")
    if status:
        parts.append(f"status={status}")
    if processing_ms > 0:
        parts.append(f"processing_ms={processing_ms:.1f}")
    if extra:
        parts.append(extra)
    logger.info(" ".join(parts))
