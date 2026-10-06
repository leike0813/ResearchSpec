import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { planPaperHumanizerHooks } from "../src/adapters/prompt-guard.js";
import { executeWritePlan } from "../src/core/workspace/write-plan.js";
import { cleanup, tempProject } from "./helpers/cli.js";

function asObject(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) assert.fail("expected a JSON object");
  return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
  if (!Array.isArray(value)) assert.fail("expected a JSON array");
  return value;
}

function asString(value: unknown, message: string): string {
  if (typeof value !== "string") assert.fail(message);
  return value;
}

function readJson(content: string): Record<string, unknown> {
  return JSON.parse(content) as Record<string, unknown>;
}

function handlerOf(entry: unknown): Record<string, unknown> {
  return asObject(asArray(asObject(entry).hooks)[0]);
}

async function installHooks(root: string, toolIds: readonly string[]) {
  const plan = await planPaperHumanizerHooks({ projectRoot: root, selectedToolIds: toolIds, reconciledToolIds: toolIds, existingInstallations: [], enabled: true });
  await executeWritePlan({ boundaryRoot: root, operations: plan.operations });
  return plan;
}

const GROUPS_HOSTS = [
  { id: "claude", file: ".claude/settings.json", events: ["UserPromptSubmit", "SubagentStart"], protocol: "context" },
  { id: "codex", file: ".codex/hooks.json", events: ["UserPromptSubmit", "SubagentStart"], protocol: "context" },
  { id: "qwen", file: ".qwen/settings.json", events: ["UserPromptSubmit", "SubagentStart"], protocol: "context" },
  { id: "qoder", file: ".qoder/settings.json", events: ["UserPromptSubmit", "SubagentStart"], protocol: "context" },
  { id: "codebuddy", file: ".codebuddy/settings.json", events: ["UserPromptSubmit"], protocol: "context" },
  { id: "trae", file: ".trae/hooks.json", events: ["UserPromptSubmit"], protocol: "context" },
  { id: "gemini", file: ".gemini/settings.json", events: ["BeforeAgent"], protocol: "gemini" },
  { id: "junie", file: ".junie/config.json", events: ["UserPromptSubmit"], protocol: "junie" },
];

void test("reviewed groups hosts write a hooks object with a timed command handler per event", async () => {
  const root = await tempProject();
  try {
    await installHooks(root, GROUPS_HOSTS.map((host) => host.id));
    for (const host of GROUPS_HOSTS) {
      const config = readJson(await readFile(path.join(root, host.file), "utf8"));
      const hooks = asObject(config.hooks);
      assert.deepEqual(Object.keys(hooks).sort(), [...host.events].sort(), host.id);
      for (const event of host.events) {
        const handler = handlerOf(asArray(hooks[event])[0]);
        assert.equal(handler.type, "command", host.id + " " + event);
        assert.equal(handler.timeout, 5, host.id + " " + event);
        assert.ok(asString(handler.command, host.id).includes(".run('" + host.protocol + "','" + event + "')"), host.id + " " + event);
      }
    }
  } finally {
    await cleanup(root);
  }
});

void test("codex sets additionalContextLimit 5000 on both prompt and subagent handlers", async () => {
  const root = await tempProject();
  try {
    await installHooks(root, ["codex"]);
    const hooks = asObject(readJson(await readFile(path.join(root, ".codex/hooks.json"), "utf8")).hooks);
    for (const event of ["UserPromptSubmit", "SubagentStart"]) {
      assert.equal(handlerOf(asArray(hooks[event])[0]).additionalContextLimit, 5000, event);
    }
  } finally {
    await cleanup(root);
  }
});

void test("factory writes root-level events to .factory/hooks.json and prefers it over settings.json", async () => {
  const fresh = await tempProject();
  try {
    const plan = await installHooks(fresh, ["factory"]);
    assert.deepEqual(plan.installations.filter((item) => item.tool_id === "factory").map((item) => item.target.path), [".factory/hooks.json"]);
    const config = readJson(await readFile(path.join(fresh, ".factory/hooks.json"), "utf8"));
    assert.equal(config.hooks, undefined);
    const handler = handlerOf(asArray(config.UserPromptSubmit)[0]);
    assert.equal(handler.timeout, 5);
    assert.ok(asString(handler.command, "factory").includes(".run('plain','UserPromptSubmit')"));
  } finally {
    await cleanup(fresh);
  }

  const both = await tempProject();
  try {
    await mkdir(path.join(both, ".factory"));
    const settings = JSON.stringify({ theme: "dark", hooks: { UserPromptSubmit: [{ hooks: [{ type: "command", command: "echo user" }] }] } });
    await writeFile(path.join(both, ".factory/settings.json"), settings);
    await writeFile(path.join(both, ".factory/hooks.json"), "{}");
    const plan = await installHooks(both, ["factory"]);
    assert.deepEqual(plan.installations.filter((item) => item.tool_id === "factory").map((item) => item.target.path), [".factory/hooks.json"]);
    assert.ok(Array.isArray(readJson(await readFile(path.join(both, ".factory/hooks.json"), "utf8")).UserPromptSubmit));
    assert.equal(await readFile(path.join(both, ".factory/settings.json"), "utf8"), settings);
  } finally {
    await cleanup(both);
  }
});

void test("factory merges into an existing .factory/settings.json hooks object and preserves its settings", async () => {
  const root = await tempProject();
  try {
    await mkdir(path.join(root, ".factory"));
    const settings = { theme: "dark", hooks: { UserPromptSubmit: [{ hooks: [{ type: "command", command: "echo user" }] }] } };
    await writeFile(path.join(root, ".factory/settings.json"), JSON.stringify(settings));
    const plan = await installHooks(root, ["factory"]);
    assert.deepEqual(plan.installations.filter((item) => item.tool_id === "factory").map((item) => item.target.path), [".factory/settings.json"]);
    const config = readJson(await readFile(path.join(root, ".factory/settings.json"), "utf8"));
    assert.equal(config.theme, "dark");
    const entries = asArray(asObject(config.hooks).UserPromptSubmit);
    assert.equal(entries.length, 2);
    assert.deepEqual(entries[0], settings.hooks.UserPromptSubmit[0]);
    const handler = handlerOf(entries[1]);
    assert.equal(handler.timeout, 5);
    assert.ok(asString(handler.command, "factory").includes(".run('plain','UserPromptSubmit')"));
  } finally {
    await cleanup(root);
  }
});

void test("cursor writes version 1 with a timed command entry array", async () => {
  const root = await tempProject();
  try {
    await installHooks(root, ["cursor"]);
    const config = readJson(await readFile(path.join(root, ".cursor/hooks.json"), "utf8"));
    assert.equal(config.version, 1);
    const entries = asArray(asObject(config.hooks).beforeSubmitPrompt);
    assert.equal(entries.length, 1);
    const entry = asObject(entries[0]);
    assert.deepEqual(Object.keys(entry).sort(), ["command", "timeout"]);
    assert.equal(entry.timeout, 5);
    assert.ok(asString(entry.command, "cursor").includes(".run('cursor','beforeSubmitPrompt')"));
  } finally {
    await cleanup(root);
  }
});

void test("kiro writes a v1 hooks array with trigger and action", async () => {
  const root = await tempProject();
  try {
    await installHooks(root, ["kiro"]);
    const config = readJson(await readFile(path.join(root, ".kiro/hooks/researchspec-paper-humanizer.json"), "utf8"));
    assert.equal(config.version, "v1");
    const hooks = asArray(config.hooks);
    assert.equal(hooks.length, 1);
    const entry = asObject(hooks[0]);
    assert.equal(entry.name, "researchspec-paper-humanizer");
    assert.equal(entry.trigger, "UserPromptSubmit");
    assert.equal(entry.timeout, 5);
    assert.equal(entry.enabled, true);
    const action = asObject(entry.action);
    assert.equal(action.type, "command");
    assert.ok(asString(action.command, "kiro").includes(".run('plain','UserPromptSubmit')"));
  } finally {
    await cleanup(root);
  }
});

void test("copilot writes version 1 bash/powershell handlers and the copilot-subagent protocol", async () => {
  const root = await tempProject();
  try {
    await installHooks(root, ["github-copilot"]);
    const config = readJson(await readFile(path.join(root, ".github/hooks/researchspec-paper-humanizer.json"), "utf8"));
    assert.equal(config.version, 1);
    const hooks = asObject(config.hooks);
    assert.deepEqual(Object.keys(hooks).sort(), ["subagentStart", "userPromptTransformed"]);
    const transform = asObject(asArray(hooks.userPromptTransformed)[0]);
    assert.deepEqual(Object.keys(transform).sort(), ["bash", "powershell", "timeoutSec", "type"]);
    assert.equal(transform.type, "command");
    assert.equal(transform.timeoutSec, 5);
    assert.equal(transform.bash, transform.powershell);
    assert.ok(asString(transform.bash, "copilot").includes(".run('copilot-transform','userPromptTransformed')"));
    const subagent = asObject(asArray(hooks.subagentStart)[0]);
    assert.equal(subagent.timeoutSec, 5);
    assert.ok(asString(subagent.bash, "copilot").includes(".run('copilot-subagent','subagentStart')"));
    assert.ok(asString(subagent.powershell, "copilot").includes(".run('copilot-subagent','subagentStart')"));
  } finally {
    await cleanup(root);
  }
});

void test("antigravity writes a root-named projection with direct PreInvocation handlers", async () => {
  const root = await tempProject();
  try {
    await installHooks(root, ["antigravity"]);
    const config = readJson(await readFile(path.join(root, ".agents/hooks.json"), "utf8"));
    assert.deepEqual(Object.keys(config), ["researchspec-paper-humanizer"]);
    const projection = asObject(config["researchspec-paper-humanizer"]);
    assert.deepEqual(Object.keys(projection), ["PreInvocation"]);
    const handlers = asArray(projection.PreInvocation);
    assert.equal(handlers.length, 1);
    const handler = asObject(handlers[0]);
    assert.equal(handler.type, "command");
    assert.equal(handler.timeout, 5);
    assert.equal("hooks" in handler, false);
    assert.ok(asString(handler.command, "antigravity").includes(".run('antigravity','PreInvocation')"));
  } finally {
    await cleanup(root);
  }
});

void test("groups settings without a hooks key merge the guard and keep existing settings", async () => {
  const root = await tempProject();
  try {
    await mkdir(path.join(root, ".claude"));
    const original = { model: "user-model", permissions: { allow: ["Bash(ls:*)"] } };
    await writeFile(path.join(root, ".claude/settings.json"), JSON.stringify(original));
    await installHooks(root, ["claude"]);
    const config = readJson(await readFile(path.join(root, ".claude/settings.json"), "utf8"));
    assert.equal(config.model, "user-model");
    assert.deepEqual(config.permissions, original.permissions);
    const hooks = asObject(config.hooks);
    const handler = handlerOf(asArray(hooks.UserPromptSubmit)[0]);
    assert.equal(handler.timeout, 5);
    assert.ok(asString(handler.command, "claude").includes(".run('context','UserPromptSubmit')"));
  } finally {
    await cleanup(root);
  }
});

const SCRIPT_HOSTS = [
  { id: "cline", file: ".clinerules/hooks/UserPromptSubmit", executable: true },
  { id: "kilocode", file: ".kilo/plugin/researchspec-paper-humanizer.mjs", executable: false },
  { id: "opencode", file: ".opencode/plugins/researchspec-paper-humanizer.mjs", executable: false },
  { id: "pi", file: ".pi/extensions/researchspec-paper-humanizer.mjs", executable: false },
  { id: "oh-my-pi", file: ".omp/hooks/pre/researchspec-paper-humanizer.mjs", executable: false },
];

void test("script-category hosts install file-mode hooks with exact targets and modes", async () => {
  const root = await tempProject();
  try {
    const plan = await installHooks(root, SCRIPT_HOSTS.map((host) => host.id));
    for (const host of SCRIPT_HOSTS) {
      const installed = plan.installations.filter((item) => item.tool_id === host.id);
      assert.equal(installed.length, 1, host.id);
      const installation = installed[0];
      assert.equal(installation.target.path, host.file, host.id);
      assert.equal(installation.target.executable, host.executable, host.id);
      const source = installation.source;
      if (source.kind !== "prompt-guard") assert.fail(host.id + " expected a prompt-guard source");
      assert.equal(source.component, "script", host.id);
      assert.equal(source.mode, "file", host.id);
      assert.ok((await readFile(path.join(root, host.file), "utf8")).length > 0, host.id);
    }
  } finally {
    await cleanup(root);
  }
});
