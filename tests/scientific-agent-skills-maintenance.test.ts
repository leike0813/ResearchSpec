import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { fileURLToPath } from "node:url";
import { testVendorAnchor } from "./helpers/vendor-maintenance.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

interface MaintenanceCatalog {
  vendor_id: string;
  upstream_root: string;
  release: string;
  revision: string;
  anchor_id: string;
  extensions: Array<{ capability_id: string; raw_skill_id: string; execution_type: string; required_brief_fields: string[] }>;
}

const CATALOG = JSON.parse(readFileSync(path.join(ROOT, "audits/scientific-agent-skills/catalog.json"), "utf8")) as MaintenanceCatalog;

void test("Scientific Agent Skills maintenance catalog maps every reviewed Skill to an extension", () => {
  assert.equal(CATALOG.vendor_id, "scientific-agent-skills");
  assert.equal(CATALOG.revision, execFileSync("git", ["-C", path.join(ROOT, CATALOG.upstream_root), "rev-parse", "HEAD"], { encoding: "utf8" }).trim());
  assert.ok(CATALOG.extensions.length > 0);
  assert.equal(new Set(CATALOG.extensions.map((extension) => extension.capability_id)).size, CATALOG.extensions.length);
  assert.equal(new Set(CATALOG.extensions.map((extension) => extension.raw_skill_id)).size, CATALOG.extensions.length);

  const expectedBriefFields = CATALOG.extensions[0]?.required_brief_fields ?? [];
  assert.ok(expectedBriefFields.length > 0);
  for (const extension of CATALOG.extensions) {
    assert.equal(extension.capability_id, "plugin-" + extension.raw_skill_id);
    assert.ok(["llm", "mixed"].includes(extension.execution_type), extension.capability_id);
    assert.deepEqual(extension.required_brief_fields, expectedBriefFields);
  }
});

testVendorAnchor(ROOT, {
  vendor: "scientific-agent-skills",
  anchor: CATALOG.anchor_id,
  revision: CATALOG.revision,
  capabilities: CATALOG.extensions.length,
  extension: {
    mixed_count: CATALOG.extensions.filter((extension) => extension.execution_type === "mixed").length,
    llm_count: CATALOG.extensions.filter((extension) => extension.execution_type === "llm").length,
  },
});
