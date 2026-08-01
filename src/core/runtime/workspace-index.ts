import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";

import { ToolInstallationManifestSchema, type ToolInstallationManifest } from "../../adapters/installations.js";
import { PipelineProfileSchema, type PipelineProfile } from "../contracts/pipeline-profile.js";
import { parseProjectChange } from "../contracts/project-change.js";
import {
  ClaimsSpecSchema,
  ManuscriptSpecSchema,
  parseProjectSpec,
  SourcesSpecSchema,
  type ClaimsSpec,
  type ManuscriptSpec,
  type ParsedProjectSpec,
  type SourcesSpec,
} from "../contracts/stable-specs.js";
import { SubflowControlSchema, type SubflowControl } from "../contracts/subflow-control.js";
import { parseSubflowHandoff, type SubflowHandoff } from "../contracts/subflow-handoff.js";
import { CurrentWorkspaceConfigSchema, type CurrentWorkspaceConfig } from "../contracts/workspace-format.js";
import type { Diagnostic } from "../validation/types.js";
import { sha256 } from "../workspace/write-plan.js";
import { resolveBoundaryPath } from "./boundary-path.js";

const REQUIRED_DIRECTORIES = ["profiles", "specs", "changes", "subflows"] as const;
const REQUIRED_FILES = [
  "config.yaml",
  "tool-installation-manifest.json",
  "profiles/academic-pipeline.yaml",
  "specs/project.md",
  "specs/sources.yaml",
  "specs/claims.yaml",
  "specs/manuscript.yaml",
] as const;

export interface CurrentWorkspaceFile {
  relativePath: string;
  absolutePath: string;
  text: string;
  hash: string;
}

export interface CurrentWorkspaceIndex {
  workspace: string;
  projectRoot: string;
  files: Map<string, CurrentWorkspaceFile>;
  config: CurrentWorkspaceConfig;
  manifest: ToolInstallationManifest;
  project: ParsedProjectSpec;
  sources: SourcesSpec;
  claims: ClaimsSpec;
  manuscript: ManuscriptSpec;
  profile: PipelineProfile;
  subflows: SubflowRecord[];
  changes: Array<{ id: string; status: string; targets: string[]; path: string }>;
  diagnostics: Diagnostic[];
}

export interface SubflowRecord {
  directoryName: string;
  directoryPath: string;
  controlPath: string;
  handoffPath: string;
  controlText: string;
  handoffText: string;
  control: SubflowControl;
  handoff: SubflowHandoff;
}

export interface WorkspaceStaticContext {
  workspace: string;
  config: unknown;
  manifest: unknown;
  diagnostics: Diagnostic[];
}

export async function inspectCurrentWorkspaceFormat(workspace: string): Promise<{ current: true } | { current: false; reason: string }> {
  const configPath = path.join(workspace, "config.yaml");
  try {
    const info = await lstat(configPath);
    if (!info.isFile() || info.isSymbolicLink()) return { current: false, reason: "config.yaml must be a regular file" };
    const parsed = CurrentWorkspaceConfigSchema.safeParse(parseYaml(await readFile(configPath, "utf8")));
    return parsed.success ? { current: true } : { current: false, reason: "config.yaml is not current schema 1" };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { current: false, reason: "config.yaml is missing" };
    return { current: false, reason: error instanceof Error ? error.message : String(error) };
  }
}

export async function loadCurrentWorkspaceIndex(workspace: string): Promise<CurrentWorkspaceIndex> {
  const diagnostics: Diagnostic[] = [];
  const files = new Map<string, CurrentWorkspaceFile>();

  for (const relativePath of REQUIRED_DIRECTORIES) await checkDirectory(workspace, relativePath, diagnostics);
  for (const relativePath of REQUIRED_FILES) {
    const loaded = await readManagedFile(workspace, relativePath, diagnostics);
    if (loaded) files.set(relativePath, loaded);
  }

  const config = parseRequired(files, "config.yaml", (text) => CurrentWorkspaceConfigSchema.parse(parseYaml(text)), diagnostics);
  const manifest = parseRequired(files, "tool-installation-manifest.json", (text) => ToolInstallationManifestSchema.parse(JSON.parse(text) as unknown), diagnostics);
  const project = parseRequired(files, "specs/project.md", parseProjectSpec, diagnostics);
  const sources = parseRequired(files, "specs/sources.yaml", (text) => SourcesSpecSchema.parse(parseYaml(text)), diagnostics);
  const claims = parseRequired(files, "specs/claims.yaml", (text) => ClaimsSpecSchema.parse(parseYaml(text)), diagnostics);
  const manuscript = parseRequired(files, "specs/manuscript.yaml", (text) => ManuscriptSpecSchema.parse(parseYaml(text)), diagnostics);
  const profile = parseRequired(files, "profiles/academic-pipeline.yaml", (text) => PipelineProfileSchema.parse(parseYaml(text)), diagnostics);

  addDuplicateIds(sources?.sources ?? [], "source_id", "duplicate_source_id", "specs/sources.yaml", workspace, diagnostics);
  addDuplicateIds(claims?.claims ?? [], "claim_id", "duplicate_claim_id", "specs/claims.yaml", workspace, diagnostics);
  addDuplicateIds(manuscript?.outline ?? [], "section_id", "duplicate_section_id", "specs/manuscript.yaml", workspace, diagnostics);
  const sourceIds = new Set((sources?.sources ?? []).map((item) => item.source_id));
  const claimIds = new Set((claims?.claims ?? []).map((item) => item.claim_id));
  for (const claim of claims?.claims ?? []) for (const sourceId of claim.supporting_source_ids) {
    if (!sourceIds.has(sourceId)) diagnostics.push(problem("claim_source_missing", `Claim references missing source: ${sourceId}`, path.join(workspace, "specs/claims.yaml")));
  }
  for (const section of manuscript?.outline ?? []) for (const claimId of section.claim_ids ?? []) {
    if (!claimIds.has(claimId)) diagnostics.push(problem("section_claim_missing", `Section references missing claim: ${claimId}`, path.join(workspace, "specs/manuscript.yaml")));
  }

  const subflows = await scanSubflows(workspace, diagnostics);
  addDuplicateIds(subflows.map((item) => item.control), "instance_id", "duplicate_subflow_instance_id", "subflows", workspace, diagnostics);
  await validateSubflowReferences(workspace, subflows, profile, diagnostics);
  const changes = await scanChanges(workspace, diagnostics);

  return {
    workspace,
    projectRoot: path.dirname(workspace),
    files,
    config: config ?? CurrentWorkspaceConfigSchema.parse({ schema_version: "1", agent_tools: { selected: [], delivery: "both" }, plugins: { selected: [] } }),
    manifest: manifest ?? ToolInstallationManifestSchema.parse({ schema_version: "1", package_version: "0.1.0", plugin_resolutions: [], literature_adapter_resolutions: [], installations: [] }),
    project: project ?? parseProjectSpec("---\nschema_version: \"1\"\nproject_id: invalid\n---\n"),
    sources: sources ?? SourcesSpecSchema.parse({ schema_version: "1", sources: [] }),
    claims: claims ?? ClaimsSpecSchema.parse({ schema_version: "1", claims: [] }),
    manuscript: manuscript ?? ManuscriptSpecSchema.parse({ schema_version: "1", manuscript_id: "invalid", output_type: null, working_title: null, language: null, audience: null, venue: null, citation_requirements: [], format_requirements: [], outline: [] }),
    profile: profile ?? emptyProfile(),
    subflows,
    changes,
    diagnostics,
  };
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

async function readManagedFile(workspace: string, relativePath: string, diagnostics: Diagnostic[]): Promise<CurrentWorkspaceFile | undefined> {
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

function parseRequired<T>(files: Map<string, CurrentWorkspaceFile>, relativePath: string, parse: (text: string) => T, diagnostics: Diagnostic[]): T | undefined {
  const file = files.get(relativePath);
  if (!file) return undefined;
  try { return parse(file.text); }
  catch (error) {
    diagnostics.push({ ...problem("invalid_current_contract", error instanceof Error ? error.message : String(error), file.absolutePath), details: error });
    return undefined;
  }
}

async function scanSubflows(workspace: string, diagnostics: Diagnostic[]): Promise<SubflowRecord[]> {
  const root = path.join(workspace, "subflows");
  const records: SubflowRecord[] = [];
  for (const entry of await safeReadDirectory(root)) {
    const directory = path.join(root, entry.name);
    if (!entry.isDirectory() || entry.isSymbolicLink()) {
      diagnostics.push(problem("subflow_entry_invalid", "Subflow entries must be regular directories.", directory));
      continue;
    }
    const controlPath = path.join(directory, "control.yaml");
    const handoffPath = path.join(directory, "handoff.md");
    const controlText = await readOptionalRegularFile(controlPath, diagnostics, "subflow_control_missing");
    const handoffText = await readOptionalRegularFile(handoffPath, diagnostics, "subflow_handoff_missing");
    let control: SubflowControl | undefined;
    let handoff: SubflowHandoff | undefined;
    if (controlText) try { control = SubflowControlSchema.parse(parseYaml(controlText)); }
    catch (error) { diagnostics.push({ ...problem("subflow_control_invalid", error instanceof Error ? error.message : String(error), controlPath), details: error }); }
    if (handoffText) try { handoff = parseSubflowHandoff(handoffText).frontmatter; }
    catch (error) { diagnostics.push({ ...problem("subflow_handoff_invalid", error instanceof Error ? error.message : String(error), handoffPath), details: error }); }
    if (controlText && handoffText && control && handoff) {
      records.push({ directoryName: entry.name, directoryPath: directory, controlPath, handoffPath, controlText, handoffText, control, handoff });
    }
  }
  return records;
}

async function scanChanges(workspace: string, diagnostics: Diagnostic[]): Promise<Array<{ id: string; status: string; targets: string[]; path: string }>> {
  const root = path.join(workspace, "changes");
  const changes: Array<{ id: string; status: string; targets: string[]; path: string }> = [];
  for (const entry of await safeReadDirectory(root)) {
    if (entry.name === "archive") continue;
    const directory = path.join(root, entry.name);
    if (!entry.isDirectory() || entry.isSymbolicLink()) {
      diagnostics.push(problem("change_entry_invalid", "Change entries must be regular directories.", directory));
      continue;
    }
    const changePath = path.join(directory, "change.md");
    const text = await readOptionalRegularFile(changePath, diagnostics, "change_document_missing");
    if (!text) continue;
    try {
      const change = parseProjectChange(text).frontmatter;
      if (change.id !== entry.name) diagnostics.push(problem("change_directory_id_mismatch", "Change ID must match its directory name.", changePath));
      changes.push({ id: change.id, status: change.status, targets: change.targets, path: changePath });
    } catch (error) { diagnostics.push({ ...problem("change_document_invalid", error instanceof Error ? error.message : String(error), changePath), details: error }); }
  }
  addDuplicateIds(changes, "id", "duplicate_change_id", "changes", workspace, diagnostics);
  return changes;
}

async function readOptionalRegularFile(filePath: string, diagnostics: Diagnostic[], missingCode: string): Promise<string | undefined> {
  try {
    const info = await lstat(filePath);
    if (!info.isFile() || info.isSymbolicLink()) {
      diagnostics.push(problem("managed_file_invalid", "Managed path must be a regular file.", filePath));
      return undefined;
    }
    return await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      diagnostics.push(problem(missingCode, "Required owning file is missing.", filePath));
      return undefined;
    }
    throw error;
  }
}

async function validateSubflowReferences(
  workspace: string,
  records: readonly SubflowRecord[],
  profile: PipelineProfile | undefined,
  diagnostics: Diagnostic[],
): Promise<void> {
  const byId = new Map<string, SubflowRecord[]>();
  for (const record of records) {
    const entries = byId.get(record.control.instance_id) ?? [];
    entries.push(record);
    byId.set(record.control.instance_id, entries);
  }
  const childById = new Map(profile?.children.map((item) => [item.node_id, item]) ?? []);
  const entriesByRoute = new Map(profile?.entries.map((item) => [item.route_ref, item]) ?? []);

  for (const record of records) {
    const { control, handoff } = record;
    if (handoff.subflow_instance_id !== control.instance_id) {
      diagnostics.push(problem("subflow_handoff_id_mismatch", "Handoff instance ID must match its owning control.", record.handoffPath));
    }
    if (control.profile !== null && profile) {
      if (control.profile.id !== profile.profile_id || control.profile.version !== profile.profile_version) {
        diagnostics.push(problem("subflow_profile_mismatch", "Subflow profile identity does not match the project profile.", record.controlPath));
      }
      if (control.parent === null && !entriesByRoute.has(control.route_ref)) {
        diagnostics.push(problem("pipeline_entry_route_invalid", "Pipeline parent route is not a project profile entry.", record.controlPath));
      }
    }
    if (control.parent !== null) {
      const parents = byId.get(control.parent.instance_id) ?? [];
      if (parents.length !== 1) {
        diagnostics.push(problem("subflow_parent_invalid", "Child parent reference must resolve to exactly one control.", record.controlPath));
      } else if (parents[0]?.control.profile === null) {
        diagnostics.push(problem("subflow_parent_not_pipeline", "A child parent must be governed by the project profile.", record.controlPath));
      }
      if (control.parent.instance_id === control.instance_id) {
        diagnostics.push(problem("subflow_parent_self", "A subflow cannot parent itself.", record.controlPath));
      }
      const node = childById.get(control.parent.node_id);
      if (!node || node.route_ref !== control.route_ref) {
        diagnostics.push(problem("subflow_parent_node_invalid", "Child parent node must exist and match the child route.", record.controlPath));
      } else if ((control.round !== undefined) !== (node.multiplicity === "repeatable")) {
        diagnostics.push(problem("subflow_round_invalid", "Round is required exactly for repeatable profile children.", record.controlPath));
      }
    }
    for (const input of handoff.inputs) {
      if (input.source_instance_id && (byId.get(input.source_instance_id)?.length ?? 0) !== 1) {
        diagnostics.push(problem("handoff_source_instance_invalid", "Handoff source instance must resolve to exactly one control.", record.handoffPath));
      }
    }
    for (const item of [...handoff.inputs, ...handoff.outputs]) {
      try { await resolveBoundaryPath(path.dirname(workspace), item.path); }
      catch (error) {
        diagnostics.push(problem("handoff_path_invalid", error instanceof Error ? error.message : String(error), record.handoffPath));
      }
    }
  }
}

function addDuplicateIds<T extends Record<string, unknown>>(values: readonly T[], key: keyof T, code: string, relativePath: string, workspace: string, diagnostics: Diagnostic[]): void {
  const seen = new Set<unknown>();
  for (const value of values) {
    const id = value[key];
    if (seen.has(id)) diagnostics.push(problem(code, `Duplicate ${String(key)}: ${String(id)}`, path.join(workspace, relativePath)));
    seen.add(id);
  }
}

async function safeReadDirectory(directory: string) {
  try { return await readdir(directory, { withFileTypes: true }); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

function problem(code: string, message: string, filePath: string): Diagnostic {
  return { severity: "error", code, message, path: filePath, blocking: true };
}

function emptyProfile(): PipelineProfile {
  return PipelineProfileSchema.parse({
    schema_version: "1", profile_id: "academic-pipeline", profile_version: "invalid",
    entries: [{ entry_id: "invalid", route_ref: "academic-pipeline:end-to-end", checkpoint: "revision", kind: "end-to-end" }],
    children: [
      { node_id: "revision", route_ref: "academic-paper:revision", prerequisites: [], required_gate_ids: [], branch_ids: [], multiplicity: "repeatable", round_role: "revision" },
      { node_id: "review", route_ref: "academic-paper-reviewer:re-review", prerequisites: ["revision"], required_gate_ids: [], branch_ids: ["review-outcome"], multiplicity: "repeatable", round_role: "review" },
    ],
    parallel_groups: [], gates: [], branches: [{ decision_id: "review-outcome", owner_node_id: "review", options: [
      { option_id: "continue", unlocks: ["revision"] },
      { option_id: "exit", unlocks: ["review"] },
    ] }], transitions: [],
    override_policy: { failed_gate_requires_decision: true },
    revision_round_template: { revision_node_id: "revision", review_node_id: "review", continue_option_id: "continue", exit_option_id: "exit" },
  });
}
