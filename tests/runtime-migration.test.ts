import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import {
  executeRuntimeMigration,
  planRuntimeMigration,
  RuntimeMigrationError,
} from "../src/core/runtime/runtime-migration.js";
import { loadWorkspaceSnapshot } from "../src/core/workspace/snapshot.js";
import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";
import { initialize, startSubflow, status, submitWork } from "./helpers/arsu-journey.js";

interface MigrationPlanView {
  migration_id: string;
  executable: boolean;
  plan_sha256: string;
  source_schema_version: "0.2";
  target_mode: "adaptive";
  backup_entries: Array<{ source_path: string; backup_path: string; sha256: string }>;
  target_entries: Array<{ path: string; sha256: string | null }>;
  compatibility_findings: Array<{ blocking: boolean }>;
  projected_obligations: unknown[];
  retained_strict_policies: string[];
}

void test("runtime migration dry run is deterministic and does not write authority", async () => {
  const root = await strictProject();
  const workspace = path.join(root, "researchspec");
  const statePath = path.join(workspace, "runs/current/state.yaml");
  const before = await readFile(statePath, "utf8");
  const first = migrationPreview(workspace);
  const second = migrationPreview(workspace);

  assert.equal(first.plan_sha256, second.plan_sha256);
  assert.equal(first.executable, true);
  assert.equal(first.source_schema_version, "0.2");
  assert.equal(first.target_mode, "adaptive");
  assert.deepEqual(first.compatibility_findings, []);
  assert.deepEqual(first.projected_obligations, []);
  assert.deepEqual(first.retained_strict_policies, []);
  assert.deepEqual(first.backup_entries.map((entry) => entry.source_path), [
    "config.yaml",
    "specs/workflow.yaml",
    "runs/current/state.yaml",
  ]);
  assert.equal(await readFile(statePath, "utf8"), before);
  await assert.rejects(() => readFile(path.join(workspace, first.backup_entries[0]?.backup_path ?? "")), hasCode("ENOENT"));
  await cleanup(root);
});

void test("runtime migration requires confirmation, migrates to adaptive, and rolls back to exact strict authority", async () => {
  const root = await strictProject();
  const workspace = path.join(root, "researchspec");
  const authorityPaths = ["config.yaml", "specs/workflow.yaml", "runs/current/state.yaml"] as const;
  const before = new Map(await Promise.all(authorityPaths.map(async (relativePath) => [
    relativePath,
    await readFile(path.join(workspace, relativePath), "utf8"),
  ] as const)));
  const plan = migrationPreview(workspace);

  const missingConfirmation = runCli([
    "update", workspace, "--migrate-runtime",
    "--expected-plan-sha256", plan.plan_sha256,
    "--json",
  ]);
  assert.equal(missingConfirmation.status, 2);
  assert.equal(parseEnvelope(missingConfirmation).error?.code, "migration_confirmation_required");

  const stale = runCli([
    "update", workspace, "--migrate-runtime", "--yes",
    "--expected-plan-sha256", "f".repeat(64),
    "--json",
  ]);
  assert.equal(stale.status, 3);
  assert.equal(parseEnvelope(stale).error?.code, "migration_plan_stale");

  const migrated = runCli([
    "update", workspace, "--migrate-runtime", "--yes",
    "--expected-plan-sha256", plan.plan_sha256,
    "--json",
  ]);
  assert.equal(migrated.status, 0, migrated.stderr || migrated.stdout);
  const migratedEnvelope = parseEnvelope<{
    identity: { migration_id: string; receipt_path: string; receipt_sha256: string };
  }>(migrated);
  const migrationId = migratedEnvelope.data?.identity.migration_id;
  assert.ok(migrationId);
  const adaptive = await loadWorkspaceSnapshot(workspace);
  assert.equal(adaptive.runtimeMode, "adaptive");
  assert.equal(adaptive.config.profile, "adaptive");
  assert.equal(adaptive.caseProfile?.mode, "adaptive");
  assert.equal(adaptive.caseState?.profile_mode, "adaptive");
  assert.equal(adaptive.diagnostics.some((item) => item.blocking), false);

  const rollbackPreview = runCli([
    "update", workspace, "--migrate-runtime", "--rollback", migrationId,
    "--dry-run", "--json",
  ]);
  assert.equal(rollbackPreview.status, 0, rollbackPreview.stderr || rollbackPreview.stdout);
  const rollbackPlan = parseEnvelope<{ plan: { plan_sha256: string; executable: boolean } }>(rollbackPreview).data?.plan;
  assert.equal(rollbackPlan?.executable, true);
  assert.ok(rollbackPlan?.plan_sha256);
  const rolledBack = runCli([
    "update", workspace, "--migrate-runtime", "--rollback", migrationId,
    "--yes", "--expected-plan-sha256", rollbackPlan?.plan_sha256 ?? "",
    "--json",
  ]);
  assert.equal(rolledBack.status, 0, rolledBack.stderr || rolledBack.stdout);
  const strict = await loadWorkspaceSnapshot(workspace);
  assert.equal(strict.runtimeMode, "strict");
  assert.equal(strict.diagnostics.some((item) => item.blocking), false);
  for (const relativePath of authorityPaths) {
    assert.equal(await readFile(path.join(workspace, relativePath), "utf8"), before.get(relativePath));
  }
  await cleanup(root);
});

void test("ordinary update preserves Schema 0.2 and migration precondition races write nothing", async () => {
  const root = await strictProject();
  const workspace = path.join(root, "researchspec");
  const ordinary = runCli(["update", workspace, "--tools", "forgecode", "--json"]);
  assert.equal(ordinary.status, 0, ordinary.stderr || ordinary.stdout);
  assert.equal((await loadWorkspaceSnapshot(workspace)).runtimeMode, "strict");

  const snapshot = await loadWorkspaceSnapshot(workspace);
  const prepared = await planRuntimeMigration(snapshot);
  const statePath = path.join(workspace, "runs/current/state.yaml");
  const raced = `${await readFile(statePath, "utf8")}\n`;
  await writeFile(statePath, raced, "utf8");
  await assert.rejects(
    () => executeRuntimeMigration(prepared),
    (error: unknown) => error instanceof RuntimeMigrationError && error.code === "migration_conflict",
  );
  assert.equal(await readFile(statePath, "utf8"), raced);
  await assert.rejects(() => readFile(path.join(workspace, "playbooks/arsu-adaptive.yaml")), hasCode("ENOENT"));
  await cleanup(root);
});

void test("runtime migration projects active strict obligations and only trusted accepted evidence", async () => {
  const root = await tempProject();
  const context = initialize(root);
  const startable = status(context).workflow_control.startable_subflows.find((selector) => selector.includes("deep-research"));
  assert.ok(startable);
  await startSubflow(context, startable);
  const ready = status(context).workflow_control.ready_items[0];
  assert.ok(ready);
  await submitWork(context, ready);
  const plan = migrationPreview(context.workspace);
  assert.ok(plan.projected_obligations.length > 0);
  const migrated = runCli([
    "update", context.workspace, "--migrate-runtime", "--yes",
    "--expected-plan-sha256", plan.plan_sha256,
    "--json",
  ]);
  assert.equal(migrated.status, 0, migrated.stderr || migrated.stdout);
  const adaptive = await loadWorkspaceSnapshot(context.workspace);
  assert.ok(adaptive.caseState?.obligations.some((item) => item.status === "satisfied"));
  assert.equal(adaptive.caseState?.accepted_evidence.length, 1);
  assert.equal(adaptive.attempts.length, 0);
  await cleanup(root);
});

void test("adaptive workspaces cannot be migrated again and rollback refuses target drift", async () => {
  const root = await strictProject();
  const workspace = path.join(root, "researchspec");
  const plan = migrationPreview(workspace);
  const migrated = runCli([
    "update", workspace, "--migrate-runtime", "--yes",
    "--expected-plan-sha256", plan.plan_sha256,
    "--json",
  ]);
  const migrationId = parseEnvelope<{ identity: { migration_id: string } }>(migrated).data?.identity.migration_id ?? "";

  const repeat = runCli(["update", workspace, "--migrate-runtime", "--dry-run", "--json"]);
  assert.equal(repeat.status, 1);
  assert.equal(parseEnvelope(repeat).error?.code, "migration_source_invalid");

  const statePath = path.join(workspace, "runs/current/state.yaml");
  await writeFile(statePath, `${await readFile(statePath, "utf8")}\n`, "utf8");
  const rollback = runCli([
    "update", workspace, "--migrate-runtime", "--rollback", migrationId,
    "--dry-run", "--json",
  ]);
  assert.equal(rollback.status, 0);
  assert.equal(parseEnvelope<{ plan: { executable: boolean } }>(rollback).data?.plan.executable, false);
  await cleanup(root);
});

async function strictProject(): Promise<string> {
  const root = await tempProject();
  const initialized = runCli(["init", root, "--tools", "forgecode", "--profile", "strict", "--json"]);
  assert.equal(initialized.status, 0, initialized.stderr || initialized.stdout);
  return root;
}

function migrationPreview(workspace: string): MigrationPlanView {
  const result = runCli(["update", workspace, "--migrate-runtime", "--dry-run", "--json"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const plan = parseEnvelope<{ plan: MigrationPlanView }>(result).data?.plan;
  assert.ok(plan);
  return plan;
}

function hasCode(code: string): (error: unknown) => boolean {
  return (error: unknown) => (error as NodeJS.ErrnoException).code === code;
}
