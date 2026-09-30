import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { fileURLToPath } from "node:url";
import { testVendorAnchor } from "./helpers/vendor-maintenance.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

void test("Education Agent Skills maintenance catalog maps 136 reviewed Skills to 136 extensions", async () => {
  const catalog = JSON.parse(await readFile(path.join(ROOT, "audits/education-agent-skills/catalog.json"), "utf8")) as {
    vendor_id: string;
    revision: string;
    extensions: Array<{ capability_id: string; raw_skill_id: string; execution_type: string; required_brief_fields: string[] }>;
  };
  const bundle = JSON.parse(await readFile(path.join(ROOT, "skills/plugins/vendor-bundles/education-agent-skills.json"), "utf8")) as {
    vendor: { revision: string };
  };
  assert.equal(catalog.vendor_id, "education-agent-skills");
  assert.equal(catalog.revision, bundle.vendor.revision);
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

testVendorAnchor(ROOT, {
  "vendor": "education-agent-skills",
  "anchor": "snapshot-6bbbce4",
  "revision": "6bbbce418f82e11044009c9f3b7373a354de5bd0",
  "capabilities": 136,
  "contentFiles": 241,
  "extension": {
    "llm_count": 136,
    "mixed_count": 0
  },
  "toolFiles": 0
});
