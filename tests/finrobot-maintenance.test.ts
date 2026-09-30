import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { fileURLToPath } from "node:url";
import { testVendorAnchor } from "./helpers/vendor-maintenance.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

void test("FinRobot maintenance catalog maps six reviewed Skills to six extensions", async () => {
  const catalog = JSON.parse(await readFile(path.join(ROOT, "audits/finrobot/catalog.json"), "utf8")) as {
    vendor_id: string;
    revision: string;
    extensions: Array<{ capability_id: string; raw_skill_id: string; execution_type: string; required_brief_fields: string[] }>;
  };
  assert.equal(catalog.vendor_id, "finrobot");
  assert.equal(catalog.revision, "2717499b8e30f242640af08c4ad9afd1113c2d45");
  assert.equal(catalog.extensions.length, 6);
  assert.equal(catalog.extensions.filter((item) => item.execution_type === "mixed").length, 4);
  assert.equal(catalog.extensions.filter((item) => item.execution_type === "llm").length, 2);
  assert.deepEqual(catalog.extensions.map((item) => item.raw_skill_id).sort(), [
    "financial-research-company-fundamentals",
    "financial-research-competitive-position",
    "financial-research-corporate-risk",
    "financial-research-event-evidence",
    "financial-research-relative-valuation",
    "financial-research-statement-analysis",
  ]);
  for (const extension of catalog.extensions) assert.ok(extension.required_brief_fields.length >= 5);
});

testVendorAnchor(ROOT, {
  "vendor": "finrobot",
  "anchor": "snapshot-2717499",
  "revision": "2717499b8e30f242640af08c4ad9afd1113c2d45",
  "capabilities": 6,
  "contentFiles": 1048,
  "toolFiles": 8,
  "extension": { "mixed_count": 4, "llm_count": 2, "script_validator_count": 4 }
});
