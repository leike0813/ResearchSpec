#!/usr/bin/env python3
"""Gate-driven historical research with Skill-local JSON state."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from historical_support import (  # noqa: E402
    LAYERS,
    SkillError,
    SkillArgumentParser,
    canonical_json,
    layer_record,
    read_json,
    require_string,
    run_cli,
    sha256_bytes,
    write_json,
    write_text,
)

NEXT_ACTIONS = ("submit-source", "submit-layer", "submit-evidence", "render", "complete")


def _state_path(run_dir: str) -> Path:
    return Path(run_dir).expanduser().resolve() / "state.json"


def _load(run_dir: str) -> tuple[Path, dict[str, Any]]:
    path = _state_path(run_dir)
    try:
        state = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise SkillError("run_not_found", "Run state does not exist; initialize the run first.", {"path": str(path)}) from exc
    except (OSError, json.JSONDecodeError) as exc:
        raise SkillError("invalid_state", "Run state is not readable JSON.", {"path": str(path)}) from exc
    if not isinstance(state, dict) or state.get("schema_version") != "1":
        raise SkillError("invalid_state", "Unsupported or malformed run state.")
    return path, state


def _state_hash(state: dict[str, Any]) -> str:
    value = {key: item for key, item in state.items() if key not in {"state_sha256", "rendered"}}
    return sha256_bytes(canonical_json(value).encode("utf-8"))


def _save(path: Path, state: dict[str, Any]) -> dict[str, Any]:
    state["state_sha256"] = _state_hash(state)
    return write_json(path, state, overwrite=True)


def _source_ids(state: dict[str, Any]) -> set[str]:
    return {item["source_id"] for item in state["sources"]}


def _missing_required_layer(state: dict[str, Any]) -> dict[str, Any] | None:
    for source in state["sources"]:
        source_id = source["source_id"]
        completed = state["layers"].get(source_id, {})
        for layer in LAYERS:
            plan = source["layer_plan"][layer]
            if plan["status"] == "required" and layer not in completed:
                return {"code": "missing-required-layer", "source_id": source_id, "layer": layer, "reason": plan["reason"], "next_action": "submit-layer"}
    return None


def _status(state: dict[str, Any]) -> dict[str, Any]:
    blockers: list[dict[str, Any]] = []
    if not state["source_registration_complete"]:
        blockers.append({"code": "source-registration-open", "next_action": "submit-source"})
    else:
        missing = _missing_required_layer(state)
        if missing:
            blockers.append(missing)
    if not blockers and not state["evidence"]:
        blockers.append({"code": "no-evidence", "next_action": "submit-evidence"})
    unresolved = [item for item in state["conflicts"] if item["status"] == "unresolved"]
    if not blockers and unresolved:
        blockers.extend({"code": "unresolved-conflict", "conflict_id": item["conflict_id"], "next_action": "submit-evidence"} for item in unresolved)
    if not blockers and not state["conflicts_reviewed"]:
        blockers.append({"code": "conflicts-unreviewed", "next_action": "submit-evidence"})
    if not blockers and not state["limitations_reviewed"]:
        blockers.append({"code": "limitations-unreviewed", "next_action": "submit-evidence"})
    if not blockers and state["synthesis"] is None:
        blockers.append({"code": "no-synthesis", "next_action": "submit-evidence"})
    next_action = blockers[0]["next_action"] if blockers else ("complete" if state["rendered"] else "render")
    if next_action not in NEXT_ACTIONS:
        raise SkillError("invalid_state", "State produced an unknown next action.")
    return {
        "run_id": state["run_id"],
        "phase": "complete" if next_action == "complete" else "active",
        "next_action": next_action,
        "status_token": state["state_sha256"],
        "blockers": blockers,
        "counts": {
            "sources": len(state["sources"]),
            "required_layers": sum(1 for source in state["sources"] for item in source["layer_plan"].values() if item["status"] == "required"),
            "submitted_layers": sum(len(value) for value in state["layers"].values()),
            "evidence": len(state["evidence"]),
            "conflicts": len(state["conflicts"]),
            "limitations": len(state["limitations"]),
        },
        "next_record_example": _example(state, next_action, blockers),
    }


def _example(state: dict[str, Any], next_action: str, blockers: list[dict[str, Any]]) -> dict[str, Any]:
    if next_action == "submit-source":
        return {"source_id": "source-1", "title": "Source title", "locator": "archive:locator", "provenance": {"sha256": "<sha256>"}, "layer_plan": {layer: {"status": "required" if layer == LAYERS[0] else "not-applicable", "reason": "Explain applicability."} for layer in LAYERS}, "registration_complete": True}
    if next_action == "submit-layer":
        blocker = blockers[0]
        return {"source_id": blocker["source_id"], "layer": blocker["layer"], "content": "<content>", "parent_id": "<source-or-layer-id>", "locator": "<locator>", "reason": "<transformation reason>", "uncertainty": "<uncertainty>", "review_state": "unreviewed", "operations": []}
    if next_action == "submit-evidence":
        code = blockers[0]["code"] if blockers else "no-evidence"
        if code == "unresolved-conflict":
            return {"record_type": "conflict", "conflict_id": blockers[0]["conflict_id"], "description": "<conflict>", "status": "resolved", "resolution": "<treatment>"}
        if code in {"conflicts-unreviewed", "limitations-unreviewed"}:
            return {"record_type": "review", "conflicts_reviewed": True, "limitations_reviewed": True}
        if code == "no-synthesis":
            return {"record_type": "synthesis", "text": "<synthesis>", "evidence_ids": ["evidence-1"]}
        return {"record_type": "evidence", "evidence_id": "evidence-1", "claim": "<claim>", "source_ids": sorted(_source_ids(state))[:1], "support": "supports"}
    if next_action == "render":
        return {"output_dir": "<output-dir>"}
    return {}


def _require_transition(args: argparse.Namespace, state: dict[str, Any], action: str) -> None:
    if args.status_token != state["state_sha256"]:
        raise SkillError("status_required", "Run status and pass its current --status-token before changing state.")
    actual = _status(state)["next_action"]
    if actual != action and not (action == "render" and actual == "complete"):
        raise SkillError("gate_order_violation", "The requested command is not the current next action.", {"next_action": actual})


def _validate_layer_plan(value: Any) -> dict[str, dict[str, str]]:
    if not isinstance(value, dict) or set(value) != set(LAYERS):
        raise SkillError("invalid_input", "layer_plan must declare every historical-source layer exactly once.")
    result: dict[str, dict[str, str]] = {}
    for layer in LAYERS:
        item = value[layer]
        if not isinstance(item, dict) or item.get("status") not in {"required", "not-applicable"} or not isinstance(item.get("reason"), str) or not item["reason"].strip():
            raise SkillError("invalid_input", "Each layer plan requires status required/not-applicable and a reason.", {"layer": layer})
        result[layer] = {"status": item["status"], "reason": item["reason"]}
    return result


def _receipt(command: str, saved: dict[str, Any], accepted: Any, input_value: dict[str, Any]) -> dict[str, Any]:
    return {"command": command, "accepted": accepted, "input_sha256": sha256_bytes(canonical_json(input_value).encode("utf-8")), "state_artifact": saved, "status_required": True}


def _init(args: argparse.Namespace) -> dict[str, Any]:
    path = _state_path(args.run_dir)
    if path.exists():
        raise SkillError("run_exists", "Refusing to replace an existing run state.", {"path": str(path)})
    scope = read_json(args.scope_file, "Scope file")
    require_string(scope, "question")
    require_string(scope, "source_strategy")
    run_id = args.run_id or sha256_bytes(canonical_json(scope).encode("utf-8"))[:16]
    state = {"schema_version": "1", "run_id": run_id, "scope": scope, "source_registration_complete": False, "sources": [], "layers": {}, "evidence": [], "conflicts": [], "conflicts_reviewed": False, "limitations": [], "limitations_reviewed": False, "synthesis": None, "rendered": False, "state_sha256": ""}
    saved = _save(path, state)
    return {"command": "init", "run_id": run_id, "state_artifact": saved, "status_required": True}


def _submit_source(args: argparse.Namespace) -> dict[str, Any]:
    path, state = _load(args.run_dir)
    _require_transition(args, state, "submit-source")
    record = read_json(args.record_file, "Source record")
    source_id = require_string(record, "source_id")
    if source_id in _source_ids(state):
        raise SkillError("duplicate_source", "Source ID already exists.", {"source_id": source_id})
    provenance = record.get("provenance")
    if not isinstance(provenance, dict) or not isinstance(provenance.get("sha256"), str) or len(provenance["sha256"]) != 64 or any(char not in "0123456789abcdef" for char in provenance["sha256"]):
        raise SkillError("invalid_input", "Source provenance requires lowercase SHA-256.")
    source = {"source_id": source_id, "title": require_string(record, "title"), "locator": require_string(record, "locator"), "provenance": provenance, "layer_plan": _validate_layer_plan(record.get("layer_plan"))}
    state["sources"].append(source)
    state["sources"].sort(key=lambda item: item["source_id"])
    state["layers"][source_id] = {}
    state["source_registration_complete"] = record.get("registration_complete") is True
    state["rendered"] = False
    saved = _save(path, state)
    return _receipt("submit-source", saved, source_id, record)


def _submit_layer(args: argparse.Namespace) -> dict[str, Any]:
    path, state = _load(args.run_dir)
    _require_transition(args, state, "submit-layer")
    record = read_json(args.record_file, "Layer record")
    source_id = require_string(record, "source_id")
    if source_id not in _source_ids(state):
        raise SkillError("unknown_source", "Layer references an unknown source.", {"source_id": source_id})
    layer = require_string(record, "layer")
    missing = _missing_required_layer(state)
    if missing is None or source_id != missing["source_id"] or layer != missing["layer"]:
        raise SkillError("gate_order_violation", "Submit the Gate's next required layer.", {"expected": missing})
    value = layer_record(layer, require_string(record, "content"), {"source_id": source_id, "parent_id": record.get("parent_id", source_id), "locator": record.get("locator", source_id)}, operations=record.get("operations") if isinstance(record.get("operations"), list) else [], tool_or_provider=str(record.get("tool_or_provider", "invoking-agent")), reason=require_string(record, "reason"), uncertainty=require_string(record, "uncertainty"), review_state=require_string(record, "review_state"))
    state["layers"][source_id][layer] = value
    state["rendered"] = False
    saved = _save(path, state)
    return _receipt("submit-layer", saved, {"source_id": source_id, "layer": layer}, record)


def _submit_evidence(args: argparse.Namespace) -> dict[str, Any]:
    path, state = _load(args.run_dir)
    _require_transition(args, state, "submit-evidence")
    record = read_json(args.record_file, "Evidence record")
    record_type = record.get("record_type")
    if record_type == "evidence":
        source_ids = record.get("source_ids")
        if not isinstance(source_ids, list) or not source_ids or not all(isinstance(item, str) for item in source_ids):
            raise SkillError("invalid_input", "Evidence requires non-empty source_ids.")
        unknown = sorted(set(source_ids) - _source_ids(state))
        if unknown:
            raise SkillError("unknown_source", "Evidence references unknown sources.", {"source_ids": unknown})
        evidence_id = require_string(record, "evidence_id")
        if any(item["evidence_id"] == evidence_id for item in state["evidence"]):
            raise SkillError("duplicate_record", "Evidence ID already exists.", {"evidence_id": evidence_id})
        state["evidence"].append({"evidence_id": evidence_id, "claim": require_string(record, "claim"), "source_ids": sorted(set(source_ids)), "support": str(record.get("support", "supports")), "note": str(record.get("note", ""))})
        state["evidence"].sort(key=lambda item: item["evidence_id"])
        accepted: Any = evidence_id
    elif record_type == "conflict":
        conflict_id = require_string(record, "conflict_id")
        status = record.get("status")
        if status not in {"unresolved", "resolved"}:
            raise SkillError("invalid_status", "Conflict status must be unresolved or resolved.")
        existing = next((item for item in state["conflicts"] if item["conflict_id"] == conflict_id), None)
        value = {"conflict_id": conflict_id, "description": require_string(record, "description"), "status": status, "resolution": str(record.get("resolution", ""))}
        if existing:
            existing.update(value)
        else:
            state["conflicts"].append(value)
        state["conflicts"].sort(key=lambda item: item["conflict_id"])
        state["conflicts_reviewed"] = False
        accepted = conflict_id
    elif record_type == "limitation":
        limitation_id = require_string(record, "limitation_id")
        state["limitations"] = [item for item in state["limitations"] if item["limitation_id"] != limitation_id]
        state["limitations"].append({"limitation_id": limitation_id, "description": require_string(record, "description")})
        state["limitations"].sort(key=lambda item: item["limitation_id"])
        state["limitations_reviewed"] = False
        accepted = limitation_id
    elif record_type == "review":
        if record.get("conflicts_reviewed") is not True or record.get("limitations_reviewed") is not True:
            raise SkillError("invalid_input", "Review must explicitly confirm conflicts and limitations.")
        state["conflicts_reviewed"] = True
        state["limitations_reviewed"] = True
        accepted = "review"
    elif record_type == "synthesis":
        if not state["conflicts_reviewed"] or not state["limitations_reviewed"]:
            raise SkillError("gate_blocked", "Review conflicts and limitations before synthesis.")
        evidence_ids = record.get("evidence_ids")
        if not isinstance(evidence_ids, list) or not evidence_ids or not all(isinstance(item, str) for item in evidence_ids):
            raise SkillError("invalid_input", "Synthesis requires non-empty evidence_ids.")
        unknown = sorted(set(evidence_ids) - {item["evidence_id"] for item in state["evidence"]})
        if unknown:
            raise SkillError("unknown_evidence", "Synthesis references unknown evidence.", {"evidence_ids": unknown})
        state["synthesis"] = {"text": require_string(record, "text"), "evidence_ids": sorted(set(evidence_ids))}
        accepted = "synthesis"
    else:
        raise SkillError("invalid_record_type", "Unknown evidence record type.", {"record_type": record_type})
    state["rendered"] = False
    saved = _save(path, state)
    return _receipt("submit-evidence", saved, accepted, record)


def _report(state: dict[str, Any]) -> str:
    lines = [f"# Historical research report: {state['run_id']}", "", "## Scope", "", state["scope"]["question"], "", "## Source strategy", "", state["scope"]["source_strategy"], "", "## Synthesis", "", state["synthesis"]["text"], "", "## Sources", ""]
    lines.extend(f"- `{item['source_id']}` — {item['title']} ({item['locator']})" for item in state["sources"])
    lines.extend(["", "## Conflicts", ""])
    lines.extend(f"- `{item['conflict_id']}` [{item['status']}]: {item['description']} — {item['resolution']}" for item in state["conflicts"])
    if not state["conflicts"]:
        lines.append("- None recorded; conflict review completed.")
    lines.extend(["", "## Limitations", ""])
    lines.extend(f"- `{item['limitation_id']}`: {item['description']}" for item in state["limitations"])
    if not state["limitations"]:
        lines.append("- None recorded; limitation review completed.")
    return "\n".join(lines) + "\n"


def _render(args: argparse.Namespace) -> dict[str, Any]:
    path, state = _load(args.run_dir)
    _require_transition(args, state, "render")
    output = Path(args.output_dir).expanduser().resolve()
    evidence_value = {"schema_version": "1", "run_id": state["run_id"], "evidence": state["evidence"], "conflicts": state["conflicts"], "limitations": state["limitations"], "synthesis_evidence_ids": state["synthesis"]["evidence_ids"]}
    report_artifact = write_text(output / "research-report.md", _report(state), overwrite=args.overwrite)
    evidence_artifact = write_json(output / "evidence-matrix.json", evidence_value, overwrite=args.overwrite)
    provenance_value = {"schema_version": "1", "run_id": state["run_id"], "state_sha256": state["state_sha256"], "sources": [{"source_id": item["source_id"], "locator": item["locator"], "provenance": item["provenance"], "layer_plan": item["layer_plan"], "layers": state["layers"][item["source_id"]]} for item in state["sources"]], "artifacts": [report_artifact, evidence_artifact], "researchspec_workflow_authority": False}
    provenance_artifact = write_json(output / "provenance.json", provenance_value, overwrite=args.overwrite)
    state["rendered"] = True
    saved = _save(path, state)
    return {"command": "render", "artifacts": [report_artifact, evidence_artifact, provenance_artifact], "state_artifact": saved, "status_required": True}


def _handle(args: argparse.Namespace) -> dict[str, Any]:
    if args.command == "init":
        return _init(args)
    if args.command == "status":
        _, state = _load(args.run_dir)
        return _status(state)
    if args.command == "submit-source":
        return _submit_source(args)
    if args.command == "submit-layer":
        return _submit_layer(args)
    if args.command == "submit-evidence":
        return _submit_evidence(args)
    if args.command == "check":
        _, state = _load(args.run_dir)
        status = _status(state)
        return {"command": "check", "valid": not status["blockers"], "next_action": status["next_action"], "blockers": status["blockers"]}
    if args.command == "render":
        return _render(args)
    raise SkillError("unknown_command", "Unknown historical-research command.", {"command": args.command})


def parser() -> argparse.ArgumentParser:
    root = SkillArgumentParser()
    commands = root.add_subparsers(dest="command", required=True)
    init = commands.add_parser("init")
    init.add_argument("--run-dir", required=True)
    init.add_argument("--scope-file", required=True)
    init.add_argument("--run-id")
    for name in ("status", "check"):
        item = commands.add_parser(name)
        item.add_argument("--run-dir", required=True)
    for name in ("submit-source", "submit-layer", "submit-evidence"):
        item = commands.add_parser(name)
        item.add_argument("--run-dir", required=True)
        item.add_argument("--record-file", required=True)
        item.add_argument("--status-token", required=True)
    render = commands.add_parser("render")
    render.add_argument("--run-dir", required=True)
    render.add_argument("--output-dir", required=True)
    render.add_argument("--status-token", required=True)
    render.add_argument("--overwrite", action="store_true")
    return root


def main() -> int:
    args = parser().parse_args()
    return run_cli(lambda: _handle(args))


if __name__ == "__main__":
    raise SystemExit(main())
