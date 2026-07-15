import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { sha256 } from "../src/core/workspace/write-plan.js";
import { commitVendorStage, prepareVendorStage, walkFiles } from "../src/vendor-converters/shared/staging.js";
import { PRODUCTION_VENDOR_IDS } from "../src/vendor-converters/shared/production-vendors.js";

const PLUGIN_ROOT = path.resolve("skills/plugins");

void test("shared staging commits only the target vendor projection for all four converters", async () => {
  for (const vendorId of PRODUCTION_VENDOR_IDS) {
    const root = await mkdtemp(path.join(tmpdir(), `researchspec-staging-${vendorId}-`));
    const output = path.join(root, "output");
    const stage = path.join(root, "stage");
    try {
      await cp(PLUGIN_ROOT, output, { recursive: true });
      const before = await vendorOwnedHashes(output, PRODUCTION_VENDOR_IDS.filter((id) => id !== vendorId));
      await prepareVendorStage(output, stage, vendorId);
      await cp(path.join(PLUGIN_ROOT, "vendors", vendorId), path.join(stage, "vendors", vendorId), { recursive: true });
      for (const [area, extension] of [["vendor-bundles", "json"], ["vendor-manifests", "json"], ["conversion-reports", "md"]] as const) {
        await cp(path.join(PLUGIN_ROOT, area, `${vendorId}.${extension}`), path.join(stage, area, `${vendorId}.${extension}`));
      }
      await cp(path.join(PLUGIN_ROOT, "registry.json"), path.join(stage, "registry.json"));
      await writeFile(path.join(stage, "conversion-reports", `${vendorId}.md`), `${await readFile(path.join(stage, "conversion-reports", `${vendorId}.md`), "utf8")}\n`, "utf8");
      await commitVendorStage(stage, output, vendorId);
      assert.deepEqual(await vendorOwnedHashes(output, PRODUCTION_VENDOR_IDS.filter((id) => id !== vendorId)), before, vendorId);
    } finally { await rm(root, { recursive: true, force: true }); }
  }
});

async function vendorOwnedHashes(root: string, vendorIds: readonly string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const vendorId of vendorIds) {
    for (const file of await walkFiles(path.join(root, "vendors", vendorId))) result[path.relative(root, file)] = sha256(await readFile(file));
    for (const [area, extension] of [["vendor-bundles", "json"], ["vendor-manifests", "json"], ["conversion-reports", "md"]] as const) {
      const file = path.join(root, area, `${vendorId}.${extension}`);
      result[path.relative(root, file)] = sha256(await readFile(file));
    }
  }
  return result;
}
