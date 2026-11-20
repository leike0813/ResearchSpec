"""Standard-library CLI for auditable systematic-review screening data."""
from __future__ import annotations

import argparse
import collections
import hashlib
import json
from pathlib import Path
import random
import sys

from screening_common import SCHEMA, ScreeningError, load_json, print_json, save_json
from screening_config import config_hash, load_config, stage_codes, valid_decision
from screening_import import prepare_records


FT_SNAPSHOTS = ("ta_snapshot", "retrieval_snapshot")


def _object(path, label):
    value = load_json(path)
    if not isinstance(value, dict):
        raise ScreeningError(f"{label} must be a JSON object: {path}")
    return value


def merge_ballots(ballot_a, ballot_b, config, stage, records, manifest, protocol_hash, dataset_hash, seeds, retry_ids=None, previous=None):
    """Merge blind ballots by label, retaining conflicts and malformed entries as pending."""
    expected_hash = config_hash(config, stage)
    headers = [ballot.get("header", ballot) for ballot in (ballot_a, ballot_b)]
    seats = [header.get("reviewer_seat") for header in headers]
    if seats != ["A", "B"]:
        raise ScreeningError("ballot A must be reviewer seat A and ballot B must be reviewer seat B")
    if not isinstance(records, list) or (stage == "ft" and not isinstance(manifest, dict)) or (stage != "ft" and not isinstance(manifest, list)):
        raise ScreeningError("authoritative records and stage manifest are required")
    record_ids = {str(row.get("id")): row for row in records if isinstance(row, dict) and row.get("id") is not None}
    if len(record_ids) != len(records):
        raise ScreeningError("authoritative records contain missing or duplicate ids")
    batch_id = headers[0].get("batch_id")
    if headers[1].get("batch_id") != batch_id:
        raise ScreeningError("ballot batch mismatch")
    if stage == "ft":
        ft_rows = manifest.get("records")
        if not isinstance(ft_rows, list):
            raise ScreeningError("FT merge requires the current full_text_manifest.json")
        manifest_ids = [row.get("id") for row in ft_rows if isinstance(row, dict)]
        if len(manifest_ids) != len(ft_rows) or len(set(manifest_ids)) != len(manifest_ids):
            raise ScreeningError("retrieved full-text manifest has invalid or duplicate ids")
        ta_batches = {record_id: row.get("batch") for record_id, row in record_ids.items()}
        batch_ids = [record_id for record_id in manifest_ids if ta_batches.get(record_id) == batch_id]
        if batch_id is None or not batch_ids:
            raise ScreeningError("FT batch is empty or absent from the retrieved manifest")
    else:
        batch = next((row for row in manifest if isinstance(row, dict) and row.get("batch") == batch_id), None)
        if batch is None:
            raise ScreeningError("ballot batch is absent from the authoritative manifest")
        batch_ids = batch.get("ids")
    if not isinstance(batch_ids, list) or len(set(batch_ids)) != len(batch_ids) or any(record_id not in record_ids for record_id in batch_ids):
        raise ScreeningError("manifest batch has invalid or unknown record ids")
    allowed_ids = set(retry_ids) if retry_ids is not None else set(batch_ids)
    if not allowed_ids <= set(batch_ids):
        raise ScreeningError("retry scope contains ids outside the authoritative batch")
    if retry_ids is not None and (not isinstance(previous, dict) or previous.get("protocol_sha256") != protocol_hash or
                                  previous.get("config_hash") != expected_hash or previous.get("dataset_hash") != dataset_hash or
                                  previous.get("batch_id") != batch_id or previous.get("stage") != stage or
                                  previous.get("pending") != sorted(allowed_ids)):
        raise ScreeningError("previous result identity or pending scope does not match this retry")
    partition = {key: manifest[key] for key in FT_SNAPSHOTS} if stage == "ft" else {}
    if previous and any(previous.get(key) != value for key, value in partition.items()):
        raise ScreeningError("previous result belongs to a different full-text partition")
    for header in headers:
        if (header.get("stage") != stage or header.get("config_hash") != expected_hash or
                header.get("protocol_sha256") != protocol_hash or header.get("protocol_revision") != protocol_hash):
            raise ScreeningError("ballot stage, config hash, or protocol content hash mismatch")
        if header.get("dataset_hash") != dataset_hash:
            raise ScreeningError("ballot dataset hash does not match prepared records")
        if any(header.get(key) != value for key, value in partition.items()):
            raise ScreeningError("ballot belongs to a different full-text partition")
    def decisions(ballot):
        values = ballot.get("decisions", ballot.get("entries", []))
        if not isinstance(values, list):
            raise ScreeningError("ballot decisions must be an array")
        indexed = {}
        for row in values:
            if not isinstance(row, dict) or not isinstance(row.get("id"), str):
                raise ScreeningError("every ballot decision needs a record id")
            if row["id"] in indexed:
                raise ScreeningError(f"duplicate record id in ballot: {row['id']}")
            if row["id"] not in allowed_ids:
                raise ScreeningError(f"ballot contains record outside the authorized batch/retry scope: {row['id']}")
            indexed[row["id"]] = row
        return indexed
    left, right = decisions(ballot_a), decisions(ballot_b)
    ids = allowed_ids
    result, conflicts, pending, disagreements = [], [], [], []
    if previous is not None:
        old_rows = previous.get("decisions")
        if not isinstance(old_rows, list) or len({row.get("id") for row in old_rows if isinstance(row, dict)}) != len(old_rows):
            raise ScreeningError("previous merge decisions are malformed or duplicated")
        old_by_id = {row["id"]: row for row in old_rows}
        if set(old_by_id) != set(batch_ids) or previous.get("batch_ids") != sorted(set(batch_ids)):
            raise ScreeningError("previous merge does not represent the complete authoritative batch")
        result.extend(row for row in old_rows if row["id"] not in allowed_ids)
    for record_id in sorted(ids):
        a, b = left.get(record_id), right.get(record_id)
        row = {"id": record_id, "status": "pending", "d": "pending", "code": None, "reasons": [], "source": "pending"}
        good = []
        for seat, decision in (("A", a), ("B", b)):
            if decision is None:
                row.setdefault("causes", []).append(f"missing_{seat}")
                continue
            if decision.get("status", "decided") != "decided" or not valid_decision(decision, stage_codes(config, stage)):
                row.setdefault("causes", []).append(f"invalid_or_pending_{seat}")
                continue
            good.append((seat, decision))
            reason = decision.get("reason")
            if isinstance(reason, str) and reason:
                row["reasons"].append({"seat": seat, "reason": reason})
        if len(good) == 2:
            (seat_a, da), (seat_b, db) = good
            row["reviewer_decisions"] = {"A": da, "B": db}
            if da["d"] == db["d"] == "exclude":
                code_order = stage_codes(config, stage)
                selected_code = min((da["code"], db["code"]), key=code_order.index)
                selected = da if da["code"] == selected_code else db
                row.update(status="decided", d="exclude", code=selected_code, source="exclusion_code_order")
                if stage == "ft":
                    row["where"] = selected.get("where")
                if da["code"] != db["code"]:
                    row["code_disagreement"] = [da["code"], db["code"]]
                    disagreements.append(record_id)
            elif da["d"] == db["d"]:
                row.update(status="decided", d=da["d"], code=da["code"], source="agreement")
                if da["code"] != db["code"]:
                    row["code_disagreement"] = [da["code"], db["code"]]
                    disagreements.append(record_id)
            elif stage == "ta" and {da["d"], db["d"]} == {"include", "unclear"}:
                row.update(status="decided", d="include", code="INC", source="include_unclear_rule")
            else:
                conflicts.append(record_id)
                row["conflict"] = {"A": da["d"], "B": db["d"]}
                if config["conflict_policy"] == "liberal" and (da["d"] in ("include", "unclear") or db["d"] in ("include", "unclear")):
                    advancing = da if da["d"] in ("include", "unclear") else db
                    row.update(status="decided", d=advancing["d"], code=advancing["code"], source="liberal_conflict")
                else:
                    row["causes"] = ["conflict_requires_adjudication"]
        if record_id in seeds and any(item[1]["d"] == "exclude" for item in good):
            row["seed_block"] = True
            row["status"] = "pending"
            row["causes"] = row.get("causes", []) + ["excluded_seed_requires_override_or_protocol_amendment"]
        if row["status"] == "pending":
            pending.append(record_id)
        result.append(row)
    result.sort(key=lambda row: row["id"])
    return {**partition, "schema": SCHEMA, "stage": stage, "protocol_revision": protocol_hash,
            "protocol_sha256": protocol_hash, "config_hash": expected_hash, "dataset_hash": dataset_hash,
            "batch_id": headers[0].get("batch_id"), "batch_ids": sorted(set(batch_ids)), "decisions": result, "conflicts": conflicts,
            "pending": pending, "retry_ids": pending, "code_disagreements": disagreements,
            "counts": dict(collections.Counter(row["d"] for row in result))}


def apply_overrides(merged, overrides, config):
    by_id = {row["id"]: row for row in merged["decisions"]}
    for override in overrides:
        record_id, reason = override.get("id"), override.get("reason")
        maker = override.get("decision_maker")
        if record_id not in by_id or not isinstance(reason, str) or not reason.strip() or not isinstance(maker, str) or not maker.strip():
            raise ScreeningError("each manual override needs a known id, decision_maker, and non-empty reason")
        row = by_id[record_id]
        row.update({"d": override.get("d"), "code": override.get("code"), "status": "decided", "source": "human_override",
                    "decision_maker": maker.strip(), "override_reason": reason.strip()})
        if "where" in override:
            row["where"] = override["where"]
        row.pop("seed_block", None)
        row.pop("causes", None)
        if row["d"] not in ("include", "unclear", "exclude"):
            raise ScreeningError(f"invalid override label for {record_id}")
        if not valid_decision(row, stage_codes(config, merged["stage"])):
            raise ScreeningError(f"invalid override code for {record_id}")
    merged["pending"] = [row["id"] for row in merged["decisions"] if row["status"] == "pending"]
    merged["retry_ids"] = merged["pending"][:]
    merged["counts"] = dict(collections.Counter(row["d"] for row in merged["decisions"]))
    return merged


def qc_candidates(merged, records, config):
    text = {str(row.get("id")): " ".join(str(row.get(key, "")) for key in ("title", "abstract")) for row in records}
    excluded = {row["id"] for row in merged["decisions"] if row.get("status") == "decided" and row.get("d") == "exclude"}
    candidates = set()
    import re
    groups = config["qc"].get("near_miss", {})
    for record_id in excluded:
        body = text.get(record_id, "")
        if groups and all(any(re.search(pattern, body, re.I) for pattern in patterns) for patterns in groups.values()):
            candidates.add(record_id)
    jointly_excluded = [row["id"] for row in merged["decisions"]
                        if row.get("status") == "decided" and row.get("d") == "exclude"
                        and all(row.get("reviewer_decisions", {}).get(seat, {}).get("d") == "exclude" for seat in ("A", "B"))]
    size = min(len(jointly_excluded), config["qc"]["random_exclusion_sample"])
    sample = sorted(random.Random(config["qc"]["random_seed"]).sample(sorted(jointly_excluded), size))
    candidates.update(sample)
    return {"near_miss": sorted(candidates - set(sample)), "joint_exclusion_sample": sample,
            "pending_qc": sorted(candidates), "policy": config["qc"].get("policy", "advance")}


def _validated_ft_partition(work, records, config):
    work = Path(work)
    manifest = _object(work / "full_text_manifest.json", "authoritative full-text manifest")
    retrieved = manifest.get("records")
    if not isinstance(retrieved, list):
        raise ScreeningError("authoritative full-text manifest has no retrieved record list")
    return retrieved, manifest.get("not_retrieved", []), manifest


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    prep = commands.add_parser("prepare", help="import exports, deduplicate, and create stable screening batches")
    prep.add_argument("work"); prep.add_argument("inputs", nargs="+"); prep.add_argument("--config"); prep.add_argument("--force", action="store_true")
    merge = commands.add_parser("merge", help="merge two blind ballot JSON files")
    merge.add_argument("ballot_a"); merge.add_argument("ballot_b"); merge.add_argument("--config"); merge.add_argument("--protocol", required=True, help="confirmed screening_protocol.md"); merge.add_argument("--stage", choices=("pilot", "ta", "ft"), required=True); merge.add_argument("--work", required=True); merge.add_argument("--retry-from"); merge.add_argument("--overrides"); merge.add_argument("--output", required=True)
    combine = commands.add_parser("combine", help="combine complete merged batches for a stage")
    combine.add_argument("--work", required=True); combine.add_argument("--stage", choices=("ta", "ft"), required=True); combine.add_argument("--batches", nargs="*", required=True); combine.add_argument("--protocol", required=True); combine.add_argument("--config"); combine.add_argument("--output", required=True)
    header = commands.add_parser("ballot-header", help="emit the authoritative header for one reviewer ballot")
    header.add_argument("--work", required=True); header.add_argument("--stage", choices=("pilot", "ta", "ft"), required=True); header.add_argument("--batch", required=True); header.add_argument("--seat", choices=("A", "B"), required=True); header.add_argument("--protocol", required=True); header.add_argument("--config"); header.add_argument("--output")
    qc = commands.add_parser("qc", help="select near misses and reproducible joint-exclusion QC sample")
    qc.add_argument("merged"); qc.add_argument("records"); qc.add_argument("--config"); qc.add_argument("--reviewed"); qc.add_argument("--output", required=True)
    ft = commands.add_parser("ft-manifest", help="create the full-text retrieval manifest")
    ft.add_argument("merged"); ft.add_argument("records"); ft.add_argument("--work", required=True); ft.add_argument("--retrieval", required=True); ft.add_argument("--config"); ft.add_argument("--output", required=True)
    export = commands.add_parser("export", help="export screening data as PRISMA summary, RIS, corpus, or methods")
    export.add_argument("merged"); export.add_argument("records"); export.add_argument("--format", choices=("prisma", "ris", "corpus", "method", "log"), required=True); export.add_argument("--work", required=True); export.add_argument("--config"); export.add_argument("--output", required=True)
    args = parser.parse_args(argv)
    try:
        config = load_config(getattr(args, "config", None))
        if args.command == "prepare":
            result = prepare_records(args.inputs, args.work, config, force=args.force)
        elif args.command == "ballot-header":
            work = Path(args.work)
            records_file = _object(work / "records.json", "prepared records")
            protocol_hash = hashlib.sha256(Path(args.protocol).read_bytes()).hexdigest()
            manifest = load_json(work / "manifest.json")
            batch = next((row for row in manifest if isinstance(row, dict) and row.get("batch") == args.batch), None)
            if batch is None:
                raise ScreeningError("requested batch is absent from authoritative manifest")
            header = {"reviewer_seat": args.seat, "stage": args.stage, "protocol_revision": protocol_hash,
                      "protocol_sha256": protocol_hash, "dataset_hash": records_file.get("dataset_hash"),
                      "config_hash": config_hash(config, args.stage), "batch_id": args.batch}
            if args.stage == "ft":
                retrieved, _, ft_manifest = _validated_ft_partition(work, records_file.get("unique"), config)
                ids = {row.get("id") for row in retrieved if isinstance(row, dict)}
                source_ids = {row.get("id") for row in records_file.get("unique", []) if row.get("batch") == args.batch}
                if not ids.intersection(source_ids):
                    raise ScreeningError("requested FT batch has no retrieved records")
                header.update({key: ft_manifest[key] for key in FT_SNAPSHOTS})
            result = {"header": header}
            if args.output:
                save_json(args.output, result)
        elif args.command == "merge":
            work = Path(args.work)
            records_file = _object(work / "records.json", "prepared records")
            protocol_hash = hashlib.sha256(Path(args.protocol).read_bytes()).hexdigest()
            previous = _object(args.retry_from, "previous merge") if args.retry_from else None
            retry_ids = previous.get("pending") if previous is not None else None
            manifest_file = (_object(work / "full_text_manifest.json", "authoritative full-text manifest")
                             if args.stage == "ft" else load_json(work / "manifest.json"))
            seed_matches = load_json(work / "seeds.json")
            if not isinstance(seed_matches, list) or any(not isinstance(row, dict) for row in seed_matches):
                raise ScreeningError("prepared seed matches are missing or invalid")
            seed_ids = {row["id"] for row in seed_matches if row.get("id")}
            result = merge_ballots(_object(args.ballot_a, "ballot A"), _object(args.ballot_b, "ballot B"), config, args.stage, records_file.get("unique"), manifest_file, protocol_hash, records_file.get("dataset_hash"), seed_ids, retry_ids, previous)
            if args.overrides:
                overrides = load_json(args.overrides, [])
                if not isinstance(overrides, list): raise ScreeningError("overrides must be an array")
                result = apply_overrides(result, overrides, config)
            save_json(args.output, result)
        elif args.command == "qc":
            record_data = load_json(args.records, [])
            records = record_data.get("unique", []) if isinstance(record_data, dict) else record_data
            result = qc_candidates(_object(args.merged, "merged decisions"), records, config)
            if args.reviewed:
                reviewed = load_json(args.reviewed)
                pending = set(result["pending_qc"])
                if not isinstance(reviewed, list) or {row.get("id") for row in reviewed if isinstance(row, dict)} != pending:
                    raise ScreeningError("QC review must cover every candidate exactly once")
                seen = set()
                for row in reviewed:
                    if row["id"] in seen or row.get("decision") not in ("confirm", "flag") or not all(isinstance(row.get(key), str) and row[key].strip() for key in ("reviewer", "reason")):
                        raise ScreeningError("each QC review needs a unique id, reviewer, reason, and confirm/flag decision")
                    seen.add(row["id"])
                result["reviews"] = reviewed
                result["pending_qc"] = []
            save_json(args.output, result)
        elif args.command == "combine":
            work = Path(args.work)
            records_file = _object(work / "records.json", "prepared records")
            if args.stage == "ft":
                retrieved, _, manifest_file = _validated_ft_partition(work, records_file.get("unique"), config)
                valid_ids = {row.get("id") for row in retrieved if isinstance(row, dict)}
            else:
                manifest_file = load_json(work / "manifest.json")
                valid_ids = {record_id for batch in manifest_file for record_id in batch.get("ids", [])}
            protocol_hash = hashlib.sha256(Path(args.protocol).read_bytes()).hexdigest()
            combined = []
            seen = set()
            seen_batches = set()
            expected_by_batch = {}
            if args.stage == "ta":
                expected_by_batch = {item["batch"]: set(item["ids"]) for item in manifest_file}
            else:
                for record in records_file.get("unique", []):
                    record_id = record.get("id")
                    source_batch = record.get("batch")
                    if record_id in valid_ids:
                        expected_by_batch.setdefault(source_batch, set()).add(record_id)
            partition = {key: manifest_file[key] for key in FT_SNAPSHOTS} if args.stage == "ft" else {}
            for filename in args.batches:
                part = _object(filename, "batch merge")
                if part.get("stage") != args.stage or part.get("protocol_sha256") != protocol_hash or part.get("config_hash") != config_hash(config, args.stage) or part.get("dataset_hash") != records_file.get("dataset_hash"):
                    raise ScreeningError("batch result identity mismatch")
                if any(part.get(key) != value for key, value in partition.items()):
                    raise ScreeningError("batch belongs to a different full-text partition")
                batch_id = part.get("batch_id")
                part_ids = {row.get("id") for row in part.get("decisions", []) if isinstance(row, dict)}
                if batch_id in seen_batches or part_ids != expected_by_batch.get(batch_id) or part.get("batch_ids") != sorted(part_ids):
                    raise ScreeningError("batch result does not match its authoritative batch identity")
                seen_batches.add(batch_id)
                if seen.intersection(row.get("id") for row in part.get("decisions", [])):
                    raise ScreeningError("batch results overlap in record ids")
                combined.extend(part.get("decisions", [])); seen.update(row.get("id") for row in part.get("decisions", []))
            if seen != valid_ids:
                raise ScreeningError("combined batch results do not exactly cover the authoritative stage record set")
            combined.sort(key=lambda row: row["id"])
            pending = sorted(row["id"] for row in combined if row.get("status") != "decided")
            result = {**partition, "schema": SCHEMA, "stage": args.stage, "protocol_sha256": protocol_hash, "protocol_revision": protocol_hash,
                      "config_hash": config_hash(config, args.stage), "dataset_hash": records_file.get("dataset_hash"),
                      "batch_id": "all", "batch_ids": sorted(valid_ids), "decisions": combined, "pending": pending,
                      "retry_ids": pending, "conflicts": sorted(row["id"] for row in combined if row.get("conflict")),
                      "counts": dict(collections.Counter(row.get("d", "pending") for row in combined))}
            save_json(args.output, result)
        elif args.command == "ft-manifest":
            from screening_export import prepare_full_text
            record_data = load_json(args.records, [])
            records = record_data.get("unique", []) if isinstance(record_data, dict) else record_data
            retrieval = _object(args.retrieval, "retrieval facts")
            result = prepare_full_text(args.work, _object(args.merged, "merged decisions"), records, retrieval, config)
            save_json(args.output, result)
        else:
            from screening_export import export_data
            record_data = load_json(args.records, [])
            records = record_data.get("unique", []) if isinstance(record_data, dict) else record_data
            export_data(_object(args.merged, "merged decisions"), records, args.output, args.format, config, work=args.work)
            result = {"output": str(Path(args.output).resolve()), "format": args.format}
        print_json(result)
        return 0
    except (ScreeningError, OSError, ValueError, KeyError) as exc:
        print(f"screening-tools: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
