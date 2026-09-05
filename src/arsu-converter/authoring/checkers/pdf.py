"""ResearchSpec-owned bounded PDF read preflight.

Offline adaptation of ARS v3.21.1 pdf_read_preflight.py (CC BY-NC 4.0).
The three page-count signals, page-tree cycle/node budget, parser warning
handling, trailing-EOF check, and encryption handling are retained. The
upstream classifier subprocess, CLI, diagnostics, timestamps, hashing, and
file writes are outside this pure payload module.
"""

from __future__ import annotations

import io
import logging
import re
from pathlib import Path
from typing import Any

try:
    import pypdf
except ImportError:  # pragma: no cover
    pypdf = None

PASS, FAIL, UNAVAILABLE = "PASS", "FAIL", "UNAVAILABLE"
NODE_BUDGET = 50_000
PDF_WHITESPACE = b"\x00\x09\x0a\x0c\x0d\x20"


class _WarningCollector(logging.Handler):
    def __init__(self) -> None:
        super().__init__(level=logging.WARNING)
        self.messages: list[str] = []

    def emit(self, record: logging.LogRecord) -> None:
        self.messages.append(record.getMessage())


class _TreeProblem(Exception):
    pass


def _kid_key(kid: Any) -> tuple[Any, ...]:
    reference = getattr(kid, "indirect_reference", None) or (
        kid if hasattr(kid, "idnum") else None
    )
    if reference is not None:
        return ("ref", reference.idnum, reference.generation)
    return ("id", id(kid))


def _walk_page_tree(node: Any, visited: set[tuple[Any, ...]]) -> int:
    count = 0
    stack = [node]
    while stack:
        if len(visited) > NODE_BUDGET:
            raise _TreeProblem("page-tree node budget exceeded")
        current = stack.pop()
        key = _kid_key(current)
        if key in visited:
            raise _TreeProblem("page-tree cycle detected")
        visited.add(key)
        obj = current.get_object() if hasattr(current, "get_object") else current
        node_type = str(obj.get("/Type", ""))
        if node_type == "/Page":
            count += 1
        elif node_type == "/Pages":
            stack.extend(obj.get("/Kids", []))
        else:
            raise _TreeProblem(f"unexpected page-tree node type {node_type or '(none)'}")
    return count


def _compute(path: Path) -> dict[str, Any]:
    result: dict[str, Any] = {
        "verdict": UNAVAILABLE,
        "declared_page_count": None,
        "enumerated_page_count": None,
        "reader_page_count": None,
        "warnings": [],
        "content_advisory": "not_checked",
    }
    try:
        data = path.read_bytes()
    except OSError as exc:
        result["warnings"].append(f"unreadable: {type(exc).__name__}")
        return result

    eof_at = data.rfind(b"%%EOF")
    trailing_ok = True
    if eof_at != -1 and data[eof_at + 5 :].translate(None, PDF_WHITESPACE):
        trailing_ok = False
        result["warnings"].append(
            f"trailing-data: {len(data) - (eof_at + 5)} bytes after final %%EOF"
        )
    if pypdf is None:
        result["warnings"].append("pypdf-not-installed")
        return result

    collector = _WarningCollector()
    logger = logging.getLogger("pypdf")
    logger.addHandler(collector)
    try:
        try:
            reader = pypdf.PdfReader(io.BytesIO(data))
        except Exception as exc:
            result["warnings"].append(f"parse-error: {type(exc).__name__}")
            return result
        if getattr(reader, "is_encrypted", False):
            result["warnings"].append("encrypted")
            return result
        try:
            root = reader.trailer["/Root"].get_object()
            pages_node = root["/Pages"]
            pages_obj = pages_node.get_object()
            raw_count = pages_obj["/Count"]
            if isinstance(raw_count, bool) or not isinstance(raw_count, int):
                result["warnings"].append("page-tree-unresolvable: count-not-integer")
                return result
            declared = int(raw_count)
        except Exception as exc:
            result["warnings"].append(f"page-tree-unresolvable: {type(exc).__name__}")
            return result
        result["declared_page_count"] = declared
        try:
            result["enumerated_page_count"] = _walk_page_tree(pages_node, set())
        except Exception as exc:
            result["warnings"].append(f"page-tree-walk: {type(exc).__name__}")
            return result
        try:
            result["reader_page_count"] = len(reader.pages)
        except Exception as exc:
            result["warnings"].append(f"reader-page-list: {type(exc).__name__}")
            return result

        # Preserve the upstream stale-xref object-coverage signal without
        # comparing file offsets or creating a digest contract.
        try:
            xref = getattr(reader, "xref", None)
            if isinstance(xref, dict) and xref:
                known: set[int] = set()
                for generation in xref.values():
                    if isinstance(generation, dict):
                        known.update(int(number) for number in generation)
                compressed = getattr(reader, "xref_objStm", None)
                if isinstance(compressed, dict):
                    known.update(int(number) for number in compressed)
                whitespace = rb"[\x00\t\n\x0c\r ]"
                separator = rb"(?:" + whitespace + rb"|%[^\r\n]*[\r\n])"
                number = rb"[+-]?0*\d{1,10}"
                object_numbers = {
                    int(match.group(1))
                    for match in re.finditer(
                        rb"(?:^|" + separator + rb")" + separator + rb"*("
                        + number + rb")" + separator + rb"+" + number
                        + separator + rb"+obj\b",
                        data,
                    )
                }
                orphaned = object_numbers - known
                if orphaned:
                    result["warnings"].append(
                        "xref-coverage: unreferenced object numbers present"
                    )
                    trailing_ok = False
        except Exception as exc:
            result["warnings"].append(f"xref-coverage-skipped: {type(exc).__name__}")
    finally:
        logger.removeHandler(collector)
        result["warnings"].extend(f"pypdf: {message}" for message in collector.messages)

    if not (
        result["declared_page_count"]
        == result["enumerated_page_count"]
        == result["reader_page_count"]
    ):
        result["verdict"] = FAIL
    elif result["declared_page_count"] <= 0:
        result["warnings"].append("empty-page-tree")
    elif collector.messages or not trailing_ok:
        pass
    else:
        result["verdict"] = PASS
    return result


def compute(inputs: dict[str, Path]) -> dict:
    """Return deterministic structural PDF findings for inputs['pdf_path']."""
    if not isinstance(inputs, dict):
        raise TypeError("inputs must be a dict")
    if "pdf_path" not in inputs:
        raise KeyError("inputs['pdf_path'] is required")
    return _compute(Path(inputs["pdf_path"]))
