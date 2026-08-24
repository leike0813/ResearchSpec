import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { stringify } from "yaml";

import {
  evaluateGraphFrontier,
  GraphRunError,
  overrideGraphGate,
  recordGraphGate,
  startGraphRun,
  submitGraphNode,
  type GraphFrontier,
} from "../src/core/runtime/graph-run.js";
import { loadGraphWorkspaceIndex } from "../src/core/runtime/graph-workspace-index.js";
import { writeBaseWorkspace } from "./helpers/graph-workspace.js";

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
      node_id: "report",
      kind: "capability",
      capability_id: "generation-report-compilation",
      input_bindings: [],
      expected_outputs: [{ role: "research_report", required: true }],
      prerequisites: ["rq-gate"],
      required_gate_ids: ["rq-gate"],
      required_decision_ids: [],
      multiplicity: "one",
      round_role: null,
    },
  ],
  parallel_groups: [],
  subgraphs: [],
  gates: [{ gate_id: "rq-gate", owner_node_id: "rq-gate", policy: "required", verdicts: ["pass", "fail"] }],
  decisions: [],
  revision_round_template: null,
  override_policy: { failed_gate_requires_decision: true },
};

const GATED_TEXT = `${stringify(GATED_PROFILE)}\n`;

function startCommand(): Record<string, unknown> {
  return {
    schema_version: "2",
    confirmed_at: TIME_0,
    entry_id: "main",
    entry_node_id: "rq",
    prerequisites: [],
    handoff_inputs: [],
    planned_outputs: [
      { role: "rq_brief", type: "markdown", path: "rq-brief.md", purpose: "research question brief" },
      { role: "research_report", type: "markdown", path: "report.md", purpose: "research report" },
    ],
    formal_gates: ["rq-gate"],
    cost: { effort: "low", interaction: "low" },
  };
}

function currentFrontier(index: Awaited<ReturnType<typeof loadGraphWorkspaceIndex>>): GraphFrontier {
  const record = index.runs[0];
  assert.ok(record?.run);
  assert.ok(record.graph);
  return evaluateGraphFrontier(record.run, record.graph, record.nodeEntries.flatMap((entry) => entry.node ? [entry.node] : []));
}

async function fixture(): Promise<{ root: string; workspace: string; runId: string; cleanup: () => Promise<void> }> {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-graph-conflict-"));
  const workspace = await writeBaseWorkspace(root);
  await writeFile(path.join(workspace, "profiles", "gated.yaml"), GATED_TEXT, "utf8");
  let index = await loadGraphWorkspaceIndex(workspace);
  const started = await startGraphRun({ index, profileId: "gated", command: startCommand(), confirmedBy: "researcher" });
  index = await loadGraphWorkspaceIndex(workspace);
  await submitGraphNode({ index, runId: started.run_id, nodeId: "rq", outputs: [{ role: "rq_brief", path: "rq-brief.md" }], submittedAt: "2026-08-15T12:10:00+08:00" });
  return { root, workspace, runId: started.run_id, cleanup: () => rm(root, { recursive: true, force: true }) };
}

void test("submit rejects a node file that appeared after workspace scan", async () => {
  const { workspace, runId, cleanup } = await fixture();
  try {
    let index = await loadGraphWorkspaceIndex(workspace);
    await recordGraphGate({ index, runId, gateId: "rq-gate", verdict: "pass", confirmedBy: "researcher", confirmedAt: "2026-08-15T12:15:00+08:00", summary: "Ready." });
    index = await loadGraphWorkspaceIndex(workspace);
    const nodesDirectory = index.runs[0].nodesDirectory;
    await writeFile(path.join(nodesDirectory, "report.yaml"), stringify({
      schema_version: "2",
      node_instance_id: `${runId}.report`,
      run_id: runId,
      node_id: "report",
      state: "pending",
      updated_at: "2026-08-15T12:20:00+08:00",
      outputs: [],
      gate_attempts: [],
      decisions: [],
    }), "utf8");
    await assert.rejects(
      submitGraphNode({ index, runId, nodeId: "report", outputs: [{ role: "research_report", path: "report.md" }], submittedAt: "2026-08-15T12:25:00+08:00" }),
      /node_create_conflict|Node file appeared/,
    );
  } finally { await cleanup(); }
});

void test("gate writer rejects a node file changed after workspace scan", async () => {
  const { workspace, runId, cleanup } = await fixture();
  try {
    let index = await loadGraphWorkspaceIndex(workspace);
    await recordGraphGate({ index, runId, gateId: "rq-gate", verdict: "fail", confirmedBy: "researcher", confirmedAt: "2026-08-15T12:15:00+08:00", summary: "Not ready." });
    index = await loadGraphWorkspaceIndex(workspace);
    const nodePath = index.runs[0].nodeEntries.find((entry) => entry.node?.node_id === "rq-gate")?.filePath;
    assert.ok(nodePath);
    await writeFile(nodePath, `${await import("node:fs/promises").then(({ readFile }) => readFile(nodePath, "utf8"))}\n# external drift\n`, "utf8");
    await assert.rejects(
      recordGraphGate({ index, runId, gateId: "rq-gate", verdict: "pass", confirmedBy: "researcher", confirmedAt: "2026-08-15T12:20:00+08:00", summary: "Ready now." }),
      /node_write_conflict|Node file changed/,
    );
  } finally { await cleanup(); }
});

void test("ambiguous duplicate node instances are rejected", async () => {
  const { workspace, runId, cleanup } = await fixture();
  try {
    const index = await loadGraphWorkspaceIndex(workspace);
    const nodesDirectory = index.runs[0].nodesDirectory;
    const base = {
      schema_version: "2",
      run_id: runId,
      node_id: "report",
      state: "pending",
      updated_at: "2026-08-15T12:20:00+08:00",
      outputs: [],
      gate_attempts: [],
      decisions: [],
    };
    await writeFile(path.join(nodesDirectory, "report-a.yaml"), stringify({ ...base, node_instance_id: `${runId}.report.a` }), "utf8");
    await writeFile(path.join(nodesDirectory, "report-b.yaml"), stringify({ ...base, node_instance_id: `${runId}.report.b` }), "utf8");
    const reloaded = await loadGraphWorkspaceIndex(workspace);
    await assert.rejects(
      submitGraphNode({ index: reloaded, runId, nodeId: "report", outputs: [{ role: "research_report", path: "report.md" }], submittedAt: "2026-08-15T12:25:00+08:00" }),
      /node_identity_ambiguous|Multiple node instances/,
    );
  } finally { await cleanup(); }
});

void test("failed Gate override is embedded per Gate and unlocks downstream", async () => {
  const { workspace, runId, cleanup } = await fixture();
  try {
    let index = await loadGraphWorkspaceIndex(workspace);
    await recordGraphGate({ index, runId, gateId: "rq-gate", verdict: "fail", confirmedBy: "researcher", confirmedAt: "2026-08-15T12:15:00+08:00", summary: "Not ready." });
    index = await loadGraphWorkspaceIndex(workspace);
    assert.ok(currentFrontier(index).blockers.some((item) => item.code === "gate_failed"));

    await overrideGraphGate({ index, runId, gateId: "rq-gate", approvedBy: "researcher", approvedAt: "2026-08-15T12:20:00+08:00", reason: "Failure is an evidence-scope artifact; approved." });
    index = await loadGraphWorkspaceIndex(workspace);
    const owner = index.runs[0].nodeEntries.find((entry) => entry.node?.node_id === "rq-gate")?.node;
    assert.ok(owner?.gate_overrides?.some((item) => item.gate_id === "rq-gate"));
    assert.equal(currentFrontier(index).blockers.length, 0);
    assert.deepEqual(currentFrontier(index).eligible_node_ids, ["report"]);

    await assert.rejects(
      overrideGraphGate({ index, runId, gateId: "rq-gate", approvedBy: "researcher", approvedAt: "2026-08-15T12:21:00+08:00", reason: "Duplicate override." }),
      (error: unknown) => error instanceof GraphRunError && error.code === "gate_override_exists",
    );
  } finally { await cleanup(); }
});
