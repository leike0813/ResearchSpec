import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { stringify } from "yaml";

import {
  capabilityIds,
  CapabilityRegistryError,
  loadCapabilityRegistry,
  validateCapabilityRegistry,
  validateGraphAgainstCapabilityRegistry,
  type CapabilityRegistry,
} from "../src/capabilities/registry.js";
import { parseCapabilityGraphProfile } from "../src/core/contracts/capability-graph.js";

const KNOWLEDGE_TEXT = "# FINER framework knowledge\n";
const SKILL_TEXT = "Execute the current node and return control to ResearchSpec.\n";

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function manifestValue(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    schema_version: "1",
    capability_id: "cap.design.research-question-formulation",
    title: "Research Question Formulation",
    description: "Turns project intent into a FINER-scored research question brief.",
    class: "design",
    node_kind: "producer",
    execution_type: "llm",
    inputs: [{ role: "project_intent", schema_ref: "specs.project", required: true, source_policy: "stable_spec" }],
    outputs: [{ role: "rq_brief", schema_ref: "rq-brief.v1", required: true }],
    validators: [],
    knowledge_refs: [{ knowledge_id: "finer-framework", path: "knowledge/finer.md", content_hash: sha256(KNOWLEDGE_TEXT), license: "CC BY-NC 4.0" }],
    gate_policy: "required",
    provenance: { origin: "ars-derived", extraction_artifact_ids: ["CAP-M1-04"] },
    license: "CC BY-NC 4.0",
    ...overrides,
  };
}

interface RegistryFixture {
  root: string;
  registry: CapabilityRegistry;
  manifest?: Record<string, unknown>;
  manifestText?: string;
  sourcePath?: string;
  omitSkill?: boolean;
}

function registryValue(overrides: Omit<RegistryFixture, "root" | "registry"> = {}): RegistryFixture {
  const capabilityId = overrides.manifest?.capability_id as string | undefined ?? "cap.design.research-question-formulation";
  const sourcePath = overrides.sourcePath ?? capabilityId;
  const manifest = overrides.manifest ?? manifestValue();
  const manifestText = overrides.manifestText ?? stringify(manifest);
  return {
    root: "",
    registry: {
      schema_version: "1",
      registry_version: "0.1.0",
      capabilities: [{
        capability_id: capabilityId,
        source_path: sourcePath,
        manifest_sha256: sha256(manifestText),
      }],
    },
    manifest,
    manifestText,
    sourcePath,
    omitSkill: overrides.omitSkill,
  };
}

async function writeRegistryFixture(root: string, value: { registry: CapabilityRegistry; manifest?: Record<string, unknown>; manifestText?: string; sourcePath?: string; omitSkill?: boolean }): Promise<void> {
  await writeFile(path.join(root, "registry.json"), `${JSON.stringify(value.registry, null, 2)}\n`, "utf8");
  const capabilityId = value.manifest?.capability_id as string | undefined ?? "cap.design.research-question-formulation";
  const packageRoot = path.join(root, ...(value.sourcePath ?? capabilityId).split("/"));
  await mkdir(packageRoot, { recursive: true });
  await mkdir(path.join(packageRoot, "knowledge"), { recursive: true });
  const manifestText = value.manifestText ?? stringify(value.manifest ?? manifestValue());
  await writeFile(path.join(packageRoot, "manifest.yaml"), manifestText, "utf8");
  if (!value.omitSkill) await writeFile(path.join(packageRoot, "SKILL.md"), SKILL_TEXT, "utf8");
  await writeFile(path.join(packageRoot, "knowledge", "finer.md"), KNOWLEDGE_TEXT, "utf8");
}

async function tempRoot(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), "researchspec-capability-registry-"));
}

void test("bundled capability registry loads all authored packages", async () => {
  const loaded = await loadCapabilityRegistry();
  assert.equal(loaded.registry.registry_version, "0.1.0");
  for (const id of [
    "cap.design.research-question-formulation",
    "cap.design.methodology-design",
    "cap.discovery.literature-search-screening",
    "cap.discovery.source-quality-grading",
    "cap.analysis.evidence-synthesis",
    "cap.generation.report-compilation",
    "cap.generation.manuscript-drafting",
    "cap.check.reference-integrity-verification",
    "cap.judgment.review-synthesis",
    "cap.check.citation-existence-verification",
  ]) assert.ok(loaded.capabilities.has(id), id);
  assert.equal(loaded.capabilities.size, 38);
});

void test("capability registry resolves one package with content hashes", async () => {
  const root = await tempRoot();
  try {
    const fixture = registryValue();
    await writeRegistryFixture(root, fixture);
    const loaded = await validateCapabilityRegistry(fixture.registry, root, path.join(root, "registry.json"), {
      knownSchemaIds: new Set(["specs.project", "rq-brief.v1"]),
      extractionArtifactIds: new Set(["CAP-M1-04"]),
    });
    const registered = loaded.capabilities.get("cap.design.research-question-formulation");
    assert.ok(registered);
    assert.equal(registered.manifest.capability_id, "cap.design.research-question-formulation");
    assert.equal(registered.manifestSha256, fixture.registry.capabilities[0].manifest_sha256);
    assert.deepEqual(capabilityIds(loaded), new Set(["cap.design.research-question-formulation"]));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("duplicate capability IDs are rejected", async () => {
  const root = await tempRoot();
  try {
    const first = registryValue();
    const registry: CapabilityRegistry = {
      ...first.registry,
      capabilities: [first.registry.capabilities[0], first.registry.capabilities[0]],
    };
    await writeRegistryFixture(root, { registry, manifest: manifestValue() });
    await assert.rejects(
      validateCapabilityRegistry(registry, root),
      (error: unknown) => error instanceof CapabilityRegistryError
        && error.diagnostics.some((item) => item.code === "capability_registry_id_duplicate"),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("manifest hash mismatch is rejected", async () => {
  const root = await tempRoot();
  try {
    const fixture = registryValue();
    await writeRegistryFixture(root, fixture);
    const registry: CapabilityRegistry = {
      ...fixture.registry,
      capabilities: [{ ...fixture.registry.capabilities[0], manifest_sha256: sha256("different manifest bytes") }],
    };
    await writeFile(path.join(root, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`, "utf8");
    await assert.rejects(
      validateCapabilityRegistry(registry, root),
      (error: unknown) => error instanceof CapabilityRegistryError
        && error.diagnostics.some((item) => item.code === "capability_manifest_hash_mismatch"),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("knowledge hash mismatch is rejected", async () => {
  const root = await tempRoot();
  try {
    const manifest = manifestValue({ knowledge_refs: [{ knowledge_id: "finer-framework", path: "knowledge/finer.md", content_hash: sha256("different"), license: "CC BY-NC 4.0" }] });
    const fixture = registryValue({ manifest });
    await writeRegistryFixture(root, fixture);
    await assert.rejects(
      validateCapabilityRegistry(fixture.registry, root),
      (error: unknown) => error instanceof CapabilityRegistryError
        && error.diagnostics.some((item) => item.code === "capability_knowledge_hash_mismatch"),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("unknown schema refs are rejected when a schema registry is supplied", async () => {
  const root = await tempRoot();
  try {
    const fixture = registryValue();
    await writeRegistryFixture(root, fixture);
    await assert.rejects(
      validateCapabilityRegistry(fixture.registry, root, path.join(root, "registry.json"), { knownSchemaIds: new Set(["specs.project"]) }),
      (error: unknown) => error instanceof CapabilityRegistryError
        && error.diagnostics.some((item) => item.code === "capability_schema_ref_unknown"),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("ARS-derived provenance requires extraction artifact IDs", async () => {
  const root = await tempRoot();
  try {
    const fixture = registryValue({ manifest: manifestValue({ provenance: { origin: "ars-derived" } }) });
    await writeRegistryFixture(root, fixture);
    await assert.rejects(
      validateCapabilityRegistry(fixture.registry, root),
      (error: unknown) => error instanceof CapabilityRegistryError
        && error.diagnostics.some((item) => item.code === "capability_provenance_artifacts_required"),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("missing SKILL.md is rejected", async () => {
  const root = await tempRoot();
  try {
    const fixture = registryValue({ omitSkill: true });
    await writeRegistryFixture(root, fixture);
    await assert.rejects(
      validateCapabilityRegistry(fixture.registry, root),
      (error: unknown) => error instanceof CapabilityRegistryError
        && error.diagnostics.some((item) => item.code === "capability_skill_missing"),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("graph validation reports unknown capabilities and registry version drift", async () => {
  const root = await tempRoot();
  try {
    const fixture = registryValue();
    await writeRegistryFixture(root, fixture);
    const loaded = await validateCapabilityRegistry(fixture.registry, root);
    const graph = parseCapabilityGraphProfile({
      schema_version: "2",
      profile_id: "minimal",
      profile_version: "0.1.0",
      capability_registry_version: "0.2.0",
      entries: [{ entry_id: "main", kind: "end-to-end", node_id: "rq" }],
      nodes: [
        {
          node_id: "rq",
          kind: "capability",
          capability_id: "cap.design.missing",
          input_bindings: [{ role: "project_intent", source: "stable_spec" }],
          expected_outputs: [{ role: "rq_brief", required: true }],
          prerequisites: [],
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
    const diagnostics = validateGraphAgainstCapabilityRegistry(loaded, graph);
    assert.ok(diagnostics.some((item) => item.message.includes("cap.design.missing")));
    assert.ok(diagnostics.some((item) => item.path === "capability_registry_version" && item.message.includes("0.2.0")));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
