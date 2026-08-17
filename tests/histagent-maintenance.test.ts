import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ANCHOR = "snapshot-47bbe21";

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

void test("HistAgent maintenance catalog maps three reviewed Skills to three extensions", async () => {
  const catalog = JSON.parse(await readFile(path.join(ROOT, "audits/histagent/catalog.json"), "utf8")) as {
    vendor_id: string;
    revision: string;
    extensions: Array<{ capability_id: string; raw_skill_id: string; execution_type: string; required_brief_fields: string[] }>;
  };
  assert.equal(catalog.vendor_id, "histagent");
  assert.equal(catalog.revision, "47bbe21dc81618489f5d5929358032883a3fe448");
  assert.equal(catalog.extensions.length, 3);
  assert.equal(catalog.extensions.filter((item) => item.execution_type === "mixed").length, 3);
  assert.deepEqual(catalog.extensions.map((item) => item.raw_skill_id).sort(), [
    "histagent-historical-research",
    "histagent-historical-source-analysis",
    "histagent-historical-source-identification",
  ]);
  for (const extension of catalog.extensions) assert.ok(extension.required_brief_fields.length >= 6);
});

void test("HistAgent anchor manifest is complete and check passes", async () => {
  const manifest = JSON.parse(await readFile(path.join(ROOT, "audits/histagent", ANCHOR, "manifest.json"), "utf8")) as {
    anchor_id: string;
    upstream: { revision: string; content_file_count: number; tree_sha256: string };
    advisory: { raw_skill_count: number; tree_sha256: string };
    extension: { capability_count: number; profile_count: number; mixed_count: number; registry_subset_sha256: string };
    maintenance: { skill_sha256: string; catalog_sha256: string; audit_readme_sha256: string; record_sha256: string };
  };
  assert.equal(manifest.anchor_id, ANCHOR);
  assert.equal(manifest.upstream.revision, "47bbe21dc81618489f5d5929358032883a3fe448");
  assert.equal(manifest.upstream.content_file_count, 120);
  assert.match(manifest.upstream.tree_sha256, /^[a-f0-9]{64}$/);
  assert.equal(manifest.advisory.raw_skill_count, 3);
  assert.equal(manifest.extension.capability_count, 3);
  assert.equal(manifest.extension.profile_count, 3);
  assert.equal(manifest.extension.mixed_count, 3);
  assert.match(manifest.extension.registry_subset_sha256, /^[a-f0-9]{64}$/);

  const maintenanceSkill = await readFile(path.join(ROOT, ".agents/skills/histagent-maintenance/SKILL.md"), "utf8");
  assert.equal(sha256(maintenanceSkill), manifest.maintenance.skill_sha256);
  const catalog = await readFile(path.join(ROOT, "audits/histagent/catalog.json"), "utf8");
  assert.equal(sha256(catalog), manifest.maintenance.catalog_sha256);
  const auditReadme = await readFile(path.join(ROOT, "audits/histagent/README.md"), "utf8");
  assert.equal(sha256(auditReadme), manifest.maintenance.audit_readme_sha256);
  assert.match(manifest.maintenance.record_sha256, /^[a-f0-9]{64}$/);

  const result = spawnSync(process.execPath, ["scripts/histagent-maintenance.mjs", "check", ANCHOR], {
    cwd: ROOT,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), `OK histagent@${ANCHOR}`);
});
