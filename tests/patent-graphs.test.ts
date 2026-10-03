import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { parse as parseYaml, stringify } from "yaml";

import type { CapabilityGraphProfile } from "../src/core/contracts/capability-graph.js";
import { findUnreachableGraphNodes, parseCapabilityGraphProfile } from "../src/core/contracts/capability-graph.js";
import {
  loadCapabilityRegistry,
  validateGraphAgainstCapabilityRegistry,
} from "../src/capabilities/registry.js";
import { AUTHORED_GRAPH_PROFILES } from "../src/arsu-converter/workflow/graph-profiles/index.js";
import { PATENT_GRAPH_PROFILES } from "../src/arsu-converter/workflow/graph-profiles/patent.js";
import { loadGraphWorkspaceIndex } from "../src/core/runtime/graph-workspace-index.js";
import {
  evaluateGraphFrontier,
  graphChildRunSnapshots,
  graphRunCompletionReady,
  recordGraphDecision,
  recordGraphGate,
  overrideGraphGate,
  resolveGraphNodeInputs,
  startGraphChildRun,
  startGraphRun,
  submitGraphNode,
  validateSubgraphNodeBindings,
  writeGraphHandoff,
  type GraphFrontier,
} from "../src/core/runtime/graph-run.js";
import { writeBaseWorkspace } from "./helpers/graph-workspace.js";
import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

const TIME = "2026-10-03T12:00:00+08:00";

const PATENT_CAPABILITY_IDS = [
  "analysis-patent-claim-chart",
  "analysis-patent-prior-art",
  "analysis-patent-reading",
  "check-patent-application",
  "check-patent-disclosure",
  "check-patent-docket",
  "check-patent-oa-response",
  "design-patent-intake",
  "design-patent-invention-mining",
  "design-patent-protection-layout",
  "discovery-patent-exam-policy",
  "discovery-patent-search",
  "generation-patent-application",
  "generation-patent-disclosure",
  "generation-patent-map",
  "generation-patent-oa-response",
  "transform-patent-docket-revision",
  "transform-patent-research-evidence",
] as const;

function authoredPatents(): readonly { profile: CapabilityGraphProfile; projection: string }[] {
  return PATENT_GRAPH_PROFILES;
}

function patentProfile(profileId: string): CapabilityGraphProfile {
  const found = PATENT_GRAPH_PROFILES.find((item) => item.profile.profile_id === profileId);
  assert.ok(found, `missing patent profile ${profileId}`);
  return found.profile;
}

function frontierOf(frontier: GraphFrontier): { eligible: string[]; gates: string[]; decisions: string[]; subgraphs: string[] } {
  return {
    eligible: frontier.eligible_node_ids,
    gates: frontier.pending_gates,
    decisions: frontier.pending_decisions,
    subgraphs: frontier.pending_subgraph_starts.map((item) => item.node_id),
  };
}

type WorkspaceIndex = Awaited<ReturnType<typeof loadGraphWorkspaceIndex>>;

function frontierFor(index: WorkspaceIndex, runId: string): GraphFrontier {
  const record = index.runs.find((item) => item.run?.run_id === runId);
  assert.ok(record?.run && record.graph);
  return evaluateGraphFrontier(record.run, record.graph, record.nodeEntries.flatMap((entry) => entry.node ? [entry.node] : []), graphChildRunSnapshots(index));
}

async function reload(workspace: string): Promise<WorkspaceIndex> {
  return loadGraphWorkspaceIndex(workspace);
}

function resolutionFor(index: WorkspaceIndex, runId: string, nodeId: string, round?: number): ReturnType<typeof resolveGraphNodeInputs> {
  const record = index.runs.find((item) => item.run?.run_id === runId);
  assert.ok(record?.run && record.graph && record.handoff?.frontmatter);
  return resolveGraphNodeInputs({
    run: record.run,
    graph: record.graph,
    handoff: record.handoff.frontmatter,
    nodes: record.nodeEntries.flatMap((entry) => entry.node ? [entry.node] : []),
    childRuns: graphChildRunSnapshots(index),
    nodeId,
    round,
  });
}

async function writeFixture(root: string, relativePath: string, content: string): Promise<void> {
  const absolute = path.join(root, ...relativePath.split("/"));
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, content, "utf8");
}

void test("patent graph profiles declare schema-2 identities, versions and deterministic YAML projections", () => {
  assert.equal(PATENT_GRAPH_PROFILES.length, 7);
  assert.deepEqual(
    PATENT_GRAPH_PROFILES.map((item) => item.profile.profile_id).sort(),
    ["patent-application", "patent-disclosure", "patent-docket", "patent-informed-paper", "patent-intelligence", "patent-oa", "research-to-patent"],
  );
  for (const { profile, projection } of authoredPatents()) {
    assert.equal(profile.schema_version, "2");
    assert.equal(profile.profile_version, "0.1.0");
    assert.equal(profile.capability_registry_version, "0.1.0");
    assert.equal(projection, stringify(profile));
    for (const entry of profile.entries) assert.equal("route_ref" in entry, false);
    assert.deepEqual(parseCapabilityGraphProfile(parseYaml(projection)), parseCapabilityGraphProfile(JSON.parse(JSON.stringify(profile))));
  }
});

void test("every patent profile is a reachable graph accepted by its capability contract", async () => {
  const registry = await loadCapabilityRegistry();
  for (const { profile } of authoredPatents()) {
    const parsed = parseCapabilityGraphProfile(profile);
    assert.deepEqual(findUnreachableGraphNodes(parsed), [], `${parsed.profile_id} has unreachable nodes`);
    assert.deepEqual(validateGraphAgainstCapabilityRegistry(registry, parsed), [], `${parsed.profile_id} violates the capability contract`);
  }
});

void test("the seven profiles reference exactly the eighteen fixed patent capabilities", () => {
  const referenced = new Set<string>();
  for (const { profile } of authoredPatents()) {
    for (const node of profile.nodes) if (node.capability_id !== undefined) referenced.add(node.capability_id);
  }
  assert.deepEqual([...referenced].sort(), [...PATENT_CAPABILITY_IDS].sort());
});

void test("patent profiles bind the declared material roles and renamed child outputs", () => {
  const disclosure = patentProfile("patent-disclosure");
  const intake = disclosure.nodes.find((node) => node.node_id === "intake");
  assert.deepEqual(intake?.input_bindings, [
    { role: "technical_materials", source: "handoff" },
  ]);
  assert.deepEqual(intake?.expected_outputs, [{ role: "patent_case", required: true }]);
  const layout = disclosure.nodes.find((node) => node.node_id === "protection-layout");
  assert.equal(layout?.multiplicity, "optional");
  assert.deepEqual(layout?.input_bindings, [{ role: "disclosure_bundle", source: "node_output", from_node_id: "disclosure" }]);
  assert.deepEqual(disclosure.decisions[0]?.options, [
    { option_id: "include-layout", unlocks: ["protection-layout", "layout-gate"] },
    { option_id: "omit-layout", unlocks: [] },
  ]);

  const intelligence = patentProfile("patent-intelligence");
  assert.deepEqual(intelligence.nodes.find((node) => node.node_id === "reading")?.input_bindings, [
    { role: "patent_corpus", source: "node_output", from_node_id: "search", from_role: "search_results" },
  ]);
  assert.equal(intelligence.nodes.find((node) => node.node_id === "claim-chart")?.multiplicity, "optional");
  assert.deepEqual(intelligence.nodes.find((node) => node.node_id === "exam-policy")?.input_bindings, []);

  const docket = patentProfile("patent-docket");
  assert.deepEqual(docket.nodes.find((node) => node.node_id === "disclosure")?.expected_outputs, [
    { role: "patent_case", from_role: "patent_case", required: true },
    { role: "disclosure_bundle", from_role: "disclosure_bundle", required: true },
  ]);
  assert.equal(docket.nodes.find((node) => node.node_id === "revision")?.multiplicity, "repeatable");
  assert.equal(docket.revision_round_template?.review_node_id, "docket-outcome");
  assert.deepEqual(docket.nodes.find((node) => node.node_id === "application")?.prerequisites, ["disclosure-gate"]);

  const informed = patentProfile("patent-informed-paper");
  assert.deepEqual(informed.nodes.find((node) => node.node_id === "writing")?.input_bindings, [
    { role: "annotated_bibliography", source: "node_output", from_node_id: "bridge", from_role: "annotated_bibliography" },
    { role: "synthesis_report", source: "node_output", from_node_id: "bridge", from_role: "synthesis_report" },
  ]);
});

void test("composition child boundaries map every declared parent binding", () => {
  const registry = [...AUTHORED_GRAPH_PROFILES, ...PATENT_GRAPH_PROFILES];
  const byId = new Map(registry.map((item) => [item.profile.profile_id, item.profile] as const));
  const pairs: Array<[string, string, string]> = [
    ["patent-docket", "disclosure", "patent-disclosure"],
    ["patent-docket", "application", "patent-application"],
    ["research-to-patent", "research", "research-main"],
    ["research-to-patent", "patent", "patent-docket"],
    ["patent-informed-paper", "research", "research-main"],
    ["patent-informed-paper", "intelligence", "patent-intelligence"],
    ["patent-informed-paper", "writing", "academic-paper"],
  ];
  for (const [parentId, nodeId, childId] of pairs) {
    const parent = byId.get(parentId);
    const child = byId.get(childId);
    assert.ok(parent && child, `missing profile pair ${parentId} -> ${childId}`);
    assert.deepEqual(validateSubgraphNodeBindings(parent, nodeId, child), [], `${parentId}/${nodeId} does not load ${childId} cleanly`);
  }
});

void test("patent-informed writing waits for both sources and consumes the bridge's files", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-patent-composition-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    for (const { profile, projection } of AUTHORED_GRAPH_PROFILES) {
      await writeFile(path.join(workspace, "profiles", `${profile.profile_id}.yaml`), projection, "utf8");
    }
    await writeFixture(root, "patent/search-request.md", "Selected search scope.\n");
    const registry = await loadCapabilityRegistry();
    let index = await reload(workspace);
    const started = await startGraphRun({ index, capabilityRegistry: registry, profileId: "patent-informed-paper", confirmedBy: "researcher", command: {
      schema_version: "2", confirmed_at: TIME, entry_id: "main", entry_node_id: "source-gate", prerequisites: [],
      handoff_inputs: [{ role: "search_request", type: "markdown", path: "patent/search-request.md", purpose: "Selected patent sources." }],
      planned_outputs: ["research_report", "annotated_bibliography", "synthesis_report", "graded_sources", "patent_notes", "manuscript_draft"].map((role) => ({ role, type: "markdown", path: `work/${role}.md`, purpose: role })),
      formal_gates: ["patent-informed-source-scope"], cost: { effort: "high", interaction: "iterative" },
    } });
    index = await reload(workspace);
    assert.deepEqual(frontierFor(index, started.run_id).pending_subgraph_starts, []);
    await recordGraphGate({ index, runId: started.run_id, gateId: "patent-informed-source-scope", verdict: "pass", confirmedBy: "researcher", confirmedAt: TIME, summary: "Source scope confirmed." });
    index = await reload(workspace);
    assert.deepEqual(frontierFor(index, started.run_id).pending_subgraph_starts.map((entry) => entry.node_id).sort(), ["intelligence", "research"]);
    for (const nodeId of ["research", "intelligence"]) {
      const child = await startGraphChildRun({ index, capabilityRegistry: registry, parentRunId: started.run_id, nodeId, startedAt: TIME });
      assert.equal(child.run.authorization_origin, "parent_run");
      if (nodeId === "research") assert.ok(child.handoff.outputs.some((entry) => entry.role === "graded_sources"));
      index = await reload(workspace);
    }
    assert.equal(frontierFor(index, started.run_id).eligible_node_ids.includes("bridge"), false);
    await assert.rejects(startGraphChildRun({ index, capabilityRegistry: registry, parentRunId: started.run_id, nodeId: "writing", startedAt: TIME }), { code: "node_not_eligible" });

    // A completed semantic bridge fixture isolates the writing input contract;
    // it does not certify completion of either source subgraph.
    const record = index.runs.find((entry) => entry.run?.run_id === started.run_id);
    assert.ok(record?.run && record.graph && record.handoff);
    const resolved = resolveGraphNodeInputs({ run: record.run, graph: record.graph, handoff: record.handoff.frontmatter, nodeId: "writing", nodes: [{
      schema_version: "2", node_instance_id: `${started.run_id}.bridge`, run_id: started.run_id, node_id: "bridge", state: "complete", updated_at: TIME,
      outputs: [{ role: "annotated_bibliography", path: "work/merged-bibliography.md" }, { role: "synthesis_report", path: "work/merged-synthesis.md" }], gate_attempts: [], gate_overrides: [], decisions: [],
    }] });
    assert.deepEqual(resolved.map((entry) => [entry.role, entry.path]), [
      ["annotated_bibliography", "work/merged-bibliography.md"], ["synthesis_report", "work/merged-synthesis.md"],
    ]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("patent docket runs disclosure, application and a bounded revision round before completing", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-patent-docket-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    for (const profileId of ["patent-disclosure", "patent-application", "patent-docket"]) {
      await writeFile(path.join(workspace, "profiles", `${profileId}.yaml`), patentProfile(profileId) === undefined ? "" : PATENT_GRAPH_PROFILES.find((item) => item.profile.profile_id === profileId)?.projection ?? "", "utf8");
    }
    const registry = await loadCapabilityRegistry();
    await writeFixture(root, "materials/tech.md", "Technical materials.\n");

    const command = {
      schema_version: "2",
      confirmed_at: TIME,
      entry_id: "main",
      entry_node_id: "disclosure",
      prerequisites: [],
      handoff_inputs: [
        { role: "technical_materials", type: "markdown", path: "materials/tech.md", purpose: "Technical materials." },
      ],
      planned_outputs: [
        { role: "patent_case", type: "markdown", path: "patent/case.md", purpose: "Patent case descriptor." },
        { role: "disclosure_bundle", type: "markdown", path: "patent/disclosure.md", purpose: "Disclosure bundle." },
        { role: "application_bundle", type: "markdown", path: "patent/application.md", purpose: "Application bundle." },
      ],
      formal_gates: ["patent-docket-disclosure", "patent-docket-complete"],
      cost: { effort: "high", interaction: "iterative" },
    };

    let index = await reload(workspace);
    const docket = await startGraphRun({ index, capabilityRegistry: registry, profileId: "patent-docket", confirmedBy: "researcher", command });
    index = await reload(workspace);
    assert.deepEqual(frontierOf(frontierFor(index, docket.run_id)).subgraphs, ["disclosure"]);

    const disclosureChild = await startGraphChildRun({ index, capabilityRegistry: registry, parentRunId: docket.run_id, nodeId: "disclosure", startedAt: TIME });
    index = await reload(workspace);
    assert.deepEqual(disclosureChild.handoff.inputs.map((item) => item.role), ["technical_materials"]);
    assert.deepEqual(disclosureChild.handoff.outputs.map((item) => item.role).sort(), ["disclosure_bundle", "patent_case"]);

    const disclosureSteps: Array<[string, Array<[string, string]>]> = [
      ["intake", [["patent_case", "patent/case.md"]]],
      ["mining", [["invention_brief", "patent/invention.md"], ["search_request", "patent/search-request.md"]]],
      ["search", [["search_results", "patent/search-results.md"]]],
      ["prior-art", [["prior_art_report", "patent/prior-art.md"]]],
      ["disclosure", [["disclosure_bundle", "patent/disclosure.md"]]],
      ["check-disclosure", [["disclosure_review", "patent/disclosure-review.md"]]],
    ];
    for (const [nodeId, outputs] of disclosureSteps) {
      for (const [, outputPath] of outputs) await writeFixture(root, outputPath, `${nodeId}\n`);
      await submitGraphNode({ index, capabilityRegistry: registry, runId: disclosureChild.run_id, nodeId, outputs: outputs.map(([role, outputPath]) => ({ role, path: outputPath })), submittedAt: TIME });
      index = await reload(workspace);
    }
    assert.deepEqual(frontierFor(index, disclosureChild.run_id).pending_gates, [`gate:${disclosureChild.run_id}/patent-disclosure-complete`]);
    await recordGraphGate({ index, runId: disclosureChild.run_id, gateId: "patent-disclosure-complete", verdict: "pass", confirmedBy: "researcher", confirmedAt: TIME, summary: "Disclosure approved." });
    index = await reload(workspace);
    await recordGraphDecision({ index, runId: disclosureChild.run_id, decisionId: "patent-disclosure-layout", choice: "omit-layout", decidedBy: "researcher", decidedAt: TIME });
    index = await reload(workspace);
    const disclosureRecord = index.runs.find((item) => item.run?.run_id === disclosureChild.run_id);
    assert.equal(disclosureRecord?.run?.status, "complete");

    assert.deepEqual(frontierFor(index, docket.run_id).pending_gates, [`gate:${docket.run_id}/patent-docket-disclosure`]);
    await recordGraphGate({ index, runId: docket.run_id, gateId: "patent-docket-disclosure", verdict: "pass", confirmedBy: "researcher", confirmedAt: TIME, summary: "Disclosure suite approved for application." });
    index = await reload(workspace);
    assert.deepEqual(frontierOf(frontierFor(index, docket.run_id)).subgraphs, ["application"]);

    const applicationChild = await startGraphChildRun({ index, capabilityRegistry: registry, parentRunId: docket.run_id, nodeId: "application", startedAt: TIME });
    index = await reload(workspace);
    assert.deepEqual(applicationChild.handoff.inputs.map((item) => item.role), ["disclosure_bundle"]);
    assert.equal(applicationChild.handoff.inputs[0]?.path, "patent/disclosure.md");
    for (const [nodeId, outputs] of [
      ["application", [["application_bundle", "patent/application.md"]]],
      ["check-application", [["application_review", "patent/application-review.md"]]],
    ] as Array<[string, Array<[string, string]>]>) {
      for (const [, outputPath] of outputs) await writeFixture(root, outputPath, `${nodeId}\n`);
      await submitGraphNode({ index, capabilityRegistry: registry, runId: applicationChild.run_id, nodeId, outputs: outputs.map(([role, outputPath]) => ({ role, path: outputPath })), submittedAt: TIME });
      index = await reload(workspace);
    }
    await recordGraphGate({ index, runId: applicationChild.run_id, gateId: "patent-application-complete", verdict: "pass", confirmedBy: "researcher", confirmedAt: TIME, summary: "Application approved." });
    index = await reload(workspace);
    assert.equal(index.runs.find((item) => item.run?.run_id === applicationChild.run_id)?.run?.status, "complete");

    assert.deepEqual(frontierFor(index, docket.run_id).eligible_nodes.map((item) => `${item.node_id}@${String(item.round ?? 0)}`), ["revision@1"]);

    await writeFixture(root, "patent/disclosure-r1.md", "Revised disclosure round 1.\n");
    await writeFixture(root, "patent/application-r1.md", "Revised application round 1.\n");
    await submitGraphNode({ index, capabilityRegistry: registry, runId: docket.run_id, nodeId: "revision", round: 1, outputs: [{ role: "disclosure_bundle", path: "patent/disclosure-r1.md" }, { role: "application_bundle", path: "patent/application-r1.md" }], submittedAt: TIME });
    index = await reload(workspace);
    await writeFixture(root, "patent/docket-review-r1.md", "Docket review round 1.\n");
    await submitGraphNode({ index, capabilityRegistry: registry, runId: docket.run_id, nodeId: "docket-check", round: 1, outputs: [{ role: "docket_review", path: "patent/docket-review-r1.md" }], submittedAt: TIME });
    index = await reload(workspace);
    await recordGraphGate({ index, runId: docket.run_id, gateId: "patent-docket-complete", verdict: "pass", confirmedBy: "researcher", confirmedAt: TIME, summary: "Round 1 approved.", round: 1 });
    index = await reload(workspace);
    assert.deepEqual(frontierFor(index, docket.run_id).pending_decisions, [`decision:${docket.run_id}/patent-docket-outcome@1`]);
    await recordGraphDecision({ index, runId: docket.run_id, decisionId: "patent-docket-outcome", choice: "continue", decidedBy: "researcher", decidedAt: TIME, round: 1 });
    index = await reload(workspace);
    assert.deepEqual(frontierFor(index, docket.run_id).eligible_nodes.map((item) => `${item.node_id}@${String(item.round ?? 0)}`), ["revision@2"]);

    const roundHandoff = index.runs.find((item) => item.run?.run_id === docket.run_id)?.handoff?.frontmatter;
    assert.ok(roundHandoff);
    await writeGraphHandoff(index, {
      ...roundHandoff,
      outputs: roundHandoff.outputs.map((entry) => entry.role === "disclosure_bundle"
        ? { ...entry, path: "patent/disclosure-r1.md" }
        : entry.role === "application_bundle" ? { ...entry, path: "patent/application-r1.md" } : entry),
    }, "Accepted round 1 versions selected for round 2.");
    index = await reload(workspace);
    assert.deepEqual(resolutionFor(index, docket.run_id, "revision", 2).map((input) => [input.role, input.path]), [
      ["patent_case", "patent/case.md"],
      ["disclosure_bundle", "patent/disclosure-r1.md"],
      ["application_bundle", "patent/application-r1.md"],
    ]);

    await writeFixture(root, "patent/disclosure-r2.md", "Revised disclosure round 2.\n");
    await writeFixture(root, "patent/application-r2.md", "Revised application round 2.\n");
    await submitGraphNode({ index, capabilityRegistry: registry, runId: docket.run_id, nodeId: "revision", round: 2, outputs: [{ role: "disclosure_bundle", path: "patent/disclosure-r2.md" }, { role: "application_bundle", path: "patent/application-r2.md" }], submittedAt: TIME });
    index = await reload(workspace);
    assert.deepEqual(resolutionFor(index, docket.run_id, "docket-check", 2).map((input) => [input.role, input.path]), [
      ["disclosure_bundle", "patent/disclosure-r2.md"],
      ["application_bundle", "patent/application-r2.md"],
    ]);
    await writeFixture(root, "patent/docket-review-r2.md", "Docket review round 2.\n");
    await submitGraphNode({ index, capabilityRegistry: registry, runId: docket.run_id, nodeId: "docket-check", round: 2, outputs: [{ role: "docket_review", path: "patent/docket-review-r2.md" }], submittedAt: TIME });
    index = await reload(workspace);
    await recordGraphGate({ index, runId: docket.run_id, gateId: "patent-docket-complete", verdict: "pass", confirmedBy: "researcher", confirmedAt: TIME, summary: "Round 2 approved.", round: 2 });
    index = await reload(workspace);
    await recordGraphDecision({ index, runId: docket.run_id, decisionId: "patent-docket-outcome", choice: "complete", decidedBy: "researcher", decidedAt: TIME, round: 2 });
    index = await reload(workspace);

    const docketRecord = index.runs.find((item) => item.run?.run_id === docket.run_id);
    assert.ok(docketRecord?.run && docketRecord.graph);
    assert.equal(docketRecord.run.status, "complete");
    assert.equal(graphRunCompletionReady(docketRecord.run, docketRecord.graph, docketRecord.nodeEntries.flatMap((entry) => entry.node ? [entry.node] : [])), true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("patent intelligence and office-action profiles can be started standalone", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-patent-standalone-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    for (const profileId of ["patent-intelligence", "patent-oa"]) {
      const authored = PATENT_GRAPH_PROFILES.find((item) => item.profile.profile_id === profileId);
      assert.ok(authored);
      await writeFile(path.join(workspace, "profiles", `${profileId}.yaml`), authored.projection, "utf8");
    }
    const registry = await loadCapabilityRegistry();
    await writeFixture(root, "patent/search-request.md", "Search request.\n");
    await writeFixture(root, "patent/office-action.md", "Office action.\n");
    await writeFixture(root, "patent/application-bundle.md", "Application bundle.\n");
    await writeFixture(root, "patent/comparison.md", "Comparison materials.\n");

    let index = await reload(workspace);
    const intelligence = await startGraphRun({ index, capabilityRegistry: registry, profileId: "patent-intelligence", confirmedBy: "researcher", command: {
      schema_version: "2",
      confirmed_at: TIME,
      entry_id: "main",
      entry_node_id: "search",
      prerequisites: [],
      handoff_inputs: [{ role: "search_request", type: "markdown", path: "patent/search-request.md", purpose: "Search request." }],
      planned_outputs: [{ role: "search_results", type: "markdown", path: "patent/search-results.md", purpose: "Search results." }],
      formal_gates: [],
      cost: { effort: "medium", interaction: "iterative" },
    } });
    index = await reload(workspace);
    assert.deepEqual(frontierFor(index, intelligence.run_id).eligible_node_ids, ["search"]);

    const officeAction = await startGraphRun({ index, capabilityRegistry: registry, profileId: "patent-oa", confirmedBy: "researcher", command: {
      schema_version: "2",
      confirmed_at: TIME,
      entry_id: "main",
      entry_node_id: "oa-response",
      prerequisites: [],
      handoff_inputs: [
        { role: "office_action", type: "markdown", path: "patent/office-action.md", purpose: "Office action." },
        { role: "application_bundle", type: "markdown", path: "patent/application-bundle.md", purpose: "Application bundle." },
        { role: "comparison_materials", type: "markdown", path: "patent/comparison.md", purpose: "Comparison materials." },
      ],
      planned_outputs: [{ role: "oa_response", type: "markdown", path: "patent/oa-response.md", purpose: "Office-action response." }],
      formal_gates: [],
      cost: { effort: "medium", interaction: "iterative" },
    } });
    index = await reload(workspace);
    assert.deepEqual(frontierFor(index, officeAction.run_id).eligible_node_ids, ["oa-response"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("a failed formal Gate blocks completion until a recorded human override", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-patent-gate-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    const authored = PATENT_GRAPH_PROFILES.find((item) => item.profile.profile_id === "patent-oa");
    assert.ok(authored);
    await writeFile(path.join(workspace, "profiles", "patent-oa.yaml"), authored.projection, "utf8");
    const registry = await loadCapabilityRegistry();
    await writeFixture(root, "patent/office-action.md", "Office action.\n");
    await writeFixture(root, "patent/application-bundle.md", "Application bundle.\n");
    await writeFixture(root, "patent/comparison.md", "Comparison materials.\n");

    let index = await reload(workspace);
    const run = await startGraphRun({ index, capabilityRegistry: registry, profileId: "patent-oa", confirmedBy: "researcher", command: {
      schema_version: "2",
      confirmed_at: TIME,
      entry_id: "main",
      entry_node_id: "oa-response",
      prerequisites: [],
      handoff_inputs: [
        { role: "office_action", type: "markdown", path: "patent/office-action.md", purpose: "Office action." },
        { role: "application_bundle", type: "markdown", path: "patent/application-bundle.md", purpose: "Application bundle." },
        { role: "comparison_materials", type: "markdown", path: "patent/comparison.md", purpose: "Comparison materials." },
      ],
      planned_outputs: [{ role: "oa_response", type: "markdown", path: "patent/oa-response.md", purpose: "Office-action response." }],
      formal_gates: ["patent-oa-complete"],
      cost: { effort: "medium", interaction: "iterative" },
    } });
    index = await reload(workspace);
    await writeFixture(root, "patent/oa-response.md", "Office-action response.\n");
    await submitGraphNode({ index, capabilityRegistry: registry, runId: run.run_id, nodeId: "oa-response", outputs: [{ role: "oa_response", path: "patent/oa-response.md" }], submittedAt: TIME });
    index = await reload(workspace);
    await writeFixture(root, "patent/oa-review.md", "Office-action review.\n");
    await submitGraphNode({ index, capabilityRegistry: registry, runId: run.run_id, nodeId: "check-oa", outputs: [{ role: "oa_review", path: "patent/oa-review.md" }], submittedAt: TIME });
    index = await reload(workspace);
    assert.deepEqual(frontierFor(index, run.run_id).pending_gates, [`gate:${run.run_id}/patent-oa-complete`]);
    await recordGraphGate({ index, runId: run.run_id, gateId: "patent-oa-complete", verdict: "fail", confirmedBy: "researcher", confirmedAt: TIME, summary: "Residual defects remain." });
    index = await reload(workspace);
    assert.equal(frontierFor(index, run.run_id).completion_ready, false);
    assert.deepEqual(frontierFor(index, run.run_id).pending_gates, [`gate:${run.run_id}/patent-oa-complete`]);

    await overrideGraphGate({ index, runId: run.run_id, gateId: "patent-oa-complete", approvedBy: "researcher", approvedAt: TIME, reason: "Human accepts residual risk." });
    index = await reload(workspace);
    const record = index.runs.find((item) => item.run?.run_id === run.run_id);
    assert.ok(record?.run && record.graph);
    assert.equal(frontierFor(index, run.run_id).completion_ready, true);
    assert.equal(graphRunCompletionReady(record.run, record.graph, record.nodeEntries.flatMap((entry) => entry.node ? [entry.node] : [])), true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("interpretation-only patent intelligence completes without selecting the chart, map or policy branches", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-patent-interpret-"));
  try {
    const workspace = await writeBaseWorkspace(root);
    const authored = PATENT_GRAPH_PROFILES.find((item) => item.profile.profile_id === "patent-intelligence");
    assert.ok(authored);
    await writeFile(path.join(workspace, "profiles", "patent-intelligence.yaml"), authored.projection, "utf8");
    const registry = await loadCapabilityRegistry();
    await writeFixture(root, "patent/search-request.md", "Search request.\n");

    let index = await reload(workspace);
    const run = await startGraphRun({ index, capabilityRegistry: registry, profileId: "patent-intelligence", confirmedBy: "researcher", command: {
      schema_version: "2",
      confirmed_at: TIME,
      entry_id: "main",
      entry_node_id: "search",
      prerequisites: [],
      handoff_inputs: [{ role: "search_request", type: "markdown", path: "patent/search-request.md", purpose: "Search request." }],
      planned_outputs: [{ role: "search_results", type: "markdown", path: "patent/search-results.md", purpose: "Search results." }],
      formal_gates: [],
      cost: { effort: "medium", interaction: "iterative" },
    } });
    index = await reload(workspace);
    await writeFixture(root, "patent/search-results.md", "Search results.\n");
    await submitGraphNode({ index, capabilityRegistry: registry, runId: run.run_id, nodeId: "search", outputs: [{ role: "search_results", path: "patent/search-results.md" }], submittedAt: TIME });
    index = await reload(workspace);
    await writeFixture(root, "patent/patent-notes.md", "Patent notes.\n");
    await writeFixture(root, "patent/claim-features.md", "Claim features.\n");
    await submitGraphNode({ index, capabilityRegistry: registry, runId: run.run_id, nodeId: "reading", outputs: [{ role: "patent_notes", path: "patent/patent-notes.md" }, { role: "claim_features", path: "patent/claim-features.md" }], submittedAt: TIME });
    index = await reload(workspace);
    assert.deepEqual(frontierFor(index, run.run_id).pending_decisions, [`decision:${run.run_id}/patent-intelligence-branch`]);
    await recordGraphDecision({ index, runId: run.run_id, decisionId: "patent-intelligence-branch", choice: "interpret-only", decidedBy: "researcher", decidedAt: TIME });
    index = await reload(workspace);
    assert.equal(frontierFor(index, run.run_id).completion_ready, true);
    assert.deepEqual(frontierFor(index, run.run_id).eligible_node_ids, []);
    const record = index.runs.find((item) => item.run?.run_id === run.run_id);
    assert.ok(record?.run && record.graph);
    assert.equal(graphRunCompletionReady(record.run, record.graph, record.nodeEntries.flatMap((entry) => entry.node ? [entry.node] : [])), true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("init and update project one Navigate entry and every new patent preset profile", async () => {
  const root = await tempProject();
  try {
    const codexHome = path.join(root, "codex-home");
    const initialized = parseEnvelope<{ projected_capability_files: number }>(runCli(["init", root, "--tools", "codex", "--delivery", "skills", "--json"], root, { CODEX_HOME: codexHome }));
    assert.equal(initialized.ok, true, JSON.stringify(initialized.error));
    assert.equal(initialized.data?.projected_capability_files ?? -1, 0);

    const skillEntries = (await readdir(path.join(root, ".agents", "skills"))).sort();
    assert.ok(skillEntries.includes("researchspec-navigate"), "init did not project the Navigate entry");
    assert.deepEqual(skillEntries.filter((name) => name.startsWith("researchspec-")), ["researchspec-navigate"]);
    assert.equal(skillEntries.some((name) => name.includes("patent")), false, "init leaked a patent capability into the visible catalog");
    await access(path.join(root, ".agents", "skills", "researchspec-navigate", "SKILL.md"));

    const workspace = path.join(root, "researchspec");
    const patentProfileIds = PATENT_GRAPH_PROFILES.map((item) => item.profile.profile_id);
    const emitted = (await readdir(path.join(workspace, "profiles"))).filter((name) => name.endsWith(".yaml"));
    for (const profileId of patentProfileIds) assert.ok(emitted.includes(`${profileId}.yaml`), `init did not emit ${profileId}.yaml`);
    const installedIndex = await loadGraphWorkspaceIndex(workspace);
    for (const profileId of patentProfileIds) assert.ok(installedIndex.profiles.has(profileId), `installed profile is unavailable: ${profileId}`);

    assert.equal(runCli(["update", "--tools", "none", "--json"], root, { CODEX_HOME: codexHome }).status, 0);
    await access(path.join(workspace, "profiles", "patent-docket.yaml"));
  } finally {
    await cleanup(root);
  }
});
