from __future__ import annotations

from typing import Any, Dict


class ReliabilityEngine:
    def evaluate(self, prediction: Dict[str, Any], image_path: str | None = None) -> Dict[str, Any]:
        return {
            "reliability_score": None,
            "status": "NOT_IMPLEMENTED",
        }
