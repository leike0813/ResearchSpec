import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

void test("capability parity audit reports complete coverage above thresholds", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-capability-parity-"));
  try {
    const reportPath = path.join(root, "report.json");
    const stdout = execFileSync(process.execPath, [
      "scripts/audit-capability-parity.mjs",
      "--json",
      reportPath,
    ], { encoding: "utf8" });
    const summary = JSON.parse(stdout) as {
      total: number;
      operational: number;
      avg_section_coverage: number;
      avg_rule_coverage: number;
      below_section_threshold: string[];
      below_rule_threshold: string[];
      output_missing: string[];
      knowledge_below_threshold: string[];
      flow_retained: unknown[];
    };
    assert.equal(summary.total, 42);
    assert.equal(summary.operational, 42);
    assert.deepEqual(summary.below_section_threshold, []);
    assert.deepEqual(summary.below_rule_threshold, []);
    assert.deepEqual(summary.output_missing, []);
    assert.deepEqual(summary.knowledge_below_threshold, []);
    assert.deepEqual(summary.flow_retained, []);
    assert.ok(summary.avg_section_coverage >= 0.7);
    assert.ok(summary.avg_rule_coverage >= 0.6);
    const report = JSON.parse(await readFile(reportPath, "utf8")) as { schema_version: string; packages: Array<{ capability_id: string }> };
    assert.equal(report.schema_version, "1");
    assert.equal(report.packages.length, 42);
    assert.ok(report.packages.some((item) => item.capability_id === "cap-check-paper-humanization-review"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
