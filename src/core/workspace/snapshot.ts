import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import { fileExists, readOptionalText } from "../../utils/fs.js";
import { ArtifactRegistrySchema } from "../contracts/artifact.js";
import { ImportedGateEvidenceSchema } from "../contracts/material-passport.js";
import { DecisionLedgerEventSchema } from "../contracts/decision.js";
import { GateEventV1Schema } from "../contracts/gate-transition.js";
import { RunStateSchema, type RunState } from "../contracts/run-state.js";
import { validateWorkflowDefinition, WorkflowDefinitionSchema, WORKFLOW_PROFILE_IDS, type WorkflowDefinition } from "../contracts/workflow.js";
import { parseJson, parseJsonLines, parseYaml } from "../validation/parse.js";
import type { Diagnostic } from "../validation/types.js";
import { JSON_FILES, JSONL_FILES, MARKDOWN_FILES, REQUIRED_FILES, YAML_FILES } from "./layout.js";
import { sha256 } from "./write-plan.js";
import { ToolInstallationManifestSchema } from "../../adapters/installations.js";

const SafeId = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/).refine((value) => !value.includes(".."));
const ActorSchema = z.union([z.string().min(1), z.looseObject({ kind: z.string().min(1), name: z.string().min(1) })]);
const SourceSchema = z.looseObject({ source_id: SafeId });
const ClaimSchema = z.looseObject({ claim_id: SafeId });
const GateSchema = z.union([ImportedGateEvidenceSchema, GateEventV1Schema]);
const ConfigSchema = z.looseObject({
  schema_version: z.string(),
  profile: z.enum(WORKFLOW_PROFILE_IDS),
  agent_tools: z.looseObject({ selected: z.array(z.string()), delivery: z.enum(["skills", "commands", "both"]) }),
  plugins: z.looseObject({ selected: z.array(z.string()) }).optional(),
});
const SourcesSchema = z.looseObject({ schema_version: z.string(), sources: z.array(SourceSchema) });
const ClaimsSchema = z.looseObject({ schema_version: z.string(), claims: z.array(ClaimSchema) });
const ProjectSchema = z.looseObject({ schema_version: z.string(), project_id: SafeId, title: z.string(), target_output: z.string(), primary_language: z.string() });
const ManuscriptSchema = z.looseObject({ schema_version: z.string(), manuscript_id: SafeId, title: z.string(), status: z.string(), sections: z.array(z.unknown()) });
const ContractPatchSchema = z.looseObject({
  schema_version: z.string(), change_id: SafeId, title: z.string().min(1), status: z.enum(["proposed", "postponed", "accepted", "rejected", "applied", "superseded"]),
  created_at: z.string().min(1), created_by: ActorSchema, rationale: z.string().min(1), risk_level: z.enum(["low", "medium", "high"]), requires_human_decision: z.boolean(),
  impact: z.array(z.string().min(1)).min(1),
  validation: z.looseObject({ validated_at: z.string().min(1), target_hashes: z.record(z.string(), z.string()), artifact_ids: z.array(SafeId), decision_ids: z.array(SafeId) }),
  patches: z.array(z.looseObject({ patch_id: SafeId, target_contract: z.enum(["specs/project.md", "specs/sources.yaml", "specs/claims.yaml", "specs/manuscript.yaml", "specs/workflow.yaml"]), operation: z.enum(["add", "replace", "remove", "append", "merge"]), target_path: z.string().min(1), reason: z.string().min(1), source_artifact_ids: z.array(SafeId), source_decision_ids: z.array(SafeId) })).min(1),
});
const DraftPatchSchema = z.looseObject({
  patch_format_version: z.string(), patch_id: SafeId, revision_round: z.number().int().nonnegative(), status: z.enum(["proposed", "postponed", "accepted", "rejected", "applied", "superseded"]),
  base_artifact_id: SafeId, base_draft_hash: z.string().min(12), emitted_by: ActorSchema,
  ops: z.array(z.looseObject({ op: z.enum(["replace_block", "insert_after", "delete_block"]), block_id: z.string().min(1), old_hash: z.string().optional(), new_text: z.string().optional() })),
});

export interface SnapshotFile {
  relativePath: string;
  absolutePath: string;
  text: string;
  bytes: Uint8Array;
  hash: string;
  mode: number;
  executable: boolean;
  fileType: "file";
  value?: unknown;
}

export interface IndexedItem {
  type: "change" | "patch" | "artifact" | "gate" | "decision" | "source" | "claim" | "tool" | "contract";
  id: string;
  selector: string;
  value: unknown;
  path?: string;
  history?: unknown[];
}

export interface WorkspaceSnapshot {
  workspace: string;
  files: Map<string, SnapshotFile>;
  documents: Record<string, unknown>;
  config: Record<string, unknown>;
  manifest: Record<string, unknown>;
  workflow?: WorkflowDefinition;
  runState?: RunState;
  state: Record<string, unknown>;
  artifacts: Record<string, unknown>[];
  decisions: Record<string, unknown>[];
  gates: Record<string, unknown>[];
  changes: IndexedItem[];
  patches: IndexedItem[];
  items: IndexedItem[];
  diagnostics: Diagnostic[];
}

export async function loadWorkspaceSnapshot(workspace: string): Promise<WorkspaceSnapshot> {
  const files = new Map<string, SnapshotFile>();
  const documents: Record<string, unknown> = {};
  const diagnostics: Diagnostic[] = [];

  for (const relativePath of REQUIRED_FILES) {
    const absolutePath = path.join(workspace, relativePath);
    let info;
    try {
      info = await lstat(absolutePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      diagnostics.push({ severity: "error", code: "required_file_missing", message: "Required file is missing.", path: absolutePath, blocking: true });
      continue;
    }
    if (!info.isFile() || info.isSymbolicLink()) {
      diagnostics.push({ severity: "error", code: "required_file_not_regular", message: "Required file must be a regular file.", path: absolutePath, blocking: true });
      continue;
    }
    const text = await readOptionalText(absolutePath);
    if (text === undefined) {
      diagnostics.push({ severity: "error", code: "required_file_missing", message: "Required file disappeared while loading the workspace.", path: absolutePath, blocking: true });
      continue;
    }
    const bytes = Buffer.from(text, "utf8");
    const mode = info.mode & 0o777;
    const file: SnapshotFile = { relativePath, absolutePath, text, bytes, hash: sha256(bytes), mode, executable: Boolean(mode & 0o111), fileType: "file" };
    files.set(relativePath, file);

    if (YAML_FILES.includes(relativePath)) {
      const parsed = parseYaml(text, absolutePath);
      if (parsed.ok) file.value = documents[relativePath] = parsed.value;
      else diagnostics.push(parsed.diagnostic);
    } else if (JSON_FILES.includes(relativePath)) {
      const parsed = parseJson(text, absolutePath);
      if (parsed.ok) file.value = documents[relativePath] = parsed.value;
      else diagnostics.push(parsed.diagnostic);
    } else if (JSONL_FILES.includes(relativePath)) {
      const parsed = parseJsonLines(text, absolutePath);
      if (parsed.ok) file.value = documents[relativePath] = parsed.value;
      else diagnostics.push(parsed.diagnostic);
    } else if (MARKDOWN_FILES.includes(relativePath)) {
      file.value = documents[relativePath] = text;
      if (!text.startsWith("---\n") || !text.includes("\n---\n")) {
        diagnostics.push({ severity: "warning", code: "project_frontmatter_missing", message: "Project contract has no YAML frontmatter.", path: absolutePath, blocking: false });
      } else {
        const end = text.indexOf("\n---\n", 4);
        const parsed = parseYaml(text.slice(4, end), absolutePath);
        if (!parsed.ok) diagnostics.push(parsed.diagnostic);
        else validateValue(parsed.value, ProjectSchema, absolutePath, "invalid_project_contract", diagnostics);
        if (!text.includes("## Research Question") || !text.includes("## Scope")) diagnostics.push({ severity: "error", code: "project_sections_missing", message: "Project contract requires Research Question and Scope sections.", path: absolutePath, blocking: true });
      }
    }
  }

  const config = asRecord(documents["config.yaml"]);
  const manifest = asRecord(documents["tool-installation-manifest.json"]);
  const workflow = parseWorkflowDefinition(documents["specs/workflow.yaml"], files.get("specs/workflow.yaml"), diagnostics);
  const state = asRecord(documents["runs/current/state.yaml"]);
  const runState = parseRunState(documents["runs/current/state.yaml"], files.get("runs/current/state.yaml"), diagnostics);
  validateInstanceStateReferences(workflow, runState, files.get("runs/current/state.yaml"), diagnostics);
  const artifacts = records(asRecord(documents["runs/current/artifact-registry.json"]).artifacts);
  const decisions = records(documents["runs/current/decision-ledger.jsonl"]);
  const gates = records(documents["runs/current/gate-ledger.jsonl"]);

  validateDocument("config.yaml", config, ConfigSchema, files, diagnostics);
  validateDocument("tool-installation-manifest.json", manifest, ToolInstallationManifestSchema, files, diagnostics);
  validateDocument("specs/sources.yaml", documents["specs/sources.yaml"], SourcesSchema, files, diagnostics);
  validateDocument("specs/claims.yaml", documents["specs/claims.yaml"], ClaimsSchema, files, diagnostics);
  validateDocument("specs/manuscript.yaml", documents["specs/manuscript.yaml"], ManuscriptSchema, files, diagnostics);
  validateDocument("runs/current/artifact-registry.json", documents["runs/current/artifact-registry.json"], ArtifactRegistrySchema, files, diagnostics);
  validateRecords(decisions, DecisionLedgerEventSchema, path.join(workspace, "runs/current/decision-ledger.jsonl"), "invalid_decision_event", diagnostics);
  validateRecords(gates, GateSchema, path.join(workspace, "runs/current/gate-ledger.jsonl"), "invalid_gate_event", diagnostics);

  const changes = await loadActiveChanges(workspace, diagnostics);
  const patches = await loadDraftPatches(workspace, diagnostics);
  const items = buildItems(documents, artifacts, decisions, gates, changes, patches, config, manifest);

  return { workspace, files, documents, config, manifest, workflow, runState, state, artifacts, decisions, gates, changes, patches, items, diagnostics };
}

function validateInstanceStateReferences(workflow: WorkflowDefinition | undefined, state: RunState | undefined, file: SnapshotFile | undefined, diagnostics: Diagnostic[]): void {
  if (!file || !state || !workflow) return;
  const ids = new Set<string>();
  const templateIds = new Set(workflow.subflow_templates.map((item) => item.template_id));
  for (const instance of state.subflows) {
    if (ids.has(instance.instance_id)) diagnostics.push({ severity: "error", code: "duplicate_subflow_instance_id", message: `Duplicate subflow instance: ${instance.instance_id}`, path: file.absolutePath, blocking: true });
    ids.add(instance.instance_id);
    if (!templateIds.has(instance.template_id)) diagnostics.push({ severity: "error", code: "subflow_template_missing", message: `Instance references missing template: ${instance.template_id}`, path: file.absolutePath, blocking: true });
  }
  for (const instance of state.subflows) {
    if (!instance.parent_subflow_id) {
      if (instance.parent_node_id) diagnostics.push({ severity: "error", code: "subflow_parent_node_invalid", message: `Root instance has parent node: ${instance.instance_id}`, path: file.absolutePath, blocking: true });
      continue;
    }
    if (!ids.has(instance.parent_subflow_id) || instance.parent_subflow_id === instance.instance_id) {
      diagnostics.push({ severity: "error", code: "subflow_parent_invalid", message: `Instance has invalid parent: ${instance.instance_id}`, path: file.absolutePath, blocking: true });
      continue;
    }
    const parent = state.subflows.find((item) => item.instance_id === instance.parent_subflow_id);
    const parentTemplate = parent ? workflow.subflow_templates.find((item) => item.template_id === parent.template_id) : undefined;
    if ((parentTemplate?.subflow_nodes ?? []).length > 0) {
      const parentNode = parentTemplate?.subflow_nodes?.find((item) => item.id === instance.parent_node_id);
      if (!instance.parent_node_id || !parentNode || parentNode.template_id !== instance.template_id) diagnostics.push({ severity: "error", code: "subflow_parent_node_invalid", message: `Instance has invalid parent node binding: ${instance.instance_id}`, path: file.absolutePath, blocking: true });
      if (parentNode?.multiplicity === "next_round" && instance.round_number === null) diagnostics.push({ severity: "error", code: "subflow_round_number_missing", message: `Repeatable child has no round number: ${instance.instance_id}`, path: file.absolutePath, blocking: true });
    }
  }
}

function parseRunState(value: unknown, file: SnapshotFile | undefined, diagnostics: Diagnostic[]): RunState | undefined {
  if (!file) return undefined;
  const result = RunStateSchema.safeParse(value);
  if (!result.success) {
    diagnostics.push({ severity: "error", code: "invalid_contract_shape", message: "Run state does not match the current Schema 0.2 contract.", path: file.absolutePath, blocking: true, details: result.error.issues });
    return undefined;
  }
  return result.data;
}

function parseWorkflowDefinition(value: unknown, file: SnapshotFile | undefined, diagnostics: Diagnostic[]): WorkflowDefinition | undefined {
  if (!file) return undefined;
  const result = WorkflowDefinitionSchema.safeParse(value);
  if (!result.success) {
    diagnostics.push({ severity: "error", code: "invalid_contract_shape", message: "Contract does not match the required shape.", path: file.absolutePath, blocking: true, details: result.error.issues });
    return undefined;
  }
  for (const issue of validateWorkflowDefinition(result.data)) {
    diagnostics.push({ severity: "error", code: issue.code, message: issue.message, path: file.absolutePath, blocking: true });
  }
  return result.data;
}

export function resolveItem(snapshot: WorkspaceSnapshot, input: string): { item?: IndexedItem; candidates: IndexedItem[] } {
  const hasPrefix = input.includes(":");
  const candidates = hasPrefix
    ? snapshot.items.filter((item) => item.selector === input)
    : snapshot.items.filter((item) => item.id === input);
  return { item: candidates.length === 1 ? candidates[0] : undefined, candidates };
}

export function latestById(events: Record<string, unknown>[], idKey: string): Record<string, unknown>[] {
  const latest = new Map<string, Record<string, unknown>>();
  for (const event of events) {
    const id = stringValue(event[idKey]);
    if (id) latest.set(id, event);
  }
  return [...latest.values()];
}

async function loadActiveChanges(workspace: string, diagnostics: Diagnostic[]): Promise<IndexedItem[]> {
  const root = path.join(workspace, "changes");
  const entries = await safeReadDir(root);
  const items: IndexedItem[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === "archive") continue;
    const patchPath = path.join(root, entry.name, "contract-patch.yaml");
    const text = await readOptionalText(patchPath);
    let value: unknown = { change_id: entry.name, status: "proposed" };
    if (text !== undefined) {
      const parsed = parseYaml(text, patchPath);
      if (parsed.ok) {
        value = parsed.value;
        validateValue(value, ContractPatchSchema, patchPath, "invalid_contract_patch", diagnostics);
        if (asRecord(value).change_id !== entry.name) diagnostics.push({ severity: "error", code: "change_id_mismatch", message: "Contract patch change_id must match its directory.", path: patchPath, blocking: true });
      }
      else diagnostics.push(parsed.diagnostic);
    } else diagnostics.push({ severity: "error", code: "contract_patch_missing", message: "Active change has no contract-patch.yaml.", path: patchPath, blocking: true });
    items.push({ type: "change", id: entry.name, selector: `change:${entry.name}`, value, path: path.join(root, entry.name) });
  }
  return items;
}

async function loadDraftPatches(workspace: string, diagnostics: Diagnostic[]): Promise<IndexedItem[]> {
  const root = path.join(workspace, "draft-patches");
  const entries = await safeReadDir(root);
  const items: IndexedItem[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    const patchPath = path.join(root, entry.name);
    const text = await readOptionalText(patchPath);
    if (text === undefined) continue;
    const parsed = parseJson(text, patchPath);
    if (!parsed.ok) {
      diagnostics.push(parsed.diagnostic);
      continue;
    }
    const value = asRecord(parsed.value);
    const id = stringValue(value.patch_id) ?? entry.name.slice(0, -5);
    validateValue(value, DraftPatchSchema, patchPath, "invalid_draft_patch", diagnostics);
    if (`${id}.json` !== entry.name) diagnostics.push({ severity: "error", code: "draft_patch_id_mismatch", message: "Draft patch ID must match its filename.", path: patchPath, blocking: true });
    items.push({ type: "patch", id, selector: `patch:${id}`, value, path: patchPath });
  }
  return items;
}

function buildItems(
  documents: Record<string, unknown>, artifacts: Record<string, unknown>[], decisions: Record<string, unknown>[], gates: Record<string, unknown>[], changes: IndexedItem[], patches: IndexedItem[], config: Record<string, unknown>, manifest: Record<string, unknown>,
): IndexedItem[] {
  const result: IndexedItem[] = [...changes, ...patches];
  for (const artifact of artifacts) addRecord(result, "artifact", artifact, "artifact_id", "runs/current/artifact-registry.json");
  for (const source of records(asRecord(documents["specs/sources.yaml"]).sources)) addRecord(result, "source", source, "source_id", "specs/sources.yaml");
  for (const claim of records(asRecord(documents["specs/claims.yaml"]).claims)) addRecord(result, "claim", claim, "claim_id", "specs/claims.yaml");
  addEventItems(result, "decision", decisions, "decision_id", "runs/current/decision-ledger.jsonl");
  addEventItems(result, "gate", gates, "gate_id", "runs/current/gate-ledger.jsonl");
  for (const alias of ["project", "sources", "claims", "manuscript", "workflow"]) {
    const relativePath = alias === "project" ? "specs/project.md" : `specs/${alias}.yaml`;
    result.push({ type: "contract", id: alias, selector: `contract:${alias}`, value: documents[relativePath], path: relativePath });
  }
  const selected = Array.isArray(asRecord(config.agent_tools).selected)
    ? (asRecord(config.agent_tools).selected as unknown[]).filter((item): item is string => typeof item === "string")
    : [];
  const installations = records(manifest.installations);
  for (const id of selected) {
    result.push({ type: "tool", id, selector: `tool:${id}`, value: { selected: true, installations: installations.filter((item) => item.tool_id === id) }, path: "config.yaml" });
  }
  return result;
}

function addRecord(result: IndexedItem[], type: IndexedItem["type"], value: Record<string, unknown>, idKey: string, filePath: string): void {
  const id = stringValue(value[idKey]);
  if (id) result.push({ type, id, selector: `${type}:${id}`, value, path: filePath });
}

function addEventItems(result: IndexedItem[], type: "decision" | "gate", events: Record<string, unknown>[], idKey: string, filePath: string): void {
  const grouped = new Map<string, Record<string, unknown>[]>();
  for (const event of events) {
    const id = stringValue(event[idKey]);
    if (!id) continue;
    grouped.set(id, [...(grouped.get(id) ?? []), event]);
  }
  for (const [id, history] of grouped) {
    result.push({ type, id, selector: `${type}:${id}`, value: history[history.length - 1], history, path: filePath });
  }
}

function validateDocument(relativePath: string, value: unknown, schema: z.ZodType, files: Map<string, SnapshotFile>, diagnostics: Diagnostic[]): void {
  if (!files.has(relativePath)) return;
  const result = schema.safeParse(value);
  if (!result.success) diagnostics.push({ severity: "error", code: "invalid_contract_shape", message: "Contract does not match the required shape.", path: files.get(relativePath)?.absolutePath, blocking: true, details: result.error.issues });
}

function validateRecords(values: Record<string, unknown>[], schema: z.ZodType, filePath: string, code: string, diagnostics: Diagnostic[]): void {
  values.forEach((value, index) => validateValue(value, schema, filePath, code, diagnostics, index + 1));
}

function validateValue(value: unknown, schema: z.ZodType, filePath: string, code: string, diagnostics: Diagnostic[], line?: number): void {
  const result = schema.safeParse(value);
  if (!result.success) diagnostics.push({ severity: "error", code, message: line ? `Record ${String(line)} does not match the required shape.` : "Document does not match the required shape.", path: filePath, blocking: true, details: result.error.issues });
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function records(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item)) : [];
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

async function safeReadDir(root: string) {
  if (!(await fileExists(root))) return [];
  return readdir(root, { withFileTypes: true });
}

export async function readSnapshotFile(filePath: string): Promise<Uint8Array> {
  return readFile(filePath);
}
