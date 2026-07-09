import assert from "node:assert/strict";
import { test } from "node:test";

import { validateAnchorAssets } from "../src/arsu-converter/anchors/check.js";
import { generateUpstreamManifest } from "../src/arsu-converter/anchors/manifest.js";

void test("ARSU contract anchor assets validate against vendored upstream", async () => {
  const result = await validateAnchorAssets(process.cwd());

  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.deepEqual(result.warnings, []);
  assert.ok(result.anchor_count >= 30);
  assert.ok(result.manifest_file_count > 0);
});

void test("upstream manifest extracts contract-risk shape from shared handoff schemas", async () => {
  const manifest = await generateUpstreamManifest(process.cwd());
  const handoffSchemas = manifest.files.find((file) => file.path === "shared/handoff_schemas.md");

  assert.ok(handoffSchemas);
  assert.ok(handoffSchemas.headings?.some((heading) => heading.title === "Schema 9: Material Passport (cross-stage metadata)"));
  assert.ok(handoffSchemas.headings?.some((heading) => heading.title === "Schema 11: R&R Traceability Matrix"));
  assert.ok(handoffSchemas.risk_hits.some((hit) => hit.keyword === "Material Passport"));
  assert.ok(handoffSchemas.risk_hits.some((hit) => hit.keyword === "Schema 11"));
});
