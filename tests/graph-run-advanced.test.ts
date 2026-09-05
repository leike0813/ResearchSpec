import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { stringify } from "yaml";

import { parseCapabilityGraphProfile } from "../src/core/contracts/capability-graph.js";

import {
  evaluateGraphFrontier,
  graphRunCompletionReady,
  GraphRunError,
  recordGraphDecision,
  startGraphChildRun,
  startGraphRun,
  submitGraphNode as submitGraphNodeRuntime,
  type SubmitGraphNodeInput,
  validateSubgraphNodeBindings,
  type GraphFrontier,
  writeGraphHandoff,
} from "../src/core/runtime/graph-run.js";

async function submitGraphNode(input: Omit<SubmitGraphNodeInput, "capabilityRegistry">) {
  return submitGraphNodeRuntime({
    ...input,
    capabilityRegistry: await graphTestCapabilityRegistry(input.index, input.runId),
  });
}
import { loadGraphWorkspaceIndex } from "../src/core/runtime/graph-workspace-index.js";
import { GRAPH_PROFILE, graphTestCapabilityRegistry, sha256, writeBaseWorkspace } from "./helpers/graph-workspace.js";
import { ACADEMIC_PIPELINE_GRAPH_PROFILE_TEXT } from "../src/arsu-converter/workflow/graph-profiles/academic-pipeline.js";
import { RESEARCH_MAIN_GRAPH_PROFILE_TEXT } from "../src/arsu-converter/workflow/graph-profiles/research-main.js";

const TIME_0 = "2026-08-15T12:00:00+08:00";

const REVISION_PROFILE = {
  schema_version: "2",
  profile_id: "revision-loop",
  profile_version: "0.1.0",
  capability_registry_version: "0.1.0",
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
    {
      node_id: "report",
      kind: "capability",
      capability_id: "generation-report-compilation",
      input_bindings: [],
      expected_outputs: [{ role: "research_report", required: true }],
      prerequisites: ["review"],
      required_gate_ids: [],
      required_decision_ids: ["outcome"],
      multiplicity: "one",
      round_role: null,
    },
  ],
  parallel_groups: [],
  subgraphs: [],
  gates: [],
  decisions: [{
    decision_id: "outcome",
    owner_node_id: "review",
    options: [
      { option_id: "continue", unlocks: ["revision"] },
      { option_id: "exit", unlocks: ["report"] },
    ],
  }],
  revision_round_template: {
    revision_node_id: "revision",
    review_node_id: "review",
    continue_option_id: "continue",
    exit_option_id: "exit",
  },
  override_policy: { failed_gate_requires_decision: true },
};

const REVISION_TEXT = `${stringify(REVISION_PROFILE)}\n`;

function startCommand(profileId: string, entryNodeId: string): Record<string, unknown> {
  return {
    schema_version: "2",
    confirmed_at: TIME_0,
    entry_id: "main",
    entry_node_id: entryNodeId,
    prerequisites: [],
    handoff_inputs: [],
    planned_outputs: [
      { role: "revised_manuscript", type: "markdown", path: "revised.md", purpose: "revised manuscript" },
      { role: "research_report", type: "markdown", path: "report.md", purpose: "report" },
    ],
    formal_gates: [],
    cost: { effort: "low", interaction: "low" },
  };
}

function currentFrontier(index: Awaited<ReturnType<typeof loadGraphWorkspaceIndex>>): GraphFrontier {
  const record = index.runs[0];
  assert.ok(record?.run);
  assert.ok(record.graph);
  return evaluateGraphFrontier(record.run, record.graph, record.nodeEntries.flatMap((entry) => entry.node ? [entry.node] : []));
}

async function loadIndexAfterStart(workspace: string, profileId: string, entryNodeId: string) {
  let index = await loadGraphWorkspaceIndex(workspace);
  const started = await startGraphRun({ index, profileId, command: startCommand(profileId, entryNodeId), confirmedBy: "researcher" });
  index = await loadGraphWorkspaceIndex(workspace);
  return { index, started };
}

for (const terminalDecision of [false, true]) void test(`revision rounds persist completion at the final ${terminalDecision ? "decision" : "capability"}`, async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-revision-loop-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    const profile = terminalDecision ? {
      ...REVISION_PROFILE,
      nodes: REVISION_PROFILE.nodes.filter((node) => node.node_id !== "report"),
      decisions: [{ ...REVISION_PROFILE.decisions[0], options: [
        { option_id: "continue", unlocks: ["revision"] },
        { option_id: "exit", unlocks: [] },
      ] }],
    } : REVISION_PROFILE;
    await writeFile(path.join(workspace, "profiles", "revision-loop.yaml"), stringify(profile), "utf8");
    const loaded = await loadIndexAfterStart(workspace, "revision-loop", "revision");
    const { started } = loaded;
    let index = loaded.index;

    let frontier = currentFrontier(index);
    assert.deepEqual(frontier.eligible_nodes.map((item) => `${item.node_id}@${String(item.round ?? 0)}`), ["revision@1"]);
    assert.equal(frontier.completion_ready, false);

    await submitGraphNode({ index, runId: started.run_id, nodeId: "revision", round: 1, outputs: [{ role: "revised_manuscript", path: "revised-1.md" }], submittedAt: "2026-08-15T12:10:00+08:00" });
    index = await loadGraphWorkspaceIndex(workspace);
    frontier = currentFrontier(index);
    assert.deepEqual(frontier.pending_decisions, [`decision:${started.run_id}/outcome@1`]);
    assert.equal(frontier.eligible_nodes.length, 0);

    await recordGraphDecision({ index, runId: started.run_id, decisionId: "outcome", round: 1, choice: "continue", decidedBy: "researcher", decidedAt: "2026-08-15T12:15:00+08:00" });
    index = await loadGraphWorkspaceIndex(workspace);
    frontier = currentFrontier(index);
    assert.deepEqual(frontier.eligible_nodes.map((item) => `${item.node_id}@${String(item.round ?? 0)}`), ["revision@2"]);
    assert.equal(index.runs[0].run?.status, "active");

    await submitGraphNode({ index, runId: started.run_id, nodeId: "revision", round: 2, outputs: [{ role: "revised_manuscript", path: "revised-2.md" }], submittedAt: "2026-08-15T12:20:00+08:00" });
    index = await loadGraphWorkspaceIndex(workspace);
    frontier = currentFrontier(index);
    assert.deepEqual(frontier.pending_decisions, [`decision:${started.run_id}/outcome@2`]);

    await recordGraphDecision({ index, runId: started.run_id, decisionId: "outcome", round: 2, choice: "exit", decidedBy: "researcher", decidedAt: "2026-08-15T12:25:00+08:00" });
    index = await loadGraphWorkspaceIndex(workspace);
    frontier = currentFrontier(index);
    assert.deepEqual(frontier.eligible_node_ids, terminalDecision ? [] : ["report"]);
    if (!terminalDecision) {
      assert.equal(index.runs[0].run?.status, "active");
      await submitGraphNode({ index, runId: started.run_id, nodeId: "report", outputs: [{ role: "research_report", path: "report.md" }], submittedAt: "2026-08-15T12:30:00+08:00" });
    }
    index = await loadGraphWorkspaceIndex(workspace);
    const record = index.runs[0];
    assert.ok(record?.run && record.graph);
    assert.equal(record.run.status, "complete");
    assert.equal(graphRunCompletionReady(record.run, record.graph, record.nodeEntries.flatMap((entry) => entry.node ? [entry.node] : [])), true);
    assert.equal(currentFrontier(index).eligible_node_ids.length, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("mid-entry run exposes only the confirmed entry node", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-mid-entry-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    const profile = {
      schema_version: "2",
      profile_id: "mid",
      profile_version: "0.1.0",
      capability_registry_version: "0.1.0",
      entries: [{ entry_id: "main", kind: "mid-entry", entry_points: ["research", "report"] }],
      nodes: [
        {
          node_id: "research",
          kind: "capability",
          capability_id: "design-research-question-formulation",
          input_bindings: [],
          expected_outputs: [{ role: "rq_brief", required: true }],
          prerequisites: [],
          required_gate_ids: [],
          required_decision_ids: [],
          multiplicity: "one",
          round_role: null,
        },
        {
          node_id: "report",
          kind: "capability",
          capability_id: "generation-report-compilation",
          input_bindings: [],
          expected_outputs: [{ role: "research_report", required: true }],
          prerequisites: ["research"],
          required_gate_ids: [],
          required_decision_ids: [],
          multiplicity: "one",
          round_role: null,
        },
      ],
      parallel_groups: [],
      subgraphs: [],
      gates: [],
      decisions: [],
      revision_round_template: null,
      override_policy: { failed_gate_requires_decision: true },
    };
    const text = `${stringify(profile)}\n`;
    await writeFile(path.join(workspace, "profiles", "mid.yaml"), text, "utf8");
    let index = await loadGraphWorkspaceIndex(workspace);
    const started = await startGraphRun({ index, profileId: "mid", command: {
      ...startCommand("mid", "report"),
      planned_outputs: [{ role: "research_report", type: "markdown", path: "report.md", purpose: "report" }],
    }, confirmedBy: "researcher" });
    index = await loadGraphWorkspaceIndex(workspace);
    assert.equal(started.status, "started");
    assert.deepEqual(currentFrontier(index).eligible_node_ids, ["report"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("subgraph bindings validate parent roles against child profile", () => {
  const parent = parseCapabilityGraphProfile({
    schema_version: "2",
    profile_id: "parent",
    profile_version: "0.1.0",
    capability_registry_version: "0.1.0",
    entries: [{ entry_id: "main", kind: "end-to-end", node_id: "sub" }],
    nodes: [{
      node_id: "sub",
      kind: "subgraph",
      subgraph_id: "child",
      input_bindings: [{ role: "intent", source: "stable_spec" }],
      expected_outputs: [{ role: "result", required: true }],
      prerequisites: [],
      required_gate_ids: [],
      required_decision_ids: [],
      multiplicity: "one",
      round_role: null,
    }],
    parallel_groups: [],
    subgraphs: [{ subgraph_id: "child", profile_id: "child-profile", profile_version: "0.1.0", entry_id: "main", entry_node_id: "work" }],
    gates: [],
    decisions: [],
    revision_round_template: null,
    override_policy: { failed_gate_requires_decision: true },
  });
  const child = parseCapabilityGraphProfile({
    schema_version: "2",
    profile_id: "child-profile",
    profile_version: "0.1.0",
    capability_registry_version: "0.1.0",
    entries: [{ entry_id: "main", kind: "end-to-end", node_id: "work" }],
    nodes: [{
      node_id: "work",
      kind: "capability",
      capability_id: "design-research-question-formulation",
      input_bindings: [{ role: "intent", source: "stable_spec" }],
      expected_outputs: [{ role: "result", required: true }],
      prerequisites: [],
      required_gate_ids: [],
      required_decision_ids: [],
      multiplicity: "one",
      round_role: null,
    }],
    parallel_groups: [],
    subgraphs: [],
    gates: [],
    decisions: [],
    revision_round_template: null,
    override_policy: { failed_gate_requires_decision: true },
  });
  assert.deepEqual(validateSubgraphNodeBindings(parent, "sub", child), []);
  assert.ok(validateSubgraphNodeBindings(parent, "sub", undefined).some((item) => item.includes("not projected")));
  const wrongChild = parseCapabilityGraphProfile({ ...child, profile_version: "0.2.0" });
  assert.ok(validateSubgraphNodeBindings(parent, "sub", wrongChild).some((item) => item.includes("identity mismatch")));
});

void test("eligible subgraph start creates one deterministic parent-bound child run", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-child-run-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    await writeFile(path.join(workspace, "profiles", "academic-pipeline.yaml"), ACADEMIC_PIPELINE_GRAPH_PROFILE_TEXT, "utf8");
    await writeFile(path.join(workspace, "profiles", "research-main.yaml"), RESEARCH_MAIN_GRAPH_PROFILE_TEXT, "utf8");
    let index = await loadGraphWorkspaceIndex(workspace);
    const parent = await startGraphRun({
      index,
      profileId: "academic-pipeline",
      confirmedBy: "researcher",
      command: {
        schema_version: "2",
        confirmed_at: TIME_0,
        entry_id: "main",
        entry_node_id: "research",
        route_ref: "academic-pipeline:end-to-end",
        prerequisites: [],
        handoff_inputs: [],
        planned_outputs: [
          { role: "research_report", type: "markdown", path: "report.md", purpose: "research report" },
          { role: "manuscript_draft", type: "markdown", path: "draft.md", purpose: "draft" },
          { role: "review_synthesis", type: "markdown", path: "review.md", purpose: "review" },
        ],
        formal_gates: ["research-gate", "write-gate"],
        cost: { effort: "high", interaction: "high" },
      },
    });
    index = await loadGraphWorkspaceIndex(workspace);
    assert.deepEqual(currentFrontier(index).pending_subgraph_starts.map((item) => item.node_id), ["research"]);
    const child = await startGraphChildRun({ index, parentRunId: parent.run_id, nodeId: "research", startedAt: "2026-08-15T12:01:00+08:00" });
    assert.equal(child.run.authorization_origin, "parent_run");
    assert.deepEqual(child.run.parent_binding, { parent_run_id: parent.run_id, parent_node_id: "research", subgraph_id: "research-main" });
    assert.equal(child.run.entry_id, "main");
    assert.equal(child.run.entry_node_id, "research-question");
    assert.deepEqual(child.handoff.outputs.map((item) => item.role), ["research_report"]);
    index = await loadGraphWorkspaceIndex(workspace);
    const duplicate = await startGraphChildRun({ index, parentRunId: parent.run_id, nodeId: "research", startedAt: "2026-08-15T12:02:00+08:00" });
    assert.equal(duplicate.status, "already_started");
    assert.equal(duplicate.run_id, child.run_id);
    assert.equal(index.runs.length, 2);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

for (const delayedHandoff of [false, true]) void test(`nested subgraphs persist ancestor completion with ${delayedHandoff ? "delayed" : "planned"} handoff outputs`, async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-child-completion-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    const leaf = { ...GRAPH_PROFILE, profile_id: "leaf", nodes: [{ ...GRAPH_PROFILE.nodes[0], input_bindings: [] }] };
    const parents = ["parent", "grandparent"].map((profileId, i) => ({
      ...GRAPH_PROFILE,
      profile_id: profileId,
      entries: [{ entry_id: "main", kind: "end-to-end", node_id: "sub" }],
      nodes: [{
        node_id: "sub", kind: "subgraph", subgraph_id: "child", input_bindings: [],
        expected_outputs: [{ role: "result", from_role: i === 0 ? "rq_brief" : "result", required: true }],
        prerequisites: [], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null,
      }],
      subgraphs: [{ subgraph_id: "child", profile_id: i === 0 ? "leaf" : "parent", profile_version: "0.1.0", entry_id: "main", entry_node_id: i === 0 ? "rq" : "sub" }],
    }));
    for (const profile of [leaf, ...parents]) await writeFile(path.join(workspace, "profiles", `${profile.profile_id}.yaml`), stringify(profile), "utf8");
    let index = await loadGraphWorkspaceIndex(workspace);
    const grandparent = await startGraphRun({ index, profileId: "grandparent", confirmedBy: "researcher", command: {
      ...startCommand("grandparent", "sub"),
      planned_outputs: [{ role: "result", type: "markdown", path: "result.md", purpose: "research result" }],
    } });
    index = await loadGraphWorkspaceIndex(workspace);
    const parent = await startGraphChildRun({ index, parentRunId: grandparent.run_id, nodeId: "sub", startedAt: TIME_0 });
    index = await loadGraphWorkspaceIndex(workspace);
    const child = await startGraphChildRun({ index, parentRunId: parent.run_id, nodeId: "sub", startedAt: TIME_0 });
    index = await loadGraphWorkspaceIndex(workspace);
    if (delayedHandoff) {
      await writeGraphHandoff(index, { ...child.handoff, outputs: [] }, "Pending result.");
      index = await loadGraphWorkspaceIndex(workspace);
    }
    await submitGraphNode({ index, runId: child.run_id, nodeId: "rq", outputs: [{ role: "rq_brief", path: "result.md" }], submittedAt: TIME_0 });
    assert.ok(index.runs.every((record) => record.run?.status === "active"));
    index = await loadGraphWorkspaceIndex(workspace);
    assert.equal(index.runs.find((record) => record.run?.run_id === child.run_id)?.run?.status, "complete");
    if (delayedHandoff) {
      assert.ok(index.runs.filter((record) => record.run?.run_id !== child.run_id).every((record) => record.run?.status === "active"));
      const ancestor = index.runs.find((record) => record.run?.run_id === grandparent.run_id);
      assert.ok(ancestor?.runText);
      await writeFile(ancestor.runPath, `${ancestor.runText}\n# external edit\n`, "utf8");
      await assert.rejects(writeGraphHandoff(index, child.handoff, "Result ready."), (error: unknown) => error instanceof GraphRunError && error.code === "graph_write_conflict");
      index = await loadGraphWorkspaceIndex(workspace);
      assert.deepEqual(index.runs.find((record) => record.run?.run_id === child.run_id)?.handoff?.frontmatter.outputs, []);
      assert.ok(index.runs.filter((record) => record.run?.run_id !== child.run_id).every((record) => record.run?.status === "active"));
      await writeGraphHandoff(index, child.handoff, "Result ready.");
      index = await loadGraphWorkspaceIndex(workspace);
    }
    assert.ok(index.runs.every((record) => record.run?.status === "complete"));
    assert.ok(index.runs.filter((record) => record.run?.run_id !== child.run_id).every((record) => record.nodeEntries.length === 0));
    await writeGraphHandoff(index, child.handoff, "Updated explanation.");
    index = await loadGraphWorkspaceIndex(workspace);
    assert.ok(index.runs.every((record) => record.run?.status === "complete"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("run completion requires all one-shot nodes and closed revision template", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-completion-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    await writeFile(path.join(workspace, "profiles", "revision-loop.yaml"), REVISION_TEXT, "utf8");
    let index = await loadGraphWorkspaceIndex(workspace);
    const started = await startGraphRun({ index, profileId: "revision-loop", command: startCommand("revision-loop", "revision"), confirmedBy: "researcher" });
    index = await loadGraphWorkspaceIndex(workspace);
    let record = index.runs[0];
    assert.ok(record?.run && record.graph);
    assert.equal(graphRunCompletionReady(record.run, record.graph, []), false);

    await submitGraphNode({ index, runId: started.run_id, nodeId: "revision", round: 1, outputs: [{ role: "revised_manuscript", path: "revised-1.md" }], submittedAt: "2026-08-15T12:10:00+08:00" });
    index = await loadGraphWorkspaceIndex(workspace);
    record = index.runs[0];
    assert.ok(record?.run && record.graph);
    assert.equal(graphRunCompletionReady(record.run, record.graph, record.nodeEntries.flatMap((entry) => entry.node ? [entry.node] : [])), false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("revision rounds use distinct node files and scan without duplicate diagnostics", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-revision-scan-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    await writeFile(path.join(workspace, "profiles", "revision-loop.yaml"), REVISION_TEXT, "utf8");
    let index = await loadGraphWorkspaceIndex(workspace);
    const started = await startGraphRun({ index, profileId: "revision-loop", command: startCommand("revision-loop", "revision"), confirmedBy: "researcher" });
    index = await loadGraphWorkspaceIndex(workspace);
    await submitGraphNode({ index, runId: started.run_id, nodeId: "revision", round: 1, outputs: [{ role: "revised_manuscript", path: "revised-1.md" }], submittedAt: "2026-08-15T12:10:00+08:00" });
    index = await loadGraphWorkspaceIndex(workspace);
    await recordGraphDecision({ index, runId: started.run_id, decisionId: "outcome", round: 1, choice: "continue", decidedBy: "researcher", decidedAt: "2026-08-15T12:15:00+08:00" });
    index = await loadGraphWorkspaceIndex(workspace);
    await submitGraphNode({ index, runId: started.run_id, nodeId: "revision", round: 2, outputs: [{ role: "revised_manuscript", path: "revised-2.md" }], submittedAt: "2026-08-15T12:20:00+08:00" });
    index = await loadGraphWorkspaceIndex(workspace);
    assert.equal(index.diagnostics.filter((item) => item.code === "node_id_duplicate").length, 0);
    assert.equal(index.runs[0].nodeEntries.filter((item) => item.node?.node_id === "revision").length, 2);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("frozen profile hash is used for run identity", () => {
  assert.equal(sha256(REVISION_TEXT).length, 64);
});
