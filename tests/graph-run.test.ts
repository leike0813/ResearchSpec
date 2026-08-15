import assert from "node:assert/strict";
import { access, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { stringify } from "yaml";

import {
  evaluateGraphFrontier,
  recordGraphDecision,
  recordGraphGate,
  startGraphRun,
  submitGraphNode,
  type GraphFrontier,
} from "../src/core/runtime/graph-run.js";
import { loadGraphWorkspaceIndex } from "../src/core/runtime/graph-workspace-index.js";
import {
  GRAPH_TEXT,
  runValue,
  sha256,
  writeBaseWorkspace,
} from "./helpers/graph-workspace.js";

const TIME_0 = "2026-08-15T12:00:00+08:00";

const GATED_PROFILE = {
  schema_version: "2",
  profile_id: "gated",
  profile_version: "0.1.0",
  capability_registry_version: "0.1.0",
  entries: [{ entry_id: "main", kind: "end-to-end", node_id: "rq" }],
  nodes: [
    {
      node_id: "rq",
      kind: "capability",
      capability_id: "cap.design.research-question-formulation",
      input_bindings: [{ role: "project_intent", source: "stable_spec" }],
      expected_outputs: [{ role: "rq_brief", required: true }],
      prerequisites: [],
      required_gate_ids: [],
      required_decision_ids: [],
      multiplicity: "one",
      round_role: null,
    },
    {
      node_id: "rq-gate",
      kind: "gate",
      input_bindings: [],
      expected_outputs: [],
      prerequisites: ["rq"],
      required_gate_ids: [],
      required_decision_ids: [],
      multiplicity: "one",
      round_role: null,
    },
    {
      node_id: "choose",
      kind: "decision",
      input_bindings: [],
      expected_outputs: [],
      prerequisites: ["rq-gate"],
      required_gate_ids: [],
      required_decision_ids: [],
      multiplicity: "one",
      round_role: null,
    },
    {
      node_id: "report",
      kind: "capability",
      capability_id: "cap.generation.report-compilation",
      input_bindings: [{ role: "rq_brief", source: "node_output", from_node_id: "rq" }],
      expected_outputs: [{ role: "research_report", required: true }],
      prerequisites: ["choose"],
      required_gate_ids: ["rq-gate"],
      required_decision_ids: ["outcome"],
      multiplicity: "one",
      round_role: null,
    },
  ],
  parallel_groups: [],
  subgraphs: [],
  gates: [{ gate_id: "rq-gate", owner_node_id: "rq-gate", policy: "required", verdicts: ["pass", "fail"] }],
  decisions: [{
    decision_id: "outcome",
    owner_node_id: "choose",
    options: [
      { option_id: "continue", unlocks: ["report"] },
      { option_id: "stop", unlocks: [] },
    ],
  }],
  revision_round_template: null,
  override_policy: { failed_gate_requires_decision: true },
};

const GATED_TEXT = `${stringify(GATED_PROFILE)}\n`;

function startCommand(profileId: string, entryNodeId = "rq"): Record<string, unknown> {
  return {
    schema_version: "2",
    confirmed_at: TIME_0,
    entry_id: "main",
    entry_node_id: entryNodeId,
    prerequisites: [],
    handoff_inputs: [],
    planned_outputs: [
      { role: "rq_brief", type: "markdown", path: "rq-brief.md", purpose: "research question brief" },
      { role: "research_report", type: "markdown", path: "report.md", purpose: "research report" },
    ],
    formal_gates: profileId === "gated" ? ["rq-gate"] : [],
    cost: { effort: "low", interaction: "low" },
  };
}

function frontierOf(frontier: GraphFrontier): { eligible: string[]; gates: string[]; decisions: string[] } {
  return { eligible: frontier.eligible_node_ids, gates: frontier.pending_gates, decisions: frontier.pending_decisions };
}

function currentFrontier(index: Awaited<ReturnType<typeof loadGraphWorkspaceIndex>>): GraphFrontier {
  const record = index.runs[0];
  assert.ok(record?.run);
  assert.ok(record.graph);
  return evaluateGraphFrontier(record.run, record.graph, record.nodeEntries.flatMap((entry) => entry.node ? [entry.node] : []));
}

async function tempRoot(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), "researchspec-graph-run-"));
}

void test("startGraphRun creates a deterministic frozen run", async () => {
  const root = await tempRoot();
  try {
    const workspace = await writeBaseWorkspace(root);
    let index = await loadGraphWorkspaceIndex(workspace);
    const first = await startGraphRun({ index, profileId: "minimal", command: startCommand("minimal"), confirmedBy: "researcher" });
    assert.equal(first.status, "started");
    assert.match(first.run_id, /^run-/);
    await access(path.join(first.directory, "run.yaml"));
    await access(path.join(first.directory, "graph.yaml"));
    await access(path.join(first.directory, "handoff.md"));
    await access(path.join(first.directory, "nodes"));

    index = await loadGraphWorkspaceIndex(workspace);
    const second = await startGraphRun({ index, profileId: "minimal", command: startCommand("minimal"), confirmedBy: "researcher" });
    assert.equal(second.status, "already_started");
    assert.equal(second.run_id, first.run_id);
    assert.deepEqual(index.diagnostics, []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("startGraphRun dry run writes nothing", async () => {
  const root = await tempRoot();
  try {
    const workspace = await writeBaseWorkspace(root);
    const index = await loadGraphWorkspaceIndex(workspace);
    const result = await startGraphRun({ index, profileId: "minimal", command: startCommand("minimal"), confirmedBy: "researcher", dryRun: true });
    assert.equal(result.status, "would_start");
    await assert.rejects(access(path.join(result.directory, "run.yaml")));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("frontier advances deterministically through node submissions", async () => {
  const root = await tempRoot();
  try {
    const workspace = await writeBaseWorkspace(root);
    let index = await loadGraphWorkspaceIndex(workspace);
    const started = await startGraphRun({ index, profileId: "minimal", command: startCommand("minimal"), confirmedBy: "researcher" });
    index = await loadGraphWorkspaceIndex(workspace);
    let frontier = currentFrontier(index);
    assert.deepEqual(frontierOf(frontier), { eligible: ["rq"], gates: [], decisions: [] });

    await submitGraphNode({ index, runId: started.run_id, nodeId: "rq", outputs: [{ role: "rq_brief", path: "rq-brief.md" }], submittedAt: "2026-08-15T12:10:00+08:00" });
    index = await loadGraphWorkspaceIndex(workspace);
    frontier = currentFrontier(index);
    assert.deepEqual(frontierOf(frontier), { eligible: ["report"], gates: [], decisions: [] });

    await submitGraphNode({ index, runId: started.run_id, nodeId: "report", outputs: [{ role: "research_report", path: "report.md" }], submittedAt: "2026-08-15T12:20:00+08:00" });
    index = await loadGraphWorkspaceIndex(workspace);
    frontier = currentFrontier(index);
    assert.deepEqual(frontierOf(frontier), { eligible: [], gates: [], decisions: [] });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("out-of-order node submission is rejected without writes", async () => {
  const root = await tempRoot();
  try {
    const workspace = await writeBaseWorkspace(root);
    let index = await loadGraphWorkspaceIndex(workspace);
    const started = await startGraphRun({ index, profileId: "minimal", command: startCommand("minimal"), confirmedBy: "researcher" });
    index = await loadGraphWorkspaceIndex(workspace);
    await assert.rejects(
      submitGraphNode({ index, runId: started.run_id, nodeId: "report", outputs: [{ role: "research_report", path: "report.md" }], submittedAt: "2026-08-15T12:10:00+08:00" }),
      /Node is not currently eligible/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("gates and decisions block downstream nodes until recorded", async () => {
  const root = await tempRoot();
  try {
    const workspace = await writeBaseWorkspace(root);
    await writeFile(path.join(workspace, "profiles", "gated.yaml"), GATED_TEXT, "utf8");
    let index = await loadGraphWorkspaceIndex(workspace);
    const started = await startGraphRun({ index, profileId: "gated", command: startCommand("gated"), confirmedBy: "researcher" });
    index = await loadGraphWorkspaceIndex(workspace);

    let frontier = currentFrontier(index);
    assert.deepEqual(frontierOf(frontier), { eligible: ["rq"], gates: [], decisions: [] });

    await submitGraphNode({ index, runId: started.run_id, nodeId: "rq", outputs: [{ role: "rq_brief", path: "rq-brief.md" }], submittedAt: "2026-08-15T12:10:00+08:00" });
    index = await loadGraphWorkspaceIndex(workspace);
    frontier = currentFrontier(index);
    assert.deepEqual(frontierOf(frontier), { eligible: [], gates: [`gate:${started.run_id}/rq-gate`], decisions: [] });

    await recordGraphGate({ index, runId: started.run_id, gateId: "rq-gate", verdict: "pass", confirmedBy: "researcher", confirmedAt: "2026-08-15T12:15:00+08:00", summary: "RQ approved." });
    index = await loadGraphWorkspaceIndex(workspace);
    frontier = currentFrontier(index);
    assert.deepEqual(frontierOf(frontier), { eligible: [], gates: [], decisions: [`decision:${started.run_id}/outcome`] });

    await recordGraphDecision({ index, runId: started.run_id, decisionId: "outcome", choice: "continue", decidedBy: "researcher", decidedAt: "2026-08-15T12:20:00+08:00" });
    index = await loadGraphWorkspaceIndex(workspace);
    frontier = currentFrontier(index);
    assert.deepEqual(frontierOf(frontier), { eligible: ["report"], gates: [], decisions: [] });

    await submitGraphNode({ index, runId: started.run_id, nodeId: "report", outputs: [{ role: "research_report", path: "report.md" }], submittedAt: "2026-08-15T12:30:00+08:00" });
    index = await loadGraphWorkspaceIndex(workspace);
    frontier = currentFrontier(index);
    assert.deepEqual(frontierOf(frontier), { eligible: [], gates: [], decisions: [] });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("frozen graph hash is stable after profile text drift", async () => {
  const root = await tempRoot();
  try {
    const workspace = await writeBaseWorkspace(root);
    let index = await loadGraphWorkspaceIndex(workspace);
    const started = await startGraphRun({ index, profileId: "minimal", command: startCommand("minimal"), confirmedBy: "researcher" });
    assert.equal(started.run.profile_sha256, sha256(GRAPH_TEXT));
    await writeFile(path.join(workspace, "profiles", "minimal.yaml"), `${GRAPH_TEXT}# drift\n`, "utf8");
    index = await loadGraphWorkspaceIndex(workspace);
    assert.equal(index.runs[0].run?.profile_sha256, sha256(GRAPH_TEXT));
    assert.equal(index.runs[0].graph?.profile_id, "minimal");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("runValue helper stays compatible with the minimal profile", () => {
  assert.equal(runValue().profile_id, "minimal");
});
