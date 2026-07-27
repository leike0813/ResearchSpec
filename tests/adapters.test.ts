import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { COMPANION_INTENTS, COMPANION_WORKFLOW_IDS, renderCompanionSkill } from "../src/adapters/companion/index.js";
import { ARSU_COMMAND_CONTENTS, renderCommand } from "../src/adapters/command-renderer.js";
import { planWorkspaceDelivery } from "../src/adapters/workspace-delivery.js";
import { TOOL_IDS, TOOLS, detectTools, getTool, parseToolExpression } from "../src/adapters/tools.js";
import { cleanup, tempProject } from "./helpers/cli.js";
import { ARSU_ROUTING_CATALOG } from "../src/arsu-converter/routing/catalog.js";
import { renderNavigateRoutingProjection } from "../src/arsu-converter/routing/navigation-projection.js";
import { renderArsuCommandDescription } from "../src/arsu-converter/routing/projection.js";
import { renderLiteratureSourcePolicyProjection } from "../src/literature-adapters/provider-policy.js";

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
  assert.equal(requireTool("codex").command?.path("navigate", root), "/codex-home/prompts/researchspec-navigate.md");
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

void test("ARSU command descriptions are projected from the routing catalog", () => {
  assert.deepEqual(ARSU_COMMAND_CONTENTS.map((content) => content.id), ARSU_ROUTING_CATALOG.skills.map((skill) => skill.skill_id));
  for (const skill of ARSU_ROUTING_CATALOG.skills) {
    const command = ARSU_COMMAND_CONTENTS.find((content) => content.id === skill.skill_id);
    assert.ok(command);
    assert.equal(command.description, renderArsuCommandDescription(skill));
    assert.equal(command.family, "arsu");
  }
});

void test("companion manifest renders four self-contained workflow skills with distinct metadata", () => {
  assert.deepEqual(COMPANION_WORKFLOW_IDS, ["navigate", "propose", "decide", "verify"]);
  assert.deepEqual(COMPANION_INTENTS.map((intent) => intent.skillId), [
    "researchspec-navigate",
    "researchspec-propose",
    "researchspec-decide",
    "researchspec-verify",
  ]);
  assert.equal(new Set(COMPANION_INTENTS.map((intent) => intent.id)).size, 4);
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

  const navigate = COMPANION_INTENTS.find((intent) => intent.id === "navigate");
  assert.ok(navigate);
  const claude = renderCommand(requireTool("claude"), navigate);
  assert.match(claude, /Use the installed `researchspec-navigate` skill/);
  assert.match(claude, /tags: \[researchspec, companion, navigate\]/);
  assert.doesNotMatch(claude, /tags: \[researchspec, arsu\]/);
  assert.equal(requireTool("claude").command?.path(navigate.id, "/project"), "/project/.claude/commands/researchspec/navigate.md");
  for (const branch of ["Route", "Resume", "Explain", "Export"]) assert.match(navigate.instructions, new RegExp(`\\*\\*${branch}:\\*\\*|${branch} branch|${branch} for`));
  for (const selector of ["obligation:", "completion:", "case-action:", "patch:", "change:", "work:", "gate:", "transition:"]) {
    assert.ok(navigate.instructions.includes(selector));
  }
  assert.match(navigate.instructions, /returned ARSU producer/);
  assert.match(navigate.instructions, /descriptor-authorized non-semantic actions/);
  assert.match(navigate.instructions, /plugin list --summary --json/);
  assert.match(navigate.instructions, /plugin show <domain-id> --summary --json/);
  assert.match(navigate.instructions, /plan-bound transaction/);
  assert.match(navigate.instructions, /plugin instructions <skill-id> --json/);
  assert.match(navigate.instructions, /at most three optional domains/);
  assert.match(navigate.instructions, /bounded brief/);
  assert.match(navigate.instructions, /base ARSU producer/);
  assert.match(navigate.instructions, /never creates a route, work item, Gate, Decision, receipt, frontier, or second state machine/);
  assert.match(navigate.instructions, /broad or cross-task Zotero request/);
  assert.match(navigate.instructions, /Bounded Zotero task/);
  assert.match(navigate.instructions, /library-bound.*pauses/);
  assert.match(navigate.instructions, /managed-library authorization separate/);
  assert.match(navigate.instructions, /## CLI Discovery/);
  assert.match(navigate.instructions, /researchspec --help/);
  assert.match(navigate.instructions, /researchspec <command> --help/);
  assert.match(navigate.instructions, /references\/cli-handbook\.md/);
  assert.match(navigate.instructions, /status --json.*instructions <runtime-selector>/s);
  assert.match(navigate.instructions, /missing, unreadable, or known to have drifted/);
  const propose = COMPANION_INTENTS.find((intent) => intent.id === "propose");
  const decide = COMPANION_INTENTS.find((intent) => intent.id === "decide");
  const verify = COMPANION_INTENTS.find((intent) => intent.id === "verify");
  assert.ok(propose && decide && verify);
  assert.match(propose.instructions, /Semantic v2/);
  assert.match(propose.instructions, /case-action:<id>/);
  assert.match(decide.instructions, /Semantic v2/);
  assert.match(decide.instructions, /case-action:<id>/);
  assert.match(verify.instructions, /Gate submission is `plan_bound`/);
  for (const intent of [propose, decide, verify]) assert.match(intent.instructions, /next_selectors/);
  assert.ok(navigate.instructions.includes(renderLiteratureSourcePolicyProjection()));
  assert.ok(navigate.instructions.endsWith(renderNavigateRoutingProjection()));
  for (const skill of ARSU_ROUTING_CATALOG.skills) {
    assert.match(navigate.instructions, new RegExp(skill.skill_id));
    for (const route of skill.routes) assert.match(navigate.instructions, new RegExp(route.route_ref));
    for (const nearMiss of skill.near_misses) assert.match(navigate.instructions, new RegExp(nearMiss.route_ref));
  }
});

void test("Copilot uses its explicit detection paths", async () => {
  const root = await tempProject();
  await mkdir(path.join(root, ".github/agents"), { recursive: true });
  assert.ok((await detectTools(root)).includes("github-copilot"));
  await cleanup(root);
});

void test("delivery projects fifteen fixed Skills to 31 tools and eight wrappers to 28 command-capable tools", async () => {
  const root = await tempProject();
  const previousCodexHome = process.env.CODEX_HOME;
  process.env.CODEX_HOME = path.join(root, "codex-home");
  try {
    const delivery = await planWorkspaceDelivery({
      projectRoot: root,
      toolIds: TOOL_IDS,
      selectedToolIds: TOOL_IDS,
      reconciledToolIds: TOOL_IDS,
      existingInstallations: [],
      force: false,
      platform: "linux",
      architecture: "x64",
    });
    const companionSkills = delivery.installations.filter((item) => item.source.kind === "companion-skill" && item.target.path.endsWith("/SKILL.md"));
    const companionLicenses = delivery.installations.filter((item) => item.source.kind === "companion-skill" && item.target.path.endsWith("/LICENSE"));
    const navigateHandbooks = delivery.installations.filter((item) => item.source.kind === "companion-skill" && item.target.path.endsWith("/skills/researchspec-navigate/references/cli-handbook.md"));
    const otherCompanionHandbooks = delivery.installations.filter((item) => item.source.kind === "companion-skill" && item.target.path.endsWith("/references/cli-handbook.md") && !item.target.path.includes("/skills/researchspec-navigate/"));
    const companionCommands = delivery.installations.filter((item) => item.source.kind === "command" && COMPANION_WORKFLOW_IDS.includes(item.source.command_id as typeof COMPANION_WORKFLOW_IDS[number]));
    const arsuSkills = delivery.installations.filter((item) => item.source.kind === "arsu-skill" && item.target.path.endsWith(`/skills/${item.source.skill_id}/SKILL.md`));
    const arsuCommandIds = new Set(ARSU_COMMAND_CONTENTS.map((content) => content.id));
    const arsuCommands = delivery.installations.filter((item) => item.source.kind === "command" && arsuCommandIds.has(item.source.command_id));
    assert.equal(companionSkills.length, TOOL_IDS.length * COMPANION_INTENTS.length);
    assert.equal(companionLicenses.length, TOOL_IDS.length * COMPANION_INTENTS.length);
    assert.ok(companionLicenses.every((item) => item.sha256.length === 64));
    assert.equal(navigateHandbooks.length, TOOL_IDS.length);
    assert.equal(new Set(navigateHandbooks.map((item) => item.sha256)).size, 1);
    assert.equal(otherCompanionHandbooks.length, 0);
    assert.equal(companionCommands.length, TOOLS.filter((tool) => tool.command).length * COMPANION_INTENTS.length);
    assert.equal(arsuSkills.length + companionSkills.length, 31 * 8);
    assert.equal(arsuCommands.length + companionCommands.length, 28 * 8);
    for (const toolId of TOOL_IDS) {
      const skillIds = new Set(delivery.installations.flatMap((item) => {
        if (item.tool_id !== toolId) return [];
        if (item.source.kind === "arsu-skill" || item.source.kind === "companion-skill" || item.source.kind === "domain-skill") return [item.source.skill_id];
        return item.source.kind === "literature-adapter" && item.source.component === "skill" && item.source.skill_id ? [item.source.skill_id] : [];
      }));
      assert.equal(skillIds.size, 15, toolId);
    }
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
