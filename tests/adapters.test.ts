import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { COMPANION_INTENTS, COMPANION_WORKFLOW_IDS, renderCompanionSkill } from "../src/adapters/companion/index.js";
import { ARSU_COMMAND_CONTENTS, renderCommand } from "../src/adapters/command-renderer.js";
import { planToolDelivery } from "../src/adapters/delivery.js";
import { TOOL_IDS, TOOLS, detectTools, getTool, parseToolExpression } from "../src/adapters/tools.js";
import { cleanup, tempProject } from "./helpers/cli.js";

void test("tool registry contains the exact 31-tool surface and 28 command adapters", () => {
  assert.equal(TOOL_IDS.length, 31);
  assert.equal(new Set(TOOL_IDS).size, 31);
  assert.equal(TOOLS.filter((tool) => tool.command).length, 28);
  assert.deepEqual(TOOLS.filter((tool) => !tool.command).map((tool) => tool.id), ["forgecode", "kimi", "vibe"]);
  assert.deepEqual(parseToolExpression("codex,claude,codex"), ["codex", "claude"]);
  assert.deepEqual(parseToolExpression("none"), []);
  assert.deepEqual(parseToolExpression("all"), [...TOOL_IDS]);
  assert.throws(() => parseToolExpression("all,codex"));
  assert.throws(() => parseToolExpression("unknown"));
});

void test("registered command paths preserve per-tool conventions", () => {
  const root = "/project";
  const expected: Record<string, string> = {
    "amazon-q": ".amazonq/prompts/researchspec-deep-research.md",
    antigravity: ".agent/workflows/researchspec-deep-research.md",
    auggie: ".augment/commands/researchspec-deep-research.md",
    bob: ".bob/commands/researchspec-deep-research.md",
    claude: ".claude/commands/researchspec/deep-research.md",
    cline: ".clinerules/workflows/researchspec-deep-research.md",
    codebuddy: ".codebuddy/commands/researchspec/deep-research.md",
    continue: ".continue/prompts/researchspec-deep-research.prompt",
    costrict: ".cospec/researchspec/commands/researchspec-deep-research.md",
    crush: ".crush/commands/researchspec/deep-research.md",
    cursor: ".cursor/commands/researchspec-deep-research.md",
    factory: ".factory/commands/researchspec-deep-research.md",
    gemini: ".gemini/commands/researchspec/deep-research.toml",
    "github-copilot": ".github/prompts/researchspec-deep-research.prompt.md",
    iflow: ".iflow/commands/researchspec-deep-research.md",
    junie: ".junie/commands/researchspec-deep-research.md",
    kilocode: ".kilocode/workflows/researchspec-deep-research.md",
    kiro: ".kiro/prompts/researchspec-deep-research.prompt.md",
    lingma: ".lingma/commands/researchspec/deep-research.md",
    "oh-my-pi": ".omp/commands/researchspec-deep-research.md",
    opencode: ".opencode/commands/researchspec-deep-research.md",
    pi: ".pi/prompts/researchspec-deep-research.md",
    qoder: ".qoder/commands/researchspec/deep-research.md",
    qwen: ".qwen/commands/researchspec-deep-research.toml",
    roocode: ".roo/commands/researchspec-deep-research.md",
    trae: ".trae/commands/researchspec-deep-research.md",
    windsurf: ".windsurf/workflows/researchspec-deep-research.md",
  };
  for (const [id, relative] of Object.entries(expected)) {
    const definition = getTool(id);
    assert.ok(definition?.command);
    assert.equal(definition.command.path("deep-research", root), path.join(root, relative));
  }
  assert.equal(Object.keys(expected).length, 27);
  const previousCodexHome = process.env.CODEX_HOME;
  process.env.CODEX_HOME = "/codex-home";
  assert.equal(requireTool("codex").command?.path("deep-research", root), "/codex-home/prompts/researchspec-deep-research.md");
  assert.equal(requireTool("codex").command?.path("check", root), "/codex-home/prompts/researchspec-check.md");
  if (previousCodexHome === undefined) Reflect.deleteProperty(process.env, "CODEX_HOME");
  else process.env.CODEX_HOME = previousCodexHome;
});

void test("format families render machine-valid structural markers", () => {
  const content = ARSU_COMMAND_CONTENTS[0];
  assert.match(renderCommand(requireTool("gemini"), content), /^description = /);
  assert.match(renderCommand(requireTool("gemini"), content), /prompt = """/);
  assert.doesNotMatch(renderCommand(requireTool("cline"), content), /^---/);
  assert.match(renderCommand(requireTool("claude"), content), /allowed-tools: Bash\(researchspec:\*\)/);
  assert.match(renderCommand(requireTool("pi"), content), /\$@/);
  assert.doesNotMatch(renderCommand(requireTool("cursor"), content), /argument-hint/);
  assert.doesNotMatch(renderCommand(requireTool("codebuddy"), content), /category:/);
  assert.doesNotMatch(renderCommand(requireTool("trae"), content), /category:|argument-hint:/);
  assert.match(renderCommand(requireTool("costrict"), content), /description: "/);
  for (const definition of TOOLS.filter((tool) => tool.command)) {
    for (const intent of [...ARSU_COMMAND_CONTENTS, ...COMPANION_INTENTS]) {
      assert.ok(renderCommand(definition, intent).trim().length > 0);
    }
  }
});

void test("companion manifest renders eight self-contained workflow skills with distinct metadata", () => {
  assert.deepEqual(COMPANION_WORKFLOW_IDS, ["explore", "propose", "check", "verify", "next", "context", "decide", "archive"]);
  assert.deepEqual(COMPANION_INTENTS.map((intent) => intent.skillId), [
    "researchspec-explore",
    "researchspec-propose",
    "researchspec-check",
    "researchspec-verify",
    "researchspec-next",
    "researchspec-context",
    "researchspec-decide",
    "researchspec-archive",
  ]);
  assert.equal(new Set(COMPANION_INTENTS.map((intent) => intent.id)).size, 8);
  assert.equal(ARSU_COMMAND_CONTENTS.length, 4);

  for (const intent of COMPANION_INTENTS) {
    const rendered = renderCompanionSkill(intent);
    assert.match(rendered, new RegExp(`^---\\nname: ${intent.skillId}\\n`, "m"));
    for (const heading of ["Mission", "When to Use", "Do Not Use", "Inputs", "CLI Examples", "Workflow", "Decision Table", "Failure Recovery", "Output Contract", "Guardrails", "Completion", "Shared CLI Discipline"]) {
      assert.match(rendered, new RegExp(`## ${heading}`));
    }
    assert.match(rendered, /--dry-run --json/);
    assert.doesNotMatch(rendered, /references\/cli-discipline\.md|<<|Authoring hint/);
  }

  const check = COMPANION_INTENTS.find((intent) => intent.id === "check");
  assert.ok(check);
  const claude = renderCommand(requireTool("claude"), check);
  assert.match(claude, /Use the installed `researchspec-check` skill/);
  assert.match(claude, /tags: \[researchspec, companion, check\]/);
  assert.doesNotMatch(claude, /tags: \[researchspec, arsu\]/);
  assert.equal(requireTool("claude").command?.path(check.id, "/project"), "/project/.claude/commands/researchspec/check.md");
});

void test("Copilot uses its explicit detection paths", async () => {
  const root = await tempProject();
  await mkdir(path.join(root, ".github/agents"), { recursive: true });
  assert.ok((await detectTools(root)).includes("github-copilot"));
  await cleanup(root);
});

void test("delivery projects eight skills to 31 tools and eight wrappers to 28 command-capable tools", async () => {
  const root = await tempProject();
  const previousCodexHome = process.env.CODEX_HOME;
  process.env.CODEX_HOME = path.join(root, "codex-home");
  try {
    const delivery = await planToolDelivery({ projectRoot: root, toolIds: TOOL_IDS, existingInstallations: [], force: false });
    const companionSkills = delivery.installations.filter((item) => item.source.startsWith("companion:") && item.source.endsWith("/SKILL.md"));
    const companionCommands = delivery.installations.filter((item) => COMPANION_WORKFLOW_IDS.some((id) => item.source === `command:${id}`));
    assert.equal(companionSkills.length, 31 * 8);
    assert.equal(companionCommands.length, 28 * 8);
    assert.equal(delivery.diagnostics.filter((item) => item.code === "commands_not_supported").length, 3);
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
