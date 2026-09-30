"""Portable deterministic support for FinRobot-derived financial Skills."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
from datetime import date, datetime, timezone
from pathlib import Path
import tempfile
from typing import Any, Callable


class InputError(ValueError):
    """A stable user-correctable input failure."""


def load_json(path: str | Path) -> dict[str, Any]:
    source = Path(path)
    try:
        value = json.loads(source.read_text(encoding="utf-8"))
    except FileNotFoundError as error:
        raise InputError(f"input file does not exist: {source}") from error
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise InputError(f"input file is not valid UTF-8 JSON: {source}: {error}") from error
    if not isinstance(value, dict):
        raise InputError("input root must be a JSON object")
    return value


def require_object(value: Any, field: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise InputError(f"{field} must be an object")
    return value


def require_list(value: Any, field: str, *, nonempty: bool = True) -> list[Any]:
    if not isinstance(value, list) or (nonempty and not value):
        qualifier = "a non-empty" if nonempty else "an"
        raise InputError(f"{field} must be {qualifier} array")
    return value


def require_text(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise InputError(f"{field} must be a non-empty string")
    return value.strip()


def optional_text(value: Any, field: str) -> str | None:
    if value is None:
        return None
    return require_text(value, field)


def require_number(value: Any, field: str, *, minimum: float | None = None, maximum: float | None = None) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise InputError(f"{field} must be a finite number")
    result = float(value)
    if not math.isfinite(result):
        raise InputError(f"{field} must be a finite number")
    if minimum is not None and result < minimum:
        raise InputError(f"{field} must be at least {minimum}")
    if maximum is not None and result > maximum:
        raise InputError(f"{field} must be at most {maximum}")
    return result


def optional_number(value: Any, field: str, *, minimum: float | None = None, maximum: float | None = None) -> float | None:
    if value is None:
        return None
    return require_number(value, field, minimum=minimum, maximum=maximum)


def require_integer(value: Any, field: str, *, minimum: int = 0, maximum: int | None = None) -> int:
    number = require_number(value, field, minimum=float(minimum), maximum=None if maximum is None else float(maximum))
    if not number.is_integer():
        raise InputError(f"{field} must be an integer")
    return int(number)


def normalize_date(value: Any, field: str) -> str:
    text = require_text(value, field)
    try:
        return date.fromisoformat(text).isoformat()
    except ValueError as error:
        raise InputError(f"{field} must use YYYY-MM-DD") from error


def normalize_datetime(value: Any, field: str) -> str:
    text = require_text(value, field)
    candidate = text[:-1] + "+00:00" if text.endswith("Z") else text
    try:
        parsed = datetime.fromisoformat(candidate)
    except ValueError as error:
        raise InputError(f"{field} must be an ISO-8601 datetime") from error
    if parsed.tzinfo is None:
        raise InputError(f"{field} must include a timezone")
    normalized = parsed.astimezone(timezone.utc).isoformat(timespec="seconds")
    return normalized.replace("+00:00", "Z")


_UNIT_MULTIPLIERS = {"ones": 1.0, "thousands": 1_000.0, "millions": 1_000_000.0, "billions": 1_000_000_000.0}


def normalize_unit(value: Any, field: str = "unit") -> tuple[str, float]:
    unit = require_text(value, field).lower()
    multiplier = _UNIT_MULTIPLIERS.get(unit)
    if multiplier is None:
        raise InputError(f"{field} must be one of: {', '.join(_UNIT_MULTIPLIERS)}")
    return unit, multiplier


def ratio(numerator: float | None, denominator: float | None) -> float | None:
    if numerator is None or denominator in (None, 0.0):
        return None
    return numerator / denominator


def canonical_bytes(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode("utf-8")


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def write_json_atomic(path: str | Path, value: Any, *, overwrite: bool = False) -> dict[str, str]:
    target = Path(path)
    if target.exists() and not overwrite:
        raise InputError(f"output already exists; pass --overwrite to replace it: {target}")
    target.parent.mkdir(parents=True, exist_ok=True)
    content = json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True, allow_nan=False) + "\n"
    data = content.encode("utf-8")
    descriptor, temporary_name = tempfile.mkstemp(prefix=f".{target.name}.", suffix=".tmp", dir=target.parent)
    try:
        with os.fdopen(descriptor, "wb") as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary_name, target)
    except Exception:
        try:
            os.unlink(temporary_name)
        except FileNotFoundError:
            pass
        raise
    return {"output": str(target), "sha256": sha256_bytes(data)}


def command_parser(description: str, commands: list[str]) -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument("command", choices=commands)
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--overwrite", action="store_true")
    return parser


def run_command(
    argv: list[str] | None,
    parser: argparse.ArgumentParser,
    handlers: dict[str, Callable[[dict[str, Any]], Any]],
) -> int:
    args = parser.parse_args(argv)
    try:
        payload = load_json(args.input)
        result = handlers[args.command](payload)
        receipt = write_json_atomic(args.output, result, overwrite=args.overwrite)
    except (InputError, OSError) as error:
        parser.exit(2, f"error: {error}\n")
    print(json.dumps(receipt, ensure_ascii=False, sort_keys=True))
    return 0

