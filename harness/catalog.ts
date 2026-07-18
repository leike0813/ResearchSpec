import { lstat, readFile, readdir, realpath, stat } from "node:fs/promises";
import path from "node:path";

import { parse } from "yaml";

import { COMPANION_INTENTS, renderCompanionSkill } from "../src/adapters/companion/index.js";
import { checkArsuOutput } from "../src/arsu-converter/converter.js";
import { ARSU_ROUTING_CATALOG } from "../src/arsu-converter/routing/catalog.js";
import { ARSU_SKILL_IDS } from "../src/arsu-converter/routing/contracts.js";
import { MIT_LICENSE_TEXT } from "../src/licensing.js";
import { LITERATURE_ADAPTER_CATALOG } from "../src/literature-adapters/catalog.js";
import { assemblePluginRegistry } from "../src/plugins/assembler.js";
import {
  filesForSkill,
  pluginSkillRoot,
  readPluginSkillEntry,
  resolveDomainSelection,
  validatePluginRegistry,
} from "../src/plugins/registry.js";

export type HarnessSkillFamily = "arsu" | "companion" | "literature-adapter" | "plugin";
export type HarnessFileKind = "markdown" | "text" | "image" | "binary";

export interface HarnessDiagnostic {
  source: HarnessSkillFamily | "registry";
  severity: "info" | "warning" | "error";
  code: string;
  message: string;
}

export interface HarnessFile {
  path: string;
  kind: HarnessFileKind;
  content_type: string;
  size: number;
}

export interface HarnessFileTreeDirectory {
  node_type: "directory";
  name: string;
  path: string;
  children: HarnessFileTreeNode[];
}

export interface HarnessFileTreeFile extends HarnessFile {
  node_type: "file";
  name: string;
}

export type HarnessFileTreeNode = HarnessFileTreeDirectory | HarnessFileTreeFile;

export interface HarnessVendor {
  vendor_id: string;
  name: string;
  release: string;
  revision: string;
  repository_url: string;
}

export interface HarnessSkill {
  skill_id: string;
  family: HarnessSkillFamily;
  title: string;
  description: string;
  license: string | null;
  dependencies: string[];
  direct_domain_ids: string[];
  resolved_domain_ids: string[];
  vendor: HarnessVendor | null;
  files: HarnessFile[];
  file_tree: HarnessFileTreeNode[];
}

export interface HarnessDomain {
  domain_id: string;
  title: string;
  description: string;
  version: string;
  domain_type: "discipline" | "tool";
  anzsrc_group_code: string | null;
  available: boolean;
  direct_skill_ids: string[];
  resolved_skill_ids: string[];
}

export interface HarnessCatalog {
  summary: {
    arsu_skills: number;
    companion_skills: number;
    literature_adapter_skills: number;
    plugin_skills: number;
    domains: number;
    available_domains: number;
  };
  diagnostics: HarnessDiagnostic[];
  skills: HarnessSkill[];
  domains: HarnessDomain[];
}

interface DiskFileSource {
  type: "disk";
  root: string;
  absolutePath: string;
}

interface VirtualFileSource {
  type: "virtual";
  content: Buffer;
}

type HarnessFileSource = DiskFileSource | VirtualFileSource;

export interface LoadedHarnessCatalog {
  catalog: HarnessCatalog;
  fileSources: ReadonlyMap<string, ReadonlyMap<string, HarnessFileSource>>;
}

export interface HarnessFileContent {
  metadata: HarnessFile;
  bytes: Buffer;
}

const TEXT_EXTENSIONS = new Set([
  ".bib", ".bst", ".csv", ".html", ".js", ".json", ".mjs", ".py", ".r", ".rb",
  ".sh", ".sty", ".tex", ".toml", ".ts", ".txt", ".xml", ".yaml", ".yml",
]);
const IMAGE_TYPES = new Map([
  [".gif", "image/gif"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

export async function loadHarnessCatalog(repoRoot: string): Promise<LoadedHarnessCatalog> {
  const resolvedRoot = path.resolve(repoRoot);
  const diagnostics: HarnessDiagnostic[] = [];
  const skills: HarnessSkill[] = [];
  const domains: HarnessDomain[] = [];
  const fileSources = new Map<string, ReadonlyMap<string, HarnessFileSource>>();

  await loadArsu(resolvedRoot, skills, fileSources, diagnostics);
  loadCompanions(skills, fileSources);
  await loadLiteratureAdapters(resolvedRoot, skills, fileSources, diagnostics);
  await loadPlugins(resolvedRoot, skills, domains, fileSources, diagnostics);

  skills.sort((left, right) => compareText(left.skill_id, right.skill_id));
  domains.sort((left, right) => compareText(left.domain_id, right.domain_id));
  diagnostics.sort((left, right) => compareText(`${left.source}:${left.code}:${left.message}`, `${right.source}:${right.code}:${right.message}`));

  return {
    catalog: {
      summary: {
        arsu_skills: skills.filter((skill) => skill.family === "arsu").length,
        companion_skills: skills.filter((skill) => skill.family === "companion").length,
        literature_adapter_skills: skills.filter((skill) => skill.family === "literature-adapter").length,
        plugin_skills: skills.filter((skill) => skill.family === "plugin").length,
        domains: domains.length,
        available_domains: domains.filter((domain) => domain.available).length,
      },
      diagnostics,
      skills,
      domains,
    },
    fileSources,
  };
}

async function loadLiteratureAdapters(
  repoRoot: string,
  skills: HarnessSkill[],
  fileSources: Map<string, ReadonlyMap<string, HarnessFileSource>>,
  diagnostics: HarnessDiagnostic[],
): Promise<void> {
  for (const adapter of LITERATURE_ADAPTER_CATALOG) {
    for (const skillId of [adapter.primary_skill_id, adapter.helper_skill_id]) {
      const sourcePath = adapter.skill_source_paths[skillId];
      if (!sourcePath) throw new Error(`Literature adapter Skill path is missing: ${skillId}`);
      const root = path.join(repoRoot, sourcePath);
      try {
        const sources = await diskSources(root);
        const entry = await readFile(path.join(root, "SKILL.md"), "utf8");
        const frontmatter = parseFrontmatter(entry);
        const files = await fileMetadata(sources);
        skills.push({
          skill_id: skillId,
          family: "literature-adapter",
          title: titleCase(skillId),
          description: stringValue(frontmatter.description) ?? "",
          license: "AGPL-3.0-only",
          dependencies: [],
          direct_domain_ids: [],
          resolved_domain_ids: [],
          vendor: {
            vendor_id: adapter.adapter_id,
            name: "Zotero Literature Adapter",
            release: adapter.identity.release_set_id,
            revision: adapter.source.bundle_commit,
            repository_url: `https://github.com/${adapter.source.bundle_repository}`,
          },
          files,
          file_tree: buildHarnessFileTree(files),
        });
        fileSources.set(skillId, sources);
      } catch (error) {
        diagnostics.push({ source: "literature-adapter", severity: "error", code: "literature_adapter_skill_unreadable", message: `${skillId}: ${errorMessage(error)}` });
      }
    }
  }
}

export async function readHarnessFile(loaded: LoadedHarnessCatalog, skillId: string, relativePath: string): Promise<HarnessFileContent | undefined> {
  const normalized = normalizeRelativePath(relativePath);
  if (!normalized) return undefined;
  const source = loaded.fileSources.get(skillId)?.get(normalized);
  const metadata = loaded.catalog.skills.find((skill) => skill.skill_id === skillId)?.files.find((file) => file.path === normalized);
  if (!source || !metadata) return undefined;
  if (source.type === "virtual") return { metadata, bytes: source.content };

  const sourceDetails = await lstat(source.absolutePath);
  if (!sourceDetails.isFile() || sourceDetails.isSymbolicLink()) return undefined;
  const root = await realpath(source.root);
  const file = await realpath(source.absolutePath);
  if (!isWithin(root, file)) return undefined;
  return { metadata, bytes: await readFile(file) };
}

export async function validateHarnessSkillRoot(root: string): Promise<void> {
  await diskSources(path.resolve(root));
}

async function loadArsu(
  repoRoot: string,
  skills: HarnessSkill[],
  fileSources: Map<string, ReadonlyMap<string, HarnessFileSource>>,
  diagnostics: HarnessDiagnostic[],
): Promise<void> {
  try {
    const validation = await checkArsuOutput(repoRoot);
    for (const message of validation.errors) diagnostics.push({ source: "arsu", severity: "error", code: "arsu_output_invalid", message });
    for (const message of validation.warnings) diagnostics.push({ source: "arsu", severity: "warning", code: "arsu_output_warning", message });
  } catch (error) {
    diagnostics.push({ source: "arsu", severity: "error", code: "arsu_check_failed", message: errorMessage(error) });
  }

  for (const skillId of ARSU_SKILL_IDS) {
    const root = path.join(repoRoot, "skills/arsu", skillId);
    try {
      const sources = await diskSources(root);
      const entry = await readFile(path.join(root, "SKILL.md"), "utf8");
      const frontmatter = parseFrontmatter(entry);
      const routing = ARSU_ROUTING_CATALOG.skills.find((item) => item.skill_id === skillId);
      const files = await fileMetadata(sources);
      skills.push({
        skill_id: skillId,
        family: "arsu",
        title: routing?.title ?? titleCase(skillId),
        description: stringValue(frontmatter.description) ?? routing?.summary ?? "",
        license: "CC BY-NC 4.0",
        dependencies: [],
        direct_domain_ids: [],
        resolved_domain_ids: [],
        vendor: null,
        files,
        file_tree: buildHarnessFileTree(files),
      });
      fileSources.set(skillId, sources);
    } catch (error) {
      diagnostics.push({ source: "arsu", severity: "error", code: "arsu_skill_unreadable", message: `${skillId}: ${errorMessage(error)}` });
    }
  }
}

function loadCompanions(skills: HarnessSkill[], fileSources: Map<string, ReadonlyMap<string, HarnessFileSource>>): void {
  for (const intent of COMPANION_INTENTS) {
    const virtual = new Map<string, HarnessFileSource>([
      ["LICENSE", { type: "virtual", content: Buffer.from(MIT_LICENSE_TEXT, "utf8") }],
      ["SKILL.md", { type: "virtual", content: Buffer.from(renderCompanionSkill(intent), "utf8") }],
    ]);
    const files = [...virtual.entries()]
      .map(([filePath, source]) => metadataFor(filePath, source.type === "virtual" ? source.content.byteLength : 0))
      .sort((left, right) => compareText(left.path, right.path));
    skills.push({
      skill_id: intent.skillId,
      family: "companion",
      title: intent.name,
      description: intent.description,
      license: "MIT",
      dependencies: [],
      direct_domain_ids: [],
      resolved_domain_ids: [],
      vendor: null,
      files,
      file_tree: buildHarnessFileTree(files),
    });
    fileSources.set(intent.skillId, virtual);
  }
}

async function loadPlugins(
  repoRoot: string,
  skills: HarnessSkill[],
  domains: HarnessDomain[],
  fileSources: Map<string, ReadonlyMap<string, HarnessFileSource>>,
  diagnostics: HarnessDiagnostic[],
): Promise<void> {
  const pluginRoot = path.join(repoRoot, "skills/plugins");
  try {
    const assembled = await assemblePluginRegistry({ repoRoot, pluginRoot, write: false });
    const committed = JSON.parse(await readFile(path.join(pluginRoot, "registry.json"), "utf8")) as unknown;
    if (JSON.stringify(committed) !== JSON.stringify(assembled)) {
      diagnostics.push({ source: "registry", severity: "warning", code: "plugin_registry_drift", message: "skills/plugins/registry.json differs from the current in-memory assembly." });
    }
    const loaded = await validatePluginRegistry(assembled, pluginRoot, path.join(pluginRoot, "registry.json"), false);
    for (const item of loaded.diagnostics) {
      diagnostics.push({ source: "registry", severity: item.severity, code: item.code, message: item.message });
    }

    const directDomains = new Map<string, string[]>();
    const resolvedDomains = new Map<string, string[]>();
    for (const domain of loaded.domains.values()) {
      const resolution = resolveDomainSelection(loaded, [domain.domain_id]);
      domains.push({
        domain_id: domain.domain_id,
        title: domain.title,
        description: domain.description,
        version: domain.version,
        domain_type: domain.domain_type,
        anzsrc_group_code: domain.domain_type === "discipline" ? domain.anzsrc_group_code : null,
        available: domain.skills.length > 0,
        direct_skill_ids: [...domain.skills].sort(compareText),
        resolved_skill_ids: resolution.resolvedSkillIds,
      });
      for (const skillId of domain.skills) append(directDomains, skillId, domain.domain_id);
      for (const skillId of resolution.resolvedSkillIds) append(resolvedDomains, skillId, domain.domain_id);
    }

    for (const [skillId, registered] of loaded.skills) {
      const root = pluginSkillRoot(pluginRoot, registered.vendor.vendor_id, skillId);
      const sourceFiles = new Map<string, HarnessFileSource>();
      for (const relativePath of filesForSkill(loaded, skillId)) {
        sourceFiles.set(relativePath, { type: "disk", root, absolutePath: path.join(root, relativePath) });
      }
      const entry = await readPluginSkillEntry(path.join(root, "SKILL.md"));
      const files = await fileMetadata(sourceFiles);
      skills.push({
        skill_id: skillId,
        family: "plugin",
        title: titleCase(skillId),
        description: entry.metadata.description,
        license: registered.definition.license,
        dependencies: [...registered.definition.dependencies].sort(compareText),
        direct_domain_ids: sorted(directDomains.get(skillId) ?? []),
        resolved_domain_ids: sorted(resolvedDomains.get(skillId) ?? []),
        vendor: {
          vendor_id: registered.vendor.vendor_id,
          name: registered.vendor.name,
          release: registered.vendor.release,
          revision: registered.vendor.revision,
          repository_url: registered.vendor.repository_url,
        },
        files,
        file_tree: buildHarnessFileTree(files),
      });
      fileSources.set(skillId, sourceFiles);
    }
  } catch (error) {
    diagnostics.push({ source: "registry", severity: "error", code: "plugin_assembly_failed", message: errorMessage(error) });
  }
}

async function diskSources(root: string): Promise<Map<string, HarnessFileSource>> {
  const result = new Map<string, HarnessFileSource>();
  await walk(root, root, result);
  return result;
}

async function walk(root: string, directory: string, result: Map<string, HarnessFileSource>): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symbolic links are not supported: ${absolutePath}`);
    if (entry.isDirectory()) await walk(root, absolutePath, result);
    else if (entry.isFile()) result.set(posix(path.relative(root, absolutePath)), { type: "disk", root, absolutePath });
  }
}

async function fileMetadata(sources: ReadonlyMap<string, HarnessFileSource>): Promise<HarnessFile[]> {
  const files: HarnessFile[] = [];
  for (const [filePath, source] of sources) {
    const size = source.type === "virtual" ? source.content.byteLength : (await stat(source.absolutePath)).size;
    files.push(metadataFor(filePath, size));
  }
  return files.sort((left, right) => compareText(left.path, right.path));
}

interface MutableFileTreeDirectory {
  node_type: "directory";
  name: string;
  path: string;
  children: Map<string, MutableFileTreeDirectory | HarnessFileTreeFile>;
}

export function buildHarnessFileTree(files: readonly HarnessFile[]): HarnessFileTreeNode[] {
  const root: MutableFileTreeDirectory = { node_type: "directory", name: "", path: "", children: new Map() };
  for (const file of files) {
    const segments = file.path.split("/");
    let directory = root;
    for (let index = 0; index < segments.length - 1; index += 1) {
      const name = segments[index];
      if (!name) continue;
      const existing = directory.children.get(name);
      if (existing?.node_type === "file") throw new Error(`File tree path conflicts with a file: ${file.path}`);
      if (existing) {
        directory = existing;
        continue;
      }
      const childPath = directory.path ? `${directory.path}/${name}` : name;
      const child: MutableFileTreeDirectory = { node_type: "directory", name, path: childPath, children: new Map() };
      directory.children.set(name, child);
      directory = child;
    }
    const name = segments.at(-1);
    if (!name) throw new Error(`File tree contains an invalid path: ${file.path}`);
    if (directory.children.has(name)) throw new Error(`File tree contains a duplicate or conflicting path: ${file.path}`);
    directory.children.set(name, { ...file, node_type: "file", name });
  }
  return finalizeFileTree(root);
}

function finalizeFileTree(directory: MutableFileTreeDirectory): HarnessFileTreeNode[] {
  return [...directory.children.values()]
    .sort((left, right) => {
      const leftDirectory = "children" in left;
      const rightDirectory = "children" in right;
      if (leftDirectory !== rightDirectory) return leftDirectory ? -1 : 1;
      return compareText(left.name, right.name);
    })
    .map((node): HarnessFileTreeNode => "children" in node
      ? { node_type: "directory", name: node.name, path: node.path, children: finalizeFileTree(node) }
      : node);
}

function metadataFor(filePath: string, size: number): HarnessFile {
  const extension = path.posix.extname(filePath).toLowerCase();
  if (extension === ".md") return { path: filePath, kind: "markdown", content_type: "text/markdown; charset=utf-8", size };
  const image = IMAGE_TYPES.get(extension);
  if (image) return { path: filePath, kind: "image", content_type: image, size };
  if (filePath === "LICENSE" || filePath === "NOTICE" || TEXT_EXTENSIONS.has(extension)) {
    return { path: filePath, kind: "text", content_type: "text/plain; charset=utf-8", size };
  }
  return { path: filePath, kind: "binary", content_type: "application/octet-stream", size };
}

function parseFrontmatter(text: string): Record<string, unknown> {
  if (!text.startsWith("---\n")) return {};
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) return {};
  const value = parse(text.slice(4, end)) as unknown;
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function normalizeRelativePath(value: string): string | undefined {
  if (!value || value.includes("\0") || value.includes("\\")) return undefined;
  if (value.split("/").some((segment) => segment === "." || segment === "..")) return undefined;
  const normalized = path.posix.normalize(value);
  if (normalized === "." || normalized.startsWith("../") || path.posix.isAbsolute(normalized)) return undefined;
  return normalized;
}

function isWithin(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative !== "" && !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative);
}

function append(index: Map<string, string[]>, key: string, value: string): void {
  const values = index.get(key) ?? [];
  values.push(value);
  index.set(key, values);
}

function sorted(values: readonly string[]): string[] { return [...new Set(values)].sort(compareText); }
function stringValue(value: unknown): string | undefined { return typeof value === "string" ? value : undefined; }
function titleCase(value: string): string { return value.split("-").map((part) => part ? `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}` : part).join(" "); }
function posix(value: string): string { return value.split(path.sep).join("/"); }
function compareText(left: string, right: string): number { return left.localeCompare(right); }
function errorMessage(error: unknown): string { return error instanceof Error ? error.message : String(error); }
