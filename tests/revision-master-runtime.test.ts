import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { chmod, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { RevisionMasterWorkspaceSchema } from "../src/review-workspace/revision-master.js";
import { authorCapabilityPackage } from "../src/arsu-converter/authoring/author.js";
import { REVISION_MASTER_AUTHORING_OPTIONS, REVISION_MASTER_AUTHORING_SOURCES } from "../src/arsu-converter/authoring/revision-master-sources.js";
import { loadCapabilityRegistry } from "../src/capabilities/registry.js";

import { revisionMasterSchemaSql } from "./helpers/revision-master.js";

const ROOT = process.cwd();
const TOOL = path.join(ROOT, "authoring/revision-master/workbench/review_workbench.py");
const AR_PROJECT = path.join(homedir(), ".ar");

const REVIEW_TEXT = "R1 asks to justify the buffer distance. R2 asks for the missing participant counts.";
const MANUSCRIPT_TEXT = "# Methods\n\nWe used a 500 m buffer around each home address.\n";

interface ToolResult { status: number | null; stdout: string; stderr: string }

function python(args: string[], input?: string): ToolResult {
  const result = spawnSync("uv", ["run", `--project=${AR_PROJECT}`, "--locked", "--", "python", ...args], {
    encoding: "utf8",
    input,
    maxBuffer: 128 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

function tool(args: string[]): ToolResult {
  return python([TOOL, ...args]);
}

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- callers pin the expected JSON shape
function parse<T = unknown>(result: ToolResult): T {
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout) as T;
}

function parseError(result: ToolResult): { ok: false; error: { code: string; message: string; details?: unknown } } {
  assert.equal(result.status, 2, `expected a structured error, got ${String(result.status)}: ${result.stdout}${result.stderr}`);
  return JSON.parse(result.stdout) as { ok: false; error: { code: string; message: string; details?: unknown } };
}

async function writeJson(target: string, value: unknown): Promise<void> {
  await writeFile(target, JSON.stringify(value), "utf8");
}

interface Workspace {
  task: string;
  db: string;
  contextPath: string;
  context: Record<string, unknown>;
}

async function createWorkspace(options: { dropTable?: string; dropColumn?: [string, string]; packageScripts?: string } = {}): Promise<Workspace> {
  const task = await mkdtemp(path.join(tmpdir(), "revision-master-workbench-"));
  const db = path.join(task, "revision-master.db");
  if (options.packageScripts) {
    const initialized = python(["-", db, options.packageScripts], [
      "import sys",
      "from pathlib import Path",
      "sys.path.insert(0, sys.argv[2])",
      "import workspace_db",
      "workspace_db.initialize_database(Path(sys.argv[1]))",
    ].join("\n"));
    assert.equal(initialized.status, 0, initialized.stderr);
  } else {
    const ddl = (await revisionMasterSchemaSql())
      .map((statement) => `${statement.trim().replace(/;+$/, "")};`)
      .join("\n");
    const schemaFile = path.join(task, "schema.sql");
    await writeFile(schemaFile, ddl, "utf8");
    const created = python(["-", db, schemaFile], [
      "import sqlite3, sys",
      "connection = sqlite3.connect(sys.argv[1])",
      "connection.executescript(open(sys.argv[2], encoding='utf-8').read())",
      "connection.commit()",
    ].join("\n"));
    assert.equal(created.status, 0, created.stderr);
  }

  await writeFile(path.join(task, "review-comments.md"), REVIEW_TEXT, "utf8");
  await writeFile(path.join(task, "manuscript.md"), MANUSCRIPT_TEXT, "utf8");

  const seed = [
    "import sqlite3, sys",
    "connection = sqlite3.connect(sys.argv[1])",
    "connection.execute(\"CREATE TABLE test_writes (write_id INTEGER PRIMARY KEY AUTOINCREMENT, feedback_id TEXT, payload TEXT)\")",
    `connection.execute("INSERT INTO review_comment_source_documents VALUES ('doc_1','review_comments_source',1,'Reviewer comments','review-comments.md',?)", (${JSON.stringify(REVIEW_TEXT)},))`,
    "connection.executemany(\"INSERT INTO raw_review_threads VALUES (?,?,?,?,?,?)\", [('R1','reviewer_1',1,'reviewer_comment','R1 asks to justify the buffer distance.','Buffer distance'),('R2','reviewer_2',2,'reviewer_comment','R2 asks for the missing participant counts.','Missing counts')])",
    "connection.executemany(\"INSERT INTO atomic_comments VALUES (?,?,?,?)\", [('A1',1,'Justify the buffer distance','Report buffer sensitivity'),('A2',2,'Report missing participant counts','Add a participant flow table'),('A3',3,'Converge causal wording','Rewrite causal language')])",
    "connection.executemany(\"INSERT INTO raw_thread_atomic_links VALUES (?,?,?)\", [('R1','A1',1),('R1','A3',2),('R2','A2',1),('R2','A3',2)])",
    "connection.executemany(\"INSERT INTO atomic_comment_source_spans VALUES (?,?,?,?)\", [('A1','R1','R1 asks to justify the buffer distance.',''),('A2','R2','R2 asks for the missing participant counts.',''),('A3','R1','R1 asks to justify the buffer distance.',''),('A3','R2','R2 asks for the missing participant counts.','')])",
    `connection.execute("INSERT INTO raw_thread_source_spans VALUES ('R1','doc_1',1,'primary',0,38,?)", (${JSON.stringify(REVIEW_TEXT.slice(0, 38))},))`,
    `connection.execute("INSERT INTO raw_thread_source_spans VALUES ('R2','doc_1',1,'primary',40,78,?)", (${JSON.stringify(REVIEW_TEXT.slice(40, 78))},))`,
    "connection.executemany(\"INSERT INTO atomic_comment_state VALUES (?,?,?,?,?,?)\", [('A1','ready','high','no','no','confirm strategy'),('A2','blocked','high','yes','yes','await results'),('A3','todo','medium','no','no','confirm strategy')])",
    "connection.executemany(\"INSERT INTO atomic_comment_target_locations VALUES (?,?,?,?)\", [('A1',1,'manuscript.md::Methods::buffer','primary'),('A2',1,'manuscript.md::Results::counts','primary'),('A3',1,'manuscript.md::Discussion::wording','primary')])",
    "connection.executemany(\"INSERT INTO atomic_comment_analysis_links VALUES (?,?,?,?,?,?)\", [('A1',1,'Exposure definition','Processing log','Threshold unstated',None),('A2',1,'Analysis sample','Cohort ledger','Missing counts',None),('A3',1,'Causal claim','Cross-sectional design','Design limits','A1')])",
    "connection.execute(\"INSERT INTO strategy_cards VALUES ('A2','Accept sensitivity analysis','Two reviewers asked the same question')\")",
    "connection.execute(\"INSERT INTO strategy_card_evidence_items VALUES ('A2',1,'300 m and 1000 m reruns','no','Needs the rerun table')\")",
    "connection.commit()",
  ].join("\n");
  const seeded = python(["-", path.join(task, "revision-master.db")], seed);
  assert.equal(seeded.status, 0, seeded.stderr);

  if (options.dropTable) {
    const dropped = python(["-", path.join(task, "revision-master.db")], [
      "import sqlite3, sys",
      "connection = sqlite3.connect(sys.argv[1])",
      `connection.execute("DROP TABLE ${options.dropTable}")`,
      "connection.commit()",
    ].join("\n"));
    assert.equal(dropped.status, 0, dropped.stderr);
  }
  if (options.dropColumn) {
    const [table, column] = options.dropColumn;
    const dropped = python(["-", path.join(task, "revision-master.db")], [
      "import sqlite3, sys",
      "connection = sqlite3.connect(sys.argv[1])",
      `connection.execute("ALTER TABLE ${table} DROP COLUMN ${column}")`,
      "connection.commit()",
    ].join("\n"));
    assert.equal(dropped.status, 0, dropped.stderr);
  }

  const context = {
    task_id: "task_1",
    selector: "node:run_1/node_review@round_1",
    run_id: "run_1",
    node_id: "node_review",
    round_id: "round_1",
    stage: "strategy",
    formal_status: "awaiting_review",
    active_comment_id: "A2",
  };
  const contextPath = path.join(task, "context.json");
  await writeJson(contextPath, context);
  return { task, db: path.join(task, "revision-master.db"), contextPath, context };
}

interface Projection {
  context: Record<string, unknown>;
  business: Record<string, Array<Record<string, unknown>>>;
  scopes: Array<{ scope_id: string; kind: string; target_ids: string[]; baseline: { tables: Record<string, Array<Record<string, unknown>>>; files: Array<{ path: string; sha256: string }>; unresolved: string[] } }>;
  unresolved: string[];
  pending_feedback: Array<Record<string, unknown>>;
}

function project(workspace: Workspace): Projection {
  return parse<Projection>(tool(["project", "--db", workspace.db, "--project-root", workspace.task, "--context", workspace.contextPath]));
}

function snapshotFrom(projection: Projection, snapshotId: string): Record<string, unknown> {
  return {
    schema_version: "revision-master-review-workspace.v1",
    workspace_id: "ws_1",
    snapshot_id: snapshotId,
    title: "Revision master review",
    context: projection.context,
    business: projection.business,
    scopes: projection.scopes,
    sources: { files: [{ path: "review-comments.md", sha256: sha256(REVIEW_TEXT) }, { path: "manuscript.md", sha256: sha256(MANUSCRIPT_TEXT) }], capture_limitations: [] },
    documents: [{
      document_id: "doc_review",
      title: "Reviewer comments",
      source_path: "review-comments.md",
      role: "review",
      original_text: REVIEW_TEXT,
      blocks: [{ id: "b1", kind: "paragraph", text: REVIEW_TEXT, runs: [], level: null, source_path: "review-comments.md", resource_id: null, note: null }],
    }],
    assets: [],
    locations: [],
    unresolved: [],
    next_step: "Review the delivered candidate.",
    pending_feedback: projection.pending_feedback,
  };
}

function emptyFeedback() {
  return { dispositions: [] as unknown[], annotations: [] as unknown[], confirmations: [] as unknown[], seen: [] as unknown[], focus_requests: [] as unknown[], overall_note: [] as unknown[] };
}

function resultFor(snapshot: Record<string, unknown>, feedback: ReturnType<typeof emptyFeedback>, ids: { resultId: string; draftId: string }): Record<string, unknown> {
  return {
    schema_version: "revision-master-review-result.v1",
    workspace: snapshot,
    snapshot_id: snapshot.snapshot_id,
    result_id: ids.resultId,
    draft_id: ids.draftId,
    export_revision: 1,
    exported_at: new Date().toISOString(),
    feedback,
  };
}

function disposition(feedbackId: string, scopeId: string, targetId: string, note = ""): Record<string, unknown> {
  return { feedback_id: feedbackId, scope_id: scopeId, target_id: targetId, note, action: "include" };
}

async function writeCallback(task: string): Promise<string> {
  const target = path.join(task, "semantic_write.py");
  await writeFile(target, [
    "def apply(connection, plan):",
    "    draft_id = plan['result'].get('draft_id', '')",
    "    if draft_id.startswith('fail'):",
    "        raise RuntimeError('injected write failure')",
    "    for entry in plan['feedback']:",
    "        connection.execute('INSERT INTO test_writes (feedback_id, payload) VALUES (?, ?)', (entry['feedback_id'], entry.get('note', '')))",
    "    return {'writes': [entry['feedback_id'] for entry in plan['feedback']]}",
  ].join("\n"), "utf8");
  return target;
}

function writeCount(task: string): number {
  const result = python(["-", path.join(task, "revision-master.db")], [
    "import sqlite3, sys",
    "connection = sqlite3.connect(sys.argv[1])",
    "print(connection.execute('SELECT COUNT(*) FROM test_writes').fetchone()[0])",
  ].join("\n"));
  assert.equal(result.status, 0, result.stderr);
  return Number(result.stdout.trim());
}

function receiptRows(task: string): Array<Record<string, unknown>> {
  const result = python(["-", path.join(task, "revision-master.db")], [
    "import json, sqlite3, sys",
    "connection = sqlite3.connect(sys.argv[1])",
    "connection.row_factory = sqlite3.Row",
    "exists = connection.execute(\"SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'workbench_feedback_receipts'\").fetchone()",
    "rows = [] if exists is None else [dict(row) for row in connection.execute('SELECT * FROM workbench_feedback_receipts ORDER BY feedback_id')]",
    "print(json.dumps(rows))",
  ].join("\n"));
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout) as Array<Record<string, unknown>>;
}

function logSummaries(task: string): string[] {
  const result = python(["-", path.join(task, "revision-master.db")], [
    "import json, sqlite3, sys",
    "connection = sqlite3.connect(sys.argv[1])",
    "print(json.dumps([row[0] for row in connection.execute('SELECT summary FROM revision_action_logs ORDER BY log_order')]))",
  ].join("\n"));
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout) as string[];
}

function acceptArgs(workspace: Workspace, files: { result: string; snapshot: string; trusted: string }, selection: string[], extra: string[] = []): Promise<string[]> {
  const args = ["accept", "--db", workspace.db, "--project-root", workspace.task, "--context", workspace.contextPath,
    "--result", files.result, "--snapshot", files.snapshot, "--trusted", files.trusted];
  for (const id of selection) args.push("--accept-feedback", id);
  return Promise.resolve([...args, ...extra]);
}

void test("workbench projects typed business rows, per-comment scopes, and hashed source files", async () => {
  const workspace = await createWorkspace();
  try {
    const projection = project(workspace);
    assert.equal(Object.keys(projection.business).length, 50);
    assert.ok(!Object.keys(projection.business).some((table) => table.startsWith("resume_")));
    assert.equal(projection.business.atomic_comments.length, 3);
    assert.equal(projection.business.raw_thread_atomic_links.length, 4);
    assert.equal(projection.business.atomic_comments[0]?.comment_id, "A1");

    const kinds = projection.scopes.map((scope) => scope.kind);
    assert.deepEqual(kinds, ["coverage", "board", "strategy", "strategy", "strategy", "round"]);
    assert.deepEqual(projection.scopes.map((scope) => scope.scope_id), ["coverage", "board", "strategy:A1", "strategy:A2", "strategy:A3", "round"]);
    const perComment = projection.scopes.find((scope) => scope.scope_id === "strategy:A1");
    assert.deepEqual(perComment?.target_ids, ["comment:A1"]);
    assert.deepEqual(perComment?.baseline.tables.strategy_cards, []);
    const active = projection.scopes.find((scope) => scope.scope_id === "strategy:A2");
    assert.equal(active?.baseline.tables.strategy_cards?.length, 1);
    assert.equal(active?.baseline.tables.strategy_card_evidence_items?.length, 1);
    assert.ok((active?.baseline.files ?? []).some((file) => file.path === "manuscript.md"));
    assert.equal(active?.baseline.files.find((file) => file.path === "manuscript.md")?.sha256, sha256(MANUSCRIPT_TEXT));
    const coverage = projection.scopes.find((scope) => scope.scope_id === "coverage");
    assert.equal(coverage?.baseline.files.find((file) => file.path === "review-comments.md")?.sha256, sha256(REVIEW_TEXT));

    const snapshot = snapshotFrom(projection, "snap_1");
    assert.doesNotThrow(() => RevisionMasterWorkspaceSchema.parse(snapshot));
  } finally {
    await rm(workspace.task, { recursive: true, force: true });
  }
});

void test("read-only projection reports missing fields and never writes the task database", async () => {
  const missingTable = await createWorkspace({ dropTable: "strategy_card_evidence_items" });
  const missingColumn = await createWorkspace({ dropColumn: ["atomic_comment_state", "next_action"] });
  const complete = await createWorkspace();
  try {
    const before = await readFile(missingTable.db);
    const error = parseError(tool(["project", "--db", missingTable.db, "--project-root", missingTable.task, "--context", missingTable.contextPath]));
    assert.equal(error.error.code, "missing_required_data");
    assert.deepEqual((error.error.details as { missing_tables: string[] }).missing_tables, ["strategy_card_evidence_items"]);
    assert.deepEqual(await readFile(missingTable.db), before);

    const columnError = parseError(tool(["project", "--db", missingColumn.db, "--project-root", missingColumn.task, "--context", missingColumn.contextPath]));
    assert.equal(columnError.error.code, "missing_required_data");
    assert.deepEqual((columnError.error.details as { missing_columns: Record<string, string[]> }).missing_columns, { atomic_comment_state: ["next_action"] });

    const guarded = await readFile(complete.db);
    await chmod(complete.db, 0o444);
    const readOnly = parse<Projection>(tool(["project", "--db", complete.db, "--project-root", complete.task, "--context", complete.contextPath]));
    assert.equal(readOnly.business.atomic_comments.length, 3);
    assert.deepEqual(await readFile(complete.db), guarded);

    const snapshotFile = path.join(complete.task, "snapshot.json");
    await writeJson(snapshotFile, snapshotFrom(readOnly, "snap_readonly"));
    const guard = snapshotFrom(readOnly, "snap_guard");
    const guardFiles = { snapshot: path.join(complete.task, "guard-snapshot.json"), trusted: path.join(complete.task, "guard-trusted.json"), result: path.join(complete.task, "guard-result.json") };
    const guardFeedback = emptyFeedback();
    guardFeedback.dispositions.push(disposition("f1", "strategy:A2", "comment:A2", ""));
    await writeJson(guardFiles.snapshot, guard);
    await writeJson(guardFiles.trusted, guard);
    await writeJson(guardFiles.result, resultFor(guard, guardFeedback, { resultId: "res_guard", draftId: "draft_1" }));
    const guardError = parseError(tool(["accept", "--db", missingColumn.db, "--project-root", missingColumn.task, "--context", missingColumn.contextPath,
      "--snapshot", guardFiles.snapshot, "--trusted", guardFiles.trusted, "--result", guardFiles.result, "--accept-feedback", "f1"]));
    assert.equal(guardError.error.code, "missing_required_data");

    const outside = await mkdtemp(path.join(tmpdir(), "revision-master-outside-"));
    const secret = "Outside data that must never be read.";
    await writeFile(path.join(outside, "secret.md"), secret, "utf8");
    await rm(path.join(complete.task, "manuscript.md"));
    await symlink(path.join(outside, "secret.md"), path.join(complete.task, "manuscript.md"));
    const escaped = project(complete);
    assert.ok(escaped.unresolved.includes("manuscript.md"));
    assert.deepEqual(escaped.scopes.find((scope) => scope.scope_id === "strategy:A2")?.baseline.unresolved, ["manuscript.md"]);
    assert.deepEqual(escaped.scopes.find((scope) => scope.scope_id === "coverage")?.baseline.unresolved, []);
    assert.ok(!escaped.scopes.some((scope) => scope.baseline.files.some((file) => file.path === "manuscript.md")));
    assert.ok(!escaped.scopes.some((scope) => scope.baseline.files.some((file) => file.sha256 === sha256(secret))));
    const escapedCheck = parse<{ unassessable: boolean; scopes: Array<{ scope_id: string; status: string }> }>(tool(["check", "--db", complete.db, "--project-root", complete.task, "--snapshot", snapshotFile, "--context", complete.contextPath]));
    assert.equal(escapedCheck.scopes.find((scope) => scope.scope_id === "strategy:A2")?.status, "unassessable");
    await rm(outside, { recursive: true, force: true });
  } finally {
    await rm(missingTable.task, { recursive: true, force: true });
    await rm(missingColumn.task, { recursive: true, force: true });
    await rm(complete.task, { recursive: true, force: true });
  }
});

void test("scope checks isolate an unrelated card change and surface source drift", async () => {
  const workspace = await createWorkspace();
  try {
    const projection = project(workspace);
    const a2 = snapshotFrom(projection, "snap_a2");
    const a1Projection: Projection = { ...projection, context: { ...projection.context, active_comment_id: "A1" } };
    const a1 = snapshotFrom(a1Projection, "snap_a1");
    const snapshotFile = path.join(workspace.task, "snapshot_a1.json");
    await writeJson(snapshotFile, a1);

    const changed = python(["-", workspace.db], [
      "import sqlite3, sys",
      "connection = sqlite3.connect(sys.argv[1])",
      "connection.execute(\"INSERT INTO strategy_card_evidence_items VALUES ('A2',2,'Residual confounding check','yes','')\")",
      "connection.commit()",
    ].join("\n"));
    assert.equal(changed.status, 0, changed.stderr);

    const a1Check = parse<{ changed: boolean; scopes: Array<{ scope_id: string; status: string }> }>(tool(["check", "--db", workspace.db, "--project-root", workspace.task, "--snapshot", snapshotFile, "--context", workspace.contextPath]));
    assert.equal(a1Check.scopes.find((scope) => scope.scope_id === "strategy:A1")?.status, "unchanged");
    assert.equal(a1Check.scopes.find((scope) => scope.scope_id === "strategy:A2")?.status, "changed");

    const a2File = path.join(workspace.task, "snapshot_a2.json");
    await writeJson(a2File, a2);
    const a2Check = parse<{ changed: boolean; scopes: Array<{ scope_id: string; status: string; tables: Record<string, unknown> }> }>(tool(["check", "--db", workspace.db, "--project-root", workspace.task, "--snapshot", a2File, "--context", workspace.contextPath]));
    assert.equal(a2Check.changed, true);
    assert.equal(a2Check.scopes.find((scope) => scope.scope_id === "strategy:A2")?.status, "changed");
    assert.ok(a2Check.scopes.find((scope) => scope.scope_id === "strategy:A2")?.tables.strategy_card_evidence_items);

    await writeFile(path.join(workspace.task, "manuscript.md"), `${MANUSCRIPT_TEXT}\nAdded a sentence.\n`, "utf8");
    const source = parse<{ scopes: Array<{ scope_id: string; status: string; files: { changed: string[] } }> }>(tool(["check", "--db", workspace.db, "--project-root", workspace.task, "--snapshot", a2File, "--context", workspace.contextPath]));
    assert.deepEqual(source.scopes.find((scope) => scope.scope_id === "strategy:A2")?.files.changed, ["manuscript.md"]);
  } finally {
    await rm(workspace.task, { recursive: true, force: true });
  }
});

void test("acceptance processes one selected feedback per transaction step and records its semantic effect", async () => {
  const workspace = await createWorkspace();
  try {
    const projection = project(workspace);
    const snapshot = snapshotFrom(projection, "snap_accept");
    const snapshotFile = path.join(workspace.task, "snapshot.json");
    const trustedFile = path.join(workspace.task, "trusted.json");
    const resultFile = path.join(workspace.task, "result.json");
    await writeJson(snapshotFile, snapshot);
    await writeJson(trustedFile, snapshot);
    const callback = await writeCallback(workspace.task);

    const feedback = emptyFeedback();
    feedback.dispositions.push(disposition("f1", "strategy:A2", "comment:A2", "Accept the sensitivity plan"));
    feedback.dispositions.push(disposition("f2", "strategy:A1", "comment:A1", "Accept the exposure plan"));
    await writeJson(resultFile, resultFor(snapshot, feedback, { resultId: "res_1", draftId: "draft_1" }));
    const files = { result: resultFile, snapshot: snapshotFile, trusted: trustedFile };

    const accepted = parse<{ applied: Array<{ feedback_id: string; semantic_ref: string }>; unselected: string[] }>(tool(await acceptArgs(workspace, files, ["f1"], ["--write", `${callback}:apply`])));
    assert.deepEqual(accepted.applied.map((entry) => entry.feedback_id), ["f1"]);
    assert.deepEqual(accepted.unselected, ["f2"]);
    assert.match(accepted.applied[0]?.semantic_ref ?? "", /writes/);
    assert.equal(writeCount(workspace.task), 1);
    const rows = receiptRows(workspace.task);
    assert.equal(rows.filter((row) => row.feedback_id === "f1" && row.status === "applied").length, 1);
    assert.match(String(rows.find((row) => row.feedback_id === "f1")?.semantic_ref), /writes/);
    assert.equal(rows.find((row) => row.feedback_id === "f2")?.status, "pending");
    const f2Detail = String(rows.find((row) => row.feedback_id === "f2")?.detail);
    assert.match(f2Detail, /not_selected/);
    assert.match(f2Detail, /target=comment:A1/);
    assert.match(f2Detail, /Accept the exposure plan/);
    const carriedF2 = project(workspace).pending_feedback.find((row) => row.feedback_id === "f2");
    assert.equal(carriedF2?.scope_id, "strategy:A1");
    assert.equal(carriedF2?.result_id, "res_1");
    assert.match(String(carriedF2?.note), /not_selected/);

    const repeat = parse<{ applied: unknown[]; skipped: Array<{ feedback_id: string; reason: string }> }>(tool(await acceptArgs(workspace, files, ["f1"], ["--write", `${callback}:apply`])));
    assert.deepEqual(repeat.applied, []);
    assert.deepEqual(repeat.skipped.map((entry) => entry.reason), ["already_applied"]);
    assert.equal(writeCount(workspace.task), 1);
    assert.equal(receiptRows(workspace.task).filter((row) => row.feedback_id === "f2").length, 1);

    const edited = structuredClone(feedback);
    (edited.dispositions[0] as Record<string, unknown>).note = "Accept after adding the rerun table";
    await writeJson(resultFile, resultFor(snapshot, edited, { resultId: "res_2", draftId: "draft_1" }));
    const conflict = parse<{ conflicts: Array<{ feedback_id: string; reason: string }>; applied: unknown[] }>(tool(await acceptArgs(workspace, files, ["f1"], ["--write", `${callback}:apply`])));
    assert.deepEqual(conflict.conflicts.map((entry) => entry.reason), ["divergent_payload"]);
    assert.equal(writeCount(workspace.task), 1);
    const updated = parse<{ applied: Array<{ feedback_id: string }> }>(tool(await acceptArgs(workspace, files, ["f1"], ["--write", `${callback}:apply`, "--allow-update"])));
    assert.deepEqual(updated.applied.map((entry) => entry.feedback_id), ["f1"]);
    assert.equal(writeCount(workspace.task), 2);

    const removed = emptyFeedback();
    removed.dispositions.push(disposition("f1", "strategy:A2", "comment:A2", "Accept the sensitivity plan"));
    removed.dispositions.push(disposition("f2", "strategy:A1", "comment:A1", "Accept the exposure plan"));
    removed.seen.push({ feedback_id: "f9", scope_id: "round", target_id: "thread:R1", note: "" });
    await writeJson(resultFile, resultFor(snapshot, removed, { resultId: "res_3", draftId: "draft_1" }));
    const removedOutcome = parse<{ applied: unknown[] }>(tool(await acceptArgs(workspace, files, ["f9"])));
    assert.deepEqual(removedOutcome.applied.map(() => null), [null]);
    assert.equal(writeCount(workspace.task), 2);
    const afterRemoved = receiptRows(workspace.task);
    assert.equal(afterRemoved.filter((row) => row.feedback_id === "f1" && row.status === "applied").length, 2);
    assert.equal(afterRemoved.some((row) => row.feedback_id === "f1" && row.status === "pending"), false);
    assert.equal(afterRemoved.filter((row) => row.feedback_id === "f2" && row.status === "pending").length, 1);

    const failing = emptyFeedback();
    failing.dispositions.push(disposition("f4", "strategy:A1", "comment:A1", "Untouched selection"));
    failing.dispositions.push(disposition("f3", "strategy:A2", "comment:A2", "Will fail"));
    await writeJson(resultFile, resultFor(snapshot, failing, { resultId: "res_4", draftId: "fail-1" }));
    const failure = parseError(tool(await acceptArgs(workspace, files, ["f3"], ["--write", `${callback}:apply`])));
    assert.equal(failure.error.code, "semantic_write_failed");
    assert.equal(writeCount(workspace.task), 2);
    const afterFailure = receiptRows(workspace.task);
    assert.equal(afterFailure.some((row) => row.feedback_id === "f3"), false);
    assert.equal(afterFailure.some((row) => row.feedback_id === "f4"), false);
  } finally {
    await rm(workspace.task, { recursive: true, force: true });
  }
});

void test("acceptance refuses stale context, drifted dependencies, and missing effect references", async () => {
  const workspace = await createWorkspace();
  try {
    const projection = project(workspace);
    const snapshot = snapshotFrom(projection, "snap_guard");
    const snapshotFile = path.join(workspace.task, "snapshot.json");
    const trustedFile = path.join(workspace.task, "trusted.json");
    const resultFile = path.join(workspace.task, "result.json");
    await writeJson(snapshotFile, snapshot);
    await writeJson(trustedFile, snapshot);
    const callback = await writeCallback(workspace.task);
    const feedback = emptyFeedback();
    feedback.dispositions.push(disposition("f1", "strategy:A2", "comment:A2", "Accept"));
    await writeJson(resultFile, resultFor(snapshot, feedback, { resultId: "res_1", draftId: "draft_1" }));
    const files = { result: resultFile, snapshot: snapshotFile, trusted: trustedFile };

    const otherContext = { ...workspace.context, selector: "node:run_1/node_other@round_1" };
    const otherContextFile = path.join(workspace.task, "other-context.json");
    await writeJson(otherContextFile, otherContext);
    const args = await acceptArgs(workspace, files, ["f1"], ["--write", `${callback}:apply`]);
    const stale = parseError(tool(args.map((value) => value === workspace.contextPath ? otherContextFile : value)));
    assert.equal(stale.error.code, "context_mismatch");
    assert.equal(writeCount(workspace.task), 0);

    assert.equal(parseError(tool(await acceptArgs(workspace, files, ["f1"]))).error.code, "semantic_write_required");

    const tampered = { ...snapshot, snapshot_id: "snap_other" };
    await writeJson(snapshotFile, tampered);
    await writeJson(resultFile, resultFor(tampered, feedback, { resultId: "res_2", draftId: "draft_1" }));
    assert.equal(parseError(tool(await acceptArgs(workspace, files, ["f1"], ["--write", `${callback}:apply`]))).error.code, "untrusted_snapshot");
    await writeJson(snapshotFile, snapshot);
    await writeJson(resultFile, resultFor(snapshot, feedback, { resultId: "res_3", draftId: "draft_1" }));

    const drift = python(["-", workspace.db], [
      "import sqlite3, sys",
      "connection = sqlite3.connect(sys.argv[1])",
      "connection.execute(\"INSERT INTO strategy_card_evidence_items VALUES ('A2',3,'New material','no','')\")",
      "connection.commit()",
    ].join("\n"));
    assert.equal(drift.status, 0, drift.stderr);
    const pending = parse<{ pending: Array<{ reason: string }> }>(tool(await acceptArgs(workspace, files, ["f1"], ["--write", `${callback}:apply`])));
    assert.deepEqual(pending.pending.map((entry) => entry.reason), ["baseline_drift"]);
    assert.equal(writeCount(workspace.task), 0);

    const silent = await createWorkspace();
    const silentCallback = path.join(silent.task, "silent_write.py");
    await writeFile(silentCallback, "def apply(connection, plan):\n    return None\n", "utf8");
    const silentProjection = project(silent);
    const silentSnapshot = snapshotFrom(silentProjection, "snap_silent");
    const silentFeedback = emptyFeedback();
    silentFeedback.dispositions.push(disposition("f1", "strategy:A2", "comment:A2", "Accept"));
    const silentFiles = { result: path.join(silent.task, "result.json"), snapshot: path.join(silent.task, "snapshot.json"), trusted: path.join(silent.task, "trusted.json") };
    await writeJson(silentFiles.snapshot, silentSnapshot);
    await writeJson(silentFiles.trusted, silentSnapshot);
    await writeJson(silentFiles.result, resultFor(silentSnapshot, silentFeedback, { resultId: "res_silent", draftId: "draft_1" }));
    const silentError = parseError(tool(await acceptArgs(silent, silentFiles, ["f1"], ["--write", `${silentCallback}:apply`])));
    assert.equal(silentError.error.code, "missing_semantic_ref");
    assert.equal(receiptRows(silent.task).length, 0);
    await rm(silent.task, { recursive: true, force: true });
  } finally {
    await rm(workspace.task, { recursive: true, force: true });
  }
});

void test("adjustments need an applied disposition and resolved receipts stay retired", async () => {
  const workspace = await createWorkspace();
  try {
    const projection = project(workspace);
    const snapshot = snapshotFrom(projection, "snap_carry");
    const snapshotFile = path.join(workspace.task, "snapshot.json");
    const trustedFile = path.join(workspace.task, "trusted.json");
    const resultFile = path.join(workspace.task, "result.json");
    await writeJson(snapshotFile, snapshot);
    await writeJson(trustedFile, snapshot);
    const callback = await writeCallback(workspace.task);
    const files = { result: resultFile, snapshot: snapshotFile, trusted: trustedFile };

    const requests = emptyFeedback();
    requests.dispositions.push({ feedback_id: "f1", scope_id: "strategy:A2", target_id: "comment:A2", note: "Evaluate before changing the plan", action: "defer" });
    requests.overall_note.push({ feedback_id: "f2", scope_id: "board", target_id: "scope:board", note: "Tighten the whole board" });
    await writeJson(resultFile, resultFor(snapshot, requests, { resultId: "res_1", draftId: "draft_1" }));

    assert.equal(parseError(tool(await acceptArgs(workspace, files, ["f1"]))).error.code, "semantic_write_required");
    assert.equal(receiptRows(workspace.task).length, 0);
    assert.equal(writeCount(workspace.task), 0);

    const applied = parse<{ applied: Array<{ feedback_id: string; semantic_ref: string }> }>(tool(await acceptArgs(workspace, files, ["f1"], ["--write", callback + ":apply"])));
    assert.deepEqual(applied.applied.map((entry) => entry.feedback_id), ["f1"]);
    assert.match(applied.applied[0]?.semantic_ref ?? "", /writes/);
    assert.equal(writeCount(workspace.task), 1);

    const edited = structuredClone(requests);
    (edited.dispositions[0] as Record<string, unknown>).note = "Evaluate the new evidence before changing the plan";
    await writeJson(resultFile, resultFor(snapshot, edited, { resultId: "res_2", draftId: "draft_1" }));
    const conflict = parse<{ conflicts: unknown[] }>(tool(await acceptArgs(workspace, files, ["f1"], ["--write", callback + ":apply"])));
    assert.equal(conflict.conflicts.length, 1);
    assert.equal(writeCount(workspace.task), 1);

    const mutate = python(["-", workspace.db], [
      "import sqlite3, sys",
      "connection = sqlite3.connect(sys.argv[1])",
      "connection.execute(\"INSERT INTO comment_blockers VALUES ('A1',1,'Waiting on the rerun table')\")",
      "connection.commit()",
    ].join("\n"));
    assert.equal(mutate.status, 0, mutate.stderr);
    await writeJson(resultFile, resultFor(snapshot, requests, { resultId: "res_3", draftId: "draft_1" }));
    const pending = parse<{ pending: Array<{ feedback_id: string; reason: string }> }>(tool(await acceptArgs(workspace, files, ["f2"], ["--write", callback + ":apply"])));
    assert.deepEqual(pending.pending.map((entry) => entry.feedback_id), ["f2"]);
    assert.equal(pending.pending[0]?.reason, "baseline_drift");

    const carried = project(workspace).pending_feedback;
    assert.deepEqual(carried.map((row) => row.feedback_id), ["f1", "f2"]);
    assert.equal(carried.find((row) => row.feedback_id === "f1")?.status, "conflict");
    assert.equal(carried.find((row) => row.feedback_id === "f2")?.status, "pending");

    const freshSnapshot = snapshotFrom(project(workspace), "snap_carry_b");
    await writeJson(snapshotFile, freshSnapshot);
    await writeJson(trustedFile, freshSnapshot);
    await writeJson(resultFile, resultFor(freshSnapshot, edited, { resultId: "res_3", draftId: "draft_1" }));
    const reconciled = parse<{ applied: Array<{ feedback_id: string }> }>(tool(await acceptArgs(workspace, files, ["f1"], ["--write", callback + ":apply", "--allow-update"])));
    assert.deepEqual(reconciled.applied.map((entry) => entry.feedback_id), ["f1"]);
    assert.deepEqual(project(workspace).pending_feedback.map((row) => row.feedback_id), ["f2"]);
  } finally {
    await rm(workspace.task, { recursive: true, force: true });
  }
});

void test("interrupted manuscript and log effects are rechecked instead of replayed", async () => {
  for (const boundary of ["log", "file"] as const) {
    const workspace = await createWorkspace();
    try {
      if (boundary === "file") {
        const priorRound = python(["-", workspace.db], [
          "import sqlite3, sys",
          "connection = sqlite3.connect(sys.argv[1])",
          "connection.execute(\"INSERT INTO revision_action_logs (log_id, log_order, status, operator_role, summary, change_note, response_note, created_at) VALUES ('LOG_PRIOR', 1, 'completed', 'agent', 'Prior round revision', 'change', 'response', '2026-09-29T00:00:00Z')\")",
          "connection.execute(\"INSERT INTO revision_action_log_entries (log_id, entry_order, target_file, target_locator, change_type, change_summary, rationale, evidence_source, expected_response_use) VALUES ('LOG_PRIOR', 1, 'manuscript.md', 'Methods', 'revised', 'Adjusted wording', 'Reviewer request', 'analysis', 'response')\")",
          "connection.commit()",
        ].join("\n"));
        assert.equal(priorRound.status, 0, priorRound.stderr);
      }
      const snapshot = snapshotFrom(project(workspace), "snap_interrupt");
      const snapshotFile = path.join(workspace.task, "snapshot.json");
      const trustedFile = path.join(workspace.task, "trusted.json");
      const resultFile = path.join(workspace.task, "result.json");
      await writeJson(snapshotFile, snapshot);
      await writeJson(trustedFile, snapshot);
      const interruptedId = "i1";
      const feedback = emptyFeedback();
      feedback.annotations.push({ feedback_id: interruptedId, scope_id: "round", target_id: "thread:R1", note: "Interrupted revision note", anchor: null });
      await writeJson(resultFile, resultFor(snapshot, feedback, { resultId: "res_interrupt", draftId: "draft_interrupt" }));

      // The physical effect lands with no receipt, exactly as an interrupted callback leaves it.
      if (boundary === "log") {
        const orphaned = python(["-", workspace.db], [
          "import sqlite3, sys",
          "connection = sqlite3.connect(sys.argv[1])",
          "connection.execute(\"INSERT INTO revision_action_logs (log_id, log_order, status, operator_role, summary, change_note, response_note, created_at) VALUES ('LOG_INTERRUPTED', 1, 'completed', 'agent', 'Interrupted revision note', 'change', 'response', '2026-09-30T00:00:00Z')\")",
          "connection.execute(\"INSERT INTO revision_action_log_thread_links (log_id, thread_id) VALUES ('LOG_INTERRUPTED', 'R1')\")",
          "connection.commit()",
        ].join("\n"));
        assert.equal(orphaned.status, 0, orphaned.stderr);
      } else {
        await writeFile(path.join(workspace.task, "manuscript.md"), MANUSCRIPT_TEXT + "\nInterrupted edit.\n", "utf8");
      }
      const logsAfterInterruption = logSummaries(workspace.task);
      assert.deepEqual(receiptRows(workspace.task), [], boundary + ": no receipt exists while the effect is already on disk");

      const report = parse<{ scopes: Array<{ scope_id: string; status: string; files: { changed: string[] } }> }>(tool(["check", "--db", workspace.db, "--project-root", workspace.task, "--snapshot", snapshotFile, "--context", workspace.contextPath]));
      const round = report.scopes.find((scope) => scope.scope_id === "round");
      assert.equal(round?.status, "changed", boundary + ": the frozen round scope must report drift");
      if (boundary === "file") assert.deepEqual(round?.files.changed, ["manuscript.md"]);

      const callback = await writeCallback(workspace.task);
      const files = { result: resultFile, snapshot: snapshotFile, trusted: trustedFile };
      const outcome = parse<{ applied: Array<{ feedback_id: string }>; pending: Array<{ feedback_id: string; reason: string }> }>(tool(await acceptArgs(workspace, files, [interruptedId], ["--write", callback + ":apply"])));
      assert.deepEqual(outcome.applied, [], boundary + ": a drifted scope is never applied");
      assert.deepEqual(outcome.pending.map((entry) => entry.feedback_id), [interruptedId]);
      assert.equal(outcome.pending[0]?.reason, "baseline_drift");

      // The Agent-owned effect is neither replayed nor reverted, and no successful receipt is recorded.
      assert.equal(writeCount(workspace.task), 0, boundary + ": the write callback must not run");
      assert.deepEqual(logSummaries(workspace.task), logsAfterInterruption, boundary + ": the existing revision log is preserved");
      if (boundary === "file") assert.equal(await readFile(path.join(workspace.task, "manuscript.md"), "utf8"), MANUSCRIPT_TEXT + "\nInterrupted edit.\n");
      assert.deepEqual(receiptRows(workspace.task).filter((row) => row.feedback_id === interruptedId).map((row) => row.status), ["pending"]);

      // A new frozen snapshot keeps the unresolved item traceable; the old result never transfers to it.
      const fresh = snapshotFrom(project(workspace), "snap_interrupt_fresh");
      const carried = (fresh.pending_feedback as Array<Record<string, unknown>>).find((row) => row.feedback_id === interruptedId);
      assert.equal(carried?.status, "pending", boundary + ": a new delivery still carries the unresolved item");
      assert.equal(carried?.scope_id, "round");
      const freshSnapshotFile = path.join(workspace.task, "snapshot-fresh.json");
      const freshTrustedFile = path.join(workspace.task, "trusted-fresh.json");
      await writeJson(freshSnapshotFile, fresh);
      await writeJson(freshTrustedFile, fresh);
      const transferred = parseError(tool(await acceptArgs(workspace, { result: resultFile, snapshot: freshSnapshotFile, trusted: freshTrustedFile }, [interruptedId], ["--write", callback + ":apply"])));
      assert.equal(transferred.error.code, "untrusted_result", boundary + ": an old result never transfers by feedback id alone");
      assert.equal(writeCount(workspace.task), 0);
    } finally {
      await rm(workspace.task, { recursive: true, force: true });
    }
  }
});

void test("strategy scope follows the explicit comment dependency closure", async () => {
  const workspace = await createWorkspace();
  try {
    const projection = project(workspace);
    const dependent = projection.scopes.find((scope) => scope.scope_id === "strategy:A3");
    const stateIds = (dependent?.baseline.tables.atomic_comment_state ?? []).map((row) => row.comment_id).sort();
    assert.deepEqual(stateIds, ["A1", "A3"]);
    assert.ok((dependent?.baseline.tables.atomic_comment_target_locations ?? []).some((row) => row.comment_id === "A1"));
    assert.ok(!(dependent?.baseline.tables.atomic_comment_state ?? []).some((row) => row.comment_id === "A2"));

    const snapshotFile = path.join(workspace.task, "snapshot.json");
    await writeJson(snapshotFile, snapshotFrom(projection, "snap_closure"));
    const mutate = python(["-", workspace.db], [
      "import sqlite3, sys",
      "connection = sqlite3.connect(sys.argv[1])",
      "connection.execute(\"UPDATE atomic_comment_state SET next_action = 'Redefined exposure handling' WHERE comment_id = 'A1'\")",
      "connection.commit()",
    ].join("\n"));
    assert.equal(mutate.status, 0, mutate.stderr);
    const report = parse<{ scopes: Array<{ scope_id: string; status: string }> }>(tool(["check", "--db", workspace.db, "--project-root", workspace.task, "--snapshot", snapshotFile, "--context", workspace.contextPath]));
    const status = (id: string) => report.scopes.find((scope) => scope.scope_id === id)?.status;
    assert.equal(status("strategy:A3"), "changed");
    assert.equal(status("strategy:A1"), "changed");
    assert.equal(status("strategy:A2"), "unchanged");
  } finally {
    await rm(workspace.task, { recursive: true, force: true });
  }
});

void test("annotation anchors are validated with JavaScript UTF-16 offsets", async () => {
  const workspace = await createWorkspace();
  try {
    const projection = project(workspace);
    assert.ok(Array.isArray(projection.unresolved));
    const text = "The \u{1F600} effect was associated with sleep quality.";
    const quote = "effect was associated";
    const start = text.indexOf(quote);
    const end = start + quote.length;
    const codepointStart = Array.from(text.slice(0, start)).length;
    assert.equal(start, 7);
    assert.equal(codepointStart, 6);

    const snapshot = snapshotFrom(projection, "snap_anchor");
    snapshot.documents = [{
      document_id: "doc_review",
      title: "Annotated review",
      source_path: "review-comments.md",
      role: "review",
      original_text: text,
      blocks: [{ id: "b1", kind: "paragraph", text, runs: [], level: null, source_path: "review-comments.md", resource_id: null, note: null }],
    }];
    const snapshotFile = path.join(workspace.task, "snapshot.json");
    const trustedFile = path.join(workspace.task, "trusted.json");
    const resultFile = path.join(workspace.task, "result.json");
    await writeJson(snapshotFile, snapshot);
    await writeJson(trustedFile, snapshot);
    const callback = await writeCallback(workspace.task);
    const files = { result: resultFile, snapshot: snapshotFile, trusted: trustedFile };

    const anchored = emptyFeedback();
    anchored.annotations.push({
      feedback_id: "a1", scope_id: "board", target_id: "comment:A1", note: "Check this wording",
      anchor: { kind: "text", snapshot_id: "snap_anchor", block_id: "b1", start, end, exact_quote: quote, prefix: text.slice(0, start), suffix: text.slice(end) },
    });
    await writeJson(resultFile, resultFor(snapshot, anchored, { resultId: "res_anchor", draftId: "draft_1" }));
    const accepted = parse<{ applied: Array<{ feedback_id: string }> }>(tool(await acceptArgs(workspace, files, ["a1"], ["--write", callback + ":apply"])));
    assert.deepEqual(accepted.applied.map((entry) => entry.feedback_id), ["a1"]);
    assert.equal(writeCount(workspace.task), 1);

    const miscounted = emptyFeedback();
    miscounted.annotations.push({
      feedback_id: "a2", scope_id: "board", target_id: "comment:A1", note: "Wrong offsets",
      anchor: { kind: "text", snapshot_id: "snap_anchor", block_id: "b1", start: start - 1, end: end - 1, exact_quote: quote, prefix: text.slice(0, start - 1), suffix: text.slice(end - 1) },
    });
    await writeJson(resultFile, resultFor(snapshot, miscounted, { resultId: "res_anchor_2", draftId: "draft_1" }));
    const rejected = parseError(tool(await acceptArgs(workspace, files, ["a2"], ["--write", callback + ":apply"])));
    assert.equal(rejected.error.code, "invalid_anchor");
    assert.equal(writeCount(workspace.task), 1);

    const whole = emptyFeedback();
    whole.annotations.push({
      feedback_id: "a3", scope_id: "board", target_id: "comment:A1", note: "Whole block",
      anchor: { kind: "whole", snapshot_id: "snap_anchor", block_id: "b1", exact_quote: text, prefix: "", suffix: "", resource_id: null },
    });
    await writeJson(resultFile, resultFor(snapshot, whole, { resultId: "res_anchor_3", draftId: "draft_1" }));
    const wholeAccepted = parse<{ applied: Array<{ feedback_id: string }> }>(tool(await acceptArgs(workspace, files, ["a3"], ["--write", callback + ":apply"])));
    assert.deepEqual(wholeAccepted.applied.map((entry) => entry.feedback_id), ["a3"]);
  } finally {
    await rm(workspace.task, { recursive: true, force: true });
  }
});

function packageWriteModule(scripts: string, roundScripts: string): string {
  return [
    "import sys",
    "",
    `sys.path.insert(0, ${JSON.stringify(scripts)})`,
    `sys.path.insert(1, ${JSON.stringify(roundScripts)})`,
    "",
    "import workspace_db",
    "import capture_revision_action",
    "",
    "",
    "def apply(connection, plan):",
    "    touched = []",
    "    for entry in plan['feedback']:",
    "        if entry.get('category') != 'dispositions':",
    "            continue",
    "        comment_id = entry['target_id'].split(':', 1)[1]",
    "        note = entry.get('note', '')",
    "        connection.execute('UPDATE atomic_comment_state SET next_action = ? WHERE comment_id = ?', (note, comment_id))",
    "        connection.execute(",
    "            'INSERT INTO strategy_card_pending_confirmations (comment_id, confirmation_order, message)'",
    "            ' VALUES (?, (SELECT COALESCE(MAX(confirmation_order), 0) + 1 FROM strategy_card_pending_confirmations WHERE comment_id = ?), ?)',",
    "            (comment_id, comment_id, note),",
    "        )",
    "        connection.execute(",
    "            'INSERT INTO comment_completion_status (comment_id, manuscript_execution_items_done, response_draft_done, evidence_gap_closed, user_strategy_confirmed, one_to_one_link_checked, export_ready)'",
    "            \" VALUES (?, 'no', 'no', 'no', 'no', 'no', 'no')\"",
    "            \" ON CONFLICT(comment_id) DO UPDATE SET user_strategy_confirmed = 'no'\",",
    "            (comment_id,),",
    "        )",
    "        touched.append(comment_id)",
    "    for entry in plan['feedback']:",
    "        if entry.get('category') != 'annotations':",
    "            continue",
    "        thread_id = entry['target_id'].split(':', 1)[1]",
    "        note = entry.get('note', '') or 'revision note'",
    "        payload = {",
    "            'summary': note,",
    "            'status': 'completed',",
    "            'operator_role': 'agent',",
    "            'thread_ids': [thread_id],",
    "            'entries': [{",
    "                'target_file': 'manuscript.md',",
    "                'target_locator': entry.get('target_id', ''),",
    "                'change_type': 'revised',",
    "                'change_summary': note,",
    "            }],",
    "        }",
    "        log_id = capture_revision_action.insert_revision_log(connection, payload)",
    "        order = connection.execute('SELECT COALESCE(MAX(link_order), 0) + 1 FROM response_thread_action_log_links WHERE thread_id = ?', (thread_id,)).fetchone()[0]",
    "        connection.execute('INSERT INTO revision_action_log_thread_links (log_id, thread_id) VALUES (?, ?)', (log_id, thread_id))",
    "        connection.execute('INSERT INTO response_thread_action_log_links (thread_id, log_id, link_order) VALUES (?, ?, ?)', (thread_id, log_id, int(order)))",
    "        connection.execute(",
    "            'INSERT INTO revision_action_log_entries (log_id, entry_order, target_file, target_locator, change_type, change_summary, rationale, evidence_source, expected_response_use)'",
    "            ' VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?)',",
    "            (log_id, 'manuscript.md', entry.get('target_id', ''), 'revised', note, '', '', ''),",
    "        )",
    "        touched.append(log_id)",
    "        if plan['result'].get('draft_id', '').startswith('fail'):",
    "            raise RuntimeError('injected round log failure')",
    "    return {'module': str(workspace_db.__file__), 'capture': str(capture_revision_action.__file__), 'touched': touched}",
  ].join("\n");
}

void test("package semantic writes commit with the receipt and gate-and-render reflects them", async () => {
  const packages = await mkdtemp(path.join(tmpdir(), "revision-master-package-"));
  try {
    const source = REVISION_MASTER_AUTHORING_SOURCES.find((item) => item.capability_id === "design-review-response-intake");
    assert.ok(source);
    const authored = await authorCapabilityPackage(packages, source, REVISION_MASTER_AUTHORING_OPTIONS);
    const scripts = path.join(authored.packageRoot, "scripts");
    assert.ok(existsSync(path.join(scripts, "workspace_db.py")));
    assert.ok(existsSync(path.join(scripts, "gate_and_render_workspace.py")));
    const registry = await loadCapabilityRegistry();
    const roundPackage = registry.capabilities.get("generation-review-response-round");
    assert.ok(roundPackage);
    const roundScripts = path.join(roundPackage.packageRoot, "scripts");
    assert.ok(existsSync(path.join(roundScripts, "capture_revision_action.py")));

    const workspace = await createWorkspace({ packageScripts: scripts });
    try {
      const projection = project(workspace);
      const snapshot = snapshotFrom(projection, "snap_integration");
      const snapshotFile = path.join(workspace.task, "snapshot.json");
      const trustedFile = path.join(workspace.task, "trusted.json");
      const resultFile = path.join(workspace.task, "result.json");
      await writeJson(snapshotFile, snapshot);
      await writeJson(trustedFile, snapshot);
      const callback = path.join(workspace.task, "package_write.py");
      await writeFile(callback, packageWriteModule(scripts, roundScripts), "utf8");

      const feedback = emptyFeedback();
      feedback.dispositions.push(disposition("f1", "strategy:A2", "comment:A2", "Redefine the exposure handling"));
      feedback.dispositions.push(disposition("f2", "board", "comment:A1", "Board level follow up"));
      await writeJson(resultFile, resultFor(snapshot, feedback, { resultId: "res_integration", draftId: "draft_1" }));

      const outcome = parse<{ applied: Array<{ feedback_id: string; semantic_ref: string }>; pending: Array<{ feedback_id: string; reason: string }> }>(tool(await acceptArgs(workspace, { result: resultFile, snapshot: snapshotFile, trusted: trustedFile }, ["f1", "f2"], ["--write", callback + ":apply"])));
      assert.deepEqual(outcome.applied.map((entry) => entry.feedback_id), ["f1"]);
      assert.deepEqual(outcome.pending.map((entry) => entry.feedback_id), ["f2"]);
      assert.equal(outcome.pending[0]?.reason, "baseline_drift");
      assert.match(outcome.applied[0]?.semantic_ref ?? "", /workspace_db\.py/);

      const rows = receiptRows(workspace.task);
      assert.equal(rows.find((row) => row.feedback_id === "f1")?.status, "applied");
      assert.equal(rows.find((row) => row.feedback_id === "f2")?.status, "pending");

      const state = python(["-", workspace.db], [
        "import json, sqlite3, sys",
        "connection = sqlite3.connect(sys.argv[1])",
        "print(json.dumps({row[0]: row[1] for row in connection.execute('SELECT comment_id, next_action FROM atomic_comment_state')}))",
      ].join("\n"));
      assert.equal(state.status, 0, state.stderr);
      const nextActions = JSON.parse(state.stdout) as Record<string, string>;
      assert.equal(nextActions.A2, "Redefine the exposure handling");
      assert.equal(nextActions.A1, "confirm strategy");

      const completion = python(["-", workspace.db], [
        "import sqlite3, sys",
        "connection = sqlite3.connect(sys.argv[1])",
        "print(connection.execute(\"SELECT user_strategy_confirmed FROM comment_completion_status WHERE comment_id = 'A2'\").fetchone()[0])",
      ].join("\n"));
      assert.equal(completion.stdout.trim(), "no");
      const untouched = python(["-", workspace.db], [
        "import sqlite3, sys",
        "connection = sqlite3.connect(sys.argv[1])",
        "print(connection.execute(\"SELECT COUNT(*) FROM comment_completion_status WHERE comment_id = 'A1'\").fetchone()[0])",
      ].join("\n"));
      assert.equal(untouched.stdout.trim(), "0");
      const manuscriptBefore = await readFile(path.join(workspace.task, "manuscript.md"));
      const roundNote = "Log the revised buffer wording";
      const roundProjection = project(workspace);
      const roundSnapshotFile = path.join(workspace.task, "round-snapshot.json");
      const roundTrustedFile = path.join(workspace.task, "round-trusted.json");
      const roundResultFile = path.join(workspace.task, "round-result.json");
      const roundFiles = { result: roundResultFile, snapshot: roundSnapshotFile, trusted: roundTrustedFile };
      const roundFeedback = emptyFeedback();
      roundFeedback.annotations.push({ feedback_id: "a1", scope_id: "round", target_id: "thread:R1", note: roundNote, anchor: null });
      await writeJson(roundSnapshotFile, snapshotFrom(roundProjection, "snap_round_a"));
      await writeJson(roundTrustedFile, snapshotFrom(roundProjection, "snap_round_a"));
      await writeJson(roundResultFile, resultFor(snapshotFrom(roundProjection, "snap_round_a"), roundFeedback, { resultId: "res_round", draftId: "draft_1" }));
      const logged = parse<{ applied: Array<{ feedback_id: string; semantic_ref: string }> }>(tool(await acceptArgs(workspace, roundFiles, ["a1"], ["--write", callback + ":apply"])));
      assert.deepEqual(logged.applied.map((entry) => entry.feedback_id), ["a1"]);
      assert.match(logged.applied[0]?.semantic_ref ?? "", /capture_revision_action\.py/);

      const logQuery = (statement: string) => python(["-", workspace.db], [
        "import json, sqlite3, sys",
        "connection = sqlite3.connect(sys.argv[1])",
        `print(json.dumps(${statement}))`,
      ].join("\n"));
      const logRows = JSON.parse(logQuery("list(connection.execute('SELECT log_id, summary FROM revision_action_logs ORDER BY log_order'))").stdout) as Array<[string, string]>;
      assert.equal(logRows.length, 1);
      assert.equal(logRows[0]?.[1], roundNote);
      const logLinks = JSON.parse(logQuery("list(connection.execute('SELECT log_id, thread_id FROM revision_action_log_thread_links'))").stdout) as Array<[string, string]>;
      assert.deepEqual(logLinks, [[logRows[0]?.[0], "R1"]]);
      const logEntries = JSON.parse(logQuery("connection.execute('SELECT COUNT(*) FROM revision_action_log_entries').fetchone()[0]").stdout) as number;
      assert.equal(logEntries, 1);
      assert.deepEqual(await readFile(path.join(workspace.task, "manuscript.md")), manuscriptBefore);

      const roundSnapshotB = snapshotFrom(project(workspace), "snap_round_b");
      const failingRound = emptyFeedback();
      failingRound.annotations.push({ feedback_id: "a2", scope_id: "round", target_id: "thread:R2", note: "Failing log", anchor: null });
      await writeJson(roundSnapshotFile, roundSnapshotB);
      await writeJson(roundTrustedFile, roundSnapshotB);
      await writeJson(roundResultFile, resultFor(roundSnapshotB, failingRound, { resultId: "res_round_fail", draftId: "fail-round" }));
      const failedRound = parseError(tool(await acceptArgs(workspace, roundFiles, ["a2"], ["--write", callback + ":apply"])));
      assert.equal(failedRound.error.code, "semantic_write_failed");
      assert.equal(receiptRows(workspace.task).some((row) => row.feedback_id === "a2"), false);
      assert.equal(JSON.parse(logQuery("connection.execute('SELECT COUNT(*) FROM revision_action_logs').fetchone()[0]").stdout) as number, 1);

      await writeJson(roundResultFile, resultFor(roundSnapshotB, failingRound, { resultId: "res_round_retry", draftId: "draft_2" }));
      const retried = parse<{ applied: Array<{ feedback_id: string }> }>(tool(await acceptArgs(workspace, roundFiles, ["a2"], ["--write", callback + ":apply"])));
      assert.deepEqual(retried.applied.map((entry) => entry.feedback_id), ["a2"]);
      assert.equal(JSON.parse(logQuery("connection.execute('SELECT COUNT(*) FROM revision_action_logs').fetchone()[0]").stdout) as number, 2);
      assert.deepEqual(await readFile(path.join(workspace.task, "manuscript.md")), manuscriptBefore);

      const render = python([path.join(scripts, "gate_and_render_workspace.py"), "--artifact-root", workspace.task]);
      assert.equal(render.status, 0, render.stderr || render.stdout);
      const rendered = JSON.parse(render.stdout) as { status: string };
      assert.ok(["ok", "issues_found"].includes(rendered.status));
      const workboard = await readFile(path.join(workspace.task, "08-atomic-comment-workboard.md"), "utf8");
      assert.ok(workboard.includes("Redefine the exposure handling"));
      const logView = await readFile(path.join(workspace.task, "13-revision-action-log.md"), "utf8");
      assert.ok(logView.includes(roundNote));
    } finally {
      await rm(workspace.task, { recursive: true, force: true });
    }
  } finally {
    await rm(packages, { recursive: true, force: true });
  }
});

void test("direct acceptance rejects malformed results without a TypeScript pre-check", async () => {
  const workspace = await createWorkspace();
  try {
    const projection = project(workspace);
    const snapshot = snapshotFrom(projection, "snap_trust");
    const snapshotFile = path.join(workspace.task, "snapshot.json");
    const trustedFile = path.join(workspace.task, "trusted.json");
    const resultFile = path.join(workspace.task, "result.json");
    await writeJson(snapshotFile, snapshot);
    await writeJson(trustedFile, snapshot);
    const callback = await writeCallback(workspace.task);
    const files = { result: resultFile, snapshot: snapshotFile, trusted: trustedFile };
    const included = () => {
      const feedback = emptyFeedback();
      feedback.dispositions.push({ feedback_id: "f1", scope_id: "strategy:A2", target_id: "comment:A2", note: "", action: "include" });
      return feedback;
    };
    const scenarios: Array<{ name: string; code: string; feedback: () => ReturnType<typeof emptyFeedback>; overrides?: Record<string, unknown> }> = [
      {
        name: "illegal disposition action",
        code: "invalid_result",
        feedback: () => { const f = included(); (f.dispositions[0] as Record<string, unknown>).action = "approve"; return f; },
      },
      {
        name: "empty feedback id",
        code: "invalid_result",
        feedback: () => { const f = included(); (f.dispositions[0] as Record<string, unknown>).feedback_id = "  "; return f; },
      },
      {
        name: "duplicate feedback id",
        code: "invalid_result",
        feedback: () => { const f = included(); f.seen.push({ feedback_id: "f1", scope_id: "round", target_id: "thread:R1", note: "" }); return f; },
      },
      {
        name: "round confirmation",
        code: "invalid_result",
        feedback: () => { const f = emptyFeedback(); f.confirmations.push({ feedback_id: "c1", scope_id: "round", target_id: "scope:round", note: "", kind: "round", members: [] }); return f; },
      },
      {
        name: "empty annotation",
        code: "invalid_result",
        feedback: () => { const f = emptyFeedback(); f.annotations.push({ feedback_id: "a1", scope_id: "board", target_id: "comment:A1", note: "   ", anchor: null }); return f; },
      },
      {
        name: "unknown anchor kind",
        code: "invalid_anchor",
        feedback: () => {
          const f = emptyFeedback();
          f.annotations.push({ feedback_id: "a1", scope_id: "board", target_id: "comment:A1", note: "x", anchor: { kind: "region", snapshot_id: "snap_trust", block_id: "b1", start: 1, end: 2, exact_quote: "x", prefix: "", suffix: "" } });
          return f;
        },
      },
      {
        name: "empty text selection",
        code: "invalid_anchor",
        feedback: () => {
          const f = emptyFeedback();
          f.annotations.push({ feedback_id: "a1", scope_id: "board", target_id: "comment:A1", note: "x", anchor: { kind: "text", snapshot_id: "snap_trust", block_id: "b1", start: 4, end: 4, exact_quote: "", prefix: "", suffix: "" } });
          return f;
        },
      },
      { name: "invalid export revision", code: "invalid_result", feedback: included, overrides: { export_revision: 0 } },
      { name: "invalid exported_at", code: "invalid_result", feedback: included, overrides: { exported_at: "" } },
    ];
    for (const scenario of scenarios) {
      await writeJson(resultFile, { ...resultFor(snapshot, scenario.feedback(), { resultId: "res_trust", draftId: "draft_1" }), ...scenario.overrides });
      const error = parseError(tool(await acceptArgs(workspace, files, ["f1"], ["--write", callback + ":apply"])));
      assert.equal(error.error.code, scenario.code, scenario.name);
    }
    assert.equal(receiptRows(workspace.task).length, 0);
    assert.equal(writeCount(workspace.task), 0);
  } finally {
    await rm(workspace.task, { recursive: true, force: true });
  }
});

void test("unresolved feedback blocks only the cards its target touches", async () => {
  const workspace = await createWorkspace();
  try {
    const projection = project(workspace);
    const snapshot = snapshotFrom({ ...projection, context: { ...projection.context, active_comment_id: "A1" } }, "snap_scope_targets");
    const snapshotFile = path.join(workspace.task, "snapshot.json");
    const trustedFile = path.join(workspace.task, "trusted.json");
    const resultFile = path.join(workspace.task, "result.json");
    await writeJson(snapshotFile, snapshot);
    await writeJson(trustedFile, snapshot);
    const callback = await writeCallback(workspace.task);
    const files = { result: resultFile, snapshot: snapshotFile, trusted: trustedFile };
    const confirmation = () => ({ feedback_id: "c1", scope_id: "strategy:A1", target_id: "scope:strategy:A1", note: "", kind: "strategy", members: ["comment:A1"] });

    const independent = emptyFeedback();
    independent.annotations.push({ feedback_id: "n1", scope_id: "board", target_id: "comment:A2", note: "Tighten the A-02 evidence", anchor: null });
    independent.confirmations.push(confirmation());
    await writeJson(resultFile, resultFor(snapshot, independent, { resultId: "res_independent", draftId: "draft_1" }));
    const accepted = parse<{ applied: Array<{ feedback_id: string }> }>(tool(await acceptArgs(workspace, files, ["n1", "c1"], ["--write", callback + ":apply"])));
    assert.deepEqual(accepted.applied.map((entry) => entry.feedback_id), ["n1", "c1"]);

    const sharedThread = emptyFeedback();
    sharedThread.annotations.push({ feedback_id: "n2", scope_id: "round", target_id: "thread:R1", note: "Shared thread note", anchor: null });
    sharedThread.confirmations.push({ feedback_id: "c2", scope_id: "strategy:A1", target_id: "scope:strategy:A1", note: "", kind: "strategy", members: ["comment:A1"] });
    await writeJson(resultFile, resultFor(snapshot, sharedThread, { resultId: "res_shared", draftId: "draft_1" }));
    const blocked = parseError(tool(await acceptArgs(workspace, files, ["n2", "c2"], ["--write", callback + ":apply"])));
    assert.equal(blocked.error.code, "invalid_target");

    const otherThread = emptyFeedback();
    otherThread.annotations.push({ feedback_id: "n3", scope_id: "round", target_id: "thread:R2", note: "Only R2", anchor: null });
    otherThread.confirmations.push({ feedback_id: "c3", scope_id: "strategy:A1", target_id: "scope:strategy:A1", note: "", kind: "strategy", members: ["comment:A1"] });
    await writeJson(resultFile, resultFor(snapshot, otherThread, { resultId: "res_other", draftId: "draft_1" }));
    const threadAccepted = parse<{ applied: Array<{ feedback_id: string }> }>(tool(await acceptArgs(workspace, files, ["n3", "c3"], ["--write", callback + ":apply"])));
    assert.deepEqual(threadAccepted.applied.map((entry) => entry.feedback_id), ["n3", "c3"]);
    assert.equal(writeCount(workspace.task), 4);

    const dependency = python(["-", workspace.db], [
      "import sqlite3, sys",
      "connection = sqlite3.connect(sys.argv[1])",
      "connection.execute(\"INSERT INTO atomic_comment_analysis_links VALUES ('A1',2,'Dependency claim','Existing evidence','Gap note','A2')\")",
      "connection.commit()",
    ].join("\n"));
    assert.equal(dependency.status, 0, dependency.stderr);
    const dependentProjection = project(workspace);
    const dependentContext = { ...dependentProjection.context, active_comment_id: "A1" };
    const a1Scope = dependentProjection.scopes.find((scope) => scope.scope_id === "strategy:A1");
    assert.ok((a1Scope?.baseline.tables.atomic_comments ?? []).some((row) => row.comment_id === "A2"));
    const dependentSnapshot = snapshotFrom({ ...dependentProjection, context: dependentContext }, "snap_scope_dependency");
    await writeJson(snapshotFile, dependentSnapshot);
    await writeJson(trustedFile, dependentSnapshot);

    const viaDependency = emptyFeedback();
    viaDependency.annotations.push({ feedback_id: "n4", scope_id: "board", target_id: "comment:A2", note: "A-02 blocks the A-01 strategy", anchor: null });
    viaDependency.confirmations.push({ feedback_id: "c4", scope_id: "strategy:A1", target_id: "scope:strategy:A1", note: "", kind: "strategy", members: ["comment:A1"] });
    await writeJson(resultFile, resultFor(dependentSnapshot, viaDependency, { resultId: "res_dependency", draftId: "draft_1" }));
    const dependencyBlocked = parseError(tool(await acceptArgs(workspace, files, ["n4", "c4"], ["--write", callback + ":apply"])));
    assert.equal(dependencyBlocked.error.code, "invalid_target");

    const downstream = emptyFeedback();
    downstream.annotations.push({ feedback_id: "n5", scope_id: "board", target_id: "comment:A3", note: "A-03 is downstream", anchor: null });
    downstream.confirmations.push({ feedback_id: "c5", scope_id: "strategy:A1", target_id: "scope:strategy:A1", note: "", kind: "strategy", members: ["comment:A1"] });
    await writeJson(resultFile, resultFor(dependentSnapshot, downstream, { resultId: "res_downstream", draftId: "draft_1" }));
    const downstreamAccepted = parse<{ applied: Array<{ feedback_id: string }> }>(tool(await acceptArgs(workspace, files, ["n5", "c5"], ["--write", callback + ":apply"])));
    assert.deepEqual(downstreamAccepted.applied.map((entry) => entry.feedback_id), ["n5", "c5"]);
    assert.equal(writeCount(workspace.task), 6);
  } finally {
    await rm(workspace.task, { recursive: true, force: true });
  }
});
