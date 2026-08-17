"""Portable support functions copied into every HistAgent-derived Skill tree."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import tempfile
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Callable

LAYERS = (
    "raw-observation-or-ocr",
    "normalized-transcription",
    "emendation",
    "translation",
    "interpretation",
)


class SkillError(Exception):
    """Expected command failure with a stable machine-readable code."""

    def __init__(self, code: str, message: str, details: dict[str, Any] | None = None):
        super().__init__(message)
        self.code = code
        self.message = message
        self.details = details or {}


class SkillArgumentParser(argparse.ArgumentParser):
    """Argparse variant that keeps CLI failures machine-readable on stderr."""

    def error(self, message: str) -> None:
        print(json.dumps({"error": {"code": "invalid_arguments", "message": message, "details": {}}}, sort_keys=True, separators=(",", ":")), file=sys.stderr)
        self.exit(2)


def read_json(path_value: str, label: str) -> dict[str, Any]:
    path = Path(path_value).expanduser().resolve()
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise SkillError("input_not_found", f"{label} does not exist.", {"path": str(path)}) from exc
    except (OSError, json.JSONDecodeError) as exc:
        raise SkillError("invalid_input", f"{label} must be readable UTF-8 JSON.", {"path": str(path)}) from exc
    if not isinstance(value, dict):
        raise SkillError("invalid_input", f"{label} root must be a JSON object.", {"path": str(path)})
    return value


def require_string(value: dict[str, Any], key: str) -> str:
    item = value.get(key)
    if not isinstance(item, str) or not item.strip():
        raise SkillError("invalid_input", f"{key} must be a non-empty string.", {"field": key})
    return item


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    try:
        return sha256_bytes(path.read_bytes())
    except OSError as exc:
        raise SkillError("input_not_found", "Input file is not readable.", {"path": str(path)}) from exc


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def artifact(path: Path, media_type: str = "application/json") -> dict[str, Any]:
    resolved = path.expanduser().resolve()
    return {"path": str(resolved), "sha256": sha256_file(resolved), "media_type": media_type}


def _atomic_write(path: Path, content: bytes, *, overwrite: bool) -> None:
    resolved = path.expanduser().resolve()
    if resolved.exists() and not overwrite:
        raise SkillError("artifact_exists", "Refusing to overwrite an existing artifact.", {"path": str(resolved)})
    resolved.parent.mkdir(parents=True, exist_ok=True)
    handle, temporary = tempfile.mkstemp(prefix=f".{resolved.name}.", dir=resolved.parent)
    try:
        with os.fdopen(handle, "wb") as stream:
            stream.write(content)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, resolved)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def write_json(path: Path, value: Any, *, overwrite: bool = False) -> dict[str, Any]:
    content = (json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode("utf-8")
    _atomic_write(path, content, overwrite=overwrite)
    return artifact(path)


def write_text(path: Path, value: str, *, overwrite: bool = False) -> dict[str, Any]:
    _atomic_write(path, value.encode("utf-8"), overwrite=overwrite)
    return artifact(path, "text/markdown")


def write_bytes(path: Path, value: bytes, media_type: str, *, overwrite: bool = False) -> dict[str, Any]:
    _atomic_write(path, value, overwrite=overwrite)
    return artifact(path, media_type)


def credential_from_env(name: str | None) -> str | None:
    if name is None:
        return None
    if not name or not name.replace("_", "A").isalnum() or name[0].isdigit():
        raise SkillError("invalid_input", "Credential environment variable name is invalid.", {"name": name})
    value = os.environ.get(name)
    if not value:
        raise SkillError("configuration_missing", "The selected adapter credential is not configured.", {"environment_variable": name})
    return value


def request_json(
    url: str,
    *,
    method: str = "GET",
    body: dict[str, Any] | None = None,
    headers: dict[str, str] | None = None,
    timeout: float = 30.0,
) -> Any:
    data = canonical_json(body).encode("utf-8") if body is not None else None
    request_headers = {"Accept": "application/json", "User-Agent": "ResearchSpec-HistAgent/1"}
    request_headers.update(headers or {})
    if data is not None:
        request_headers["Content-Type"] = "application/json"
    request = urllib.request.Request(url, data=data, headers=request_headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise SkillError(
            "operation_failed",
            "Configured adapter request failed.",
            {"url": url.split("?", 1)[0], "reason": type(exc).__name__},
        ) from exc


def layer_record(
    layer: str,
    content: str,
    source: dict[str, Any],
    *,
    operations: list[dict[str, Any]] | None = None,
    tool_or_provider: str = "stdlib",
    reason: str = "direct-observation",
    uncertainty: str = "unspecified",
    review_state: str = "unreviewed",
) -> dict[str, Any]:
    if layer not in LAYERS:
        raise SkillError("invalid_layer", "Unknown historical-source layer.", {"layer": layer})
    parent_id = source.get("parent_id") or source.get("source_id") or source.get("sha256") or source.get("text_sha256")
    locator = source.get("locator") or source.get("path") or source.get("source_id")
    if not parent_id or not locator:
        raise SkillError("invalid_input", "Layer source requires a parent identifier and locator.")
    return {
        "layer": layer,
        "content": content,
        "parent_id": str(parent_id),
        "locator": str(locator),
        "operations": operations or [],
        "tool_or_provider": tool_or_provider,
        "reason": reason,
        "uncertainty": uncertainty,
        "review_state": review_state,
        "content_sha256": sha256_bytes(content.encode("utf-8")),
    }


def validate_layer_records(records: Any) -> None:
    if not isinstance(records, list) or not records:
        raise SkillError("invalid_result", "layers must be a non-empty array.")
    seen: set[str] = set()
    for record in records:
        required = ("parent_id", "locator", "tool_or_provider", "reason", "uncertainty", "review_state", "content_sha256")
        if not isinstance(record, dict) or record.get("layer") not in LAYERS or not isinstance(record.get("content"), str):
            raise SkillError("invalid_result", "Each layer requires a known layer name and string content.")
        if any(not str(record.get(key, "")).strip() for key in required):
            raise SkillError("invalid_result", "Layer lineage fields must be explicit and non-empty.", {"layer": record.get("layer")})
        if record["content_sha256"] != sha256_bytes(record["content"].encode("utf-8")):
            raise SkillError("invalid_result", "Layer content hash does not match its content.", {"layer": record["layer"]})
        if record["layer"] in seen:
            raise SkillError("invalid_result", "A result may contain each layer at most once.", {"layer": record["layer"]})
        seen.add(record["layer"])


def emit(value: dict[str, Any]) -> None:
    print(canonical_json(value))


def run_cli(handler: Callable[[], dict[str, Any]]) -> int:
    """Emit command-specific success JSON; emit only an error object to stderr on failure."""
    try:
        emit(handler())
        return 0
    except SkillError as exc:
        print(canonical_json({"error": {"code": exc.code, "message": exc.message, "details": exc.details}}), file=sys.stderr)
        return 2
    except Exception as exc:  # stable boundary without exposing traceback or secrets
        print(canonical_json({"error": {"code": "internal_error", "message": "The command failed unexpectedly.", "details": {"type": type(exc).__name__}}}), file=sys.stderr)
        return 3
