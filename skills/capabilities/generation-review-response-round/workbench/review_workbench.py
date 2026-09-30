#!/usr/bin/env python3
"""Read-only projection, scope checking and receipt receiving for the
revision-master interactive review workbench.

This module is the single source for the workbench's task-bounded SQL
projection and its business dependency selection. It never initializes,
repairs or writes the task database outside the explicit acceptance
transaction, never executes SQL carried by a returned result, and never reads
another task. Only the standard library is used.

Subcommands

  project  --db DB --context CTX [--files MANIFEST]
  check    --db DB --snapshot SNAP [--context CTX] [--files MANIFEST]
  accept   --db DB --result RESULT --snapshot SNAP --trusted TRUSTED
           [--context CTX] [--files MANIFEST] [--write FILE.py:func]
           [--allow-update]

JSON inputs are file paths, or ``-`` for stdin. Every command prints one JSON
document to stdout and exits 0 on success or 2 on a structured error.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import sqlite3
import sys
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

SCHEMA_VERSION = "revision-master-review-workspace.v1"
RESULT_SCHEMA_VERSION = "revision-master-review-result.v1"

# Explicit typed projection, in contract order. SQLite column order is not the
# contract; these tuples are. The TypeScript workspace schema declares the same
# rows strictly, so unknown legacy columns are dropped instead of leaked.
TABLES: dict[str, tuple[str, ...]] = {
    "runtime_language_context": ("id", "document_language", "working_language", "manuscript_detected_language", "review_comments_detected_language", "prompt_detected_language", "document_language_source", "working_language_source", "languages_confirmed"),
    "manuscript_summary": ("id", "main_entry", "project_shape", "high_risk_areas"),
    "manuscript_sections": ("section_id", "section_title", "purpose_in_manuscript", "key_files_or_locations"),
    "manuscript_claims": ("claim_id", "core_claim", "main_evidence", "supporting_section_ids", "risk_level"),
    "raw_review_threads": ("thread_id", "reviewer_id", "thread_order", "source_type", "original_text", "normalized_summary"),
    "atomic_comments": ("comment_id", "comment_order", "canonical_summary", "required_action"),
    "raw_thread_atomic_links": ("thread_id", "comment_id", "link_order"),
    "atomic_comment_source_spans": ("comment_id", "thread_id", "excerpt_text", "note"),
    "review_comment_source_documents": ("source_document_id", "source_kind", "document_order", "source_label", "source_path", "original_text"),
    "raw_thread_source_spans": ("thread_id", "source_document_id", "span_order", "span_role", "start_offset", "end_offset", "span_text"),
    "review_comment_coverage_segments": ("source_document_id", "segment_order", "coverage_status", "segment_text", "thread_id"),
    "review_comment_coverage_segment_comment_links": ("source_document_id", "segment_order", "link_order", "comment_id"),
    "atomic_comment_state": ("comment_id", "status", "priority", "evidence_gap", "user_confirmation_needed", "next_action"),
    "atomic_comment_target_locations": ("comment_id", "location_order", "target_location", "location_role"),
    "atomic_comment_analysis_links": ("comment_id", "analysis_order", "manuscript_claim_or_section", "existing_evidence", "gap_summary", "dependency_comment_id"),
    "strategy_cards": ("comment_id", "proposed_stance", "stance_rationale"),
    "strategy_card_actions": ("comment_id", "action_order", "manuscript_change", "expected_response_letter_effect"),
    "strategy_action_target_locations": ("comment_id", "action_order", "location_order", "target_location"),
    "strategy_card_evidence_items": ("comment_id", "evidence_order", "required_material", "available_now", "gap_note"),
    "strategy_card_pending_confirmations": ("comment_id", "confirmation_order", "message"),
    "strategy_action_manuscript_execution_items": ("comment_id", "action_order", "item_order", "category", "content_text", "rationale", "target_scope_note"),
    "comment_response_drafts": ("comment_id", "draft_text", "rationale"),
    "supplement_suggestion_items": ("comment_id", "suggestion_order", "analysis_order", "request_summary", "request_recommendation", "status"),
    "supplement_suggestion_intake_links": ("comment_id", "suggestion_order", "round_id", "file_path", "link_note"),
    "supplement_intake_items": ("round_id", "file_path", "concern_summary", "decision", "decision_rationale"),
    "supplement_landing_links": ("round_id", "file_path", "comment_id", "action_order", "location_order", "planned_usage_note"),
    "comment_completion_status": ("comment_id", "manuscript_execution_items_done", "response_draft_done", "evidence_gap_closed", "user_strategy_confirmed", "one_to_one_link_checked", "export_ready"),
    "comment_blockers": ("comment_id", "blocker_order", "message"),
    "response_thread_resolution_links": ("thread_id", "comment_id", "response_order", "response_role"),
    "style_profiles": ("profile_target", "profile_summary", "anti_ai_focus"),
    "style_profile_rules": ("profile_target", "rule_order", "rule_type", "rule_text"),
    "workspace_manuscript_copies": ("copy_role", "source_kind", "source_root", "copy_root", "main_entry_relative_path"),
    "revision_plan_actions": ("plan_action_id", "plan_order", "comment_id", "action_order", "execution_category", "title", "objective", "suggested_change", "evidence_requirement", "status"),
    "revision_plan_dependencies": ("plan_action_id", "depends_on_plan_action_id"),
    "revision_action_logs": ("log_id", "log_order", "status", "operator_role", "summary", "change_note", "response_note", "created_at"),
    "revision_action_log_plan_links": ("log_id", "plan_action_id"),
    "revision_action_log_thread_links": ("log_id", "thread_id"),
    "revision_action_log_entries": ("log_id", "entry_order", "target_file", "target_locator", "change_type", "change_summary", "rationale", "evidence_source", "expected_response_use"),
    "revision_action_log_file_diffs": ("log_id", "file_order", "relative_path", "change_kind", "diff_excerpt", "before_excerpt", "after_excerpt"),
    "working_copy_file_state": ("relative_path", "snapshot_sha256", "last_audited_sha256", "current_sha256", "last_log_id"),
    "action_copy_variants": ("comment_id", "action_order", "location_order", "variant_label", "variant_text", "rationale"),
    "selected_action_copy_variants": ("comment_id", "action_order", "location_order", "variant_label"),
    "response_thread_rows": ("thread_id", "response_resolution_kind", "original_comment", "modification_scope", "key_revision_excerpt", "response_explanation", "latex_excerpt", "latex_response_text"),
    "response_thread_action_log_links": ("thread_id", "log_id", "link_order"),
    "export_patch_sets": ("patch_set_id", "artifact_kind", "source_root", "output_root", "status"),
    "export_patches": ("patch_set_id", "patch_order", "comment_id", "action_order", "location_order", "target_file", "anchor_text", "operation", "marked_text", "clean_text", "notes"),
    "export_artifacts": ("artifact_name", "artifact_status", "output_path"),
    "workflow_state": ("id", "current_stage", "stage_gate", "active_comment_id", "next_action"),
    "workflow_pending_user_confirmations": ("position", "message"),
    "workflow_global_blockers": ("position", "message"),
}

BUSINESS_TABLES = tuple(TABLES)

# Absent from the schema's required table list, so a legacy database may lack
# them. They project as empty arrays instead of failing the prerequisite check.
OPTIONAL_TABLES = frozenset({
    "action_copy_variants",
    "selected_action_copy_variants",
    "export_patch_sets",
    "export_patches",
})

PRIMARY_KEYS: dict[str, tuple[str, ...]] = {
    "runtime_language_context": ("id",),
    "manuscript_summary": ("id",),
    "manuscript_sections": ("section_id",),
    "manuscript_claims": ("claim_id",),
    "raw_review_threads": ("thread_id",),
    "atomic_comments": ("comment_id",),
    "raw_thread_atomic_links": ("thread_id", "comment_id"),
    "atomic_comment_source_spans": ("comment_id", "thread_id"),
    "review_comment_source_documents": ("source_document_id",),
    "raw_thread_source_spans": ("thread_id", "source_document_id", "span_order"),
    "review_comment_coverage_segments": ("source_document_id", "segment_order"),
    "review_comment_coverage_segment_comment_links": ("source_document_id", "segment_order", "link_order"),
    "atomic_comment_state": ("comment_id",),
    "atomic_comment_target_locations": ("comment_id", "location_order"),
    "atomic_comment_analysis_links": ("comment_id", "analysis_order"),
    "strategy_cards": ("comment_id",),
    "strategy_card_actions": ("comment_id", "action_order"),
    "strategy_action_target_locations": ("comment_id", "action_order", "location_order"),
    "strategy_card_evidence_items": ("comment_id", "evidence_order"),
    "strategy_card_pending_confirmations": ("comment_id", "confirmation_order"),
    "strategy_action_manuscript_execution_items": ("comment_id", "action_order", "item_order"),
    "comment_response_drafts": ("comment_id",),
    "supplement_suggestion_items": ("comment_id", "suggestion_order"),
    "supplement_suggestion_intake_links": ("comment_id", "suggestion_order", "round_id", "file_path"),
    "supplement_intake_items": ("round_id", "file_path"),
    "supplement_landing_links": ("round_id", "file_path", "comment_id", "action_order", "location_order"),
    "comment_completion_status": ("comment_id",),
    "comment_blockers": ("comment_id", "blocker_order"),
    "response_thread_resolution_links": ("thread_id", "comment_id"),
    "style_profiles": ("profile_target",),
    "style_profile_rules": ("profile_target", "rule_order"),
    "workspace_manuscript_copies": ("copy_role",),
    "revision_plan_actions": ("plan_action_id",),
    "revision_plan_dependencies": ("plan_action_id", "depends_on_plan_action_id"),
    "revision_action_logs": ("log_id",),
    "revision_action_log_plan_links": ("log_id", "plan_action_id"),
    "revision_action_log_thread_links": ("log_id", "thread_id"),
    "revision_action_log_entries": ("log_id", "entry_order"),
    "revision_action_log_file_diffs": ("log_id", "file_order"),
    "working_copy_file_state": ("relative_path",),
    "action_copy_variants": ("comment_id", "action_order", "location_order", "variant_label"),
    "selected_action_copy_variants": ("comment_id", "action_order", "location_order"),
    "response_thread_rows": ("thread_id",),
    "response_thread_action_log_links": ("thread_id", "log_id"),
    "export_patch_sets": ("patch_set_id",),
    "export_patches": ("patch_set_id", "patch_order"),
    "export_artifacts": ("artifact_name",),
    "workflow_state": ("id",),
    "workflow_pending_user_confirmations": ("position",),
    "workflow_global_blockers": ("position",),
}

# Scope membership. ``coverage`` and ``board`` compare the whole set, so an
# added or deleted member is always visible; ``strategy`` and ``round`` are
# membership filtered so an unrelated change cannot invalidate an independent
# card.
COVERAGE_TABLES = (
    "review_comment_source_documents",
    "raw_review_threads",
    "raw_thread_source_spans",
    "atomic_comments",
    "raw_thread_atomic_links",
    "atomic_comment_source_spans",
    "review_comment_coverage_segments",
    "review_comment_coverage_segment_comment_links",
)
BOARD_TABLES = (
    "atomic_comments",
    "atomic_comment_state",
    "atomic_comment_target_locations",
    "atomic_comment_analysis_links",
    "raw_review_threads",
    "raw_thread_atomic_links",
    "comment_blockers",
    "supplement_suggestion_items",
    "supplement_suggestion_intake_links",
    "supplement_intake_items",
    "supplement_landing_links",
)
STRATEGY_TABLES = (
    "atomic_comments",
    "atomic_comment_state",
    "atomic_comment_target_locations",
    "atomic_comment_analysis_links",
    "raw_review_threads",
    "raw_thread_atomic_links",
    "atomic_comment_source_spans",
    "raw_thread_source_spans",
    "review_comment_source_documents",
    "strategy_cards",
    "strategy_card_actions",
    "strategy_action_target_locations",
    "strategy_card_evidence_items",
    "strategy_card_pending_confirmations",
    "strategy_action_manuscript_execution_items",
    "comment_response_drafts",
    "comment_completion_status",
    "comment_blockers",
    "supplement_suggestion_items",
    "supplement_suggestion_intake_links",
    "supplement_intake_items",
    "supplement_landing_links",
    "manuscript_summary",
    "manuscript_sections",
    "manuscript_claims",
    "style_profiles",
    "style_profile_rules",
    "runtime_language_context",
)
ROUND_MEMBERSHIP_TABLES = (
    "raw_review_threads",
    "atomic_comments",
    "raw_thread_atomic_links",
    "atomic_comment_source_spans",
    "raw_thread_source_spans",
    "review_comment_source_documents",
)
ROUND_TABLES = ROUND_MEMBERSHIP_TABLES + (
    "revision_action_logs",
    "revision_action_log_plan_links",
    "revision_action_log_thread_links",
    "revision_action_log_entries",
    "revision_action_log_file_diffs",
    "revision_plan_actions",
    "revision_plan_dependencies",
    "response_thread_rows",
    "response_thread_action_log_links",
    "response_thread_resolution_links",
    "working_copy_file_state",
    "export_artifacts",
    "export_patch_sets",
    "export_patches",
    "atomic_comment_state",
    "comment_completion_status",
    "strategy_cards",
    "strategy_card_pending_confirmations",
    "supplement_intake_items",
    "supplement_landing_links",
)

SCOPE_TABLES: dict[str, tuple[str, ...]] = {
    "coverage": COVERAGE_TABLES,
    "board": BOARD_TABLES,
    "strategy": STRATEGY_TABLES,
    "round": ROUND_TABLES,
}

# Which column carries scope membership, and which identifier family it holds.
OWNER_COLUMNS: dict[str, tuple[str, ...]] = {
    "atomic_comments": ("comment_id",),
    "atomic_comment_state": ("comment_id",),
    "atomic_comment_target_locations": ("comment_id",),
    "atomic_comment_analysis_links": ("comment_id", "dependency_comment_id"),
    "raw_review_threads": ("thread_id",),
    "raw_thread_atomic_links": ("thread_id", "comment_id"),
    "atomic_comment_source_spans": ("comment_id", "thread_id"),
    "raw_thread_source_spans": ("thread_id", "source_document_id"),
    "review_comment_source_documents": ("source_document_id",),
    "review_comment_coverage_segments": ("source_document_id", "thread_id"),
    "review_comment_coverage_segment_comment_links": ("source_document_id", "comment_id"),
    "strategy_cards": ("comment_id",),
    "strategy_card_actions": ("comment_id",),
    "strategy_action_target_locations": ("comment_id",),
    "strategy_card_evidence_items": ("comment_id",),
    "strategy_card_pending_confirmations": ("comment_id",),
    "strategy_action_manuscript_execution_items": ("comment_id",),
    "comment_response_drafts": ("comment_id",),
    "comment_completion_status": ("comment_id",),
    "comment_blockers": ("comment_id",),
    "supplement_suggestion_items": ("comment_id",),
    "supplement_suggestion_intake_links": ("comment_id",),
    "supplement_landing_links": ("comment_id",),
    "response_thread_resolution_links": ("thread_id", "comment_id"),
}

OWNER_FAMILY = {
    "comment_id": "comments",
    "dependency_comment_id": "comments",
    "thread_id": "threads",
    "source_document_id": "documents",
}

PATH_COLUMNS: dict[str, tuple[str, ...]] = {
    "review_comment_source_documents": ("source_path",),
    "revision_action_log_entries": ("target_file",),
    "revision_action_log_file_diffs": ("relative_path",),
    "working_copy_file_state": ("relative_path",),
    "supplement_intake_items": ("file_path",),
    "workspace_manuscript_copies": ("main_entry_relative_path",),
    "export_artifacts": ("output_path",),
    "export_patches": ("target_file",),
}
LOCATOR_COLUMNS: dict[str, tuple[str, ...]] = {
    "atomic_comment_target_locations": ("target_location",),
    "strategy_action_target_locations": ("target_location",),
}

CONTEXT_IDENTITY = ("task_id", "selector", "run_id", "node_id", "round_id", "stage")

CONFIRMATION_KINDS = {"coverage", "board", "strategy"}
DISPOSITION_ACTIONS = {"include", "exclude", "adjust", "defer"}
ANCHOR_KINDS = {"text", "whole"}

# Receipts carry a readable pointer, not the payload itself: the full entry
# stays in the agent's retained result, addressed by result_id and feedback_id.
UNSELECTED_NOTE_LIMIT = 500


class WorkbenchError(Exception):
    def __init__(self, code: str, message: str, details: object = None) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.details = details

    def as_json(self) -> dict[str, object]:
        payload: dict[str, object] = {"ok": False, "error": {"code": self.code, "message": self.message}}
        if self.details is not None:
            payload["error"]["details"] = self.details  # type: ignore[index]
        return payload


# --------------------------------------------------------------------------- io

def load_json(source: str) -> object:
    text = sys.stdin.read() if source == "-" else Path(source).read_text(encoding="utf-8")
    try:
        return json.loads(text)
    except json.JSONDecodeError as error:
        raise WorkbenchError("invalid_json", f"{source}: {error}") from error


def canonical(value: object) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def valid_relative(path: str) -> bool:
    if not path or path.startswith(("/", "\\")):
        return False
    if len(path) > 1 and path[1] == ":":
        return False
    return ".." not in path.replace("\\", "/").split("/")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def readonly_connection(db_path: Path) -> sqlite3.Connection:
    if not db_path.is_file():
        raise WorkbenchError("missing_database", f"task database not found: {db_path}")
    uri = f"file:{quote(str(db_path.resolve()))}?mode=ro"
    try:
        connection = sqlite3.connect(uri, uri=True)
    except sqlite3.OperationalError as error:
        raise WorkbenchError("unreadable_database", str(error)) from error
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA query_only = ON")
    return connection


@contextmanager
def read_transaction(connection: sqlite3.Connection):
    """One consistent read snapshot. SQLite does not open a transaction for a
    bare SELECT, so projection and checking must say so explicitly."""
    connection.execute("BEGIN")
    try:
        yield connection
        connection.execute("COMMIT")
    except Exception:
        connection.execute("ROLLBACK")
        raise


def read_state(db_path: Path) -> tuple[dict[str, list[dict[str, object]]], list[dict[str, object]]]:
    connection = readonly_connection(db_path)
    try:
        with read_transaction(connection):
            missing_tables, missing_columns = check_prerequisites(connection)
            if missing_tables or missing_columns:
                raise WorkbenchError(
                    "missing_required_data",
                    "task database does not match the workbench projection contract",
                    {"missing_tables": missing_tables, "missing_columns": missing_columns},
                )
            return read_business(connection), pending_feedback(connection)
    finally:
        connection.close()


# ------------------------------------------------------------------ projection

def check_prerequisites(connection: sqlite3.Connection) -> tuple[list[str], dict[str, list[str]]]:
    present = {row["name"] for row in connection.execute("SELECT name FROM sqlite_master WHERE type = 'table'")}
    missing_tables = [name for name in BUSINESS_TABLES if name not in present and name not in OPTIONAL_TABLES]
    missing_columns: dict[str, list[str]] = {}
    for table, columns in TABLES.items():
        if table not in present:
            continue
        have = {row["name"] for row in connection.execute(f'PRAGMA table_info("{table}")')}
        missing = [column for column in columns if column not in have]
        if missing:
            missing_columns[table] = missing
    return missing_tables, missing_columns


def read_business(connection: sqlite3.Connection) -> dict[str, list[dict[str, object]]]:
    present = {row["name"] for row in connection.execute("SELECT name FROM sqlite_master WHERE type = 'table'")}
    business: dict[str, list[dict[str, object]]] = {}
    for table, columns in TABLES.items():
        if table not in present:
            business[table] = []
            continue
        projection = ", ".join(f'"{column}"' for column in columns)
        rows = connection.execute(f'SELECT {projection} FROM "{table}"').fetchall()
        business[table] = [dict(row) for row in rows]
    return business


def _scope_specs(business: dict[str, list[dict[str, object]]]) -> list[tuple[str, str, list[str]]]:
    """One coverage scope, one board scope, one checkable strategy scope per
    comment, and one round scope. Only the active comment's strategy scope can
    carry a confirmation, but every card stays independently checkable."""
    comments = [f"comment:{row['comment_id']}" for row in business["atomic_comments"]]
    threads = [f"thread:{row['thread_id']}" for row in business["raw_review_threads"]]
    relations = [f"relation:{row['thread_id']}:{row['comment_id']}" for row in business["raw_thread_atomic_links"]]
    specs: list[tuple[str, str, list[str]]] = [
        ("coverage", "coverage", comments + threads + relations),
        ("board", "board", comments),
    ]
    for row in business["atomic_comments"]:
        comment_id = str(row["comment_id"])
        specs.append(("strategy", f"strategy:{comment_id}", [f"comment:{comment_id}"]))
    specs.append(("round", "round", threads + comments))
    return specs


def _raw_families(target_ids: list[str]) -> dict[str, set[str]]:
    families: dict[str, set[str]] = {"comments": set(), "threads": set(), "documents": set()}
    for target in target_ids:
        kind, _, rest = target.partition(":")
        if kind == "comment":
            families["comments"].add(rest)
        elif kind == "thread":
            families["threads"].add(rest)
    return families


def _filter_table(
    table: str,
    rows: list[dict[str, object]],
    families: dict[str, set[str]],
) -> list[dict[str, object]]:
    owners = OWNER_COLUMNS.get(table, ())
    if not owners:
        return list(rows)
    selected = []
    for row in rows:
        for column in owners:
            family = OWNER_FAMILY.get(column)
            if family and row.get(column) is not None and str(row[column]) in families[family]:
                selected.append(row)
                break
    return selected


def _referenced_paths(selected: dict[str, list[dict[str, object]]]) -> set[str]:
    paths: set[str] = set()
    for table, rows in selected.items():
        for column in PATH_COLUMNS.get(table, ()):
            paths.update(str(row[column]) for row in rows if row.get(column))
        for column in LOCATOR_COLUMNS.get(table, ()):
            paths.update(str(row[column]).split("::", 1)[0] for row in rows if row.get(column))
    return paths


def resolve_files(paths: set[str], source_root: Path) -> tuple[list[dict[str, object]], list[str]]:
    """Hash the actual bytes under the task root; never trust a supplied hash.

    A path that escapes the task root, through a symlink or otherwise, is
    reported as unlocated rather than reading another task's data.
    """
    files: list[dict[str, object]] = []
    unresolved: list[str] = []
    root = source_root.resolve()
    for path in sorted(paths):
        if not valid_relative(path):
            unresolved.append(path)
            continue
        try:
            candidate = (root / path).resolve()
        except OSError:
            unresolved.append(path)
            continue
        if not candidate.is_relative_to(root) or not candidate.is_file():
            unresolved.append(path)
            continue
        files.append({"path": path, "sha256": sha256_bytes(candidate.read_bytes())})
    return files, unresolved


def source_resolver(project_root: str):
    root = Path(project_root).expanduser()
    if not root.is_dir():
        raise WorkbenchError("missing_source_root", f"project root not found: {project_root}")
    resolved = root.resolve()

    def resolve(paths: set[str]) -> tuple[list[dict[str, object]], list[str]]:
        return resolve_files(paths, resolved)

    return resolve


def build_scopes(
    business: dict[str, list[dict[str, object]]],
    resolve,
) -> tuple[list[dict[str, object]], list[str]]:
    scopes: list[dict[str, object]] = []
    unresolved: set[str] = set()
    for kind, scope_id, target_ids in _scope_specs(business):
        selected = _select_rows(business, kind, target_ids)
        files, missing = resolve(_referenced_paths(selected))
        unresolved.update(missing)
        scopes.append({
            "scope_id": scope_id,
            "kind": kind,
            "target_ids": target_ids,
            "baseline": {"tables": selected, "files": files, "unresolved": sorted(missing)},
        })
    return scopes, sorted(unresolved)


def _select_rows(
    business: dict[str, list[dict[str, object]]],
    kind: str,
    target_ids: list[str],
) -> dict[str, list[dict[str, object]]]:
    families = _raw_families(target_ids)
    if kind == "strategy":
        families = _strategy_families(business, families)
    selected: dict[str, list[dict[str, object]]] = {}
    for table in SCOPE_TABLES[kind]:
        rows = business.get(table, [])
        if kind in ("coverage", "board") or (kind == "round" and table not in ROUND_MEMBERSHIP_TABLES):
            selected[table] = list(rows)
        else:
            selected[table] = _filter_table(table, rows, families)
    if kind == "strategy":
        selected = _derive_strategy_documents(business, selected, families)
    return selected


def _strategy_families(
    business: dict[str, list[dict[str, object]]],
    families: dict[str, set[str]],
) -> dict[str, set[str]]:
    resolved = {name: set(values) for name, values in families.items()}
    comments = resolved["comments"]
    dependencies: dict[str, set[str]] = {}
    for row in business["atomic_comment_analysis_links"]:
        dependency = row.get("dependency_comment_id")
        if dependency:
            dependencies.setdefault(str(row["comment_id"]), set()).add(str(dependency))
    frontier = list(comments)
    while frontier:  # bounded closure: each comment enters at most once
        current = frontier.pop()
        for dependency in dependencies.get(current, ()):
            if dependency not in comments:
                comments.add(dependency)
                frontier.append(dependency)
    for row in business["raw_thread_atomic_links"]:
        if str(row["comment_id"]) in comments:
            resolved["threads"].add(str(row["thread_id"]))
    for row in business["atomic_comment_source_spans"]:
        if str(row["comment_id"]) in comments:
            resolved["threads"].add(str(row["thread_id"]))
    return resolved


def _derive_strategy_documents(
    business: dict[str, list[dict[str, object]]],
    selected: dict[str, list[dict[str, object]]],
    families: dict[str, set[str]],
) -> dict[str, list[dict[str, object]]]:
    documents = set(families["documents"])
    for row in selected["raw_thread_source_spans"]:
        documents.add(str(row["source_document_id"]))
    resolved = {name: set(values) for name, values in families.items()}
    resolved["documents"] = documents
    for table in ("review_comment_source_documents", "raw_thread_source_spans"):
        selected[table] = _filter_table(table, business[table], resolved)
    intake_keys = {
        (str(row["round_id"]), str(row["file_path"]))
        for table in ("supplement_suggestion_intake_links", "supplement_landing_links")
        for row in selected[table]
    }
    selected["supplement_intake_items"] = [
        row for row in business["supplement_intake_items"]
        if (str(row["round_id"]), str(row["file_path"])) in intake_keys
    ]
    return selected


def project(db_path: Path, context: object, resolve) -> dict[str, object]:
    if not isinstance(context, dict):
        raise WorkbenchError("context_mismatch", "context must be an object")
    validate_selector(context)
    business, pending = read_state(db_path)
    scopes, unresolved = build_scopes(business, resolve)
    return {"context": context, "business": business, "scopes": scopes, "unresolved": unresolved, "pending_feedback": pending}


# ----------------------------------------------------------------- scope diff

def _key_of(row: dict[str, object], primary_key: tuple[str, ...]) -> str:
    return "\u0000".join(str(row.get(column)) for column in primary_key)


def diff_tables(
    before: dict[str, list[dict[str, object]]],
    after: dict[str, list[dict[str, object]]],
) -> dict[str, dict[str, list[str]]]:
    changes: dict[str, dict[str, list[str]]] = {}
    for table in sorted(set(before) | set(after)):
        primary_key = PRIMARY_KEYS.get(table) or tuple(sorted((before.get(table) or after.get(table) or [{}])[0]))
        old = {_key_of(row, primary_key): row for row in before.get(table, [])}
        new = {_key_of(row, primary_key): row for row in after.get(table, [])}
        added = sorted(key for key in new if key not in old)
        removed = sorted(key for key in old if key not in new)
        modified = sorted(key for key in new if key in old and canonical(new[key]) != canonical(old[key]))
        if added or removed or modified:
            changes[table] = {"added": added, "removed": removed, "modified": modified}
    return changes


def diff_files(
    before: list[dict[str, object]],
    after: list[dict[str, object]],
) -> dict[str, list[str]]:
    old = {str(entry.get("path")): str(entry.get("sha256")) for entry in before}
    new = {str(entry.get("path")): str(entry.get("sha256")) for entry in after}
    return {
        "added": sorted(path for path in new if path not in old),
        "removed": sorted(path for path in old if path not in new),
        "changed": sorted(path for path in new if path in old and new[path] != old[path]),
    }


def baseline_for_scope(
    business: dict[str, list[dict[str, object]]],
    scope: dict[str, object],
    resolve,
) -> dict[str, object]:
    if not isinstance(scope, dict):
        raise WorkbenchError("unknown_scope", "scope must be an object")
    kind = str(scope.get("kind"))
    if kind not in SCOPE_TABLES:
        raise WorkbenchError("unknown_scope", f"unsupported scope kind: {kind}")
    selected = _select_rows(business, kind, [str(target) for target in scope.get("target_ids", []) or []])
    files, unresolved = resolve(_referenced_paths(selected))
    return {"tables": selected, "files": files, "unresolved": unresolved}


def check(db_path: Path, snapshot: object, context: object, resolve) -> dict[str, object]:
    validate_snapshot_shape(snapshot)
    validate_selector(snapshot.get("context"))
    if context is not None and not contexts_match(snapshot.get("context"), context):
        raise WorkbenchError("context_mismatch", "current context does not match the snapshot context")
    business, _ = read_state(db_path)
    scopes: list[dict[str, object]] = []
    changed = False
    unassessable = False
    for scope in snapshot.get("scopes", []) or []:
        current = baseline_for_scope(business, scope, resolve)
        recorded = scope.get("baseline", {}) if isinstance(scope, dict) else {}
        tables = diff_tables(recorded.get("tables", {}), current["tables"])
        files = diff_files(recorded.get("files", []), current["files"])
        if current["unresolved"]:
            status = "unassessable"
            unassessable = True
        elif tables or any(files.values()):
            status = "changed"
            changed = True
        else:
            status = "unchanged"
        scopes.append({
            "scope_id": scope.get("scope_id"),
            "kind": scope.get("kind"),
            "status": status,
            "tables": tables,
            "files": files,
            "unresolved": current["unresolved"],
        })
    return {"ok": True, "context_match": True, "changed": changed, "unassessable": unassessable, "scopes": scopes}


def contexts_match(left: object, right: object) -> bool:
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    return all(left.get(key) == right.get(key) for key in CONTEXT_IDENTITY)


def validate_selector(context: object) -> None:
    if not isinstance(context, dict):
        raise WorkbenchError("context_mismatch", "context must be an object")
    run_id, node_id, round_id = context.get("run_id"), context.get("node_id"), context.get("round_id")
    if not run_id or not node_id:
        raise WorkbenchError("context_mismatch", "context requires run_id and node_id")
    expected = f"node:{run_id}/{node_id}" + (f"@{round_id}" if round_id else "")
    if context.get("selector") != expected:
        raise WorkbenchError("context_mismatch", f"selector must be exactly {expected}")


def _scope_index(snapshot: object) -> dict[str, object]:
    if not isinstance(snapshot, dict):
        raise WorkbenchError("invalid_snapshot", "snapshot must be an object")
    return {str(scope.get("scope_id")): scope for scope in snapshot.get("scopes", []) or [] if isinstance(scope, dict)}


def validate_snapshot_shape(snapshot: object) -> None:
    if not isinstance(snapshot, dict):
        raise WorkbenchError("invalid_snapshot", "snapshot must be an object")
    if snapshot.get("schema_version") != SCHEMA_VERSION:
        raise WorkbenchError("invalid_snapshot", f"snapshot schema_version must be {SCHEMA_VERSION}")
    if not snapshot.get("snapshot_id") or not snapshot.get("workspace_id"):
        raise WorkbenchError("invalid_snapshot", "snapshot requires snapshot_id and workspace_id")
    if not snapshot.get("scopes"):
        raise WorkbenchError("invalid_snapshot", "snapshot requires at least one scope")


def _block_index(workspace: dict[str, object]) -> dict[str, dict[str, object]]:
    index: dict[str, dict[str, object]] = {}
    for document in workspace.get("documents", []) or []:
        if not isinstance(document, dict):
            continue
        for block in document.get("blocks", []) or []:
            if isinstance(block, dict) and block.get("id"):
                index[str(block["id"])] = block
    return index


def strategy_blockers(business: dict[str, object], comment_id: str) -> list[str]:
    """Reasons a strategy confirmation must stay pending for this card."""
    reasons: list[str] = []
    for row in business.get("atomic_comment_state", []) or []:
        if str(row.get("comment_id")) != comment_id:
            continue
        if str(row.get("status")) == "blocked":
            reasons.append("status_blocked")
        if str(row.get("evidence_gap")) == "yes":
            reasons.append("evidence_gap")
    if any(str(row.get("comment_id")) == comment_id for row in business.get("comment_blockers", []) or []):
        reasons.append("comment_blocker")
    if any(
        str(row.get("comment_id")) == comment_id and str(row.get("available_now")) == "no"
        for row in business.get("strategy_card_evidence_items", []) or []
    ):
        reasons.append("evidence_unavailable")
    return reasons


def feedback_targets(entry: dict[str, object], business: dict[str, object]) -> set[str] | None:
    """Concrete targets an unresolved entry affects.

    A comment entry touches only that comment; a thread entry touches every
    comment mapped to it through ``raw_thread_atomic_links``; a relation entry
    binds to its edge comment. Scope-wide notes and documents return ``None`` so
    callers fall back to conservative scope intersection.
    """
    target_id = str(entry.get("target_id"))
    if target_id == f"scope:{entry.get('scope_id')}":
        return None
    kind, _, rest = target_id.partition(":")
    if kind == "comment":
        return {target_id}
    if kind == "thread":
        affected = {target_id}
        for row in business.get("raw_thread_atomic_links", []) or []:
            if str(row.get("thread_id")) == rest:
                affected.add(f"comment:{row.get('comment_id')}")
        return affected
    if kind == "relation":
        thread_id, _, comment_id = rest.partition(":")
        affected = {target_id}
        if thread_id:
            affected.add(f"thread:{thread_id}")
        if comment_id:
            affected.add(f"comment:{comment_id}")
        return affected
    return None


def blocks_confirmation(
    problem: dict[str, object],
    confirmation: dict[str, object],
    business: dict[str, object],
    scopes: dict[str, object],
    target_set: set[str],
) -> bool:
    """Whether one unresolved entry keeps this confirmation pending.

    Only the objects the entry actually touches block; an A-02 annotation does
    not stop an independent A-01 strategy confirmation. Scope-wide notes,
    documents, and unknown scopes stay conservative and use scope intersection.
    """
    category = problem.get("category")
    if category == "dispositions":
        substantive = problem.get("action") in ("adjust", "defer") or bool(str(problem.get("note") or "").strip())
    elif category == "annotations":
        substantive = True
    elif category == "overall_note":
        substantive = bool(str(problem.get("note") or "").strip())
    else:
        substantive = False
    if not substantive:
        return False
    affected = feedback_targets(problem, business)
    if affected is not None:
        return bool(affected & target_set)
    scope_id = str(problem.get("scope_id"))
    if scope_id == str(confirmation.get("scope_id")):
        return True
    other = scopes.get(scope_id)
    if other is None:
        return True
    return any(str(target) in target_set for target in other.get("target_ids", []) or [])


def utf16_slice(text: str, start: int, end: int) -> str | None:
    """Document and anchor offsets count UTF-16 code units, as in JavaScript.

    Raw review source spans are the exception and stay code point based; this
    helper is only for display documents and anchors.
    """
    if not isinstance(start, int) or not isinstance(end, int):
        return None
    data = text.encode("utf-16-le")
    if start < 0 or end < start or end * 2 > len(data):
        return None
    try:
        return data[start * 2:end * 2].decode("utf-16-le", errors="surrogatepass")
    except UnicodeDecodeError:
        return None


def _validate_anchor(anchor: object, blocks: dict[str, dict[str, object]], snapshot_id: str) -> None:
    if not isinstance(anchor, dict) or str(anchor.get("snapshot_id")) != snapshot_id:
        raise WorkbenchError("invalid_anchor", "annotation anchor is stale or malformed")
    kind = str(anchor.get("kind"))
    if kind not in ANCHOR_KINDS:
        raise WorkbenchError("invalid_anchor", f"anchor kind must be one of {sorted(ANCHOR_KINDS)}")
    block = blocks.get(str(anchor.get("block_id")))
    if block is None:
        raise WorkbenchError("invalid_anchor", "annotation anchor block is not part of the snapshot")
    text = str(block.get("text", ""))
    quote = str(anchor.get("exact_quote", ""))
    if kind == "text":
        start, end = anchor.get("start"), anchor.get("end")
        if not isinstance(start, int) or not isinstance(end, int) or start < 0 or end <= start:
            raise WorkbenchError("invalid_anchor", "a text anchor needs an ordered non-empty selection")
        if utf16_slice(text, start, end) != quote:  # type: ignore[arg-type]
            raise WorkbenchError("invalid_anchor", "annotation quote does not match the anchored block")
        length = len(text.encode("utf-16-le")) // 2
        head = utf16_slice(text, 0, start)  # type: ignore[arg-type]
        tail = utf16_slice(text, end, length)  # type: ignore[arg-type]
        if head is None or tail is None or not head.endswith(str(anchor.get("prefix", ""))) or not tail.startswith(str(anchor.get("suffix", ""))):
            raise WorkbenchError("invalid_anchor", "annotation context does not match the anchored block")
    elif quote != text or anchor.get("resource_id") != block.get("resource_id"):
        raise WorkbenchError("invalid_anchor", "whole-block anchor does not match the anchored block")


def validate_result_shape(result: dict[str, object], snapshot: dict[str, object]) -> None:
    """Minimal runtime validation, so a direct caller cannot bypass the wrapper."""
    if result.get("schema_version") != RESULT_SCHEMA_VERSION:
        raise WorkbenchError("invalid_result", f"result schema_version must be {RESULT_SCHEMA_VERSION}")
    if not result.get("result_id") or not result.get("draft_id"):
        raise WorkbenchError("invalid_result", "result requires result_id and draft_id")
    workspace = result.get("workspace")
    if not isinstance(workspace, dict) or workspace.get("workspace_id") != snapshot.get("workspace_id"):
        raise WorkbenchError("invalid_result", "result workspace identity does not match the snapshot")
    scopes = _scope_index(snapshot)
    blocks = _block_index(workspace)
    snapshot_id = str(snapshot.get("snapshot_id"))
    context = snapshot.get("context") if isinstance(snapshot.get("context"), dict) else {}
    active_comment_id = str(context.get("active_comment_id") or "")
    business = workspace.get("business") if isinstance(workspace.get("business"), dict) else {}
    comments = {f"comment:{row['comment_id']}" for row in business.get("atomic_comments", []) or [] if isinstance(row, dict)}
    entries = feedback_entries(result)
    if len({str(entry.get("feedback_id")) for entry in entries}) != len(entries):
        raise WorkbenchError("invalid_result", "feedback identities must be unique")
    for entry in entries:
        if not str(entry.get("feedback_id") or "").strip():
            raise WorkbenchError("invalid_result", "every feedback entry needs a feedback_id")
    revision = result.get("export_revision")
    if not isinstance(revision, int) or isinstance(revision, bool) or revision < 1:
        raise WorkbenchError("invalid_result", "export_revision must be a positive integer")
    exported_at = result.get("exported_at")
    if not isinstance(exported_at, str) or "T" not in exported_at:
        raise WorkbenchError("invalid_result", "exported_at must be an ISO-8601 timestamp")

    for entry in entries:
        category = str(entry.get("category"))
        if category == "dispositions" and str(entry.get("action")) not in DISPOSITION_ACTIONS:
            raise WorkbenchError("invalid_result", f"unsupported disposition action: {entry.get('action')}")
        if category == "annotations":
            if not str(entry.get("note") or "").strip():
                raise WorkbenchError("invalid_result", "an annotation needs a note")
            if entry.get("anchor") is not None:
                _validate_anchor(entry["anchor"], blocks, snapshot_id)
        scope_id = str(entry.get("scope_id"))
        scope = scopes.get(scope_id)
        if scope is None:
            raise WorkbenchError("invalid_target", f"feedback scope is not declared: {scope_id}")
        targets = [str(target) for target in scope.get("target_ids", []) or []]
        target_id = str(entry.get("target_id"))
        if target_id not in targets and target_id != f"scope:{scope_id}":
            raise WorkbenchError("invalid_target", f"feedback target is outside the declared scope: {target_id}")
        if category == "seen" and str(scope.get("kind")) != "round":
            raise WorkbenchError("invalid_target", "seen is only a round marker")
        if category == "focus_requests" and target_id not in comments:
            raise WorkbenchError("invalid_target", "a focus request must name a known comment")
        if category == "confirmations":
            if target_id != f"scope:{scope_id}":
                raise WorkbenchError("invalid_target", "a confirmation must address its own scope")
            confirmation_kind = str(entry.get("kind"))
            if confirmation_kind not in CONFIRMATION_KINDS:
                raise WorkbenchError("invalid_result", f"confirmation kind must be one of {sorted(CONFIRMATION_KINDS)}")
            if confirmation_kind != str(scope.get("kind")):
                raise WorkbenchError("invalid_target", "confirmation kind must match the scope kind")
            if [str(member) for member in entry.get("members") or []] != targets:
                raise WorkbenchError("invalid_target", "a confirmation must cover the exact candidate membership")
            if confirmation_kind == "strategy" and targets != [f"comment:{active_comment_id}"]:
                raise WorkbenchError("invalid_target", "only the active strategy can be confirmed")
            if confirmation_kind == "strategy" and targets:
                blocked = strategy_blockers(business, targets[0].split(":", 1)[-1])
                if blocked:
                    raise WorkbenchError("invalid_target", "a blocked strategy cannot be confirmed: " + ", ".join(blocked))
            target_set = set(targets)
            if confirmation_kind == "strategy":
                # A strategy scope carries its dependency closure in the baseline,
                # so feedback on a dependency must keep the card pending too.
                baseline = scope.get("baseline")
                tables = baseline.get("tables") if isinstance(baseline, dict) else None
                rows = tables.get("atomic_comments", []) if isinstance(tables, dict) else []
                for row in rows or []:
                    if isinstance(row, dict) and row.get("comment_id"):
                        target_set.add(f"comment:{row['comment_id']}")
            if any(blocks_confirmation(problem, entry, business, scopes, target_set) for problem in entries):
                raise WorkbenchError("invalid_target", "unresolved feedback keeps this confirmation pending")


# -------------------------------------------------------------------- receipts

def receipt_statements(ddl_path: Path) -> list[str]:
    if not ddl_path.is_file():
        raise WorkbenchError("missing_receipts_ddl", f"receipt DDL not found: {ddl_path}")
    text = ddl_path.read_text(encoding="utf-8")
    lines = [line for line in text.splitlines() if not line.lstrip().startswith("--")]
    statements = [statement.strip() for statement in "\n".join(lines).split(";")]
    return [statement for statement in statements if statement]


def ensure_receipt_tables(connection: sqlite3.Connection, ddl_path: Path) -> None:
    for statement in receipt_statements(ddl_path):
        connection.execute(statement)


def safe_rollback(connection: sqlite3.Connection) -> None:
    try:
        connection.execute("ROLLBACK")
    except sqlite3.OperationalError:
        pass  # nothing was open yet, for example a prerequisite failure


def feedback_entries(result: dict[str, object]) -> list[dict[str, object]]:
    feedback = result.get("feedback")
    if not isinstance(feedback, dict):
        raise WorkbenchError("invalid_result", "result requires a feedback object")
    entries: list[dict[str, object]] = []
    for category in ("dispositions", "annotations", "confirmations", "seen", "focus_requests", "overall_note"):
        for entry in feedback.get(category, []) or []:
            if not isinstance(entry, dict):
                raise WorkbenchError("invalid_result", f"feedback.{category} entries must be objects")
            entries.append({**entry, "category": category})
    return entries


def is_semantic(entry: dict[str, object]) -> bool:
    """Only the round ``seen`` marker is a pure reading note.

    Adjustments, defers, focus requests, overall notes, annotations and
    confirmations all carry a disposition the Agent still has to apply, so each
    one needs the callback's real effect reference before it counts as handled.
    """
    return entry.get("category") != "seen"


def payload_hash(entry: dict[str, object]) -> str:
    payload = {key: value for key, value in entry.items() if key != "category"}
    return sha256_text(canonical(payload))


def unselected_detail(entry: dict[str, object], reason: str) -> str:
    """Reason plus the entry's own target and note, so the next delivery can
    understand what is still open without re-reading the earlier result."""
    note = " ".join(str(entry.get("note") or "").split())
    if len(note) > UNSELECTED_NOTE_LIMIT:
        note = note[:UNSELECTED_NOTE_LIMIT] + "…"
    detail = f"{reason} · target={entry.get('target_id')}"
    return f"{detail} · note={note}" if note else detail


def _existing_receipts(connection: sqlite3.Connection, snapshot_id: str, feedback_id: str) -> list[sqlite3.Row]:
    return connection.execute(
        "SELECT payload_sha256, status FROM workbench_feedback_receipts WHERE snapshot_id = ? AND feedback_id = ?",
        (snapshot_id, feedback_id),
    ).fetchall()


def pending_feedback(connection: sqlite3.Connection) -> list[dict[str, object]]:
    """Carry still-unresolved feedback into a new delivery.

    A pending or conflicting row is resolved only by an applied receipt for the
    same feedback that is newer than the row itself. An older applied receipt
    must not swallow a later divergent payload, so a conflict raised after an
    earlier apply stays visible until the user reconciles it. Absent receipts
    tables mean nothing has been processed yet.
    """
    exists = connection.execute(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'workbench_feedback_receipts'"
    ).fetchone()
    if exists is None:
        return []
    rows = connection.execute(
        "SELECT result_id, feedback_id, scope_id, status, detail FROM workbench_feedback_receipts AS stale"
        " WHERE stale.status IN ('pending', 'conflict')"
        " AND NOT EXISTS (SELECT 1 FROM workbench_feedback_receipts AS resolved"
        "   WHERE resolved.feedback_id = stale.feedback_id AND resolved.status = 'applied'"
        "   AND resolved.created_at > stale.created_at)"
        " ORDER BY stale.created_at, stale.feedback_id"
    ).fetchall()
    latest: dict[str, dict[str, object]] = {}
    for row in rows:
        latest[str(row["feedback_id"])] = {
            "result_id": row["result_id"],
            "feedback_id": row["feedback_id"],
            "scope_id": row["scope_id"],
            "status": row["status"],
            "note": row["detail"],
        }
    return [latest[feedback_id] for feedback_id in sorted(latest)]


def accept_result(
    *,
    db_path: Path,
    result: dict[str, object],
    snapshot: dict[str, object],
    trusted: object,
    context: object,
    resolve,
    selection: list[str] | None = None,
    receipts_ddl: Path | None = None,
    semantic_write=None,
    allow_update: bool = False,
) -> dict[str, object]:
    """Recheck dependencies and record processed feedback.

    The semantic database write is a caller supplied callable so a returned
    result can never smuggle arbitrary SQL. The callable runs inside the same
    BEGIN IMMEDIATE transaction as its receipts.
    """
    ddl_path = receipts_ddl or Path(__file__).with_name("receipts.sql")
    if trusted is None:
        raise WorkbenchError("missing_trusted_snapshot", "a separately retained snapshot is required before acceptance")
    if not isinstance(result, dict) or not isinstance(snapshot, dict):
        raise WorkbenchError("invalid_result", "result and snapshot must be objects")
    if context is None:
        raise WorkbenchError("context_required", "acceptance requires the current exact context")
    if canonical(snapshot) != canonical(trusted):
        raise WorkbenchError("untrusted_snapshot", "delivered snapshot differs from the retained snapshot")
    if canonical(result.get("workspace")) != canonical(trusted):
        raise WorkbenchError("untrusted_result", "result candidate differs from the retained snapshot")
    snapshot_id = str(snapshot.get("snapshot_id"))
    if str(result.get("snapshot_id")) != snapshot_id:
        raise WorkbenchError("snapshot_mismatch", "result snapshot identity does not match the delivered snapshot")
    validate_snapshot_shape(snapshot)
    validate_selector(snapshot.get("context"))
    if not contexts_match(snapshot.get("context"), context):
        raise WorkbenchError("context_mismatch", "current context does not match the snapshot context")
    validate_result_shape(result, snapshot)

    entries = feedback_entries(result)
    if not selection:
        raise WorkbenchError("selection_required", "acceptance requires an explicit feedback selection, never bulk approval")
    known = {str(entry.get("feedback_id")) for entry in entries}
    unknown = sorted(set(selection) - known)
    if unknown:
        raise WorkbenchError("unknown_feedback", "selected feedback is not part of the result", {"feedback_ids": unknown})
    chosen = set(selection)
    unselected = sorted(known - chosen)
    unselected_entries = [entry for entry in entries if str(entry.get("feedback_id")) not in chosen]
    entries = [entry for entry in entries if str(entry.get("feedback_id")) in chosen]
    scope_baselines = _scope_index(snapshot)
    result_id = str(result.get("result_id", ""))
    draft_id = str(result.get("draft_id", ""))
    workspace_id = str(result.get("workspace_id") or (result.get("workspace") or {}).get("workspace_id", ""))

    connection = sqlite3.connect(str(db_path), isolation_level=None)
    connection.row_factory = sqlite3.Row
    applied: list[dict[str, object]] = []
    skipped: list[dict[str, object]] = []
    pending: list[dict[str, object]] = []
    conflicts: list[dict[str, object]] = []
    accepted_scopes: set[str] = set()
    try:
        connection.execute("PRAGMA foreign_keys = ON")
        missing_tables, missing_columns = check_prerequisites(connection)
        if missing_tables or missing_columns:
            raise WorkbenchError(
                "missing_required_data",
                "task database does not match the workbench projection contract",
                {"missing_tables": missing_tables, "missing_columns": missing_columns},
            )
        connection.execute("BEGIN IMMEDIATE")
        ensure_receipt_tables(connection, ddl_path)
        # Unselected feedback is only recorded as unresolved metadata, never
        # applied, and an existing receipt for the same payload is left alone.
        for entry in unselected_entries:
            feedback_id = str(entry.get("feedback_id"))
            scope_id = str(entry.get("scope_id"))
            digest = payload_hash(entry)
            existing = _existing_receipts(connection, snapshot_id, feedback_id)
            if any(row["payload_sha256"] == digest for row in existing):
                continue
            changed = bool(existing)
            _record(
                connection, snapshot_id, feedback_id, digest, result_id, draft_id, workspace_id,
                scope_id, str(entry.get("target_id")),
                "conflict" if changed else "pending",
                unselected_detail(entry, "payload_changed_since_recorded" if changed else "not_selected"),
                preserve=True,
            )
        for entry in entries:
            feedback_id = str(entry.get("feedback_id"))
            scope_id = str(entry.get("scope_id"))
            target_id = str(entry.get("target_id"))
            digest = payload_hash(entry)
            existing = _existing_receipts(connection, snapshot_id, feedback_id)
            if any(row["payload_sha256"] == digest and row["status"] == "applied" for row in existing):
                skipped.append({"feedback_id": feedback_id, "scope_id": scope_id, "reason": "already_applied"})
                accepted_scopes.add(scope_id)
                continue
            if any(row["payload_sha256"] != digest for row in existing) and not allow_update:
                conflicts.append({"feedback_id": feedback_id, "scope_id": scope_id, "reason": "divergent_payload"})
                _record(connection, snapshot_id, feedback_id, digest, result_id, draft_id, workspace_id, scope_id, target_id, "conflict", "divergent payload for the same feedback identity")
                continue
            scope = scope_baselines.get(scope_id)
            if scope is None:
                pending.append({"feedback_id": feedback_id, "scope_id": scope_id, "reason": "unknown_scope"})
                _record(connection, snapshot_id, feedback_id, digest, result_id, draft_id, workspace_id, scope_id, target_id, "pending", "feedback scope is not part of the delivered snapshot")
                continue
            drift = _baseline_drift(connection, scope, resolve)
            if drift["unassessable"]:
                pending.append({"feedback_id": feedback_id, "scope_id": scope_id, "reason": "unassessable_source", "paths": drift["unresolved"]})
                _record(connection, snapshot_id, feedback_id, digest, result_id, draft_id, workspace_id, scope_id, target_id, "pending", "scope source material cannot be located")
                continue
            if drift["tables"] or any(drift["files"].values()):
                changed_files = sorted(set(drift["files"]["added"] + drift["files"]["removed"] + drift["files"]["changed"]))
                pending.append({"feedback_id": feedback_id, "scope_id": scope_id, "reason": "baseline_drift", "tables": sorted(drift["tables"]), "files": changed_files})
                _record(connection, snapshot_id, feedback_id, digest, result_id, draft_id, workspace_id, scope_id, target_id, "pending", "dependency scope changed after inspection")
                continue
            if is_semantic(entry):
                if semantic_write is None:
                    raise WorkbenchError("semantic_write_required", "accepted feedback has semantic effects but no write callback was supplied")
                effect = semantic_write(connection, {"result": result, "feedback": [entry]})
                semantic_ref = "" if effect is None else (effect if isinstance(effect, str) else canonical(effect))
                if not semantic_ref:
                    raise WorkbenchError("missing_semantic_ref", "the semantic write callback must return the effect reference it applied")
            else:
                semantic_ref = ""
            _record(connection, snapshot_id, feedback_id, digest, result_id, draft_id, workspace_id, scope_id, str(entry.get("target_id")), "applied", "", semantic_ref)
            applied.append({"feedback_id": feedback_id, "scope_id": scope_id, "semantic": is_semantic(entry), "semantic_ref": semantic_ref})
            accepted_scopes.add(scope_id)
        for scope_id in sorted(accepted_scopes):
            scope = scope_baselines.get(scope_id)
            baseline_sha = sha256_text(canonical(scope.get("baseline"))) if scope else ""
            connection.execute(
                "INSERT INTO workbench_scope_receipts (snapshot_id, scope_id, status, baseline_sha256, result_id, detail, created_at)"
                " VALUES (?, ?, 'accepted', ?, ?, '', ?)"
                " ON CONFLICT(snapshot_id, scope_id) DO UPDATE SET status = 'accepted', baseline_sha256 = excluded.baseline_sha256, result_id = excluded.result_id, created_at = excluded.created_at",
                (snapshot_id, scope_id, baseline_sha, result_id, now_iso()),
            )
        connection.execute("COMMIT")
    except WorkbenchError:
        safe_rollback(connection)
        raise
    except Exception as error:  # a failed callback must roll back its receipts too
        safe_rollback(connection)
        raise WorkbenchError("semantic_write_failed", str(error)) from error
    finally:
        connection.close()
    return {"ok": True, "applied": applied, "skipped": skipped, "pending": pending, "conflicts": conflicts, "unselected": unselected}


def _record(
    connection: sqlite3.Connection,
    snapshot_id: str,
    feedback_id: str,
    digest: str,
    result_id: str,
    draft_id: str,
    workspace_id: str,
    scope_id: str,
    target_id: str,
    status: str,
    detail: str,
    semantic_ref: str = "",
    preserve: bool = False,
) -> None:
    clause = (
        "DO NOTHING"
        if preserve
        else "DO UPDATE SET status = excluded.status, result_id = excluded.result_id,"
        " semantic_ref = excluded.semantic_ref, detail = excluded.detail, created_at = excluded.created_at"
    )
    connection.execute(
        "INSERT INTO workbench_feedback_receipts (snapshot_id, feedback_id, payload_sha256, result_id, draft_id, workspace_id, scope_id, target_id, status, semantic_ref, detail, created_at)"
        " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        f" ON CONFLICT(snapshot_id, feedback_id, payload_sha256) {clause}",
        (snapshot_id, feedback_id, digest, result_id, draft_id, workspace_id, scope_id, target_id, status, semantic_ref, detail, now_iso()),
    )


def _baseline_drift(connection: sqlite3.Connection, scope: dict[str, object], resolve) -> dict[str, object]:
    """Re-read semantic rows and actual source bytes inside the transaction,
    so an earlier accepted write is reflected before the next scope is judged."""
    business = read_business(connection)
    current = baseline_for_scope(business, scope, resolve)
    recorded = scope.get("baseline", {}) if isinstance(scope, dict) else {}
    return {
        "tables": diff_tables(recorded.get("tables", {}), current["tables"]),
        "files": diff_files(recorded.get("files", []), current["files"]),
        "unassessable": bool(current["unresolved"]),
        "unresolved": current["unresolved"],
    }


def load_write_callback(spec: str):
    path_text, _, attribute = spec.rpartition(":")
    if not path_text or not attribute:
        raise WorkbenchError("invalid_write_callback", "write callback must be FILE.py:function")
    path = Path(path_text)
    if not path.is_file():
        raise WorkbenchError("invalid_write_callback", f"write module not found: {path}")
    module_spec = importlib.util.spec_from_file_location("revision_master_workbench_write", path)
    if module_spec is None or module_spec.loader is None:
        raise WorkbenchError("invalid_write_callback", f"cannot load write module: {path}")
    module = importlib.util.module_from_spec(module_spec)
    module_spec.loader.exec_module(module)
    callback = getattr(module, attribute, None)
    if not callable(callback):
        raise WorkbenchError("invalid_write_callback", f"{spec} is not callable")
    return callback


# ------------------------------------------------------------------------- cli

def _manifest(value: object) -> list[dict[str, object]]:
    if value is None:
        return []
    if not isinstance(value, list):
        raise WorkbenchError("invalid_manifest", "manifest must be a JSON array")
    return [dict(entry) for entry in value if isinstance(entry, dict)]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="review_workbench", description="revision-master review workbench projection, check and receipt tooling")
    subparsers = parser.add_subparsers(dest="command", required=True)
    project_parser = subparsers.add_parser("project")
    project_parser.add_argument("--db", required=True)
    project_parser.add_argument("--project-root", required=True)
    project_parser.add_argument("--context", required=True)
    check_parser = subparsers.add_parser("check")
    check_parser.add_argument("--db", required=True)
    check_parser.add_argument("--project-root", required=True)
    check_parser.add_argument("--snapshot", required=True)
    check_parser.add_argument("--context")
    accept_parser = subparsers.add_parser("accept")
    accept_parser.add_argument("--db", required=True)
    accept_parser.add_argument("--project-root", required=True)
    accept_parser.add_argument("--result", required=True)
    accept_parser.add_argument("--snapshot", required=True)
    accept_parser.add_argument("--trusted")
    accept_parser.add_argument("--context", required=True)
    accept_parser.add_argument("--accept-feedback", action="append", required=True, dest="accept_feedback", metavar="FEEDBACK_ID")
    accept_parser.add_argument("--write")
    accept_parser.add_argument("--receipts-ddl")
    accept_parser.add_argument("--allow-update", action="store_true")
    args = parser.parse_args(argv)

    try:
        resolve = source_resolver(args.project_root)
        if args.command == "project":
            payload = project(Path(args.db), load_json(args.context), resolve)
        elif args.command == "check":
            payload = check(
                Path(args.db),
                load_json(args.snapshot),
                load_json(args.context) if args.context else None,
                resolve,
            )
        else:
            callback = load_write_callback(args.write) if args.write else None
            payload = accept_result(
                db_path=Path(args.db),
                result=load_json(args.result),
                snapshot=load_json(args.snapshot),
                trusted=load_json(args.trusted) if args.trusted else None,
                context=load_json(args.context),
                resolve=resolve,
                selection=args.accept_feedback,
                receipts_ddl=Path(args.receipts_ddl) if args.receipts_ddl else None,
                semantic_write=callback,
                allow_update=args.allow_update,
            )
    except WorkbenchError as error:
        print(json.dumps(error.as_json(), ensure_ascii=False))
        return 2
    print(json.dumps(payload, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
