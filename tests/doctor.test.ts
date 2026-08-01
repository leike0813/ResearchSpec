import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { loadCurrentWorkspaceIndex } from "../src/core/runtime/workspace-index.js";
import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";
import { startCommand } from "./helpers/current-workspace.js";

void test("Doctor is read-only for a healthy current workspace", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const configPath = path.join(root, "researchspec/config.yaml");
    const before = await readFile(configPath);
    const result = parseEnvelope<{ healthy: boolean }>(runCli(["doctor", "--json"], root));
    assert.equal(result.ok, true);
    assert.equal(result.data?.healthy, true);
    assert.deepEqual(await readFile(configPath), before);
  } finally {
    await cleanup(root);
  }
});

void test("Doctor rejects an unsupported workspace without changing it", async () => {
  const root = await tempProject();
  try {
    const workspace = path.join(root, "researchspec");
    await mkdir(workspace, { recursive: true });
    const configPath = path.join(workspace, "config.yaml");
    const bytes = "schema_version: \"0.2\"\nprofile: strict\n";
    await writeFile(configPath, bytes, "utf8");
    const result = parseEnvelope(runCli(["doctor", "--json"], root));
    assert.equal(result.ok, false);
    assert.equal(result.error?.code, "workspace_unsupported");
    assert.equal(await readFile(configPath, "utf8"), bytes);
  } finally {
    await cleanup(root);
  }
});

void test("Doctor reports a damaged control and never repairs its bytes", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const inputPath = path.join(root, "start.json");
    await writeFile(inputPath, `${JSON.stringify(startCommand("deep-research:quick", "2026-08-02T00:00:00Z"), null, 2)}\n`, "utf8");
    const started = runCli([
      "start", "deep-research:quick", "--input", inputPath,
      "--confirmed-by", "Researcher", "--json",
    ], root);
    assert.equal(started.status, 0, started.stderr || started.stdout);
    const index = await loadCurrentWorkspaceIndex(path.join(root, "researchspec"));
    const controlPath = index.subflows[0]?.controlPath;
    assert.ok(controlPath);
    const damaged = "schema_version: [broken\n";
    await writeFile(controlPath, damaged, "utf8");
    const result = parseEnvelope<{ healthy: boolean }>(runCli(["doctor", "--json"], root));
    assert.equal(result.ok, false);
    assert.equal(result.data?.healthy, false);
    assert.ok(result.diagnostics.some((item) => JSON.stringify(item).includes("subflow_control_invalid")));
    assert.equal(await readFile(controlPath, "utf8"), damaged);
  } finally {
    await cleanup(root);
  }
});
