import { homedir } from "node:os";
import path from "node:path";

import { fileExists } from "../utils/fs.js";

export type ToolId = typeof TOOL_IDS[number];
export type CommandFormat =
  | "description"
  | "description-arguments"
  | "named"
  | "cursor"
  | "codebuddy"
  | "costrict"
  | "trae"
  | "plain-heading"
  | "plain"
  | "toml"
  | "claude"
  | "continue";

export interface ToolDefinition {
  id: string;
  name: string;
  skillsDir: string;
  detectionPaths?: readonly string[];
  command?: {
    scope: "project" | "shared-global";
    format: CommandFormat;
    path(commandId: string, projectRoot: string): string;
    replaceColon?: boolean;
    injectArguments?: boolean;
  };
}

export const TOOL_IDS = [
  "amazon-q", "antigravity", "auggie", "bob", "claude", "cline", "codex", "forgecode",
  "codebuddy", "continue", "costrict", "crush", "cursor", "factory", "gemini", "github-copilot",
  "iflow", "junie", "kilocode", "kimi", "kiro", "lingma", "vibe", "oh-my-pi", "opencode", "pi",
  "qoder", "qwen", "roocode", "trae", "windsurf",
] as const;

const projectCommand = (relative: string) => (id: string, root: string) => path.join(root, relative.replace("<id>", id));

export const TOOLS: readonly ToolDefinition[] = [
  tool("amazon-q", "Amazon Q Developer", ".amazonq", ".amazonq/prompts/researchspec-<id>.md", "description"),
  tool("antigravity", "Antigravity", ".agent", ".agent/workflows/researchspec-<id>.md", "description"),
  tool("auggie", "Auggie (Augment CLI)", ".augment", ".augment/commands/researchspec-<id>.md", "description-arguments"),
  tool("bob", "Bob Shell", ".bob", ".bob/commands/researchspec-<id>.md", "description-arguments", { replaceColon: true }),
  tool("claude", "Claude Code", ".claude", ".claude/commands/researchspec/<id>.md", "claude"),
  tool("cline", "Cline", ".cline", ".clinerules/workflows/researchspec-<id>.md", "plain-heading"),
  {
    id: "codex", name: "Codex", skillsDir: ".codex",
    command: {
      scope: "shared-global", format: "description-arguments",
      path: (id) => path.join(process.env.CODEX_HOME ?? path.join(homedir(), ".codex"), "prompts", `researchspec-${id}.md`),
    },
  },
  { id: "forgecode", name: "ForgeCode", skillsDir: ".forge" },
  tool("codebuddy", "CodeBuddy Code (CLI)", ".codebuddy", ".codebuddy/commands/researchspec/<id>.md", "codebuddy"),
  tool("continue", "Continue", ".continue", ".continue/prompts/researchspec-<id>.prompt", "continue"),
  tool("costrict", "CoStrict", ".cospec", ".cospec/researchspec/commands/researchspec-<id>.md", "costrict"),
  tool("crush", "Crush", ".crush", ".crush/commands/researchspec/<id>.md", "named"),
  tool("cursor", "Cursor", ".cursor", ".cursor/commands/researchspec-<id>.md", "cursor"),
  tool("factory", "Factory Droid", ".factory", ".factory/commands/researchspec-<id>.md", "description-arguments"),
  tool("gemini", "Gemini CLI", ".gemini", ".gemini/commands/researchspec/<id>.toml", "toml"),
  {
    ...tool("github-copilot", "GitHub Copilot", ".github", ".github/prompts/researchspec-<id>.prompt.md", "description"),
    detectionPaths: [
      ".github/copilot-instructions.md", ".github/instructions", ".github/workflows/copilot-setup-steps.yml",
      ".github/prompts", ".github/agents", ".github/skills", ".github/.mcp.json",
    ],
  },
  tool("iflow", "iFlow", ".iflow", ".iflow/commands/researchspec-<id>.md", "cursor"),
  tool("junie", "Junie", ".junie", ".junie/commands/researchspec-<id>.md", "description"),
  tool("kilocode", "Kilo Code", ".kilocode", ".kilocode/workflows/researchspec-<id>.md", "plain"),
  { id: "kimi", name: "Kimi CLI", skillsDir: ".kimi" },
  tool("kiro", "Kiro", ".kiro", ".kiro/prompts/researchspec-<id>.prompt.md", "description"),
  tool("lingma", "Lingma", ".lingma", ".lingma/commands/researchspec/<id>.md", "named"),
  { id: "vibe", name: "Mistral Vibe", skillsDir: ".vibe" },
  tool("oh-my-pi", "Oh My Pi", ".omp", ".omp/commands/researchspec-<id>.md", "description", { replaceColon: true, injectArguments: true }),
  tool("opencode", "OpenCode", ".opencode", ".opencode/commands/researchspec-<id>.md", "description", { replaceColon: true }),
  tool("pi", "Pi", ".pi", ".pi/prompts/researchspec-<id>.md", "description", { replaceColon: true, injectArguments: true }),
  tool("qoder", "Qoder", ".qoder", ".qoder/commands/researchspec/<id>.md", "named"),
  tool("qwen", "Qwen Code", ".qwen", ".qwen/commands/researchspec-<id>.toml", "toml"),
  tool("roocode", "RooCode", ".roo", ".roo/commands/researchspec-<id>.md", "plain-heading"),
  tool("trae", "Trae", ".trae", ".trae/commands/researchspec-<id>.md", "trae"),
  tool("windsurf", "Windsurf", ".windsurf", ".windsurf/workflows/researchspec-<id>.md", "named"),
] as const;

export function getTool(id: string): ToolDefinition | undefined {
  return TOOLS.find((toolDefinition) => toolDefinition.id === id);
}

export function parseToolExpression(expression: string): string[] {
  const ids = [...new Set(expression.toLowerCase().split(",").map((value) => value.trim()).filter(Boolean))];
  if (ids.includes("all") || ids.includes("none")) {
    if (ids.length !== 1) throw new Error("'all' and 'none' cannot be combined with tool IDs.");
    return ids[0] === "all" ? [...TOOL_IDS] : [];
  }
  const unknown = ids.filter((id) => !getTool(id));
  if (unknown.length) throw new Error(`Unknown tool ID: ${unknown.join(", ")}. Valid IDs: ${TOOL_IDS.join(", ")}`);
  return ids;
}

export async function detectTools(projectRoot: string): Promise<string[]> {
  const detected: string[] = [];
  for (const definition of TOOLS) {
    const candidates = definition.detectionPaths ?? [definition.skillsDir];
    if ((await Promise.all(candidates.map((candidate) => fileExists(path.join(projectRoot, candidate))))).some(Boolean)) detected.push(definition.id);
  }
  return detected;
}

export function orderTools(configured: readonly string[], detected: readonly string[]): ToolDefinition[] {
  const configuredSet = new Set(configured);
  const detectedSet = new Set(detected);
  return [...TOOLS].sort((left, right) => rank(left.id) - rank(right.id) || left.name.localeCompare(right.name));
  function rank(id: string): number { return configuredSet.has(id) ? 0 : detectedSet.has(id) ? 1 : 2; }
}

function tool(id: string, name: string, skillsDir: string, commandPath: string, format: CommandFormat, options: { replaceColon?: boolean; injectArguments?: boolean } = {}): ToolDefinition {
  return {
    id, name, skillsDir,
    command: { scope: "project", format, path: projectCommand(commandPath), ...options },
  };
}
