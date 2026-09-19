import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";

import { parse as parseYaml } from "yaml";

import {
  AGENT_PROFILE_ROLE_IDS,
  AGENT_PROFILE_TOOL_IDS,
  isAgentProfileTool,
  renderAgentProfileFiles,
} from "../src/adapters/agent-profiles.js";
import { TOOL_IDS, TOOLS, getTool } from "../src/adapters/tools.js";

const PROJECT = "/project";

/** Every expected project-local target from the change design. */
const HOST_TARGETS: ReadonlyArray<{ toolId: string; dir: string; suffix: string }> = [
  { toolId: "antigravity", dir: ".agents/agents", suffix: ".md" },
  { toolId: "auggie", dir: ".augment/agents", suffix: ".md" },
  { toolId: "claude", dir: ".claude/agents", suffix: ".md" },
  { toolId: "codeartsagent", dir: ".codeartsdoer/agents", suffix: ".md" },
  { toolId: "codebuddy", dir: ".codebuddy/agents", suffix: ".md" },
  { toolId: "codex", dir: ".codex/agents", suffix: ".toml" },
  { toolId: "devin", dir: ".devin/agents", suffix: ".md" },
  { toolId: "forgecode", dir: ".forge/agents", suffix: ".md" },
  { toolId: "costrict", dir: ".costrict/agents", suffix: ".md" },
  { toolId: "cursor", dir: ".cursor/agents", suffix: ".md" },
  { toolId: "factory", dir: ".factory/droids", suffix: ".md" },
  { toolId: "gemini", dir: ".gemini/agents", suffix: ".md" },
  { toolId: "github-copilot", dir: ".github/agents", suffix: ".agent.md" },
  { toolId: "iflow", dir: ".iflow/agents", suffix: ".md" },
  { toolId: "junie", dir: ".junie/agents", suffix: ".md" },
  { toolId: "kilocode", dir: ".kilo/agents", suffix: ".md" },
  { toolId: "kiro", dir: ".kiro/agents", suffix: ".md" },
  { toolId: "vibe", dir: ".vibe/agents", suffix: ".toml" },
  { toolId: "oh-my-pi", dir: ".omp/agents", suffix: ".md" },
  { toolId: "opencode", dir: ".opencode/agents", suffix: ".md" },
  { toolId: "qoder", dir: ".qoder/agents", suffix: ".md" },
  { toolId: "qwen", dir: ".qwen/agents", suffix: ".md" },
  { toolId: "rovodev", dir: ".rovodev/subagents", suffix: ".md" },
  { toolId: "trae", dir: ".trae/agents", suffix: ".md" },
];

void test("agent profile surface is exactly the 24 design targets and two roles", () => {
  assert.equal(AGENT_PROFILE_TOOL_IDS.length, 24);
  assert.deepEqual([...AGENT_PROFILE_TOOL_IDS].sort(), HOST_TARGETS.map((host) => host.toolId).sort());
  assert.deepEqual(AGENT_PROFILE_ROLE_IDS, ["researchspec-executor", "researchspec-reviewer"]);
  for (const id of AGENT_PROFILE_TOOL_IDS) {
    assert.ok(TOOL_IDS.includes(id), `${id} is not a registered adapter`);
    assert.equal(isAgentProfileTool(id), true);
  }
  for (const unsupported of ["agents", "kimi", "continue", "crush", "cline", "roocode"]) {
    assert.equal(isAgentProfileTool(unsupported), false, unsupported);
    assert.deepEqual(renderAgentProfileFiles(unsupported, PROJECT), [], unsupported);
  }
  assert.equal(isAgentProfileTool("windsurf"), true, "windsurf resolves to devin");
});

void test("all supported adapters render 50 files including two Vibe prompts", () => {
  const files = AGENT_PROFILE_TOOL_IDS.flatMap((toolId) => renderAgentProfileFiles(toolId, PROJECT));
  assert.equal(files.length, 50);
  const byComponent = files.filter((file) => file.component === "prompt");
  assert.equal(byComponent.length, 2);
  for (const file of byComponent) assert.equal(file.toolId, "vibe");
  assert.equal(files.filter((file) => file.component === "definition").length, 48);
  assert.equal(new Set(files.map((file) => file.target)).size, files.length);
  assert.equal(files.every((file) => file.target === path.join(PROJECT, ...file.path.split("/"))), true);
  assert.equal(files.every((file) => file.path.startsWith(`${file.path.split("/")[0]}/`)), true);
});

void test("every adapter renders both roles at its exact design path", () => {
  for (const host of HOST_TARGETS) {
    const files = renderAgentProfileFiles(host.toolId, PROJECT);
    assert.deepEqual([...new Set(files.map((file) => file.roleId))].sort(), [...AGENT_PROFILE_ROLE_IDS].sort(), host.toolId);
    const definitions = files.filter((file) => file.component === "definition");
    assert.equal(definitions.length, 2, host.toolId);
    for (const role of AGENT_PROFILE_ROLE_IDS) {
      assert.equal(
        definitions.find((file) => file.roleId === role)?.path,
        `${host.dir}/${role}${host.suffix}`,
        `${host.toolId} ${role}`,
      );
    }
    if (host.toolId === "vibe") {
      assert.deepEqual(files.filter((file) => file.component === "prompt").map((file) => file.path), [
        ".vibe/prompts/researchspec-executor.md",
        ".vibe/prompts/researchspec-reviewer.md",
      ]);
    } else {
      assert.equal(files.some((file) => file.component === "prompt"), false, host.toolId);
    }
  }
});

void test("every definition carries the role contract and never a fixed vendor model", () => {
  for (const toolId of AGENT_PROFILE_TOOL_IDS) {
    for (const file of renderAgentProfileFiles(toolId, PROJECT)) {
      if (file.component === "definition" && toolId === "vibe") {
        assert.ok(file.content.includes(`system_prompt_id = "${file.roleId}"`), file.path);
        continue;
      }
      assert.ok(file.content.trim().length > 0, `${file.path} is empty`);
      for (const fragment of [
        "delegation.recommended_agent",
        "Contract precedence",
        "return a blocked brief",
        "Do not run ResearchSpec mutation commands",
        "`status`",
        "`blocker`",
      ]) {
        assert.ok(file.content.includes(fragment), `${file.path} lacks ${fragment}`);
      }
      assert.match(file.content, /never the material you evaluate|Do not delegate to, or spawn, another agent/);
    }
  }
});

void test("supported Markdown definitions parse as one YAML frontmatter document", () => {
  for (const file of AGENT_PROFILE_TOOL_IDS.flatMap((toolId) => renderAgentProfileFiles(toolId, PROJECT))) {
    if (!file.content.startsWith("---\n")) continue;
    const match = /^---\n([\s\S]*?)\n---\n/.exec(file.content);
    assert.ok(match, `${file.path} has no frontmatter block`);
    const frontmatter = parseYaml(match[1]) as Record<string, unknown>;
    assert.equal(typeof frontmatter.description, "string", file.path);
    if (file.component === "definition") {
      assert.equal(frontmatter.model, file.toolId === "claude" ? "inherit" : undefined, `${file.path} model policy`);
    }
    assert.ok(file.content.slice(match[0].length).trim().length, `${file.path} has no body`);
  }
});

void test("TOML definitions are well-formed and keep the prompt body or reference intact", () => {
  for (const toolId of ["codex", "vibe"] as const) {
    for (const file of renderAgentProfileFiles(toolId, PROJECT).filter((item) => item.component === "definition")) {
      const document = parseTomlDocument(file.content, file.path);
      assert.equal(typeof document.description, "string", file.path);
      assert.equal(document.model, undefined, `${file.path} pins no model`);
      if (toolId === "codex") {
        assert.ok(document.developer_instructions.includes("delegation.recommended_agent"), file.path);
      } else {
        assert.equal(document.agent_type, "subagent");
        assert.equal(document.system_prompt_id, file.roleId);
        assert.equal(document.disabled_tools, '["bash", "task"]');
      }
    }
  }
});

void test("Vibe prompt files hold the referenced contract verbatim", () => {
  const files = renderAgentProfileFiles("vibe", PROJECT);
  for (const definitionFile of files.filter((file) => file.component === "definition")) {
    const promptFile = files.find((file) => file.component === "prompt" && file.roleId === definitionFile.roleId);
    assert.ok(promptFile, definitionFile.roleId);
    assert.ok(definitionFile.content.includes(`system_prompt_id = "${definitionFile.roleId}"`));
    assert.equal(promptFile.content, `${promptFile.content.trimEnd()}\n`);
    assert.ok(promptFile.content.includes(`# ResearchSpec native worker: ${definitionFile.roleId}`));
  }
});

void test("role descriptions stay bounded to an explicit packet recommendation", () => {
  for (const toolId of AGENT_PROFILE_TOOL_IDS) {
    for (const file of renderAgentProfileFiles(toolId, PROJECT).filter((item) => item.component === "definition")) {
      const description = /description[":= ]+"?([^"\n]+)/.exec(file.content)?.[1];
      assert.ok(description, file.path);
      assert.ok(description.includes("activation packet recommends " + file.roleId), `${file.path}: ${description}`);
      assert.ok(description.length <= 240, `${file.path} description is too long for routing`);
    }
  }
});

void test("unsupported adapters keep their existing skill-only delivery", () => {
  assert.equal(getTool("agents")?.skillsDir, ".agents");
  for (const definition of TOOLS.filter((tool) => !isAgentProfileTool(tool.id))) {
    assert.deepEqual(renderAgentProfileFiles(definition.id, PROJECT), [], definition.id);
  }
});

/**
 * Minimal flat TOML reader for the keys this renderer emits: `k = "v"`,
 * `k = ["v", ...]`, and `k = """\n...\n"""`. Values stay raw text.
 * ponytail: no nested tables; extend only if a host profile gains a table.
 */
function parseTomlDocument(source: string, label: string): Record<string, string> {
  const document: Record<string, string> = {};
  const lines = source.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index] === "") continue;
    const match = /^([A-Za-z0-9_]+) = (.*)$/.exec(lines[index]);
    assert.ok(match, `${label} line ${String(index + 1)} is not a TOML key/value`);
    const [, key, value] = match;
    if (value === '"""') {
      const end = lines.indexOf('"""', index + 1);
      assert.ok(end > index + 1, `${label} has an unterminated ${key} block`);
      document[key] = lines.slice(index + 1, end).join("\n");
      index = end;
      continue;
    }
    if (value.startsWith('"') || value.startsWith("[")) {
      document[key] = value.startsWith("\"") ? (JSON.parse(value) as string) : value;
      continue;
    }
    assert.fail(`${label} emitted an unquoted TOML value for ${key}`);
  }
  return document;
}
