import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import { fileExists, readOptionalText } from "../../utils/fs.js";
import { ArtifactRegistrySchema } from "../contracts/artifact.js";
import { validateWorkflowDefinition, WorkflowDefinitionSchema, WORKFLOW_PROFILE_IDS, type WorkflowDefinition } from "../contracts/workflow.js";
import { parseJson, parseJsonLines, parseYaml } from "../validation/parse.js";
import type { Diagnostic } from "../validation/types.js";
import { JSON_FILES, JSONL_FILES, MARKDOWN_FILES, REQUIRED_FILES, YAML_FILES } from "./layout.js";
import { sha256 } from "./write-plan.js";

const SafeId = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/).refine((value) => !value.includes(".."));
const ActorSchema = z.union([z.string().min(1), z.looseObject({ kind: z.string().min(1), name: z.string().min(1) })]);
const SourceSchema = z.looseObject({ source_id: SafeId });
const ClaimSchema = z.looseObject({ claim_id: SafeId });
const DecisionSchema = z.looseObject({ event_id: SafeId, decision_id: SafeId, timestamp: z.string().min(1), actor: ActorSchema, decision_type: z.string().min(1), selected_option: z.unknown(), status: z.enum(["proposed", "accepted", "rejected", "postponed", "superseded"]) });
const GateSchema = z.looseObject({ event_id: SafeId, gate_id: SafeId, timestamp: z.string().min(1), actor: ActorSchema, stage_id: z.string().min(1), gate_type: z.string().min(1), verdict: z.enum(["pass", "pass_with_conditions", "fail", "not_run"]), blocking: z.boolean() });
const ConfigSchema = z.looseObject({ schema_version: z.string(), profile: z.enum(WORKFLOW_PROFILE_IDS), agent_tools: z.looseObject({ selected: z.array(z.string()), delivery: z.enum(["skills", "commands", "both"]) }) });
const ManifestSchema = z.looseObject({ schema_version: z.string(), package_version: z.string(), installations: z.array(z.looseObject({ tool_id: z.string(), path: z.string(), scope: z.enum(["project", "shared-global"]), sha256: z.string(), source: z.string(), adapter_version: z.string() })) });
const SourcesSchema = z.looseObject({ schema_version: z.string(), sources: z.array(SourceSchema) });
const ClaimsSchema = z.looseObject({ schema_version: z.string(), claims: z.array(ClaimSchema) });
const ProjectSchema = z.looseObject({ schema_version: z.string(), project_id: SafeId, title: z.string(), target_output: z.string(), primary_language: z.string() });
const ManuscriptSchema = z.looseObject({ schema_version: z.string(), manuscript_id: SafeId, title: z.string(), status: z.string(), sections: z.array(z.unknown()) });
const StateSchema = z.looseObject({ schema_version: z.string(), run_id: SafeId, workflow_id: SafeId, status: z.enum(["not_started", "in_progress", "waiting", "blocked", "complete", "failed", "cancelled"]), active_stage_id: SafeId, pending_decisions: z.array(z.unknown()), diagnostics: z.array(z.unknown()) });
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
    const text = await readOptionalText(absolutePath);
    if (text === undefined) {
      diagnostics.push({ severity: "error", code: "required_file_missing", message: "Required file is missing.", path: absolutePath, blocking: true });
      continue;
    }
    const bytes = Buffer.from(text, "utf8");
    const file: SnapshotFile = { relativePath, absolutePath, text, bytes, hash: sha256(bytes) };
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
  const artifacts = records(asRecord(documents["runs/current/artifact-registry.json"]).artifacts);
  const decisions = records(documents["runs/current/decision-ledger.jsonl"]);
  const gates = records(documents["runs/current/gate-ledger.jsonl"]);

  validateDocument("config.yaml", config, ConfigSchema, files, diagnostics);
  validateDocument("tool-installation-manifest.json", manifest, ManifestSchema, files, diagnostics);
  validateDocument("specs/sources.yaml", documents["specs/sources.yaml"], SourcesSchema, files, diagnostics);
  validateDocument("specs/claims.yaml", documents["specs/claims.yaml"], ClaimsSchema, files, diagnostics);
  validateDocument("specs/manuscript.yaml", documents["specs/manuscript.yaml"], ManuscriptSchema, files, diagnostics);
  validateDocument("runs/current/state.yaml", state, StateSchema, files, diagnostics);
  validateDocument("runs/current/artifact-registry.json", documents["runs/current/artifact-registry.json"], ArtifactRegistrySchema, files, diagnostics);
  validateRecords(decisions, DecisionSchema, path.join(workspace, "runs/current/decision-ledger.jsonl"), "invalid_decision_event", diagnostics);
  validateRecords(gates, GateSchema, path.join(workspace, "runs/current/gate-ledger.jsonl"), "invalid_gate_event", diagnostics);

  const changes = await loadActiveChanges(workspace, diagnostics);
  const patches = await loadDraftPatches(workspace, diagnostics);
  const items = buildItems(documents, artifacts, decisions, gates, changes, patches, config, manifest);

  return { workspace, files, documents, config, manifest, workflow, state, artifacts, decisions, gates, changes, patches, items, diagnostics };
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
