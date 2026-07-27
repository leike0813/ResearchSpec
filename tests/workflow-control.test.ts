import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { stringify } from "yaml";

import { WorkflowDefinitionSchema } from "../src/core/contracts/workflow.js";
import { buildSubflowInstructions, executeSubflowStart, planSubflowStart } from "../src/core/runtime/subflow-control.js";
import { buildWorkflowInstructions, evaluateStartActionAvailability, evaluateWorkflowControl } from "../src/core/runtime/workflow-control.js";
import { runWorkspaceChecks } from "../src/core/validation/check.js";
import { getWorkspaceEntries } from "../src/core/workspace/layout.js";
import { loadWorkspaceSnapshot } from "../src/core/workspace/snapshot.js";
import { TEST_RUN_STATE, TEST_WORKFLOW } from "./helpers/test-workflow.js";

void test("current workflow exposes only a confirmed subflow frontier and scoped work", async () => {
  const root = await createWorkspace();
  try {
    const workspace = path.join(root, "researchspec");
    let snapshot = await loadWorkspaceSnapshot(workspace);
    assert.equal(snapshot.runState?.schema_version, "0.2");
    assert.equal(snapshot.workflow?.schema_version, "0.2");
    const initial = await evaluateWorkflowControl(snapshot);
    assert.deepEqual(initial.startable_subflows, ["subflow:tpl-research"]);
    assert.equal(initial.configured, true);
    assert.equal(initial.valid, true);
    assert.equal(initial.state, "not_started");
    assert.deepEqual(initial.frontier, initial.startable_subflows);
    assert.equal(evaluateStartActionAvailability(snapshot, initial, "subflow:tpl-research").disposition, "allowed");
    assert.equal("active_stage_id" in initial, false);
    const instructions = await buildSubflowInstructions(snapshot, "subflow:tpl-research");
    assert.equal(instructions.ok, true);
    if (!instructions.ok) return;
    const payload = {};
    const plan = await planSubflowStart({ snapshot, selector: "subflow:tpl-research", payload, actor: { kind: "agent", name: "deep-research" }, confirmedBy: "researcher", now: "2026-07-10T00:00:00.000Z" });
    await executeSubflowStart(plan, workspace);
    snapshot = await loadWorkspaceSnapshot(workspace);
    const current = await evaluateWorkflowControl(snapshot);
    assert.deepEqual(current.ready_items, [`work:${plan.instance.instance_id}/rq-brief`]);
    const work = await buildWorkflowInstructions(snapshot, current.ready_items[0] ?? "");
    assert.equal(work.ok, true);
    if (work.ok) assert.equal(work.packet.validation.profile, "text-artifact");
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("Schema 0.2 legacy transition effects normalize in memory only", () => {
  const legacy = structuredClone(TEST_WORKFLOW) as unknown as {
    subflow_templates: Array<{ transitions: Array<Record<string, unknown>> }>;
  };
  const transition = legacy.subflow_templates[0]?.transitions[0];
  assert.ok(transition);
  const effects = transition.effects;
  delete transition.effects;
  transition.effect = (effects as unknown[])[0];

  const parsed = WorkflowDefinitionSchema.parse(legacy);
  assert.deepEqual(parsed.subflow_templates[0]?.transitions[0]?.effects, [{ kind: "complete_subflow" }]);
  assert.equal("effect" in transition, true);
  assert.equal("effects" in transition, false);
  assert.equal(WorkflowDefinitionSchema.safeParse({
    ...legacy,
    subflow_templates: [{
      ...legacy.subflow_templates[0],
      transitions: [{ ...transition, effects: [{ kind: "complete_subflow" }] }],
    }],
  }).success, false);
});

void test("static workflow and run-state contracts are rejected", async () => {
  const root = await createWorkspace();
  try {
    const workspace = path.join(root, "researchspec");
    await writeFile(path.join(workspace, "specs/workflow.yaml"), 'schema_version: "0.1"\nworkflow_id: old\nworkflow_kind: old\nentry_stage_id: start\nterminal_stage_ids: [done]\nstages: [{stage_id: start, title: Start}, {stage_id: done, title: Done}]\n', "utf8");
    await writeFile(path.join(workspace, "runs/current/state.yaml"), 'schema_version: "0.1"\nrun_id: current\nworkflow_id: old\nstatus: not_started\nactive_stage_id: start\npending_decisions: []\ndiagnostics: []\n', "utf8");
    const snapshot = await loadWorkspaceSnapshot(workspace);
    assert.ok(snapshot.diagnostics.filter((item) => item.code === "invalid_contract_shape").length >= 2);
    assert.equal((await runWorkspaceChecks(workspace, "contracts")).ok, false);
  } finally { await rm(root, { recursive: true, force: true }); }
});

async function createWorkspace(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-workflow-"));
  const workspace = path.join(root, "researchspec");
  for (const entry of getWorkspaceEntries(workspace)) {
    if (entry.kind === "dir") await mkdir(entry.path, { recursive: true });
    else { await mkdir(path.dirname(entry.path), { recursive: true }); await writeFile(entry.path, entry.content, "utf8"); }
  }
  await writeFile(path.join(workspace, "specs/workflow.yaml"), stringify(TEST_WORKFLOW), "utf8");
  await writeFile(path.join(workspace, "runs/current/state.yaml"), stringify(TEST_RUN_STATE), "utf8");
  return root;
}
