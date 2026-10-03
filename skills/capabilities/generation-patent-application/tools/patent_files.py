#!/usr/bin/env python3
"""Portable ordinary-file index helper for patent stages.

An index is a plain JSON document that names ordinary project files and their
evidence limits. It never owns ResearchSpec workflow state, never reads
credentials, and never converts file formats.

    {
      "schema_version": "1",
      "kind": "case|corpus|disclosure|application|notes|response",
      "files": [{"role": "...", "path": "<project-relative>"}],
      "limitations": [],
      "metadata": {}
    }

Every indexed path resolves inside ``--project-root`` and outside the project's
``researchspec/`` directory. Projection copies indexed files byte-for-byte so
source format boundaries are preserved. Existing index and projection outputs
are kept unless ``--overwrite`` is given.

    python tools/patent_files.py create --project-root DIR --kind disclosure \
        --out out/disclosure.index.json --file disclosure=out/交底书.md \
        --limitation "附图 2 为手绘草图"
    python tools/patent_files.py validate --project-root DIR out/disclosure.index.json
    python tools/patent_files.py project --project-root DIR out/disclosure.index.json --dest out/bundle
"""
from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

SCHEMA_VERSION = "1"
KINDS = ("case", "corpus", "disclosure", "application", "notes", "response")
WORKFLOW_DIRNAME = "researchspec"


class UsageError(Exception):
    """Caller error: bad paths, bad arguments, unsafe writes."""


def _emit(payload: dict) -> None:
    json.dump(payload, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")


def _project_root(value: str) -> Path:
    root = Path(value).expanduser().resolve()
    if not root.is_dir():
        raise UsageError(f"project root is not a directory: {root}")
    return root


def _relative_parts(root: Path, target: Path) -> tuple[str, ...]:
    try:
        return target.relative_to(root).parts
    except ValueError as exc:
        raise UsageError(f"path escapes the project root: {target}") from exc


def _assert_ordinary(root: Path, parts: tuple[str, ...], path: str) -> None:
    if not parts:
        raise UsageError(f"path does not name a file: {path}")
    if WORKFLOW_DIRNAME in parts:
        raise UsageError(f"path must stay outside {WORKFLOW_DIRNAME}/: {path}")


def resolve_indexed(root: Path, value: str) -> Path:
    """Resolve a project-relative indexed path, rejected when it escapes."""
    raw = Path(value)
    if raw.is_absolute():
        raise UsageError(f"indexed path must be project-relative: {value}")
    if any(part == ".." for part in raw.parts):
        raise UsageError(f"indexed path must not contain '..': {value}")
    candidate = (root / raw).resolve()
    _assert_ordinary(root, _relative_parts(root, candidate), value)
    return candidate


def _resolve(value: str) -> Path:
    target = Path(value).expanduser()
    target = target if target.is_absolute() else (Path.cwd() / target)
    return target.resolve()


def resolve_project_output(root: Path, value: str) -> Path:
    """Resolve an in-project write target outside researchspec/."""
    target = _resolve(value)
    _assert_ordinary(root, _relative_parts(root, target), value)
    return target


def resolve_external_output(root: Path, value: str) -> Path:
    """Resolve a write target that may sit outside the project (e.g. a vault)."""
    target = _resolve(value)
    if root in target.parents or target == root:
        _assert_ordinary(root, _relative_parts(root, target), value)
    return target


def _assert_projection_target(dest: Path, target: Path) -> None:
    """Reject a destination that is or resolves through a symlink outside dest."""
    dest_root = dest.resolve()
    if target.is_symlink():
        raise UsageError(f"destination is a symlink: {target}")
    probe = target.resolve() if target.exists() else target.parent.resolve() / target.name
    try:
        probe.relative_to(dest_root)
    except ValueError as exc:
        raise UsageError(f"destination escapes the projection root: {target}") from exc


def _load_index(path: Path) -> dict:
    if not path.is_file():
        raise UsageError(f"index not found: {path}")
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise UsageError(f"index is not valid JSON: {path}") from exc
    if not isinstance(data, dict):
        raise UsageError("index must be a JSON object")
    return data


def inspect(root: Path, index: dict, *, expect_kind: str = "") -> tuple[list[str], list[str], list[dict]]:
    """Return (problems, missing, resolved files) for an index document."""
    problems: list[str] = []
    missing: list[str] = []
    resolved: list[dict] = []

    if index.get("schema_version") != SCHEMA_VERSION:
        problems.append(f"schema_version must be {SCHEMA_VERSION!r}")
    kind = index.get("kind")
    if kind not in KINDS:
        problems.append(f"kind must be one of {', '.join(KINDS)}")
    elif expect_kind and kind != expect_kind:
        problems.append(f"kind is {kind!r}, expected {expect_kind!r}")
    limitations = index.get("limitations")
    if not isinstance(limitations, list) or any(not isinstance(item, str) for item in limitations):
        problems.append("limitations must be a list of strings")
    if not isinstance(index.get("metadata"), dict):
        problems.append("metadata must be an object")
    files = index.get("files")
    if not isinstance(files, list) or not files:
        problems.append("files must be a non-empty list")
        return problems, missing, resolved

    seen_roles: set[str] = set()
    for position, entry in enumerate(files):
        if not isinstance(entry, dict):
            problems.append(f"files[{position}] must be an object")
            continue
        role = entry.get("role")
        value = entry.get("path")
        if not isinstance(role, str) or not role.strip():
            problems.append(f"files[{position}].role must be a non-empty string")
        elif role in seen_roles:
            problems.append(f"duplicate role: {role}")
        else:
            seen_roles.add(role)
        if not isinstance(value, str) or not value.strip():
            problems.append(f"files[{position}].path must be a non-empty string")
            continue
        try:
            target = resolve_indexed(root, value)
        except UsageError as exc:
            problems.append(str(exc))
            continue
        if not target.is_file():
            missing.append(value)
        resolved.append({"role": role, "path": value, "resolved": target})
    return problems, missing, resolved


def command_create(args: argparse.Namespace) -> int:
    root = _project_root(args.project_root)
    out = resolve_project_output(root, args.out)
    files: list[dict] = []
    seen_roles: set[str] = set()
    problems: list[str] = []
    for item in args.file:
        role, _, value = item.partition("=")
        role, value = role.strip(), value.strip()
        if not role or not value:
            problems.append(f"--file must be ROLE=PATH: {item!r}")
            continue
        if role in seen_roles:
            problems.append(f"duplicate role: {role}")
            continue
        try:
            target = resolve_indexed(root, value)
        except UsageError as exc:
            problems.append(str(exc))
            continue
        if not target.is_file():
            problems.append(f"missing file: {value}")
            continue
        seen_roles.add(role)
        files.append({"role": role, "path": Path(value).as_posix()})
    metadata: dict[str, str] = {}
    for item in args.meta:
        key, _, value = item.partition("=")
        if not key.strip():
            problems.append(f"--meta must be KEY=VALUE: {item!r}")
            continue
        metadata[key.strip()] = value.strip()
    if not files:
        problems.append("at least one --file ROLE=PATH is required")
    if problems:
        _emit({"ok": False, "command": "create", "problems": problems})
        return 1
    if out.exists() and not args.overwrite:
        _emit({"ok": False, "command": "create", "problems": [f"output exists, pass --overwrite to replace: {out}"]})
        return 1
    index = {
        "schema_version": SCHEMA_VERSION,
        "kind": args.kind,
        "files": files,
        "limitations": list(args.limitation),
        "metadata": metadata,
    }
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    _emit({"ok": True, "command": "create", "kind": args.kind, "index": str(out), "file_count": len(files)})
    return 0


def command_validate(args: argparse.Namespace) -> int:
    root = _project_root(args.project_root)
    index = _load_index(Path(args.index).expanduser())
    problems, missing, resolved = inspect(root, index, expect_kind=args.kind or "")
    if problems or missing:
        _emit({"ok": False, "command": "validate", "problems": problems, "missing": missing, "file_count": len(resolved)})
        return 1
    _emit({"ok": True, "command": "validate", "kind": index.get("kind"), "file_count": len(resolved), "limitations": index.get("limitations")})
    return 0


def command_project(args: argparse.Namespace) -> int:
    root = _project_root(args.project_root)
    index = _load_index(Path(args.index).expanduser())
    dest = resolve_external_output(root, args.dest)
    problems, missing, resolved = inspect(root, index, expect_kind=args.kind or "")
    if problems or missing:
        _emit({"ok": False, "command": "project", "problems": problems, "missing": missing})
        return 1
    if dest.exists() and not dest.is_dir():
        _emit({"ok": False, "command": "project", "problems": [f"destination is not a directory: {dest}"]})
        return 1
    targets = [(entry, dest / Path(entry["path"])) for entry in resolved]
    # Preflight every destination so a late refusal never leaves a partial copy.
    for _, target in targets:
        try:
            _assert_projection_target(dest, target)
        except UsageError as exc:
            _emit({"ok": False, "command": "project", "problems": [str(exc)]})
            return 1
        if target.exists() and not args.overwrite:
            _emit({"ok": False, "command": "project", "problems": [f"output exists, pass --overwrite to replace: {target}"]})
            return 1
    copied: list[str] = []
    for entry, target in targets:
        target.parent.mkdir(parents=True, exist_ok=True)
        _assert_projection_target(dest, target)
        shutil.copyfile(entry["resolved"], target)
        copied.append(target.as_posix())
    _emit({"ok": True, "command": "project", "dest": str(dest), "copied": copied})
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)

    create = sub.add_parser("create", help="write a new index for existing project files")
    create.add_argument("--project-root", required=True)
    create.add_argument("--kind", required=True, choices=KINDS)
    create.add_argument("--out", required=True)
    create.add_argument("--file", action="append", default=[], metavar="ROLE=PATH")
    create.add_argument("--limitation", action="append", default=[])
    create.add_argument("--meta", action="append", default=[], metavar="KEY=VALUE")
    create.add_argument("--overwrite", action="store_true")
    create.set_defaults(func=command_create)

    validate = sub.add_parser("validate", help="re-check an index and its files")
    validate.add_argument("--project-root", required=True)
    validate.add_argument("index")
    validate.add_argument("--kind", default="")
    validate.set_defaults(func=command_validate)

    project = sub.add_parser("project", help="copy indexed files byte-for-byte into a bundle")
    project.add_argument("--project-root", required=True)
    project.add_argument("index")
    project.add_argument("--dest", required=True)
    project.add_argument("--kind", default="")
    project.add_argument("--overwrite", action="store_true")
    project.set_defaults(func=command_project)
    return parser


def main(argv: list[str] | None = None) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return int(args.func(args))
    except UsageError as exc:
        _emit({"ok": False, "command": args.command, "problems": [str(exc)]})
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
