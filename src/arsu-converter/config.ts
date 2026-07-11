import { ARSU_SKILL_IDS } from "./routing/contracts.js";

export const CONVERTER_VERSION = "0.7.0";

export const VENDOR_SOURCE_PATH = "vendor/ars";
export const GENERATED_OUTPUT_PATH = "skills/arsu";

export const DEFAULT_SKILL_GROUPS = ARSU_SKILL_IDS;

export const OPTIONAL_SKILL_GROUPS = ["experiment-agent"] as const;

export const SKILL_RUNTIME_DIRS = [
  "agents",
  "references",
  "templates",
  "examples",
  "scripts",
] as const;

export const TEXT_RESOURCE_SUFFIXES = new Set([".md", ".txt", ".tex"]);
export const MACHINE_RESOURCE_SUFFIXES = new Set([".json", ".yaml", ".yml", ".toml"]);

export const PLATFORM_TERMS = [
  ".claude/CLAUDE.md",
  "Claude Code",
  "Codex",
  "allowed-tools",
  "SessionStart",
  "slash command",
  "hook",
] as const;

export const HISTORY_TERMS = [
  "Changelog",
  "Version History",
  "Version Info",
  "legacy",
  "deprecated",
  "previous version",
  "migration",
  "previously",
] as const;

export type RequiredSkillGroup = (typeof DEFAULT_SKILL_GROUPS)[number];
export type RuntimeDirectory = (typeof SKILL_RUNTIME_DIRS)[number];
