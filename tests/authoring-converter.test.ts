import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { authorCapabilityPackage } from "../src/arsu-converter/authoring/author.js";
import { M1_AUTHORING_SOURCES } from "../src/arsu-converter/authoring/m1-sources.js";
import { loadCapabilityRegistry } from "../src/capabilities/registry.js";

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

void test("authoring converter emits a registry-valid M1 capability package", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-authoring-"));
  try {
    const source = M1_AUTHORING_SOURCES[0];
    assert.ok(source);
    const first = await authorCapabilityPackage(root, source);
    assert.equal(first.capability_id, source.capability_id);
    assert.deepEqual(first.files.sort(), ["SKILL.md", "knowledge/finer-framework.md", "knowledge/finer-socratic-questions.md", "manifest.yaml"].sort());
    const skill = await readFile(path.join(first.packageRoot, "SKILL.md"), "utf8");
    assert.doesNotMatch(skill, /proceed to|next phase|Phase \d/i);
    const loaded = await loadCapabilityRegistry(root, {
      knownSchemaIds: new Set(["specs.project", "rq-brief.v1"]),
      extractionArtifactIds: new Set(["CAP-M1-04", "KP-M1-02", "KP-M1-02b"]),
    });
    assert.ok(loaded.capabilities.has(source.capability_id));
    const manifestPath = path.join(first.packageRoot, "manifest.yaml");
    const manifestText = await readFile(manifestPath, "utf8");
    const registry = JSON.parse(await readFile(path.join(root, "registry.json"), "utf8")) as { capabilities: Array<{ manifest_sha256: string }> };
    assert.equal(first.manifest.knowledge_refs.length, 2);
    assert.equal(registry.capabilities[0]?.manifest_sha256, sha256(manifestText));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("authoring converter is deterministic and idempotent", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-authoring-"));
  try {
    const source = M1_AUTHORING_SOURCES[0];
    assert.ok(source);
    await authorCapabilityPackage(root, source);
    const beforeRegistry = await readFile(path.join(root, "registry.json"), "utf8");
    const beforeManifest = await readFile(path.join(root, source.capability_id, "manifest.yaml"), "utf8");
    const beforeSkill = await readFile(path.join(root, source.capability_id, "SKILL.md"), "utf8");
    await authorCapabilityPackage(root, source);
    assert.equal(await readFile(path.join(root, "registry.json"), "utf8"), beforeRegistry);
    assert.equal(await readFile(path.join(root, source.capability_id, "manifest.yaml"), "utf8"), beforeManifest);
    assert.equal(await readFile(path.join(root, source.capability_id, "SKILL.md"), "utf8"), beforeSkill);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
