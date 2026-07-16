import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { availableDomains, loadPluginRegistry } from "../src/plugins/registry.js";
import { renderHistAgentCompleteTrees } from "../src/vendor-converters/histagent/complete-tree.js";
import { checkHistAgentIdempotence, checkHistAgentOutput, type HistAgentConversionManifest } from "../src/vendor-converters/histagent/converter.js";
import { loadHistAgentPolicies } from "../src/vendor-converters/histagent/policy.js";
import { PRODUCTION_VENDOR_IDS } from "../src/vendor-converters/shared/production-vendors.js";

const REPO_ROOT = path.resolve(".");
const PLUGIN_ROOT = path.resolve("skills/plugins");
const VENDOR_ROOT = path.join(PLUGIN_ROOT, "vendors/histagent");
const APPROVED_HASH = "c44f136b6945868ddde7871b5f5ecd7bfb8ac09f84f080f46fbd37f9e173dbd3";

void test("HistAgent generated bundle is the approved complete three-Skill projection", async () => {
  const policies = await loadHistAgentPolicies(REPO_ROOT);
  const rendered = await renderHistAgentCompleteTrees(REPO_ROOT);
  const loaded = await loadPluginRegistry(PLUGIN_ROOT);
  const manifest = JSON.parse(await readFile(path.join(PLUGIN_ROOT, "vendor-manifests/histagent.json"), "utf8")) as HistAgentConversionManifest;

  assert.equal(policies.review.review_status, "approved");
  assert.equal(rendered.treeSetSha256, APPROVED_HASH);
  assert.equal(manifest.approved_tree_set_sha256, APPROVED_HASH);
  assert.deepEqual([...loaded.vendors.keys()], [...PRODUCTION_VENDOR_IDS]);
  assert.equal(loaded.vendors.get("histagent")?.skills.length, 3);
  assert.ok(loaded.vendors.get("histagent")?.skills.every((skill) => skill.dependencies.length === 0));
  assert.equal(loaded.domains.size, 218);
  assert.equal(availableDomains(loaded).length, 56);
  assert.deepEqual(loaded.domains.get("historical-studies")?.skills, [
    "histagent-historical-research",
    "histagent-historical-source-analysis",
    "histagent-historical-source-identification",
  ]);
  assert.deepEqual(loaded.domains.get("heritage-archive-and-museum-studies")?.skills, [
    "histagent-historical-source-analysis",
    "histagent-historical-source-identification",
  ]);
  assert.equal([...loaded.domains.values()].filter((domain) => domain.domain_type === "tool").some((domain) => domain.skills.some((skillId) => skillId.startsWith("histagent-"))), false);
  assert.equal(manifest.file_dispositions.length, 24);
  assert.deepEqual(manifest.decision_counts, {
    source_entries: 120,
    knowledge_surfaces: 31,
    content_origins: 5,
    license_claims: 4,
    runtime_authorities: 10,
    external_resources: 16,
    security_findings: 10,
    candidates: 3,
  });
  assert.equal(manifest.capability_map.length, 21);
  assert.equal(manifest.attributed_source_evidence.length, 5);
  assert.equal(manifest.relationship_decisions.length, 6);

  for (const tree of rendered.trees) {
    assert.equal(manifest.tree_sha256[tree.skillId], tree.sha256);
    for (const file of tree.files) {
      assert.deepEqual(await readFile(path.join(VENDOR_ROOT, tree.skillId, file.path)), file.content, `${tree.skillId}/${file.path}`);
    }
  }
});

void test("HistAgent production output validates and regenerates idempotently", async () => {
  assert.deepEqual(await checkHistAgentOutput(REPO_ROOT), { ok: true, errors: [], warnings: [] });
  assert.deepEqual(await checkHistAgentIdempotence(REPO_ROOT), { ok: true, drift_paths: [] });
});
