"""Shared filesystem, JSON, and identity helpers for SR screening tools.

ResearchSpec-authored adapter, CC BY-NC 4.0.  Derived from ARS
sr-screener v3.24.4 data-handling behavior; no upstream module is imported.
"""
from __future__ import annotations

from contextlib import contextmanager
import csv
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import sys


TOOL = "researchspec-sr-screening"
VERSION = "1.0.0"
UPSTREAM = "ARS sr-screener v3.24.4"
SCHEMA = "researchspec.sr-screening/v1"


class ScreeningError(Exception):
    """An input or workflow state cannot be changed safely."""


def strict_json(text):
    def pairs(items):
        result = {}
        for key, value in items:
            if key in result:
                raise ValueError("duplicate JSON key: " + key)
            result[key] = value
        return result

    def constant(value):
        raise ValueError("non-finite JSON number: " + value)

    return json.loads(text, object_pairs_hook=pairs, parse_constant=constant)


def load_json(path, default=None):
    path = Path(path)
    if not path.exists():
        return default
    try:
        return strict_json(read_text(path))
    except (OSError, ValueError) as exc:
        raise ScreeningError(f"invalid JSON in {path}: {exc}") from exc


def read_text(path):
    path = Path(path)
    try:
        raw = path.read_bytes()
    except OSError as exc:
        raise ScreeningError(f"cannot read {path}: {exc}") from exc
    if raw[:2] in (b"\xff\xfe", b"\xfe\xff"):
        text = raw.decode("utf-16")
    else:
        try:
            text = raw.decode("utf-8-sig")
        except UnicodeDecodeError:
            text = raw.decode("cp1252", errors="replace")
    return text.replace("\r\n", "\n").replace("\r", "\n")


def canonical(value):
    return json.dumps(value, ensure_ascii=True, sort_keys=True, separators=(",", ":"), allow_nan=False)


def digest(value):
    return hashlib.sha256(canonical(value).encode("utf-8")).hexdigest()


def file_sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def atomic_write_text(path, text):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + ".tmp")
    temporary.write_text(text, encoding="utf-8", newline="\n")
    os.replace(temporary, path)


def save_json(path, value, indent=1):
    text = json.dumps(value, ensure_ascii=False, sort_keys=True, indent=indent, allow_nan=False) + "\n"
    atomic_write_text(path, text)


def csv_text(value):
    """Keep imported text inert when a spreadsheet reads an exported CSV."""
    if not isinstance(value, str):
        return value
    value = value.replace("\x00", "")
    armed = False
    chars = []
    for char in value:
        if armed and char in "=+-@":
            chars.append("'")
        if char in ";\t\r\n":
            armed = True
        elif char not in "\"'" and not char.isspace():
            armed = False
        chars.append(char)
    value = "".join(chars)
    if value.startswith(("=", "+", "-", "@", "\t", "\r")):
        return "'" + value
    return value


def write_csv(path, fieldnames, rows):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + ".tmp")
    with temporary.open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=fieldnames, quoting=csv.QUOTE_ALL)
        writer.writeheader()
        for row in rows:
            writer.writerow({key: csv_text(row.get(key, "")) for key in fieldnames})
    os.replace(temporary, path)


def absolute(path):
    return str(Path(path).expanduser().resolve())


def utc_now():
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


@contextmanager
def workspace_lock(work):
    """Serialize mutations in one work folder without introducing a daemon."""
    work = Path(work)
    work.mkdir(parents=True, exist_ok=True)
    lock_path = work / ".sr-screening.lock"
    stream = lock_path.open("a+")
    try:
        try:
            import fcntl
            fcntl.flock(stream.fileno(), fcntl.LOCK_EX)
        except ImportError as exc:
            stream.close()
            raise ScreeningError("workspace locking is unavailable on this platform") from exc
        yield
    finally:
        try:
            import fcntl
            fcntl.flock(stream.fileno(), fcntl.LOCK_UN)
        except ImportError:
            pass
        stream.close()


def print_json(value, stream=None):
    stream = stream or sys.stdout
    stream.write(json.dumps(value, ensure_ascii=False, sort_keys=True, indent=1) + "\n")
