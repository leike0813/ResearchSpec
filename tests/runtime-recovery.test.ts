import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { parse, stringify } from "yaml";

import { DoctorRecoveryError, diagnoseRuntime, executeDoctorRepair, prepareDoctorRepair } from "../src/core/runtime/runtime-recovery.js";
import { buildSubflowInstructions, executeSubflowStart, planSubflowStart } from "../src/core/runtime/subflow-control.js";
import { getWorkspaceEntries } from "../src/core/workspace/layout.js";
import { loadWorkspaceSnapshot } from "../src/core/workspace/snapshot.js";
import { TEST_RUN_STATE, TEST_WORKFLOW } from "./helpers/test-workflow.js";

void test("Doctor observes healthy, invalid-YAML, and schema-invalid runtime state without rewriting it", async () => {
  const root = await createWorkspace();
  const workspace = path.join(root, "researchspec");
  const statePath = path.join(workspace, "runs/current/state.yaml");
  try {
    assert.equal((await diagnoseRuntime(workspace)).report.healthy, true);

    const invalidYaml = "schema_version: [\n";
    await writeFile(statePath, invalidYaml, "utf8");
    const syntaxDiagnosis = await diagnoseRuntime(workspace);
    assert.equal(syntaxDiagnosis.report.healthy, false);
    assert.ok(syntaxDiagnosis.report.findings.some((item) => item.code === "invalid_yaml" && item.disposition === "requires_human_reconstruction"));
    assert.equal(await readFile(statePath, "utf8"), invalidYaml);

    const invalidShape = stringify({ ...TEST_RUN_STATE, status: "invented" });
    await writeFile(statePath, invalidShape, "utf8");
    const shapeDiagnosis = await diagnoseRuntime(workspace);
    assert.ok(shapeDiagnosis.report.findings.some((item) => item.code === "authority_schema_invalid" && item.disposition === "requires_human_reconstruction"));
    assert.equal(await readFile(statePath, "utf8"), invalidShape);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("Doctor repairs only a uniquely determined receipt hash reference and preserves original bytes", async () => {
  const root = await createWorkspace();
  const workspace = path.join(root, "researchspec");
  const statePath = path.join(workspace, "runs/current/state.yaml");
  try {
    const started = await startTemplate(workspace);
    const current = parse(await readFile(statePath, "utf8")) as Record<string, unknown>;
    const subflows = current.subflows as Array<Record<string, unknown>>;
    const receipt = subflows[0]?.start_receipt as Record<string, unknown>;
    assert.ok(receipt);
    receipt.sha256 = "0".repeat(64);
    const damaged = stringify(current);
    await writeFile(statePath, damaged, "utf8");

    const diagnosis = await diagnoseRuntime(workspace);
    const repairable = diagnosis.report.findings.find((item) => item.disposition === "deterministically_repairable");
    assert.ok(repairable);
    assert.equal(repairable.scope, `authority:runs/current/state.yaml`);
    const prepared = await prepareDoctorRepair(workspace, repairable.finding_id);
    assert.equal(await readFile(statePath, "utf8"), damaged);
    assert.equal(prepared.plan.operations.at(-1)?.kind, "append_receipt");

    const result = await executeDoctorRepair(prepared, "2026-07-26T12:00:00.000Z");
    assert.equal(result.postCheckOk, true);
    assert.equal((await diagnoseRuntime(workspace)).report.healthy, true);
    const backupPath = prepared.plan.backup_paths[0];
    assert.ok(backupPath);
    assert.equal(Buffer.from(await readFile(path.join(workspace, backupPath))).toString("utf8"), damaged);
    assert.match(await readFile(path.join(workspace, result.receiptPath), "utf8"), new RegExp(repairable.finding_id));
    const repaired = parse(await readFile(statePath, "utf8")) as Record<string, unknown>;
    const repairedInstance = (repaired.subflows as Array<Record<string, unknown>>)[0];
    assert.equal(repairedInstance?.instance_id, started);
    assert.notEqual((repairedInstance?.start_receipt as Record<string, unknown>).sha256, "0".repeat(64));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("Doctor rejects a changed repair precondition before committing authority", async () => {
  const root = await createWorkspace();
  const workspace = path.join(root, "researchspec");
  const statePath = path.join(workspace, "runs/current/state.yaml");
  try {
    await startTemplate(workspace);
    const current = parse(await readFile(statePath, "utf8")) as Record<string, unknown>;
    const receipt = ((current.subflows as Array<Record<string, unknown>>)[0]?.start_receipt) as Record<string, unknown>;
    receipt.sha256 = "0".repeat(64);
    await writeFile(statePath, stringify(current), "utf8");
    const diagnosis = await diagnoseRuntime(workspace);
    const finding = diagnosis.report.findings.find((item) => item.repair_available);
    assert.ok(finding);
    const prepared = await prepareDoctorRepair(workspace, finding.finding_id);
    await writeFile(statePath, `${await readFile(statePath, "utf8")}\n`, "utf8");
    const changed = await readFile(statePath, "utf8");
    await assert.rejects(
      () => executeDoctorRepair(prepared),
      (error: unknown) => error instanceof DoctorRecoveryError && error.code === "repair_conflict",
    );
    assert.equal(await readFile(statePath, "utf8"), changed);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("Doctor prefers retry for a proven orphan and refuses incompatible receipt evidence", async () => {
  const root = await createWorkspace();
  const workspace = path.join(root, "researchspec");
  const statePath = path.join(workspace, "runs/current/state.yaml");
  try {
    const priorState = await readFile(statePath);
    await startTemplate(workspace);
    await writeFile(statePath, priorState);
    const retryDiagnosis = await diagnoseRuntime(workspace);
    const retry = retryDiagnosis.report.findings.find((item) => item.disposition === "retry_existing_transaction");
    assert.ok(retry);
    assert.equal(retry.retry_selector, "subflow:tpl-research");
    assert.equal(retry.repair_available, false);

    const receiptRoot = path.join(workspace, "runs/current/receipts/subflow-start");
    const originalName = (await readdir(receiptRoot))[0];
    assert.ok(originalName);
    const original = JSON.parse(await readFile(path.join(receiptRoot, originalName), "utf8")) as Record<string, unknown>;
    original.plan_sha256 = "f".repeat(64);
    const conflictPath = path.join(receiptRoot, "conflicting.json");
    await writeFile(conflictPath, `${JSON.stringify(original, null, 2)}\n`, "utf8");
    const conflictDiagnosis = await diagnoseRuntime(workspace);
    assert.ok(conflictDiagnosis.report.findings.some((item) => item.disposition === "conflicting_evidence" && item.code === "orphan_receipts_conflict"));
    assert.equal(conflictDiagnosis.repairs.size, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

async function createWorkspace(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-doctor-"));
  const workspace = path.join(root, "researchspec");
  for (const entry of getWorkspaceEntries(workspace)) {
    if (entry.kind === "dir") await mkdir(entry.path, { recursive: true });
    else {
      await mkdir(path.dirname(entry.path), { recursive: true });
      await writeFile(entry.path, entry.content, "utf8");
    }
  }
  await writeFile(path.join(workspace, "specs/workflow.yaml"), stringify(TEST_WORKFLOW), "utf8");
  await writeFile(path.join(workspace, "runs/current/state.yaml"), stringify(TEST_RUN_STATE), "utf8");
  return root;
}

async function startTemplate(workspace: string): Promise<string> {
  const snapshot = await loadWorkspaceSnapshot(workspace);
  const instructions = await buildSubflowInstructions(snapshot, "subflow:tpl-research");
  assert.equal(instructions.ok, true);
  if (!instructions.ok) throw new Error("instructions unavailable");
  const plan = await planSubflowStart({
    snapshot,
    selector: "subflow:tpl-research",
    payload: {
      schema_version: "1",
      instruction_basis_sha256: instructions.packet.instruction_basis_sha256,
      acknowledged_user_input_ids: ["research_goal"],
      prerequisite_artifact_ids: [],
      prerequisite_decision_ids: [],
      parent_subflow_selector: null,
    },
    actor: { kind: "agent", name: "deep-research" },
    confirmedBy: "researcher",
    now: "2026-07-26T10:00:00.000Z",
  });
  await executeSubflowStart(plan, workspace);
  return plan.instance.instance_id;
}
