import path from "node:path";

import { fileExists } from "../utils/fs.js";

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

export type ToolId = typeof TOOL_IDS[number];
export type DeliveryMode = "skills" | "commands" | "both";

export interface ToolDefinition {
  id: ToolId;
  name: string;
  /** Project-relative integration root. */
  skillsDir: string;
  /** Former project roots whose known ResearchSpec files may be migrated. */
  legacySkillsDirs?: readonly string[];
  /** Existing files/directories that indicate the tool is configured. */
  detectionPaths?: readonly string[];
  setupNote?: string;
  command?: {
    scope: "project";
    format: CommandFormat;
    path(commandId: string, projectRoot: string): string;
    replaceColon?: boolean;
    injectArguments?: boolean;
  };
}

export const TOOL_IDS = [
  "amazon-q", "antigravity", "auggie", "bob", "claude", "cline", "codeartsagent", "codex",
  "devin", "forgecode", "codebuddy", "continue", "costrict", "crush", "cursor", "factory",
  "gemini", "github-copilot", "hermes", "iflow", "junie", "kilocode", "kimi", "kiro", "lingma",
  "vibe", "oh-my-pi", "opencode", "pi", "qoder", "qwen", "rovodev", "roocode",
  "trae", "zcode", "agents",
] as const;

export const TOOL_ID_ALIASES: Readonly<Record<string, ToolId>> = { windsurf: "devin" };

const projectCommand = (relative: string) => (id: string, root: string) => path.join(root, relative.replace("<id>", id));

export const TOOLS: readonly ToolDefinition[] = [
  tool("amazon-q", "Amazon Q Developer", ".amazonq", ".amazonq/prompts/researchspec-<id>.md", "description"),
  tool("antigravity", "Antigravity", ".agent", ".agent/workflows/researchspec-<id>.md", "description"),
  tool("auggie", "Auggie (Augment CLI)", ".augment", ".augment/commands/researchspec-<id>.md", "description-arguments"),
  tool("bob", "Bob Shell", ".bob", ".bob/commands/researchspec-<id>.md", "description-arguments", { replaceColon: true }),
  tool("claude", "Claude Code", ".claude", ".claude/commands/researchspec/<id>.md", "claude"),
  tool("cline", "Cline", ".cline", ".clinerules/workflows/researchspec-<id>.md", "plain-heading"),
  skillsOnly("codeartsagent", "CodeArts", ".codeartsdoer"),
  skillsOnly("codex", "Codex", ".agents", { legacySkillsDirs: [".codex"], detectionPaths: [".agents/skills", ".codex/skills"] }),
  tool("devin", "Devin Desktop (formerly Windsurf)", ".devin", ".devin/workflows/researchspec-<id>.md", "named", { legacySkillsDirs: [".windsurf"], detectionPaths: [".devin", ".windsurf"] }),
  skillsOnly("forgecode", "ForgeCode", ".forge"),
  tool("codebuddy", "CodeBuddy Code (CLI)", ".codebuddy", ".codebuddy/commands/researchspec/<id>.md", "codebuddy"),
  tool("continue", "Continue", ".continue", ".continue/prompts/researchspec-<id>.prompt", "continue"),
  tool("costrict", "CoStrict", ".cospec", ".cospec/researchspec/commands/researchspec-<id>.md", "costrict"),
  tool("crush", "Crush", ".crush", ".crush/commands/researchspec/<id>.md", "named"),
  tool("cursor", "Cursor", ".cursor", ".cursor/commands/researchspec-<id>.md", "cursor"),
  tool("factory", "Factory Droid", ".factory", ".factory/commands/researchspec-<id>.md", "description-arguments"),
  tool("gemini", "Gemini CLI", ".gemini", ".gemini/commands/researchspec/<id>.toml", "toml"),
  tool("github-copilot", "GitHub Copilot", ".github", ".github/prompts/researchspec-<id>.prompt.md", "description", {
    detectionPaths: [
      ".github/copilot-instructions.md", ".github/instructions", ".github/workflows/copilot-setup-steps.yml",
      ".github/prompts", ".github/agents", ".github/skills", ".github/.mcp.json",
    ],
  }),
  skillsOnly("hermes", "Hermes Agent", ".hermes", { detectionPaths: [".hermes", "HERMES.md", ".hermes.md"] }),
  tool("iflow", "iFlow", ".iflow", ".iflow/commands/researchspec-<id>.md", "cursor"),
  tool("junie", "Junie", ".junie", ".junie/commands/researchspec-<id>.md", "description"),
  tool("kilocode", "Kilo Code", ".kilocode", ".kilocode/workflows/researchspec-<id>.md", "plain"),
  skillsOnly("kimi", "Kimi Code", ".kimi-code", { legacySkillsDirs: [".kimi"], detectionPaths: [".kimi-code", ".kimi"] }),
  tool("kiro", "Kiro", ".kiro", ".kiro/prompts/researchspec-<id>.prompt.md", "description"),
  tool("lingma", "Lingma", ".lingma", ".lingma/commands/researchspec/<id>.md", "named"),
  skillsOnly("vibe", "Mistral Vibe", ".vibe"),
  tool("oh-my-pi", "Oh My Pi", ".omp", ".omp/commands/researchspec-<id>.md", "description", { replaceColon: true, injectArguments: true }),
  tool("opencode", "OpenCode", ".opencode", ".opencode/commands/researchspec-<id>.md", "description", { replaceColon: true }),
  tool("pi", "Pi", ".pi", ".pi/prompts/researchspec-<id>.md", "description", { replaceColon: true, injectArguments: true }),
  tool("qoder", "Qoder", ".qoder", ".qoder/commands/researchspec/<id>.md", "named"),
  tool("qwen", "Qwen Code", ".qwen", ".qwen/commands/researchspec-<id>.md", "description-arguments"),
  skillsOnly("rovodev", "Rovo Dev CLI", ".rovodev", { detectionPaths: [".rovodev/skills", ".rovodev"] }),
  tool("roocode", "Zoo Code", ".roo", ".roo/commands/researchspec-<id>.md", "plain-heading"),
  tool("trae", "Trae", ".trae", ".trae/commands/researchspec-<id>.md", "trae"),
  tool("zcode", "ZCode", ".zcode", ".zcode/commands/researchspec/<id>.md", "named"),
  skillsOnly("agents", "Shared .agents skills", ".agents", { detectionPaths: [".agents/skills"] }),
] as const;

export function resolveToolIdAlias(toolId: string): string {
  return TOOL_ID_ALIASES[toolId] ?? toolId;
}

export function getTool(id: string): ToolDefinition | undefined {
  return TOOLS.find((toolDefinition) => toolDefinition.id === resolveToolIdAlias(id));
}

export function parseToolExpression(expression: string): string[] {
  const ids = [...new Set(expression.toLowerCase().split(",").map((value) => resolveToolIdAlias(value.trim())).filter(Boolean))];
  if (ids.includes("all") || ids.includes("none")) {
    if (ids.length !== 1) throw new Error("'all' and 'none' cannot be combined with tool IDs.");
    return ids[0] === "all" ? [...TOOL_IDS] : [];
  }
  const unknown = ids.filter((id) => !getTool(id));
  if (unknown.length) throw new Error(`Unknown tool ID: ${unknown.join(", ")}. Valid IDs: ${[...TOOL_IDS, "windsurf"].join(", ")}`);
  return ids;
}

export function toolSupportsCommands(tool: ToolDefinition): boolean {
  return Boolean(tool.command);
}

export function toolSkillsRoot(tool: ToolDefinition, projectRoot: string): { scope: "project"; root: string; manifestRoot: string } {
  const root = path.join(projectRoot, tool.skillsDir, "skills");
  return { scope: "project", root, manifestRoot: path.posix.join(tool.skillsDir, "skills") };
}

export function sharedSkillTarget(toolId: string): "codex" | "agents" | undefined {
  const resolved = resolveToolIdAlias(toolId);
  return resolved === "codex" || resolved === "agents" ? resolved : undefined;
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
  const configuredSet = new Set(configured.map(resolveToolIdAlias));
  const detectedSet = new Set(detected.map(resolveToolIdAlias));
  return [...TOOLS].sort((left, right) => rank(left.id) - rank(right.id) || left.name.localeCompare(right.name));
  function rank(id: string): number { return configuredSet.has(id) ? 0 : detectedSet.has(id) ? 1 : 2; }
}

function tool(id: ToolId, name: string, skillsDir: string, commandPath: string, format: CommandFormat, options: Omit<ToolExtras, "detectionPaths"> & { detectionPaths?: readonly string[] } = {}): ToolDefinition {
  return { id, name, skillsDir, ...options, command: { scope: "project", format, path: projectCommand(commandPath), ...optionsForCommand(options) } };
}

function skillsOnly(id: ToolId, name: string, skillsDir: string, extras: ToolExtras = {}): ToolDefinition {
  return { id, name, skillsDir, ...extras };
}

interface ToolExtras {
  legacySkillsDirs?: readonly string[];
  detectionPaths?: readonly string[];
  setupNote?: string;
  replaceColon?: boolean;
  injectArguments?: boolean;
}

function optionsForCommand(options: ToolExtras): { replaceColon?: boolean; injectArguments?: boolean } {
  return { ...(options.replaceColon === undefined ? {} : { replaceColon: options.replaceColon }), ...(options.injectArguments === undefined ? {} : { injectArguments: options.injectArguments }) };
}
