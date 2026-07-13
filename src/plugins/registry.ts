import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "yaml";
import { z } from "zod";

import { COMPANION_INTENTS } from "../adapters/companion/index.js";
import { ARSU_SKILL_IDS } from "../arsu-converter/routing/contracts.js";
import type { Diagnostic } from "../core/validation/types.js";

const SkillIdSchema = z.string().min(1).max(64).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const RelativeSourcePathSchema = z.string().min(1).refine(isSafeRelativePath, "must be a safe relative POSIX path");
const ImmutableRevisionSchema = z.string().regex(/^[a-f0-9]{7,64}$/, "must be an immutable hexadecimal revision");

export const PluginRegistrySchema = z.strictObject({
  schema_version: z.literal("1"),
  sources: z.array(z.strictObject({
    source_id: SkillIdSchema,
    name: z.string().trim().min(1),
    repository_url: z.url().refine((value) => value.startsWith("https://") || value.startsWith("http://"), "must use http or https"),
    license: z.string().trim().min(1),
  })),
  plugins: z.array(z.strictObject({
    plugin_id: SkillIdSchema,
    title: z.string().trim().min(1),
    description: z.string().trim().min(1).max(1024),
    version: z.string().regex(/^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/),
    domain: z.string().trim().min(1),
    skills: z.array(z.strictObject({
      skill_id: SkillIdSchema,
      upstreams: z.array(z.strictObject({
        source_id: SkillIdSchema,
        revision: ImmutableRevisionSchema,
        source_paths: z.array(RelativeSourcePathSchema).min(1),
        adaptation: z.enum(["curated", "converted"]),
      })).min(1),
    })).min(1),
  })),
});

export type PluginRegistry = z.infer<typeof PluginRegistrySchema>;
export type DomainSkillPlugin = PluginRegistry["plugins"][number];
export type DomainSkillDefinition = DomainSkillPlugin["skills"][number];

export interface LoadedPluginRegistry {
  root: string;
  registryPath: string;
  registry: PluginRegistry;
  plugins: ReadonlyMap<string, DomainSkillPlugin>;
  skillFiles: ReadonlyMap<string, readonly string[]>;
}

export class PluginRegistryError extends Error {
  constructor(readonly diagnostics: Diagnostic[]) {
    super(diagnostics.map((item) => item.message).join("; "));
    this.name = "PluginRegistryError";
  }
}

export const PACKAGE_ROOT = fileURLToPath(new URL("../../../", import.meta.url));
export const PLUGIN_ROOT = path.join(PACKAGE_ROOT, "skills/plugins");
export const BASE_SKILL_IDS = [...ARSU_SKILL_IDS, ...COMPANION_INTENTS.map((intent) => intent.skillId)] as const;

export async function loadPluginRegistry(pluginRoot = PLUGIN_ROOT): Promise<LoadedPluginRegistry> {
  const registryPath = path.join(pluginRoot, "registry.json");
  let raw: unknown;
  try {
    raw = JSON.parse(await readFile(registryPath, "utf8")) as unknown;
  } catch (error) {
    throw new PluginRegistryError([diagnostic("plugin_registry_unreadable", `Cannot read plugin registry: ${error instanceof Error ? error.message : String(error)}`, registryPath)]);
  }
  return validatePluginRegistry(raw, pluginRoot, registryPath);
}

export async function validatePluginRegistry(raw: unknown, pluginRoot: string, registryPath = path.join(pluginRoot, "registry.json")): Promise<LoadedPluginRegistry> {
  const parsed = PluginRegistrySchema.safeParse(raw);
  if (!parsed.success) {
    throw new PluginRegistryError(parsed.error.issues.map((issue) => diagnostic("plugin_registry_invalid", `Invalid plugin registry at ${issue.path.join(".") || "root"}: ${issue.message}`, registryPath, issue)));
  }

  const registry = parsed.data;
  const diagnostics: Diagnostic[] = [];
  const sourceIds = uniqueIds(registry.sources.map((item) => item.source_id), "source", diagnostics, registryPath);
  uniqueIds(registry.plugins.map((item) => item.plugin_id), "plugin", diagnostics, registryPath);
  const skillIds = new Set<string>();
  const baseIds = new Set<string>(BASE_SKILL_IDS);
  const skillFiles = new Map<string, readonly string[]>();

  for (const plugin of registry.plugins) {
    const pluginSkillIds = new Set<string>();
    for (const skill of plugin.skills) {
      if (pluginSkillIds.has(skill.skill_id) || skillIds.has(skill.skill_id)) diagnostics.push(diagnostic("plugin_skill_id_duplicate", `Plugin Skill ID must be globally unique: ${skill.skill_id}`, registryPath, { plugin_id: plugin.plugin_id, skill_id: skill.skill_id }));
      if (baseIds.has(skill.skill_id)) diagnostics.push(diagnostic("plugin_skill_id_conflict", `Plugin Skill ID conflicts with the fixed base surface: ${skill.skill_id}`, registryPath, { plugin_id: plugin.plugin_id, skill_id: skill.skill_id }));
      pluginSkillIds.add(skill.skill_id);
      skillIds.add(skill.skill_id);
      for (const upstream of skill.upstreams) {
        if (!sourceIds.has(upstream.source_id)) diagnostics.push(diagnostic("plugin_source_unknown", `Plugin Skill ${skill.skill_id} references unknown source ${upstream.source_id}.`, registryPath, { plugin_id: plugin.plugin_id, skill_id: skill.skill_id, source_id: upstream.source_id }));
      }
      const skillRoot = pluginSkillRoot(pluginRoot, plugin.plugin_id, skill.skill_id);
      const files = await validateSkillRoot(skillRoot, plugin, skill, diagnostics);
      skillFiles.set(skillKey(plugin.plugin_id, skill.skill_id), files);
    }
  }

  if (diagnostics.length) throw new PluginRegistryError(diagnostics);
  return {
    root: pluginRoot,
    registryPath,
    registry,
    plugins: new Map(registry.plugins.map((plugin) => [plugin.plugin_id, plugin])),
    skillFiles,
  };
}

export function pluginSkillRoot(pluginRoot: string, pluginId: string, skillId: string): string {
  if (!SkillIdSchema.safeParse(pluginId).success || !SkillIdSchema.safeParse(skillId).success) throw new Error("Unsafe plugin or Skill ID.");
  return path.join(pluginRoot, pluginId, skillId);
}

export function filesForSkill(loaded: LoadedPluginRegistry, pluginId: string, skillId: string): readonly string[] {
  return loaded.skillFiles.get(skillKey(pluginId, skillId)) ?? [];
}

async function validateSkillRoot(root: string, plugin: DomainSkillPlugin, skill: DomainSkillDefinition, diagnostics: Diagnostic[]): Promise<readonly string[]> {
  let files: string[];
  try { files = await walkFiles(root); }
  catch (error) {
    diagnostics.push(diagnostic("plugin_skill_missing", `Cannot read derived Skill root for ${plugin.plugin_id}/${skill.skill_id}: ${error instanceof Error ? error.message : String(error)}`, root, { plugin_id: plugin.plugin_id, skill_id: skill.skill_id }));
    return [];
  }
  const relativeFiles = files.map((file) => posix(path.relative(root, file)));
  const skillPath = path.join(root, "SKILL.md");
  if (!relativeFiles.includes("SKILL.md")) {
    diagnostics.push(diagnostic("plugin_skill_missing", `Registered Skill is missing SKILL.md: ${plugin.plugin_id}/${skill.skill_id}`, skillPath, { plugin_id: plugin.plugin_id, skill_id: skill.skill_id }));
    return relativeFiles;
  }
  try {
    const frontmatter = parseSkillFrontmatter(await readFile(skillPath, "utf8"));
    const result = SkillFrontmatterSchema.safeParse(frontmatter.value);
    if (!result.success) {
      for (const issue of result.error.issues) diagnostics.push(diagnostic("plugin_skill_frontmatter_invalid", `Invalid SKILL.md frontmatter for ${skill.skill_id} at ${issue.path.join(".") || "root"}: ${issue.message}`, skillPath, issue));
    } else if (result.data.name !== skill.skill_id || path.basename(root) !== result.data.name) {
      diagnostics.push(diagnostic("plugin_skill_name_mismatch", `SKILL.md name, registry Skill ID, and directory must match: ${skill.skill_id}`, skillPath, { declared_name: result.data.name, skill_id: skill.skill_id, directory: path.basename(root) }));
    }
    if (!frontmatter.body.trim()) diagnostics.push(diagnostic("plugin_skill_body_missing", `SKILL.md must contain Markdown instructions: ${skill.skill_id}`, skillPath));
  } catch (error) {
    diagnostics.push(diagnostic("plugin_skill_frontmatter_invalid", `Cannot parse SKILL.md for ${skill.skill_id}: ${error instanceof Error ? error.message : String(error)}`, skillPath));
  }
  const licensePath = path.join(root, "LICENSE");
  const noticePath = path.join(root, "NOTICE.md");
  if (!relativeFiles.includes("LICENSE") || !(await readFile(licensePath, "utf8")).trim()) diagnostics.push(diagnostic("plugin_skill_license_missing", `Third-party-derived Skill is missing a non-empty LICENSE: ${skill.skill_id}`, licensePath));
  if (!relativeFiles.includes("NOTICE.md") || !(await readFile(noticePath, "utf8")).trim()) diagnostics.push(diagnostic("plugin_skill_notice_missing", `Third-party-derived Skill is missing a non-empty NOTICE.md: ${skill.skill_id}`, noticePath));
  return relativeFiles;
}

const SkillFrontmatterSchema = z.looseObject({
  name: SkillIdSchema,
  description: z.string().trim().min(1).max(1024),
  license: z.string().trim().min(1).optional(),
  compatibility: z.string().trim().min(1).max(500).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  "allowed-tools": z.string().trim().min(1).optional(),
});

function parseSkillFrontmatter(text: string): { value: unknown; body: string } {
  if (!text.startsWith("---\n")) throw new Error("SKILL.md must start with YAML frontmatter.");
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) throw new Error("SKILL.md frontmatter is not closed.");
  return { value: parse(text.slice(4, end)) as unknown, body: text.slice(end + 5) };
}

async function walkFiles(root: string): Promise<string[]> {
  const result: string[] = [];
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const target = path.join(root, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symbolic links are not supported in plugin Skills: ${target}`);
    if (entry.isDirectory()) result.push(...await walkFiles(target));
    else if (entry.isFile()) result.push(target);
  }
  return result.sort(compareText);
}

function uniqueIds(ids: readonly string[], kind: string, diagnostics: Diagnostic[], registryPath: string): Set<string> {
  const result = new Set<string>();
  for (const id of ids) {
    if (result.has(id)) diagnostics.push(diagnostic(`plugin_${kind}_id_duplicate`, `Duplicate ${kind} ID: ${id}`, registryPath));
    result.add(id);
  }
  return result;
}

function isSafeRelativePath(value: string): boolean {
  if (value.includes("\\") || value.startsWith("/") || value.includes("\0")) return false;
  const segments = value.split("/");
  return segments.every((segment) => Boolean(segment) && segment !== "." && segment !== "..");
}

function diagnostic(code: string, message: string, filePath: string, details?: unknown): Diagnostic {
  return { severity: "error", code, message, path: filePath, blocking: true, ...(details === undefined ? {} : { details }) };
}

function skillKey(pluginId: string, skillId: string): string { return `${pluginId}:${skillId}`; }
function posix(value: string): string { return value.split(path.sep).join("/"); }
function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
