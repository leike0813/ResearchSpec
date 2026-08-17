import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ANCHOR = "snapshot-32fce5c";

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

void test("Education Agent Skills maintenance catalog maps 136 reviewed Skills to 136 extensions", async () => {
  const catalog = JSON.parse(await readFile(path.join(ROOT, "audits/education-agent-skills/catalog.json"), "utf8")) as {
    vendor_id: string;
    revision: string;
    extensions: Array<{ capability_id: string; raw_skill_id: string; execution_type: string; required_brief_fields: string[] }>;
  };
  assert.equal(catalog.vendor_id, "education-agent-skills");
  assert.equal(catalog.revision, "32fce5c0d097ec675cf81c750a65a379e4d87e3c");
  assert.equal(catalog.extensions.length, 136);
  assert.equal(catalog.extensions.filter((item) => item.execution_type === "llm").length, 136);
  assert.deepEqual(catalog.extensions.map((item) => item.raw_skill_id).slice(0, 1), ["education-agent-skills-academic-language-sentence-frame-generator"]);
  for (const extension of catalog.extensions) assert.deepEqual(extension.required_brief_fields, [
    "scope",
    "source_ledger",
    "method_plan",
    "work_products",
    "validation_results",
    "conclusions",
  ]);
});

void test("Education Agent Skills anchor manifest is complete and check passes", async () => {
  const manifest = JSON.parse(await readFile(path.join(ROOT, "audits/education-agent-skills", ANCHOR, "manifest.json"), "utf8")) as {
    anchor_id: string;
    upstream: { revision: string; content_file_count: number; tree_sha256: string };
    advisory: { raw_skill_count: number; tree_sha256: string };
    extension: { capability_count: number; profile_count: number; llm_count: number; mixed_count: number; registry_subset_sha256: string };
    review: { tool_file_count: number; tools_byte_identical: boolean; required_fields_bound: boolean };
    maintenance: { skill_sha256: string; catalog_sha256: string; audit_readme_sha256: string; record_sha256: string };
  };
  assert.equal(manifest.anchor_id, ANCHOR);
  assert.equal(manifest.upstream.revision, "32fce5c0d097ec675cf81c750a65a379e4d87e3c");
  assert.equal(manifest.upstream.content_file_count, 238);
  assert.match(manifest.upstream.tree_sha256, /^[a-f0-9]{64}$/);
  assert.equal(manifest.advisory.raw_skill_count, 136);
  assert.equal(manifest.extension.capability_count, 136);
  assert.equal(manifest.extension.profile_count, 136);
  assert.equal(manifest.extension.llm_count, 136);
  assert.equal(manifest.extension.mixed_count, 0);
  assert.match(manifest.extension.registry_subset_sha256, /^[a-f0-9]{64}$/);
  assert.equal(manifest.review.tool_file_count, 0);
  assert.equal(manifest.review.tools_byte_identical, true);
  assert.equal(manifest.review.required_fields_bound, true);

  const maintenanceSkill = await readFile(path.join(ROOT, ".agents/skills/education-agent-skills-maintenance/SKILL.md"), "utf8");
  assert.equal(sha256(maintenanceSkill), manifest.maintenance.skill_sha256);
  const catalog = await readFile(path.join(ROOT, "audits/education-agent-skills/catalog.json"), "utf8");
  assert.equal(sha256(catalog), manifest.maintenance.catalog_sha256);
  const auditReadme = await readFile(path.join(ROOT, "audits/education-agent-skills/README.md"), "utf8");
  assert.equal(sha256(auditReadme), manifest.maintenance.audit_readme_sha256);
  assert.match(manifest.maintenance.record_sha256, /^[a-f0-9]{64}$/);

  const result = spawnSync(process.execPath, ["scripts/education-agent-skills-maintenance.mjs", "check", ANCHOR], {
    cwd: ROOT,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), `OK education-agent-skills@${ANCHOR}`);
});
