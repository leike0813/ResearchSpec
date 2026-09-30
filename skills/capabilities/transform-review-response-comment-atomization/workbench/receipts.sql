-- Project-owned receipt DDL for the revision-master review workbench.
--
-- These tables live in the existing task-local revision-master.db. They are
-- created only inside an explicit semantic initialization or acceptance write,
-- never by read-only preparation or scope checking. Each successful semantic
-- write commits with its receipt in one transaction, so a crash between the
-- two is impossible.
--
-- Snapshot identity is part of the key: a confirmation or disposition recorded
-- against one snapshot never transfers to a new snapshot by business id alone.
-- Removal of feedback in a later export leaves the applied receipt untouched;
-- reversal requires an explicit request.

CREATE TABLE IF NOT EXISTS workbench_feedback_receipts (
    snapshot_id TEXT NOT NULL,
    feedback_id TEXT NOT NULL,
    payload_sha256 TEXT NOT NULL,
    result_id TEXT NOT NULL,
    draft_id TEXT NOT NULL DEFAULT '',
    workspace_id TEXT NOT NULL,
    scope_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('applied', 'pending', 'conflict')),
    semantic_ref TEXT NOT NULL DEFAULT '',
    detail TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT '',
    PRIMARY KEY (snapshot_id, feedback_id, payload_sha256)

);

CREATE TABLE IF NOT EXISTS workbench_scope_receipts (
    snapshot_id TEXT NOT NULL,
    scope_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('accepted', 'pending', 'conflict')),
    baseline_sha256 TEXT NOT NULL DEFAULT '',
    result_id TEXT NOT NULL DEFAULT '',
    detail TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT '',
    PRIMARY KEY (snapshot_id, scope_id)

);

CREATE INDEX IF NOT EXISTS workbench_feedback_receipts_identity
    ON workbench_feedback_receipts (snapshot_id, feedback_id);
