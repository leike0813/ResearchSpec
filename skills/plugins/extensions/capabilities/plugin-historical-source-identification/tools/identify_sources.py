#!/usr/bin/env python3
"""Identify and verify historical-source candidates through explicit adapters."""

from __future__ import annotations

import argparse
import base64
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from historical_support import (  # noqa: E402
    SkillError,
    SkillArgumentParser,
    credential_from_env,
    read_json,
    request_json,
    run_cli,
    sha256_bytes,
    sha256_file,
    write_bytes,
    write_json,
)

STATUSES = {"discovered", "retrieved", "verified", "inaccessible", "rejected"}


def _candidate(
    *,
    title: str,
    locator: str,
    adapter: str,
    query: str,
    status: str = "discovered",
    evidence: dict[str, Any] | None = None,
    date: str | None = None,
    warnings: list[str] | None = None,
) -> dict[str, Any]:
    return {
        "candidate_id": sha256_bytes(f"{adapter}\0{locator}".encode("utf-8"))[:20],
        "title": title,
        "locator": locator,
        "canonical_url": locator if locator.startswith(("http://", "https://")) else None,
        "originating_query": query,
        "provider_or_repository": adapter,
        "date": date,
        "status": status,
        "retrieval_status": status,
        "evidence": evidence or {},
        "warnings": warnings or [],
    }


def _validate_candidate(candidate: Any) -> dict[str, Any]:
    strings = ("candidate_id", "title", "locator", "originating_query", "provider_or_repository", "status", "retrieval_status")
    if not isinstance(candidate, dict) or any(not isinstance(candidate.get(key), str) or not candidate[key] for key in strings):
        raise SkillError("invalid_candidate", "Candidate requires complete identity, query, provider, and status fields.")
    if candidate["status"] not in STATUSES or candidate["retrieval_status"] not in STATUSES:
        raise SkillError("invalid_candidate", "Candidate status is not recognized.")
    if not isinstance(candidate.get("evidence"), dict) or not isinstance(candidate.get("warnings"), list):
        raise SkillError("invalid_candidate", "Candidate requires evidence object and warnings array.")
    return candidate


def _local_index(index_value: str, query: str, exact: bool) -> list[dict[str, Any]]:
    index_path = Path(index_value).expanduser().resolve()
    value = read_json(str(index_path), "Local index")
    records = value.get("records")
    if not isinstance(records, list):
        raise SkillError("invalid_local_index", "Local index requires a records array.")
    needle = query.casefold()
    results: list[dict[str, Any]] = []
    for record in records:
        if not isinstance(record, dict):
            continue
        haystack = "\n".join(str(record.get(key, "")) for key in ("title", "text", "creator", "date", "locator"))
        matched = query in haystack if exact else all(term in haystack.casefold() for term in needle.split())
        if matched:
            locator = str(record.get("locator", f"local-index:{len(results)}"))
            results.append(_candidate(
                title=str(record.get("title", locator)),
                locator=locator,
                adapter="local-index",
                query=query,
                date=str(record.get("date")) if record.get("date") else None,
                evidence={"index_path": str(index_path), "index_sha256": sha256_file(index_path), "matched_text_sha256": sha256_bytes(haystack.encode("utf-8")), "match_locator": str(record.get("match_locator", locator))},
            ))
    return results


def _with_query(endpoint: str, values: dict[str, Any]) -> str:
    separator = "&" if "?" in endpoint else "?"
    return f"{endpoint}{separator}{urllib.parse.urlencode(values)}"


def _credential(args: argparse.Namespace) -> str:
    if not args.credential_env:
        raise SkillError("configuration_missing", "The selected adapter requires --credential-env.")
    value = credential_from_env(args.credential_env)
    if value is None:
        raise SkillError("configuration_missing", "The selected adapter credential is not configured.")
    return value


def _fetch(url: str) -> tuple[bytes, str]:
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "ResearchSpec-HistAgent/1"}), timeout=30) as response:
            return response.read(), response.headers.get_content_type()
    except (urllib.error.URLError, TimeoutError) as exc:
        raise SkillError("operation_failed", "Configured HTTP request failed.", {"url": url, "reason": type(exc).__name__}) from exc


def _persist(command: str, output: str, result: dict[str, Any], overwrite: bool) -> dict[str, Any]:
    saved = write_json(Path(output), result, overwrite=overwrite)
    candidates = result.get("candidates", [])
    return {"command": command, "artifact": saved, "candidate_count": len(candidates) if isinstance(candidates, list) else 1}


def _handle(args: argparse.Namespace) -> dict[str, Any]:
    command = args.command
    if command in {"search", "exact-text"}:
        if args.adapter == "local-index":
            if not args.index:
                raise SkillError("invalid_input", "local-index requires --index.")
            candidates = _local_index(args.index, args.query, command == "exact-text")
        else:
            values = {"engine": "google", "q": f'"{args.query}"' if command == "exact-text" else args.query, "api_key": _credential(args)}
            response = request_json(_with_query(args.endpoint, values))
            candidates = [_candidate(title=str(item.get("title", item.get("link", "untitled"))), locator=str(item.get("link", "")), adapter="serpapi", query=args.query, evidence={"position": item.get("position"), "snippet": item.get("snippet"), "match_locator": item.get("position")}) for item in response.get("organic_results", []) if isinstance(item, dict) and item.get("link")]
        return _persist(command, args.output, {"query": args.query, "candidates": candidates}, args.overwrite)
    if command == "literature":
        if args.adapter == "google-books":
            response = request_json(_with_query(args.endpoint, {"q": args.query, "maxResults": args.limit}))
            candidates = []
            for item in response.get("items", []):
                info = item.get("volumeInfo", {})
                candidates.append(_candidate(title=str(info.get("title", item.get("id", "untitled"))), locator=str(info.get("infoLink", f"google-books:{item.get('id', '')}")), adapter=args.adapter, query=args.query, date=str(info.get("publishedDate")) if info.get("publishedDate") else None, evidence={"authors": info.get("authors", []), "identifiers": info.get("industryIdentifiers", []), "match_locator": item.get("id")}))
        else:
            response = request_json(_with_query(args.endpoint, {"q": f"keyword:{args.query}", "api_key": _credential(args), "p": args.limit}))
            candidates = [_candidate(title=str(item.get("title", "untitled")), locator=str(item.get("url", [{}])[0].get("value", "")), adapter=args.adapter, query=args.query, date=str(item.get("publicationDate")) if item.get("publicationDate") else None, evidence={"creators": item.get("creators", []), "doi": item.get("doi"), "match_locator": item.get("doi")}) for item in response.get("records", []) if isinstance(item, dict)]
        return _persist(command, args.output, {"query": args.query, "candidates": candidates}, args.overwrite)
    if command == "archive":
        response = request_json(_with_query(args.endpoint, {"url": args.url, "output": "json", "filter": "statuscode:200", "fl": "timestamp,original,digest,statuscode,mimetype", "limit": args.limit}))
        rows = response[1:] if isinstance(response, list) and response else []
        candidates = [_candidate(title=f"Archived {row[1]} at {row[0]}", locator=f"https://web.archive.org/web/{row[0]}/{row[1]}", adapter="internet-archive-cdx", query=args.url, date=str(row[0]), evidence={"timestamp": row[0], "digest": row[2], "status": row[3], "media_type": row[4], "match_locator": row[0]}) for row in rows if isinstance(row, list) and len(row) >= 5]
        return _persist(command, args.output, {"url": args.url, "candidates": candidates}, args.overwrite)
    if command == "fetch":
        try:
            content, media_type = _fetch(args.url)
        except SkillError as exc:
            candidate = _candidate(title=args.url, locator=args.url, adapter="http", query=args.url, status="inaccessible", evidence={"error_code": exc.code}, warnings=[exc.message])
            return {"command": command, "candidate": candidate, "artifact": None}
        saved = write_bytes(Path(args.output), content, media_type, overwrite=args.overwrite)
        candidate = _candidate(title=args.url, locator=args.url, adapter="http", query=args.url, status="retrieved", evidence={"sha256": saved["sha256"], "bytes": len(content), "media_type": media_type, "match_locator": args.url})
        return {"command": command, "candidate": candidate, "artifact": saved}
    if command == "reverse-image":
        if args.adapter == "serpapi-lens":
            if not args.image_url:
                raise SkillError("invalid_input", "serpapi-lens requires --image-url.")
            response = request_json(_with_query(args.endpoint, {"engine": "google_lens", "url": args.image_url, "api_key": _credential(args)}))
            query = args.image_url
        else:
            if not args.allow_external_upload:
                raise SkillError("consent_required", "Uploading a local image requires --allow-external-upload.", {"adapter": args.adapter})
            if not args.source:
                raise SkillError("invalid_input", "http-upload requires --source.")
            source = Path(args.source).expanduser().resolve()
            if not source.is_file():
                raise SkillError("source_not_found", "Image file does not exist.", {"path": str(source)})
            response = request_json(args.endpoint, method="POST", body={"image_base64": base64.b64encode(source.read_bytes()).decode("ascii"), "sha256": sha256_file(source)})
            query = sha256_file(source)
        items = response.get("visual_matches", response.get("results", [])) if isinstance(response, dict) else []
        candidates = [_candidate(title=str(item.get("title", item.get("link", "untitled"))), locator=str(item.get("link", item.get("url", ""))), adapter=args.adapter, query=query, evidence={"source": item.get("source"), "thumbnail": item.get("thumbnail"), "match_locator": item.get("position")}) for item in items if isinstance(item, dict)]
        return _persist(command, args.output, {"candidates": candidates}, args.overwrite)
    if command in {"verify", "validate"}:
        value = read_json(args.candidate_file, "Candidate file")
        candidate = _validate_candidate(value.get("candidate", value))
        if command == "validate":
            return {"command": command, "valid": True, "candidate_id": candidate["candidate_id"], "status": candidate["status"]}
        updated = {**candidate, "status": args.status, "retrieval_status": args.status, "verification_note": args.note}
        return _persist(command, args.output, {"candidate": updated}, args.overwrite)
    raise SkillError("unknown_command", "Unknown source-identification command.", {"command": command})


def _output(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--output", required=True)
    parser.add_argument("--overwrite", action="store_true")


def parser() -> argparse.ArgumentParser:
    root = SkillArgumentParser()
    commands = root.add_subparsers(dest="command", required=True)
    for name in ("search", "exact-text"):
        item = commands.add_parser(name)
        item.add_argument("--query", required=True)
        item.add_argument("--adapter", choices=("local-index", "serpapi"), required=True)
        item.add_argument("--index")
        item.add_argument("--endpoint", default="https://serpapi.com/search.json")
        item.add_argument("--credential-env")
        _output(item)
    literature = commands.add_parser("literature")
    literature.add_argument("--query", required=True)
    literature.add_argument("--adapter", choices=("google-books", "springer"), required=True)
    literature.add_argument("--endpoint", required=True)
    literature.add_argument("--credential-env")
    literature.add_argument("--limit", type=int, default=10)
    _output(literature)
    archive = commands.add_parser("archive")
    archive.add_argument("--url", required=True)
    archive.add_argument("--endpoint", default="https://web.archive.org/cdx/search/cdx")
    archive.add_argument("--limit", type=int, default=20)
    _output(archive)
    fetch = commands.add_parser("fetch")
    fetch.add_argument("--url", required=True)
    _output(fetch)
    reverse = commands.add_parser("reverse-image")
    reverse.add_argument("--adapter", choices=("serpapi-lens", "http-upload"), required=True)
    reverse.add_argument("--image-url")
    reverse.add_argument("--source")
    reverse.add_argument("--endpoint", required=True)
    reverse.add_argument("--credential-env")
    reverse.add_argument("--allow-external-upload", action="store_true")
    _output(reverse)
    verify = commands.add_parser("verify")
    verify.add_argument("--candidate-file", required=True)
    verify.add_argument("--status", choices=("verified", "rejected", "inaccessible"), required=True)
    verify.add_argument("--note", required=True)
    _output(verify)
    validate = commands.add_parser("validate")
    validate.add_argument("--candidate-file", required=True)
    return root


def main() -> int:
    args = parser().parse_args()
    return run_cli(lambda: _handle(args))


if __name__ == "__main__":
    raise SystemExit(main())
