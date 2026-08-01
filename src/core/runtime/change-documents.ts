import path from "node:path";
import { lstat } from "node:fs/promises";
import { parse as parseYaml, stringify } from "yaml";

import {
  ProjectChangeDeltaSchema,
  ProjectChangeFrontmatterSchema,
  ProjectChangeTargetSchema,
  parseProjectChange,
  type ProjectChangeDelta,
} from "../contracts/project-change.js";
import { StableIdSchema } from "../contracts/stable-specs.js";
import {
  executeWritePlan,
  hashPath,
  planDirectFileEdit,
  type PlannedWrite,
} from "../workspace/write-plan.js";
import type { CurrentWorkspaceIndex, ProjectChangeRecord } from "./workspace-index.js";

export type ConditionalChangeDocument = "design" | "tasks" | "delta";
export type ProjectChangeDecision = "accept" | "reject" | "defer" | "supersede";

export class ChangeDocumentError extends Error {
  constructor(readonly code: string, message: string, readonly kind: "usage" | "domain" | "conflict" = "domain", readonly details?: unknown) {
    super(message);
    this.name = "ChangeDocumentError";
  }
}

export async function scaffoldProjectChange(input: {
  index: CurrentWorkspaceIndex;
  changeId: string;
  targets: readonly string[];
  withDocuments?: readonly ConditionalChangeDocument[];
  dryRun?: boolean;
}): Promise<{ change_id: string; directory: string; documents: string[]; operations: PlannedWrite[] }> {
  const id = StableIdSchema.safeParse(input.changeId);
  if (!id.success) throw new ChangeDocumentError("change_id_invalid", `Invalid change ID: ${input.changeId}`, "usage", id.error.issues);
  const targetsResult = ProjectChangeTargetSchema.array().min(1).safeParse(input.targets);
  if (!targetsResult.success) throw new ChangeDocumentError("change_targets_invalid", "Project change targets must name one or more stable specs.", "usage", targetsResult.error.issues);
  const targets = targetsResult.data;
  const frontmatterResult = ProjectChangeFrontmatterSchema.safeParse({ schema_version: "1", id: id.data, status: "proposed", targets });
  if (!frontmatterResult.success) throw new ChangeDocumentError("change_targets_invalid", "Project change targets must be unique.", "usage", frontmatterResult.error.issues);
  const frontmatter = frontmatterResult.data;
  const withDocuments = [...new Set(input.withDocuments ?? [])];
  if (withDocuments.some((item) => !["design", "tasks", "delta"].includes(item))) throw new ChangeDocumentError("change_documents_invalid", "Conditional change documents must be design, tasks, or delta.", "usage");
  if (input.index.changes.some((item) => item.id === id.data) || input.index.archivedChanges.some((item) => item.id === id.data)) {
    throw new ChangeDocumentError("change_exists", `Project change already exists: ${id.data}`, "conflict");
  }
  const directory = path.join(input.index.workspace, "changes", id.data);
  const changesRoot = path.join(input.index.workspace, "changes");
  const changesRootHash = await hashPath(changesRoot);
  await requireRegularDirectory(changesRoot, "change_root_invalid");
  try {
    await lstat(directory);
    throw new ChangeDocumentError("change_exists", `Project change directory already exists: ${id.data}`, "conflict");
  } catch (error) {
    if (error instanceof ChangeDocumentError) throw error;
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const documents = new Map<string, string>([
    ["change.md", renderProjectChange(frontmatter, changeBody(id.data))],
  ]);
  if (withDocuments.includes("design")) documents.set("design.md", "# Design\n\nDescribe the relevant concepts, decisions, alternatives, and risks.\n");
  if (withDocuments.includes("tasks")) documents.set("tasks.md", "# Tasks\n\n- [ ] Describe the first independently verifiable step.\n");
  if (withDocuments.includes("delta")) documents.set("delta.yaml", stringify({ schema_version: "1", operations: [] }));
  const operations = [...documents].map(([name, content]) => planDirectFileEdit({
    path: path.join(directory, name),
    relativePath: `changes/${id.data}/${name}`,
    content,
    reason: `create project change ${id.data}`,
  }));
  if (!input.dryRun) {
    try {
      await executeWritePlan({ operations, readPreconditions: [{ path: changesRoot, expectedHash: changesRootHash, reason: "project change directory scan" }] });
    } catch (error) { throw asChangeConflict(error); }
  }
  return { change_id: id.data, directory, documents: [...documents.keys()], operations };
}

export async function decideProjectChange(input: {
  index: CurrentWorkspaceIndex;
  changeId: string;
  decision: ProjectChangeDecision;
  actorName: string;
  reason: string;
  decidedAt: string;
  dryRun?: boolean;
}): Promise<{ change: ReturnType<typeof parseProjectChange>; content: string; path: string }> {
  const record = requireActiveChange(input.index, input.changeId);
  if (record.change.status !== "proposed") throw new ChangeDocumentError("change_not_proposed", `Only a proposed change can be decided: ${input.changeId}`, "conflict");
  const actorName = requiredText(input.actorName, "Decision actor");
  const reason = requiredText(input.reason, "Decision reason");
  const outcome = decisionOutcome(input.decision);
  const status = outcome;
  const frontmatter = ProjectChangeFrontmatterSchema.parse({
    ...record.change,
    status,
    decision: { outcome, decided_by: actorName, decided_at: input.decidedAt, reason },
  });
  const content = renderProjectChange(frontmatter, record.body);
  const operation = planDirectFileEdit({
    path: record.changePath,
    relativePath: path.relative(input.index.workspace, record.changePath).split(path.sep).join("/"),
    content,
    previousContent: record.changeText,
    reason: `record project change decision ${input.changeId}`,
  });
  if (!input.dryRun) {
    try { await executeWritePlan({ operations: [operation], readPreconditions: [{ path: record.directoryPath, expectedHash: record.directoryHash, reason: "project change directory scan" }] }); }
    catch (error) { throw asChangeConflict(error); }
  }
  return { change: parseProjectChange(content), content, path: record.changePath };
}

export function validateProjectChangeDelta(index: CurrentWorkspaceIndex, record: ProjectChangeRecord): ProjectChangeDelta | undefined {
  const file = record.documents.get("delta.yaml");
  if (!file) return undefined;
  let value: unknown;
  try { value = parseYaml(file.text); }
  catch (error) { throw new ChangeDocumentError("change_delta_invalid", `Invalid delta.yaml for change ${record.id}.`, "domain", error); }
  const parsed = ProjectChangeDeltaSchema.safeParse(value);
  if (!parsed.success) throw new ChangeDocumentError("change_delta_invalid", `Invalid delta.yaml for change ${record.id}.`, "domain", parsed.error.issues);
  const sourceRecords = new Map(index.sources.sources.map((item) => [item.source_id, structuredClone(item)]));
  const claimRecords = new Map(index.claims.claims.map((item) => [item.claim_id, structuredClone(item)]));
  for (const operation of parsed.data.operations) {
    const records = operation.target === "sources" ? sourceRecords : claimRecords;
    const targetSpec = operation.target === "sources" ? "sources.yaml" : "claims.yaml";
    if (!record.change.targets.includes(targetSpec)) {
      throw new ChangeDocumentError("change_delta_target_undeclared", `Delta target is absent from change targets: ${targetSpec}`);
    }
    if (operation.operation === "add") {
      if (records.has(operation.id)) throw new ChangeDocumentError("change_delta_add_collision", `Delta add collides with an existing ${operation.target} ID: ${operation.id}`);
      records.set(operation.id, structuredClone(operation.value) as never);
    } else if (operation.operation === "update") {
      if (!records.has(operation.id)) throw new ChangeDocumentError("change_delta_target_missing", `Delta update target is missing: ${operation.target}:${operation.id}`);
      records.set(operation.id, structuredClone(operation.value) as never);
    } else {
      if (!records.delete(operation.id)) throw new ChangeDocumentError("change_delta_target_missing", `Delta remove target is missing: ${operation.target}:${operation.id}`);
    }
  }
  for (const claim of claimRecords.values()) {
    for (const sourceId of claim.supporting_source_ids) {
      if (!sourceRecords.has(sourceId)) throw new ChangeDocumentError("change_delta_claim_source_missing", `Projected claim ${claim.claim_id} references missing source ${sourceId}.`);
    }
  }
  for (const section of index.manuscript.outline) {
    for (const claimId of section.claim_ids ?? []) {
      if (!claimRecords.has(claimId)) throw new ChangeDocumentError("change_delta_section_claim_missing", `Projected manuscript section ${section.section_id} references missing claim ${claimId}.`);
    }
  }
  return parsed.data;
}

export async function archiveProjectChange(input: {
  index: CurrentWorkspaceIndex;
  changeId: string;
  dryRun?: boolean;
}): Promise<{ change_id: string; source: string; target: string }> {
  const record = requireActiveChange(input.index, input.changeId);
  if (!["applied", "rejected", "deferred", "superseded"].includes(record.change.status)) {
    throw new ChangeDocumentError("change_not_archivable", `Change must be applied, rejected, deferred, or superseded before archive: ${input.changeId}`, "conflict");
  }
  if (input.index.archivedChanges.some((item) => item.id === input.changeId)) {
    throw new ChangeDocumentError("change_archive_conflict", `Archive target already exists: ${input.changeId}`, "conflict");
  }
  const target = path.join(input.index.workspace, "changes", "archive", record.directoryName);
  const changesRoot = path.join(input.index.workspace, "changes");
  const changesRootHash = await hashPath(changesRoot);
  await requireRegularDirectory(changesRoot, "change_root_invalid");
  await requireRegularDirectory(path.dirname(target), "change_archive_root_invalid", true);
  const operation: PlannedWrite = {
    action: "move",
    path: target,
    sourcePath: record.directoryPath,
    relativePath: `changes/archive/${record.directoryName}`,
    scope: "workspace",
    ownership: "user",
    previousHash: record.directoryHash,
    reason: `archive resolved project change ${input.changeId}`,
  };
  if (!input.dryRun) {
    try { await executeWritePlan({ operations: [operation], readPreconditions: [{ path: changesRoot, expectedHash: changesRootHash, reason: "project change archive scan" }] }); }
    catch (error) { throw asChangeConflict(error); }
  }
  return { change_id: input.changeId, source: record.directoryPath, target };
}

export function renderProjectChange(frontmatter: ReturnType<typeof ProjectChangeFrontmatterSchema.parse>, body: string): string {
  const normalizedBody = body.startsWith("\n") ? body : `\n${body}`;
  return `---\n${stringify(frontmatter)}---\n${normalizedBody}`;
}

function requireActiveChange(index: CurrentWorkspaceIndex, changeId: string): ProjectChangeRecord {
  const records = index.changes.filter((item) => item.id === changeId);
  if (records.length !== 1) throw new ChangeDocumentError(records.length === 0 ? "change_not_found" : "change_identity_ambiguous", `Change selector must resolve exactly once: ${changeId}`, records.length === 0 ? "usage" : "conflict");
  return records[0];
}

function decisionOutcome(decision: ProjectChangeDecision): "accepted" | "rejected" | "deferred" | "superseded" {
  if (decision === "accept") return "accepted";
  if (decision === "reject") return "rejected";
  if (decision === "defer") return "deferred";
  return "superseded";
}

function requiredText(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new ChangeDocumentError("change_decision_input_invalid", `${label} must not be empty.`, "usage");
  return trimmed;
}

function changeBody(changeId: string): string {
  return `\n# ${changeId}\n\nDescribe the background, proposed direction, boundaries, semantic delta, impact, and review conclusion.\n`;
}

function asChangeConflict(error: unknown): ChangeDocumentError {
  if (error instanceof ChangeDocumentError) return error;
  if ((error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT") return new ChangeDocumentError("change_write_conflict", error instanceof Error ? error.message : String(error), "conflict");
  throw error;
}

async function requireRegularDirectory(directory: string, code: string, missingAllowed = false): Promise<void> {
  try {
    const info = await lstat(directory);
    if (!info.isDirectory() || info.isSymbolicLink()) throw new ChangeDocumentError(code, `Managed change path must be a regular directory: ${directory}`, "conflict");
  } catch (error) {
    if (missingAllowed && (error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }
}
