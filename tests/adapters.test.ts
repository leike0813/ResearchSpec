import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { COMMAND_WRAPPER_CONTENTS, renderCommand } from "../src/adapters/command-renderer.js";
import { COMPANION_INTENTS, COMPANION_WORKFLOW_IDS, renderCompanionSkillFiles } from "../src/adapters/companion/index.js";
import { renderNavigateRoutingProjection } from "../src/arsu-converter/routing/navigation-projection.js";
import { planWorkspaceDelivery } from "../src/adapters/workspace-delivery.js";
import { TOOL_IDS, TOOLS, detectTools, getTool, parseToolExpression } from "../src/adapters/tools.js";
import { CLI_TOP_LEVEL_COMMANDS } from "../src/cli/command-catalog.js";
import { renderCliHandbook } from "../src/cli/handbook.js";
import { cleanup, tempProject } from "./helpers/cli.js";

void test("tool registry contains the exact 36-tool surface and 28 command adapters", () => {
  assert.equal(TOOL_IDS.length, 36);
  assert.equal(new Set(TOOL_IDS).size, 36);
  assert.equal(TOOLS.filter((tool) => tool.command).length, 28);
  assert.deepEqual(TOOLS.filter((tool) => !tool.command).map((tool) => tool.id), ["codeartsagent", "codex", "forgecode", "hermes", "kimi", "vibe", "rovodev", "agents"]);
  assert.equal(getTool("windsurf")?.id, "devin");
  assert.deepEqual(parseToolExpression("codex,claude,codex"), ["codex", "claude"]);
  assert.deepEqual(parseToolExpression("none"), []);
  assert.deepEqual(parseToolExpression("all"), [...TOOL_IDS]);
  assert.throws(() => parseToolExpression("all,codex"));
  assert.throws(() => parseToolExpression("minimax-code"));
  assert.throws(() => parseToolExpression("unknown"));
});

void test("registered command paths preserve per-tool conventions", () => {
  const root = "/project";
  const expected: Record<string, string> = {
    "amazon-q": ".amazonq/prompts/researchspec-status.md",
    antigravity: ".agent/workflows/researchspec-status.md",
    auggie: ".augment/commands/researchspec-status.md",
    bob: ".bob/commands/researchspec-status.md",
    claude: ".claude/commands/researchspec/status.md",
    cline: ".clinerules/workflows/researchspec-status.md",
    codebuddy: ".codebuddy/commands/researchspec/status.md",
    continue: ".continue/prompts/researchspec-status.prompt",
    costrict: ".cospec/researchspec/commands/researchspec-status.md",
    crush: ".crush/commands/researchspec/status.md",
    cursor: ".cursor/commands/researchspec-status.md",
    factory: ".factory/commands/researchspec-status.md",
    gemini: ".gemini/commands/researchspec/status.toml",
    "github-copilot": ".github/prompts/researchspec-status.prompt.md",
    iflow: ".iflow/commands/researchspec-status.md",
    junie: ".junie/commands/researchspec-status.md",
    kilocode: ".kilocode/workflows/researchspec-status.md",
    kiro: ".kiro/prompts/researchspec-status.prompt.md",
    lingma: ".lingma/commands/researchspec/status.md",
    "oh-my-pi": ".omp/commands/researchspec-status.md",
    opencode: ".opencode/commands/researchspec-status.md",
    pi: ".pi/prompts/researchspec-status.md",
    qoder: ".qoder/commands/researchspec/status.md",
    qwen: ".qwen/commands/researchspec-status.md",
    roocode: ".roo/commands/researchspec-status.md",
    trae: ".trae/commands/researchspec-status.md",
    devin: ".devin/workflows/researchspec-status.md",
  };
  for (const [id, relative] of Object.entries(expected)) {
    assert.equal(requireTool(id).command?.path("status", root), path.join(root, relative));
  }
  assert.equal(requireTool("codex").command, undefined);
  assert.equal(requireTool("kimi").skillsDir, ".kimi-code");
});

void test("command delivery exposes one Navigate wrapper while the public CLI stays complete", () => {
  assert.deepEqual(COMMAND_WRAPPER_CONTENTS.map((item) => item.id), ["navigate"]);
  assert.equal(CLI_TOP_LEVEL_COMMANDS.length, 16);
  assert.equal((CLI_TOP_LEVEL_COMMANDS.map((item) => item.id) as string[]).includes("submit"), false);
  const content = COMMAND_WRAPPER_CONTENTS[0];
  assert.ok(content);
  assert.match(renderCommand(requireTool("gemini"), content), /^description = /);
  assert.match(renderCommand(requireTool("gemini"), content), /prompt = """/);
  assert.doesNotMatch(renderCommand(requireTool("cline"), content), /^---/);
  assert.match(renderCommand(requireTool("claude"), content), /allowed-tools: Bash\(researchspec:\*\)/);
  assert.match(renderCommand(requireTool("pi"), content), /\$@/);
  assert.match(renderCommand(requireTool("cursor"), content), /\$ARGUMENTS/);
  const commandsOnly = renderCommand(requireTool("claude"), content);
  assert.match(commandsOnly, /researchspec status --json/);
  assert.match(commandsOnly, /researchspec-reviewer/);
  assert.doesNotMatch(commandsOnly, /references\//);
  for (const definition of TOOLS.filter((tool) => tool.command)) {
    for (const wrapper of COMMAND_WRAPPER_CONTENTS) assert.ok(renderCommand(definition, wrapper).trim().length > 0);
  }
});

void test("companion manifest renders four fixed self-contained Skills", () => {
  assert.deepEqual(COMPANION_WORKFLOW_IDS, ["navigate", "propose", "decide", "verify"]);
  assert.deepEqual(COMPANION_INTENTS.map((intent) => intent.skillId), [
    "researchspec-navigate",
    "researchspec-propose",
    "researchspec-decide",
    "researchspec-verify",
  ]);
  for (const intent of COMPANION_INTENTS) {
    assert.deepEqual(
      renderCompanionSkillFiles(intent).map((file) => file.path),
      intent.id === "navigate"
        ? ["LICENSE", "SKILL.md", "references/arsu-routes.md", "references/cli-handbook.md"]
        : ["LICENSE", "SKILL.md"],
    );
  }
  const navigate = COMPANION_INTENTS.find((intent) => intent.skillId === "researchspec-navigate");
  assert.ok(navigate);
  const files = new Map(renderCompanionSkillFiles(navigate).map((file) => [file.path, file.content]));
  assert.equal(files.get("references/cli-handbook.md"), renderCliHandbook());
  assert.equal(files.get("references/arsu-routes.md"), renderNavigateRoutingProjection());
});

void test("Copilot uses its explicit detection paths", async () => {
  const root = await tempProject();
  await mkdir(path.join(root, ".github/agents"), { recursive: true });
  assert.ok((await detectTools(root)).includes("github-copilot"));
  await cleanup(root);
});

void test("delivery projects one Navigate entry per selected channel", async () => {
  const root = await tempProject();
  const previousCodexHome = process.env.CODEX_HOME;
  process.env.CODEX_HOME = path.join(root, "codex-home");
  try {
    const delivery = await planWorkspaceDelivery({
      projectRoot: root,
      toolIds: TOOL_IDS,
      selectedToolIds: TOOL_IDS,
      reconciledToolIds: TOOL_IDS,
      selectedLiteratureAdapterIds: [],
      existingInstallations: [],
      force: false,
      platform: "linux",
      architecture: "x64",
    });
    const wrappers = delivery.installations.filter((item) => item.source.kind === "command");
    assert.equal(wrappers.length, TOOLS.filter((tool) => tool.command).length * COMMAND_WRAPPER_CONTENTS.length);
    const wrapperIds = wrappers.flatMap((item) => item.source.kind === "command" ? [item.source.command_id] : []);
    assert.deepEqual([...new Set(wrapperIds)].sort(), COMMAND_WRAPPER_CONTENTS.map((item) => item.id).sort());
    const customAgents = delivery.installations.filter((item) => item.source.kind === "custom-agent");
    assert.equal(customAgents.length, 50);
    assert.equal(customAgents.filter((item) => item.source.kind === "custom-agent" && item.source.component === "definition").length, 48);
    assert.equal(customAgents.filter((item) => item.source.kind === "custom-agent" && item.source.component === "prompt").length, 2);
    assert.equal(customAgents.every((item) => item.tool_id !== "agents"), true);
    for (const toolId of TOOL_IDS.filter((id) => id !== "agents")) {
      const skillIds = new Set(delivery.installations.flatMap((item) => {
        if (item.tool_id !== toolId) return [];
        if (item.source.kind === "arsu-skill" || item.source.kind === "core-skill" || item.source.kind === "companion-skill" || item.source.kind === "domain-skill") return [item.source.skill_id];
        if (item.source.kind === "framework-capability") return [item.source.capability_id];
        return item.source.kind === "literature-adapter" && item.source.component === "skill" && item.source.skill_id ? [item.source.skill_id] : [];
      }));
      assert.equal(skillIds.size, 1, toolId);
      assert.deepEqual([...skillIds], ["researchspec-navigate"], toolId);
    }
    const navigateFiles = delivery.installations.filter((item) => item.source.kind === "companion-skill" && item.source.skill_id === "researchspec-navigate");
    assert.equal(navigateFiles.length, new Set(navigateFiles.map((item) => item.tool_id)).size * 4);
    assert.equal(navigateFiles.some((item) => item.target.path.replaceAll("\\", "/").endsWith("/researchspec-navigate/references/cli-handbook.md")), true);
    assert.equal(navigateFiles.some((item) => item.target.path.replaceAll("\\", "/").endsWith("/researchspec-navigate/references/arsu-routes.md")), true);
    assert.equal(delivery.diagnostics.filter((item) => item.code === "commands_not_supported").length, 8);
  } finally {
    if (previousCodexHome === undefined) Reflect.deleteProperty(process.env, "CODEX_HOME");
    else process.env.CODEX_HOME = previousCodexHome;
    await cleanup(root);
  }
});

function requireTool(id: string) {
  const definition = getTool(id);
  assert.ok(definition);
  return definition;
}
