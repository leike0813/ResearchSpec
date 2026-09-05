import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

export function testVendorAnchor(root: string, expected: {
  vendor: string;
  anchor: string;
  revision: string;
  capabilities: number;
  contentFiles?: number;
  extension?: Record<string, number>;
  toolFiles?: number;
}): void {
  void test(`${expected.vendor} anchor manifest matches its reviewed inputs`, async () => {
    const manifest = JSON.parse(await readFile(path.join(root, "audits", expected.vendor, expected.anchor, "manifest.json"), "utf8")) as {
      anchor_id: string;
      upstream: { revision: string; content_file_count: number; tree_sha256: string };
      advisory: { raw_skill_count: number };
      extension: { capability_count: number; profile_count: number; registry_subset_sha256: string } & Record<string, number | string>;
      review: { tool_file_count: number; tools_byte_identical: boolean; required_fields_bound: boolean };
      maintenance: Record<string, string>;
    };
    assert.equal(manifest.anchor_id, expected.anchor);
    assert.equal(manifest.upstream.revision, expected.revision);
    if (expected.contentFiles !== undefined) assert.equal(manifest.upstream.content_file_count, expected.contentFiles);
    assert.equal(manifest.advisory.raw_skill_count, expected.capabilities);
    assert.equal(manifest.extension.capability_count, expected.capabilities);
    assert.equal(manifest.extension.profile_count, expected.capabilities);
    for (const [key, value] of Object.entries(expected.extension ?? {})) assert.equal(manifest.extension[key], value);
    if (expected.toolFiles !== undefined) {
      assert.equal(manifest.review.tool_file_count, expected.toolFiles);
      assert.equal(manifest.review.tools_byte_identical, true);
      assert.equal(manifest.review.required_fields_bound, true);
    }
    for (const hash of [manifest.upstream.tree_sha256, manifest.extension.registry_subset_sha256, manifest.maintenance.record_sha256]) {
      assert.match(hash, /^[a-f0-9]{64}$/);
    }
    for (const [key, file] of [
      ["skill_sha256", `.agents/skills/${expected.vendor}-maintenance/SKILL.md`],
      ["catalog_sha256", `audits/${expected.vendor}/catalog.json`],
      ["audit_readme_sha256", `audits/${expected.vendor}/README.md`],
    ] as const) {
      const bytes = await readFile(path.join(root, file));
      assert.equal(createHash("sha256").update(bytes).digest("hex"), manifest.maintenance[key]);
    }
    const result = spawnSync(process.execPath, [`scripts/${expected.vendor}-maintenance.mjs`, "check", expected.anchor], {
      cwd: root,
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr || result.error?.message);
  });
}
