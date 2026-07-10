import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { stringify } from "yaml";

import type { InstanceWorkflowDefinition, WorkflowNodeTemplate } from "../src/core/contracts/workflow.js";
import { isInstanceRunState } from "../src/core/contracts/run-state.js";
import { executeArtifactSubmit, planArtifactSubmit } from "../src/core/runtime/artifact-submit.js";
import { buildSubflowInstructions, executeSubflowStart, planSubflowStart } from "../src/core/runtime/subflow-control.js";
import { evaluateWorkflowControl } from "../src/core/runtime/workflow-control.js";
import { getWorkspaceEntries } from "../src/core/workspace/layout.js";
import { loadWorkspaceSnapshot } from "../src/core/workspace/snapshot.js";
import { ARSU_RESEARCH_SLICE_WORKFLOW } from "../src/core/workflow/profiles/arsu-research-slice.js";

void test("parallel frontier enforces capacity and quorum join", async () => {
  const root = await createWorkspace();
  try {
    const workspace = path.join(root, "researchspec");
    const workflow = parallelWorkflow();
    await writeFile(path.join(workspace, "specs/workflow.yaml"), stringify(workflow), "utf8");
    const instanceId = await startTemplate(workspace, "tpl-parallel", null);
    let snapshot = await loadWorkspaceSnapshot(workspace);
    let control = await evaluateWorkflowControl(snapshot);
    assert.deepEqual(control.ready_items, [`work:${instanceId}/a`, `work:${instanceId}/b`]);
    const deferred = control.work_items.find((item) => item.work_item_id === "c");
    assert.equal(deferred?.state, "ready");
    assert.equal(deferred?.dispatchable, false);
    assert.equal(deferred?.deferred_reason, "parallel_capacity_deferred");

    const itemA = control.work_items.find((item) => item.work_item_id === "a");
    assert.ok(itemA);
    await mkdir(path.dirname(itemA.output_path), { recursive: true });
    await writeFile(itemA.output_path, "# A\n", "utf8");
    const submit = await planArtifactSubmit({ snapshot, selector: itemA.selector, payload: { schema_version: "1", dependency_artifact_ids: [] }, actor: { kind: "agent", name: "deep-research" }, now: "2026-07-10T00:01:00.000Z" });
    await executeArtifactSubmit(submit, workspace);
    snapshot = await loadWorkspaceSnapshot(workspace);
    control = await evaluateWorkflowControl(snapshot);
    assert.equal(control.parallel_groups[0]?.state, "satisfied");
    assert.ok(control.ready_items.includes(`work:${instanceId}/join-output`));
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("all join keeps downstream work blocked until every required member completes", async () => {
  const root = await createWorkspace();
  try {
    const workspace = path.join(root, "researchspec");
    await writeFile(path.join(workspace, "specs/workflow.yaml"), stringify(parallelWorkflow("all")), "utf8");
    const instanceId = await startTemplate(workspace, "tpl-parallel", null);
    const control = await evaluateWorkflowControl(await loadWorkspaceSnapshot(workspace));
    assert.equal(control.parallel_groups[0]?.state, "pending");
    const downstream = control.work_items.find((item) => item.selector === `work:${instanceId}/join-output`);
    assert.equal(downstream?.state, "blocked");
    assert.ok(downstream?.missing_dependencies.some((item) => item.reason === "parallel_join_not_satisfied"));
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("round templates derive parent-scoped unbounded round numbers", async () => {
  const root = await createWorkspace();
  try {
    const workspace = path.join(root, "researchspec");
    const workflow = structuredClone(ARSU_RESEARCH_SLICE_WORKFLOW) as InstanceWorkflowDefinition;
    const base = workflow.subflow_templates[0];
    assert.ok(base);
    base.template_id = "tpl-parent";
    const round = structuredClone(base);
    round.template_id = "tpl-round";
    round.template_kind = "round";
    round.parent_policy = "required";
    round.work_items = round.work_items.map((item) => ({ ...item, output: { ...item.output, workspace_path_template: item.output.workspace_path_template.replace("/artifacts/", "/round-artifacts/") } }));
    workflow.subflow_templates = [base, round];
    await writeFile(path.join(workspace, "specs/workflow.yaml"), stringify(workflow), "utf8");
    const parentId = await startTemplate(workspace, "tpl-parent", null);
    const first = await startTemplate(workspace, "tpl-round", `subflow:${parentId}`);
    const second = await startTemplate(workspace, "tpl-round", `subflow:${parentId}`);
    const state = await loadWorkspaceSnapshot(workspace);
    const rounds = isInstanceRunState(state.runState) ? state.runState.subflows.filter((item) => item.instance_id === first || item.instance_id === second) : [];
    assert.deepEqual(rounds.map((item) => item.round_number), [1, 2]);
    assert.ok(rounds.every((item) => item.parent_subflow_id === parentId));
  } finally { await rm(root, { recursive: true, force: true }); }
});

function parallelWorkflow(joinPolicy: "all" | "quorum" = "quorum"): InstanceWorkflowDefinition {
  const sourceDefinition = ARSU_RESEARCH_SLICE_WORKFLOW.subflow_templates[0]?.work_items[0];
  assert.ok(sourceDefinition);
  const source: WorkflowNodeTemplate = structuredClone(sourceDefinition);
  const work = (id: string, requiresGroups: string[] = []): WorkflowNodeTemplate => ({ ...structuredClone(source), id, title: id, requires: { ...structuredClone(source.requires), parallel_groups: requiresGroups }, output: { ...source.output, artifact_type: `artifact_${id}`, workspace_path_template: `runs/current/subflows/{subflow_instance_id}/artifacts/${id}.md` } });
  return {
    schema_version: "0.2", workflow_id: "parallel-test", workflow_kind: "test",
    subflow_templates: [{ template_id: "tpl-parallel", template_kind: "standalone", route_ref: "deep-research:full", route_coverage: "partial", parent_policy: "none", entry_stage_id: "research", stages: [{ stage_id: "research", title: "Research" }], start_requires: { decision_types: [] }, work_items: [work("a"), work("b"), work("c"), work("join-output", ["panel"])], parallel_groups: [{ id: "panel", members: [{ work_item_id: "a", required: true }, { work_item_id: "b", required: true }, { work_item_id: "c", required: false }], max_concurrency: 2, join: joinPolicy === "all" ? { policy: "all" } : { policy: "quorum", required_count: 1 } }], gates: [], transitions: [] }],
  };
}

async function createWorkspace(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-subflow-"));
  const workspace = path.join(root, "researchspec");
  for (const entry of getWorkspaceEntries(workspace, "arsu-research-slice")) {
    if (entry.kind === "dir") await mkdir(entry.path, { recursive: true });
    else { await mkdir(path.dirname(entry.path), { recursive: true }); await writeFile(entry.path, entry.content, "utf8"); }
  }
  return root;
}

async function startTemplate(workspace: string, templateId: string, parent: string | null): Promise<string> {
  const snapshot = await loadWorkspaceSnapshot(workspace);
  const selector = `subflow:${templateId}`;
  const instructions = await buildSubflowInstructions(snapshot, selector);
  assert.equal(instructions.ok, true);
  if (!instructions.ok) throw new Error("instructions unavailable");
  const plan = await planSubflowStart({ snapshot, selector, payload: { schema_version: "1", instruction_basis_sha256: instructions.packet.instruction_basis_sha256, acknowledged_user_input_ids: ["research_goal"], prerequisite_artifact_ids: [], prerequisite_decision_ids: [], parent_subflow_selector: parent }, actor: { kind: "agent", name: "academic-pipeline" }, confirmedBy: "researcher", now: `2026-07-10T00:00:0${String(isInstanceRunState(snapshot.runState) ? snapshot.runState.subflows.length : 0)}.000Z` });
  await executeSubflowStart(plan, workspace);
  return plan.instance.instance_id;
}
