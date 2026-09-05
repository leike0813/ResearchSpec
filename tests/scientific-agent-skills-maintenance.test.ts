import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { fileURLToPath } from "node:url";
import { testVendorAnchor } from "./helpers/vendor-maintenance.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

void test("Scientific Agent Skills maintenance catalog maps 49 reviewed Skills to 49 extensions", async () => {
  const catalog = JSON.parse(await readFile(path.join(ROOT, "audits/scientific-agent-skills/catalog.json"), "utf8")) as {
    vendor_id: string;
    revision: string;
    extensions: Array<{ capability_id: string; raw_skill_id: string; execution_type: string; required_brief_fields: string[] }>;
  };
  assert.equal(catalog.vendor_id, "scientific-agent-skills");
  assert.equal(catalog.revision, "9c9bd2e92af12311ecd0c1a643e0931643f9ea04");
  assert.equal(catalog.extensions.length, 49);
  assert.equal(catalog.extensions.filter((item) => item.execution_type === "mixed").length, 18);
  assert.equal(catalog.extensions.filter((item) => item.execution_type === "llm").length, 31);
  assert.deepEqual(catalog.extensions.map((item) => item.raw_skill_id).slice(0, 1), ["scientific-agent-skills-aeon"]);
  for (const extension of catalog.extensions) assert.deepEqual(extension.required_brief_fields, [
    "scope",
    "source_ledger",
    "method_plan",
    "work_products",
    "validation_results",
    "conclusions",
  ]);
});

testVendorAnchor(ROOT, {
  "vendor": "scientific-agent-skills",
  "anchor": "v2.53.0",
  "revision": "9c9bd2e92af12311ecd0c1a643e0931643f9ea04",
  "capabilities": 49,
  "contentFiles": 1483,
  "extension": {
    "mixed_count": 18,
    "llm_count": 31
  },
  "toolFiles": 410
});
