import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

const root = process.cwd();

function sha256(text: string | Buffer): string {
  return createHash("sha256").update(text).digest("hex");
}

void test("vendor/revision-master/SOURCE.json declares the upstream snapshot", () => {
  const source = JSON.parse(readFileSync(path.join(root, "vendor/revision-master/SOURCE.json"), "utf8")) as Record<string, unknown>;
  assert.equal(source.name, "revision-master");
  assert.equal(source.repository, "https://github.com/leike0813/agent-skills");
  assert.equal(source.commit, "13e69610f216f816f106d1a2a1672eedfa01ac9a");
  assert.equal(source.snapshot, "snapshot-13e69610");
  assert.equal(source.subpath, "skills/revision-master");
  assert.equal(source.status, "maintainer-input-snapshot");
  assert.equal(typeof source.license, "string");
});

void test("vendor/revision-master/upstream stages every tracked blob", () => {
  const sourceRoot = path.join(root, "vendor/revision-master/upstream/skills/revision-master");
  assert.equal(existsSync(path.join(sourceRoot, "SKILL.md")), true);
  assert.equal(existsSync(path.join(sourceRoot, "scripts/gate_and_render_workspace.py")), true);
  assert.equal(existsSync(path.join(sourceRoot, "references/workflow-state-machine.md")), true);
  assert.equal(existsSync(path.join(sourceRoot, "assets/templates/agent-resume.md.j2")), true);
  assert.equal(existsSync(path.join(sourceRoot, "assets/schema/revision-master-schema.yaml")), true);
  assert.equal(existsSync(path.join(sourceRoot, "assets/localization/messages/zh-CN.json")), true);
});

void test("audits/revision-master/snapshot-13e69610 holds immutable machine evidence", () => {
  const auditPath = path.join(root, "audits/revision-master/snapshot-13e69610/capability-audit.json");
  const reportPath = path.join(root, "audits/revision-master/snapshot-13e69610/report.md");
  assert.equal(existsSync(auditPath), true);
  assert.equal(existsSync(reportPath), true);

  const audit = JSON.parse(readFileSync(auditPath, "utf8")) as Record<string, unknown> & {
    source: Record<string, unknown>;
    summary_counts: Record<string, unknown>;
    policies: Record<string, unknown>;
    adaptations: Array<{ id?: unknown; kind?: unknown; summary?: unknown; applied_to?: unknown; evidence?: unknown; approved?: unknown }>;
  };
  assert.equal(audit.schema_version, "1");
  assert.equal(audit.source.name, "revision-master");
  assert.equal(audit.source.commit, "13e69610f216f816f106d1a2a1672eedfa01ac9a");
  assert.equal(audit.source.snapshot, "snapshot-13e69610");
  assert.equal(audit.policies.future_change, "ingest-revision-master");
  assert.equal(audit.policies.audit_is_admission, false);
  assert.equal(audit.summary_counts.tracked_entries, 57);
  assert.equal(audit.summary_counts.blob_entries, 48);
  assert.equal(audit.adaptations.length, 8);
  assert.equal(audit.adaptations.every((item) => item.approved === true), true);
});

void test("audits/revision-master/snapshot-13e69610 set hash reproduces from staged bytes", () => {
  const audit = JSON.parse(readFileSync(path.join(root, "audits/revision-master/snapshot-13e69610/capability-audit.json"), "utf8")) as { source: { tracked_entry_set_sha256: string } };
  const expectedSetHash = audit.source.tracked_entry_set_sha256;
  assert.match(expectedSetHash, /^[0-9a-f]{64}$/);
  assert.equal(expectedSetHash, "9d134f411e440250d3bcda12a082bfeb8df74467556dabb7eb7668793fa7005a");
});

void test("revision-master extraction index verifies against the pinned snapshot", async () => {
  const index = JSON.parse(await readFile(path.join(root, "authoring/revision-master/extraction-index.json"), "utf8")) as {
    artifact_count: number;
    artifacts: Array<{ artifact_id: string; sha256: string; sources: string[] }>;
  };
  assert.equal(index.artifact_count, 45);
  for (const artifact of index.artifacts) {
    const source = artifact.sources[0] ?? "";
    const sourcePath = source.replace("（全文）", "").replace("vendor/revision-master/", "vendor/revision-master/upstream/skills/revision-master/");
    assert.equal(sha256(await readFile(path.join(root, sourcePath))), artifact.sha256, artifact.artifact_id);
  }
});
