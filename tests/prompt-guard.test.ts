import assert from "node:assert/strict";
import { execFileSync, execSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

import { ManagedInstallationSchema, type ManagedInstallation } from "../src/adapters/installations.js";
import { inspectPaperHumanizerHooks, planPaperHumanizerHooks } from "../src/adapters/prompt-guard.js";
import { TOOLS } from "../src/adapters/tools.js";
import { executeWritePlan } from "../src/core/workspace/write-plan.js";
import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

async function plan(root: string, tools: string[], existing: ManagedInstallation[] = [], enabled = true, reconciled = tools) {
  return planPaperHumanizerHooks({ projectRoot: root, selectedToolIds: tools, reconciledToolIds: reconciled, existingInstallations: existing, enabled });
}

void test("all reviewed native projections install and inject on successive turns", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-guard-'$`()-"));
  try {
    const tools = TOOLS.filter((tool) => tool.promptGuard);
    assert.equal(tools.length, 18);
    const result = await plan(root, tools.map((tool) => tool.id));
    assert.deepEqual(result.diagnostics, []);
    for (const item of result.installations) ManagedInstallationSchema.parse(item);
    await executeWritePlan({ boundaryRoot: root, operations: result.operations });
    const guard = await readFile(path.join(root, "researchspec/hooks/paper-humanizer/guard.md"), "utf8");
    for (const tool of tools) {
      const definition = tool.promptGuard;
      assert.ok(definition);
      const file = path.join(root, definition.path);
      if (["opencode", "kilo", "pi", "omp"].includes(definition.format)) {
        const plugin = await import(pathToFileURL(file).href) as { default: ((api?: unknown) => unknown) & { id: string; server: () => unknown } };
        if (definition.format === "opencode" || definition.format === "kilo") {
          if (definition.format === "kilo") assert.equal(plugin.default.id, "researchspec-paper-humanizer");
          const hooks = await (definition.format === "kilo" ? plugin.default.server() : plugin.default()) as Record<string, (_input: unknown, output: { system: string[] }) => Promise<void>>;
          for (let turn = 0; turn < 2; turn++) {
            const output = { system: ["original"] };
            await hooks[definition.event]({}, output);
            assert.deepEqual(output.system, ["original", guard]);
          }
        } else {
          const callbacks: Array<(event: { systemPrompt: string | string[] }) => Promise<{ systemPrompt: string | string[] }>> = [];
          plugin.default({ on: (event: string, cb: typeof callbacks[number]) => { assert.equal(event, definition.event); callbacks.push(cb); } });
          assert.equal(callbacks.length, 1);
          for (let turn = 0; turn < 2; turn++) {
            const output = await callbacks[0]({ systemPrompt: definition.format === "omp" ? ["original"] : "original" });
            assert.deepEqual(output.systemPrompt, definition.format === "omp" ? ["original", guard] : `original\n\n${guard}`);
          }
        }
      } else {
        let commands: string[];
        if (definition.format === "script") commands = [JSON.stringify(file)];
        else {
          const config: unknown = JSON.parse(await readFile(file, "utf8"));
          const matches = JSON.stringify(config).match(/"(?:command|bash)":"((?:\\.|[^"\\])*)"/g);
          assert.ok(matches);
          commands = matches.map((entry: string) => JSON.parse(`"${entry.slice(entry.indexOf(":") + 2, -1)}"`) as string);
        }
        for (const cmd of commands) for (let turn = 0; turn < 2; turn++) {
          const options = { cwd: tmpdir(), input: JSON.stringify({ transformedPrompt: `original ${String(turn)}` }), encoding: "utf8" as const };
          const stdout: string = definition.format === "script" ? execFileSync(file, [], options) : execSync(cmd, options);
          assert.ok(stdout.includes(guard) || JSON.stringify(JSON.parse(stdout)).includes(JSON.stringify(guard).slice(1, -1)), tool.id);
          if (definition.format === "copilot" && cmd.includes("copilot-transform")) assert.equal((JSON.parse(stdout) as { modifiedTransformedPrompt: string }).modifiedTransformedPrompt, `original ${String(turn)}\n\n${guard}`);
        }
      }
    }
    assert.deepEqual((await inspectPaperHumanizerHooks(root, tools.map((tool) => tool.id), true, result.installations)).diagnostics, []);
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("partial hook ownership preserves settings, detects races, and retains drift dependencies", async () => {
  const root = await tempProject();
  try {
    await mkdir(path.join(root, ".claude"));
    const file = path.join(root, ".claude/settings.json");
    const original = { model: "user-model", hooks: { UserPromptSubmit: [{ hooks: [{ type: "command", command: "echo user-hook" }] }] } };
    await writeFile(file, JSON.stringify(original));
    const first = await plan(root, ["claude"]);
    await executeWritePlan({ boundaryRoot: root, operations: first.operations });
    const config = JSON.parse(await readFile(file, "utf8")) as { model: string; extra?: boolean; hooks: { UserPromptSubmit: Array<{ hooks: Array<{ timeout?: number }> }> } };
    config.model = "changed-user-model";
    await writeFile(file, JSON.stringify(config));
    const update = await plan(root, ["claude"], first.installations);
    assert.deepEqual(update.diagnostics, []);
    config.extra = true;
    await writeFile(file, JSON.stringify(config));
    await assert.rejects(executeWritePlan({ boundaryRoot: root, operations: update.operations }), (error: unknown) => (error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT");
    config.hooks.UserPromptSubmit[1].hooks[0].timeout = 9;
    await writeFile(file, JSON.stringify(config));
    const off = await plan(root, [], first.installations, false, ["claude"]);
    assert.ok(off.diagnostics.some((item) => item.code === "prompt_guard_preserved"));
    assert.equal(off.installations.length, 3);
    await executeWritePlan({ boundaryRoot: root, operations: off.operations });
    await readFile(path.join(root, "researchspec/hooks/paper-humanizer/inject.cjs"));
    config.hooks.UserPromptSubmit[1].hooks[0].timeout = 5;
    await writeFile(file, JSON.stringify(config));
    const removed = await plan(root, [], off.installations, false, ["claude"]);
    await executeWritePlan({ boundaryRoot: root, operations: removed.operations });
    assert.deepEqual(removed.installations, []);
    assert.deepEqual(JSON.parse(await readFile(file, "utf8")), { ...original, model: "changed-user-model", extra: true });
    await assert.rejects(readFile(path.join(root, "researchspec/hooks/paper-humanizer/guard.md")), { code: "ENOENT" });
  } finally { await cleanup(root); }
});

void test("unowned scripts, malformed configs, unsafe paths and subset updates preserve existing files", async () => {
  const root = await tempProject();
  const outside = await tempProject();
  try {
    await mkdir(path.join(root, ".claude"));
    await writeFile(path.join(root, ".claude/settings.json"), "malformed");
    await symlink(outside, path.join(root, ".codex"), "dir");
    const result = await plan(root, ["claude", "codex"]);
    assert.equal(result.diagnostics.length, 2);
    assert.deepEqual(result.installations, []);
    assert.deepEqual(result.operations, []);
    assert.equal(await readFile(path.join(root, ".claude/settings.json"), "utf8"), "malformed");
    const first = await plan(root, ["pi"]);
    await executeWritePlan({ boundaryRoot: root, operations: first.operations });
    const subset = await plan(root, ["pi", "gemini"], first.installations, true, ["gemini"]);
    assert.equal(subset.installations.filter((item) => item.tool_id === "pi").length, 1);
    assert.equal(subset.operations.some((item) => item.path.includes(".pi/")), false);
    const script = path.join(root, ".pi/extensions/researchspec-paper-humanizer.mjs");
    const collision = await plan(root, ["pi"]);
    assert.ok(collision.diagnostics.some((item) => item.code === "prompt_guard_resource_conflict"));
    assert.equal(collision.operations.some((item) => item.path === script), false);
  } finally { await cleanup(root); await cleanup(outside); }
});

void test("CLI defaults, persisted off, modes and read-only inspection share one preference", async () => {
  const root = await tempProject();
  try {
    for (const delivery of ["skills", "commands", "both"]) {
      const result = runCli(["init", root, "--tools", "claude", "--delivery", delivery, "--json"]);
      assert.equal(result.status, 0, result.stderr);
      const status = parseEnvelope<{ agent_tools: { paper_humanizer_guard: string; prompt_guards: Array<{ installed: boolean; host_loading: string }> } }>(runCli(["status", "--json"], root));
      assert.equal(status.data?.agent_tools.paper_humanizer_guard, "on");
      assert.equal(status.data?.agent_tools.prompt_guards[0].installed, true);
      assert.equal(status.data?.agent_tools.prompt_guards[0].host_loading, "unverified");
    }
    assert.equal(runCli(["update", "--paper-humanizer-guard", "off", "--json"], root).status, 0);
    assert.equal(runCli(["init", root, "--tools", "claude", "--json"]).status, 0);
    const status = parseEnvelope<{ agent_tools: { paper_humanizer_guard: string } }>(runCli(["status", "--json"], root));
    assert.equal(status.data?.agent_tools.paper_humanizer_guard, "off");
    assert.equal(parseEnvelope(runCli(["update", "--paper-humanizer-guard", "invalid", "--json"], root)).error?.code, "invalid_paper_humanizer_guard");
    assert.equal(runCli(["check", "tools", "--json"], root).status, 0);
    assert.equal(runCli(["doctor", "--json"], root).status, 0);
  } finally { await cleanup(root); }
});
