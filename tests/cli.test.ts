import assert from "node:assert/strict";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { test } from "node:test";

import { CLI_TOP_LEVEL_COMMANDS, cliHelpTarget } from "../src/cli/command-catalog.js";
import { renderCliHandbook } from "../src/cli/handbook.js";
import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

void test("help and catalog expose exactly the sixteen current top-level commands", () => {
  const expected = [
    "init", "update", "status", "instructions", "start", "advance", "check", "doctor",
    "list", "show", "handoff", "pack", "propose", "decide", "archive", "plugin",
  ];
  assert.deepEqual(CLI_TOP_LEVEL_COMMANDS.map((item) => item.id), expected);
  const help = runCli(["--help"]);
  assert.equal(help.status, 0, help.stderr);
  for (const command of expected) assert.match(help.stdout, new RegExp(`^ {2}${command}(?: |$)`, "m"));
  assert.doesNotMatch(help.stdout, /^ {2}submit(?: |$)/m);
  assert.equal(runCli(["--version"]).status, 0);
});

void test("static help is workspace-free and contextual usage targets remain precise", () => {
  assert.equal(runCli(["plugin", "install", "--help"]).status, 0);
  assert.equal(runCli(["start", "--help"]).status, 0);
  assert.equal(cliHelpTarget(["plugin", "install", "domain-id", "--summary"]), "researchspec plugin install --help");
  assert.equal(cliHelpTarget(["start", "route:deep-research:full", "--input", "start.yaml"]), "researchspec start --help");
});

void test("removed commands and options fail before any workspace write", async () => {
  const root = await tempProject();
  try {
    const cases = [
      ["submit", "work:any", "--json"],
      ["init", root, "--tools", "none", "--profile", "strict", "--json"],
      ["update", root, "--migrate-runtime", "--json"],
      ["doctor", "--expected-plan-sha256", "0".repeat(64), "--json"],
      ["plugin", "install", "geoscience", "--expected-plan-sha256", "0".repeat(64), "--json"],
    ];
    for (const args of cases) {
      const result = runCli(args, root);
      assert.equal(result.status, 2, `${args.join(" ")}\n${result.stderr}\n${result.stdout}`);
    }
    assert.deepEqual(await readdir(root), []);
  } finally {
    await cleanup(root);
  }
});

void test("JSON errors use the schema 1 envelope", () => {
  const result = parseEnvelope(runCli(["status", "--json"]));
  assert.equal(result.schema_version, "1");
  assert.equal(result.command, "status");
  assert.equal(result.ok, false);
  assert.equal(result.error?.code, "workspace_missing");
});

void test("source handbook is generated from the current command catalog", async () => {
  const handbook = await readFile(path.resolve("docs/cli_handbook.md"), "utf8");
  assert.equal(handbook, renderCliHandbook());
  assert.doesNotMatch(handbook, /researchspec submit|expected-plan-sha256|action-basis/);
});

void test("fresh command-capable delivery installs sixteen catalog wrappers", async () => {
  const root = await tempProject();
  try {
    const initialized = runCli(["init", root, "--tools", "gemini", "--delivery", "both", "--json"]);
    assert.equal(initialized.status, 0, initialized.stderr || initialized.stdout);
    const commandRoot = path.join(root, ".gemini/commands/researchspec");
    const wrappers = (await readdir(commandRoot)).filter((item) => item.endsWith(".toml")).sort();
    assert.deepEqual(wrappers, CLI_TOP_LEVEL_COMMANDS.map((item) => `${item.id}.toml`).sort());
    assert.equal(wrappers.includes("submit.toml"), false);
    const statusWrapper = await readFile(path.join(commandRoot, "status.toml"), "utf8");
    assert.match(statusWrapper, /researchspec status \$ARGUMENTS/);
  } finally {
    await cleanup(root);
  }
});

void test("update removes clean obsolete wrappers and preserves drifted ones", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "gemini", "--delivery", "both"]).status, 0);
    const manifestPath = path.join(root, "researchspec/tool-installation-manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
      installations: Array<Record<string, unknown>>;
    };
    const template = manifest.installations.find((item) => {
      const source = item.source as { kind?: string } | undefined;
      return item.tool_id === "gemini" && source?.kind === "command";
    });
    assert.ok(template);
    for (const [id, content] of [["deep-research", "clean legacy wrapper\n"], ["navigate", "recorded legacy wrapper\n"]] as const) {
      const relative = `.gemini/commands/researchspec/${id}.toml`;
      const absolute = path.join(root, relative);
      await writeFile(absolute, content, "utf8");
      manifest.installations.push({
        ...structuredClone(template),
        source: { kind: "command", command_id: id },
        target: { scope: "project", path: relative, executable: false },
        sha256: hash(content),
      });
    }
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    const driftedPath = path.join(root, ".gemini/commands/researchspec/navigate.toml");
    await writeFile(driftedPath, "user drift\n", "utf8");

    const updated = parseEnvelope(runCli(["update", "--json"], root));
    assert.equal(updated.ok, true);
    await assert.rejects(readFile(path.join(root, ".gemini/commands/researchspec/deep-research.toml"), "utf8"));
    assert.equal(await readFile(driftedPath, "utf8"), "user drift\n");
    assert.ok(updated.diagnostics.some((item) => JSON.stringify(item).includes("generated_file_drift")));
  } finally {
    await cleanup(root);
  }
});

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
