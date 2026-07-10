import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { stringify } from "yaml";

import { buildWorkflowInstructions, evaluateWorkflowControl } from "../src/core/runtime/workflow-control.js";
import { runWorkspaceChecks } from "../src/core/validation/check.js";
import { getWorkspaceEntries } from "../src/core/workspace/layout.js";
import { loadWorkspaceSnapshot } from "../src/core/workspace/snapshot.js";
import { sha256 } from "../src/core/workspace/write-plan.js";
import { ARSU_RESEARCH_SLICE_WORKFLOW } from "../src/core/workflow/profiles/arsu-research-slice.js";

void test("research slice exposes a deterministic read-only work-item frontier", async () => {
  const root = await createWorkspace("arsu-research-slice");
  try {
    const workspace = path.join(root, "researchspec");
    const snapshot = await loadWorkspaceSnapshot(workspace);
    const initial = await evaluateWorkflowControl(snapshot);
    assert.equal(initial.configured, true);
    assert.equal(initial.valid, true);
    assert.equal(initial.profile, "arsu-research-slice");
    assert.equal(initial.active_stage_id, "research");
    assert.equal(initial.state, "ready");
    assert.deepEqual(initial.ready_items, ["work:rq-brief"]);
    assert.deepEqual(initial.work_items.map((item) => [item.id, item.state]), [
      ["rq-brief", "ready"], ["bibliography", "blocked"], ["synthesis", "blocked"],
    ]);
    assert.equal(initial.stage_work_complete, false);

    const candidatePath = path.join(workspace, "runs/current/artifacts/rq-brief.md");
    await writeFile(candidatePath, "# Unregistered candidate\n", "utf8");
    const candidate = await evaluateWorkflowControl(await loadWorkspaceSnapshot(workspace));
    assert.equal(candidate.work_items[0]?.state, "ready");
    assert.deepEqual(candidate.work_items[0]?.warnings, [{ code: "candidate_unregistered", path: candidatePath }]);

    const instruction = await buildWorkflowInstructions(snapshot, "rq-brief");
    assert.equal(instruction.ok, true);
    if (instruction.ok) {
      assert.equal(instruction.packet.selector, "work:rq-brief");
      assert.equal(instruction.packet.work_item_id, "rq-brief");
      assert.equal(instruction.packet.output.workspace_path, "runs/current/artifacts/rq-brief.md");
      assert.equal(instruction.packet.output.template_ref, "ars:shared/handoff_schemas.md#schema-1-rq-brief");
      assert.match(instruction.packet.template, /Schema 1: RQ Brief/);
      assert.equal(instruction.packet.context, null);
      assert.equal(instruction.packet.validation.profile, "research-artifact");
      assert.equal(instruction.packet.completion.submit_available, false);
      assert.deepEqual(instruction.packet.unlocks, ["bibliography"]);
      assert.deepEqual(instruction.packet.allowed_writes, ["output_artifact", "contract_patch"]);
    }

    assert.equal(await readFile(path.join(workspace, "runs/current/state.yaml"), "utf8"), snapshot.files.get("runs/current/state.yaml")?.text);
    assert.equal(await readFile(path.join(workspace, "runs/current/artifact-registry.json"), "utf8"), snapshot.files.get("runs/current/artifact-registry.json")?.text);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("registered and hash-matched output completes one item and unlocks the next", async () => {
  const root = await createWorkspace("arsu-research-slice");
  try {
    const workspace = path.join(root, "researchspec");
    const outputPath = path.join(workspace, "runs/current/artifacts/rq-brief.md");
    const content = "# RQ Brief\n";
    await writeFile(outputPath, content, "utf8");
    await writeRegistry(workspace, [{
      artifact_id: "A-rq-brief",
      artifact_type: "rq_brief",
      work_item_id: "rq-brief",
      path: "researchspec/runs/current/artifacts/rq-brief.md",
      sha256: sha256(content),
      status: "candidate",
      verification_state: "verified",
    }]);

    let snapshot = await loadWorkspaceSnapshot(workspace);
    let control = await evaluateWorkflowControl(snapshot);
    assert.deepEqual(control.work_items.map((item) => [item.id, item.state]), [
      ["rq-brief", "done"], ["bibliography", "ready"], ["synthesis", "blocked"],
    ]);
    const bibliography = await buildWorkflowInstructions(snapshot, "bibliography");
    assert.equal(bibliography.ok, true);
    if (bibliography.ok) assert.deepEqual(bibliography.packet.dependencies.work_items, [{ id: "rq-brief", state: "done" }]);

    await writeFile(outputPath, "# Drifted RQ Brief\n", "utf8");
    snapshot = await loadWorkspaceSnapshot(workspace);
    control = await evaluateWorkflowControl(snapshot);
    const rqBrief = control.work_items.find((item) => item.id === "rq-brief");
    assert.equal(rqBrief?.state, "blocked");
    assert.ok(rqBrief?.missing_dependencies.some((item) => item.reason === "artifact_hash_mismatch"));
    const check = await runWorkspaceChecks(workspace, "artifacts");
    assert.equal(check.ok, false);
    assert.ok(check.diagnostics.some((item) => item.code === "artifact_hash_mismatch"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("active stage remains authoritative while state transitions are unavailable", async () => {
  const root = await createWorkspace("arsu-research-slice");
  try {
    const workspace = path.join(root, "researchspec");
    await writeFile(path.join(workspace, "specs/workflow.yaml"), stringify({
      ...ARSU_RESEARCH_SLICE_WORKFLOW,
      stages: [...ARSU_RESEARCH_SLICE_WORKFLOW.stages, { stage_id: "idle", title: "Idle" }],
    }), "utf8");
    await writeFile(path.join(workspace, "runs/current/state.yaml"), 'schema_version: "0.1"\nrun_id: current\nworkflow_id: arsu-research-slice\nstatus: waiting\nactive_stage_id: idle\npending_decisions: []\ndiagnostics: []\n', "utf8");
    const control = await evaluateWorkflowControl(await loadWorkspaceSnapshot(workspace));
    assert.equal(control.work_items[0]?.state, "blocked");
    assert.deepEqual(control.work_items[0]?.missing_dependencies, [{ kind: "stage", id: "research", reason: "inactive_stage" }]);
    assert.equal(control.stage_work_complete, false);
    assert.equal(control.transition_required, false);
    assert.equal(control.state, "blocked");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("a completed slice reports a transition boundary without declaring a terminal workflow", async () => {
  const root = await createWorkspace("arsu-research-slice");
  try {
    const workspace = path.join(root, "researchspec");
    const artifacts: Record<string, unknown>[] = [];
    for (const node of ARSU_RESEARCH_SLICE_WORKFLOW.work_items) {
      const content = `# ${node.title}\n`;
      await writeFile(path.join(workspace, node.output.workspace_path), content, "utf8");
      artifacts.push({
        artifact_id: `A-${node.id}`, artifact_type: node.output.artifact_type, work_item_id: node.id,
        path: `researchspec/${node.output.workspace_path}`, sha256: sha256(content), status: "candidate", verification_state: "verified",
      });
    }
    await writeRegistry(workspace, artifacts);
    const snapshot = await loadWorkspaceSnapshot(workspace);
    const control = await evaluateWorkflowControl(snapshot);
    assert.equal(snapshot.workflow?.terminal_stage_ids.length, 0);
    assert.equal(control.state, "stage_work_complete");
    assert.equal(control.stage_work_complete, true);
    assert.equal(control.transition_required, true);
    assert.equal(snapshot.state.status, "not_started");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("legacy workflow stays valid but explicitly has no dynamic control graph", async () => {
  const root = await createWorkspace("arsu-paper");
  try {
    const workspace = path.join(root, "researchspec");
    const snapshot = await loadWorkspaceSnapshot(workspace);
    const control = await evaluateWorkflowControl(snapshot);
    assert.deepEqual(control, {
      profile: "arsu-paper",
      active_stage_id: "intake",
      state: "unconfigured",
      configured: false,
      valid: true,
      reason: "workflow_nodes_missing",
      work_items: [],
      ready_items: [],
      stage_work_complete: false,
      transition_required: false,
    });
    assert.equal((await buildWorkflowInstructions(snapshot, "rq-brief")).ok, false);
    assert.equal((await runWorkspaceChecks(workspace, "contracts")).ok, true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("completion gate IDs are mandatory additional completion evidence", async () => {
  const root = await createWorkspace("arsu-research-slice");
  try {
    const workspace = path.join(root, "researchspec");
    const workflow = {
      ...structuredClone(ARSU_RESEARCH_SLICE_WORKFLOW),
      work_items: ARSU_RESEARCH_SLICE_WORKFLOW.work_items.map((item) => item.id === "rq-brief"
        ? { ...structuredClone(item), completion: { ...structuredClone(item.completion), required_gate_ids: ["G-rq-approved"] } }
        : structuredClone(item)),
    };
    await writeFile(path.join(workspace, "specs/workflow.yaml"), stringify(workflow), "utf8");

    const content = "# RQ Brief\n";
    await writeFile(path.join(workspace, "runs/current/artifacts/rq-brief.md"), content, "utf8");
    await writeRegistry(workspace, [{
      artifact_id: "A-rq-brief", artifact_type: "rq_brief", work_item_id: "rq-brief",
      path: "researchspec/runs/current/artifacts/rq-brief.md", sha256: sha256(content),
      status: "candidate", verification_state: "verified",
    }]);

    let control = await evaluateWorkflowControl(await loadWorkspaceSnapshot(workspace));
    assert.equal(control.work_items[0]?.state, "blocked");
    assert.ok(control.work_items[0]?.missing_dependencies.some((item) => item.kind === "gate_id" && item.id === "G-rq-approved"));

    await writeFile(path.join(workspace, "runs/current/gate-ledger.jsonl"), `${JSON.stringify({
      event_id: "E-gate-rq", gate_id: "G-rq-approved", timestamp: "2026-07-10T00:00:00Z",
      actor: { kind: "agent", name: "validator" }, stage_id: "research", gate_type: "approval", verdict: "pass", blocking: true,
    })}\n`, "utf8");
    control = await evaluateWorkflowControl(await loadWorkspaceSnapshot(workspace));
    assert.equal(control.work_items[0]?.state, "done");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("workflow graph diagnostics reject duplicate outputs and cycles", async () => {
  const root = await createWorkspace("arsu-research-slice");
  try {
    const workspace = path.join(root, "researchspec");
    const workItems = ARSU_RESEARCH_SLICE_WORKFLOW.work_items.map((item) => structuredClone(item));
    const [rqBrief, bibliography] = workItems;
    assert.ok(rqBrief && bibliography);
    rqBrief.requires.work_items = ["synthesis"];
    bibliography.output.workspace_path = rqBrief.output.workspace_path;
    await writeFile(path.join(workspace, "specs/workflow.yaml"), stringify({ ...ARSU_RESEARCH_SLICE_WORKFLOW, work_items: workItems }), "utf8");
    const snapshot = await loadWorkspaceSnapshot(workspace);
    assert.ok(snapshot.diagnostics.some((item) => item.code === "workflow_cycle"));
    assert.ok(snapshot.diagnostics.some((item) => item.code === "duplicate_work_item_output"));
    const check = await runWorkspaceChecks(workspace, "contracts");
    assert.equal(check.ok, false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

async function createWorkspace(profile: "arsu-paper" | "arsu-research-slice"): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-workflow-"));
  const workspace = path.join(root, "researchspec");
  for (const entry of getWorkspaceEntries(workspace, profile)) {
    if (entry.kind === "dir") await mkdir(entry.path, { recursive: true });
    else {
      await mkdir(path.dirname(entry.path), { recursive: true });
      await writeFile(entry.path, entry.content, "utf8");
    }
  }
  return root;
}

async function writeRegistry(workspace: string, artifacts: Record<string, unknown>[]): Promise<void> {
  await writeFile(path.join(workspace, "runs/current/artifact-registry.json"), `${JSON.stringify({ schema_version: "0.1", run_id: "current", artifacts }, null, 2)}\n`, "utf8");
}
