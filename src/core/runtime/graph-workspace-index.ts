import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";

import { ToolInstallationManifestSchema, type ToolInstallationManifest } from "../../adapters/installations.js";
import { CapabilityGraphProfileSchema, type CapabilityGraphProfile } from "../contracts/capability-graph.js";
import {
  ClaimsSpecV2Schema,
  GraphNodeInstanceSchema,
  GraphRunSchema,
  GraphWorkspaceConfigSchema,
  ManuscriptSpecV2Schema,
  parseProjectChangeV2,
  parseProjectSpecV2,
  parseRunHandoff,
  SourcesSpecV2Schema,
  type ClaimsSpecV2,
  type GraphNodeInstance,
  type GraphRun,
  type GraphWorkspaceConfig,
  type ManuscriptSpecV2,
  type ParsedProjectSpecV2,
  type ParsedProjectChangeV2,
  type ParsedRunHandoff,
  type SourcesSpecV2,
} from "../contracts/graph-workspace.js";
import type { Diagnostic } from "../validation/types.js";
import { sha256 } from "../workspace/write-plan.js";

const REQUIRED_DIRECTORIES = ["profiles", "specs", "runs", "changes"] as const;
const REQUIRED_FILES = [
  "config.yaml",
  "tool-installation-manifest.json",
  "specs/project.md",
  "specs/sources.yaml",
  "specs/claims.yaml",
  "specs/manuscript.yaml",
] as const;
const CHANGE_DOCUMENTS = new Set(["change.md", "design.md", "tasks.md", "delta.yaml"]);

export interface GraphWorkspaceFile {
  relativePath: string;
  absolutePath: string;
  text: string;
  hash: string;
}

export interface GraphRunScanRecord {
  directoryName: string;
  directoryPath: string;
  runPath: string;
  graphPath: string;
  handoffPath: string;
  nodesDirectory: string;
  runText?: string;
  graphText?: string;
  handoffText?: string;
  run?: GraphRun;
  graph?: CapabilityGraphProfile;
  handoff?: ParsedRunHandoff;
  nodeEntries: GraphNodeScanRecord[];
}

export interface GraphNodeScanRecord {
  fileName: string;
  filePath: string;
  text?: string;
  node?: GraphNodeInstance;
}

export interface GraphChangeRecord {
  id: string;
  archived: boolean;
  directoryName: string;
  directoryPath: string;
  changePath: string;
  changeText: string;
  change: ParsedProjectChangeV2["frontmatter"];
  body: string;
  documents: Map<string, GraphWorkspaceFile>;
}

export interface GraphWorkspaceIndex {
  workspace: string;
  projectRoot: string;
  files: Map<string, GraphWorkspaceFile>;
  config: GraphWorkspaceConfig;
  manifest: ToolInstallationManifest;
  project: ParsedProjectSpecV2;
  sources: SourcesSpecV2;
  claims: ClaimsSpecV2;
  manuscript: ManuscriptSpecV2;
  profiles: ReadonlyMap<string, CapabilityGraphProfile>;
  profileFiles: ReadonlyMap<string, GraphWorkspaceFile>;
  runEntries: GraphRunScanRecord[];
  runs: GraphRunScanRecord[];
  changes: GraphChangeRecord[];
  archivedChanges: GraphChangeRecord[];
  diagnostics: Diagnostic[];
}

export async function inspectGraphWorkspaceFormat(workspace: string): Promise<{ current: true } | { current: false; reason: string }> {
  const configPath = path.join(workspace, "config.yaml");
  try {
    const info = await lstat(configPath);
    if (!info.isFile() || info.isSymbolicLink()) return { current: false, reason: "config.yaml must be a regular file" };
    const parsed = GraphWorkspaceConfigSchema.safeParse(parseYaml(await readFile(configPath, "utf8")));
    return parsed.success ? { current: true } : { current: false, reason: "config.yaml is not current schema 2" };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { current: false, reason: "config.yaml is missing" };
    return { current: false, reason: error instanceof Error ? error.message : String(error) };
  }
}

export async function loadGraphWorkspaceIndex(workspace: string): Promise<GraphWorkspaceIndex> {
  const diagnostics: Diagnostic[] = [];
  const files = new Map<string, GraphWorkspaceFile>();

  for (const relativePath of REQUIRED_DIRECTORIES) await checkDirectory(workspace, relativePath, diagnostics);
  for (const relativePath of REQUIRED_FILES) {
    const loaded = await readManagedFile(workspace, relativePath, diagnostics);
    if (loaded) files.set(relativePath, loaded);
  }

  const config = parseRequired(files, "config.yaml", (text) => GraphWorkspaceConfigSchema.parse(parseYaml(text)), diagnostics)
    ?? GraphWorkspaceConfigSchema.parse({ schema_version: "2", agent_tools: { selected: [], delivery: "skills" }, literature_adapters: { selected: [] }, plugins: { selected: [] } });
  const manifest = parseRequired(files, "tool-installation-manifest.json", (text) => ToolInstallationManifestSchema.parse(JSON.parse(text) as unknown), diagnostics)
    ?? ToolInstallationManifestSchema.parse({ schema_version: "1", package_version: "0.1.0", plugin_resolutions: [], literature_adapter_resolutions: [], installations: [] });
  const project = parseRequired(files, "specs/project.md", parseProjectSpecV2, diagnostics)
    ?? parseProjectSpecV2("---\nschema_version: \"2\"\nproject_id: invalid\n---\n");
  const sources = parseRequired(files, "specs/sources.yaml", (text) => SourcesSpecV2Schema.parse(parseYaml(text)), diagnostics)
    ?? SourcesSpecV2Schema.parse({ schema_version: "2", sources: [] });
  const claims = parseRequired(files, "specs/claims.yaml", (text) => ClaimsSpecV2Schema.parse(parseYaml(text)), diagnostics)
    ?? ClaimsSpecV2Schema.parse({ schema_version: "2", claims: [] });
  const manuscript = parseRequired(files, "specs/manuscript.yaml", (text) => ManuscriptSpecV2Schema.parse(parseYaml(text)), diagnostics)
    ?? ManuscriptSpecV2Schema.parse({ schema_version: "2", manuscript_id: "invalid", output_type: null, working_title: null, language: null, audience: null, venue: null, citation_requirements: [], format_requirements: [], delivery: { working_format: null, final_output_format: null }, outline: [] });

  addDuplicateStrings(sources.sources.map((item) => item.source_id), "duplicate_source_id", path.join(workspace, "specs/sources.yaml"), diagnostics);
  addDuplicateStrings(claims.claims.map((item) => item.claim_id), "duplicate_claim_id", path.join(workspace, "specs/claims.yaml"), diagnostics);
  addDuplicateStrings(manuscript.outline.map((item) => item.section_id), "duplicate_section_id", path.join(workspace, "specs/manuscript.yaml"), diagnostics);
  const sourceIds = new Set(sources.sources.map((item) => item.source_id));
  for (const claim of claims.claims) for (const sourceId of claim.supporting_source_ids) {
    if (!sourceIds.has(sourceId)) diagnostics.push(problem("claim_source_missing", `Claim references missing source: ${sourceId}`, path.join(workspace, "specs/claims.yaml")));
  }
  const claimIds = new Set(claims.claims.map((item) => item.claim_id));
  for (const section of manuscript.outline) for (const claimId of section.claim_ids ?? []) {
    if (!claimIds.has(claimId)) diagnostics.push(problem("section_claim_missing", `Section references missing claim: ${claimId}`, path.join(workspace, "specs/manuscript.yaml")));
  }

  const profileFiles = new Map<string, GraphWorkspaceFile>();
  const profiles = await scanGraphProfiles(workspace, files, diagnostics, profileFiles);
  validateProfileSubgraphs(profiles, profileFiles, diagnostics);
  const runEntries = await scanRuns(workspace, files, profiles, profileFiles, diagnostics);
  const runs = runEntries.filter((item) => item.run !== undefined && item.graph !== undefined && item.handoff !== undefined);
  addDuplicateIds(runs.flatMap((item) => item.run ? [item.run] : []), (run) => run.run_id, "duplicate_run_id", "runs", diagnostics);
  validateParentBindings(runs, diagnostics);
  const changes = await scanChanges(workspace, false, files, diagnostics);
  const archivedChanges = await scanChanges(workspace, true, files, diagnostics);
  addDuplicateStrings([...changes, ...archivedChanges].map((item) => item.id), "duplicate_change_id", "changes", diagnostics);

  return {
    workspace,
    projectRoot: path.dirname(workspace),
    files,
    config,
    manifest,
    project,
    sources,
    claims,
    manuscript,
    profiles,
    profileFiles,
    runEntries,
    runs,
    changes,
    archivedChanges,
    diagnostics,
  };
}

async function scanGraphProfiles(
  workspace: string,
  files: Map<string, GraphWorkspaceFile>,
  diagnostics: Diagnostic[],
  profileFiles: Map<string, GraphWorkspaceFile>,
): Promise<Map<string, CapabilityGraphProfile>> {
  const root = path.join(workspace, "profiles");
  const profiles = new Map<string, CapabilityGraphProfile>();
  let validCount = 0;
  for (const entry of await safeReadDirectory(root)) {
    if (!entry.isFile || entry.isSymbolicLink || !entry.name.endsWith(".yaml")) {
      if (entry.isDirectory || entry.isSymbolicLink || entry.name !== ".gitkeep") {
        diagnostics.push(problem("profile_entry_invalid", "Profile entries must be regular YAML files.", path.join(root, entry.name)));
      }
      continue;
    }
    const relativePath = `profiles/${entry.name}`;
    const loaded = await readManagedFile(workspace, relativePath, diagnostics);
    if (!loaded) continue;
    files.set(relativePath, loaded);
    try {
      const parsed = CapabilityGraphProfileSchema.parse(parseYaml(loaded.text));
      if (profiles.has(parsed.profile_id)) diagnostics.push(problem("profile_id_duplicate", `Duplicate graph profile ID: ${parsed.profile_id}`, loaded.absolutePath));
      profiles.set(parsed.profile_id, parsed);
      profileFiles.set(parsed.profile_id, loaded);
      validCount += 1;
    } catch (error) {
      diagnostics.push({ ...problem("graph_profile_invalid", error instanceof Error ? error.message : String(error), loaded.absolutePath), details: error });
    }
  }
  if (validCount === 0) diagnostics.push(problem("graph_profile_missing", "At least one valid graph profile is required.", root));
  return profiles;
}

function validateProfileSubgraphs(
  profiles: ReadonlyMap<string, CapabilityGraphProfile>,
  profileFiles: ReadonlyMap<string, GraphWorkspaceFile>,
  diagnostics: Diagnostic[],
): void {
  const edges = new Map<string, string[]>();
  for (const profile of profiles.values()) {
    const targets: string[] = [];
    for (const node of profile.nodes.filter((item) => item.kind === "subgraph" && item.subgraph_id !== undefined)) {
      const declaration = profile.subgraphs.find((item) => item.subgraph_id === node.subgraph_id);
      if (!declaration) continue;
      targets.push(declaration.profile_id);
      const child = profiles.get(declaration.profile_id);
      const sourcePath = profileFiles.get(profile.profile_id)?.absolutePath ?? profile.profile_id;
      if (!child) {
        diagnostics.push(problem("subgraph_profile_missing", `Subgraph ${declaration.subgraph_id} references missing profile ${declaration.profile_id}.`, sourcePath));
        continue;
      }
      if (child.profile_version !== declaration.profile_version) diagnostics.push(problem("subgraph_profile_version_mismatch", `Subgraph ${declaration.subgraph_id} expects ${declaration.profile_id}@${declaration.profile_version}, found ${child.profile_version}.`, sourcePath));
      const entry = child.entries.find((item) => item.entry_id === declaration.entry_id);
      if (!entry) diagnostics.push(problem("subgraph_entry_missing", `Subgraph ${declaration.subgraph_id} references missing entry ${declaration.entry_id}.`, sourcePath));
      else if (entry.kind === "end-to-end" ? entry.node_id !== declaration.entry_node_id : !entry.entry_points.includes(declaration.entry_node_id)) {
        diagnostics.push(problem("subgraph_entry_node_invalid", `Subgraph ${declaration.subgraph_id} entry ${declaration.entry_id} does not expose node ${declaration.entry_node_id}.`, sourcePath));
      }
    }
    edges.set(profile.profile_id, targets);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (profileId: string, trail: string[]): void => {
    if (visiting.has(profileId)) {
      const cycle = [...trail.slice(trail.indexOf(profileId)), profileId];
      diagnostics.push(problem("subgraph_profile_cycle", `Subgraph profile cycle is not allowed: ${cycle.join(" -> ")}.`, profileFiles.get(profileId)?.absolutePath ?? profileId));
      return;
    }
    if (visited.has(profileId)) return;
    visiting.add(profileId);
    for (const child of edges.get(profileId) ?? []) if (profiles.has(child)) visit(child, [...trail, profileId]);
    visiting.delete(profileId);
    visited.add(profileId);
  };
  for (const profileId of profiles.keys()) visit(profileId, []);
}

async function scanRuns(
  workspace: string,
  files: Map<string, GraphWorkspaceFile>,
  profiles: ReadonlyMap<string, CapabilityGraphProfile>,
  profileFiles: ReadonlyMap<string, GraphWorkspaceFile>,
  diagnostics: Diagnostic[],
): Promise<GraphRunScanRecord[]> {
  const root = path.join(workspace, "runs");
  const records: GraphRunScanRecord[] = [];
  for (const entry of await safeReadDirectory(root)) {
    if (!entry.isDirectory || entry.isSymbolicLink) {
      diagnostics.push(problem("run_entry_invalid", "Run entries must be regular directories.", path.join(root, entry.name)));
      continue;
    }
    const directory = path.join(root, entry.name);
    const runPath = path.join(directory, "run.yaml");
    const graphPath = path.join(directory, "graph.yaml");
    const handoffPath = path.join(directory, "handoff.md");
    const nodesDirectory = path.join(directory, "nodes");
    const runFile = await readOptionalRegularFile(workspace, runPath, diagnostics, "run_file_missing");
    const graphFile = await readOptionalRegularFile(workspace, graphPath, diagnostics, "run_graph_missing");
    const handoffFile = await readOptionalRegularFile(workspace, handoffPath, diagnostics, "run_handoff_missing");
    if (runFile) files.set(runFile.relativePath, runFile);
    if (graphFile) files.set(graphFile.relativePath, graphFile);
    if (handoffFile) files.set(handoffFile.relativePath, handoffFile);
    await checkDirectory(workspace, path.relative(workspace, nodesDirectory), diagnostics);

    let run: GraphRun | undefined;
    let graph: CapabilityGraphProfile | undefined;
    let handoff: ParsedRunHandoff | undefined;
    if (runFile) {
      try {
        run = GraphRunSchema.parse(parseYaml(runFile.text));
        if (run.run_id !== entry.name) diagnostics.push(problem("run_directory_id_mismatch", "Run ID must match its directory name.", runPath));
      } catch (error) {
        diagnostics.push({ ...problem("run_file_invalid", error instanceof Error ? error.message : String(error), runPath), details: error });
      }
    }
    if (graphFile) {
      try { graph = CapabilityGraphProfileSchema.parse(parseYaml(graphFile.text)); }
      catch (error) { diagnostics.push({ ...problem("run_graph_invalid", error instanceof Error ? error.message : String(error), graphPath), details: error }); }
    }
    if (run && graph) {
      if (graphFile && run.profile_sha256 !== sha256(graphFile.text)) diagnostics.push(problem("run_graph_hash_mismatch", "Frozen graph hash does not match run.yaml.", graphPath));
      if (graph.profile_id !== run.profile_id || graph.profile_version !== run.profile_version) diagnostics.push(problem("run_profile_identity_mismatch", "Frozen graph identity does not match run.yaml.", graphPath));
      if (!graph.entries.some((item) => item.entry_id === run.entry_id)) diagnostics.push(problem("run_entry_unknown", `Run entry ${run.entry_id} is not declared by the frozen graph.`, runPath));
      if (!graph.nodes.some((item) => item.node_id === run.entry_node_id)) diagnostics.push(problem("run_entry_node_unknown", `Run entry node ${run.entry_node_id} is not declared by the frozen graph.`, runPath));
      if (profiles.get(graph.profile_id) === undefined) diagnostics.push(warning("run_profile_missing", `Current graph profile ${graph.profile_id} is unavailable; the valid frozen run graph remains authoritative.`, runPath));
      const currentProfile = profiles.get(graph.profile_id);
      const currentProfileFile = profileFiles.get(graph.profile_id);
      if (currentProfile && currentProfileFile && (currentProfile.profile_version !== run.profile_version || currentProfileFile.hash !== run.profile_sha256)) {
        diagnostics.push(warning("run_profile_drift", `Frozen run ${run.run_id} uses ${run.profile_id}@${run.profile_version} with hash ${run.profile_sha256}; the current projection is ${currentProfile.profile_version} with hash ${currentProfileFile.hash}.`, runPath));
      }
    }
    if (handoffFile) {
      try {
        handoff = parseRunHandoff(handoffFile.text);
        if (handoff.frontmatter.run_id !== entry.name) diagnostics.push(problem("run_handoff_id_mismatch", "Handoff run_id must match its run directory.", handoffPath));
      } catch (error) {
        diagnostics.push({ ...problem("run_handoff_invalid", error instanceof Error ? error.message : String(error), handoffPath), details: error });
      }
    }

    const nodeEntries = await scanNodes(workspace, nodesDirectory, entry.name, files, graph, diagnostics);
    records.push({
      directoryName: entry.name,
      directoryPath: directory,
      runPath,
      graphPath,
      handoffPath,
      nodesDirectory,
      ...(runFile === undefined ? {} : { runText: runFile.text }),
      ...(graphFile === undefined ? {} : { graphText: graphFile.text }),
      ...(handoffFile === undefined ? {} : { handoffText: handoffFile.text }),
      ...(run === undefined ? {} : { run }),
      ...(graph === undefined ? {} : { graph }),
      ...(handoff === undefined ? {} : { handoff }),
      nodeEntries,
    });
  }
  return records;
}

function validateParentBindings(records: readonly GraphRunScanRecord[], diagnostics: Diagnostic[]): void {
  const byRunId = new Map(records.flatMap((record) => record.run ? [[record.run.run_id, record] as const] : []));
  const seenBindings = new Map<string, string>();
  for (const record of records) {
    const run = record.run;
    const binding = run?.parent_binding;
    if (!run || run.authorization_origin !== "parent_run" || !binding) continue;
    const key = `${binding.parent_run_id}/${binding.parent_node_id}@${String(binding.round ?? "once")}`;
    const prior = seenBindings.get(key);
    if (prior) diagnostics.push(problem("child_run_binding_duplicate", `Child runs ${prior} and ${run.run_id} claim the same parent binding ${key}.`, record.runPath));
    else seenBindings.set(key, run.run_id);
    const parent = byRunId.get(binding.parent_run_id);
    if (!parent?.run || !parent.graph) {
      diagnostics.push(problem("child_run_parent_missing", `Child run ${run.run_id} references missing parent run ${binding.parent_run_id}.`, record.runPath));
      continue;
    }
    const node = parent.graph.nodes.find((item) => item.node_id === binding.parent_node_id);
    const declaration = parent.graph.subgraphs.find((item) => item.subgraph_id === binding.subgraph_id);
    if (node?.kind !== "subgraph" || node.subgraph_id !== binding.subgraph_id || !declaration) {
      diagnostics.push(problem("child_run_parent_binding_invalid", `Child run ${run.run_id} references an invalid parent subgraph binding.`, record.runPath));
      continue;
    }
    if (run.profile_id !== declaration.profile_id || run.profile_version !== declaration.profile_version || run.entry_id !== declaration.entry_id || run.entry_node_id !== declaration.entry_node_id) {
      diagnostics.push(problem("child_run_profile_binding_mismatch", `Child run ${run.run_id} does not match its parent subgraph declaration.`, record.runPath));
    }
  }
}

async function scanNodes(
  workspace: string,
  nodesDirectory: string,
  runDirectoryName: string,
  files: Map<string, GraphWorkspaceFile>,
  graph: CapabilityGraphProfile | undefined,
  diagnostics: Diagnostic[],
): Promise<GraphNodeScanRecord[]> {
  const records: GraphNodeScanRecord[] = [];
  const seenNodes = new Set<string>();
  for (const entry of await safeReadDirectory(nodesDirectory)) {
    if (!entry.isFile || entry.isSymbolicLink || !entry.name.endsWith(".yaml")) {
      diagnostics.push(problem("node_entry_invalid", "Node entries must be regular YAML files.", path.join(nodesDirectory, entry.name)));
      continue;
    }
    const filePath = path.join(nodesDirectory, entry.name);
    const relativePath = path.relative(workspace, filePath).split(path.sep).join("/");
    const file = await readOptionalRegularFile(workspace, filePath, diagnostics, "node_file_missing");
    if (!file) continue;
    files.set(relativePath, file);
    let node: GraphNodeInstance | undefined;
    try {
      const parsed = GraphNodeInstanceSchema.parse(parseYaml(file.text));
      node = parsed;
      if (parsed.run_id !== runDirectoryName) diagnostics.push(problem("node_run_id_mismatch", "Node run_id must match its run directory.", filePath));
      const nodeKey = `${parsed.node_id}:${parsed.round === undefined ? "once" : String(parsed.round)}`;
      if (seenNodes.has(nodeKey)) diagnostics.push(problem("node_id_duplicate", `Duplicate node instance for node ${parsed.node_id}${parsed.round === undefined ? "" : ` round ${String(parsed.round)}`} in run ${runDirectoryName}.`, filePath));
      seenNodes.add(nodeKey);
      if (graph && !graph.nodes.some((item) => item.node_id === parsed.node_id)) diagnostics.push(problem("node_graph_unknown", `Node ${parsed.node_id} is not declared by the frozen graph.`, filePath));
    } catch (error) {
      diagnostics.push({ ...problem("node_file_invalid", error instanceof Error ? error.message : String(error), filePath), details: error });
    }
    records.push({ fileName: entry.name, filePath, ...(file === undefined ? {} : { text: file.text }), ...(node === undefined ? {} : { node }) });
  }
  return records;
}

async function scanChanges(workspace: string, archived: boolean, files: Map<string, GraphWorkspaceFile>, diagnostics: Diagnostic[]): Promise<GraphChangeRecord[]> {
  const root = path.join(workspace, "changes", ...(archived ? ["archive"] : []));
  const changes: GraphChangeRecord[] = [];
  for (const entry of await safeReadDirectory(root)) {
    if (!archived && entry.name === "archive") continue;
    const directory = path.join(root, entry.name);
    if (!entry.isDirectory || entry.isSymbolicLink) {
      diagnostics.push(problem("change_entry_invalid", "Change entries must be regular directories.", directory));
      continue;
    }
    for (const documentEntry of await safeReadDirectory(directory)) {
      if (!CHANGE_DOCUMENTS.has(documentEntry.name) || !documentEntry.isFile || documentEntry.isSymbolicLink) {
        diagnostics.push(problem("change_document_unexpected", "Change packages may contain only regular change.md, design.md, tasks.md, and delta.yaml documents.", path.join(directory, documentEntry.name)));
      }
    }
    const changePath = path.join(directory, "change.md");
    const changeFile = await readOptionalRegularFile(workspace, changePath, diagnostics, "change_document_missing");
    if (!changeFile) continue;
    files.set(changeFile.relativePath, changeFile);
    const documents = new Map<string, GraphWorkspaceFile>([["change.md", changeFile]]);
    for (const name of ["design.md", "tasks.md", "delta.yaml"] as const) {
      const optional = await readOptionalRegularFile(workspace, path.join(directory, name), diagnostics);
      if (optional) {
        documents.set(name, optional);
        files.set(optional.relativePath, optional);
      }
    }
    try {
      const parsed = parseProjectChangeV2(changeFile.text);
      if (parsed.frontmatter.id !== entry.name) diagnostics.push(problem("change_directory_id_mismatch", "Change ID must match its directory name.", changePath));
      changes.push({ id: parsed.frontmatter.id, archived, directoryName: entry.name, directoryPath: directory, changePath, changeText: changeFile.text, change: parsed.frontmatter, body: parsed.body, documents });
    } catch (error) {
      diagnostics.push({ ...problem("change_invalid", error instanceof Error ? error.message : String(error), changePath), details: error });
    }
  }
  return changes;
}

async function checkDirectory(workspace: string, relativePath: string, diagnostics: Diagnostic[]): Promise<void> {
  const absolutePath = path.join(workspace, relativePath);
  try {
    const info = await lstat(absolutePath);
    if (!info.isDirectory() || info.isSymbolicLink()) diagnostics.push(problem("managed_directory_invalid", "Managed path must be a regular directory.", absolutePath));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") diagnostics.push(problem("required_directory_missing", "Required directory is missing.", absolutePath));
    else throw error;
  }
}

async function readManagedFile(workspace: string, relativePath: string, diagnostics: Diagnostic[]): Promise<GraphWorkspaceFile | undefined> {
  const absolutePath = path.join(workspace, relativePath);
  try {
    const info = await lstat(absolutePath);
    if (!info.isFile() || info.isSymbolicLink()) {
      diagnostics.push(problem("managed_file_invalid", "Managed path must be a regular file.", absolutePath));
      return undefined;
    }
    const text = await readFile(absolutePath, "utf8");
    return { relativePath, absolutePath, text, hash: sha256(text) };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      diagnostics.push(problem("required_file_missing", "Required file is missing.", absolutePath));
      return undefined;
    }
    throw error;
  }
}

async function readOptionalRegularFile(workspace: string, absolutePath: string, diagnostics: Diagnostic[], missingCode?: string): Promise<GraphWorkspaceFile | undefined> {
  try {
    const info = await lstat(absolutePath);
    if (!info.isFile() || info.isSymbolicLink()) {
      diagnostics.push(problem("managed_file_invalid", "Managed path must be a regular file.", absolutePath));
      return undefined;
    }
    const text = await readFile(absolutePath, "utf8");
    return { relativePath: path.relative(workspace, absolutePath).split(path.sep).join("/"), absolutePath, text, hash: sha256(text) };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      if (missingCode) diagnostics.push(problem(missingCode, "Managed file is missing.", absolutePath));
      return undefined;
    }
    throw error;
  }
}

function parseRequired<T>(files: Map<string, GraphWorkspaceFile>, relativePath: string, parse: (text: string) => T, diagnostics: Diagnostic[]): T | undefined {
  const file = files.get(relativePath);
  if (!file) return undefined;
  try { return parse(file.text); }
  catch (error) {
    diagnostics.push({ ...problem("invalid_current_contract", error instanceof Error ? error.message : String(error), file.absolutePath), details: error });
    return undefined;
  }
}

async function safeReadDirectory(directory: string): Promise<Array<{ name: string; isFile: boolean; isDirectory: boolean; isSymbolicLink: boolean }>> {
  try {
    return (await readdir(directory, { withFileTypes: true }))
      .map((entry) => ({ name: entry.name, isFile: entry.isFile(), isDirectory: entry.isDirectory(), isSymbolicLink: entry.isSymbolicLink() }))
      .sort((left, right) => left.name.localeCompare(right.name));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

function addDuplicateIds<T>(values: readonly T[], key: (value: T) => string, code: string, owner: string, diagnostics: Diagnostic[]): void {
  const seen = new Set<string>();
  for (const value of values) {
    const id = key(value);
    if (seen.has(id)) diagnostics.push(problem(code, `Duplicate ${code.replaceAll("_", " ")}: ${id}`, owner));
    seen.add(id);
  }
}

function addDuplicateStrings(values: readonly string[], code: string, owner: string, diagnostics: Diagnostic[]): void {
  addDuplicateIds(values, (value) => value, code, owner, diagnostics);
}

function problem(code: string, message: string, filePath: string): Diagnostic {
  return { severity: "error", code, message, path: filePath, blocking: true };
}

function warning(code: string, message: string, filePath: string): Diagnostic {
  return { severity: "warning", code, message, path: filePath, blocking: false };
}
