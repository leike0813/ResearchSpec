import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { fileURLToPath } from "node:url";
import { testVendorAnchor } from "./helpers/vendor-maintenance.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

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

testVendorAnchor(ROOT, {
  "vendor": "histagent",
  "anchor": "snapshot-47bbe21",
  "revision": "47bbe21dc81618489f5d5929358032883a3fe448",
  "capabilities": 3,
  "contentFiles": 120,
  "extension": {
    "mixed_count": 3
  }
});
