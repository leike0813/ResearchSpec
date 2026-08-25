import assert from "node:assert/strict";
import { test } from "node:test";

import { parseCapabilityGraphProfile, findUnreachableGraphNodes } from "../src/core/contracts/capability-graph.js";
import { loadCapabilityRegistry, validateGraphAgainstCapabilityRegistry } from "../src/capabilities/registry.js";
import { loadGraphProfileRegistry } from "../src/graph-profiles/registry.js";
import { buildPresetGraphProfileRegistry } from "../src/arsu-converter/workflow/generate.js";

void test("research-main preset resolves against the bundled capability registry", async () => {
  const profiles = await loadGraphProfileRegistry();
  const parsed = profiles.profiles.get("research-main")?.profile;
  assert.ok(parsed);
  const registry = await loadCapabilityRegistry();
  assert.deepEqual(validateGraphAgainstCapabilityRegistry(registry, parsed), []);
});

void test("converter-owned preset registry matches the packaged projection deterministically", async () => {
  const loaded = await loadGraphProfileRegistry();
  assert.deepEqual(loaded.registry, buildPresetGraphProfileRegistry());
  assert.deepEqual(buildPresetGraphProfileRegistry(), buildPresetGraphProfileRegistry());
  assert.equal(loaded.profiles.size, 7);
});

void test("research-main preset is a valid reachable capability graph", async () => {
  const registered = (await loadGraphProfileRegistry()).profiles.get("research-main");
  assert.ok(registered);
  const parsed = parseCapabilityGraphProfile(registered.profile);
  assert.equal(parsed.profile_id, "research-main");
  assert.equal(parsed.nodes.length, 7);
  assert.deepEqual(findUnreachableGraphNodes(parsed), []);
  assert.equal(registered.projection.length > 0, true);
});

void test("research-main preset gate and prerequisites bind the main chain", async () => {
  const registered = (await loadGraphProfileRegistry()).profiles.get("research-main");
  assert.ok(registered);
  const graph = parseCapabilityGraphProfile(registered.profile);
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
  const profiles = await loadGraphProfileRegistry();
  for (const profileId of ["academic-paper", "academic-paper-reviewer", "academic-pipeline", "paper-humanizer", "review-response"]) {
    const registered = profiles.profiles.get(profileId);
    assert.ok(registered);
    const parsed = parseCapabilityGraphProfile(registered.profile);
    assert.deepEqual(findUnreachableGraphNodes(parsed), []);
    assert.deepEqual(validateGraphAgainstCapabilityRegistry(registry, parsed), []);
  }
});

void test("academic pipeline exposes every supported entry and the revision-to-delivery tail", async () => {
  const registered = (await loadGraphProfileRegistry()).profiles.get("academic-pipeline");
  assert.ok(registered);
  const graph = parseCapabilityGraphProfile(registered.profile);
  const midEntry = graph.entries.find((entry) => entry.entry_id === "mid-entry");
  assert.equal(midEntry?.kind, "mid-entry");
  assert.deepEqual(midEntry?.kind === "mid-entry" ? midEntry.entry_points : [], [
    "research", "write", "review", "revision", "re-review", "format", "final-integrity",
  ]);
  assert.equal(graph.nodes.find((node) => node.node_id === "format")?.delivery_requirement, "quarto_available_for_qmd");
  assert.equal(graph.revision_round_template?.review_execution_node_id, "re-review");
  assert.equal(graph.gates.some((gate) => gate.gate_id === "final-integrity-gate"), true);
});
