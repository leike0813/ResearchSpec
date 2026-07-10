import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { stringify } from "yaml";

import { executeArtifactSubmit, planArtifactSubmit } from "../src/core/runtime/artifact-submit.js";
import { buildSubflowInstructions, executeSubflowStart, planSubflowStart } from "../src/core/runtime/subflow-control.js";
import { buildWorkflowInstructions, evaluateWorkflowControl } from "../src/core/runtime/workflow-control.js";
import { runWorkspaceChecks } from "../src/core/validation/check.js";
import { getWorkspaceEntries } from "../src/core/workspace/layout.js";
import { loadWorkspaceSnapshot } from "../src/core/workspace/snapshot.js";
import type { InstanceWorkflowDefinition } from "../src/core/contracts/workflow.js";
import { ARSU_RESEARCH_SLICE_WORKFLOW } from "../src/core/workflow/profiles/arsu-research-slice.js";

void test("research slice requires an explicit confirmed subflow start", async () => {
  const root = await createWorkspace("arsu-research-slice");
  try {
    const workspace = path.join(root, "researchspec");
    const before = await loadWorkspaceSnapshot(workspace);
    const initial = await evaluateWorkflowControl(before);
    assert.equal(initial.configured, true);
    assert.equal(initial.state, "not_started");
    assert.deepEqual(initial.startable_subflows, ["subflow:tpl-research"]);
    assert.deepEqual(initial.ready_items, []);

    const instruction = await buildSubflowInstructions(before, "subflow:tpl-research");
    assert.equal(instruction.ok, true);
    if (!instruction.ok) return;
    assert.equal(instruction.packet.route.route_ref, "deep-research:full");
    assert.equal(instruction.packet.route_coverage, "partial");
    assert.ok(instruction.packet.required_user_input_ids.includes("research_goal"));
    assert.equal(instruction.packet.instruction_basis_sha256.length, 64);

    const start = await planSubflowStart({
      snapshot: before,
      selector: "subflow:tpl-research",
      payload: startPayload(instruction.packet.instruction_basis_sha256),
      actor: { kind: "agent", name: "academic-pipeline" },
      confirmedBy: "researcher",
      now: "2026-07-10T00:00:00.000Z",
    });
    assert.equal(start.status, "would_start");
    assert.deepEqual(start.writePlan.operations.map((item) => item.action), ["create", "refresh"]);
    assert.equal(await readFile(path.join(workspace, "runs/current/state.yaml"), "utf8"), before.files.get("runs/current/state.yaml")?.text);
    const outcome = await executeSubflowStart(start, workspace);
    assert.equal(outcome.status, "started");
    assert.equal(outcome.workflow_control_after.state, "ready");
    assert.deepEqual(outcome.workflow_control_after.ready_items, [`work:${start.instance.instance_id}/rq-brief`]);
    assert.equal(outcome.workflow_control_after.work_items[0]?.submission_policy, "automatic");

    const retry = await planSubflowStart({ snapshot: await loadWorkspaceSnapshot(workspace), selector: "subflow:tpl-research", payload: startPayload(instruction.packet.instruction_basis_sha256), actor: { kind: "agent", name: "academic-pipeline" }, confirmedBy: "researcher", expectedPlanSha256: start.plan_sha256 });
    assert.equal(retry.status, "already_started");
    assert.deepEqual(retry.writePlan.operations, []);
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("scoped work instructions and receipt-backed submit advance the instance frontier", async () => {
  const root = await createWorkspace("arsu-research-slice");
  try {
    const workspace = path.join(root, "researchspec");
    const instanceId = await startSlice(workspace);
    let snapshot = await loadWorkspaceSnapshot(workspace);
    const selector = `work:${instanceId}/rq-brief`;
    const instruction = await buildWorkflowInstructions(snapshot, selector);
    assert.equal(instruction.ok, true);
    if (!instruction.ok) return;
    assert.equal(instruction.packet.instance_id, instanceId);
    assert.equal(instruction.packet.submission.policy, "automatic");
    assert.equal(instruction.packet.submission.authorization?.valid, true);
    assert.equal(instruction.packet.submission.requires_user_confirmation, false);

    await mkdir(path.dirname(instruction.packet.output.resolved_path), { recursive: true });
    await writeFile(instruction.packet.output.resolved_path, "# RQ Brief\n", "utf8");
    const plan = await planArtifactSubmit({ snapshot, selector, payload: { schema_version: "1", dependency_artifact_ids: [], producer_mode: "full" }, actor: { kind: "agent", name: "deep-research" }, now: "2026-07-10T00:01:00.000Z" });
    assert.equal(plan.confirmation_basis, "subflow_start");
    await executeArtifactSubmit(plan, workspace);
    snapshot = await loadWorkspaceSnapshot(workspace);
    const control = await evaluateWorkflowControl(snapshot);
    assert.deepEqual(control.work_items.map((item) => [item.work_item_id, item.state]), [["rq-brief", "done"], ["bibliography", "ready"], ["synthesis", "blocked"]]);
    assert.equal(control.work_items[0]?.instance_id, instanceId);
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("default legacy workspace remains valid and subflow-unconfigured", async () => {
  const root = await createWorkspace("arsu-paper");
  try {
    const workspace = path.join(root, "researchspec");
    const snapshot = await loadWorkspaceSnapshot(workspace);
    const control = await evaluateWorkflowControl(snapshot);
    assert.equal(control.configured, false);
    assert.equal(control.state, "unconfigured");
    assert.equal((await buildSubflowInstructions(snapshot, "subflow:tpl-research")).ok, false);
    assert.equal((await runWorkspaceChecks(workspace, "contracts")).ok, true);
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("instance workflow validation rejects parallel and graph inconsistencies", async () => {
  const root = await createWorkspace("arsu-research-slice");
  try {
    const workspace = path.join(root, "researchspec");
    const workflow = structuredClone(ARSU_RESEARCH_SLICE_WORKFLOW) as InstanceWorkflowDefinition;
    const template = workflow.subflow_templates[0];
    assert.ok(template);
    template.parallel_groups.push({ id: "research-pair", members: [{ work_item_id: "bibliography", required: true }, { work_item_id: "missing", required: false }], max_concurrency: 3, join: { policy: "quorum", required_count: 3 } });
    const firstWork = template.work_items[0];
    assert.ok(firstWork);
    firstWork.requires.work_items = ["synthesis"];
    await writeFile(path.join(workspace, "specs/workflow.yaml"), stringify(workflow), "utf8");
    const snapshot = await loadWorkspaceSnapshot(workspace);
    for (const code of ["parallel_member_missing", "parallel_capacity_invalid", "parallel_quorum_invalid", "workflow_cycle"]) assert.ok(snapshot.diagnostics.some((item) => item.code === code), code);
    assert.equal((await runWorkspaceChecks(workspace, "contracts")).ok, false);
  } finally { await rm(root, { recursive: true, force: true }); }
});

async function createWorkspace(profile: "arsu-paper" | "arsu-research-slice"): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-workflow-"));
  const workspace = path.join(root, "researchspec");
  for (const entry of getWorkspaceEntries(workspace, profile)) {
    if (entry.kind === "dir") await mkdir(entry.path, { recursive: true });
    else { await mkdir(path.dirname(entry.path), { recursive: true }); await writeFile(entry.path, entry.content, "utf8"); }
  }
  return root;
}

async function startSlice(workspace: string): Promise<string> {
  const snapshot = await loadWorkspaceSnapshot(workspace);
  const instruction = await buildSubflowInstructions(snapshot, "subflow:tpl-research");
  assert.equal(instruction.ok, true);
  if (!instruction.ok) throw new Error("subflow instructions unavailable");
  const plan = await planSubflowStart({ snapshot, selector: "subflow:tpl-research", payload: startPayload(instruction.packet.instruction_basis_sha256), actor: { kind: "agent", name: "academic-pipeline" }, confirmedBy: "researcher", now: "2026-07-10T00:00:00.000Z" });
  await executeSubflowStart(plan, workspace);
  return plan.instance.instance_id;
}

function startPayload(instructionBasis: string) {
  return { schema_version: "1", instruction_basis_sha256: instructionBasis, acknowledged_user_input_ids: ["research_goal"], prerequisite_artifact_ids: [], prerequisite_decision_ids: [], parent_subflow_selector: null };
}
