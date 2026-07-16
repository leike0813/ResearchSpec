#!/usr/bin/env python3
"""Deterministic event record preparation and ranking."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
import sys
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))

from financial_support import (  # noqa: E402
    InputError,
    command_parser,
    normalize_date,
    normalize_datetime,
    optional_number,
    optional_text,
    require_list,
    require_number,
    require_object,
    require_text,
    run_command,
)


def prepare(payload: dict[str, Any]) -> dict[str, Any]:
    as_of = normalize_datetime(payload.get("as_of"), "as_of")
    events = require_list(payload.get("events"), "events")
    retained: list[dict[str, Any]] = []
    duplicates: list[dict[str, str]] = []
    fingerprints: dict[str, str] = {}
    for index, raw in enumerate(events):
        item = require_object(raw, f"events[{index}]")
        source = require_text(item.get("source"), f"events[{index}].source")
        title = require_text(item.get("title"), f"events[{index}].title")
        published_at = normalize_datetime(item.get("published_at"), f"events[{index}].published_at")
        event_date = None if item.get("event_date") is None else normalize_date(item.get("event_date"), f"events[{index}].event_date")
        summary = optional_text(item.get("summary"), f"events[{index}].summary")
        url = optional_text(item.get("url"), f"events[{index}].url")
        fingerprint_value = json.dumps([source.casefold(), title.casefold(), event_date, published_at], ensure_ascii=False, separators=(",", ":"))
        fingerprint = hashlib.sha256(fingerprint_value.encode("utf-8")).hexdigest()
        event_id = f"event-{fingerprint[:16]}"
        duplicate_of = optional_text(item.get("duplicate_of"), f"events[{index}].duplicate_of")
        exact = fingerprints.get(fingerprint)
        if duplicate_of is not None or exact is not None:
            duplicates.append({"event_id": event_id, "duplicate_of": duplicate_of or exact or ""})
            continue
        fingerprints[fingerprint] = event_id
        retained.append({
            "event_id": event_id,
            "source": source,
            "published_at": published_at,
            "event_date": event_date,
            "title": title,
            "summary": summary,
            "url": url,
        })
    retained.sort(key=lambda item: (item["event_date"] or item["published_at"], item["published_at"], item["event_id"]))
    duplicates.sort(key=lambda item: (item["duplicate_of"], item["event_id"]))
    return {"command": "prepare", "as_of": as_of, "events": retained, "duplicates": duplicates}


def rank(payload: dict[str, Any]) -> dict[str, Any]:
    assessments = require_list(payload.get("assessments"), "assessments")
    ranked: list[dict[str, Any]] = []
    seen: set[str] = set()
    for index, raw in enumerate(assessments):
        item = require_object(raw, f"assessments[{index}]")
        event_id = require_text(item.get("event_id"), f"assessments[{index}].event_id")
        if event_id in seen:
            raise InputError(f"assessments[{index}].event_id is duplicated: {event_id}")
        seen.add(event_id)
        probability = require_number(item.get("probability"), f"assessments[{index}].probability", minimum=0.0, maximum=1.0)
        impact = require_number(item.get("impact"), f"assessments[{index}].impact", minimum=0.0, maximum=1.0)
        confidence = require_number(item.get("confidence"), f"assessments[{index}].confidence", minimum=0.0, maximum=1.0)
        sentiment = optional_number(item.get("sentiment"), f"assessments[{index}].sentiment", minimum=-1.0, maximum=1.0)
        rationale = require_text(item.get("rationale"), f"assessments[{index}].rationale")
        ranked.append({
            "event_id": event_id,
            "probability": probability,
            "impact": impact,
            "confidence": confidence,
            "sentiment": sentiment,
            "rationale": rationale,
            "priority_score": probability * impact * confidence,
        })
    ranked.sort(key=lambda item: (-item["priority_score"], item["event_id"]))
    return {"command": "rank", "ranking": ranked, "score_formula": "probability * impact * confidence", "semantic_scores": "agent-supplied"}


def main(argv: list[str] | None = None) -> int:
    parser = command_parser("Financial event preparation and ranking", ["prepare", "rank"])
    return run_command(argv, parser, {"prepare": prepare, "rank": rank})


if __name__ == "__main__":
    raise SystemExit(main())

