import assert from "node:assert/strict";
import { access, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { stringify } from "yaml";

import {
  evaluateGraphFrontier,
  graphChildRunSnapshots,
  recordGraphDecision,
  recordGraphGate,
  startGraphChildRun as startGraphChildRunRuntime,
  startGraphRun as startGraphRunRuntime,
  submitGraphNode as submitGraphNodeRuntime,
} from "../src/core/runtime/graph-run.js";
import { buildGraphRunSummary, graphRunIsUnfinished, type GraphRunSummary } from "../src/core/runtime/graph-recovery.js";
import { loadGraphWorkspaceIndex, type GraphWorkspaceIndex } from "../src/core/runtime/graph-workspace-index.js";
import { ACADEMIC_PIPELINE_GRAPH_PROFILE_TEXT } from "../src/arsu-converter/workflow/graph-profiles/academic-pipeline.js";
import { RESEARCH_MAIN_GRAPH_PROFILE_TEXT } from "../src/arsu-converter/workflow/graph-profiles/research-main.js";
import {
  GRAPH_PROFILE,
  graphTestCapabilityRegistryForGraph,
  graphTestCapabilityRegistryForGraphs,
  sha256,
  writeBaseWorkspace,
} from "./helpers/graph-workspace.js";

const TIME_0 = "2026-08-15T12:00:00+08:00";

const REVISION_PROFILE = {
  ...GRAPH_PROFILE,
  profile_id: "revision-loop",
  entries: [{ entry_id: "main", kind: "end-to-end", node_id: "revision" }],
  nodes: [
    {
      node_id: "revision",
      kind: "capability",
      capability_id: "generation-manuscript-drafting",
      input_bindings: [],
      expected_outputs: [{ role: "revised_manuscript", required: true }],
      prerequisites: [],
      required_gate_ids: [],
      required_decision_ids: [],
      multiplicity: "repeatable",
      round_role: "revision_round",
    },
    {
      node_id: "review",
      kind: "decision",
      input_bindings: [],
      expected_outputs: [],
      prerequisites: ["revision"],
      required_gate_ids: [],
      required_decision_ids: [],
      multiplicity: "repeatable",
      round_role: "review_round",
    },
  ],
  decisions: [{
    decision_id: "outcome",
    owner_node_id: "review",
    options: [{ option_id: "continue", unlocks: ["revision"] }, { option_id: "exit", unlocks: [] }],
  }],
  revision_round_template: {
    revision_node_id: "revision",
    review_node_id: "review",
    continue_option_id: "continue",
    exit_option_id: "exit",
  },
};

const RESPONSE_PROFILE = {
  ...GRAPH_PROFILE,
  profile_id: "review-response",
  entries: [{ entry_id: "main", kind: "end-to-end", node_id: "respond" }],
  nodes: [
    {
      node_id: "respond",
      kind: "capability",
      capability_id: "generation-manuscript-drafting",
      input_bindings: [{ role: "review_letters", source: "handoff" }],
      expected_outputs: [{ role: "response_letter", required: true }],
      prerequisites: [],
      required_gate_ids: [],
      required_decision_ids: [],
      multiplicity: "one",
      round_role: null,
    },
    {
      node_id: "quality-gate",
      kind: "gate",
      input_bindings: [],
      expected_outputs: [],
      prerequisites: ["respond"],
      required_gate_ids: [],
      required_decision_ids: [],
      multiplicity: "one",
      round_role: null,
    },
    {
      node_id: "deliver",
      kind: "capability",
      capability_id: "generation-report-compilation",
      input_bindings: [{ role: "response_letter", source: "node_output", from_node_id: "respond" }],
      expected_outputs: [{ role: "delivery_package", required: true }],
      prerequisites: ["quality-gate"],
      required_gate_ids: ["quality-gate"],
      required_decision_ids: [],
      multiplicity: "one",
      round_role: null,
    },
  ],
  gates: [{ gate_id: "quality-gate", owner_node_id: "quality-gate", policy: "required", verdicts: ["pass", "fail"] }],
};

interface StartCommandOptions {
  entryId?: string;
  entryNodeId?: string;
  routeRef?: string;
  handoffInputs?: Array<{ role: string; type: string; path: string; purpose: string }>;
  plannedOutputs?: Array<{ role: string; type: string; path: string; purpose: string }>;
  formalGates?: string[];
}

function startCommand(options: StartCommandOptions = {}) {
  return {
    schema_version: "2",
    confirmed_at: TIME_0,
    entry_id: options.entryId ?? "main",
    entry_node_id: options.entryNodeId ?? "rq",
    ...(options.routeRef === undefined ? {} : { route_ref: options.routeRef }),
    prerequisites: [],
    handoff_inputs: options.handoffInputs ?? [],
    planned_outputs: options.plannedOutputs ?? [
      { role: "rq_brief", type: "markdown", path: "rq-brief.md", purpose: "research question brief" },
      { role: "research_report", type: "markdown", path: "report.md", purpose: "research report" },
    ],
    formal_gates: options.formalGates ?? [],
    cost: { effort: "low", interaction: "low" },
  };
}

async function startRun(index: GraphWorkspaceIndex, profileId: string, command: ReturnType<typeof startCommand>) {
  const graph = index.profiles.get(profileId);
  assert.ok(graph);
  return startGraphRunRuntime({ index, profileId, command, confirmedBy: "researcher", capabilityRegistry: await graphTestCapabilityRegistryForGraph(graph) });
}

async function startChildRun(index: GraphWorkspaceIndex, parentRunId: string, nodeId: string) {
  const parent = index.runs.find((item) => item.run?.run_id === parentRunId);
  const parentGraph = parent?.graph;
  assert.ok(parentGraph);
  const subgraphId = parentGraph.nodes.find((node) => node.node_id === nodeId)?.subgraph_id;
  const child = parentGraph.subgraphs.find((item) => item.subgraph_id === subgraphId);
  const childGraph = child === undefined ? undefined : index.profiles.get(child.profile_id);
  assert.ok(child && childGraph);
  return startGraphChildRunRuntime({
    index,
    parentRunId,
    nodeId,
    startedAt: "2026-08-15T12:01:00+08:00",
    capabilityRegistry: await graphTestCapabilityRegistryForGraphs(parentGraph, childGraph),
  });
}

async function advanceNode(index: GraphWorkspaceIndex, runId: string, nodeId: string, outputs: Array<{ role: string; path: string }>, round?: number) {
  const record = index.runs.find((item) => item.run?.run_id === runId);
  assert.ok(record?.graph);
  await submitGraphNodeRuntime({
    index,
    runId,
    nodeId,
    ...(round === undefined ? {} : { round }),
    outputs,
    submittedAt: "2026-08-15T12:10:00+08:00",
    capabilityRegistry: await graphTestCapabilityRegistryForGraph(record.graph),
  });
  return loadGraphWorkspaceIndex(index.workspace);
}

async function writeBoundaryMaterial(projectRoot: string, relativePath: string): Promise<void> {
  await writeFile(path.join(projectRoot, relativePath), `# ${relativePath}\n`, "utf8");
}

async function buildSummary(index: GraphWorkspaceIndex, runId: string): Promise<GraphRunSummary> {
  const record = index.runs.find((item) => item.run?.run_id === runId);
  assert.ok(record?.run && record.graph, `run not found: ${runId}`);
  const frontier = evaluateGraphFrontier(record.run, record.graph, record.nodeEntries.flatMap((entry) => entry.node ? [entry.node] : []), graphChildRunSnapshots(index),
    record.handoff ? { registry: await graphTestCapabilityRegistryForGraph(record.graph), handoff: record.handoff.frontmatter } : undefined);
  const built = buildGraphRunSummary(record, frontier);
  assert.ok(built, "a scanned run record must derive a summary");
  return built;
}

async function buildAllSummaries(index: GraphWorkspaceIndex): Promise<GraphRunSummary[]> {
  const summaries: GraphRunSummary[] = [];
  for (const record of index.runs) if (record.run && record.graph) summaries.push(await buildSummary(index, record.run.run_id));
  return summaries;
}

for (const [status, unfinished] of [["active", true], ["paused", true], ["blocked", true], ["complete", false], ["cancelled", false]] as const) {
  void test(`run status ${status} reports unfinished=${String(unfinished)}`, () => {
    assert.equal(graphRunIsUnfinished(status), unfinished);
  });
}

void test("each unfinished run keeps its own deterministic summary without an automatically selected task", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-recovery-multi-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    const secondary = { ...GRAPH_PROFILE, profile_id: "secondary", entries: [{ entry_id: "alt", kind: "end-to-end", node_id: "report" }] };
    await writeFile(path.join(workspace, "profiles", "secondary.yaml"), `${stringify(secondary)}\n`, "utf8");
    let index = await loadGraphWorkspaceIndex(workspace);
    const first = await startRun(index, "minimal", startCommand());
    index = await loadGraphWorkspaceIndex(workspace);
    const other = await startRun(index, "secondary", startCommand({ entryId: "alt", entryNodeId: "report", plannedOutputs: [{ role: "research_report", type: "markdown", path: "report.md", purpose: "research report" }] }));
    index = await loadGraphWorkspaceIndex(workspace);

    const summaries = await buildAllSummaries(index);
    assert.equal(summaries.length, 2);
    const byRun = new Map(summaries.map((item) => [item.run_id, item]));
    const primary = byRun.get(first.run_id);
    const secondarySummary = byRun.get(other.run_id);
    assert.ok(primary && secondarySummary);
    assert.deepEqual([primary.profile_id, primary.entry_id, primary.entry_node_id], ["minimal", "main", "rq"]);
    assert.deepEqual([secondarySummary.profile_id, secondarySummary.entry_id, secondarySummary.entry_node_id], ["secondary", "alt", "report"]);
    for (const item of summaries) {
      assert.equal(item.unfinished, true);
      assert.equal(item.authorization_origin, "human");
      assert.ok(item.next_inspections.every((command) => command.includes(item.run_id)), "a summary may only reference its own run records");
    }
    assert.deepEqual(JSON.parse(JSON.stringify(primary)), JSON.parse(JSON.stringify(await buildSummary(index, first.run_id))));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

for (const rounds of [1, 2]) void test(`revision round ${String(rounds)} stays addressable in the recovery summary`, async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-recovery-round-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    await writeFile(path.join(workspace, "profiles", "revision-loop.yaml"), `${stringify(REVISION_PROFILE)}\n`, "utf8");
    let index = await loadGraphWorkspaceIndex(workspace);
    const started = await startRun(index, "revision-loop", startCommand({ entryNodeId: "revision", plannedOutputs: [{ role: "revised_manuscript", type: "markdown", path: "revised.md", purpose: "revised manuscript" }] }));
    index = await loadGraphWorkspaceIndex(workspace);
    for (let round = 1; round <= rounds; round += 1) {
      index = await advanceNode(index, started.run_id, "revision", [{ role: "revised_manuscript", path: `revised-${String(round)}.md` }], round);
      await recordGraphDecision({ index, runId: started.run_id, decisionId: "outcome", round, choice: "continue", decidedBy: "researcher", decidedAt: "2026-08-15T12:15:00+08:00" });
      index = await loadGraphWorkspaceIndex(workspace);
    }
    const openRound = rounds + 1;
    index = await advanceNode(index, started.run_id, "revision", [{ role: "revised_manuscript", path: `revised-${String(openRound)}.md` }], openRound);

    const pending = await buildSummary(index, started.run_id);
    assert.deepEqual(pending.frontier, []);
    assert.deepEqual(pending.pending_decisions, [`decision:${started.run_id}/outcome@${String(openRound)}`]);
    assert.ok(pending.next_inspections.includes(`instructions decision:${started.run_id}/outcome@${String(openRound)}`));
    assert.equal(pending.unfinished, true);
    assert.deepEqual(pending.declared_delivery.expected_output_roles, ["revised_manuscript"]);

    await recordGraphDecision({ index, runId: started.run_id, decisionId: "outcome", round: openRound, choice: "continue", decidedBy: "researcher", decidedAt: "2026-08-15T12:20:00+08:00" });
    index = await loadGraphWorkspaceIndex(workspace);
    const continued = await buildSummary(index, started.run_id);
    assert.deepEqual(continued.frontier.map((item) => [item.node_id, item.round, item.selector]), [["revision", openRound + 1, `node:${started.run_id}/revision@${String(openRound + 1)}`]]);
    assert.deepEqual(continued.pending_decisions, []);
    assert.deepEqual(continued.blockers, []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("a pending control and its failed-Gate blocker both stay addressable in the recovery summary", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-recovery-control-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    await writeFile(path.join(workspace, "profiles", "review-response.yaml"), `${stringify(RESPONSE_PROFILE)}\n`, "utf8");
    let index = await loadGraphWorkspaceIndex(workspace);
    const started = await startRun(index, "review-response", startCommand({
      entryNodeId: "respond",
      handoffInputs: [{ role: "review_letters", type: "markdown", path: "letters.md", purpose: "reviewer letters" }],
      plannedOutputs: [{ role: "response_letter", type: "markdown", path: "response.md", purpose: "response letter" }],
      formalGates: ["quality-gate"],
    }));
    index = await loadGraphWorkspaceIndex(workspace);
    await writeBoundaryMaterial(index.projectRoot, "letters.md");
    index = await advanceNode(index, started.run_id, "respond", [{ role: "response_letter", path: "response.md" }]);

    const pending = await buildSummary(index, started.run_id);
    assert.deepEqual(pending.pending_gates, [`gate:${started.run_id}/quality-gate`]);
    assert.ok(pending.next_inspections.includes(`instructions gate:${started.run_id}/quality-gate`));
    assert.deepEqual(pending.blockers, []);
    assert.deepEqual(pending.declared_delivery.inputs.map(({ role, path: materialPath, purpose }) => ({ role, path: materialPath, purpose })),
      [{ role: "review_letters", path: "letters.md", purpose: "reviewer letters" }]);

    await recordGraphGate({ index, runId: started.run_id, gateId: "quality-gate", verdict: "fail", confirmedBy: "researcher", confirmedAt: "2026-08-15T12:20:00+08:00", summary: "Incomplete." });
    index = await loadGraphWorkspaceIndex(workspace);
    const blocked = await buildSummary(index, started.run_id);
    assert.deepEqual(blocked.blockers.map((item) => [item.code, item.node_id, item.selector]), [["gate_failed", "deliver", `node:${started.run_id}/deliver`]]);
    assert.ok(blocked.next_inspections.includes(`instructions node:${started.run_id}/deliver`));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("a missing declared material stays an unresolved-input blocker with role detail and no readability probe", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-recovery-material-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    await writeFile(path.join(workspace, "profiles", "review-response.yaml"), `${stringify(RESPONSE_PROFILE)}\n`, "utf8");
    const index = await loadGraphWorkspaceIndex(workspace);
    const started = await startRun(index, "review-response", startCommand({ entryNodeId: "respond", plannedOutputs: [{ role: "response_letter", type: "markdown", path: "response.md", purpose: "response letter" }] }));
    const current = await buildSummary(await loadGraphWorkspaceIndex(workspace), started.run_id);

    assert.deepEqual(current.frontier, []);
    assert.deepEqual(current.blockers.map((item) => [item.code, item.role, item.selector, (item.details as { source?: string }).source]),
      [["node_input_unresolved", "review_letters", `node:${started.run_id}/respond`, "handoff"]]);
    assert.ok(current.next_inspections.includes(`instructions node:${started.run_id}/respond`));
    assert.deepEqual(current.declared_delivery.outputs.map(({ role, path: materialPath, purpose }) => ({ role, path: materialPath, purpose })),
      [{ role: "response_letter", path: "response.md", purpose: "response letter" }]);
    await assert.rejects(access(path.join(workspace, "letters.md")), "the summary must not require the material file to exist");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("a parent-bound child run reports inherited delivery without a second start confirmation", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-recovery-child-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    await writeFile(path.join(workspace, "profiles", "academic-pipeline.yaml"), ACADEMIC_PIPELINE_GRAPH_PROFILE_TEXT, "utf8");
    await writeFile(path.join(workspace, "profiles", "research-main.yaml"), RESEARCH_MAIN_GRAPH_PROFILE_TEXT, "utf8");
    let index = await loadGraphWorkspaceIndex(workspace);
    const parent = await startRun(index, "academic-pipeline", startCommand({
      entryNodeId: "research",
      routeRef: "academic-pipeline:end-to-end",
      plannedOutputs: [
        { role: "research_report", type: "markdown", path: "report.md", purpose: "research report" },
        { role: "annotated_bibliography", type: "markdown", path: "bibliography.md", purpose: "annotated bibliography" },
        { role: "synthesis_report", type: "markdown", path: "synthesis.md", purpose: "evidence synthesis" },
      ],
      formalGates: ["research-gate"],
    }));
    index = await loadGraphWorkspaceIndex(workspace);
    const parentPending = await buildSummary(index, parent.run_id);
    assert.deepEqual(parentPending.pending_subgraph_starts.map((item) => item.selector), [`node:${parent.run_id}/research`]);
    assert.ok(parentPending.next_inspections.includes(`instructions node:${parent.run_id}/research`));

    const child = await startChildRun(index, parent.run_id, "research");
    index = await loadGraphWorkspaceIndex(workspace);
    const childSummary = await buildSummary(index, child.run_id);
    assert.equal(childSummary.authorization_origin, "parent_run");
    assert.deepEqual(childSummary.parent_binding, { parent_run_id: parent.run_id, parent_node_id: "research", subgraph_id: "research-main" });
    assert.deepEqual(childSummary.declared_delivery.outputs.map((item) => item.role), ["research_report", "annotated_bibliography", "synthesis_report"]);
    assert.deepEqual(childSummary.declared_delivery.expected_output_roles, []);
    assert.deepEqual(childSummary.declared_delivery.prerequisites, []);
    assert.deepEqual(childSummary.declared_delivery.formal_gates, []);
    assert.equal(childSummary.unfinished, true);

    const parentAfter = await buildSummary(index, parent.run_id);
    assert.deepEqual(parentAfter.pending_subgraph_starts, []);
    assert.ok(parentAfter.next_inspections.every((command) => command.includes(parent.run_id)));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("a completed run still derives a summary for run instructions", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-recovery-complete-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    let index = await loadGraphWorkspaceIndex(workspace);
    const started = await startRun(index, "minimal", startCommand());
    index = await loadGraphWorkspaceIndex(workspace);
    index = await advanceNode(index, started.run_id, "rq", [{ role: "rq_brief", path: "rq-brief.md" }]);
    await writeBoundaryMaterial(index.projectRoot, "rq-brief.md");
    index = await advanceNode(index, started.run_id, "report", [{ role: "research_report", path: "report.md" }]);

    const current = await buildSummary(index, started.run_id);
    assert.equal(current.status, "complete");
    assert.equal(current.unfinished, false);
    assert.equal(current.completion_ready, true);
    assert.deepEqual(current.frontier, []);
    assert.deepEqual(current.next_inspections, []);
    assert.deepEqual(current.declared_delivery.expected_output_roles, ["rq_brief", "research_report"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("a scanned record without a parsed run derives no summary", () => {
  const emptyFrontier = { eligible_node_ids: [], eligible_nodes: [], pending_subgraph_starts: [], pending_gates: [], pending_decisions: [], blockers: [], completion_ready: false };
  assert.equal(buildGraphRunSummary({
    directoryName: "run-damaged",
    directoryPath: "/tmp/run-damaged",
    runPath: "/tmp/run-damaged/run.yaml",
    graphPath: "/tmp/run-damaged/graph.yaml",
    handoffPath: "/tmp/run-damaged/handoff.md",
    nodesDirectory: "/tmp/run-damaged/nodes",
    nodeEntries: [],
  }, emptyFrontier), undefined);
});

void test("summary identity comes from the frozen run record", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-recovery-identity-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    const index = await loadGraphWorkspaceIndex(workspace);
    const started = await startRun(index, "minimal", startCommand());
    const reloaded = await loadGraphWorkspaceIndex(workspace);
    const record = reloaded.runs.find((item) => item.run?.run_id === started.run_id);
    assert.ok(record?.run && record.graph && record.graphText);
    assert.equal(sha256(record.graphText), record.run.profile_sha256);
    const current = await buildSummary(reloaded, started.run_id);
    assert.equal(current.profile_id, record.run.profile_id);
    assert.equal(current.profile_version, record.run.profile_version);
    assert.deepEqual(current.declared_delivery.outputs.map((item) => [item.role, item.path]), [["rq_brief", "rq-brief.md"], ["research_report", "report.md"]]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
