#!/usr/bin/env python3
"""Bounded local-file history helper for the office-action stage.

The upstream package reaches its history through a SQLite store, an embedding
provider config, an Obsidian vault, and credential files. None of that is
available or permitted here, so the same retrieval work is done over an
ordinary local case collection of plain JSON files:

    {cases-dir}/{case_id}/v{n}.json

    {
      "schema_version": "1",
      "case_id": "hist-clarity-connector",
      "title": "...",
      "patent_type": "invention",
      "statutes": ["专利法第26条第4款"],
      "defects": ["clarity"],
      "tags": ["oa/clarity"],
      "domain": "...",
      "strategies": ["amend_claims"],
      "outcome": "amended_then_granted",
      "source_paths": ["materials/notice.md"],
      "body": "...",
      "redacted": true
    }

Two optional fields carry the semantics the prompt layer needs. "gold" marks a
manually confirmed, de-identified historical case whose actual outcome is
recorded; the tool never sets it, never derives it from a score, and only
reports it back. "query_vector" is an optional embedding produced by a
host-authorized tool outside this repository: when a query vector is supplied
the ranking uses cosine similarity, otherwise it falls back to lexical and tag
overlap, and both modes emit the same fields.

What this helper deliberately does not do: it never redacts for the user, it
never reports a grant, authorization, or win probability, and every score it
prints is relative to the candidates in the same run. It reads and writes only
inside --project-root and only outside researchspec/.

    python tools/oa_history.py ingest --project-root DIR --cases-dir cases \
        --input cases/draft.json
    python tools/oa_history.py search --project-root DIR --cases-dir cases \
        --query-text "..." --defect inventiveness --top-k 5
    python tools/oa_history.py score --project-root DIR --cases-dir cases \
        --input cases/strategy.json
"""
from __future__ import annotations

import argparse
import json
import math
import re
import sys
from pathlib import Path

_HERE = Path(__file__).resolve().parent
if str(_HERE) not in sys.path:
    sys.path.insert(0, str(_HERE))

import patent_files

SCHEMA_VERSION = "1"
PATENT_TYPES = ("invention", "utility_model", "design")
OUTCOMES = ("granted", "rejected", "pending", "withdrawn", "unknown", "amended_then_granted")
RECORDED_OUTCOMES = ("granted", "rejected", "withdrawn", "amended_then_granted")

MAX_CASES = 500
MAX_CASE_BYTES = 131072
MAX_QUERY_CHARS = 6000
MAX_CANDIDATES = 50
DEFAULT_TOP_K = 5

SIMILARITY_WEIGHT = 0.6
METADATA_WEIGHT = 0.4
HISTORY_BONUS_MAX = 8.0

CASE_ID_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]*\Z")
VERSION_RE = re.compile(r"v([0-9]+)\.json\Z")
WORD_RE = re.compile(r"[a-z0-9]+")
CJK_RE = re.compile(r"[\u4e00-\u9fff]+")

CASE_FIELDS = (
    "schema_version",
    "case_id",
    "title",
    "patent_type",
    "statutes",
    "defects",
    "tags",
    "domain",
    "strategies",
    "outcome",
    "source_paths",
    "body",
    "redacted",
)

UsageError = patent_files.UsageError

SEARCH_LIMITATIONS = (
    "hit scores are relative to the filtered collection in this run; they are not grant or authorization probabilities",
    "hit records carry case metadata only; case bodies are never echoed back",
    "source_paths are declared by the case note and are not re-resolved or verified here",
)

SCORE_LIMITATIONS = (
    "candidate scores are relative to the candidates in this assessment file; they are not grant or authorization probabilities",
    "history support counts only cases flagged gold, which records a manually confirmed de-identified case and its actual outcome",
    "gold is never assigned by this tool, so a high score never makes a case gold",
)


def _emit(payload: dict) -> None:
    json.dump(payload, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")


def _dumps(document: dict) -> str:
    return json.dumps(document, ensure_ascii=False, indent=2, sort_keys=True) + "\n"


def _norm(value: str) -> str:
    return re.sub(r"\s+", "", (value or "").lower())


def _tokens(text: str) -> set:
    lowered = (text or "").lower()
    out = set(WORD_RE.findall(lowered))
    for run in CJK_RE.findall(lowered):
        if len(run) == 1:
            out.add(run)
        out.update(run[index:index + 2] for index in range(len(run) - 1))
    return out


def _round(value: float) -> float:
    return round(float(value), 6)


def _context(project_root: str, cases_dir: str) -> tuple:
    root = Path(project_root).expanduser().resolve()
    if not root.is_dir():
        raise UsageError(f"project root is not a directory: {root}")
    cases = patent_files.resolve_project_output(root, cases_dir)
    if not cases.is_dir():
        raise UsageError(f"cases dir is not a directory: {cases_dir}")
    return root, cases


def _contained(container: Path, target: Path, label: str) -> Path:
    try:
        target.resolve().relative_to(container.resolve())
    except (OSError, ValueError) as exc:
        raise UsageError(f"{label} escapes {container}: {target}") from exc
    return target


def _read_json(path: Path, label: str) -> dict:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except OSError as exc:
        raise UsageError(f"{label} is not readable: {path}") from exc
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise UsageError(f"{label} is not valid JSON: {path}") from exc
    if not isinstance(data, dict):
        raise UsageError(f"{label} must be a JSON object: {path}")
    return data


def _string_list(value: object, field: str, problems: list) -> list:
    if value is None:
        return []
    if not isinstance(value, list) or any(not isinstance(item, str) or not item.strip() for item in value):
        problems.append(f"{field} must be a list of non-empty strings")
        return []
    return [item.strip() for item in value]


def _normalise_case(raw: dict) -> tuple:
    problems: list = []
    unknown = sorted(set(raw) - set(CASE_FIELDS) - {"gold", "query_vector"})
    if unknown:
        problems.append("unknown field(s): " + ", ".join(unknown))
    if raw.get("schema_version") != SCHEMA_VERSION:
        problems.append(f"schema_version must be {SCHEMA_VERSION!r}")

    case_id = raw.get("case_id")
    if isinstance(case_id, str) and CASE_ID_RE.match(case_id.strip()):
        case_id = case_id.strip()
    else:
        problems.append("case_id must start with a letter or digit and use only letters, digits, '.', '_', '-'")
        case_id = ""

    title = raw.get("title")
    if not isinstance(title, str) or not title.strip():
        problems.append("title must be a non-empty string")
        title = ""

    patent_type = raw.get("patent_type", "invention")
    if not isinstance(patent_type, str) or patent_type not in PATENT_TYPES:
        problems.append(f"patent_type must be one of {', '.join(PATENT_TYPES)}")
        patent_type = ""

    outcome = raw.get("outcome", "unknown")
    if not isinstance(outcome, str) or outcome not in OUTCOMES:
        problems.append(f"outcome must be one of {', '.join(OUTCOMES)}")
        outcome = "unknown"

    domain = raw.get("domain", "")
    if not isinstance(domain, str):
        problems.append("domain must be a string")
        domain = ""

    body = raw.get("body", "")
    if not isinstance(body, str):
        problems.append("body must be a string")
        body = ""

    if raw.get("redacted") is not True:
        problems.append("redacted must be true; this tool never redacts a case for you")

    gold = raw.get("gold", False)
    if not isinstance(gold, bool):
        problems.append("gold must be a boolean")
        gold = False
    elif gold and outcome not in RECORDED_OUTCOMES:
        problems.append(f"gold requires a recorded outcome, one of {', '.join(RECORDED_OUTCOMES)}")

    vector = raw.get("query_vector")
    if vector is not None and (
        not isinstance(vector, list)
        or not vector
        or any(
            isinstance(item, bool) or not isinstance(item, (int, float)) or not math.isfinite(item)
            for item in vector
        )
    ):
        problems.append("query_vector must be a non-empty list of finite numbers")
        vector = None

    case = {
        "schema_version": SCHEMA_VERSION,
        "case_id": case_id,
        "title": title.strip(),
        "patent_type": patent_type,
        "statutes": _string_list(raw.get("statutes"), "statutes", problems),
        "defects": _string_list(raw.get("defects"), "defects", problems),
        "tags": _string_list(raw.get("tags"), "tags", problems),
        "domain": domain.strip(),
        "strategies": _string_list(raw.get("strategies"), "strategies", problems),
        "outcome": outcome,
        "source_paths": _string_list(raw.get("source_paths"), "source_paths", problems),
        "body": body,
        "redacted": True,
    }
    if gold:
        case["gold"] = True
    if vector is not None:
        case["query_vector"] = [float(item) for item in vector]
    return case, problems


def _version_files(case_dir: Path) -> list:
    if not case_dir.is_dir():
        return []
    found = []
    for entry in case_dir.iterdir():
        match = VERSION_RE.match(entry.name)
        if match and entry.is_file():
            found.append((int(match.group(1)), entry))
    return sorted(found, key=lambda item: item[0])


def _collect_cases(root: Path, cases_dir: Path) -> tuple:
    """Read the newest version of every case, bounded by case count and bytes."""
    notes: list = []
    loaded: list = []
    total_bytes = 0
    truncated = False
    for entry in sorted(cases_dir.iterdir(), key=lambda item: item.name):
        if not entry.is_dir():
            continue
        _contained(cases_dir, entry, "case dir")
        versions = _version_files(entry)
        if not versions:
            continue
        if len(loaded) >= MAX_CASES:
            truncated = True
            break
        number, path = versions[-1]
        _contained(entry, path, "case file")
        try:
            size = path.stat().st_size
        except OSError as exc:
            raise UsageError(f"case file is not readable: {path}") from exc
        if size > MAX_CASE_BYTES:
            notes.append(f"skipped a case file over {MAX_CASE_BYTES} bytes: {entry.name}")
            continue
        case, problems = _normalise_case(_read_json(path, "case file"))
        if problems:
            raise UsageError(f"case file is invalid: {path}: " + "; ".join(problems))
        total_bytes += size
        loaded.append(
            {
                "document": case,
                "version": number,
                "versions": len(versions),
                "path": path.resolve().relative_to(root).as_posix(),
            }
        )
    if truncated:
        notes.append(f"case collection truncated at {MAX_CASES} cases in case_id order")
    return loaded, notes, total_bytes


def _value_overlap(want: list, have: list) -> float:
    """Upstream filter semantics: any requested value that matches, else miss."""
    wanted = {_norm(item) for item in want if item}
    present = {_norm(item) for item in have if item}
    if not wanted or not present:
        return 0.0
    if wanted & present:
        return 1.0
    return 1.0 if any(any(a in b or b in a for b in present) for a in wanted) else 0.0


def _matches(case: dict, filters: dict) -> bool:
    if filters["patent_type"] and case["patent_type"] and case["patent_type"] != filters["patent_type"]:
        return False
    if filters["domain"] and case["domain"]:
        left, right = _norm(filters["domain"]), _norm(case["domain"])
        if left not in right and right not in left:
            return False
    for key in ("statutes", "defects", "tags"):
        want = filters[key]
        if want and case[key] and _value_overlap(want, case[key]) == 0.0:
            return False
    return True


def _metadata_score(case: dict, filters: dict) -> float:
    parts: list = []
    for key in ("statutes", "defects", "tags"):
        if filters[key]:
            parts.append(_value_overlap(filters[key], case[key]))
    if filters["patent_type"] and case["patent_type"]:
        parts.append(1.0 if case["patent_type"] == filters["patent_type"] else 0.0)
    if filters["domain"] and case["domain"]:
        left, right = _norm(filters["domain"]), _norm(case["domain"])
        parts.append(1.0 if (left in right or right in left) else 0.0)
    return sum(parts) / len(parts) if parts else 0.0


def _lexical_similarity(query: set, case: dict) -> float:
    if not query:
        return 0.0
    haystack = _tokens(
        " ".join([case["title"], case["domain"], *case["tags"], *case["strategies"], case["body"]])
    )
    if not haystack:
        return 0.0
    return len(query & haystack) / len(query)


def _cosine(left: list, right: list):
    if not left or not right or len(left) != len(right):
        return None
    dot = sum(a * b for a, b in zip(left, right))
    left_norm = math.sqrt(sum(a * a for a in left))
    right_norm = math.sqrt(sum(b * b for b in right))
    if left_norm == 0.0 or right_norm == 0.0:
        return None
    return dot / (left_norm * right_norm)


def _load_vector(value: str, root: Path) -> list:
    path = patent_files.resolve_indexed(root, value)
    data = _read_json(path, "query vector")
    vector = data.get("vector") if isinstance(data.get("vector"), list) else data
    if (
        not isinstance(vector, list)
        or not vector
        or any(
            isinstance(item, bool) or not isinstance(item, (int, float)) or not math.isfinite(item)
            for item in vector
        )
    ):
        raise UsageError("query vector must be a non-empty list of finite numbers")
    return [float(item) for item in vector]


def _diff(case: dict, filters: dict) -> dict:
    return {
        "patent_type_query": filters["patent_type"],
        "patent_type_case": case["patent_type"],
        "domain_query": filters["domain"],
        "domain_case": case["domain"],
        "statutes_query": filters["statutes"],
        "statutes_case": case["statutes"],
        "defects_query": filters["defects"],
        "defects_case": case["defects"],
        "tags_query": filters["tags"],
        "tags_case": case["tags"],
        "strategies_case": case["strategies"],
        "outcome_case": case["outcome"],
    }


def _hit(entry: dict, case: dict, score: float, components: dict, source: str, filters: dict) -> dict:
    return {
        "case_id": case["case_id"],
        "version": entry["version"],
        "versions_on_disk": entry["versions"],
        "path": entry["path"],
        "title": case["title"],
        "patent_type": case["patent_type"],
        "statutes": case["statutes"],
        "defects": case["defects"],
        "tags": case["tags"],
        "domain": case["domain"],
        "strategies": case["strategies"],
        "outcome": case["outcome"],
        "gold": bool(case.get("gold")),
        "source_paths": case["source_paths"],
        "body_chars": len(case["body"]),
        "score": score,
        "score_components": components,
        "similarity_source": source,
        "diff": _diff(case, filters),
    }


def command_ingest(args: argparse.Namespace) -> int:
    root, cases = _context(args.project_root, args.cases_dir)
    source = patent_files.resolve_indexed(root, args.input)
    case, problems = _normalise_case(_read_json(source, "case input"))
    if problems:
        _emit({"ok": False, "command": "ingest", "input": args.input, "problems": problems})
        return 1
    payload = _dumps(case)
    case_dir = _contained(cases, cases / case["case_id"], "case dir")
    versions = _version_files(case_dir)
    if versions and versions[-1][1].read_text(encoding="utf-8") == payload:
        _emit(
            {
                "ok": True,
                "command": "ingest",
                "case_id": case["case_id"],
                "version": versions[-1][0],
                "path": versions[-1][1].resolve().relative_to(root).as_posix(),
                "written": False,
                "reason": "unchanged",
            }
        )
        return 0
    if versions and args.overwrite:
        number, path = versions[-1]
    else:
        number = versions[-1][0] + 1 if versions else 1
        path = case_dir / f"v{number}.json"
    target = patent_files.resolve_project_output(root, str(path))
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(payload, encoding="utf-8")
    _emit(
        {
            "ok": True,
            "command": "ingest",
            "case_id": case["case_id"],
            "version": number,
            "path": target.relative_to(root).as_posix(),
            "previous_version": versions[-1][0] if versions else None,
            "written": True,
            "replaced": bool(versions and args.overwrite),
        }
    )
    return 0


def command_search(args: argparse.Namespace) -> int:
    root, cases = _context(args.project_root, args.cases_dir)
    query = args.query_text or ""
    notes: list = []
    if args.query_file:
        query = patent_files.resolve_indexed(root, args.query_file).read_text(encoding="utf-8")
    query = query.strip()
    if len(query) > MAX_QUERY_CHARS:
        query = query[:MAX_QUERY_CHARS]
        notes.append(f"query truncated at {MAX_QUERY_CHARS} characters")

    filters = {
        "patent_type": args.patent_type or "",
        "domain": args.domain or "",
        "statutes": list(args.statute or []),
        "defects": list(args.defect or []),
        "tags": list(args.tag or []),
    }
    if not query and not args.query_vector and not any(filters.values()):
        raise UsageError("search needs a query or at least one filter")

    entries, collect_notes, total_bytes = _collect_cases(root, cases)
    notes.extend(collect_notes)
    vector = _load_vector(args.query_vector, root) if args.query_vector else None
    query_tokens = _tokens(query)
    filtered = [entry for entry in entries if _matches(entry["document"], filters)]
    notes.append(f"collection holds {len(entries)} case(s); {len(filtered)} matched the filters")
    if not filtered and any(filters.values()):
        notes.append("filters excluded every case in the collection, so no hit is reported")

    ranked_by_cosine = False
    scored: list = []
    for entry in filtered:
        case = entry["document"]
        cosine = _cosine(vector, case["query_vector"]) if (vector and case.get("query_vector")) else None
        if cosine is not None:
            ranked_by_cosine = True
        similarity = cosine if cosine is not None else _lexical_similarity(query_tokens, case)
        source = "cosine" if cosine is not None else ("lexical" if query_tokens else "none")
        metadata = _metadata_score(case, filters)
        scored.append(
            (
                SIMILARITY_WEIGHT * similarity + METADATA_WEIGHT * metadata,
                {"similarity": _round(similarity), "metadata": _round(metadata)},
                entry,
                source,
            )
        )

    mode = "cosine" if ranked_by_cosine else ("lexical" if query_tokens else "tags_only")
    best = max((item[0] for item in scored), default=0.0)
    top_k = args.top_k if args.top_k and args.top_k > 0 else DEFAULT_TOP_K
    ordered = sorted(scored, key=lambda item: (-item[0], item[2]["document"]["case_id"]))[:top_k]
    hits: list = []
    for raw, components, entry, source in ordered:
        relative = _round(raw / best) if best > 0 else 0.0
        hits.append(_hit(entry, entry["document"], relative, components, source, filters))
    _emit(
        {
            "ok": True,
            "command": "search",
            "cases_dir": cases.relative_to(root).as_posix(),
            "retrieval_mode": mode,
            "vector_ranked": mode == "cosine",
            "top_k": top_k,
            "filters": filters,
            "scanned_cases": len(entries),
            "scanned_bytes": total_bytes,
            "matched_cases": len(filtered),
            "query_char_count": len(query),
            "hits": hits,
            "notes": notes,
            "limitations": list(SEARCH_LIMITATIONS),
        }
    )
    return 0


def _assessment(raw: dict) -> tuple:
    problems: list = []
    if raw.get("schema_version") != SCHEMA_VERSION:
        problems.append(f"schema_version must be {SCHEMA_VERSION!r}")
    candidates_raw = raw.get("candidates")
    if not isinstance(candidates_raw, list) or not candidates_raw:
        return {}, [], problems + ["candidates must be a non-empty list"]
    if len(candidates_raw) > MAX_CANDIDATES:
        return {}, [], problems + [f"candidates must not exceed {MAX_CANDIDATES}"]

    candidates: list = []
    for position, item in enumerate(candidates_raw):
        if not isinstance(item, dict):
            problems.append(f"candidates[{position}] must be an object")
            continue
        strategy = item.get("strategy")
        if not isinstance(strategy, str) or not strategy.strip():
            problems.append(f"candidates[{position}].strategy must be a non-empty string")
            continue
        values: dict = {}
        broken = False
        for field in ("support", "coverage", "claim_retention"):
            number = item.get(field)
            if isinstance(number, bool) or not isinstance(number, (int, float)) or not math.isfinite(number):
                problems.append(f"candidates[{position}].{field} must be a number within 0..100")
                broken = True
                break
            if not 0 <= number <= 100:
                problems.append(f"candidates[{position}].{field} must be within 0..100")
                broken = True
                break
            values[field] = float(number)
        if broken:
            continue
        supporting = item.get("supporting_cases", [])
        if not isinstance(supporting, list) or any(
            not isinstance(entry, str) or not entry.strip() for entry in supporting
        ):
            problems.append(f"candidates[{position}].supporting_cases must be a list of case ids")
            continue
        candidates.append(
            {
                "strategy": strategy.strip(),
                "supporting_cases": [entry.strip() for entry in supporting],
                **values,
            }
        )
    context = {
        "patent_type": raw.get("patent_type", ""),
        "defects": _string_list(raw.get("defects"), "defects", problems),
    }
    return context, candidates, problems


def _history_support(candidate: dict, context: dict, by_id: dict) -> dict:
    confirmed: list = []
    for case_id in candidate["supporting_cases"]:
        case = by_id.get(case_id)
        if not case or not case.get("gold"):
            continue
        if case["outcome"] not in RECORDED_OUTCOMES:
            continue
        if context["defects"] and case["defects"] and _value_overlap(context["defects"], case["defects"]) == 0.0:
            continue
        if case["strategies"] and candidate["strategy"] not in case["strategies"]:
            continue
        confirmed.append(case_id)
    return {
        "confirmed_case_ids": confirmed,
        "bonus_points": HISTORY_BONUS_MAX if confirmed else 0.0,
        "bonus_cap": HISTORY_BONUS_MAX,
        "basis": "manually confirmed de-identified history cases with a recorded outcome for this defect and strategy",
    }


def command_score(args: argparse.Namespace) -> int:
    root, cases = _context(args.project_root, args.cases_dir)
    source = patent_files.resolve_indexed(root, args.input)
    context, candidates, problems = _assessment(_read_json(source, "assessment input"))
    if problems:
        _emit({"ok": False, "command": "score", "input": args.input, "problems": problems})
        return 1

    entries, notes, _total_bytes = _collect_cases(root, cases)
    by_id = {entry["document"]["case_id"]: entry["document"] for entry in entries}
    for candidate in candidates:
        candidate["history"] = _history_support(candidate, context, by_id)
        candidate["support_effective"] = min(100.0, candidate["support"] + candidate["history"]["bonus_points"])

    best = max(
        max(candidate[field] for field in ("support_effective", "coverage", "claim_retention"))
        for candidate in candidates
    )
    best = best if best > 0 else 1.0
    ranked: list = []
    for candidate in candidates:
        relative = {
            "support": _round(candidate["support_effective"] / best),
            "coverage": _round(candidate["coverage"] / best),
            "claim_retention": _round(candidate["claim_retention"] / best),
        }
        combined = _round(sum(relative.values()) / len(relative))
        ranked.append(
            {
                "strategy": candidate["strategy"],
                "support": _round(candidate["support"]),
                "coverage": _round(candidate["coverage"]),
                "claim_retention": _round(candidate["claim_retention"]),
                "supporting_cases": candidate["supporting_cases"],
                "history": candidate["history"],
                "relative": relative,
                "combined_relative": combined,
            }
        )
    ranked.sort(key=lambda item: (-item["combined_relative"], item["strategy"]))
    for position, item in enumerate(ranked):
        following = ranked[position + 1]["combined_relative"] if position + 1 < len(ranked) else None
        item["rank"] = position + 1
        item["margin_to_next"] = None if following is None else _round(item["combined_relative"] - following)
        item["tied_with"] = sorted(
            other["strategy"]
            for other in ranked
            if other["combined_relative"] == item["combined_relative"] and other["strategy"] != item["strategy"]
        )
    notes.append(f"{len(by_id)} case(s) available; gold flags are read, never assigned")
    _emit(
        {
            "ok": True,
            "command": "score",
            "assessment": args.input,
            "patent_type": context["patent_type"],
            "defects": context["defects"],
            "candidates": ranked,
            "notes": notes,
            "limitations": list(SCORE_LIMITATIONS),
        }
    )
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    sub = parser.add_subparsers(dest="command", required=True)

    def shared(subparser: argparse.ArgumentParser) -> None:
        subparser.add_argument("--project-root", required=True, help="project root; every read and write stays inside it")
        subparser.add_argument("--cases-dir", required=True, help="project-relative case collection directory")

    ingest = sub.add_parser("ingest", help="write a redacted case as a new immutable version")
    shared(ingest)
    ingest.add_argument("--input", required=True, help="project-relative JSON case document")
    ingest.add_argument("--overwrite", action="store_true", help="replace the newest version instead of adding one")
    ingest.set_defaults(func=command_ingest)

    search = sub.add_parser("search", help="read-only retrieval over the case collection")
    shared(search)
    search.add_argument("--query-text", default="", help="query text")
    search.add_argument("--query-file", default="", help="project-relative file to read the query text from")
    search.add_argument("--query-vector", default="", help="project-relative JSON vector for cosine ranking")
    search.add_argument("--patent-type", default="")
    search.add_argument("--domain", default="")
    search.add_argument("--statute", action="append", default=[], metavar="STATUTE")
    search.add_argument("--defect", action="append", default=[], metavar="DEFECT")
    search.add_argument("--tag", action="append", default=[], metavar="TAG")
    search.add_argument("--top-k", type=int, default=DEFAULT_TOP_K)
    search.set_defaults(func=command_search)

    score = sub.add_parser("score", help="compare candidate strategies on a relative scale")
    shared(score)
    score.add_argument("--input", required=True, help="project-relative strategy assessment JSON")
    score.set_defaults(func=command_score)
    return parser


def main(argv: list = None) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        if getattr(args, "query_text", "") and getattr(args, "query_file", ""):
            _emit({"ok": False, "command": args.command, "problems": ["pass only one of --query-text or --query-file"]})
            return 1
        return int(args.func(args))
    except UsageError as exc:
        _emit({"ok": False, "command": args.command, "problems": [str(exc)]})
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
