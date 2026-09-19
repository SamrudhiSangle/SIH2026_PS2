from __future__ import annotations

from typing import Dict, List

from app.models.base_model import BaseModel


class ModelManager:
    def __init__(self):
        self.models: Dict[str, BaseModel] = {}

    def register_model(self, model: BaseModel) -> None:
        self.models[model.name] = model

    def get_model(self, name: str) -> BaseModel:
        key = name.lower().strip()
        if key not in self.models:
            raise KeyError(f"Model '{name}' not found")
        return self.models[key]

    def list_models(self) -> List[dict]:
        response = []
        for model in self.models.values():
            response.append(
                {
                    "name": model.name,
                    "status": model.status,
                    "type": model.model_type,
                    "classes": model.class_names,
                }
            )
        return response
