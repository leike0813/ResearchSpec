#!/usr/bin/env python3
"""Resolve a user-configured ONNX model without changing its files."""
from __future__ import annotations

import os
from pathlib import Path

MODEL_ID = "BAAI/bge-small-zh-v1.5"
ONNX_NAMES = ("model_optimized.onnx", "model.onnx")


def configured_model_dir() -> Path | None:
    value = (os.environ.get("PATENT_MAP_MODEL_DIR") or "").strip()
    return Path(value).expanduser().resolve() if value else None


def default_model_dir() -> Path:
    """Display the configured model path or the project-local suggested path."""
    from map_cache import map_home

    return configured_model_dir() or map_home() / "models" / "bge-small-zh-v1.5"


def is_model_ready(directory: Path) -> bool:
    """A usable model has ONNX weights, configuration and a tokenizer."""
    return (
        directory.is_dir()
        and any((directory / name).is_file() for name in ONNX_NAMES)
        and (directory / "config.json").is_file()
        and ((directory / "tokenizer.json").is_file() or (directory / "vocab.txt").is_file())
    )


def resolve_ready_dir(directory: Path) -> Path | None:
    return directory if is_model_ready(directory) else None


def find_local_model(vault: Path | None = None) -> Path | None:
    directory = configured_model_dir()
    return resolve_ready_dir(directory) if directory is not None else None


def ensure_model(vault: Path | None = None) -> tuple[Path | None, str]:
    """Inspect only the selected local model; missing files leave IPC fallback."""
    directory = configured_model_dir()
    if directory is None:
        return None, "not-configured"
    ready = resolve_ready_dir(directory)
    return ready, "configured-local" if ready else "local-model-incomplete"


def write_pointer(vault: Path | None, model_dir: Path | None) -> None:
    """Record advisory cache metadata outside the selected corpus/model."""
    from map_cache import cache_dir_for_vault

    parent = cache_dir_for_vault(vault)
    parent.mkdir(parents=True, exist_ok=True)
    (parent / "MODEL_DIR.txt").write_text(
        f"Configured local model: {model_dir or 'unavailable'}\n"
        "Missing model files use IPC fallback. Model input files are read-only.\n",
        encoding="utf-8",
    )


def main() -> int:
    directory, source = ensure_model()
    print(f"MAP_MODEL:{directory or ''}")
    print(f"MAP_MODEL_SOURCE:{source}")
    return 0 if directory else 1


if __name__ == "__main__":
    raise SystemExit(main())
