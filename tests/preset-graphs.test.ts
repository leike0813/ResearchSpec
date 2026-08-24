import assert from "node:assert/strict";
import { test } from "node:test";

import { parseCapabilityGraphProfile, findUnreachableGraphNodes } from "../src/core/contracts/capability-graph.js";
import { loadCapabilityRegistry, validateGraphAgainstCapabilityRegistry } from "../src/capabilities/registry.js";
import { RESEARCH_MAIN_GRAPH_PROFILE, RESEARCH_MAIN_GRAPH_PROFILE_TEXT } from "../src/core/graph-profiles/research-main.js";
import { ACADEMIC_PAPER_GRAPH_PROFILE } from "../src/core/graph-profiles/academic-paper.js";
import { ACADEMIC_PAPER_REVIEWER_GRAPH_PROFILE } from "../src/core/graph-profiles/academic-paper-reviewer.js";
import { ACADEMIC_PIPELINE_GRAPH_PROFILE } from "../src/core/graph-profiles/academic-pipeline.js";
import { PAPER_HUMANIZER_GRAPH_PROFILE } from "../src/core/graph-profiles/paper-humanizer.js";
import { REVIEW_RESPONSE_GRAPH_PROFILE } from "../src/core/graph-profiles/review-response.js";

void test("research-main preset resolves against the bundled capability registry", async () => {
  const parsed = parseCapabilityGraphProfile(RESEARCH_MAIN_GRAPH_PROFILE);
  const registry = await loadCapabilityRegistry();
  assert.deepEqual(validateGraphAgainstCapabilityRegistry(registry, parsed), []);
});

void test("research-main preset is a valid reachable capability graph", () => {
  const parsed = parseCapabilityGraphProfile(RESEARCH_MAIN_GRAPH_PROFILE);
  assert.equal(parsed.profile_id, "research-main");
  assert.equal(parsed.nodes.length, 7);
  assert.deepEqual(findUnreachableGraphNodes(parsed), []);
  assert.equal(RESEARCH_MAIN_GRAPH_PROFILE_TEXT.length > 0, true);
});

void test("research-main preset gate and prerequisites bind the main chain", () => {
  const graph = parseCapabilityGraphProfile(RESEARCH_MAIN_GRAPH_PROFILE);
  const report = graph.nodes.find((item) => item.node_id === "report");
  assert.deepEqual(report?.prerequisites, ["synthesis"]);
  const rqGate = graph.gates.find((item) => item.gate_id === "rq-gate");
  assert.equal(rqGate?.owner_node_id, "rq-gate");
  assert.equal(graph.nodes.find((item) => item.node_id === "methodology")?.required_gate_ids[0], "rq-gate");
});

void test("custom graph profiles pass the same validation without engine changes", () => {
  const custom = parseCapabilityGraphProfile({
    schema_version: "2",
    profile_id: "custom-slice",
    profile_version: "0.1.0",
    capability_registry_version: "0.1.0",
    entries: [{ entry_id: "main", kind: "end-to-end", node_id: "research-question" }],
    nodes: [
      {
        node_id: "research-question",
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
        prerequisites: ["research-question"],
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
  });
  assert.equal(custom.profile_id, "custom-slice");
  assert.deepEqual(findUnreachableGraphNodes(custom), []);
});

void test("paper, reviewer, pipeline, humanizer, and review-response presets resolve against the bundled registry", async () => {
  const registry = await loadCapabilityRegistry();
  for (const profile of [ACADEMIC_PAPER_GRAPH_PROFILE, ACADEMIC_PAPER_REVIEWER_GRAPH_PROFILE, ACADEMIC_PIPELINE_GRAPH_PROFILE, PAPER_HUMANIZER_GRAPH_PROFILE, REVIEW_RESPONSE_GRAPH_PROFILE]) {
    const parsed = parseCapabilityGraphProfile(profile);
    assert.deepEqual(findUnreachableGraphNodes(parsed), []);
    assert.deepEqual(validateGraphAgainstCapabilityRegistry(registry, parsed), []);
  }
});
