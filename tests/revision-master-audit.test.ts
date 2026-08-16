import assert from "node:assert/strict";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { test } from "node:test";

import { main as revisionMasterCli } from "../src/vendor-converters/revision-master/cli.js";

const root = process.cwd();

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
  assert.deepEqual(audit.adaptations.find((item) => item.id === "paper-humanizer-reference-mode"), {
    id: "paper-humanizer-reference-mode",
    kind: "added",
    summary: "The published review-response SKILL loads the capability-graph Paper Humanizer Reference-mode entrypoint before manuscript or response-letter writing.",
    applied_to: ["SKILL.md"],
    evidence: "skills/review-response/SKILL.md loads cap-generation-humanization-reference/SKILL.md before manuscript or response-letter writing and does not reference paper-humanizer/references/prose-guidance.md.",
    approved: true,
  });
});

void test("audits/revision-master/snapshot-13e69610 set hash reproduces from staged bytes", () => {
  const audit = JSON.parse(readFileSync(path.join(root, "audits/revision-master/snapshot-13e69610/capability-audit.json"), "utf8")) as { source: { tracked_entry_set_sha256: string } };
  const expectedSetHash = audit.source.tracked_entry_set_sha256;
  assert.match(expectedSetHash, /^[0-9a-f]{64}$/);
  assert.equal(expectedSetHash, "9d134f411e440250d3bcda12a082bfeb8df74467556dabb7eb7668793fa7005a");
});

void test("skills/review-response/metadata.json binds the Skill to the snapshot", () => {
  const metadata = JSON.parse(readFileSync(path.join(root, "skills/review-response/metadata.json"), "utf8")) as Record<string, unknown>;
  assert.equal(metadata.skill_id, "review-response");
  assert.equal(metadata.source_skill_id, "revision-master");
  assert.equal(metadata.source_commit, "13e69610f216f816f106d1a2a1672eedfa01ac9a");
  assert.equal(metadata.source_snapshot, "snapshot-13e69610");
  assert.equal(metadata.source_repository, "https://github.com/leike0813/agent-skills");
  assert.equal(metadata.source_subpath, "skills/revision-master");
  assert.equal(metadata.license, "MIT");
});

void test("revision-master converter exposes convert/check/idempotence via package scripts", () => {
  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")) as { scripts: Record<string, string> };
  assert.match(pkg.scripts["revision-master:convert"] ?? "", /revision-master\/cli\.js convert$/);
  assert.match(pkg.scripts["revision-master:check"] ?? "", /revision-master\/cli\.js check$/);
  assert.match(pkg.scripts["revision-master:idempotence"] ?? "", /revision-master\/cli\.js idempotence$/);
});

void test("revision-master:check exits 0 against the current Skill tree", () => {
  const pycache = path.join(root, "skills/review-response/scripts/__pycache__");
  rmSync(pycache, { recursive: true, force: true });
  const result = spawnSync("pnpm", ["revision-master:check"], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, NODE_OPTIONS: "--no-warnings", PYTHONDONTWRITEBYTECODE: "1" },
  });
  rmSync(pycache, { recursive: true, force: true });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const stdout = result.stdout;
  const open = stdout.indexOf("{");
  const close = stdout.lastIndexOf("}");
  const json = JSON.parse(stdout.slice(open, close + 1)) as { ok: boolean };
  assert.equal(json.ok, true);
});

void test("revision-master converter CLI returns ok=true for check", async () => {
  const pycache = path.join(root, "skills/review-response/scripts/__pycache__");
  rmSync(pycache, { recursive: true, force: true });
  const previous = process.argv;
  process.argv = ["node", "cli.js", "check"];
  try {
    const code = await revisionMasterCli();
    assert.equal(code, 0);
  } finally {
    process.argv = previous;
    rmSync(pycache, { recursive: true, force: true });
  }
});

void test("revision-master converter rejects unknown subcommands", async () => {
  const previous = process.argv;
  process.argv = ["node", "cli.js", "explode"];
  try {
    const code = await revisionMasterCli();
    assert.equal(code, 1);
  } finally {
    process.argv = previous;
  }
});
