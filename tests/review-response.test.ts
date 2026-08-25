import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { authorCapabilityPackage } from "../src/arsu-converter/authoring/author.js";
import { REVISION_MASTER_AUTHORING_OPTIONS, REVISION_MASTER_AUTHORING_SOURCES } from "../src/arsu-converter/authoring/revision-master-sources.js";
import { loadCapabilityRegistry, validateGraphAgainstCapabilityRegistry } from "../src/capabilities/registry.js";
import { parseCapabilityGraphProfile, findUnreachableGraphNodes } from "../src/core/contracts/capability-graph.js";
import { REVIEW_RESPONSE_GRAPH_PROFILE, REVIEW_RESPONSE_GRAPH_PROFILE_TEXT } from "../src/arsu-converter/workflow/graph-profiles/review-response.js";
import {
  evaluateGraphFrontier,
  graphRunCompletionReady,
  recordGraphDecision,
  recordGraphGate,
  startGraphRun,
  submitGraphNode as submitGraphNodeRuntime,
  type SubmitGraphNodeInput,
} from "../src/core/runtime/graph-run.js";

import { loadGraphWorkspaceIndex } from "../src/core/runtime/graph-workspace-index.js";
import { graphTestCapabilityRegistry, writeBaseWorkspace } from "./helpers/graph-workspace.js";

async function submitGraphNode(input: Omit<SubmitGraphNodeInput, "capabilityRegistry">) {
  return submitGraphNodeRuntime({
    ...input,
    capabilityRegistry: await graphTestCapabilityRegistry(input.index, input.runId),
  });
}

const root = process.cwd();

void test("review-response capability packages are authored and registered", async () => {
  const registry = await loadCapabilityRegistry();
  for (const capabilityId of [
    "design-review-response-intake",
    "analysis-review-response-manuscript-analysis",
    "transform-review-response-comment-atomization",
    "design-review-response-workboard-planning",
    "generation-review-response-round",
  ]) {
    const registered = registry.capabilities.get(capabilityId);
    assert.ok(registered, capabilityId);
    assert.equal(registered.manifest.provenance.origin, "vendor-derived");
    assert.ok(registered.manifest.provenance.extraction_artifact_ids?.some((id) => id.startsWith("RM-")));
    assert.match(await readFile(path.join(registered.packageRoot, "SKILL.md"), "utf8"), /## Completion/);
  }
});

void test("review-response graph profile resolves and declares the revision loop", async () => {
  const graph = parseCapabilityGraphProfile(REVIEW_RESPONSE_GRAPH_PROFILE);
  assert.equal(graph.profile_id, "review-response");
  assert.deepEqual(findUnreachableGraphNodes(graph), []);
  const registry = await loadCapabilityRegistry();
  assert.deepEqual(validateGraphAgainstCapabilityRegistry(registry, graph), []);
  assert.deepEqual(graph.gates.map((gate) => gate.gate_id), [
    "review-response-comment-coverage",
    "review-response-strategy",
    "review-response-evidence",
    "review-response-response-coverage",
    "review-response-final-assembly",
  ]);
  assert.deepEqual(graph.revision_round_template, {
    revision_node_id: "round",
    review_node_id: "outcome",
    continue_option_id: "continue",
    exit_option_id: "complete",
  });
  assert.equal(REVIEW_RESPONSE_GRAPH_PROFILE_TEXT.includes("review-response-outcome"), true);
});

void test("review-response graph run continues and completes through round-scoped decisions", async () => {
  const temp = await mkdtemp(path.join(tmpdir(), "researchspec-review-response-"));
  try {
    const workspace = await writeBaseWorkspace(temp);
    await writeFile(path.join(workspace, "profiles", "review-response.yaml"), REVIEW_RESPONSE_GRAPH_PROFILE_TEXT, "utf8");
    let index = await loadGraphWorkspaceIndex(workspace);
    const started = await startGraphRun({
      index,
      profileId: "review-response",
      command: {
        schema_version: "2",
        confirmed_at: "2026-08-16T12:00:00+08:00",
        entry_id: "full",
        entry_node_id: "intake",
        prerequisites: [],
        handoff_inputs: [],
        planned_outputs: [
          { role: "working_manuscript", type: "file", path: "working.tex", purpose: "working manuscript" },
          { role: "response_markdown", type: "file", path: "response.md", purpose: "response letter" },
        ],
        formal_gates: [
          "review-response-comment-coverage",
          "review-response-strategy",
          "review-response-evidence",
          "review-response-response-coverage",
          "review-response-final-assembly",
        ],
        cost: { effort: "medium", interaction: "long" },
      },
      confirmedBy: "researcher",
    });
    const runId = started.run_id;

    async function frontier() {
      index = await loadGraphWorkspaceIndex(workspace);
      assert.ok(index.runs[0]?.run && index.runs[0]?.graph);
      return evaluateGraphFrontier(index.runs[0].run, index.runs[0].graph, index.runs[0].nodeEntries.flatMap((entry) => entry.node ? [entry.node] : []));
    }
    async function submit(nodeId: string, round: number | undefined, roles: string[]) {
      index = await loadGraphWorkspaceIndex(workspace);
      await submitGraphNode({ index, runId, nodeId, round, outputs: roles.map((role) => ({ role, path: `${nodeId}-${role}.md` })), submittedAt: "2026-08-16T12:05:00+08:00" });
    }
    async function gate(gateId: string, round?: number) {
      index = await loadGraphWorkspaceIndex(workspace);
      await recordGraphGate({ index, runId, gateId, round, verdict: "pass", confirmedBy: "researcher", confirmedAt: "2026-08-16T12:06:00+08:00", summary: "confirmed" });
    }
    async function decide(round: number, choice: string) {
      index = await loadGraphWorkspaceIndex(workspace);
      await recordGraphDecision({ index, runId, decisionId: "review-response-outcome", round, choice, decidedBy: "researcher", decidedAt: "2026-08-16T12:07:00+08:00" });
    }

    assert.deepEqual((await frontier()).eligible_nodes.map((item) => item.node_id), ["intake"]);
    await submit("intake", undefined, ["review_response_workspace", "intake_report"]);
    await submit("manuscript-analysis", undefined, ["manuscript_structure_summary"]);
    await submit("comment-atomization", undefined, ["atomic_comment_list", "comment_coverage_report"]);
    await gate("review-response-comment-coverage");
    await submit("workboard", undefined, ["review_response_workboard"]);
    await gate("review-response-strategy");
    assert.deepEqual((await frontier()).eligible_nodes.map((item) => `${item.node_id}@${String(item.round ?? 1)}`), ["round@1"]);

    await submit("round", 1, ["working_manuscript", "response_markdown", "response_latex", "round_summary"]);
    await gate("review-response-evidence", 1);
    await gate("review-response-response-coverage", 1);
    await gate("review-response-final-assembly", 1);
    assert.deepEqual((await frontier()).pending_decisions, [`decision:${runId}/review-response-outcome@1`]);

    await decide(1, "continue");
    assert.deepEqual((await frontier()).eligible_nodes.map((item) => `${item.node_id}@${String(item.round ?? 1)}`), ["round@2"]);
    await submit("round", 2, ["working_manuscript", "response_markdown", "response_latex", "round_summary"]);
    await gate("review-response-evidence", 2);
    await gate("review-response-response-coverage", 2);
    await gate("review-response-final-assembly", 2);
    await decide(2, "complete");

    index = await loadGraphWorkspaceIndex(workspace);
    assert.ok(index.runs[0]?.run && index.runs[0]?.graph);
    const nodes = index.runs[0].nodeEntries.flatMap((entry) => entry.node ? [entry.node] : []);
    assert.equal(graphRunCompletionReady(index.runs[0].run, index.runs[0].graph, nodes), true);
    assert.deepEqual((await frontier()).eligible_nodes, []);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

void test("revision-master authoring is deterministic and idempotent", async () => {
  const temp = await mkdtemp(path.join(tmpdir(), "researchspec-revision-authoring-"));
  try {
    for (const source of REVISION_MASTER_AUTHORING_SOURCES) {
      await authorCapabilityPackage(temp, source, REVISION_MASTER_AUTHORING_OPTIONS);
    }
    const before = new Map<string, string>();
    for (const source of REVISION_MASTER_AUTHORING_SOURCES) {
      before.set(source.capability_id, await readFile(path.join(temp, source.capability_id, "SKILL.md"), "utf8"));
    }
    for (const source of REVISION_MASTER_AUTHORING_SOURCES) {
      await authorCapabilityPackage(temp, source, REVISION_MASTER_AUTHORING_OPTIONS);
      assert.equal(await readFile(path.join(temp, source.capability_id, "SKILL.md"), "utf8"), before.get(source.capability_id));
    }
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

void test("package scripts expose the revision-master capability authoring entrypoint", async () => {
  const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8")) as { scripts: Record<string, string> };
  assert.match(pkg.scripts["revision-master:author"] ?? "", /revision-master-cli\.js/);
  assert.equal("revision-master:convert" in pkg.scripts, false);
  assert.equal("revision-master:check" in pkg.scripts, false);
});
