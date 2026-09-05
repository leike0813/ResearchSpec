import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { fileURLToPath } from "node:url";
import { testVendorAnchor } from "./helpers/vendor-maintenance.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

void test("ToolUniverse maintenance catalog maps 130 reviewed Skills to 130 extensions", async () => {
  const catalog = JSON.parse(await readFile(path.join(ROOT, "audits/tooluniverse/catalog.json"), "utf8")) as {
    vendor_id: string;
    revision: string;
    extensions: Array<{ capability_id: string; raw_skill_id: string; execution_type: string; required_brief_fields: string[] }>;
  };
  assert.equal(catalog.vendor_id, "tooluniverse");
  assert.equal(catalog.revision, "9b7ff91ddb45b567cac2fa8ea31b82851e877617");
  assert.equal(catalog.extensions.length, 130);
  assert.equal(catalog.extensions.filter((item) => item.execution_type === "mixed").length, 42);
  assert.equal(catalog.extensions.filter((item) => item.execution_type === "llm").length, 88);
  assert.deepEqual(catalog.extensions.map((item) => item.raw_skill_id).slice(0, 1), ["tooluniverse-acmg-variant-classification"]);
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
  "vendor": "tooluniverse",
  "anchor": "v1.3.1",
  "revision": "9b7ff91ddb45b567cac2fa8ea31b82851e877617",
  "capabilities": 130,
  "contentFiles": 7365,
  "extension": {
    "mixed_count": 42,
    "llm_count": 88
  },
  "toolFiles": 348
});
