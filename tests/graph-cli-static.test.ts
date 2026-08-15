import assert from "node:assert/strict";
import { test } from "node:test";

import { cliHelpTarget } from "../src/cli/command-catalog.js";
import { cleanup, runCli, tempProject } from "./helpers/cli.js";

void test("graph CLI still exposes the complete public command registry", () => {
  const help = runCli(["--help"]);
  assert.equal(help.status, 0);
  for (const command of ["init", "update", "status", "instructions", "start", "advance", "check", "doctor", "list", "show", "handoff", "pack", "propose", "decide", "archive", "plugin"]) {
    assert.match(help.stdout, new RegExp(`\\b${command}\\b`));
  }
});

void test("graph CLI reports its package version without a workspace", () => {
  const version = runCli(["--version"]);
  assert.equal(version.status, 0);
  assert.match(version.stdout, /0\.1\.0/);
});

void test("static help target resolution remains catalog-backed", () => {
  assert.equal(cliHelpTarget(["plugin", "install", "domain-id", "--summary"]), "researchspec plugin install --help");
  assert.equal(cliHelpTarget(["advance", "node:run/node", "--input", "advance.yaml"]), "researchspec advance --help");
  assert.equal(cliHelpTarget(["unknown"]), "researchspec --help");
});

void test("missing workspace uses the stable unsupported envelope", async () => {
  const root = await tempProject();
  try {
    const status = runCli(["status", "--json"], root);
    assert.equal(status.status, 1);
    assert.match(status.stdout, /workspace_missing|workspace_unsupported/);
  } finally {
    await cleanup(root);
  }
});
