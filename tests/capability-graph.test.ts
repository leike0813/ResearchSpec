import assert from "node:assert/strict";
import { test } from "node:test";

import {
  findUnreachableGraphNodes,
  parseCapabilityGraphProfile,
  validateGraphCapabilityReferences,
  type CapabilityGraphProfile,
} from "../src/core/contracts/capability-graph.js";

function profile(overrides: Partial<CapabilityGraphProfile> = {}): CapabilityGraphProfile {
  return {
    schema_version: "2",
    profile_id: "deep-research-main",
    profile_version: "0.1.0",
    capability_registry_version: "0.1.0",
    entries: [{ entry_id: "main", kind: "end-to-end", node_id: "research-question" }],
    nodes: [
      {
        node_id: "research-question",
        kind: "capability",
        capability_id: "design-research-question-formulation",
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
        prerequisites: ["research-question"],
        required_gate_ids: [],
        required_decision_ids: [],
        multiplicity: "one",
        round_role: null,
      },
      {
        node_id: "report",
        kind: "capability",
        capability_id: "generation-report-compilation",
        input_bindings: [{ role: "rq_brief", source: "node_output", from_node_id: "research-question" }],
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
    ...overrides,
  } satisfies CapabilityGraphProfile;
}

void test("capability graph profile schema accepts a minimal acyclic graph", () => {
  const parsed = parseCapabilityGraphProfile(profile());
  assert.equal(parsed.profile_id, "deep-research-main");
  assert.deepEqual(findUnreachableGraphNodes(parsed), []);
});

void test("unknown capability references are reported by registry validation", () => {
  const parsed = parseCapabilityGraphProfile(profile());
  const diagnostics = validateGraphCapabilityReferences(parsed, new Set(["generation-report-compilation"]));
  assert.ok(diagnostics.some((item) => item.message.includes("design-research-question-formulation")));
});

void test("duplicate node IDs are rejected", () => {
  assert.throws(
    () => parseCapabilityGraphProfile(profile({
      nodes: [
        ...profile().nodes,
        { ...profile().nodes[0] },
      ],
    })),
    /Duplicate node ID: research-question/,
  );
});

void test("repeatable nodes require a round role", () => {
  assert.throws(
    () => parseCapabilityGraphProfile(profile({
      nodes: profile().nodes.map((node) => node.node_id === "research-question"
        ? { ...node, multiplicity: "repeatable" as const, round_role: null }
        : node),
    })),
    /Repeatable nodes require a round role/,
  );
});

void test("node_output bindings require a source node", () => {
  assert.throws(
    () => parseCapabilityGraphProfile(profile({
      nodes: profile().nodes.map((node) => node.node_id === "report"
        ? { ...node, input_bindings: [{ role: "rq_brief", source: "node_output" as const }] }
        : node),
    })),
    /node_output bindings require a source node ID/,
  );
});

void test("unreachable nodes are diagnosed", () => {
  const parsed = parseCapabilityGraphProfile(profile({
    nodes: [
      ...profile().nodes,
      {
        node_id: "orphan",
        kind: "observer",
        input_bindings: [],
        expected_outputs: [],
        prerequisites: [],
        required_gate_ids: [],
        required_decision_ids: [],
        multiplicity: "optional",
        round_role: null,
      },
    ],
  }));
  assert.deepEqual(findUnreachableGraphNodes(parsed), ["orphan"]);
});

void test("revision round template resolves decision options", () => {
  const parsed = parseCapabilityGraphProfile(profile({
    nodes: [
      ...profile().nodes,
      {
        node_id: "revision",
        kind: "capability",
        capability_id: "generation-manuscript-drafting",
        input_bindings: [],
        expected_outputs: [{ role: "revised_manuscript" }],
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
      decision_id: "revision-outcome",
      owner_node_id: "review",
      options: [
        { option_id: "continue-revision", unlocks: ["revision"] },
        { option_id: "exit-revision", unlocks: ["report"] },
      ],
    }],
    revision_round_template: {
      revision_node_id: "revision",
      review_node_id: "review",
      continue_option_id: "continue-revision",
      exit_option_id: "exit-revision",
    },
  }));
  assert.equal(parsed.revision_round_template?.revision_node_id, "revision");
});
