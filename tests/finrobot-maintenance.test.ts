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
  assert.equal(catalog.revision, "297a8d28d099be328c8a8eb658b4f782b93f3651");
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
  "anchor": "snapshot-297a8d2",
  "revision": "297a8d28d099be328c8a8eb658b4f782b93f3651",
  "capabilities": 6
});
