"""Offline ARSU citation checks.

ResearchSpec-authored adapter, CC BY-NC 4.0.  The narrowed citation verdict
is derived from ``vendor/ars/scripts/citation_verification_summary.py`` and
the preprint/resolver signal rules are derived from
``vendor/ars/scripts/contamination_signals.py``.  Those upstream modules are
attribution sources only: this module never imports or executes them, contacts
an index, or fills a missing observation.

Input contract
==============

Each public function receives the runner's ``dict[str, Path]`` and reads its
role from a JSON or YAML file.  A literature file is either a top-level array
of entries or an object with exactly one of these arrays: ``entries`` or
``literature_corpus``.  Every entry needs a non-empty ``citation_key``;
``title``, ``authors``, ``year``, ``venue``, and ``source_pointer`` are kept
as supplied when present.  Resolver observations, when supplied, are an
object keyed by the closed resolver set ``crossref``, ``openalex``,
``semantic_scholar``, and ``arxiv``.  Each observation needs a ``status`` in
``matched``, ``unmatched``, ``unreachable``, or ``skipped`` and an explicit
``queried_by``: ``id`` or ``title`` for a query, and ``null`` for
``unreachable`` or ``skipped``.  A missing or empty observations object means
that no resolver was run and is reported as ``unresolvable`` / ``not_checked``.

``compute_summary`` reads the existence report produced by this module.  It
accepts the runner envelope (whose payload is under ``result``) or the bare
payload.  ``compute_contamination`` reads the same literature entry shape.
All returned values are JSON-compatible deterministic data; no timestamp,
network result, model judgment, style heuristic, or terminal-policy decision
is introduced here.
"""

from __future__ import annotations

from copy import deepcopy
import json
from pathlib import Path
from typing import Any, Mapping


RESOLVERS = ("crossref", "openalex", "semantic_scholar", "arxiv")
RESOLVER_SET = frozenset(RESOLVERS)
RESOLVER_STATUSES = frozenset({"matched", "unmatched", "unreachable", "skipped"})
QUERIED_BY = frozenset({"id", "title"})
LOOKUP_VERDICTS = frozenset({"true", "false", "unresolvable"})

# The closed list and pointer hints are the deterministic v3.7.3 rule.  Keep
# the values local so the generated checker remains standalone.
PREPRINT_VENUES = frozenset(
    {
        "arXiv",
        "bioRxiv",
        "medRxiv",
        "SSRN",
        "Research Square",
        "Preprints.org",
        "ChemRxiv",
        "EarthArXiv",
        "OSF Preprints",
        "TechRxiv",
    }
)
POINTER_VENUE_HINTS = (
    ("arxiv.org", "arXiv"),
    ("biorxiv.org", "bioRxiv"),
    ("medrxiv.org", "medRxiv"),
    ("papers.ssrn.com", "SSRN"),
    ("ssrn.com", "SSRN"),
    ("researchsquare.com", "Research Square"),
    ("preprints.org", "Preprints.org"),
    ("chemrxiv.org", "ChemRxiv"),
    ("eartharxiv.org", "EarthArXiv"),
    ("osf.io/preprints", "OSF Preprints"),
    ("techrxiv.org", "TechRxiv"),
)


def _duplicate_free_object(pairs: list[tuple[Any, Any]]) -> dict[Any, Any]:
    """JSON object hook that makes duplicate keys an input error."""

    result: dict[Any, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate object key: {key!r}")
        result[key] = value
    return result


def _load_yaml(text: str) -> Any:
    """Load YAML while rejecting duplicate mapping keys."""

    try:
        import yaml
    except ImportError as exc:  # pragma: no cover - deployment error
        raise ValueError("YAML input requires the checker YAML dependency") from exc

    class UniqueLoader(yaml.SafeLoader):
        pass

    def construct_mapping(loader: Any, node: Any, deep: bool = False) -> dict[Any, Any]:
        loader.flatten_mapping(node)
        mapping: dict[Any, Any] = {}
        for key_node, value_node in node.value:
            key = loader.construct_object(key_node, deep=deep)
            try:
                duplicate = key in mapping
            except TypeError as exc:
                raise ValueError("YAML mapping key is not hashable") from exc
            if duplicate:
                raise ValueError(f"Duplicate object key: {key!r}")
            mapping[key] = loader.construct_object(value_node, deep=deep)
        return mapping

    UniqueLoader.add_constructor(
        yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, construct_mapping
    )
    try:
        return yaml.load(text, Loader=UniqueLoader)
    except ValueError:
        raise
    except Exception as exc:
        raise ValueError(f"Invalid YAML input: {exc}") from exc


def _load(path: Any, role: str) -> Any:
    if not isinstance(path, Path):
        raise ValueError(f"{role} must be a pathlib.Path")
    if not path.is_file():
        raise ValueError(f"{role} must point to a file: {path}")
    try:
        text = path.read_text(encoding="utf-8")
    except OSError as exc:
        raise ValueError(f"Unable to read {role}: {exc}") from exc
    try:
        if path.suffix.lower() == ".json":
            return json.loads(text, object_pairs_hook=_duplicate_free_object)
        return _load_yaml(text)
    except ValueError:
        raise
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON input for {role}: {exc}") from exc
    except Exception as exc:
        raise ValueError(f"Invalid JSON/YAML input for {role}: {exc}") from exc


def _read_role(inputs: dict[str, Path], role: str) -> Any:
    if not isinstance(inputs, dict) or role not in inputs:
        raise ValueError(f"Missing required input role: {role}")
    return _load(inputs[role], role)


def _entries(document: Any) -> list[Mapping[str, Any]]:
    """Return the explicitly supported literature-entry array."""

    if isinstance(document, list):
        raw_entries = document
    elif isinstance(document, Mapping):
        present = [key for key in ("entries", "literature_corpus") if key in document]
        if len(present) != 1:
            raise ValueError(
                "Literature document must contain exactly one of "
                "'entries' or 'literature_corpus'"
            )
        raw_entries = document[present[0]]
    else:
        raise ValueError("Literature document must be an array or an entries object")

    if not isinstance(raw_entries, list):
        raise ValueError("Literature entries must be an array")
    return raw_entries


def _validate_signal_fields(entry: Mapping[str, Any], citation_key: str) -> None:
    if "bibliographic_integrity_signals" in entry:
        signals = entry["bibliographic_integrity_signals"]
        if not isinstance(signals, list):
            raise ValueError(
                f"bibliographic_integrity_signals must be an array for {citation_key!r}"
            )
        for signal in signals:
            if not isinstance(signal, Mapping):
                raise ValueError(
                    f"bibliographic_integrity_signals contains a non-object for {citation_key!r}"
                )
            if "signal_type" in signal and not isinstance(signal["signal_type"], str):
                raise ValueError(f"Invalid signal_type for {citation_key!r}")

    if "contamination_signal_omissions" in entry:
        omissions = entry["contamination_signal_omissions"]
        if not isinstance(omissions, Mapping):
            raise ValueError(
                f"contamination_signal_omissions must be an object for {citation_key!r}"
            )
        for key, value in omissions.items():
            if not isinstance(key, str) or not key.strip() or not isinstance(value, str):
                raise ValueError(f"Invalid contamination omission for {citation_key!r}")


def _validate_entry(raw: Any, index: int, seen: set[str]) -> Mapping[str, Any]:
    if not isinstance(raw, Mapping):
        raise ValueError(f"Literature entry {index} must be an object")
    citation_key = raw.get("citation_key")
    if not isinstance(citation_key, str) or not citation_key.strip():
        raise ValueError(f"Literature entry {index} needs a non-empty citation_key")
    if citation_key in seen:
        raise ValueError(f"Duplicate citation_key: {citation_key}")
    seen.add(citation_key)

    for field in ("title", "source_pointer", "venue", "obtained_via"):
        if field in raw and raw[field] is not None and not isinstance(raw[field], str):
            raise ValueError(f"{field} must be a string for {citation_key!r}")
    if "year" in raw and raw["year"] is not None and type(raw["year"]) is not int:
        raise ValueError(f"year must be an integer for {citation_key!r}")
    if "authors" in raw and raw["authors"] is not None and not isinstance(raw["authors"], list):
        raise ValueError(f"authors must be an array for {citation_key!r}")

    _validate_signal_fields(raw, citation_key)
    return raw


def _validated_entries(document: Any) -> list[Mapping[str, Any]]:
    seen: set[str] = set()
    return [_validate_entry(raw, index, seen) for index, raw in enumerate(_entries(document))]


def _resolver_outcomes(entry: Mapping[str, Any]) -> dict[str, dict[str, Any]]:
    """Validate and copy only explicitly supplied resolver observations."""

    raw = entry.get("resolver_outcomes")
    if raw is None:
        return {}
    if not isinstance(raw, Mapping):
        raise ValueError(
            f"resolver_outcomes must be an object for {entry['citation_key']!r}"
        )

    outcomes: dict[str, dict[str, Any]] = {}
    for resolver, outcome in raw.items():
        if not isinstance(resolver, str) or resolver not in RESOLVER_SET:
            raise ValueError(f"Unknown resolver {resolver!r} for {entry['citation_key']!r}")
        if not isinstance(outcome, Mapping):
            raise ValueError(
                f"Resolver outcome {resolver!r} must be an object for {entry['citation_key']!r}"
            )
        status = outcome.get("status")
        if not isinstance(status, str) or status not in RESOLVER_STATUSES:
            raise ValueError(
                f"Invalid resolver status {status!r} for {entry['citation_key']!r}/{resolver}"
            )
        if "queried_by" not in outcome:
            raise ValueError(
                f"Resolver outcome {resolver!r} must declare queried_by for "
                f"{entry['citation_key']!r}"
            )
        queried_by = outcome["queried_by"]
        if status in {"matched", "unmatched"} and (
            not isinstance(queried_by, str) or queried_by not in QUERIED_BY
        ):
            raise ValueError(
                f"A {status} resolver outcome needs queried_by id or title for "
                f"{entry['citation_key']!r}/{resolver}"
            )
        if status in {"skipped", "unreachable"} and queried_by is not None:
            raise ValueError(
                f"A {status} resolver outcome needs queried_by null for "
                f"{entry['citation_key']!r}/{resolver}"
            )
        if "response_summary" in outcome and outcome["response_summary"] is not None and not isinstance(outcome["response_summary"], str):
            raise ValueError(
                f"response_summary must be a string or null for {entry['citation_key']!r}/{resolver}"
            )
        outcomes[resolver] = deepcopy(dict(outcome))
    return outcomes


def _reduce_lookup_verified(outcomes: Mapping[str, Mapping[str, Any]]) -> str:
    """Implement ARS C-V6(a): matched wins, then only ID negatives are false."""

    if not outcomes:
        return "unresolvable"
    if any(outcome.get("status") == "matched" for outcome in outcomes.values()):
        return "true"
    if any(
        outcome.get("status") == "unmatched"
        and outcome.get("queried_by") == "id"
        for outcome in outcomes.values()
    ):
        return "false"
    return "unresolvable"


def _check_status(outcomes: Mapping[str, Mapping[str, Any]]) -> str:
    if not outcomes:
        return "not_checked"
    if any(outcome.get("status") == "unreachable" for outcome in outcomes.values()):
        return "degraded"
    return "checked"


def _counts(rows: list[Mapping[str, Any]]) -> dict[str, int]:
    counts = {
        "total": len(rows),
        "true": 0,
        "false": 0,
        "unresolvable": 0,
        "not_checked": 0,
    }
    for row in rows:
        verdict = row.get("lookup_verified")
        if verdict not in LOOKUP_VERDICTS:
            raise ValueError(f"Invalid citation lookup status: {verdict!r}")
        counts[verdict] += 1
        if row.get("check_status") == "not_checked":
            counts["not_checked"] += 1
    return counts


def _resolver_status_counts(rows: list[Mapping[str, Any]]) -> dict[str, dict[str, int]]:
    result = {
        resolver: {status: 0 for status in (*RESOLVER_STATUSES, "not_checked")}
        for resolver in RESOLVERS
    }
    for row in rows:
        outcomes = row.get("resolver_outcomes") or {}
        for resolver in RESOLVERS:
            if resolver not in outcomes:
                result[resolver]["not_checked"] += 1
            else:
                result[resolver][outcomes[resolver]["status"]] += 1
    return result


def _retraction_advisories(entry: Mapping[str, Any]) -> list[dict[str, Any]]:
    """Copy only canonical retraction-status signals; never infer from legacy flags."""

    result: list[dict[str, Any]] = []
    signals = entry.get("bibliographic_integrity_signals") or []
    for signal in signals:
        if signal.get("signal_type") != "retraction_status":
            continue
        advisory = deepcopy(dict(signal))
        signal_key = advisory.get("citation_key")
        if signal_key is not None and signal_key != entry["citation_key"]:
            raise ValueError(
                f"Retraction signal citation_key does not match {entry['citation_key']!r}"
            )
        advisory["citation_key"] = entry["citation_key"]
        result.append(advisory)
    return result


def _existence_row(entry: Mapping[str, Any]) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    outcomes = _resolver_outcomes(entry)
    verdict = _reduce_lookup_verified(outcomes)
    row = {
        "citation_key": entry["citation_key"],
        "lookup_verified": verdict,
        "status": verdict,
        "check_status": _check_status(outcomes),
        "resolver_outcomes": outcomes,
    }
    return row, _retraction_advisories(entry)


def compute_existence(inputs: dict[str, Path]) -> dict[str, Any]:
    """Reduce supplied resolver observations into citation-existence findings."""

    entries = _validated_entries(_read_role(inputs, "annotated_bibliography"))
    rows: list[dict[str, Any]] = []
    retraction_advisories: list[dict[str, Any]] = []
    for entry in entries:
        row, advisories = _existence_row(entry)
        rows.append(row)
        retraction_advisories.extend(advisories)
    return {
        "citations": rows,
        "counts": _counts(rows),
        "resolver_status_counts": _resolver_status_counts(rows),
        "retraction_advisories": retraction_advisories,
        "scope": "offline-supplied-resolver-observations",
    }


def _summary_payload(document: Any) -> Mapping[str, Any]:
    if isinstance(document, Mapping) and "result" in document:
        payload = document["result"]
    else:
        payload = document
    if not isinstance(payload, Mapping):
        raise ValueError("Citation verification report payload must be an object")
    return payload


def _summary_rows(payload: Mapping[str, Any]) -> list[dict[str, Any]]:
    raw_rows = payload.get("citations")
    if not isinstance(raw_rows, list):
        raise ValueError("Citation verification report needs a citations array")
    rows: list[dict[str, Any]] = []
    seen: set[str] = set()
    for index, raw in enumerate(raw_rows):
        if not isinstance(raw, Mapping):
            raise ValueError(f"Citation report row {index} must be an object")
        key = raw.get("citation_key")
        if not isinstance(key, str) or not key.strip():
            raise ValueError(f"Citation report row {index} needs citation_key")
        if key in seen:
            raise ValueError(f"Duplicate citation_key in report: {key}")
        seen.add(key)
        status = raw.get("lookup_verified", raw.get("status"))
        if not isinstance(status, str) or status not in LOOKUP_VERDICTS:
            raise ValueError(f"Invalid citation report status for {key!r}: {status!r}")
        if "status" in raw and raw["status"] != status:
            raise ValueError(f"Conflicting citation status fields for {key!r}")
        outcomes = raw.get("resolver_outcomes", {})
        if outcomes is None:
            outcomes = {}
        if not isinstance(outcomes, Mapping):
            raise ValueError(f"resolver_outcomes must be an object for {key!r}")
        # Reuse the exact validation rules without rebuilding an entry or
        # changing any resolver payload supplied by the host.
        validated_outcomes = _resolver_outcomes(
            {"citation_key": key, "resolver_outcomes": outcomes}
        )
        expected_status = _reduce_lookup_verified(validated_outcomes)
        if status != expected_status:
            raise ValueError(
                f"Citation report status disagrees with resolver outcomes for {key!r}"
            )
        row = deepcopy(dict(raw))
        row["lookup_verified"] = status
        row["status"] = status
        row["resolver_outcomes"] = deepcopy(dict(outcomes))
        if "check_status" not in row:
            row["check_status"] = _check_status(outcomes)
        if row["check_status"] not in {"checked", "degraded", "not_checked"}:
            raise ValueError(f"Invalid check_status for {key!r}")
        rows.append(row)
    return rows


def _report_retractions(payload: Mapping[str, Any], rows: list[Mapping[str, Any]]) -> list[dict[str, Any]]:
    raw = payload.get("retraction_advisories", [])
    if not isinstance(raw, list):
        raise ValueError("retraction_advisories must be an array")
    result: list[dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()
    for advisory in raw:
        if not isinstance(advisory, Mapping):
            raise ValueError("Each retraction advisory must be an object")
        key = advisory.get("citation_key")
        if not isinstance(key, str) or not key.strip():
            raise ValueError("Each retraction advisory needs citation_key")
        signal_type = advisory.get("signal_type")
        if signal_type != "retraction_status":
            raise ValueError("Retraction advisories must have signal_type retraction_status")
        signal_id = advisory.get("signal_id", "")
        dedupe_key = (key, signal_id if isinstance(signal_id, str) else repr(signal_id))
        if dedupe_key in seen:
            raise ValueError(f"Duplicate retraction advisory for {key!r}")
        seen.add(dedupe_key)
        result.append(deepcopy(dict(advisory)))
    known = {row["citation_key"] for row in rows}
    if any(advisory["citation_key"] not in known for advisory in result):
        raise ValueError("Retraction advisory references an unknown citation_key")
    return result


def compute_summary(inputs: dict[str, Path]) -> dict[str, Any]:
    """Aggregate an existence report while retaining citation and retraction rows."""

    payload = _summary_payload(_read_role(inputs, "citation_verification_report"))
    rows = _summary_rows(payload)
    return {
        "citations": rows,
        "counts": _counts(rows),
        "resolver_status_counts": _resolver_status_counts(rows),
        "retraction_advisories": _report_retractions(payload, rows),
        "scope": "offline-citation-verification-summary",
    }


def _infer_preprint_venue(pointer: Any) -> str | None:
    if not isinstance(pointer, str):
        return None
    lowered = pointer.lower()
    for hint, venue in POINTER_VENUE_HINTS:
        if hint in lowered:
            return venue
    return None


def _preprint_signal(entry: Mapping[str, Any]) -> bool:
    year = entry.get("year")
    if type(year) is not int or year < 2024:
        return False
    venue = entry.get("venue")
    if venue in PREPRINT_VENUES:
        return True
    if venue is None:
        return _infer_preprint_venue(entry.get("source_pointer")) in PREPRINT_VENUES
    return False


def _contamination_row(entry: Mapping[str, Any]) -> dict[str, Any]:
    outcomes = _resolver_outcomes(entry)
    resolver_signals: dict[str, bool] = {}
    omissions: dict[str, str] = {}
    skipped: list[str] = []
    unresolved: list[str] = []
    for resolver, outcome in outcomes.items():
        field = f"{resolver}_unmatched"
        status = outcome["status"]
        if status == "matched":
            resolver_signals[field] = False
        elif status == "unmatched":
            # This is a resolver observation.  The status and queried_by are
            # retained below; title-only unmatched is not existence=false.
            resolver_signals[field] = True
        elif status == "skipped":
            skipped.append(resolver)
        else:  # unreachable: omit the boolean, preserving degradation state.
            unresolved.append(resolver)
            omissions[field] = "api_degraded"

    supplied_omissions = entry.get("contamination_signal_omissions") or {}
    for field, reason in supplied_omissions.items():
        omissions[field] = reason

    row: dict[str, Any] = {
        "citation_key": entry["citation_key"],
        "preprint_post_llm_inflection": _preprint_signal(entry),
        "resolver_signals": resolver_signals,
        "resolver_outcomes": outcomes,
        "omissions": omissions,
        "skipped_resolvers": skipped,
        "unresolved_resolvers": unresolved,
        "check_status": _check_status(outcomes),
    }
    if entry.get("obtained_via") == "manual":
        row["resolver_state"] = "manual_exemption"
    elif not outcomes:
        row["resolver_state"] = "not_checked"
    return row


def compute_contamination(inputs: dict[str, Path]) -> dict[str, Any]:
    """Compute bounded preprint and supplied-resolver advisory observations."""

    entries = _validated_entries(_read_role(inputs, "corpus"))
    rows = [_contamination_row(entry) for entry in entries]
    unmatched_count = sum(
        sum(value is True for value in row["resolver_signals"].values()) for row in rows
    )
    return {
        "entries": rows,
        "counts": {
            "total": len(rows),
            "preprint_post_llm_inflection": sum(
                row["preprint_post_llm_inflection"] for row in rows
            ),
            "resolver_unmatched": unmatched_count,
            "not_checked": sum(row["check_status"] == "not_checked" for row in rows),
            "degraded": sum(row["check_status"] == "degraded" for row in rows),
        },
        "scope": "offline-preprint-and-supplied-resolver-advisories",
    }
