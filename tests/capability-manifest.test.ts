import assert from "node:assert/strict";
import { test } from "node:test";

import {
  parseCapabilityManifest,
  type CapabilityManifest,
} from "../src/core/contracts/capability-manifest.js";

function manifest(overrides: Partial<CapabilityManifest> = {}): CapabilityManifest {
  return {
    schema_version: "1",
    capability_id: "cap-design-research-question-formulation",
    title: "Research Question Formulation",
    description: "Turns a project intent into a FINER-scored research question brief.",
    class: "design",
    node_kind: "producer",
    execution_type: "llm",
    params: {},
    presets: [],
    inputs: [{ role: "project_intent", schema_ref: "specs.project", required: true, source_policy: "stable_spec" }],
    outputs: [{ role: "rq_brief", schema_ref: "rq-brief.v1", required: true }],
    validators: [],
    knowledge_refs: [],
    gate_policy: "required",
    provenance: { origin: "ars-derived", extraction_artifact_ids: ["CAP-M1-04"] },
    license: "CC BY-NC 4.0",
    ...overrides,
  } satisfies CapabilityManifest;
}

void test("capability manifest schema accepts a minimal producer package", () => {
  assert.equal(parseCapabilityManifest(manifest()).capability_id, "cap-design-research-question-formulation");
});

void test("producer capability without output roles is rejected", () => {
  assert.throws(
    () => parseCapabilityManifest(manifest({ outputs: [] })),
    /Producer capabilities require at least one output role/,
  );
});

void test("capability id must be a kebab-case Open Agent Skills name", () => {
  assert.throws(
    () => parseCapabilityManifest(manifest({ capability_id: "cap.design.research-question-formulation" })),
    /kebab-case/,
  );
});

void test("unknown node kind is rejected", () => {
  assert.throws(
    () => parseCapabilityManifest(manifest({ node_kind: "orchestration" as never })),
    /Invalid option/,
  );
});

void test("duplicate role IDs are rejected", () => {
  assert.throws(
    () => parseCapabilityManifest(manifest({
      inputs: [
        { role: "same_role", schema_ref: "schema.v1", required: true, source_policy: "handoff" },
        { role: "same_role", schema_ref: "schema.v1", required: true, source_policy: "handoff" },
      ],
    })),
    /Duplicate input role: same_role/,
  );
});

void test("script validators require an explicit runner contract", () => {
  assert.throws(
    () => parseCapabilityManifest(manifest({
      validators: [
        { validator_id: "lint", kind: "script", inputs: ["project_intent"], outputs: [], error_codes: ["lint_failed"] },
      ],
    })),
    /Script validators require an explicit runner contract/,
  );
});

void test("network validators require a degraded verdict", () => {
  assert.throws(
    () => parseCapabilityManifest(manifest({
      validators: [
        { validator_id: "lookup", kind: "policy", inputs: [], outputs: [], error_codes: ["lookup_unavailable"], network: true },
      ],
    })),
    /Network validators require a degraded verdict/,
  );
});

void test("variant presets must have unique IDs", () => {
  assert.throws(
    () => parseCapabilityManifest(manifest({
      presets: [
        { preset_id: "template", name: "Paper", values: {} },
        { preset_id: "template", name: "Report", values: {} },
      ],
    })),
    /Duplicate preset ID: template/,
  );
});
