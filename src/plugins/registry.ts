import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "yaml";
import { z } from "zod";

import { COMPANION_INTENTS } from "../adapters/companion/index.js";
import { ARSU_SKILL_IDS } from "../arsu-converter/routing/contracts.js";
import { CORE_SKILL_IDS } from "../core-skills/catalog.js";
import { LITERATURE_ADAPTER_SKILL_IDS } from "../literature-adapters/catalog.js";
import type { Diagnostic } from "../core/validation/types.js";

const SkillIdSchema = z.string().min(1).max(128).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const DomainIdSchema = z.string().min(1).max(128).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const RelativeSourcePathSchema = z.string().min(1).refine(isSafeRelativePath, "must be a safe relative POSIX path");
const ImmutableRevisionSchema = z.string().regex(/^[a-f0-9]{7,64}$/, "must be an immutable hexadecimal revision");
const SemverSchema = z.string().regex(/^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/);
const AnzsrcGroupCodeSchema = z.string().regex(/^\d{4}$/);

const UpstreamSchema = z.strictObject({
  source_paths: z.array(RelativeSourcePathSchema).min(1),
  adaptation: z.enum(["curated", "converted"]),
});

export const DomainTaxonomySchema = z.strictObject({
  discipline_system: z.literal("ANZSRC FoR"),
  discipline_version: z.literal("2020"),
  source_release: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const DomainDefinitionSchema = z.discriminatedUnion("domain_type", [z.strictObject({
  domain_id: DomainIdSchema,
  domain_type: z.literal("discipline"),
  anzsrc_group_code: AnzsrcGroupCodeSchema,
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).max(1024),
  version: SemverSchema,
  skills: z.array(SkillIdSchema),
}), z.strictObject({
  domain_id: DomainIdSchema,
  domain_type: z.literal("tool"),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).max(1024),
  version: SemverSchema,
  skills: z.array(SkillIdSchema),
})]);

export const VendorDefinitionSchema = z.strictObject({
  vendor_id: SkillIdSchema,
  name: z.string().trim().min(1),
  repository_url: z.url().refine((value) => value.startsWith("https://") || value.startsWith("http://"), "must use http or https"),
  release: z.string().trim().min(1),
  revision: ImmutableRevisionSchema,
  license: z.string().trim().min(1),
  converter_version: z.string().trim().min(1),
  skills: z.array(z.strictObject({
    skill_id: SkillIdSchema,
    license: z.string().trim().min(1),
    dependencies: z.array(SkillIdSchema),
    upstreams: z.array(UpstreamSchema).min(1),
  })).min(1),
});

export const PluginRegistrySchema = z.strictObject({
  schema_version: z.literal("1"),
  domain_taxonomy: DomainTaxonomySchema,
  vendors: z.array(VendorDefinitionSchema),
  domains: z.array(DomainDefinitionSchema),
});

export type PluginRegistry = z.infer<typeof PluginRegistrySchema>;
export type VendorDefinition = PluginRegistry["vendors"][number];
export type VendorSkillDefinition = VendorDefinition["skills"][number];
export type DomainDefinition = PluginRegistry["domains"][number];
export type DomainSkillPlugin = DomainDefinition;

export function domainIsAvailable(domain: DomainDefinition | undefined): domain is DomainDefinition {
  return domain !== undefined && domain.skills.length > 0;
}

export function availableDomains(loaded: Pick<LoadedPluginRegistry, "domains">): DomainDefinition[] {
  return [...loaded.domains.values()].filter(domainIsAvailable).sort((a, b) => compareText(a.domain_id, b.domain_id));
}

export interface RegisteredSkill {
  vendor: VendorDefinition;
  definition: VendorSkillDefinition;
}

export interface PluginSkillMetadata {
  name: string;
  description: string;
  entrySha256: string;
}

export interface ResolvedDomainSelection {
  selectedDomainIds: string[];
  availableDomainIds: string[];
  unavailableDomainIds: string[];
  directSkillIds: string[];
  resolvedSkillIds: string[];
  skills: RegisteredSkill[];
}

export interface LoadedPluginRegistry {
  root: string;
  registryPath: string;
  registry: PluginRegistry;
  vendors: ReadonlyMap<string, VendorDefinition>;
  domains: ReadonlyMap<string, DomainDefinition>;
  /** Compatibility alias for internal callers while the public command remains `plugin`. */
  plugins: ReadonlyMap<string, DomainDefinition>;
  skills: ReadonlyMap<string, RegisteredSkill>;
  skillMetadata: ReadonlyMap<string, PluginSkillMetadata>;
  skillFiles: ReadonlyMap<string, readonly string[]>;
  diagnostics: readonly Diagnostic[];
}

export class PluginRegistryError extends Error {
  constructor(readonly diagnostics: Diagnostic[]) {
    super(diagnostics.map((item) => item.message).join("; "));
    this.name = "PluginRegistryError";
  }
}

export const PACKAGE_ROOT = fileURLToPath(new URL("../../../", import.meta.url));
export const PLUGIN_ROOT = path.join(PACKAGE_ROOT, "skills/plugins");
export const RESERVED_SKILL_IDS = [...ARSU_SKILL_IDS, ...CORE_SKILL_IDS, ...COMPANION_INTENTS.map((intent) => intent.skillId), ...LITERATURE_ADAPTER_SKILL_IDS] as const;

export async function loadPluginRegistry(pluginRoot = PLUGIN_ROOT, validateSkillContent = true): Promise<LoadedPluginRegistry> {
  const registryPath = path.join(pluginRoot, "registry.json");
  let raw: unknown;
  try { raw = JSON.parse(await readFile(registryPath, "utf8")) as unknown; }
  catch (error) {
    throw new PluginRegistryError([fatal("plugin_registry_unreadable", `Cannot read plugin registry: ${error instanceof Error ? error.message : String(error)}`, registryPath)]);
  }
  return validatePluginRegistry(raw, pluginRoot, registryPath, validateSkillContent);
}

export async function validatePluginRegistry(raw: unknown, pluginRoot: string, registryPath = path.join(pluginRoot, "registry.json"), validateSkillContent = true): Promise<LoadedPluginRegistry> {
  const parsed = PluginRegistrySchema.safeParse(raw);
  if (!parsed.success) throw new PluginRegistryError(parsed.error.issues.map((issue) => fatal("plugin_registry_invalid", `Invalid plugin registry at ${issue.path.join(".") || "root"}: ${issue.message}`, registryPath, issue)));

  const registry = parsed.data;
  const errors: Diagnostic[] = [];
  const warnings: Diagnostic[] = [];
  uniqueIds(registry.vendors.map((item) => item.vendor_id), "vendor", errors, registryPath);
  uniqueIds(registry.domains.map((item) => item.domain_id), "domain", errors, registryPath);
  const reservedIds = new Set<string>(RESERVED_SKILL_IDS);
  const skills = new Map<string, RegisteredSkill>();
  const skillMetadata = new Map<string, PluginSkillMetadata>();
  const skillFiles = new Map<string, readonly string[]>();
  const packagedFiles = validateSkillContent ? new Map<string, readonly string[]>() : await loadPackagedSkillFiles(pluginRoot, registry.vendors);

  for (const vendor of registry.vendors) {
    const localIds = new Set<string>();
    for (const skill of vendor.skills) {
      if (localIds.has(skill.skill_id) || skills.has(skill.skill_id)) errors.push(fatal("plugin_skill_id_duplicate", `Vendor Skill ID must be globally unique: ${skill.skill_id}`, registryPath, { vendor_id: vendor.vendor_id, skill_id: skill.skill_id }));
      if (reservedIds.has(skill.skill_id)) errors.push(fatal("plugin_skill_id_conflict", `Vendor Skill ID conflicts with a reserved ResearchSpec Skill ID: ${skill.skill_id}`, registryPath, { vendor_id: vendor.vendor_id, skill_id: skill.skill_id }));
      localIds.add(skill.skill_id);
      skills.set(skill.skill_id, { vendor, definition: skill });
    }
  }

  for (const [skillId, registered] of skills) {
    const dependencies = new Set<string>();
    for (const dependency of registered.definition.dependencies) {
      if (dependency === skillId) errors.push(fatal("plugin_dependency_self", `Vendor Skill cannot depend on itself: ${skillId}`, registryPath, { skill_id: skillId }));
      else if (!skills.has(dependency)) errors.push(fatal("plugin_dependency_unknown", `Vendor Skill ${skillId} references unknown dependency ${dependency}.`, registryPath, { skill_id: skillId, dependency }));
      if (dependencies.has(dependency)) errors.push(fatal("plugin_dependency_duplicate", `Vendor Skill ${skillId} repeats dependency ${dependency}.`, registryPath, { skill_id: skillId, dependency }));
      dependencies.add(dependency);
    }
    const root = pluginSkillRoot(pluginRoot, registered.vendor.vendor_id, skillId);
    const precomputed = packagedFiles.get(skillId);
    const validation = await validateSkillRoot(root, registered.vendor, registered.definition, errors, validateSkillContent, precomputed);
    skillFiles.set(skillId, validation.files);
    if (validation.metadata) skillMetadata.set(skillId, validation.metadata);
  }

  const directlyReachable = new Set<string>();
  for (const domain of registry.domains) {
    const members = new Set<string>();
    for (const skillId of domain.skills) {
      if (!skills.has(skillId)) errors.push(fatal("plugin_domain_skill_unknown", `Domain ${domain.domain_id} references unknown Skill ${skillId}.`, registryPath, { domain_id: domain.domain_id, skill_id: skillId }));
      if (members.has(skillId)) errors.push(fatal("plugin_domain_skill_duplicate", `Domain ${domain.domain_id} repeats Skill ${skillId}.`, registryPath, { domain_id: domain.domain_id, skill_id: skillId }));
      members.add(skillId);
      directlyReachable.add(skillId);
    }
  }
  const reachable = resolveSkillIds(skills, directlyReachable);
  for (const skillId of skills.keys()) if (!reachable.has(skillId)) errors.push(fatal("plugin_skill_unreachable", `Vendor Skill is unreachable from every domain: ${skillId}`, registryPath, { skill_id: skillId }));
  warnings.push(...cycleDiagnostics(skills, registryPath));

  if (errors.length) throw new PluginRegistryError(errors);
  const domains = new Map(registry.domains.map((domain) => [domain.domain_id, domain]));
  return {
    root: pluginRoot,
    registryPath,
    registry,
    vendors: new Map(registry.vendors.map((vendor) => [vendor.vendor_id, vendor])),
    domains,
    plugins: domains,
    skills,
    skillMetadata,
    skillFiles,
    diagnostics: warnings,
  };
}

export function resolveDomainSelection(loaded: LoadedPluginRegistry, selectedDomainIds: readonly string[]): ResolvedDomainSelection {
  const selected = uniqueSorted(selectedDomainIds);
  const available = selected.filter((id) => domainIsAvailable(loaded.domains.get(id)));
  const unavailable = selected.filter((id) => !domainIsAvailable(loaded.domains.get(id)));
  const direct = new Set<string>();
  for (const domainId of available) for (const skillId of loaded.domains.get(domainId)?.skills ?? []) direct.add(skillId);
  const resolved = resolveSkillIds(loaded.skills, direct);
  const resolvedSkillIds = [...resolved].sort(compareText);
  return {
    selectedDomainIds: selected,
    availableDomainIds: available,
    unavailableDomainIds: unavailable,
    directSkillIds: [...direct].sort(compareText),
    resolvedSkillIds,
    skills: resolvedSkillIds.flatMap((id) => { const skill = loaded.skills.get(id); return skill ? [skill] : []; }),
  };
}

export function pluginSkillRoot(pluginRoot: string, vendorId: string, skillId: string): string {
  if (!SkillIdSchema.safeParse(vendorId).success || !SkillIdSchema.safeParse(skillId).success) throw new Error("Unsafe vendor or Skill ID.");
  return path.join(pluginRoot, "vendors", vendorId, skillId);
}

export function filesForSkill(loaded: LoadedPluginRegistry, skillId: string): readonly string[] { return loaded.skillFiles.get(skillId) ?? []; }

async function validateSkillRoot(
  root: string,
  vendor: VendorDefinition,
  skill: VendorSkillDefinition,
  diagnostics: Diagnostic[],
  validateContent: boolean,
  precomputed?: readonly string[],
): Promise<{ files: readonly string[]; metadata?: PluginSkillMetadata }> {
  let files: string[];
  try { files = precomputed ? precomputed.map((file) => path.join(root, file)) : await walkFiles(root); }
  catch (error) {
    diagnostics.push(fatal("plugin_skill_missing", `Cannot read derived Skill root for ${vendor.vendor_id}/${skill.skill_id}: ${error instanceof Error ? error.message : String(error)}`, root, { vendor_id: vendor.vendor_id, skill_id: skill.skill_id }));
    return { files: [] };
  }
  const relativeFiles = files.map((file) => posix(path.relative(root, file)));
  const skillPath = path.join(root, "SKILL.md");
  if (!relativeFiles.includes("SKILL.md")) {
    diagnostics.push(fatal("plugin_skill_missing", `Registered Skill is missing SKILL.md: ${vendor.vendor_id}/${skill.skill_id}`, skillPath));
    return { files: relativeFiles };
  }
  let metadata: PluginSkillMetadata | undefined;
  try {
    const entry = await readPluginSkillEntry(skillPath);
    metadata = entry.metadata;
    if (entry.metadata.name !== skill.skill_id || path.basename(root) !== entry.metadata.name) diagnostics.push(fatal("plugin_skill_name_mismatch", `SKILL.md name, registry Skill ID, and directory must match: ${skill.skill_id}`, skillPath, { declared_name: entry.metadata.name }));
  } catch (error) { diagnostics.push(fatal("plugin_skill_frontmatter_invalid", `Cannot parse SKILL.md for ${skill.skill_id}: ${error instanceof Error ? error.message : String(error)}`, skillPath)); }
  const licensePath = path.join(root, "LICENSE");
  const noticeName = relativeFiles.includes("NOTICE.md") ? "NOTICE.md" : "NOTICE";
  const noticePath = path.join(root, noticeName);
  if (!relativeFiles.includes("LICENSE") || (validateContent && !(await safeNonEmpty(licensePath)))) diagnostics.push(fatal("plugin_skill_license_missing", `Third-party-derived Skill is missing a non-empty LICENSE: ${skill.skill_id}`, licensePath));
  if ((!relativeFiles.includes("NOTICE.md") && !relativeFiles.includes("NOTICE")) || (validateContent && !(await safeNonEmpty(noticePath)))) diagnostics.push(fatal("plugin_skill_notice_missing", `Third-party-derived Skill is missing a non-empty NOTICE or NOTICE.md: ${skill.skill_id}`, noticePath));
  return { files: relativeFiles, metadata };
}

const SkillFrontmatterSchema = z.looseObject({
  name: SkillIdSchema,
  description: z.string().trim().min(1).max(1024),
  license: z.string().trim().min(1).optional(),
  compatibility: z.string().trim().min(1).max(500).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  "allowed-tools": z.string().trim().min(1).optional(),
});

export async function readPluginSkillEntry(skillPath: string): Promise<{ metadata: PluginSkillMetadata; text: string }> {
  const text = await readFile(skillPath, "utf8");
  const frontmatter = parseSkillFrontmatter(text);
  const result = SkillFrontmatterSchema.safeParse(frontmatter.value);
  if (!result.success) throw new Error(result.error.issues.map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`).join("; "));
  if (!frontmatter.body.trim()) throw new Error("SKILL.md must contain Markdown instructions.");
  return {
    text,
    metadata: {
      name: result.data.name,
      description: result.data.description,
      entrySha256: createHash("sha256").update(text).digest("hex"),
    },
  };
}

function parseSkillFrontmatter(text: string): { value: unknown; body: string } {
  if (!text.startsWith("---\n")) throw new Error("SKILL.md must start with YAML frontmatter.");
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) throw new Error("SKILL.md frontmatter is not closed.");
  return { value: parse(text.slice(4, end)) as unknown, body: text.slice(end + 5) };
}

function resolveSkillIds(skills: ReadonlyMap<string, RegisteredSkill>, roots: Iterable<string>): Set<string> {
  const resolved = new Set<string>();
  const pending = [...roots];
  while (pending.length) {
    const skillId = pending.pop();
    if (!skillId) continue;
    if (resolved.has(skillId) || !skills.has(skillId)) continue;
    resolved.add(skillId);
    pending.push(...(skills.get(skillId)?.definition.dependencies ?? []));
  }
  return resolved;
}

function cycleDiagnostics(skills: ReadonlyMap<string, RegisteredSkill>, registryPath: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const visited = new Set<string>();
  const active = new Set<string>();
  const stack: string[] = [];
  const reported = new Set<string>();
  function visit(skillId: string): void {
    if (active.has(skillId)) {
      const start = stack.indexOf(skillId);
      const cycle = [...stack.slice(start), skillId];
      const key = [...new Set(cycle)].sort(compareText).join("|");
      if (!reported.has(key)) {
        reported.add(key);
        diagnostics.push({ severity: "warning", code: "plugin_dependency_cycle", message: `Vendor Skill dependency cycle: ${cycle.join(" -> ")}`, path: registryPath, blocking: false, details: { cycle } });
      }
      return;
    }
    if (visited.has(skillId)) return;
    visited.add(skillId); active.add(skillId); stack.push(skillId);
    for (const dependency of skills.get(skillId)?.definition.dependencies ?? []) if (skills.has(dependency)) visit(dependency);
    stack.pop(); active.delete(skillId);
  }
  for (const skillId of skills.keys()) visit(skillId);
  return diagnostics;
}

async function walkFiles(root: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symbolic links are not supported in plugin Skills: ${target}`);
    if (entry.isDirectory()) result.push(...await walkFiles(target));
    else if (entry.isFile()) result.push(target);
  }
  return result.sort(compareText);
}

async function loadPackagedSkillFiles(pluginRoot: string, vendors: PluginRegistry["vendors"]): Promise<Map<string, readonly string[]>> {
  const result = new Map<string, readonly string[]>();
  for (const vendor of vendors) {
    try {
      const raw = JSON.parse(await readFile(path.join(pluginRoot, "vendor-manifests", `${vendor.vendor_id}.json`), "utf8")) as { file_dispositions?: Array<{ disposition?: string; output_path?: string }> };
      const bySkill = new Map<string, Set<string>>();
      for (const item of raw.file_dispositions ?? []) {
        const prefix = `vendors/${vendor.vendor_id}/`;
        if (item.disposition !== "included" || typeof item.output_path !== "string" || !item.output_path.startsWith(prefix)) continue;
        const rest = item.output_path.slice(prefix.length);
        const separator = rest.indexOf("/");
        if (separator < 1) continue;
        const skillId = rest.slice(0, separator);
        const relative = rest.slice(separator + 1);
        const files = bySkill.get(skillId) ?? new Set<string>();
        files.add(relative); bySkill.set(skillId, files);
      }
      for (const skill of vendor.skills) {
        const files = bySkill.get(skill.skill_id);
        if (!files?.has("SKILL.md")) continue;
        files.add("LICENSE");
        if (!files.has("NOTICE") && !files.has("NOTICE.md")) files.add("NOTICE.md");
        result.set(skill.skill_id, [...files].sort(compareText));
      }
    } catch { /* Unbundled fixtures and maintainer validation use filesystem discovery. */ }
  }
  return result;
}

async function safeNonEmpty(filePath: string): Promise<boolean> { try { return Boolean((await readFile(filePath, "utf8")).trim()); } catch { return false; } }
function uniqueIds(ids: readonly string[], kind: string, diagnostics: Diagnostic[], registryPath: string): void { const seen = new Set<string>(); for (const id of ids) { if (seen.has(id)) diagnostics.push(fatal(`plugin_${kind}_id_duplicate`, `Duplicate ${kind} ID: ${id}`, registryPath)); seen.add(id); } }
function isSafeRelativePath(value: string): boolean { if (value.includes("\\") || value.startsWith("/") || value.includes("\0")) return false; return value.split("/").every((segment) => Boolean(segment) && segment !== "." && segment !== ".."); }
function fatal(code: string, message: string, filePath: string, details?: unknown): Diagnostic { return { severity: "error", code, message, path: filePath, blocking: true, ...(details === undefined ? {} : { details }) }; }
function uniqueSorted(values: readonly string[]): string[] { return [...new Set(values)].sort(compareText); }
function posix(value: string): string { return value.split(path.sep).join("/"); }
function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
