import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { fileURLToPath } from "node:url";
import { testVendorAnchor } from "./helpers/vendor-maintenance.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

void test("Materials-Science maintenance catalog maps seven reviewed Skills to seven extensions", async () => {
  const catalog = JSON.parse(await readFile(path.join(ROOT, "audits/materials-science-skills-for-llm/catalog.json"), "utf8")) as {
    vendor_id: string;
    revision: string;
    extensions: Array<{ capability_id: string; raw_skill_id: string; execution_type: string; required_brief_fields: string[] }>;
  };
  assert.equal(catalog.vendor_id, "materials-science-skills-for-llm");
  assert.equal(catalog.revision, "fafd3ab011e4c363658a39c4bb62fc739839d58c");
  assert.equal(catalog.extensions.length, 7);
  assert.equal(catalog.extensions.filter((item) => item.execution_type === "llm").length, 7);
  assert.deepEqual(catalog.extensions.map((item) => item.raw_skill_id).sort(), [
    "materials-science-skills-apex-alloy-workflows",
    "materials-science-skills-atomsk-cli",
    "materials-science-skills-deeptb-helper",
    "materials-science-skills-dpgen-workflow",
    "materials-science-skills-gpumd-workflow",
    "materials-science-skills-phonopy-workflows",
    "materials-science-skills-unimol-ops",
  ]);
  for (const extension of catalog.extensions) assert.ok(extension.required_brief_fields.length >= 6);
});

testVendorAnchor(ROOT, {
  "vendor": "materials-science-skills-for-llm",
  "anchor": "snapshot-fafd3ab",
  "revision": "fafd3ab011e4c363658a39c4bb62fc739839d58c",
  "capabilities": 7,
  "contentFiles": 46,
  "extension": {
    "llm_count": 7,
    "script_validator_count": 7
  }
});
