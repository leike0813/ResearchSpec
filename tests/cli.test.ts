import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { spawnSync } from "node:child_process";

const CLI = path.resolve("dist/src/cli/main.js");

void test("init --dry-run reports planned files without writing", async () => {
  const dir = await tempDir();
  const result = runCli(["init", dir, "--tools", "none", "--dry-run"]);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Would create: .*researchspec/);
  assert.equal(existsSync(path.join(dir, "researchspec")), false);
  await cleanup(dir);
});

void test("init --tools none creates workspace skeleton", async () => {
  const dir = await tempDir();
  const result = runCli(["init", dir, "--tools", "none"]);

  assert.equal(result.status, 0);
  assert.equal(existsSync(path.join(dir, "researchspec/specs/project.md")), true);
  assert.equal(existsSync(path.join(dir, "researchspec/runs/current/state.yaml")), true);
  assert.equal(existsSync(path.join(dir, "researchspec/runs/current/artifact-registry.json")), true);
  await cleanup(dir);
});

void test("init does not overwrite existing workspace files", async () => {
  const dir = await tempDir();
  const projectPath = path.join(dir, "researchspec/specs/project.md");

  assert.equal(runCli(["init", dir, "--tools", "none"]).status, 0);
  await writeFile(projectPath, "custom project text", "utf8");

  const rerun = runCli(["init", dir, "--tools", "none"]);
  assert.equal(rerun.status, 1);
  assert.equal(await readFile(projectPath, "utf8"), "custom project text");
  await cleanup(dir);
});

void test("status reports missing and initialized workspace states", async () => {
  const dir = await tempDir();

  const missing = runCli(["status"], dir);
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /No researchspec workspace found/);

  assert.equal(runCli(["init", dir, "--tools", "none"]).status, 0);
  const initialized = runCli(["status"], dir);
  assert.equal(initialized.status, 0);
  assert.match(initialized.stdout, /Status: initialized/);

  const child = path.join(dir, "nested/project");
  await mkdir(child, { recursive: true });
  const discovered = runCli(["status"], child);
  assert.equal(discovered.status, 0);
  assert.match(discovered.stdout, /Status: initialized/);

  const json = runCli(["status", "--json"], dir);
  assert.equal(json.status, 0);
  const parsedStatus = JSON.parse(json.stdout) as { status?: string };
  assert.equal(parsedStatus.status, "initialized");
  await cleanup(dir);
});

void test("check passes on fresh workspace", async () => {
  const dir = await tempDir();
  assert.equal(runCli(["init", dir, "--tools", "none"]).status, 0);

  const check = runCli(["check"], dir);
  assert.equal(check.status, 0);
  assert.match(check.stdout, /check passed/);
  await cleanup(dir);
});

void test("check reports missing and invalid workspace files", async () => {
  const dir = await tempDir();
  assert.equal(runCli(["init", dir, "--tools", "none"]).status, 0);

  await rm(path.join(dir, "researchspec/specs/claims.yaml"));
  const missing = runCli(["check", "--json"], dir);
  assert.equal(missing.status, 1);
  assert.match(missing.stdout, /required_file_missing/);

  assert.equal(runCli(["init", path.join(dir, "second"), "--tools", "none"]).status, 0);
  await writeFile(path.join(dir, "second/researchspec/specs/sources.yaml"), "schema_version: [oops", "utf8");
  await writeFile(path.join(dir, "second/researchspec/runs/current/artifact-registry.json"), "{", "utf8");
  await writeFile(path.join(dir, "second/researchspec/runs/current/decision-ledger.jsonl"), "{bad json}\n", "utf8");

  const invalid = runCli(["check", "--json"], path.join(dir, "second"));
  assert.equal(invalid.status, 1);
  assert.match(invalid.stdout, /invalid_yaml/);
  assert.match(invalid.stdout, /invalid_json/);
  assert.match(invalid.stdout, /invalid_jsonl/);
  await cleanup(dir);
});

function runCli(args: string[], cwd = process.cwd()): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync(process.execPath, [CLI, ...args], {
    cwd,
    encoding: "utf8",
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

async function tempDir(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), "researchspec-test-"));
}

async function cleanup(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true });
}
