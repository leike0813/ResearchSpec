import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { z, type ZodType } from "zod";

import { ArtifactRegistrySchema } from "../contracts/artifact.js";
import { DecisionLedgerEventSchema } from "../contracts/decision.js";
import { GateEventV1Schema, GateSubmitReceiptSchema, TransitionAdvanceReceiptSchema } from "../contracts/gate-transition.js";
import { ImportedGateEvidenceSchema } from "../contracts/material-passport.js";
import { DoctorRepairReceiptSchema } from "../contracts/runtime-recovery.js";
import { RunStateSchema } from "../contracts/run-state.js";
import { SubflowStartReceiptSchema } from "../contracts/subflow.js";
import { WorkflowDefinitionSchema } from "../contracts/workflow.js";
import { ArtifactSubmitReceiptSchema } from "../contracts/artifact.js";
import { CaseProfileSchema } from "../contracts/case-profile.js";
import { CaseStateSchema } from "../contracts/case-state.js";
import { AdaptiveCaseReceiptSchema } from "../contracts/adaptive-runtime.js";
import { DraftPatchReceiptSchema } from "../contracts/draft-patch.js";
import { ContractChangeDecisionReceiptSchema, ContractChangeProposalReceiptSchema, ContractChangeRevalidationReceiptSchema } from "../contracts/contract-change.js";
import { parseJson, parseJsonLines, parseYaml } from "../validation/parse.js";
import { sha256 } from "../workspace/write-plan.js";

const AUTHORITY_DEFINITIONS = [
  { relativePath: "specs/workflow.yaml", format: "yaml", schema: z.union([WorkflowDefinitionSchema, CaseProfileSchema]) },
  { relativePath: "runs/current/state.yaml", format: "yaml", schema: z.union([RunStateSchema, CaseStateSchema]) },
  { relativePath: "runs/current/artifact-registry.json", format: "json", schema: ArtifactRegistrySchema },
  { relativePath: "runs/current/gate-ledger.jsonl", format: "jsonl", schema: z.array(z.union([ImportedGateEvidenceSchema, GateEventV1Schema])) },
  { relativePath: "runs/current/decision-ledger.jsonl", format: "jsonl", schema: z.array(DecisionLedgerEventSchema) },
] as const;

export type RawFileKind = "file" | "missing" | "symlink" | "directory" | "other";
export type RuntimeReceiptType =
  | "subflow_start"
  | "artifact_submit"
  | "gate_submit"
  | "transition_advance"
  | "adaptive_start"
  | "obligation_commit"
  | "obligation_pause"
  | "obligation_resolution_request"
  | "obligation_resolution"
  | "adaptive_completion"
  | "draft_patch_submit"
  | "draft_patch_decision"
  | "draft_patch_apply"
  | "draft_patch_stale"
  | "contract_change_proposal"
  | "contract_change_decision"
  | "contract_change_revalidation"
  | "contract_patch_apply"
  | "runtime_repair";

export interface RawRuntimeFile {
  relativePath: string;
  absolutePath: string;
  kind: RawFileKind;
  bytes?: Uint8Array;
  sha256?: string;
  value?: unknown;
  parseCode?: string;
  schemaIssues?: z.core.$ZodIssue[];
}

export interface ObservedRuntimeReceipt extends RawRuntimeFile {
  receiptType?: RuntimeReceiptType;
  receipt?: Record<string, unknown>;
}

export interface RawRuntimeObservation {
  workspace: string;
  authority: Map<string, RawRuntimeFile>;
  receipts: ObservedRuntimeReceipt[];
}

export async function observeRuntimeRaw(workspace: string): Promise<RawRuntimeObservation> {
  const authority = new Map<string, RawRuntimeFile>();
  for (const definition of AUTHORITY_DEFINITIONS) {
    const observed = await observeAuthorityFile(workspace, definition.relativePath, definition.format, definition.schema);
    authority.set(definition.relativePath, observed);
  }
  const receipts = await observeReceiptTree(workspace);
  return { workspace, authority, receipts };
}

async function observeAuthorityFile(
  workspace: string,
  relativePath: string,
  format: "yaml" | "json" | "jsonl",
  schema: ZodType,
): Promise<RawRuntimeFile> {
  const observed = await observeFile(workspace, relativePath);
  if (observed.kind !== "file" || !observed.bytes) return observed;
  const text = Buffer.from(observed.bytes).toString("utf8");
  const parsed = format === "yaml"
    ? parseYaml(text, observed.absolutePath)
    : format === "json"
      ? parseJson(text, observed.absolutePath)
      : parseJsonLines(text, observed.absolutePath);
  if (!parsed.ok) return { ...observed, parseCode: parsed.diagnostic.code };
  const validated = schema.safeParse(parsed.value);
  return validated.success
    ? { ...observed, value: validated.data }
    : { ...observed, value: parsed.value, schemaIssues: validated.error.issues };
}

async function observeReceiptTree(workspace: string): Promise<ObservedRuntimeReceipt[]> {
  const rootRelative = "runs/current/receipts";
  const root = path.join(workspace, rootRelative);
  const receipts: ObservedRuntimeReceipt[] = [];
  try {
    const info = await lstat(root);
    if (info.isSymbolicLink() || !info.isDirectory()) {
      receipts.push({
        relativePath: rootRelative,
        absolutePath: root,
        kind: info.isSymbolicLink() ? "symlink" : "other",
      });
      return receipts;
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return receipts;
    throw error;
  }
  await walk(workspace, root, rootRelative, receipts);
  return receipts.sort((left, right) => compareText(left.relativePath, right.relativePath));
}

async function walk(workspace: string, absoluteRoot: string, relativeRoot: string, receipts: ObservedRuntimeReceipt[]): Promise<void> {
  let entries;
  try {
    entries = await readdir(absoluteRoot, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }
  entries.sort((left, right) => compareText(left.name, right.name));
  for (const entry of entries) {
    const relativePath = `${relativeRoot}/${entry.name}`;
    const absolutePath = path.join(absoluteRoot, entry.name);
    const info = await lstat(absolutePath);
    if (info.isSymbolicLink()) {
      receipts.push({ relativePath, absolutePath, kind: "symlink" });
      continue;
    }
    if (info.isDirectory()) {
      await walk(workspace, absolutePath, relativePath, receipts);
      continue;
    }
    if (!info.isFile()) {
      receipts.push({ relativePath, absolutePath, kind: "other" });
      continue;
    }
    if (!entry.name.endsWith(".json")) continue;
    const observed = await observeFile(workspace, relativePath);
    receipts.push(parseReceipt(observed));
  }
}

function parseReceipt(observed: RawRuntimeFile): ObservedRuntimeReceipt {
  if (observed.kind !== "file" || !observed.bytes) return observed;
  const parsed = parseJson(Buffer.from(observed.bytes).toString("utf8"), observed.absolutePath);
  if (!parsed.ok) return { ...observed, parseCode: parsed.diagnostic.code };
  const record = asRecord(parsed.value);
  const type = receiptType(record.receipt_type);
  if (!type) return { ...observed, value: parsed.value, parseCode: "unknown_receipt_type" };
  const validated = receiptSchema(type).safeParse(parsed.value);
  return validated.success
    ? { ...observed, value: validated.data, receiptType: type, receipt: asRecord(validated.data) }
    : { ...observed, value: parsed.value, receiptType: type, schemaIssues: validated.error.issues };
}

async function observeFile(workspace: string, relativePath: string): Promise<RawRuntimeFile> {
  const absolutePath = path.join(workspace, relativePath);
  try {
    const info = await lstat(absolutePath);
    if (info.isSymbolicLink()) return { relativePath, absolutePath, kind: "symlink" };
    if (info.isDirectory()) return { relativePath, absolutePath, kind: "directory" };
    if (!info.isFile()) return { relativePath, absolutePath, kind: "other" };
    const bytes = await readFile(absolutePath);
    return { relativePath, absolutePath, kind: "file", bytes, sha256: sha256(bytes) };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { relativePath, absolutePath, kind: "missing" };
    throw error;
  }
}

function receiptSchema(type: RuntimeReceiptType): ZodType {
  if (type === "subflow_start") return SubflowStartReceiptSchema;
  if (type === "artifact_submit") return ArtifactSubmitReceiptSchema;
  if (type === "gate_submit") return GateSubmitReceiptSchema;
  if (type === "transition_advance") return TransitionAdvanceReceiptSchema;
  if (type.startsWith("draft_patch_")) return z.union([
    DraftPatchReceiptSchema,
    z.looseObject({
      schema_version: z.literal("1"),
      receipt_type: z.literal("draft_patch_apply"),
      item_selector: z.string().min(1),
      decision_id: z.string().min(1),
    }),
  ]);
  if (type === "contract_change_proposal") return ContractChangeProposalReceiptSchema;
  if (type === "contract_change_decision") return ContractChangeDecisionReceiptSchema;
  if (type === "contract_change_revalidation") return ContractChangeRevalidationReceiptSchema;
  if (type === "contract_patch_apply") return z.looseObject({
    schema_version: z.literal("1"),
    receipt_type: z.literal("contract_patch_apply"),
    item_selector: z.string().min(1),
    decision_id: z.string().min(1),
  });
  if (type !== "runtime_repair") return AdaptiveCaseReceiptSchema;
  return DoctorRepairReceiptSchema;
}

function receiptType(value: unknown): RuntimeReceiptType | undefined {
  const known: RuntimeReceiptType[] = [
    "subflow_start",
    "artifact_submit",
    "gate_submit",
    "transition_advance",
    "adaptive_start",
    "obligation_commit",
    "obligation_pause",
    "obligation_resolution_request",
    "obligation_resolution",
    "adaptive_completion",
    "draft_patch_submit",
    "draft_patch_decision",
    "draft_patch_apply",
    "draft_patch_stale",
    "contract_change_proposal",
    "contract_change_decision",
    "contract_change_revalidation",
    "contract_patch_apply",
    "runtime_repair",
  ];
  return known.includes(value as RuntimeReceiptType)
    ? value as RuntimeReceiptType
    : undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
