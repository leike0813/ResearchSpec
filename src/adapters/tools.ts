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
export type AgentProfileFormat = "frontmatter" | "toml";

export interface ProjectEntryDefinition {
  mechanism: "region" | "file" | "discovery";
  path?: string;
  format?: "markdown" | "mdc";
  documentation?: string;
  checked_on?: string;
  limitation: string;
}

export interface AgentProfileToolDefinition {
  dir: string;
  suffix: string;
  format: AgentProfileFormat;
  mode?: { key: string; value: string };
  inheritModel?: boolean;
  omitName?: boolean;
  nameKey?: string;
  permissions?: {
    allowKey?: string;
    allow?: readonly string[];
    denyKey?: string;
    deny?: readonly string[];
    mapKey?: string;
    map?: Readonly<Record<string, boolean>>;
    tomlAllowKey?: string;
    tomlDenyKey?: string;
  };
  extra?: Readonly<Record<string, string | boolean>>;
  descriptionStyle?: "json";
  promptRef?: { dir: string; key: string };
}

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
  entry: ProjectEntryDefinition;
  agentProfile?: AgentProfileToolDefinition;
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

const AGENT_ALLOW = ["Read", "Grep", "Glob", "WebFetch", "WebSearch", "Write", "Edit"] as const;
const AGENT_DENY = ["Bash", "AskUserQuestion", "Task"] as const;
const AGENT_PROFILES: Partial<Record<ToolId, AgentProfileToolDefinition>> = {
  antigravity: { dir: ".agents/agents", suffix: ".md", format: "frontmatter", permissions: { allowKey: "tools", allow: AGENT_ALLOW } },
  auggie: { dir: ".augment/agents", suffix: ".md", format: "frontmatter", permissions: { allowKey: "tools", allow: AGENT_ALLOW, denyKey: "disabled_tools", deny: AGENT_DENY } },
  claude: { dir: ".claude/agents", suffix: ".md", format: "frontmatter", inheritModel: true, permissions: { allowKey: "tools", allow: AGENT_ALLOW, denyKey: "disallowedTools", deny: AGENT_DENY } },
  codeartsagent: { dir: ".codeartsdoer/agents", suffix: ".md", format: "frontmatter", omitName: true, mode: { key: "mode", value: "subagent" }, permissions: { mapKey: "tools", map: { read: true, grep: true, glob: true, webfetch: true, write: true, edit: true, bash: false, task: false } } },
  codebuddy: { dir: ".codebuddy/agents", suffix: ".md", format: "frontmatter", descriptionStyle: "json", permissions: { allowKey: "tools", allow: AGENT_ALLOW, denyKey: "disallowedTools", deny: AGENT_DENY } },
  codex: { dir: ".codex/agents", suffix: ".toml", format: "toml" },
  devin: { dir: ".devin/agents", suffix: ".md", format: "frontmatter", permissions: { allowKey: "tools", allow: AGENT_ALLOW } },
  forgecode: { dir: ".forge/agents", suffix: ".md", format: "frontmatter", permissions: { allowKey: "tools", allow: AGENT_ALLOW }, extra: { tool_supported: true } },
  costrict: { dir: ".costrict/agents", suffix: ".md", format: "frontmatter", descriptionStyle: "json", permissions: { allowKey: "tools", allow: AGENT_ALLOW } },
  cursor: { dir: ".cursor/agents", suffix: ".md", format: "frontmatter", permissions: { allowKey: "tools", allow: AGENT_ALLOW } },
  factory: { dir: ".factory/droids", suffix: ".md", format: "frontmatter", permissions: { allowKey: "tools", allow: AGENT_ALLOW } },
  gemini: { dir: ".gemini/agents", suffix: ".md", format: "frontmatter", permissions: { allowKey: "tools", allow: AGENT_ALLOW } },
  "github-copilot": { dir: ".github/agents", suffix: ".agent.md", format: "frontmatter", permissions: { allowKey: "tools", allow: AGENT_ALLOW } },
  iflow: { dir: ".iflow/agents", suffix: ".md", format: "frontmatter", mode: { key: "agentType", value: "subagent" }, permissions: { allowKey: "allowedTools", allow: AGENT_ALLOW } },
  junie: { dir: ".junie/agents", suffix: ".md", format: "frontmatter", permissions: { allowKey: "tools", allow: AGENT_ALLOW, denyKey: "disallowedTools", deny: AGENT_DENY } },
  kilocode: { dir: ".kilo/agents", suffix: ".md", format: "frontmatter", mode: { key: "mode", value: "subagent" }, permissions: { allowKey: "tools", allow: AGENT_ALLOW } },
  kiro: { dir: ".kiro/agents", suffix: ".md", format: "frontmatter", permissions: { allowKey: "tools", allow: AGENT_ALLOW, denyKey: "excludedTools", deny: AGENT_DENY } },
  vibe: { dir: ".vibe/agents", suffix: ".toml", format: "toml", nameKey: "display_name", mode: { key: "agent_type", value: "subagent" }, promptRef: { dir: ".vibe/prompts", key: "system_prompt_id" }, permissions: { tomlDenyKey: "disabled_tools", deny: ["bash", "task"] } },
  "oh-my-pi": { dir: ".omp/agents", suffix: ".md", format: "frontmatter", permissions: { allowKey: "tools", allow: AGENT_ALLOW } },
  opencode: { dir: ".opencode/agents", suffix: ".md", format: "frontmatter", omitName: true, mode: { key: "mode", value: "subagent" }, permissions: { mapKey: "tools", map: { read: true, grep: true, glob: true, webfetch: true, write: true, edit: true, bash: false, task: false } } },
  qoder: { dir: ".qoder/agents", suffix: ".md", format: "frontmatter", permissions: { allowKey: "tools", allow: AGENT_ALLOW, denyKey: "disallowedTools", deny: AGENT_DENY } },
  qwen: { dir: ".qwen/agents", suffix: ".md", format: "frontmatter", permissions: { allowKey: "tools", allow: AGENT_ALLOW, denyKey: "disallowedTools", deny: AGENT_DENY } },
  rovodev: { dir: ".rovodev/subagents", suffix: ".md", format: "frontmatter", permissions: { allowKey: "tools", allow: AGENT_ALLOW } },
  trae: { dir: ".trae/agents", suffix: ".md", format: "frontmatter", permissions: { allowKey: "tools", allow: AGENT_ALLOW } },
};

const projectCommand = (relative: string) => (id: string, root: string) => path.join(root, relative.replace("<id>", id));

const ENTRY_CHECKED_ON = "2026-09-26";
const DOCUMENTED_ENTRIES: Partial<Record<ToolId, ProjectEntryDefinition>> = {
  codex: { mechanism: "region", path: "AGENTS.md", format: "markdown", documentation: "https://learn.chatgpt.com/docs/agent-configuration/agents-md", checked_on: ENTRY_CHECKED_ON, limitation: "A nonempty root AGENTS.override.md can shadow AGENTS.md." },
  opencode: { mechanism: "region", path: "AGENTS.md", format: "markdown", documentation: "https://opencode.ai/docs/rules/", checked_on: ENTRY_CHECKED_ON, limitation: "Creating AGENTS.md can suppress an existing CLAUDE.md fallback." },
  gemini: { mechanism: "region", path: "GEMINI.md", format: "markdown", documentation: "https://geminicli.com/docs/cli/gemini-md/", checked_on: ENTRY_CHECKED_ON, limitation: "Host settings can change context-file discovery." },
  claude: { mechanism: "file", path: ".claude/rules/researchspec.md", format: "markdown", documentation: "https://code.claude.com/docs/en/memory", checked_on: ENTRY_CHECKED_ON, limitation: "Project rules can be disabled by host settings." },
  cursor: { mechanism: "file", path: ".cursor/rules/researchspec.mdc", format: "mdc", documentation: "https://cursor.com/docs/rules", checked_on: ENTRY_CHECKED_ON, limitation: "Always Apply configures rule inclusion; actual invocation still needs host verification." },
  "github-copilot": { mechanism: "region", path: ".github/copilot-instructions.md", format: "markdown", documentation: "https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions", checked_on: ENTRY_CHECKED_ON, limitation: "File-pattern rules alone cannot guarantee context before a file is opened." },
};

const DISCOVERY_ENTRY: ProjectEntryDefinition = {
  mechanism: "discovery",
  limitation: "Project-rule support has not been reviewed; use the delivered Navigate Skill or command through host discovery.",
};

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
].map((definition) => {
  const agentProfile = AGENT_PROFILES[definition.id];
  return { ...definition, entry: DOCUMENTED_ENTRIES[definition.id] ?? DISCOVERY_ENTRY, ...(agentProfile ? { agentProfile } : {}) };
});

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

function tool(id: ToolId, name: string, skillsDir: string, commandPath: string, format: CommandFormat, options: Omit<ToolExtras, "detectionPaths"> & { detectionPaths?: readonly string[] } = {}): Omit<ToolDefinition, "entry"> {
  return { id, name, skillsDir, ...options, command: { scope: "project", format, path: projectCommand(commandPath), ...optionsForCommand(options) } };
}

function skillsOnly(id: ToolId, name: string, skillsDir: string, extras: ToolExtras = {}): Omit<ToolDefinition, "entry"> {
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
