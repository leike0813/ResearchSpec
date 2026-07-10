import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { parse, stringify } from "yaml";

import { ARSU_ROUTING_CATALOG } from "../src/arsu-converter/routing/catalog.js";
import { ARSU_ARTIFACT_CONTRACTS } from "../src/arsu-converter/workflow/artifact-contracts.js";
import { ARSU_V0_1_WORKFLOW, validateArsuWorkflowCatalog } from "../src/arsu-converter/workflow/catalog.js";
import { GENERATED_PROFILE_SOURCE, runtimeWorkflowProjectionIsCurrent } from "../src/arsu-converter/workflow/generate.js";
import { validateWorkflowDefinition } from "../src/core/contracts/workflow.js";
import { executeArtifactSubmit, planArtifactSubmit } from "../src/core/runtime/artifact-submit.js";
import { decideItem } from "../src/core/runtime/lifecycle.js";
import { buildSubflowInstructions, executeSubflowStart, planSubflowStart, SubflowStartError } from "../src/core/runtime/subflow-control.js";
import { evaluateWorkflowControl } from "../src/core/runtime/workflow-control.js";
import { getWorkspaceEntries, getWorkspaceTemplates } from "../src/core/workspace/layout.js";
import { loadWorkspaceSnapshot } from "../src/core/workspace/snapshot.js";
import { sha256 } from "../src/core/workspace/write-plan.js";
import { ARSU_RESEARCH_SLICE_WORKFLOW } from "../src/core/workflow/profiles/arsu-research-slice.js";

void test("arsu-v0-1 exactly covers the routing catalog and generated projection", async () => {
  const routes = ARSU_ROUTING_CATALOG.skills.flatMap((skill) => skill.routes);
  const external = ARSU_V0_1_WORKFLOW.subflow_templates.filter((template) => template.visibility !== "internal");
  const internal = ARSU_V0_1_WORKFLOW.subflow_templates.filter((template) => template.visibility === "internal");
  assert.equal(routes.filter((route) => route.route_kind === "mode").length, 25);
  assert.equal(routes.filter((route) => route.route_kind === "entry").length, 2);
  assert.equal(external.length, 27);
  assert.deepEqual(internal.map((template) => template.template_id), ["tpl-pipeline-revision-round"]);
  assert.deepEqual(validateArsuWorkflowCatalog(), []);
  assert.deepEqual(validateWorkflowDefinition(ARSU_V0_1_WORKFLOW), []);
  assert.equal(await runtimeWorkflowProjectionIsCurrent(process.cwd()), true);
  assert.match(GENERATED_PROFILE_SOURCE, /Do not edit/);
  for (const route of routes) for (const artifactType of route.primary_artifact_types) assert.ok(ARSU_ARTIFACT_CONTRACTS[artifactType], `${route.route_ref}:${artifactType}`);
});

void test("new workspace defaults to arsu-v0-1 without starting a route", () => {
  const config = parse(getWorkspaceTemplates().find((item) => item.relativePath === "config.yaml")?.content ?? "") as Record<string, unknown>;
  const state = parse(getWorkspaceTemplates().find((item) => item.relativePath === "runs/current/state.yaml")?.content ?? "") as { status: string; subflows: unknown[] };
  assert.equal(config.profile, "arsu-v0-1");
  assert.equal(state.status, "not_started");
  assert.deepEqual(state.subflows, []);
  assert.equal(getWorkspaceTemplates("arsu-paper").find((item) => item.relativePath === "config.yaml")?.content.includes("profile: arsu-paper"), true);
});

void test("pipeline frontier exposes a scoped child and inherits parent confirmation", async () => {
  const root = await createWorkspace("arsu-v0-1");
  try {
    const workspace = path.join(root, "researchspec");
    const parent = await start(workspace, "subflow:tpl-academic-pipeline-end-to-end", ["research_goal"], "researcher");
    let snapshot = await loadWorkspaceSnapshot(workspace);
    let control = await evaluateWorkflowControl(snapshot);
    const childSelector = `subflow:${parent}/research`;
    assert.ok(control.startable_subflows.includes(childSelector));
    assert.equal(control.startable_subflows.includes("subflow:tpl-pipeline-revision-round"), false);

    const instructions = await buildSubflowInstructions(snapshot, childSelector);
    assert.equal(instructions.ok, true);
    if (!instructions.ok) return;
    assert.equal(instructions.packet.start?.requires_confirmation, false);
    const plan = await planSubflowStart({
      snapshot, selector: childSelector,
      payload: { schema_version: "1", instruction_basis_sha256: instructions.packet.instruction_basis_sha256, acknowledged_user_input_ids: ["research_goal"], prerequisite_artifact_ids: [], prerequisite_decision_ids: [], parent_subflow_selector: `subflow:${parent}` },
      actor: { kind: "agent", name: "academic-pipeline" }, now: "2026-07-10T01:00:00.000Z",
    });
    assert.equal(plan.receipt.authorization.kind, "parent_delegated");
    assert.equal(plan.receipt.confirmed_by.name, "researcher");
    assert.equal(plan.instance.parent_subflow_id, parent);
    assert.equal(plan.instance.parent_node_id, "research");
    await executeSubflowStart(plan, workspace);

    snapshot = await loadWorkspaceSnapshot(workspace);
    control = await evaluateWorkflowControl(snapshot);
    assert.equal(control.subflows.find((item) => item.selector === childSelector)?.state, "active");
    const state = snapshot.runState;
    assert.ok(state && "subflows" in state);
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("binary-file-artifact accepts native bytes and keeps receipt semantics", async () => {
  const root = await createWorkspace("arsu-research-slice");
  try {
    const workspace = path.join(root, "researchspec");
    const workflow = structuredClone(ARSU_RESEARCH_SLICE_WORKFLOW);
    const node = workflow.subflow_templates[0]?.work_items[0];
    assert.ok(node);
    node.output = { artifact_type: "formatted_manuscript", workspace_path_template: "runs/current/subflows/{subflow_instance_id}/artifacts/formatted-manuscript.docx", template_ref: "arsu-artifact:formatted_manuscript" };
    node.validation_profile = "binary-file-artifact";
    await writeFile(path.join(workspace, "specs/workflow.yaml"), stringify(workflow), "utf8");
    const instance = await start(workspace, "subflow:tpl-research", ["research_goal"], "researcher");
    const snapshot = await loadWorkspaceSnapshot(workspace);
    const control = await evaluateWorkflowControl(snapshot);
    const item = control.work_items.find((candidate) => candidate.selector === `work:${instance}/rq-brief`);
    assert.ok(item);
    await mkdir(path.dirname(item.output_path), { recursive: true });
    await writeFile(item.output_path, new Uint8Array([0xff, 0x00, 0x44, 0x4f, 0x43, 0x58]));
    const plan = await planArtifactSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector: item.selector, payload: { schema_version: "1", dependency_artifact_ids: [] }, actor: { kind: "agent", name: "academic-paper" } });
    assert.equal(plan.validation.profile, "binary-file-artifact");
    assert.ok(plan.validation.checks.includes("allowed_extension"));
    await executeArtifactSubmit(plan, workspace);
    assert.equal((await readFile(item.output_path)).length, 6);
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("mid-entry filters artifact branches and locks one scoped Decision", async () => {
  const root = await createWorkspace("arsu-v0-1");
  try {
    const workspace = path.join(root, "researchspec");
    const artifactPath = path.join(workspace, "imports/synthesis.md");
    await mkdir(path.dirname(artifactPath), { recursive: true });
    await writeFile(artifactPath, "# Synthesis\n", "utf8");
    const registryPath = path.join(workspace, "runs/current/artifact-registry.json");
    const registry = JSON.parse(await readFile(registryPath, "utf8")) as { artifacts: Record<string, unknown>[] };
    registry.artifacts.push({ artifact_id: "A-synthesis", artifact_type: "synthesis_report", path: "researchspec/imports/synthesis.md", sha256: sha256("# Synthesis\n"), status: "accepted", verification_state: "verified" });
    await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
    const parent = await start(workspace, "subflow:tpl-academic-pipeline-mid-entry", [], "researcher", ["A-synthesis"]);
    let snapshot = await loadWorkspaceSnapshot(workspace);
    let control = await evaluateWorkflowControl(snapshot);
    const candidates = control.transitions.filter((item) => item.subflow_instance_id === parent && item.state === "decision_required");
    assert.deepEqual(candidates.map((item) => item.transition_node_id).sort(), ["enter-research", "enter-write"]);
    assert.ok(candidates.every((item) => item.decision_point_id === `${parent}/pipeline-entry`));
    await decideItem({ snapshot, selector: `transition:${parent}/enter-write`, decision: "accept", actorName: "researcher", reason: "Trusted synthesis is ready for writing.", dryRun: false });
    snapshot = await loadWorkspaceSnapshot(workspace);
    control = await evaluateWorkflowControl(snapshot);
    assert.equal(control.transitions.find((item) => item.transition_node_id === "enter-write" && item.subflow_instance_id === parent)?.state, "ready");
    assert.equal(control.transitions.find((item) => item.transition_node_id === "enter-research" && item.subflow_instance_id === parent)?.state, "blocked");
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("trusted revision outcome exposes unbounded parent-scoped round n plus one", async () => {
  const root = await createWorkspace("arsu-v0-1");
  try {
    const workspace = path.join(root, "researchspec");
    const parentId = await start(workspace, "subflow:tpl-academic-pipeline-end-to-end", ["research_goal"], "researcher");
    const statePath = path.join(workspace, "runs/current/state.yaml");
    let state = parse(await readFile(statePath, "utf8")) as { subflows: Array<Record<string, unknown>>; updated_at: string | null };
    const parent = state.subflows.find((item) => item.instance_id === parentId);
    assert.ok(parent);
    parent.active_stage_id = "revision";
    await writeFile(statePath, stringify(state), "utf8");

    let snapshot = await loadWorkspaceSnapshot(workspace);
    const selector = `subflow:${parentId}/revision-round`;
    const instructions = await buildSubflowInstructions(snapshot, selector);
    assert.equal(instructions.ok, true);
    if (!instructions.ok) return;
    const roundOne = await planSubflowStart({ snapshot, selector, payload: { schema_version: "1", instruction_basis_sha256: instructions.packet.instruction_basis_sha256, acknowledged_user_input_ids: [], prerequisite_artifact_ids: [], prerequisite_decision_ids: [], parent_subflow_selector: `subflow:${parentId}` }, actor: { kind: "agent", name: "academic-pipeline" }, now: "2026-07-10T02:00:00.000Z" });
    assert.equal(roundOne.instance.round_number, 1);
    await executeSubflowStart(roundOne, workspace);

    const roundId = roundOne.instance.instance_id;
    const transitionId = `${roundId}/revise-round`;
    const decisionId = "D-round-one";
    const decision = { event_id: "E-round-one", decision_id: decisionId, timestamp: "2026-07-10T02:10:00.000Z", actor: { kind: "human", name: "researcher" }, decision_type: "workflow_branch", decision_point_id: `${roundId}/revision-outcome`, transition_id: transitionId, subflow_instance_id: roundId, selected_option: "revise-round", status: "accepted", rationale: "Another revision is required." };
    await writeFile(path.join(workspace, "runs/current/decision-ledger.jsonl"), `${JSON.stringify(decision)}\n`, "utf8");
    const receiptPath = `runs/current/receipts/transition-advance/${roundId}/revise-round.json`;
    const receipt = { schema_version: "1", receipt_type: "transition_advance", plan_sha256: "1".repeat(64), instruction_basis_sha256: "2".repeat(64), selector: `transition:${transitionId}`, transition_id: transitionId, transition_node_id: "revise-round", subflow_instance_id: roundId, template_id: "tpl-pipeline-revision-round", from_stage_id: "re-review", effect: { kind: "complete_subflow" }, gate_event_ids: [], decision_ids: [decisionId], actor: { kind: "agent", name: "academic-pipeline" }, advanced_at: "2026-07-10T02:11:00.000Z" };
    const receiptText = `${JSON.stringify(receipt, null, 2)}\n`;
    await mkdir(path.dirname(path.join(workspace, receiptPath)), { recursive: true });
    await writeFile(path.join(workspace, receiptPath), receiptText, "utf8");
    state = parse(await readFile(statePath, "utf8")) as typeof state;
    const roundState = state.subflows.find((item) => item.instance_id === roundId);
    assert.ok(roundState);
    roundState.status = "complete";
    roundState.active_stage_id = "re-review";
    roundState.transition_receipts = [{ transition_id: transitionId, path: receiptPath, sha256: sha256(receiptText), plan_sha256: receipt.plan_sha256 }];
    await writeFile(statePath, stringify(state), "utf8");

    snapshot = await loadWorkspaceSnapshot(workspace);
    const control = await evaluateWorkflowControl(snapshot);
    assert.equal(control.subflows.find((item) => item.selector === selector)?.round_number, 2);
    assert.ok(control.startable_subflows.includes(selector));
    const nextInstructions = await buildSubflowInstructions(snapshot, selector);
    assert.equal(nextInstructions.ok, true);
    if (!nextInstructions.ok) return;
    const roundTwo = await planSubflowStart({ snapshot, selector, payload: { schema_version: "1", instruction_basis_sha256: nextInstructions.packet.instruction_basis_sha256, acknowledged_user_input_ids: [], prerequisite_artifact_ids: [], prerequisite_decision_ids: [decisionId], parent_subflow_selector: `subflow:${parentId}` }, actor: { kind: "agent", name: "academic-pipeline" } });
    assert.equal(roundTwo.instance.round_number, 2);
    assert.ok(roundTwo.receipt.prerequisite_decision_ids.includes(decisionId));
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("subflow Start recovers an exact orphan receipt and rejects provenance drift", async () => {
  const root = await createWorkspace("arsu-research-slice");
  try {
    const workspace = path.join(root, "researchspec");
    const snapshot = await loadWorkspaceSnapshot(workspace);
    const selector = "subflow:tpl-research";
    const instructions = await buildSubflowInstructions(snapshot, selector);
    assert.equal(instructions.ok, true);
    if (!instructions.ok) return;
    const payload = { schema_version: "1", instruction_basis_sha256: instructions.packet.instruction_basis_sha256, acknowledged_user_input_ids: ["research_goal"], prerequisite_artifact_ids: [], prerequisite_decision_ids: [], parent_subflow_selector: null };
    const preview = await planSubflowStart({ snapshot, selector, payload, actor: { kind: "agent", name: "academic-pipeline" }, confirmedBy: "researcher", now: "2026-07-10T03:00:00.000Z" });
    const receiptPath = path.join(workspace, preview.instance.start_receipt.path);
    await mkdir(path.dirname(receiptPath), { recursive: true });
    await writeFile(receiptPath, `${JSON.stringify(preview.receipt, null, 2)}\n`, "utf8");
    await assert.rejects(
      async () => planSubflowStart({ snapshot: await loadWorkspaceSnapshot(workspace), selector, payload, actor: { kind: "agent", name: "different-agent" }, confirmedBy: "researcher" }),
      (error: unknown) => error instanceof SubflowStartError && error.code === "subflow_start_conflict",
    );
    const recovered = await planSubflowStart({ snapshot: await loadWorkspaceSnapshot(workspace), selector, payload, actor: { kind: "agent", name: "academic-pipeline" }, confirmedBy: "researcher" });
    assert.deepEqual(recovered.writePlan.operations.map((item) => item.action), ["skip-unchanged", "refresh"]);
    assert.equal(recovered.receipt.started_at, preview.receipt.started_at);
    await executeSubflowStart(recovered, workspace);
  } finally { await rm(root, { recursive: true, force: true }); }
});

async function createWorkspace(profile: "arsu-v0-1" | "arsu-research-slice"): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-arsu-profile-"));
  const workspace = path.join(root, "researchspec");
  for (const entry of getWorkspaceEntries(workspace, profile)) {
    if (entry.kind === "dir") await mkdir(entry.path, { recursive: true });
    else { await mkdir(path.dirname(entry.path), { recursive: true }); await writeFile(entry.path, entry.content, "utf8"); }
  }
  return root;
}

async function start(workspace: string, selector: string, acknowledged: string[], confirmedBy: string, prerequisiteArtifactIds: string[] = []): Promise<string> {
  const snapshot = await loadWorkspaceSnapshot(workspace);
  const instructions = await buildSubflowInstructions(snapshot, selector);
  assert.equal(instructions.ok, true);
  if (!instructions.ok) throw new Error("instructions unavailable");
  const plan = await planSubflowStart({ snapshot, selector, payload: { schema_version: "1", instruction_basis_sha256: instructions.packet.instruction_basis_sha256, acknowledged_user_input_ids: acknowledged, prerequisite_artifact_ids: prerequisiteArtifactIds, prerequisite_decision_ids: [], parent_subflow_selector: null }, actor: { kind: "agent", name: "academic-pipeline" }, confirmedBy, now: "2026-07-10T00:00:00.000Z" });
  await executeSubflowStart(plan, workspace);
  return plan.instance.instance_id;
}
