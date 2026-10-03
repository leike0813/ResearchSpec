import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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

void test("authoring preserves binary resources and their individual distribution licenses", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-authoring-binary-"));
  try {
    const source = M1_AUTHORING_SOURCES[0];
    assert.ok(source);
    const bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0xff, 0xfe, 0x80]);
    const resource = path.join(root, "source.png");
    await writeFile(resource, bytes);
    const authored = await authorCapabilityPackage(path.join(root, "packages"), {
      ...source,
      package_assets: [{ source_path: resource, output_path: "assets/附图.png", license: "MIT" }],
    });
    assert.deepEqual(await readFile(path.join(authored.packageRoot, "assets/附图.png")), bytes);
    const ref = authored.manifest.knowledge_refs.find((item) => item.path === "assets/附图.png");
    assert.equal(ref?.content_hash, createHash("sha256").update(bytes).digest("hex"));
    assert.equal(ref?.license, "MIT");
    const registered = await loadCapabilityRegistry(path.join(root, "packages"));
    assert.equal(registered.capabilities.get(source.capability_id)?.manifest.knowledge_refs.find((item) => item.path === "assets/附图.png")?.content_hash, ref?.content_hash);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
