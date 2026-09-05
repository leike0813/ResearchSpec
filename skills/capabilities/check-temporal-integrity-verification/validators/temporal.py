"""ResearchSpec-owned offline temporal-integrity computation.

This is a local, CC BY-NC 4.0 adaptation of the ARS v3.21.1 five-pass
temporal audit.  Its deterministic checks are retained, while the upstream
CLI, run identifiers, wall-clock values, network access, and report writes
are removed.
"""

from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:  # pragma: no cover
    yaml = None

DEICTIC_PATTERN = re.compile(
    r"\b(currently|now|at present|most recent|the latest|new(?:est)?|recently|"
    r"last\s+year|this\s+year|nowadays|presently|today|emerging|recent\s+cycle|"
    r"latest\s+available)\b", re.IGNORECASE
)
MONTH_NAMES = (
    "January|February|March|April|May|June|July|August|September|October|"
    "November|December"
)
DATE_REGEX = (
    r"\d{4}-\d{2}-\d{2}|(?:" + MONTH_NAMES + r")\s+\d{4}|(?:19|20)\d{2}"
)
PATTERN_A = re.compile(
    r"(?:as of|on|in|reported in|stated in|noted in)\s+(?P<anchor>"
    + DATE_REGEX
    + r").*?\b(?:had already|already|completed|finished|delivered)\b.*?"
    r"(?P<event>"
    + DATE_REGEX
    + r")", re.IGNORECASE | re.DOTALL
)
PATTERN_B = re.compile(
    r"(?P<event>"
    + DATE_REGEX
    + r").*?\b(?:will be|to be|scheduled for|forthcoming|upcoming|planned)\b.*?"
    r"(?:as of|in|by)\s+(?P<anchor>"
    + DATE_REGEX
    + r")", re.IGNORECASE | re.DOTALL
)
REF_MARKER_PATTERN = re.compile(r"<!--ref:([A-Za-z][A-Za-z0-9_:-]*)-->")
COMPARATOR_FORM_A = re.compile(
    r"(?P<adj>prior|previous|earlier|older|preceding)\s+"
    r"(?P<noun>edition|version|edition\s+\(\d{4}\)|version\s+\(\d{4}\))",
    re.IGNORECASE
)
COMPARATOR_FORM_B = re.compile(
    r"\b(?P<year>(?:19|20)\d{2})\s+"
    r"(?P<noun>edition|version|standard|handbook|guideline)\b", re.IGNORECASE
)
COMPARATOR_FORM_C = re.compile(
    r"(?P<noun>edition|version|standard)\s+(?:of|from)\s+"
    r"(?P<year>(?:19|20)\d{2})\b", re.IGNORECASE
)
CAUSAL_TRIGGERS = [
    (re.compile(r"\benabled\b", re.IGNORECASE), "left<right"),
    (re.compile(r"\bcaused\b", re.IGNORECASE), "left<right"),
    (re.compile(r"\bled\s+to\b", re.IGNORECASE), "left<right"),
    (re.compile(r"\bin\s+response\s+to\b", re.IGNORECASE), "left>right"),
    (re.compile(r"\bsuperseded\b", re.IGNORECASE), "left>right"),
    (re.compile(r"\bpreceded\b", re.IGNORECASE), "left<right"),
    (re.compile(r"\bfollowed\s+by\b", re.IGNORECASE), "left<right"),
    (re.compile(r"\bfollowed\b(?!\s+by)", re.IGNORECASE), "left>right"),
]
MONTH_TO_NUM = {
    name.lower(): f"{index + 1:02d}"
    for index, name in enumerate(MONTH_NAMES.split("|"))
}
LAST_DAY = {
    "01": "31", "02": "28", "03": "31", "04": "30", "05": "31",
    "06": "30", "07": "31", "08": "31", "09": "30", "10": "31",
    "11": "30", "12": "31",
}
KINDS = (
    "TEMPORAL-ARITHMETIC-IMPOSSIBLE",
    "TEMPORAL-ANACHRONISTIC-CITATION",
    "TEMPORAL-COMPARATOR-UNMATERIALIZED",
    "TEMPORAL-CAUSAL-INVERSION",
    "TEMPORAL-DEICTIC",
    "TEMPORAL-METADATA-MISSING",
)


def _date_to_interval(raw: str) -> tuple[str, str]:
    raw = raw.strip()
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", raw):
        date.fromisoformat(raw)
        return raw, raw
    interval = re.fullmatch(
        r"(\d{4}-\d{2}-\d{2})\.\.(\d{4}-\d{2}-\d{2})", raw
    )
    if interval:
        date.fromisoformat(interval.group(1))
        date.fromisoformat(interval.group(2))
        return interval.group(1), interval.group(2)
    month = re.fullmatch(r"(\d{4})-(\d{2})", raw)
    if month:
        year, number = month.groups()
        if number not in LAST_DAY:
            raise ValueError(f"invalid month: {raw}")
        return f"{year}-{number}-01", f"{year}-{number}-{LAST_DAY[number]}"
    prose = re.fullmatch(r"(" + MONTH_NAMES + r")\s+(\d{4})", raw, re.IGNORECASE)
    if prose:
        number = MONTH_TO_NUM[prose.group(1).lower()]
        year = prose.group(2)
        return f"{year}-{number}-01", f"{year}-{number}-{LAST_DAY[number]}"
    if re.fullmatch(r"(?:19|20)\d{2}", raw):
        return f"{raw}-01-01", f"{raw}-12-31"
    raise ValueError(f"unrecognized date format: {raw}")


def _date_diff_days(left: str, right: str) -> int:
    return (date.fromisoformat(left) - date.fromisoformat(right)).days


def _sentence_around(draft: str, char_pos: int) -> str:
    before = list(re.finditer(r"[.!?]\s+(?=\S)", draft[:char_pos]))
    start = before[-1].end() if before else 0
    after = re.search(r"[.!?](\s|$)", draft[char_pos:])
    end = char_pos + after.end() if after else len(draft)
    return draft[start:end].strip()


def _line(draft: str, pos: int) -> int:
    return draft[:max(0, pos)].count("\n") + 1


def _next_id(findings: list[dict[str, Any]]) -> int:
    values = []
    for finding in findings:
        value = finding.get("finding_id", "")
        if isinstance(value, str) and value.startswith("TF-"):
            try:
                values.append(int(value[3:]))
            except ValueError:
                pass
    return max(values, default=0) + 1


def _finding(
    draft: str,
    findings: list[dict[str, Any]],
    kind: str,
    severity: str,
    mode: int | None,
    block_eligible: bool,
    pos: int,
    *,
    sentence: str | None = None,
    matched_span: dict[str, Any] | None = None,
    bound_refs: list[dict[str, Any]] | None = None,
    bound_event: dict[str, Any] | None = None,
    bound_dates: dict[str, Any] | None = None,
    rationale: str,
    suggested_fix: str | None,
) -> None:
    findings.append({
        "finding_id": f"TF-{_next_id(findings):03d}",
        "finding_kind": kind,
        "severity": severity,
        "mode": mode,
        "block_eligible": block_eligible,
        "draft_locator": {
            "file": "phase4_composition/draft.md",
            "line": _line(draft, pos),
            "sentence": sentence if sentence is not None else _sentence_around(draft, pos),
        },
        "matched_span": matched_span,
        "bound_refs": bound_refs or [],
        "bound_event": bound_event,
        "bound_dates": bound_dates,
        "rationale": rationale,
        "suggested_fix": suggested_fix,
    })


def _metadata(
    draft: str,
    findings: list[dict[str, Any]],
    slug: str,
    pos: int,
    rationale: str,
) -> None:
    _finding(
        draft, findings, "TEMPORAL-METADATA-MISSING", "LOW", None, False, pos,
        bound_refs=[{"ref_slug": slug, "timeline_entry": None}],
        rationale=rationale, suggested_fix=None,
    )


def _pass_1(draft: str, findings: list[dict[str, Any]]) -> None:
    cursor = 0
    for sentence in re.split(r"(?<=[.!?])\s+", draft):
        start = draft.find(sentence, cursor)
        if start < 0:
            start = cursor
        cursor = start + len(sentence)
        violations = []
        match = PATTERN_A.search(sentence)
        if match:
            try:
                anchor_start, anchor_end = _date_to_interval(match.group("anchor"))
                event_start, event_end = _date_to_interval(match.group("event"))
                if event_start > anchor_end:
                    violations.append(("A", match.group("anchor"), match.group("event"),
                                       anchor_start, anchor_end, event_start, event_end))
            except ValueError:
                pass
        match = PATTERN_B.search(sentence)
        if match:
            try:
                anchor_start, anchor_end = _date_to_interval(match.group("anchor"))
                event_start, event_end = _date_to_interval(match.group("event"))
                if event_start <= anchor_end:
                    violations.append(("B", match.group("anchor"), match.group("event"),
                                       anchor_start, anchor_end, event_start, event_end))
            except ValueError:
                pass
        if not violations:
            continue
        violation = max(violations, key=lambda item: abs(_date_diff_days(item[5], item[4])))
        which, anchor_raw, event_raw, anchor_start, anchor_end, event_start, event_end = violation
        _finding(
            draft, findings, "TEMPORAL-ARITHMETIC-IMPOSSIBLE", "HIGH", 1, True, start,
            sentence=sentence.strip(),
            bound_dates={
                "left": {"role": "anchor", "value": f"{anchor_start}..{anchor_end}",
                         "source": "draft_capture", "ref_slug": None},
                "right": {"role": "event", "value": f"{event_start}..{event_end}",
                          "source": "draft_capture", "ref_slug": None},
            },
            rationale=(
                f"Pattern {which}: anchor '{anchor_raw}' ({anchor_start}..{anchor_end}) "
                f"{'before' if which == 'A' else 'after'} event '{event_raw}' "
                f"({event_start}..{event_end}); "
                + ("event has not yet occurred at anchor time"
                   if which == "A" else "forthcoming event already past at anchor time")
            ),
            suggested_fix="Restate the claim to match the anchor's true time horizon, or hedge.",
        )


def _confidence(slug: str, provenance: dict[str, Any]) -> str | None:
    for entry in provenance.get("entries", []):
        if isinstance(entry, dict) and entry.get("citation_key") == slug:
            value = entry.get("confidence")
            return value if isinstance(value, str) else None
    return None


def _pass_2(
    draft: str,
    timeline: dict[str, Any],
    provenance: dict[str, Any],
    findings: list[dict[str, Any]],
    *,
    timeline_available: bool,
    provenance_available: bool,
) -> None:
    sources = {
        source["citation_key"]: source
        for source in timeline.get("sources", [])
        if isinstance(source, dict) and isinstance(source.get("citation_key"), str)
    }
    for marker in REF_MARKER_PATTERN.finditer(draft):
        slug = marker.group(1)
        if not provenance_available:
            _metadata(draft, findings, slug, marker.start(),
                      "citation_provenance was not supplied; P2 arithmetic is not checked.")
            continue
        confidence = _confidence(slug, provenance)
        if confidence in {"low", "conflict"}:
            _metadata(draft, findings, slug, marker.start(),
                      f"citation_provenance confidence={confidence}; dates are not ground truth.")
            continue
        if not timeline_available:
            _metadata(draft, findings, slug, marker.start(),
                      "timeline was not supplied; P2 arithmetic is not checked.")
            continue
        source = sources.get(slug)
        if source is None:
            _metadata(draft, findings, slug, marker.start(),
                      f"<!--ref:{slug}--> has no entry in timeline.yaml.")
            continue
        effective = source.get("effective_date_range")
        if not isinstance(effective, dict):
            _metadata(draft, findings, slug, marker.start(),
                      f"{slug} has no effective_date_range.")
            continue
        start = effective.get("start")
        if not isinstance(start, dict):
            start = {}
        start_provenance = start.get("provenance")
        start_confidence = (
            start_provenance.get("confidence")
            if isinstance(start_provenance, dict) else None
        )
        if start.get("value") is None or start_confidence in {"unverified", "low"}:
            _metadata(draft, findings, slug, marker.start(),
                      f"{slug} effective_date_range.start is absent or unverified.")
            continue
        window_start = max(0, marker.start() - 200)
        window_end = min(len(draft), marker.end() + 200)
        window = draft[window_start:window_end]
        marker_start = marker.start() - window_start
        marker_end = marker.end() - window_start
        event_dates = [
            item for item in re.finditer(DATE_REGEX, window, re.IGNORECASE)
            if item.end() <= marker_start or item.start() >= marker_end
        ]
        if not event_dates:
            continue
        event_match = min(event_dates, key=lambda item: abs(item.start() - marker_start))
        event_raw = event_match.group(0)
        try:
            event_start, event_end = _date_to_interval(event_raw)
            effective_start, _ = _date_to_interval(str(start["value"]))
        except ValueError:
            continue
        if effective_start > event_end:
            _finding(
                draft, findings, "TEMPORAL-ANACHRONISTIC-CITATION", "HIGH", 2, True,
                marker.start(), bound_refs=[{"ref_slug": slug, "timeline_entry": slug}],
                bound_event={"event_id": None, "date": f"{event_start}..{event_end}"},
                rationale=(
                    f"{slug} starts {start['value']}, after cited event {event_raw} "
                    f"({event_start}..{event_end}). Cited version postdates the event."
                ),
                suggested_fix=f"Cite the version in effect during {event_raw}.",
            )
        end = effective.get("end")
        if not isinstance(end, dict):
            end = {}
        end_provenance = end.get("provenance")
        end_confidence = (
            end_provenance.get("confidence")
            if isinstance(end_provenance, dict) else None
        )
        if not end.get("open_ended") and end.get("value") is not None and end_confidence in {"high", "medium"}:
            try:
                _, effective_end = _date_to_interval(str(end["value"]))
            except ValueError:
                continue
            if effective_end < event_start:
                _finding(
                    draft, findings, "TEMPORAL-ANACHRONISTIC-CITATION", "HIGH", 2, True,
                    marker.start(), bound_refs=[{"ref_slug": slug, "timeline_entry": slug}],
                    bound_event={"event_id": None, "date": f"{event_start}..{event_end}"},
                    rationale=(
                        f"{slug} ended {end['value']}, before cited event {event_raw} "
                        f"({event_start}..{event_end}). Cited version was superseded."
                    ),
                    suggested_fix=f"Cite the version in effect during {event_raw}.",
                )


def _pass_3(
    draft: str,
    timeline: dict[str, Any],
    findings: list[dict[str, Any]],
    *,
    timeline_available: bool,
) -> None:
    if not timeline_available:
        return
    sources = [item for item in timeline.get("sources", []) if isinstance(item, dict)]
    by_key = {
        item["citation_key"]: item for item in sources
        if isinstance(item.get("citation_key"), str)
    }
    by_family: dict[str, list[dict[str, Any]]] = {}
    for item in sources:
        family = item.get("version_family_id")
        if isinstance(family, str) and family:
            by_family.setdefault(family, []).append(item)
    cursor = 0
    for sentence in re.split(r"(?<=[.!?])\s+", draft):
        start = draft.find(sentence, cursor)
        if start < 0:
            start = cursor
        cursor = start + len(sentence)
        for form, pattern in (("A", COMPARATOR_FORM_A), ("B", COMPARATOR_FORM_B), ("C", COMPARATOR_FORM_C)):
            for match in pattern.finditer(sentence):
                refs = REF_MARKER_PATTERN.findall(sentence)
                if not refs:
                    continue
                slug = refs[0]
                source = by_key.get(slug)
                family = source.get("version_family_id") if source else None
                if not family:
                    continue
                if form == "A":
                    year_match = re.search(
                        r"\b(?:19|20)\d{2}\b",
                        sentence[max(0, match.start() - 60):min(len(sentence), match.end() + 60)],
                    )
                    if not year_match:
                        continue
                    year = year_match.group(0)
                else:
                    year = match.group("year")
                if any(
                    isinstance(item.get("published_date"), dict)
                    and year in str(item["published_date"].get("value", ""))
                    for item in by_family.get(family, [])
                ):
                    continue
                _finding(
                    draft, findings, "TEMPORAL-COMPARATOR-UNMATERIALIZED", "MEDIUM",
                    3, False, start + match.start(), sentence=sentence.strip(),
                    matched_span={
                        "text": match.group(0),
                        "char_start": start + match.start(),
                        "char_end": start + match.end(),
                    },
                    bound_refs=[{"ref_slug": slug, "timeline_entry": slug}],
                    rationale=(
                        f"Comparator '{match.group(0)}' (Form {form}, year={year}) "
                        f"has no materialized entry in version family '{family}'."
                    ),
                    suggested_fix=f"Add the {year} version to the timeline or remove the comparison.",
                )


def _pass_4(
    draft: str,
    timeline: dict[str, Any],
    provenance: dict[str, Any],
    findings: list[dict[str, Any]],
    *,
    timeline_available: bool,
    provenance_available: bool,
) -> None:
    sources = {
        item["citation_key"]: item for item in timeline.get("sources", [])
        if isinstance(item, dict) and isinstance(item.get("citation_key"), str)
    }
    date_pattern = re.compile(DATE_REGEX, re.IGNORECASE)
    cursor = 0
    for sentence in re.split(r"(?<=[.!?])\s+", draft):
        start = draft.find(sentence, cursor)
        if start < 0:
            start = cursor
        cursor = start + len(sentence)
        for trigger_pattern, ordering in CAUSAL_TRIGGERS:
            trigger = trigger_pattern.search(sentence)
            if not trigger:
                continue
            pre, post = sentence[:trigger.start()], sentence[trigger.end():]
            left_refs = list(REF_MARKER_PATTERN.finditer(pre))
            right_refs = list(REF_MARKER_PATTERN.finditer(post))
            left_slug = left_refs[-1].group(1) if left_refs else None
            right_slug = right_refs[0].group(1) if right_refs else None
            left_date = None if left_slug else (list(date_pattern.finditer(pre))[-1].group(0) if list(date_pattern.finditer(pre)) else None)
            right_date = None if right_slug else (list(date_pattern.finditer(post))[0].group(0) if list(date_pattern.finditer(post)) else None)
            if not (left_slug or left_date) or not (right_slug or right_date):
                continue
            unavailable = False
            for slug in (left_slug, right_slug):
                if not slug:
                    continue
                if not provenance_available:
                    _metadata(draft, findings, slug, start + trigger.start(),
                              "citation_provenance was not supplied; P4 reference arithmetic is not checked.")
                    unavailable = True
                elif _confidence(slug, provenance) in {"low", "conflict"}:
                    _metadata(draft, findings, slug, start + trigger.start(),
                              f"citation_provenance confidence={_confidence(slug, provenance)}; P4 dates are not ground truth.")
                    unavailable = True
            if not timeline_available and (left_slug or right_slug):
                for slug in (left_slug, right_slug):
                    if slug:
                        _metadata(draft, findings, slug, start + trigger.start(),
                                  "timeline was not supplied; P4 reference arithmetic is not checked.")
                unavailable = True
            if unavailable:
                continue
            def resolve(slug: str | None, raw: str | None) -> tuple[str, str] | None:
                if slug:
                    source = sources.get(slug)
                    published = source.get("published_date") if source else None
                    value = published.get("value") if isinstance(published, dict) else None
                    if value is None:
                        return None
                    raw = str(value)
                if raw is None:
                    return None
                try:
                    return _date_to_interval(raw)[0], "timeline_ref" if slug else "draft_capture"
                except ValueError:
                    return None
            left = resolve(left_slug, left_date)
            right = resolve(right_slug, right_date)
            if left is None or right is None:
                continue
            violated = (ordering == "left<right" and left[0] >= right[0]) or (ordering == "left>right" and left[0] <= right[0])
            if not violated:
                continue
            refs = []
            if left_slug:
                refs.append({"ref_slug": left_slug, "timeline_entry": left_slug})
            if right_slug:
                refs.append({"ref_slug": right_slug, "timeline_entry": right_slug})
            _finding(
                draft, findings, "TEMPORAL-CAUSAL-INVERSION", "MEDIUM", 4, False,
                start + trigger.start(), sentence=sentence.strip(),
                matched_span={
                    "text": trigger.group(0),
                    "char_start": start + trigger.start(),
                    "char_end": start + trigger.end(),
                },
                bound_refs=refs,
                bound_dates={
                    "left": {"role": "left_arg", "value": left[0],
                             "source": left[1], "ref_slug": left_slug},
                    "right": {"role": "right_arg", "value": right[0],
                              "source": right[1], "ref_slug": right_slug},
                },
                rationale=f"Trigger '{trigger.group(0)}' requires {ordering}, but the captured dates violate it.",
                suggested_fix="Rewrite to match the actual ordering, or revise the causal claim.",
            )
            break


def _pass_5(draft: str, findings: list[dict[str, Any]]) -> None:
    lines = draft.splitlines(keepends=True)
    for match in DEICTIC_PATTERN.finditer(draft):
        line_number = _line(draft, match.start())
        _finding(
            draft, findings, "TEMPORAL-DEICTIC", "LOW", 5, False, match.start(),
            sentence=lines[line_number - 1].rstrip("\n") if line_number <= len(lines) else "",
            matched_span={
                "text": match.group(0),
                "char_start": match.start(),
                "char_end": match.end(),
            },
            rationale=f"Deictic phrase '{match.group(0)}' anchors a claim to writing time.",
            suggested_fix="Replace it with an explicit date or edition/year reference.",
        )


def _load_optional(inputs: dict[str, Path], key: str) -> tuple[dict[str, Any] | None, str]:
    if key not in inputs:
        return None, "not_supplied"
    try:
        path = Path(inputs[key])
        text = path.read_text(encoding="utf-8")
        if path.suffix.lower() == ".json":
            value = json.loads(text)
        elif path.suffix.lower() in {".yaml", ".yml"}:
            if yaml is None:
                return None, "yaml_parser_unavailable"
            value = yaml.safe_load(text)
        else:
            try:
                value = json.loads(text)
            except json.JSONDecodeError:
                if yaml is None:
                    return None, "yaml_parser_unavailable"
                value = yaml.safe_load(text)
    except (OSError, TypeError, ValueError):
        return None, "unavailable_or_invalid"
    return (value, "available") if isinstance(value, dict) else (None, "invalid_document")


def compute(inputs: dict[str, Path]) -> dict:
    """Compute the temporal payload from local selected paths."""
    if not isinstance(inputs, dict):
        raise TypeError("inputs must be a dict")
    if "manuscript_draft" not in inputs:
        raise KeyError("inputs['manuscript_draft'] is required")
    draft = Path(inputs["manuscript_draft"]).read_text(encoding="utf-8")
    timeline, timeline_state = _load_optional(inputs, "timeline")
    provenance, provenance_state = _load_optional(inputs, "citation_provenance")
    timeline_data = timeline or {}
    provenance_data = provenance or {}
    findings: list[dict[str, Any]] = []
    _pass_1(draft, findings)
    _pass_2(
        draft, timeline_data, provenance_data, findings,
        timeline_available=timeline_state == "available",
        provenance_available=provenance_state == "available",
    )
    _pass_3(
        draft, timeline_data, findings,
        timeline_available=timeline_state == "available",
    )
    _pass_4(
        draft, timeline_data, provenance_data, findings,
        timeline_available=timeline_state == "available",
        provenance_available=provenance_state == "available",
    )
    _pass_5(draft, findings)
    by_kind = {kind: 0 for kind in KINDS}
    for finding in findings:
        by_kind[finding["finding_kind"]] += 1
    violation_count = sum(
        count for kind, count in by_kind.items()
        if kind != "TEMPORAL-METADATA-MISSING"
    )
    not_checked = []
    if timeline_state != "available":
        not_checked.append({"input": "timeline", "state": timeline_state, "passes": ["P2", "P3", "P4"]})
    if provenance_state != "available":
        not_checked.append({"input": "citation_provenance", "state": provenance_state, "passes": ["P2", "P4"]})
    has_metadata_gap = by_kind["TEMPORAL-METADATA-MISSING"] > 0
    verdict = (
        "FAIL"
        if violation_count
        else "NOT_CHECKED"
        if not_checked or has_metadata_gap
        else "PASS"
    )
    return {
        "verdict": verdict,
        "scope": "five-pass-temporal-integrity",
        "counts": {"findings": len(findings), "by_kind": by_kind},
        "not_checked": not_checked,
        "findings": findings,
    }
