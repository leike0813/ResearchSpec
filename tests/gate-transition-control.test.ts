import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { parse, stringify } from "yaml";

import type { InstanceWorkflowDefinition } from "../src/core/contracts/workflow.js";
import { executeArtifactSubmit, planArtifactSubmit } from "../src/core/runtime/artifact-submit.js";
import { executeGateSubmit, executeTransitionAdvance, planGateSubmit, planTransitionAdvance } from "../src/core/runtime/gate-transition-control.js";
import { decideItem } from "../src/core/runtime/lifecycle.js";
import { buildSubflowInstructions, executeSubflowStart, planSubflowStart } from "../src/core/runtime/subflow-control.js";
import { buildGateTransitionInstructions, evaluateWorkflowControl } from "../src/core/runtime/workflow-control.js";
import { getWorkspaceEntries } from "../src/core/workspace/layout.js";
import { loadWorkspaceSnapshot } from "../src/core/workspace/snapshot.js";
import { ARSU_RESEARCH_SLICE_WORKFLOW } from "../src/core/workflow/profiles/arsu-research-slice.js";

void test("confirmed Gate submit unlocks one receipt-backed terminal transition", async () => {
  const root = await createWorkspace();
  try {
    const workspace = path.join(root, "researchspec");
    const instanceId = await completeSliceWork(workspace);
    let snapshot = await loadWorkspaceSnapshot(workspace);
    let control = await evaluateWorkflowControl(snapshot);
    const gateSelector = `gate:${instanceId}/research-completion`;
    assert.equal(control.state, "gate_required");
    assert.ok(control.frontier.includes(gateSelector));
    const packet = await buildGateTransitionInstructions(snapshot, gateSelector);
    assert.equal(packet.ok, true);
    if (!packet.ok) return;
    const gatePlan = await planGateSubmit({
      snapshot, selector: gateSelector, payload: gatePayload(packet.packet, "pass"),
      actor: { kind: "validator", name: "researchspec-verify" }, confirmedBy: "researcher", now: "2026-07-10T01:00:00.000Z",
    });
    assert.equal(gatePlan.status, "would_submit");
    assert.deepEqual(gatePlan.writePlan.operations.map((item) => item.action), ["create", "refresh"]);
    assert.equal((await readFile(path.join(workspace, "runs/current/gate-ledger.jsonl"), "utf8")).trim(), "");
    await executeGateSubmit(gatePlan, workspace);

    snapshot = await loadWorkspaceSnapshot(workspace);
    control = await evaluateWorkflowControl(snapshot);
    const transitionSelector = `transition:${instanceId}/complete-research`;
    assert.equal(control.state, "transition_ready");
    assert.deepEqual(control.transitions.filter((item) => item.state === "ready").map((item) => item.selector), [transitionSelector]);
    const advance = await planTransitionAdvance({ snapshot, selector: transitionSelector, actor: { kind: "agent", name: "academic-pipeline" }, now: "2026-07-10T01:01:00.000Z" });
    assert.equal(advance.status, "would_advance");
    assert.deepEqual(advance.writePlan.operations.map((item) => item.action), ["create", "refresh"]);
    const outcome = await executeTransitionAdvance(advance, workspace);
    assert.equal(outcome.status, "advanced");
    assert.equal(outcome.workflow_control_after.state, "complete");
    const retry = await planTransitionAdvance({ snapshot: await loadWorkspaceSnapshot(workspace), selector: transitionSelector, actor: { kind: "agent", name: "academic-pipeline" }, expectedPlanSha256: advance.plan_sha256 });
    assert.equal(retry.status, "already_advanced");
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("failed Gate requires confirmed reverification before override", async () => {
  const root = await createWorkspace();
  try {
    const workspace = path.join(root, "researchspec");
    const instanceId = await completeSliceWork(workspace);
    const selector = `gate:${instanceId}/research-completion`;
    let snapshot = await loadWorkspaceSnapshot(workspace);
    let instructions = await buildGateTransitionInstructions(snapshot, selector);
    assert.equal(instructions.ok, true);
    if (!instructions.ok) return;
    const initial = await planGateSubmit({ snapshot, selector, payload: gatePayload(instructions.packet, "fail"), actor: { kind: "validator", name: "researchspec-verify" }, confirmedBy: "researcher", now: "2026-07-10T02:00:00.000Z" });
    await executeGateSubmit(initial, workspace);
    snapshot = await loadWorkspaceSnapshot(workspace);
    await assert.rejects(() => decideItem({ snapshot, selector, decision: "accept", actorName: "researcher", reason: "Proceed despite limitation", dryRun: true }), /reverification/);

    instructions = await buildGateTransitionInstructions(snapshot, selector);
    assert.equal(instructions.ok, true);
    if (!instructions.ok) return;
    const reverificationPayload = gatePayload(instructions.packet, "fail", { verification_kind: "reverification", supersedes_event_id: String(initial.event.event_id) });
    const reverification = await planGateSubmit({ snapshot, selector, payload: reverificationPayload, actor: { kind: "validator", name: "researchspec-verify" }, confirmedBy: "researcher", now: "2026-07-10T02:01:00.000Z" });
    await executeGateSubmit(reverification, workspace);
    const override = await decideItem({ snapshot: await loadWorkspaceSnapshot(workspace), selector, decision: "accept", actorName: "researcher", reason: "Risk accepted explicitly", dryRun: false });
    assert.equal(override.status, "accepted");
    const control = await evaluateWorkflowControl(await loadWorkspaceSnapshot(workspace));
    assert.equal(control.gates[0]?.state, "overridden");
    assert.equal(control.transitions[0]?.state, "ready");
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("multiple transition candidates require one workflow-branch Decision", async () => {
  const root = await createWorkspace(true);
  try {
    const workspace = path.join(root, "researchspec");
    const instanceId = await completeSliceWork(workspace);
    await submitPassingGate(workspace, instanceId);
    let snapshot = await loadWorkspaceSnapshot(workspace);
    let control = await evaluateWorkflowControl(snapshot);
    const branchSelector = `transition:${instanceId}/alternate-completion`;
    assert.equal(control.state, "decision_required");
    assert.ok(control.transitions.filter((item) => item.state === "decision_required").length >= 2);
    await assert.rejects(() => planTransitionAdvance({ snapshot, selector: branchSelector, actor: { kind: "agent", name: "academic-pipeline" } }), /Decision/);
    const decision = await decideItem({ snapshot, selector: branchSelector, decision: "accept", actorName: "researcher", reason: "Choose alternate branch", dryRun: false });
    assert.equal(decision.status, "accepted");
    snapshot = await loadWorkspaceSnapshot(workspace);
    control = await evaluateWorkflowControl(snapshot);
    assert.deepEqual(control.transitions.filter((item) => item.state === "ready").map((item) => item.selector), [branchSelector]);
    assert.equal((await planTransitionAdvance({ snapshot, selector: branchSelector, actor: { kind: "agent", name: "academic-pipeline" } })).status, "would_advance");
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("Schema 0.2 without Gate and transition fields remains readable", async () => {
  const root = await createWorkspace();
  try {
    const workspace = path.join(root, "researchspec");
    const workflowPath = path.join(workspace, "specs/workflow.yaml");
    const raw = parse(await readFile(workflowPath, "utf8")) as Record<string, unknown>;
    const templates = raw.subflow_templates as Array<Record<string, unknown>>;
    delete templates[0]?.gates;
    delete templates[0]?.transitions;
    await writeFile(workflowPath, stringify(raw), "utf8");
    const snapshot = await loadWorkspaceSnapshot(workspace);
    assert.equal(snapshot.diagnostics.some((item) => item.blocking), false);
    assert.deepEqual((snapshot.workflow as InstanceWorkflowDefinition).subflow_templates[0]?.gates, []);
    assert.deepEqual((snapshot.workflow as InstanceWorkflowDefinition).subflow_templates[0]?.transitions, []);
  } finally { await rm(root, { recursive: true, force: true }); }
});

async function createWorkspace(withBranch = false): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-gate-transition-"));
  const workspace = path.join(root, "researchspec");
  for (const entry of getWorkspaceEntries(workspace, "arsu-research-slice")) {
    if (entry.kind === "dir") await mkdir(entry.path, { recursive: true });
    else { await mkdir(path.dirname(entry.path), { recursive: true }); await writeFile(entry.path, entry.content, "utf8"); }
  }
  if (withBranch) {
    const workflow = structuredClone(ARSU_RESEARCH_SLICE_WORKFLOW) as InstanceWorkflowDefinition;
    const template = workflow.subflow_templates[0];
    assert.ok(template);
    template.transitions.push({ id: "alternate-completion", from_stage_id: "research", effect: { kind: "complete_subflow" }, requires: { gate_ids: ["research-completion"], decision_types: ["workflow_branch"] }, branch: { decision_point_id: "research-outcome", option_id: "alternate" } });
    await writeFile(path.join(workspace, "specs/workflow.yaml"), stringify(workflow), "utf8");
  }
  return root;
}

async function completeSliceWork(workspace: string): Promise<string> {
  const before = await loadWorkspaceSnapshot(workspace);
  const instructions = await buildSubflowInstructions(before, "subflow:tpl-research");
  assert.equal(instructions.ok, true);
  if (!instructions.ok) throw new Error("Subflow instructions unavailable");
  const start = await planSubflowStart({ snapshot: before, selector: "subflow:tpl-research", payload: { schema_version: "1", instruction_basis_sha256: instructions.packet.instruction_basis_sha256, acknowledged_user_input_ids: ["research_goal"], prerequisite_artifact_ids: [], prerequisite_decision_ids: [], parent_subflow_selector: null }, actor: { kind: "agent", name: "academic-pipeline" }, confirmedBy: "researcher", now: "2026-07-10T00:00:00.000Z" });
  await executeSubflowStart(start, workspace);
  for (let index = 0; index < 3; index += 1) {
    const snapshot = await loadWorkspaceSnapshot(workspace);
    const control = await evaluateWorkflowControl(snapshot);
    const status = control.work_items.find((item) => item.state === "ready" && item.dispatchable);
    assert.ok(status);
    await mkdir(path.dirname(status.output_path), { recursive: true });
    await writeFile(status.output_path, `# ${status.work_item_id}\n\nEvidence.\n`, "utf8");
    const template = (snapshot.workflow as InstanceWorkflowDefinition).subflow_templates[0]?.work_items.find((item) => item.id === status.work_item_id);
    assert.ok(template);
    const dependencies = template.requires.work_items.map((workId) => snapshot.artifacts.find((artifact) => artifact.subflow_instance_id === start.instance.instance_id && artifact.work_item_id === workId && artifact.artifact_type !== "artifact_submit_receipt")?.artifact_id).filter((id): id is string => typeof id === "string");
    const plan = await planArtifactSubmit({ snapshot, selector: status.selector, payload: { schema_version: "1", dependency_artifact_ids: dependencies, producer_mode: "full" }, actor: { kind: "agent", name: "deep-research" }, now: `2026-07-10T00:0${String(index + 1)}:00.000Z` });
    await executeArtifactSubmit(plan, workspace);
  }
  return start.instance.instance_id;
}

async function submitPassingGate(workspace: string, instanceId: string): Promise<void> {
  const snapshot = await loadWorkspaceSnapshot(workspace);
  const selector = `gate:${instanceId}/research-completion`;
  const instructions = await buildGateTransitionInstructions(snapshot, selector);
  assert.equal(instructions.ok, true);
  if (!instructions.ok) throw new Error("Gate instructions unavailable");
  await executeGateSubmit(await planGateSubmit({ snapshot, selector, payload: gatePayload(instructions.packet, "pass"), actor: { kind: "validator", name: "researchspec-verify" }, confirmedBy: "researcher", now: "2026-07-10T03:00:00.000Z" }), workspace);
}

function gatePayload(packet: Record<string, unknown>, verdict: "pass" | "pass_with_conditions" | "fail", overrides: Record<string, unknown> = {}) {
  const evidence = packet.evidence as Array<Record<string, unknown>>;
  return { schema_version: "1", instruction_basis_sha256: packet.instruction_basis_sha256, verdict, verification_kind: "initial", evidence, findings: [{ code: "evidence-review", summary: "Evidence reviewed against the declared Gate contract.", evidence_indexes: evidence.map((_item, index) => index) }], ...overrides };
}
