"""ResearchSpec-owned bounded document checks, CC BY-NC 4.0.

Derived from ARS v3.21.1 verify_submission_package.py and passport corpus
contracts (Imbad0202/academic-research-skills). No upstream runtime imported.
"""
import hashlib
import json
from pathlib import Path
import re


def load(p):
    text = p.read_text(encoding="utf-8")
    if p.suffix.lower() == ".json":
        return json.loads(text)
    import yaml
    return yaml.safe_load(text)


def compute_passport(inputs):
    passport = load(inputs["material_passport"])
    if not isinstance(passport, dict) or not isinstance(passport.get("literature_corpus"), list):
        raise ValueError("Passport needs literature_corpus array")
    findings, seen = [], set()
    for i, entry in enumerate(passport["literature_corpus"]):
        if not isinstance(entry, dict):
            findings.append({"entry": i, "code": "entry_invalid"})
            continue
        key = entry.get("citation_key")
        for field in ("citation_key", "title", "source_pointer"):
            if not isinstance(entry.get(field), str) or not entry[field].strip():
                findings.append({"entry": i, "code": "required_field_invalid", "field": field})
        if isinstance(key, str):
            if key in seen or not re.fullmatch(r"[A-Za-z][A-Za-z0-9_:-]*", key):
                findings.append({"entry": i, "code": "citation_key_invalid"})
            seen.add(key)
        year = entry.get("year")
        if type(year) is not int or not 1000 <= year <= 2100:
            findings.append({"entry": i, "code": "year_invalid"})
        authors = entry.get("authors")
        if not isinstance(authors, list) or not authors or any(
            not isinstance(a, dict) or not any(isinstance(a.get(k), str) and a[k].strip() for k in ("family", "literal")) for a in authors
        ):
            findings.append({"entry": i, "code": "authors_invalid"})
        if entry.get("source_acquired") is False and entry.get("description_last_audit") != "none":
            findings.append({"entry": i, "code": "unacquired_source_audit_invalid"})
    return {"verdict": "FAIL" if findings else "PASS", "entry_count": len(passport["literature_corpus"]),
            "findings": findings, "scope": "corpus-required-fields-and-local-consistency",
            "not_checked": ["source-content", "citation-existence", "full-upstream-passport-schema", "workflow-resume"]}


def compute_submission(inputs):
    manifest_path = inputs["submission_package"]
    manifest = load(manifest_path)
    if not isinstance(manifest, dict) or not isinstance(manifest.get("files"), list) or not manifest["files"]:
        raise ValueError("Submission package must be a JSON/YAML manifest with nonempty files array")
    checks, seen, texts = [], set(), {}
    root = manifest_path.parent.resolve()
    for row in manifest["files"]:
        if not isinstance(row, dict) or not isinstance(row.get("path"), str) or not row["path"]:
            raise ValueError("Each package file needs a relative path")
        rel = row["path"]
        target = (root / rel).resolve()
        if Path(rel).is_absolute() or not target.is_relative_to(root) or rel in seen:
            raise ValueError("Duplicate or escaping package file")
        seen.add(rel)
        if not target.is_file():
            checks.append({"file": rel, "code": "file_exists", "status": "fail"})
            continue
        data = target.read_bytes()
        checks.append({"file": rel, "code": "file_exists", "status": "pass"})
        checksum = row.get("sha256")
        if checksum is not None and (not isinstance(checksum, str) or not re.fullmatch(r"[a-f0-9]{64}", checksum)):
            raise ValueError("Invalid declared SHA-256")
        checks.append({"file": rel, "code": "checksum", "status": "not_checked" if checksum is None else "pass" if hashlib.sha256(data).hexdigest() == checksum else "fail"})
        if target.suffix.lower() in (".md", ".txt", ".tex", ".bib"):
            texts[rel] = data.decode("utf-8")
    for role in ("license", "disclosure", "terminal_policy_stamp"):
        declared = manifest.get(role)
        checks.append({"code": role, "status": "not_checked" if declared is None else "pass" if isinstance(declared, str) and declared in seen and (root / declared).is_file() else "fail"})
    profile = manifest.get("profile")
    if profile is not None and not isinstance(profile, dict):
        raise ValueError("profile must be an explicit object")
    manuscript = manifest.get("manuscript")
    if manuscript is not None and manuscript not in texts:
        checks.append({"code": "manuscript_text", "status": "not_checked"})
    text = texts.get(manuscript, "")
    if profile and text:
        limit = profile.get("max_words")
        if limit is not None:
            if type(limit) is not int or limit <= 0:
                raise ValueError("max_words must be positive")
            count = len(text.split())
            checks.append({"code": "word_limit", "status": "pass" if count <= limit else "fail", "words": count, "limit": limit})
        headings = profile.get("required_headings", [])
        if not isinstance(headings, list) or any(not isinstance(h, str) or not h.strip() for h in headings):
            raise ValueError("required_headings must be strings")
        actual = {h.strip().casefold() for h in re.findall(r"^#{1,6}\s+(.+)$", text, re.M)}
        for heading in headings:
            checks.append({"code": "required_heading", "heading": heading, "status": "pass" if heading.casefold() in actual else "fail"})
    else:
        checks.append({"code": "venue_requirements", "status": "not_checked"})
    if any(Path(p).suffix.lower() in (".pdf", ".docx") for p in seen):
        checks.append({"code": "pdf_docx_metadata_and_anonymity", "status": "not_checked"})
    return {"verdict": "FAIL" if any(c["status"] == "fail" for c in checks) else "NOT_CHECKED" if any(c["status"] == "not_checked" for c in checks) else "PASS",
            "checks": checks, "scope": "declared-files-checksums-disclosures-and-explicit-text-profile"}
