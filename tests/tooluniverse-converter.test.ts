import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { checkToolUniverseIdempotence, checkToolUniverseOutput, type ToolUniverseConversionManifest } from "../src/vendor-converters/tooluniverse/converter.js";

const REPO_ROOT = path.resolve(".");
const MANIFEST_PATH = path.resolve("skills/plugins/vendor-manifests/tooluniverse.json");
const BUNDLE_PATH = path.resolve("skills/plugins/vendor-bundles/tooluniverse.json");

void test("ToolUniverse conversion manifest admits the audited inventory and classifies every dependency edge", async () => {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8")) as ToolUniverseConversionManifest;
  assert.equal(manifest.candidate_skills, 130);
  assert.equal(manifest.excluded_skills, 55);
  assert.equal(manifest.generated_skills.length, 130);
  assert.equal(manifest.dependency_decisions.length, 226);
  assert.deepEqual(
    Object.fromEntries(["required", "related", "routing"].map((relation) => [relation, manifest.dependency_decisions.filter((item) => item.relation === relation).length])),
    { required: 8, related: 139, routing: 79 },
  );
  const bundle = JSON.parse(await readFile(BUNDLE_PATH, "utf8")) as { schema_version: string; vendor: { vendor_id: string; skills: Array<{ license: string }> } };
  assert.equal(bundle.schema_version, "1");
  assert.equal(bundle.vendor.vendor_id, "tooluniverse");
  assert.equal(bundle.vendor.skills.length, 130);
  assert.ok(bundle.vendor.skills.every((skill) => skill.license === "Apache-2.0"));
  assert.ok(manifest.file_dispositions.some((item) => item.reason === "test, evaluation, or benchmark resource" && item.disposition === "excluded"));
  assert.ok(manifest.file_dispositions.some((item) => item.reason === "environment or credential template" && item.disposition === "excluded"));
  assert.equal(manifest.file_dispositions.some((item) => item.disposition === "included" && /(^|\/)test_data\//.test(item.source_path)), false);
});

void test("ToolUniverse generated bundle validates and regenerates idempotently", async () => {
  const validation = await checkToolUniverseOutput(REPO_ROOT);
  assert.equal(validation.ok, true, validation.errors.join("\n"));
  const idempotence = await checkToolUniverseIdempotence(REPO_ROOT);
  assert.deepEqual(idempotence, { ok: true, drift_paths: [] });
});

void test("adapted ToolUniverse Skills carry the static authority and attribution contract", async () => {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8")) as ToolUniverseConversionManifest;
  for (const skillId of manifest.generated_skills) {
    const root = path.join(REPO_ROOT, "skills/plugins/vendors/tooluniverse", skillId);
    const entry = await readFile(path.join(root, "SKILL.md"), "utf8");
    assert.match(entry, /^---\nname: tooluniverse-/);
    assert.match(entry, /ResearchSpec boundary/);
    assert.ok((await readFile(path.join(root, "LICENSE"), "utf8")).trim());
    assert.match(await readFile(path.join(root, "NOTICE.md"), "utf8"), /ToolUniverse/);
  }
});
