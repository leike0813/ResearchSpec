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
  assert.equal(catalog.revision, "6b50abef032a702554e2b34a4f592ee674f12f8f");
  assert.equal(catalog.extensions.length, 130);
  assert.equal(catalog.extensions.filter((item) => item.execution_type === "mixed").length, 42);
  assert.equal(catalog.extensions.filter((item) => item.execution_type === "llm").length, 88);
  assert.equal(new Set(catalog.extensions.map((item) => item.raw_skill_id)).size, 130);
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
  "anchor": "v1.5.10-6b50abe",
  "revision": "6b50abef032a702554e2b34a4f592ee674f12f8f",
  "capabilities": 130,
  "extension": {
    "mixed_count": 42,
    "llm_count": 88
  },
  "toolFiles": 350
});

void test("ToolUniverse retains reviewed extension identities, profiles and pinned prior content", async () => {
  const previous = await readProjection("v1.5.4-8ec5d4b");
  const current = await readProjection("v1.5.10-6b50abe");
  assert.deepEqual(current.capability_ids, previous.capability_ids);
  assert.equal(current.profiles_tree_sha256, previous.profiles_tree_sha256);

  const retainedId = "plugin-tooluniverse-protein-therapeutic-design";
  const hash = (projection: typeof current) => projection.rows.find((row) => row.capability_id === retainedId)?.package_tree_sha256;
  assert.ok(hash(previous));
  assert.equal(hash(current), hash(previous));
});

async function readProjection(anchor: string) {
  const manifest = JSON.parse(await readFile(path.join(ROOT, "audits/tooluniverse", anchor, "manifest.json"), "utf8")) as {
    extension: {
      capability_ids: string[];
      profiles_tree_sha256: string;
      rows: Array<{ capability_id: string; package_tree_sha256: string }>;
    };
  };
  return manifest.extension;
}
