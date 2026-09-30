"""Unit tests for Model Loader and In-Memory Caching."""

import pytest
from ultralytics import YOLO
from app.core.model_registry import ModelNotFoundError
from app.services.model_loader import (
    clear_model_cache,
    get_loaded_models,
    is_model_loaded,
    load_model,
)


@pytest.fixture(autouse=True)
def clean_cache():
    """Ensure in-memory model cache is clean before tests."""
    clear_model_cache()
    yield
    clear_model_cache()


def test_load_model_ghostvision():
    """Verify GhostVision loads from unpacked directory into a YOLO instance."""
    model = load_model("ghostvision")
    assert isinstance(model, YOLO)
    assert is_model_loaded("ghostvision")
    assert model.names == {0: "Crab-Pot"}


def test_in_memory_caching():
    """Verify that repeatedly requesting the same model returns the cached instance."""
    m1 = load_model("mines")
    m2 = load_model("mines")
    assert m1 is m2  # Must be the exact same cached object in memory
    assert "mines" in get_loaded_models()


def test_load_all_verified_models():
    """Verify each of the 5 verified models loads successfully."""
    for model_key in ["cylinder", "ghostvision", "mines", "shipwreck", "subpipes"]:
        model = load_model(model_key)
        assert isinstance(model, YOLO)
        assert is_model_loaded(model_key)


def test_load_unregistered_model_fails():
    """Verify that attempting to load an unknown model raises ModelNotFoundError."""
    with pytest.raises(ModelNotFoundError):
        load_model("unknown_sonar_model")
