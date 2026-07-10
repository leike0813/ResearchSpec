import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { ArtifactSubmitError, executeArtifactSubmit, planArtifactSubmit } from "../src/core/runtime/artifact-submit.js";
import { evaluateWorkflowControl } from "../src/core/runtime/workflow-control.js";
import { getWorkspaceEntries } from "../src/core/workspace/layout.js";
import { loadWorkspaceSnapshot } from "../src/core/workspace/snapshot.js";
import { sha256 } from "../src/core/workspace/write-plan.js";

const payload = { schema_version: "1", dependency_artifact_ids: [], producer_mode: "full" } as const;
const actor = { kind: "agent", name: "deep-research" } as const;

void test("artifact submit atomically registers candidate and receipt then advances the frontier", async () => {
  const root = await createWorkspace();
  try {
    const workspace = path.join(root, "researchspec");
    const candidatePath = path.join(workspace, "runs/current/artifacts/rq-brief.md");
    const candidate = "# RQ Brief\n\nResearch question: What is the effect?\n";
    await writeFile(candidatePath, candidate, "utf8");
    const protectedBefore = await protectedRuntime(workspace);
    const preview = await planArtifactSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector: "work:rq-brief", payload, actor, now: "2026-07-10T00:00:00.000Z" });
    assert.equal(preview.status, "would_submit");
    assert.equal(preview.candidate_sha256, sha256(candidate));
    assert.deepEqual(preview.writePlan.operations.map((item) => item.action), ["create", "refresh"]);
    assert.equal(await fileExists(path.join(workspace, `runs/current/receipts/artifact-submit/${preview.receipt.submission_id}.json`)), false);
    assert.deepEqual(await protectedRuntime(workspace), protectedBefore);

    const outcome = await executeArtifactSubmit(preview, workspace);
    assert.equal(outcome.status, "submitted");
    assert.equal(await readFile(candidatePath, "utf8"), candidate);
    assert.equal(outcome.workflow_control_after.work_items[0]?.state, "done");
    assert.equal(outcome.workflow_control_after.work_items[1]?.state, "ready");
    assert.deepEqual(await protectedRuntime(workspace), protectedBefore);
    const registry = JSON.parse(await readFile(path.join(workspace, "runs/current/artifact-registry.json"), "utf8")) as { artifacts: Array<Record<string, unknown>> };
    assert.equal(registry.artifacts.length, 2);
    assert.equal(registry.artifacts.filter((item) => item.work_item_id === "rq-brief").length, 1);
    assert.equal(registry.artifacts.filter((item) => item.artifact_type === "artifact_submit_receipt").length, 1);

    const retry = await planArtifactSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector: "work:rq-brief", payload, actor, expectedSha256: preview.candidate_sha256 });
    assert.equal(retry.status, "already_submitted");
    assert.deepEqual(retry.writePlan.operations, []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("artifact submit rejects drift and receipt loss without changing authoritative runtime", async () => {
  const root = await createWorkspace();
  try {
    const workspace = path.join(root, "researchspec");
    const candidatePath = path.join(workspace, "runs/current/artifacts/rq-brief.md");
    await writeFile(candidatePath, "# RQ Brief\n", "utf8");
    const preview = await planArtifactSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector: "work:rq-brief", payload, actor });
    await writeFile(candidatePath, "# Changed after preview\n", "utf8");
    await assert.rejects(() => executeArtifactSubmit(preview, workspace), (error: unknown) => (error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT");
    const registryPath = path.join(workspace, "runs/current/artifact-registry.json");
    assert.equal((JSON.parse(await readFile(registryPath, "utf8")) as { artifacts: unknown[] }).artifacts.length, 0);

    await writeFile(candidatePath, "# RQ Brief\n", "utf8");
    const committed = await planArtifactSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector: "work:rq-brief", payload, actor });
    await executeArtifactSubmit(committed, workspace);
    const receiptPath = path.join(workspace, `runs/current/receipts/artifact-submit/${committed.receipt.submission_id}.json`);
    await rm(receiptPath);
    const control = await evaluateWorkflowControl(await loadWorkspaceSnapshot(workspace));
    assert.equal(control.work_items[0]?.state, "blocked");
    assert.ok(control.work_items[0]?.missing_dependencies.some((item) => item.reason === "submit_receipt_untrusted"));

    await writeFile(candidatePath, "# Different revision\n", "utf8");
    await assert.rejects(
      async () => planArtifactSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector: "work:rq-brief", payload, actor }),
      (error: unknown) => error instanceof ArtifactSubmitError && error.code === "submission_conflict",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("artifact submit validates strict input and candidate content", async () => {
  const root = await createWorkspace();
  try {
    const workspace = path.join(root, "researchspec");
    const snapshot = await loadWorkspaceSnapshot(workspace);
    await assert.rejects(
      () => planArtifactSubmit({ snapshot, selector: "work:rq-brief", payload: { ...payload, path: "elsewhere" }, actor }),
      (error: unknown) => error instanceof ArtifactSubmitError && error.code === "invalid_submission_input",
    );
    await writeFile(path.join(workspace, "runs/current/artifacts/rq-brief.md"), "", "utf8");
    await assert.rejects(
      async () => planArtifactSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector: "work:rq-brief", payload, actor }),
      (error: unknown) => error instanceof ArtifactSubmitError && error.code === "candidate_validation_failed",
    );
    const candidatePath = path.join(workspace, "runs/current/artifacts/rq-brief.md");
    await writeFile(candidatePath, new Uint8Array([0xff]));
    await assert.rejects(
      async () => planArtifactSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector: "work:rq-brief", payload, actor }),
      (error: unknown) => error instanceof ArtifactSubmitError && error.code === "candidate_validation_failed",
    );
    await rm(candidatePath);
    const externalPath = path.join(root, "external.md");
    await writeFile(externalPath, "# External\n", "utf8");
    await symlink(externalPath, candidatePath);
    await assert.rejects(
      async () => planArtifactSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector: "work:rq-brief", payload, actor }),
      (error: unknown) => error instanceof ArtifactSubmitError && error.code === "candidate_path_escape",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("artifact submit requires trusted dependency coverage", async () => {
  const root = await createWorkspace();
  try {
    const workspace = path.join(root, "researchspec");
    await writeFile(path.join(workspace, "runs/current/artifacts/rq-brief.md"), "# RQ Brief\n", "utf8");
    const rqPlan = await planArtifactSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector: "work:rq-brief", payload, actor });
    await executeArtifactSubmit(rqPlan, workspace);
    await writeFile(path.join(workspace, "runs/current/artifacts/bibliography.md"), "# Bibliography\n", "utf8");

    await assert.rejects(
      async () => planArtifactSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector: "work:bibliography", payload, actor }),
      (error: unknown) => error instanceof ArtifactSubmitError && error.code === "submission_dependency_missing",
    );
    await assert.rejects(
      async () => planArtifactSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector: "work:bibliography", payload: { ...payload, dependency_artifact_ids: ["A-missing"] }, actor }),
      (error: unknown) => error instanceof ArtifactSubmitError && error.code === "submission_dependency_missing",
    );
    await writeFile(path.join(workspace, "runs/current/artifacts/rq-brief.md"), "# Drifted dependency\n", "utf8");
    await assert.rejects(
      async () => planArtifactSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector: "work:bibliography", payload: { ...payload, dependency_artifact_ids: [rqPlan.artifact.artifact_id] }, actor }),
      (error: unknown) => error instanceof ArtifactSubmitError && error.code === "submission_dependency_untrusted",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("artifact submit recovers an exact orphan receipt and rejects different provenance", async () => {
  const root = await createWorkspace();
  try {
    const workspace = path.join(root, "researchspec");
    await writeFile(path.join(workspace, "runs/current/artifacts/rq-brief.md"), "# RQ Brief\n", "utf8");
    const preview = await planArtifactSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector: "work:rq-brief", payload, actor, now: "2026-07-10T00:00:00.000Z" });
    const receiptPath = path.join(workspace, `runs/current/receipts/artifact-submit/${preview.receipt.submission_id}.json`);
    await mkdir(path.dirname(receiptPath), { recursive: true });
    await writeFile(receiptPath, `${JSON.stringify(preview.receipt, null, 2)}\n`, "utf8");
    await assert.rejects(
      async () => planArtifactSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector: "work:rq-brief", payload, actor: { kind: "agent", name: "another-producer" } }),
      (error: unknown) => error instanceof ArtifactSubmitError && error.code === "submission_conflict",
    );

    const recovered = await planArtifactSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector: "work:rq-brief", payload, actor });
    assert.deepEqual(recovered.writePlan.operations.map((item) => item.action), ["skip-unchanged", "refresh"]);
    await executeArtifactSubmit(recovered, workspace);
    assert.equal((await evaluateWorkflowControl(await loadWorkspaceSnapshot(workspace))).work_items[0]?.state, "done");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("receipt-backed completion rejects a hash-trusted but semantically mismatched receipt", async () => {
  const root = await createWorkspace();
  try {
    const workspace = path.join(root, "researchspec");
    await writeFile(path.join(workspace, "runs/current/artifacts/rq-brief.md"), "# RQ Brief\n", "utf8");
    const plan = await planArtifactSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector: "work:rq-brief", payload, actor });
    await executeArtifactSubmit(plan, workspace);
    const receiptPath = path.join(workspace, `runs/current/receipts/artifact-submit/${plan.receipt.submission_id}.json`);
    const receipt = JSON.parse(await readFile(receiptPath, "utf8")) as Record<string, unknown>;
    receipt.producer_skill = "forged-producer";
    const receiptText = `${JSON.stringify(receipt, null, 2)}\n`;
    await writeFile(receiptPath, receiptText, "utf8");
    const registryPath = path.join(workspace, "runs/current/artifact-registry.json");
    const registry = JSON.parse(await readFile(registryPath, "utf8")) as { artifacts: Array<Record<string, unknown>> };
    const receiptRecord = registry.artifacts.find((item) => item.artifact_id === plan.receipt_artifact.artifact_id);
    assert.ok(receiptRecord);
    receiptRecord.sha256 = sha256(receiptText);
    await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");

    const control = await evaluateWorkflowControl(await loadWorkspaceSnapshot(workspace));
    assert.equal(control.work_items[0]?.state, "blocked");
    assert.ok(control.work_items[0]?.missing_dependencies.some((item) => item.reason === "submit_receipt_mismatch"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("artifact submit protects every authoritative basis surface until commit", async () => {
  const root = await createWorkspace();
  try {
    const workspace = path.join(root, "researchspec");
    await writeFile(path.join(workspace, "runs/current/artifacts/rq-brief.md"), "# RQ Brief\n", "utf8");
    const plan = await planArtifactSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector: "work:rq-brief", payload, actor });
    const protectedRelativePaths = (plan.writePlan.readPreconditions ?? []).map((item) => path.relative(workspace, item.path));
    for (const expected of [
      "runs/current/artifacts/rq-brief.md", "specs/workflow.yaml", "runs/current/state.yaml",
      "runs/current/artifact-registry.json", "runs/current/gate-ledger.jsonl", "runs/current/decision-ledger.jsonl", "specs/project.md",
    ]) assert.ok(protectedRelativePaths.includes(expected), expected);

    const statePath = path.join(workspace, "runs/current/state.yaml");
    await writeFile(statePath, `${await readFile(statePath, "utf8")}# plan drift\n`, "utf8");
    await assert.rejects(() => executeArtifactSubmit(plan, workspace), (error: unknown) => (error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT");
    assert.equal((JSON.parse(await readFile(path.join(workspace, "runs/current/artifact-registry.json"), "utf8")) as { artifacts: unknown[] }).artifacts.length, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

async function createWorkspace(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-submit-"));
  const workspace = path.join(root, "researchspec");
  for (const entry of getWorkspaceEntries(workspace, "arsu-research-slice")) {
    if (entry.kind === "dir") await mkdir(entry.path, { recursive: true });
    else {
      await mkdir(path.dirname(entry.path), { recursive: true });
      await writeFile(entry.path, entry.content, "utf8");
    }
  }
  return root;
}

async function protectedRuntime(workspace: string): Promise<Record<string, string>> {
  const paths = ["runs/current/state.yaml", "runs/current/gate-ledger.jsonl", "runs/current/decision-ledger.jsonl"];
  return Object.fromEntries(await Promise.all(paths.map(async (item) => [item, await readFile(path.join(workspace, item), "utf8")] as const)));
}

async function fileExists(filePath: string): Promise<boolean> {
  try { await readFile(filePath); return true; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return false; throw error; }
}
