"""Auditable full-text preparation and reporting exports for SR screening."""
from __future__ import annotations

import collections
import json
from pathlib import Path
import re

from screening_common import SCHEMA, ScreeningError, digest, save_json, write_csv


def _indexed(records):
    result = {}
    for row in records:
        if not isinstance(row, dict) or not isinstance(row.get("id"), str) or row["id"] in result:
            raise ScreeningError("records must have unique string ids")
        result[row["id"]] = row
    return result


def _decisions(merged, allowed=None, require_all=True):
    rows = merged.get("decisions")
    if not isinstance(rows, list):
        raise ScreeningError("merged decisions must contain an array")
    indexed = {}
    for row in rows:
        if not isinstance(row, dict) or not isinstance(row.get("id"), str) or row["id"] in indexed:
            raise ScreeningError("decisions must have unique string ids")
        indexed[row["id"]] = row
    if allowed is not None and (not set(indexed) <= set(allowed) or require_all and set(indexed) != set(allowed)):
        raise ScreeningError("every prepared report needs exactly one full-text decision")
    return indexed


def _ta_snapshot(merged):
    return digest({"dataset_hash": merged.get("dataset_hash"),
                   "protocol_revision": merged.get("protocol_revision"),
                   "protocol_sha256": merged.get("protocol_sha256"),
                   "config_hash": merged.get("config_hash"),
                   "decisions": sorted(merged.get("decisions", []), key=lambda row: row["id"])})


def _qc_state(qc, config):
    arrays = ("near_miss", "joint_exclusion_sample", "pending_qc")
    if (not isinstance(qc, dict) or any(not isinstance(qc.get(key), list) for key in arrays) or
            qc.get("policy") not in ("advance", "flag")):
        raise ScreeningError("QC state is absent or malformed")
    if any(any(not isinstance(record_id, str) for record_id in qc[key]) or
           len(set(qc[key])) != len(qc[key]) for key in arrays):
        raise ScreeningError("QC candidate lists must contain unique record ids")
    policy = (config or {}).get("qc", {}).get("policy", "advance")
    if qc["policy"] != policy:
        raise ScreeningError("QC policy does not match the confirmed config")
    candidates = set(qc["near_miss"]) | set(qc["joint_exclusion_sample"])
    pending = set(qc["pending_qc"])
    reviews = qc.get("reviews", [])
    if not isinstance(reviews, list):
        raise ScreeningError("QC reviews must be an array")
    reviewed = {}
    for row in reviews:
        if (not isinstance(row, dict) or not isinstance(row.get("id"), str) or row["id"] in reviewed or
                row.get("decision") not in ("confirm", "flag") or
                not all(isinstance(row.get(key), str) and row[key].strip() for key in ("reviewer", "reason"))):
            raise ScreeningError("QC reviews need unique ids, decisions, reviewers, and reasons")
        reviewed[row["id"]] = row
    if (not pending <= candidates or not set(reviewed) <= candidates or pending & set(reviewed) or
            pending | set(reviewed) != candidates):
        raise ScreeningError("QC candidates must be either pending or covered by a review")
    return reviewed, pending


def apply_qc(merged, qc, config=None):
    """Apply audited QC advances once while retaining the original decision and ballots."""
    reviewed, _ = _qc_state(qc, config)
    result = json.loads(json.dumps(merged))
    decisions = _decisions(result)
    policy = (config or {}).get("qc", {}).get("policy", "advance")
    for record_id, review in reviewed.items():
        row = decisions.get(record_id)
        if row is None:
            raise ScreeningError(f"QC review references an unknown decision: {record_id}")
        row["qc_review"] = dict(review)
        row["qc_policy"] = policy
        if policy == "advance" and review["decision"] == "flag" and row.get("d") == "exclude":
            if not row.get("qc_applied"):
                row["pre_qc"] = {key: value for key, value in row.items() if key not in ("qc_review", "qc_policy", "qc_applied")}
                row.update(d="include", code="INC", source="QC", qc_applied=True)
    return result


def prepare_full_text(work, merged, records, retrieval, config=None):
    """List TA advances, or persist coordinator retrieval facts with tool-generated identities."""
    lookup = _indexed(records)
    ta = _decisions(merged, lookup)
    qc_file = Path(work) / "qc.json"
    if not qc_file.exists():
        raise ScreeningError("QC must be completed before FT preparation")
    qc = json.loads(qc_file.read_text(encoding="utf-8"))
    _, qc_pending = _qc_state(qc, config)
    ta_merged = apply_qc(merged, qc, config)
    ta = _decisions(ta_merged, lookup)
    pending = set(ta_merged.get("pending", [])) | {key for key, row in ta.items() if row.get("status") != "decided"} | qc_pending
    if pending:
        raise ScreeningError("TA adjudication, pending decisions, or QC must be resolved before FT preparation")
    advances = {key for key, row in ta.items() if row.get("d") in ("include", "unclear")}
    candidate_rows = [{"id": record_id, "title": lookup[record_id].get("title", ""),
                       "doi": lookup[record_id].get("doi", ""), "study_id": lookup[record_id].get("study_id", record_id),
                       "source_record": lookup[record_id], "source_decision": ta[record_id]}
                      for record_id in sorted(advances)]
    if retrieval is None:
        return {"schema": SCHEMA, "stage": "ft", "ta_snapshot": _ta_snapshot(merged), "records": candidate_rows}
    manifest_path = Path(work) / "full_text_manifest.json"
    if not isinstance(retrieval, dict):
        raise ScreeningError("coordinator must provide a retrieval object")
    retrieved = retrieval.get("retrieved")
    not_retrieved = retrieval.get("not_retrieved")
    if not isinstance(retrieved, list) or not isinstance(not_retrieved, list):
        raise ScreeningError("retrieval object must contain retrieved and not_retrieved arrays")
    retrieved_ids = [row.get("id") if isinstance(row, dict) else row for row in retrieved]
    missing_rows = [dict(row) for row in not_retrieved]
    missing_ids = [row.get("id") for row in missing_rows]
    if (any(not isinstance(record_id, str) for record_id in retrieved_ids + missing_ids) or
            len(set(retrieved_ids)) != len(retrieved_ids) or len(set(missing_ids)) != len(missing_ids) or
            set(retrieved_ids) & set(missing_ids) or set(retrieved_ids) | set(missing_ids) != advances):
        raise ScreeningError("retrieved and not-retrieved facts must partition current TA advances exactly")
    rows = [{"id": record_id, "title": lookup[record_id].get("title", ""),
             "doi": lookup[record_id].get("doi", ""), "pdf": (next((row.get("pdf") for row in retrieved
                    if isinstance(row, dict) and row.get("id") == record_id), None)),
             "study_id": lookup[record_id].get("study_id", record_id), "source_record": lookup[record_id],
             "source_decision": ta[record_id]} for record_id in sorted(retrieved_ids)]
    result = {"schema": SCHEMA, "stage": "ft", "ta_snapshot": _ta_snapshot(ta_merged),
              "retrieval_snapshot": digest({"retrieved": sorted(retrieved_ids), "not_retrieved": missing_rows}),
              "records": rows, "not_retrieved": missing_rows}
    save_json(Path(work) / "ta-merged.json", ta_merged)
    save_json(manifest_path, result)
    return result


def _study_id(record, decision):
    return str(decision.get("study_id") or record.get("study_id") or record.get("group_id") or decision["id"])


def _read_json(work, name, required=True):
    path = Path(work) / name
    if not path.exists():
        if required:
            raise ScreeningError(f"authoritative {name} is required")
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        raise ScreeningError(f"invalid {name}: {exc}") from exc


def _authoritative_state(work, merged, records, config=None):
    record_file = _read_json(work, "records.json")
    authoritative = record_file.get("unique") if isinstance(record_file, dict) else None
    if not isinstance(authoritative, list):
        raise ScreeningError("records.json must contain the authoritative unique record list")
    lookup = _indexed(authoritative)
    passed = _indexed(records)
    if passed != lookup:
        raise ScreeningError("supplied records differ from authoritative records.json")
    dataset_hash = record_file.get("dataset_hash")
    if dataset_hash and merged.get("dataset_hash") != dataset_hash:
        raise ScreeningError("merged decision dataset identity does not match records.json")
    identification = _read_json(work, "identification.json")
    raw_count = identification.get("raw_total")
    duplicate_count = identification.get("duplicates_removed")
    if (not isinstance(raw_count, int) or isinstance(raw_count, bool) or raw_count < len(lookup) or
            duplicate_count != raw_count - len(lookup) or identification.get("unique_total") != len(lookup)):
        raise ScreeningError("identification.json totals do not match authoritative records")
    ta = merged if merged.get("stage") == "ta" else None
    if ta is None:
        ta = next((_read_json(work, name, False) for name in ("ta-merged.json", "merged-ta.json", "ta.json")
                   if (Path(work) / name).exists()), None)
    if not isinstance(ta, dict) or ta.get("stage") != "ta":
        raise ScreeningError("current authoritative TA decisions are required")
    qc = _read_json(work, "qc.json")
    _, qc_pending = _qc_state(qc, config)
    ta = apply_qc(ta, qc, config)
    ta_decisions = _decisions(ta, lookup, require_all=False)
    if (set(ta_decisions) != set(lookup) or ta.get("pending") or qc_pending or
            any(row.get("status") != "decided" for row in ta_decisions.values())):
        ta_complete = False
    else:
        ta_complete = True
    ta_snapshot = _ta_snapshot(ta)
    return lookup, identification, ta, ta_decisions, ta_complete, ta_snapshot, qc_pending


def _fulltext_partition(work, ta_decisions, ta_snapshot):
    manifest = _read_json(work, "full_text_manifest.json", False)
    if not isinstance(manifest, dict):
        return None, None, False
    manifest_rows = manifest.get("records")
    missing = manifest.get("not_retrieved")
    if not isinstance(manifest_rows, list) or not isinstance(missing, list):
        return None, None, False
    retrieved_ids = [row.get("id") for row in manifest_rows if isinstance(row, dict)]
    missing_ids = [row.get("id") for row in missing if isinstance(row, dict)]
    advanced = {key for key, row in ta_decisions.items() if row.get("d") in ("include", "unclear")}
    valid = (len(retrieved_ids) == len(manifest_rows) and len(missing_ids) == len(missing) and
             len(set(retrieved_ids)) == len(retrieved_ids) and len(set(missing_ids)) == len(missing_ids) and
             not set(retrieved_ids) & set(missing_ids) and set(retrieved_ids) | set(missing_ids) == advanced and
             manifest.get("ta_snapshot") == ta_snapshot and
             manifest.get("retrieval_snapshot") == digest({"retrieved": sorted(retrieved_ids), "not_retrieved": missing}))
    return {row["id"]: row for row in manifest_rows if isinstance(row, dict)}, {row["id"]: row for row in missing if isinstance(row, dict)}, valid


def _where_present(value):
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, dict):
        return any(str(value.get(key, "")).strip() for key in ("page", "pages", "section", "chapter"))
    return False


def _csl_author(author):
    if not isinstance(author, dict):
        return False
    if set(author) == {"literal"}:
        return isinstance(author["literal"], str) and bool(author["literal"].strip())
    allowed = {"family", "given", "suffix", "dropping-particle", "non-dropping-particle",
               "comma-suffix", "static-ordering", "parse-names"}
    if not set(author) <= allowed or not isinstance(author.get("family"), str) or not author["family"].strip():
        return False
    return all(isinstance(value, str) for key, value in author.items() if key not in ("comma-suffix", "static-ordering", "parse-names")) and all(
        isinstance(value, (str, bool)) for key, value in author.items() if key in ("comma-suffix", "static-ordering", "parse-names"))


def export_data(merged, records, output, fmt, config=None, work=None):
    """Write exports only from the authoritative dataset and its current screening partitions."""
    if work is None:
        raise ScreeningError("work directory is required for authoritative export validation")
    lookup, identification, ta, ta_decisions, ta_complete, ta_snapshot, qc_pending = _authoritative_state(work, merged, records, config)
    decisions = _decisions(ta if merged.get("stage") == "ta" else merged)
    if not set(decisions) <= set(lookup):
        raise ScreeningError("decision references an unknown record")
    ft = merged.get("stage") == "ft"
    expected = ({key for key, row in ta_decisions.items() if row.get("d") in ("include", "unclear")}
                if ft else set(lookup))
    partition, not_retrieved, partition_current = _fulltext_partition(work, ta_decisions, ta_snapshot)
    if ft:
        manifest = _read_json(work, "full_text_manifest.json", False)
        if (not partition_current or not isinstance(manifest, dict) or
                merged.get("ta_snapshot") != manifest.get("ta_snapshot") or
                merged.get("retrieval_snapshot") != manifest.get("retrieval_snapshot")):
            raise ScreeningError("full-text manifest and not-retrieved list do not match current TA decisions")
        if not set(decisions) <= set(partition):
            raise ScreeningError("FT decisions include a record outside the retrieved manifest")
        for row in decisions.values():
            if row.get("status") == "decided" and row.get("d") == "exclude" and not _where_present(row.get("where")):
                raise ScreeningError(f"FT exclusion lacks page/section location: {row['id']}")
        if set(partition) | set(not_retrieved) != expected:
            raise ScreeningError("FT retrieved/not-retrieved partition is incomplete")
    complete = (ta_complete and set(ta_decisions) == set(lookup) and
                all(row.get("status") == "decided" for row in decisions.values()) and
                not merged.get("pending") and (not ft or partition_current and set(decisions) == set(partition)))
    provisional = not complete
    if fmt == "method":
        if not complete:
            raise ScreeningError("methods export is withheld until TA, QC, retrieval, and screening are complete")
        text = ("# Screening methods draft\n\n"
                "[TO COMPLETE: screening dates, human verification and sampling, final human-confirmed counts, "
                "model labels, tool/version, and applicable journal AI policy.]\n\n"
                "```json\n" + json.dumps({"schema": SCHEMA, "stage": merged.get("stage"),
                "protocol_revision": merged.get("protocol_revision"), "config_hash": merged.get("config_hash"),
                "reviewers": ["A", "B"], "conflict_policy": (config or {}).get("conflict_policy"),
                "provisional": provisional}, ensure_ascii=False, indent=2) + "\n```\n")
        Path(output).write_text(text, encoding="utf-8")
        return
    if fmt == "corpus":
        rows = list(decisions.values())
        included = [row for row in rows if row.get("status") == "decided" and row.get("d") == "include"]
        corpus = []
        for decision in included:
            record = lookup[decision["id"]]
            authors = record.get("authors") or []
            year = str(record.get("year", ""))
            if (not record.get("title") or not authors or not year.isdigit() or
                    not 1000 <= int(year) <= 2100 or not re.fullmatch(r"[A-Za-z][A-Za-z0-9_:-]*", decision["id"])):
                raise ScreeningError(f"corpus record lacks required title, authors, or year: {decision['id']}")
            doi = str(record.get("doi") or "").removeprefix("https://doi.org/").removeprefix("http://doi.org/").removeprefix("doi:")
            source = record.get("source_pointer") or record.get("source")
            source = (source if isinstance(source, str) and source.strip() else
                      "https://doi.org/" + doi if doi else
                      "https://pubmed.ncbi.nlm.nih.gov/" + str(record["pmid"]).strip("/") + "/" if record.get("pmid") else
                      "urn:sr-screener:" + decision["id"])
            if not re.fullmatch(r"10\.[0-9]{4,9}/[^\s]+", doi) and record.get("doi"):
                raise ScreeningError(f"invalid DOI in corpus record: {decision['id']}")
            corpus_authors = [a if isinstance(a, dict) else {"literal": str(a)} for a in authors]
            if not all(_csl_author(author) for author in corpus_authors):
                raise ScreeningError(f"corpus author is not a CSL-JSON name: {decision['id']}")
            corpus.append({"citation_key": decision["id"], "title": record["title"],
                "authors": corpus_authors, "year": int(record["year"]), "source_pointer": source,
                **({"venue": record["journal"]} if record.get("journal") else {}),
                **({"doi": doi} if doi else {}), "tags": ["FT-Include" if ft else "TA-Include"],
                "obtained_via": "other", "adapter_name": "sr-screener", "adapter_version": "1"})
        save_json(output, {"schema": SCHEMA, "literature_corpus": corpus, "provisional": provisional})
        return
    if fmt == "prisma":
        rows = list(decisions.values())
        counts = collections.Counter(row.get("d") for row in rows if row.get("status") == "decided")
        included_reports = [row for row in rows if row.get("status") == "decided" and row.get("d") == "include"]
        studies = {_study_id(lookup[row["id"]], row) for row in included_reports}
        ta_counts = collections.Counter(row.get("d") for row in ta_decisions.values() if row.get("status") == "decided")
        ta_pending_ids = (set(lookup) - {key for key, row in ta_decisions.items() if row.get("status") == "decided"}) | set(ta.get("pending", [])) | qc_pending
        decision_pending_ids = set(merged.get("pending", [])) | {
            key for key, row in decisions.items() if row.get("status") != "decided"}
        if ft and partition_current:
            decision_pending_ids.update(set(partition) - set(decisions))
        payload = {"schema": SCHEMA, "stage": merged.get("stage"), "provisional": provisional,
            "identified": identification["raw_total"], "duplicates_removed": identification["duplicates_removed"],
            "identified_by_database": identification.get("by_database", {}),
            "screened": ta_counts.total() if ft else sum(row.get("status") == "decided" for row in rows),
            "title_abstract_excluded": ta_counts["exclude"],
            "reports_sought": sum(row.get("d") in ("include", "unclear") and row.get("status") == "decided" for row in ta_decisions.values()),
            "reports_not_retrieved": len(not_retrieved) if ft and partition_current else None,
            "reports_assessed": sum(row.get("status") == "decided" for row in rows) if ft else None,
            "full_text_excluded_by_reason": dict(collections.Counter(row.get("code") for row in rows if ft and row.get("status") == "decided" and row.get("d") == "exclude")),
            "reports_included": len(included_reports) if ft else None, "studies_included": len(studies) if ft else None,
            "awaiting_classification": sum(row.get("d") == "unclear" for row in rows) if ft else 0,
            "pending": len(ta_pending_ids | decision_pending_ids)}
        save_json(output, payload)
        return
    if fmt == "log":
        rows = list(decisions.values())
        output_rows = []
        for decision in rows:
            record = lookup[decision["id"]]
            output_rows.append({"id": decision["id"], "title": record.get("title", ""),
                "stage": merged.get("stage", "ta"), "decision": decision.get("d", "pending"),
                "code": decision.get("code") or "", "reason": decision.get("override_reason") or
                    "; ".join(str(item.get("reason", "")) for item in decision.get("reasons", [])),
                "source": decision.get("source", ""), "study_id": _study_id(record, decision)})
        write_csv(output, ("id", "title", "stage", "decision", "code", "reason", "source", "study_id"), output_rows)
        return
    if fmt == "ris":
        rows = list(decisions.values())
        categories = {"include": [], "unclear": [], "exclude": []}
        for decision in rows:
            if decision.get("status") == "decided" and decision.get("d") in categories:
                categories[decision["d"]].append(decision)
        base = Path(output)
        for category, entries in categories.items():
            lines = []
            for decision in entries:
                record = lookup[decision["id"]]
                lines.extend(("TY  - JOUR", "ID  - " + decision["id"]))
                for key, tag in (("title", "TI"), ("journal", "JO"), ("doi", "DO"), ("year", "PY")):
                    if record.get(key): lines.append(f"{tag}  - {record[key]}")
                for author in record.get("authors", []): lines.append("AU  - " + str(author))
                lines.append("LB  - " + ("FT" if ft else "TA") + "-" + category.title())
                if decision.get("code"): lines.append("N1  - " + str(decision["code"]))
                lines.append("N1  - " + str(decision.get("override_reason", "")))
                lines.append("ER  -")
            Path(str(base.with_suffix("")) + f"-{category}.ris").write_text("\n".join(lines) + ("\n" if lines else ""), encoding="utf-8")
        return
    raise ScreeningError(f"unsupported export format: {fmt}")
