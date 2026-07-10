import path from "node:path";
import { readFile } from "node:fs/promises";

import { fileExists, isDirectory } from "../../utils/fs.js";
import { inspectArtifacts } from "../runtime/workflow-control.js";
import { isInstanceRunState } from "../contracts/run-state.js";
import { SubflowStartReceiptSchema } from "../contracts/subflow.js";
import { GateSubmitReceiptSchema, TransitionAdvanceReceiptSchema } from "../contracts/gate-transition.js";
import { loadWorkspaceSnapshot } from "../workspace/snapshot.js";
import type { WorkspaceSnapshot } from "../workspace/snapshot.js";
import { REQUIRED_DIRECTORIES } from "../workspace/layout.js";
import { sha256 } from "../workspace/write-plan.js";
import type { CheckResult, CheckTarget, Diagnostic } from "./types.js";

export type { CheckResult, CheckTarget, Diagnostic } from "./types.js";

export async function runWorkspaceChecks(workspace: string, target: CheckTarget = "all", strict = false): Promise<CheckResult> {
  const snapshot = await loadWorkspaceSnapshot(workspace);
  const diagnostics = snapshot.diagnostics.filter((diagnostic) => target === "all" || diagnosticMatchesTarget(workspace, diagnostic, target));

  if (target === "all" || target === "contracts" || target === "runtime") {
    for (const relativePath of REQUIRED_DIRECTORIES.filter((item) => target === "all" || directoryMatchesTarget(item, target))) {
      const absolutePath = path.join(workspace, relativePath);
      if (!(await isDirectory(absolutePath))) diagnostics.push(missing("required_directory_missing", absolutePath, "Required directory is missing."));
    }
  }

  if (target === "all" || target === "artifacts") {
    for (const inspection of await inspectArtifacts(snapshot)) diagnostics.push(...inspection.diagnostics);
  }

  if (target === "all" || target === "runtime") diagnostics.push(...await inspectSubflowStartReceipts(snapshot), ...await inspectGateTransitionReceipts(snapshot));

  if (target === "all" || target === "tools") {
    const installations = Array.isArray(snapshot.manifest.installations) ? snapshot.manifest.installations : [];
    for (const value of installations) {
      if (!value || typeof value !== "object") continue;
      const item = value as Record<string, unknown>;
      if (typeof item.path !== "string" || typeof item.sha256 !== "string") continue;
      const targetPath = item.scope === "shared-global" ? item.path : path.resolve(path.dirname(workspace), item.path);
      if (!(await fileExists(targetPath))) diagnostics.push({ severity: "warning", code: "generated_file_missing", message: "Manifest-owned generated file is missing.", path: targetPath, blocking: false });
      else if (sha256(await readFile(targetPath)) !== item.sha256) diagnostics.push({ severity: "warning", code: "generated_file_drift", message: "Manifest-owned generated file has changed.", path: targetPath, blocking: false });
    }
  }

  diagnostics.push(...validateCrossReferences(snapshot, target));

  const ok = diagnostics.every((diagnostic) => !diagnostic.blocking && (!strict || diagnostic.severity !== "warning"));
  return { ok, workspace, target, diagnostics };
}

async function inspectGateTransitionReceipts(snapshot: WorkspaceSnapshot): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];
  for (const event of snapshot.gates.filter((item) => item.schema_version === "1")) {
    const reference = record(event.receipt);
    const receiptPath = path.resolve(snapshot.workspace, typeof reference.path === "string" ? reference.path : "");
    try {
      const bytes = await readFile(receiptPath);
      const receipt = GateSubmitReceiptSchema.safeParse(JSON.parse(Buffer.from(bytes).toString("utf8")) as unknown);
      if (!receipt.success || sha256(bytes) !== reference.sha256 || receipt.data.plan_sha256 !== reference.plan_sha256 || receipt.data.event_id !== event.event_id || receipt.data.gate_id !== event.gate_id) diagnostics.push(dangling("gate_submit_receipt_mismatch", `Gate receipt does not match event ${String(event.event_id)}.`, receiptPath));
    } catch { diagnostics.push(dangling("gate_submit_receipt_missing", `Gate receipt is missing or invalid for ${String(event.event_id)}.`, receiptPath)); }
  }
  if (!isInstanceRunState(snapshot.runState)) return diagnostics;
  for (const instance of snapshot.runState.subflows) for (const reference of instance.transition_receipts) {
    const receiptPath = path.resolve(snapshot.workspace, reference.path);
    try {
      const bytes = await readFile(receiptPath);
      const receipt = TransitionAdvanceReceiptSchema.safeParse(JSON.parse(Buffer.from(bytes).toString("utf8")) as unknown);
      if (!receipt.success || sha256(bytes) !== reference.sha256 || receipt.data.plan_sha256 !== reference.plan_sha256 || receipt.data.transition_id !== reference.transition_id || receipt.data.subflow_instance_id !== instance.instance_id) diagnostics.push(dangling("transition_receipt_mismatch", `Transition receipt does not match state for ${reference.transition_id}.`, receiptPath));
    } catch { diagnostics.push(dangling("transition_receipt_missing", `Transition receipt is missing or invalid for ${reference.transition_id}.`, receiptPath)); }
  }
  return diagnostics;
}

async function inspectSubflowStartReceipts(snapshot: WorkspaceSnapshot): Promise<Diagnostic[]> {
  if (!isInstanceRunState(snapshot.runState)) return [];
  const diagnostics: Diagnostic[] = [];
  for (const instance of snapshot.runState.subflows) {
    const receiptPath = path.resolve(snapshot.workspace, instance.start_receipt.path);
    if (!(receiptPath === snapshot.workspace || receiptPath.startsWith(`${snapshot.workspace}${path.sep}`))) {
      diagnostics.push(dangling("subflow_start_receipt_escape", `Start receipt escapes the workspace: ${instance.start_receipt.path}`, path.join(snapshot.workspace, "runs/current/state.yaml")));
      continue;
    }
    try {
      const bytes = await readFile(receiptPath);
      const receipt = SubflowStartReceiptSchema.safeParse(JSON.parse(Buffer.from(bytes).toString("utf8")) as unknown);
      if (sha256(bytes) !== instance.start_receipt.sha256) diagnostics.push(dangling("subflow_start_receipt_hash_mismatch", `Start receipt hash differs for ${instance.instance_id}.`, receiptPath));
      if (!receipt.success || receipt.data.instance_id !== instance.instance_id || receipt.data.plan_sha256 !== instance.start_receipt.plan_sha256 || receipt.data.template_id !== instance.template_id || receipt.data.route_ref !== instance.route_ref || receipt.data.parent_subflow_id !== instance.parent_subflow_id || (receipt.data.parent_node_id ?? null) !== (instance.parent_node_id ?? null) || receipt.data.round_number !== instance.round_number) diagnostics.push(dangling("subflow_start_receipt_mismatch", `Start receipt does not match state for ${instance.instance_id}.`, receiptPath));
    } catch {
      diagnostics.push(dangling("subflow_start_receipt_missing", `Start receipt is missing or invalid for ${instance.instance_id}.`, receiptPath));
    }
  }
  return diagnostics;
}

function validateCrossReferences(snapshot: WorkspaceSnapshot, target: CheckTarget): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const sources = records(record(snapshot.documents["specs/sources.yaml"]).sources);
  const claims = records(record(snapshot.documents["specs/claims.yaml"]).claims);
  const workflow = record(snapshot.documents["specs/workflow.yaml"]);
  const stages = records(workflow.stages);
  const sourceIds = new Set(stringsFromRecords(sources, "source_id"));
  const claimIds = new Set(stringsFromRecords(claims, "claim_id"));
  const stageIds = new Set(stringsFromRecords(stages, "stage_id"));
  const artifactIds = new Set(stringsFromRecords(snapshot.artifacts, "artifact_id"));

  if (target === "all" || target === "contracts") {
    addDuplicateDiagnostics(diagnostics, sources, "source_id", "duplicate_source_id", "specs/sources.yaml", snapshot.workspace);
    addDuplicateDiagnostics(diagnostics, claims, "claim_id", "duplicate_claim_id", "specs/claims.yaml", snapshot.workspace);
    for (const claim of claims) {
      for (const sourceId of collectStringRefs(claim, ["source_id", "supporting_source_ids", "source_ids"])) {
        if (!sourceIds.has(sourceId)) diagnostics.push(dangling("claim_source_missing", `Claim references missing source: ${sourceId}`, path.join(snapshot.workspace, "specs/claims.yaml")));
      }
    }
  }

  if (target === "all" || target === "runtime") {
    const activeStage = snapshot.state.active_stage_id;
    if (typeof activeStage === "string" && !stageIds.has(activeStage)) diagnostics.push(dangling("active_stage_missing", `Active stage does not exist: ${activeStage}`, path.join(snapshot.workspace, "runs/current/state.yaml")));
    if (typeof snapshot.state.workflow_id === "string" && typeof workflow.workflow_id === "string" && snapshot.state.workflow_id !== workflow.workflow_id) diagnostics.push(dangling("workflow_id_mismatch", "Run state and workflow contract use different workflow IDs.", path.join(snapshot.workspace, "runs/current/state.yaml")));
    addDuplicateDiagnostics(diagnostics, snapshot.artifacts, "artifact_id", "duplicate_artifact_id", "runs/current/artifact-registry.json", snapshot.workspace);
    addDuplicateDiagnostics(diagnostics, snapshot.decisions, "event_id", "duplicate_decision_event_id", "runs/current/decision-ledger.jsonl", snapshot.workspace);
    addDuplicateDiagnostics(diagnostics, snapshot.gates, "event_id", "duplicate_gate_event_id", "runs/current/gate-ledger.jsonl", snapshot.workspace);
  }

  if (target === "all" || target === "artifacts") {
    for (const artifact of snapshot.artifacts) {
      for (const reference of [...stringArray(artifact.depends_on), ...stringArray(artifact.derived_from_artifact_ids)]) {
        if (!artifactIds.has(reference)) diagnostics.push(dangling("artifact_reference_missing", `Artifact references missing artifact: ${reference}`, path.join(snapshot.workspace, "runs/current/artifact-registry.json")));
      }
      for (const claimId of stringArray(artifact.claim_ids)) {
        if (!claimIds.has(claimId)) diagnostics.push(dangling("artifact_claim_missing", `Artifact references missing claim: ${claimId}`, path.join(snapshot.workspace, "runs/current/artifact-registry.json")));
      }
    }
  }
  return diagnostics;
}

function addDuplicateDiagnostics(diagnostics: Diagnostic[], values: Record<string, unknown>[], key: string, code: string, relativePath: string, workspace: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    const id = value[key];
    if (typeof id !== "string") continue;
    if (seen.has(id)) diagnostics.push({ severity: "error", code, message: `Duplicate ${key}: ${id}`, path: path.join(workspace, relativePath), blocking: true });
    seen.add(id);
  }
}

function collectStringRefs(value: Record<string, unknown>, keys: string[]): string[] {
  const result: string[] = [];
  for (const [key, entry] of Object.entries(value)) {
    if (keys.includes(key)) result.push(...(typeof entry === "string" ? [entry] : stringArray(entry)));
    else if (entry && typeof entry === "object") result.push(...(Array.isArray(entry) ? entry.flatMap((item) => collectStringRefs(record(item), keys)) : collectStringRefs(record(entry), keys)));
  }
  return result;
}

function dangling(code: string, message: string, filePath: string): Diagnostic { return { severity: "error", code, message, path: filePath, blocking: true }; }
function record(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function records(value: unknown): Record<string, unknown>[] { return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item)) : []; }
function stringArray(value: unknown): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []; }
function stringsFromRecords(values: Record<string, unknown>[], key: string): string[] { return values.map((value) => value[key]).filter((value): value is string => typeof value === "string"); }

function diagnosticMatchesTarget(workspace: string, diagnostic: Diagnostic, target: CheckTarget): boolean {
  if (!diagnostic.path) return true;
  const relative = path.relative(workspace, diagnostic.path).split(path.sep).join("/");
  if (target === "contracts") return relative.startsWith("specs/");
  if (target === "runtime") return relative.startsWith("runs/") || relative.startsWith("changes/") || relative.startsWith("draft-patches/");
  if (target === "artifacts") return relative === "runs/current/artifact-registry.json" || diagnostic.code.startsWith("artifact_");
  if (target === "tools") return relative === "config.yaml" || relative === "tool-installation-manifest.json" || diagnostic.code.startsWith("generated_file_");
  return true;
}

function directoryMatchesTarget(relative: string, target: CheckTarget): boolean {
  if (target === "contracts") return relative === "specs";
  if (target === "runtime") return relative.startsWith("runs") || relative.startsWith("changes") || relative.startsWith("draft-patches");
  return false;
}

function missing(code: string, filePath: string, message: string): Diagnostic {
  return { severity: "error", code, message, path: filePath, blocking: true };
}
