import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { stringify } from "yaml";

import { ArtifactSubmitError, executeArtifactSubmit, planArtifactSubmit } from "../src/core/runtime/artifact-submit.js";
import { buildSubflowInstructions, executeSubflowStart, planSubflowStart } from "../src/core/runtime/subflow-control.js";
import { evaluateWorkflowControl } from "../src/core/runtime/workflow-control.js";
import { getWorkspaceEntries } from "../src/core/workspace/layout.js";
import { loadWorkspaceSnapshot } from "../src/core/workspace/snapshot.js";
import { TEST_RUN_STATE, TEST_WORKFLOW } from "./helpers/test-workflow.js";

const payload = { producer_mode: "full" } as const;
const actor = { kind: "agent", name: "deep-research" } as const;

void test("scoped artifact submit registers a receipt and advances the instance frontier", async () => {
  const { root, workspace, instanceId } = await createStartedWorkspace();
  try {
    const candidatePath = path.join(workspace, `runs/current/subflows/${instanceId}/artifacts/rq-brief.md`);
    await mkdir(path.dirname(candidatePath), { recursive: true });
    await writeFile(candidatePath, "# RQ Brief\n", "utf8");
    const selector = `work:${instanceId}/rq-brief`;
    const preview = await planArtifactSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector, payload, actor, now: "2026-07-10T00:00:00.000Z" });
    assert.equal(preview.confirmation_basis, "subflow_start");
    const outcome = await executeArtifactSubmit(preview, workspace);
    assert.equal(outcome.status, "submitted");
    assert.equal(outcome.workflow_control_after.work_items.find((item) => item.selector === selector)?.state, "done");
    assert.ok((JSON.parse(await readFile(path.join(workspace, "runs/current/artifact-registry.json"), "utf8")) as { artifacts: unknown[] }).artifacts.length === 2);
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("bare work selectors are rejected without writes", async () => {
  const { root, workspace } = await createStartedWorkspace();
  try {
    await assert.rejects(
      async () => planArtifactSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector: "work:rq-brief", payload, actor }),
      (error: unknown) => error instanceof ArtifactSubmitError && error.code === "invalid_work_item_selector",
    );
    assert.deepEqual((JSON.parse(await readFile(path.join(workspace, "runs/current/artifact-registry.json"), "utf8")) as { artifacts: unknown[] }).artifacts, []);
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("current workflow rejects the removed research-artifact validation alias", async () => {
  const root = await createWorkspace();
  try {
    const workspace = path.join(root, "researchspec");
    const workflow = structuredClone(TEST_WORKFLOW) as Record<string, unknown>;
    const template = (workflow.subflow_templates as Array<{ work_items: Array<Record<string, unknown>> }>)[0];
    assert.ok(template);
    template.work_items[0] = { ...template.work_items[0], validation_profile: "research-artifact" };
    await writeFile(path.join(workspace, "specs/workflow.yaml"), stringify(workflow), "utf8");
    const snapshot = await loadWorkspaceSnapshot(workspace);
    assert.ok(snapshot.diagnostics.some((item) => item.code === "invalid_contract_shape"));
    assert.equal((await evaluateWorkflowControl(snapshot)).valid, true);
    assert.equal((await evaluateWorkflowControl(snapshot)).configured, false);
  } finally { await rm(root, { recursive: true, force: true }); }
});

async function createStartedWorkspace() {
  const root = await createWorkspace();
  const workspace = path.join(root, "researchspec");
  const snapshot = await loadWorkspaceSnapshot(workspace);
  const instructions = await buildSubflowInstructions(snapshot, "subflow:tpl-research");
  assert.equal(instructions.ok, true);
  if (!instructions.ok) throw new Error("instructions unavailable");
  const startPayload = {};
  const plan = await planSubflowStart({ snapshot, selector: "subflow:tpl-research", payload: startPayload, actor: { kind: "agent", name: "deep-research" }, confirmedBy: "researcher", now: "2026-07-10T00:00:00.000Z" });
  await executeSubflowStart(plan, workspace);
  return { root, workspace, instanceId: plan.instance.instance_id };
}

async function createWorkspace(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-submit-"));
  const workspace = path.join(root, "researchspec");
  for (const entry of getWorkspaceEntries(workspace)) {
    if (entry.kind === "dir") await mkdir(entry.path, { recursive: true });
    else { await mkdir(path.dirname(entry.path), { recursive: true }); await writeFile(entry.path, entry.content, "utf8"); }
  }
  await writeFile(path.join(workspace, "specs/workflow.yaml"), stringify(TEST_WORKFLOW), "utf8");
  await writeFile(path.join(workspace, "runs/current/state.yaml"), stringify(TEST_RUN_STATE), "utf8");
  return root;
}
