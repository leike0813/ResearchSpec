import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { parse as parseYamlDocument } from "yaml";

import { ARSU_ROUTING_CATALOG } from "../../arsu-converter/routing/catalog.js";
import { ArtifactRegistrySchema } from "../contracts/artifact.js";
import type { GateSubmitReceipt, TransitionAdvanceReceipt } from "../contracts/gate-transition.js";
import {
  DoctorFindingSchema,
  DoctorRepairPlanSchema,
  DoctorRepairReceiptSchema,
  DoctorReportSchema,
  type DoctorFinding,
  type DoctorRepairOperation,
  type DoctorRepairPlan,
  type DoctorReport,
} from "../contracts/runtime-recovery.js";
import { RunStateSchema } from "../contracts/run-state.js";
import { CaseStateSchema } from "../contracts/case-state.js";
import type { SubflowStartReceipt } from "../contracts/subflow.js";
import { runWorkspaceChecks } from "../validation/check.js";
import { executeWritePlan, planFile, sha256, type PlannedWrite, type ReadPrecondition } from "../workspace/write-plan.js";
import {
  observeRuntimeRaw,
  type ObservedRuntimeReceipt,
  type RawRuntimeFile,
  type RawRuntimeObservation,
} from "./runtime-observation.js";
import {
  adaptiveReceiptMatchesAuthority,
  gateReceiptMatchesAuthority,
  startReceiptMatchesAuthority,
  transitionReceiptMatchesAuthority,
} from "./runtime-receipt-integrity.js";
import {
  isPathContained,
  resolveRegisteredArtifactPath,
  toPosixPath,
} from "./artifact-path.js";

const STATE_PATH = "runs/current/state.yaml";
const REGISTRY_PATH = "runs/current/artifact-registry.json";
const GATE_LEDGER_PATH = "runs/current/gate-ledger.jsonl";
const DECISION_LEDGER_PATH = "runs/current/decision-ledger.jsonl";
const WORKFLOW_PATH = "specs/workflow.yaml";

export interface PreparedDoctorRepair {
  workspace: string;
  finding: DoctorFinding;
  plan: DoctorRepairPlan;
  targetPath: string;
  originalBytes: Uint8Array;
  determinedBytes: Uint8Array;
}

export interface DoctorDiagnosis {
  report: DoctorReport;
  repairs: Map<string, PreparedDoctorRepair>;
}

export interface DoctorRepairExecution {
  receiptPath: string;
  receiptSha256: string;
  postCheckOk: boolean;
  remainingFindings: DoctorFinding[];
}

export class DoctorRecoveryError extends Error {
  constructor(
    readonly code: "finding_not_found" | "repair_unavailable" | "repair_conflict" | "repair_postcheck_failed",
    message: string,
  ) {
    super(message);
  }
}

interface ReceiptBinding {
  authorityPath: string;
  oldHash: string;
  receiptPath: string;
  receipt: ObservedRuntimeReceipt;
  semanticMatch: boolean;
  scope: string;
}

interface RepairDraft {
  finding: DoctorFinding;
  targetPath: string;
  originalBytes: Uint8Array;
  determinedBytes: Uint8Array;
  evidencePreconditions: Array<{ path: string; sha256: string }>;
}

export async function diagnoseRuntime(workspace: string): Promise<DoctorDiagnosis> {
  const observation = await observeRuntimeRaw(workspace);
  const findings: DoctorFinding[] = [];
  const drafts: RepairDraft[] = [];

  findings.push(...authorityShapeFindings(observation));
  const bindingResult = analyzeReceiptBindings(observation);
  findings.push(...bindingResult.findings);
  drafts.push(...bindingResult.repairs);
  findings.push(...receiptShapeFindings(observation, bindingResult.referencedPaths));
  findings.push(...await orphanReceiptFindings(observation, bindingResult.referencedPaths));

  const unique = deduplicateFindings(findings);
  if (unique.length === 0) {
    const healthy = finding({
      disposition: "healthy",
      scope: "runtime:current",
      code: "runtime_healthy",
      affectedPaths: [],
      evidenceRefs: [WORKFLOW_PATH, STATE_PATH, REGISTRY_PATH, GATE_LEDGER_PATH, DECISION_LEDGER_PATH],
    });
    return {
      report: DoctorReportSchema.parse({ schema_version: "1", workspace, healthy: true, findings: [healthy] }),
      repairs: new Map(),
    };
  }

  const repairs = new Map<string, PreparedDoctorRepair>();
  for (const draft of drafts) {
    if (!unique.some((item) => item.finding_id === draft.finding.finding_id)) continue;
    repairs.set(draft.finding.finding_id, prepareRepair(workspace, draft));
  }
  return {
    report: DoctorReportSchema.parse({ schema_version: "1", workspace, healthy: false, findings: unique }),
    repairs,
  };
}

export async function prepareDoctorRepair(workspace: string, findingId: string): Promise<PreparedDoctorRepair> {
  const diagnosis = await diagnoseRuntime(workspace);
  const finding = diagnosis.report.findings.find((item) => item.finding_id === findingId);
  if (!finding) throw new DoctorRecoveryError("finding_not_found", `Doctor finding is no longer present: ${findingId}`);
  const repair = diagnosis.repairs.get(findingId);
  if (!repair) throw new DoctorRecoveryError("repair_unavailable", `Doctor finding is not deterministically repairable: ${findingId}`);
  return repair;
}

export async function executeDoctorRepair(prepared: PreparedDoctorRepair, now = new Date().toISOString()): Promise<DoctorRepairExecution> {
  const backupPath = prepared.plan.backup_paths[0];
  if (!backupPath) throw new DoctorRecoveryError("repair_conflict", "Repair plan has no backup path.");
  const receiptOperation = prepared.plan.operations.find((operation) => operation.kind === "append_receipt");
  if (!receiptOperation) throw new DoctorRecoveryError("repair_conflict", "Repair plan has no receipt operation.");

  const receiptAbsolute = path.join(prepared.workspace, receiptOperation.target_path);
  let receipt = DoctorRepairReceiptSchema.parse({
    schema_version: "1",
    receipt_type: "runtime_repair",
    finding_id: prepared.finding.finding_id,
    plan_sha256: prepared.plan.plan_sha256,
    backup_paths: prepared.plan.backup_paths,
    applied_operations: prepared.plan.operations,
    postcondition_hashes: prepared.plan.postconditions,
    repaired_at: now,
  });
  try {
    const existingBytes = await readFile(receiptAbsolute);
    const existing = DoctorRepairReceiptSchema.parse(JSON.parse(Buffer.from(existingBytes).toString("utf8")) as unknown);
    if (
      existing.finding_id !== receipt.finding_id
      || existing.plan_sha256 !== receipt.plan_sha256
      || JSON.stringify(existing.backup_paths) !== JSON.stringify(receipt.backup_paths)
      || JSON.stringify(existing.applied_operations) !== JSON.stringify(receipt.applied_operations)
      || JSON.stringify(existing.postcondition_hashes) !== JSON.stringify(receipt.postcondition_hashes)
    ) {
      throw new DoctorRecoveryError("repair_conflict", "Existing Doctor repair receipt belongs to a different repair intent.");
    }
    receipt = existing;
  } catch (error) {
    if (error instanceof DoctorRecoveryError) throw error;
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const receiptText = `${JSON.stringify(receipt, null, 2)}\n`;
  const backupAbsolute = path.join(prepared.workspace, backupPath);
  const targetAbsolute = path.join(prepared.workspace, prepared.targetPath);
  const backupOperation = await planFile({
    path: backupAbsolute,
    relativePath: backupPath,
    content: prepared.originalBytes,
    scope: "workspace",
    ownership: "user",
  });
  const receiptWrite = await planFile({
    path: receiptAbsolute,
    relativePath: receiptOperation.target_path,
    content: receiptText,
    scope: "workspace",
    ownership: "user",
  });
  if (backupOperation.action === "conflict" || receiptWrite.action === "conflict") {
    throw new DoctorRecoveryError("repair_conflict", "Doctor backup or receipt path conflicts with existing bytes.");
  }
  const authorityWrite: PlannedWrite = {
    action: "refresh",
    path: targetAbsolute,
    relativePath: prepared.targetPath,
    content: prepared.determinedBytes,
    scope: "workspace",
    ownership: "user",
    previousHash: sha256(prepared.originalBytes),
    nextHash: sha256(prepared.determinedBytes),
    reason: "commit uniquely determined runtime authority after preserving original bytes and recording the repair receipt",
  };
  const readPreconditions: ReadPrecondition[] = prepared.plan.read_preconditions.map((item) => ({
    path: path.join(prepared.workspace, item.path),
    expectedHash: item.sha256,
    reason: `Doctor repair basis ${item.path}`,
  }));

  try {
    await executeWritePlan({
      operations: [backupOperation, receiptWrite, authorityWrite],
      readPreconditions,
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT") {
      throw new DoctorRecoveryError("repair_conflict", "Doctor repair preconditions changed; obtain a new diagnosis.");
    }
    throw error;
  }

  for (const postcondition of prepared.plan.postconditions) {
    const bytes = await readFile(path.join(prepared.workspace, postcondition.path));
    if (sha256(bytes) !== postcondition.sha256) {
      throw new DoctorRecoveryError("repair_postcheck_failed", `Doctor postcondition failed: ${postcondition.path}`);
    }
  }
  const after = await diagnoseRuntime(prepared.workspace);
  if (after.report.findings.some((item) => item.finding_id === prepared.finding.finding_id)) {
    throw new DoctorRecoveryError("repair_postcheck_failed", "Doctor finding remains after repair.");
  }
  const runtimeCheck = await runWorkspaceChecks(prepared.workspace, "runtime");
  return {
    receiptPath: receiptOperation.target_path,
    receiptSha256: sha256(receiptText),
    postCheckOk: runtimeCheck.ok,
    remainingFindings: after.report.healthy ? [] : after.report.findings,
  };
}

function authorityShapeFindings(observation: RawRuntimeObservation): DoctorFinding[] {
  const findings: DoctorFinding[] = [];
  for (const observed of observation.authority.values()) {
    if (observed.kind !== "file") {
      findings.push(finding({
        disposition: "requires_human_reconstruction",
        scope: `authority:${observed.relativePath}`,
        code: observed.kind === "missing" ? "authority_file_missing" : "authority_file_not_regular",
        affectedPaths: [observed.relativePath],
        evidenceRefs: [observed.kind],
      }));
    } else if (observed.parseCode) {
      findings.push(finding({
        disposition: "requires_human_reconstruction",
        scope: `authority:${observed.relativePath}`,
        code: observed.parseCode,
        affectedPaths: [observed.relativePath],
        evidenceRefs: [observed.sha256 ?? "unhashed"],
      }));
    } else if (observed.schemaIssues) {
      findings.push(finding({
        disposition: "requires_human_reconstruction",
        scope: `authority:${observed.relativePath}`,
        code: "authority_schema_invalid",
        affectedPaths: [observed.relativePath],
        evidenceRefs: observed.schemaIssues.map((issue) => `/${issue.path.join("/")}`).slice(0, 20),
      }));
    }
  }
  return findings;
}

function receiptShapeFindings(observation: RawRuntimeObservation, referencedPaths: Set<string>): DoctorFinding[] {
  return observation.receipts.flatMap((receipt) => {
    if (receipt.kind === "file" && !receipt.parseCode && !receipt.schemaIssues) return [];
    return [finding({
      disposition: "requires_human_reconstruction",
      scope: `receipt:${receipt.relativePath}`,
      code: receipt.kind !== "file"
        ? "receipt_not_regular"
        : receipt.parseCode ?? "receipt_schema_invalid",
      affectedPaths: [receipt.relativePath],
      evidenceRefs: [referencedPaths.has(receipt.relativePath) ? "authority_referenced" : "unreferenced"],
    })];
  });
}

function analyzeReceiptBindings(observation: RawRuntimeObservation): {
  findings: DoctorFinding[];
  repairs: RepairDraft[];
  referencedPaths: Set<string>;
} {
  const receiptsByPath = new Map(observation.receipts.map((receipt) => [receipt.relativePath, receipt]));
  const bindings = collectBindings(observation, receiptsByPath);
  const referencedPaths = new Set(bindings.map((binding) => binding.receiptPath));
  const findings: DoctorFinding[] = [];
  const repairGroups = new Map<string, ReceiptBinding[]>();

  for (const binding of bindings) {
    if (binding.receipt.kind !== "file") {
      findings.push(finding({
        disposition: "requires_human_reconstruction",
        scope: binding.scope,
        code: "referenced_receipt_missing",
        affectedPaths: [binding.authorityPath, binding.receiptPath],
        evidenceRefs: [binding.oldHash, binding.receipt.kind],
      }));
      continue;
    }
    if (!binding.receipt.receipt || binding.receipt.schemaIssues || binding.receipt.parseCode) continue;
    if (!binding.semanticMatch) {
      findings.push(finding({
        disposition: "conflicting_evidence",
        scope: binding.scope,
        code: "receipt_authority_conflict",
        affectedPaths: [binding.authorityPath, binding.receiptPath],
        evidenceRefs: [binding.oldHash, binding.receipt.sha256 ?? "unhashed"],
      }));
      continue;
    }
    if (binding.oldHash !== binding.receipt.sha256) {
      const group = repairGroups.get(binding.authorityPath) ?? [];
      group.push(binding);
      repairGroups.set(binding.authorityPath, group);
    }
  }

  const repairs: RepairDraft[] = [];
  for (const [authorityPath, group] of repairGroups) {
    const observed = observation.authority.get(authorityPath);
    if (!observed?.bytes) continue;
    const replacement = replaceHashReferences(observed.bytes, group);
    if (!replacement.ok) {
      findings.push(finding({
        disposition: "conflicting_evidence",
        scope: `authority:${authorityPath}`,
        code: "receipt_hash_repair_ambiguous",
        affectedPaths: [authorityPath, ...group.map((item) => item.receiptPath)],
        evidenceRefs: replacement.evidence,
      }));
      continue;
    }
    const candidate = validateDeterminedAuthority(authorityPath, replacement.bytes);
    if (!candidate) {
      findings.push(finding({
        disposition: "requires_human_reconstruction",
        scope: `authority:${authorityPath}`,
        code: "determined_authority_invalid",
        affectedPaths: [authorityPath],
        evidenceRefs: group.map((item) => item.receiptPath),
      }));
      continue;
    }
    const repairFinding = finding({
      disposition: "deterministically_repairable",
      scope: `authority:${authorityPath}`,
      code: "receipt_hash_reference_drift",
      affectedPaths: [authorityPath, ...group.map((item) => item.receiptPath)],
      evidenceRefs: group.flatMap((item) => [item.oldHash, item.receipt.sha256 ?? "unhashed"]),
      repairAvailable: true,
    });
    findings.push(repairFinding);
    repairs.push({
      finding: repairFinding,
      targetPath: authorityPath,
      originalBytes: observed.bytes,
      determinedBytes: candidate,
      evidencePreconditions: group.map((item) => {
        if (!item.receipt.sha256) throw new DoctorRecoveryError("repair_unavailable", `Repair evidence is unhashed: ${item.receiptPath}`);
        return { path: item.receiptPath, sha256: item.receipt.sha256 };
      }),
    });
  }
  return { findings, repairs, referencedPaths };
}

function collectBindings(
  observation: RawRuntimeObservation,
  receiptsByPath: Map<string, ObservedRuntimeReceipt>,
): ReceiptBinding[] {
  const bindings: ReceiptBinding[] = [];
  const missingReceipt = (relativePath: string): ObservedRuntimeReceipt => ({
    relativePath,
    absolutePath: path.join(observation.workspace, relativePath),
    kind: "missing",
  });
  const stateFile = validAuthority(observation, STATE_PATH);
  const strictState = RunStateSchema.safeParse(stateFile?.value);
  const state = strictState.success ? strictState.data : undefined;
  if (state) {
    for (const instance of state.subflows) {
      const start = receiptsByPath.get(instance.start_receipt.path) ?? missingReceipt(instance.start_receipt.path);
      bindings.push({
        authorityPath: STATE_PATH,
        oldHash: instance.start_receipt.sha256,
        receiptPath: instance.start_receipt.path,
        receipt: start,
        semanticMatch: start.receiptType === "subflow_start"
          && start.receipt !== undefined
          && startReceiptMatchesAuthority(instance, start.receipt as SubflowStartReceipt),
        scope: `subflow:${instance.instance_id}`,
      });
      for (const reference of instance.transition_receipts) {
        const receipt = receiptsByPath.get(reference.path) ?? missingReceipt(reference.path);
        bindings.push({
          authorityPath: STATE_PATH,
          oldHash: reference.sha256,
          receiptPath: reference.path,
          receipt,
          semanticMatch: receipt.receiptType === "transition_advance"
            && receipt.receipt !== undefined
            && transitionReceiptMatchesAuthority(instance, reference, receipt.receipt as TransitionAdvanceReceipt),
          scope: `transition:${reference.transition_id}`,
        });
      }
    }
  }
  const adaptiveState = CaseStateSchema.safeParse(stateFile?.value);
  if (adaptiveState.success) {
    for (const reference of adaptiveState.data.receipts) {
      const receipt = receiptsByPath.get(reference.path) ?? missingReceipt(reference.path);
      bindings.push({
        authorityPath: STATE_PATH,
        oldHash: reference.sha256,
        receiptPath: reference.path,
        receipt,
        semanticMatch: adaptiveReceiptMatchesAuthority(reference, receipt.receiptType, receipt.receipt),
        scope: `receipt:${reference.receipt_id}`,
      });
    }
  }

  const gates = validAuthority(observation, GATE_LEDGER_PATH)?.value;
  if (Array.isArray(gates)) for (const rawEvent of gates) {
    const event = asRecord(rawEvent);
    const reference = asRecord(event.receipt);
    if (event.schema_version !== "1" || typeof reference.path !== "string" || typeof reference.sha256 !== "string") continue;
    const receipt = receiptsByPath.get(reference.path) ?? missingReceipt(reference.path);
    bindings.push({
      authorityPath: GATE_LEDGER_PATH,
      oldHash: reference.sha256,
      receiptPath: reference.path,
      receipt,
      semanticMatch: receipt.receiptType === "gate_submit"
        && receipt.receipt !== undefined
        && gateReceiptMatchesAuthority(event, reference, receipt.receipt as GateSubmitReceipt),
      scope: `gate-event:${String(event.event_id)}`,
    });
  }

  const registry = asRecord(validAuthority(observation, REGISTRY_PATH)?.value);
  const artifacts = Array.isArray(registry.artifacts) ? registry.artifacts.map(asRecord) : [];
  for (const artifact of artifacts) {
    if (artifact.artifact_type !== "artifact_submit_receipt" && artifact.artifact_type !== "apply_receipt") continue;
    if (typeof artifact.path !== "string" || typeof artifact.sha256 !== "string") continue;
    const receiptPath = registryReceiptPath(observation, artifact.path);
    if (!receiptPath) continue;
    const receipt = receiptsByPath.get(receiptPath) ?? missingReceipt(receiptPath);
    bindings.push({
      authorityPath: REGISTRY_PATH,
      oldHash: artifact.sha256,
      receiptPath,
      receipt,
      semanticMatch: artifact.artifact_type === "artifact_submit_receipt"
        ? receipt.receiptType === "artifact_submit" && artifactReceiptMatches(artifact, receipt.receipt)
        : receipt.receiptType === "draft_patch_apply" || receipt.receiptType === "contract_patch_apply",
      scope: `artifact:${String(artifact.artifact_id)}`,
    });
  }
  return bindings;
}

async function orphanReceiptFindings(observation: RawRuntimeObservation, referencedPaths: Set<string>): Promise<DoctorFinding[]> {
  const groups = new Map<string, ObservedRuntimeReceipt[]>();
  for (const receipt of observation.receipts) {
    if (!receipt.receipt || receipt.receiptType === "runtime_repair" || referencedPaths.has(receipt.relativePath)) continue;
    if (receipt.receiptType?.startsWith("draft_patch_")
      || receipt.receiptType?.startsWith("contract_change_")
      || receipt.receiptType === "contract_patch_apply") continue;
    const selector = typeof receipt.receipt.selector === "string" ? receipt.receipt.selector : receipt.relativePath;
    const key = `${receipt.receiptType ?? "unknown"}:${selector}`;
    const group = groups.get(key) ?? [];
    group.push(receipt);
    groups.set(key, group);
  }
  const findings: DoctorFinding[] = [];
  for (const [key, group] of groups) {
    const plans = new Set(group.map(receiptIntentId));
    if (group.length > 1 && plans.size > 1) {
      findings.push(finding({
        disposition: "conflicting_evidence",
        scope: `transaction:${key}`,
        code: "orphan_receipts_conflict",
        affectedPaths: group.map((item) => item.relativePath),
        evidenceRefs: [...plans],
      }));
      continue;
    }
    const receipt = group[0];
    if (!receipt?.receipt) continue;
    const selector = typeof receipt.receipt.selector === "string" ? receipt.receipt.selector : null;
    const legacyAdaptive = isAdaptiveReceiptType(receipt.receiptType)
      && receipt.receipt.schema_version === "1";
    const retryable = !legacyAdaptive && selector && await receiptBasisMatches(observation, receipt);
    findings.push(finding({
      disposition: retryable ? "retry_existing_transaction" : "requires_human_reconstruction",
      scope: `transaction:${key}`,
      code: retryable
        ? "orphan_transaction_retryable"
        : legacyAdaptive
          ? "legacy_receipt_requires_human_reconstruction"
          : "orphan_transaction_basis_stale",
      affectedPaths: group.map((item) => item.relativePath),
      evidenceRefs: [receiptIntentId(receipt)],
      retrySelector: retryable ? selector : null,
    }));
  }
  return findings;
}

function receiptIntentId(receipt: ObservedRuntimeReceipt): string {
  return stringValue(receipt.receipt?.plan_sha256)
    || stringValue(receipt.receipt?.submission_id)
    || stringValue(receipt.receipt?.receipt_id)
    || receipt.relativePath;
}

async function receiptBasisMatches(observation: RawRuntimeObservation, receipt: ObservedRuntimeReceipt): Promise<boolean> {
  if (!receipt.receipt) return false;
  if (receipt.receipt.schema_version === "2" && (
    isAdaptiveReceiptType(receipt.receiptType) || receipt.receiptType === "gate_submit"
  )) {
    const target = asRecord(receipt.receipt.authority_target);
    const mutablePaths = new Set(Array.isArray(target.paths)
      ? target.paths.filter((item): item is string => typeof item === "string")
      : []);
    const preconditions = Array.isArray(receipt.receipt.read_preconditions)
      ? receipt.receipt.read_preconditions.map(asRecord)
      : [];
    if (preconditions.length === 0) return false;
    for (const precondition of preconditions) {
      const relativePath = stringValue(precondition.path);
      if (!relativePath || mutablePaths.has(relativePath)) continue;
      const observed = observation.authority.get(relativePath);
      if (precondition.state === "absent") {
        if (observed?.kind === "file" || await safeRelativeFileHash(observation.workspace, observation.workspace, relativePath)) return false;
      } else if (
        precondition.state !== "present"
        || !/^[a-f0-9]{64}$/.test(stringValue(precondition.sha256))
        || (observed?.sha256 ?? await safeRelativeFileHash(observation.workspace, observation.workspace, relativePath))
          !== precondition.sha256
      ) return false;
    }
    return true;
  }
  if (receipt.receiptType !== "subflow_start" && receipt.receiptType !== "artifact_submit") return false;
  const basis = asRecord(receipt.receipt.basis);
  if (receipt.receiptType === "subflow_start"
    && basis.catalog_sha256 !== sha256(`${JSON.stringify(ARSU_ROUTING_CATALOG)}\n`)) return false;
  const expected = new Map<string, string>([
    [WORKFLOW_PATH, stringValue(basis.workflow_sha256)],
    [STATE_PATH, stringValue(basis.state_sha256)],
    [REGISTRY_PATH, stringValue(basis.registry_sha256)],
    [GATE_LEDGER_PATH, stringValue(basis.gate_ledger_sha256)],
    [DECISION_LEDGER_PATH, stringValue(basis.decision_ledger_sha256)],
  ]);
  for (const [relativePath, hash] of Object.entries(asRecord(basis.contract_hashes))) {
    if (typeof hash === "string") expected.set(relativePath, hash);
  }
  for (const [relativePath, hash] of expected) {
    if (!/^[a-f0-9]{64}$/.test(hash)) return false;
    const observed = observation.authority.get(relativePath);
    if (observed) {
      if (observed.sha256 !== hash) return false;
      continue;
    }
    if (await safeRelativeFileHash(observation.workspace, observation.workspace, relativePath) !== hash) return false;
  }
  const registry = asRecord(validAuthority(observation, REGISTRY_PATH)?.value);
  const artifacts = Array.isArray(registry.artifacts) ? registry.artifacts.map(asRecord) : [];
  for (const [artifactId, expectedHash] of Object.entries(asRecord(basis.artifact_hashes))) {
    if (typeof expectedHash !== "string") return false;
    const artifact = artifacts.find((item) => item.artifact_id === artifactId);
    if (!artifact || typeof artifact.path !== "string") return false;
    if (await safeRegisteredArtifactHash(observation, artifact.path) !== expectedHash) return false;
  }
  if (receipt.receiptType === "artifact_submit") {
    const candidate = asRecord(receipt.receipt.artifact);
    if (typeof candidate.path !== "string" || typeof candidate.sha256 !== "string") return false;
    if (await safeRegisteredArtifactHash(observation, candidate.path) !== candidate.sha256) return false;
    const dependencies = Array.isArray(receipt.receipt.dependency_artifacts)
      ? receipt.receipt.dependency_artifacts.map(asRecord)
      : [];
    for (const dependency of dependencies) {
      if (typeof dependency.path !== "string" || typeof dependency.sha256 !== "string") return false;
      if (await safeRegisteredArtifactHash(observation, dependency.path) !== dependency.sha256) return false;
    }
  }
  const decisionEventIds = Array.isArray(basis.decision_event_ids)
    ? basis.decision_event_ids.filter((item): item is string => typeof item === "string")
    : [];
  if (decisionEventIds.length) {
    const decisions = validAuthority(observation, DECISION_LEDGER_PATH)?.value;
    const current = new Set(Array.isArray(decisions) ? decisions.map((item) => stringValue(asRecord(item).event_id)) : []);
    if (!decisionEventIds.every((eventId) => current.has(eventId))) return false;
  }
  return true;
}

function isAdaptiveReceiptType(receiptType: ObservedRuntimeReceipt["receiptType"]): boolean {
  return receiptType === "adaptive_start"
    || receiptType === "obligation_commit"
    || receiptType === "obligation_pause"
    || receiptType === "obligation_resolution_request"
    || receiptType === "obligation_resolution"
    || receiptType === "adaptive_completion";
}

async function safeRelativeFileHash(root: string, containmentRoot: string, relativePath: string): Promise<string | undefined> {
  if (path.isAbsolute(relativePath) || relativePath.split(/[\\/]/).includes("..")) return undefined;
  const resolved = path.resolve(root, relativePath);
  if (resolved !== containmentRoot && !resolved.startsWith(`${containmentRoot}${path.sep}`)) return undefined;
  try {
    const info = await lstat(resolved);
    if (!info.isFile() || info.isSymbolicLink()) return undefined;
    return sha256(await readFile(resolved));
  } catch {
    return undefined;
  }
}

async function safeRegisteredArtifactHash(
  context: Pick<RawRuntimeObservation, "workspace" | "runtimeMode">,
  registeredPath: string,
): Promise<string | undefined> {
  const resolved = resolveRegisteredArtifactPath(context, registeredPath);
  if (!resolved.contained) return undefined;
  try {
    const info = await lstat(resolved.absolutePath);
    if (!info.isFile() || info.isSymbolicLink()) return undefined;
    const [realRoot, realArtifact] = await Promise.all([
      realpath(resolved.root),
      realpath(resolved.absolutePath),
    ]);
    if (!isPathContained(realRoot, realArtifact)) return undefined;
    return sha256(await readFile(realArtifact));
  } catch {
    return undefined;
  }
}

function prepareRepair(workspace: string, draft: RepairDraft): PreparedDoctorRepair {
  const targetHash = sha256(draft.originalBytes);
  const nextHash = sha256(draft.determinedBytes);
  const targetKey = sha256(draft.targetPath).slice(0, 16);
  const backupPath = `runs/current/recovery/${draft.finding.finding_id}/${targetKey}-${targetHash}.original`;
  const receiptPath = `runs/current/receipts/runtime-repair/${draft.finding.finding_id}.json`;
  const readPreconditions = [
    { path: draft.targetPath, sha256: targetHash },
    ...draft.evidencePreconditions,
  ];
  const operations: DoctorRepairOperation[] = [
    { kind: "append_receipt", target_path: receiptPath },
    { kind: "write_determined_content", target_path: draft.targetPath, content_sha256: nextHash },
  ];
  const unsigned = {
    schema_version: "1" as const,
    finding_id: draft.finding.finding_id,
    read_preconditions: readPreconditions,
    backup_paths: [backupPath],
    operations,
    postconditions: [{ path: draft.targetPath, sha256: nextHash }],
  };
  const plan = DoctorRepairPlanSchema.parse({ ...unsigned, plan_sha256: sha256(`${JSON.stringify(unsigned)}\n`) });
  return {
    workspace,
    finding: draft.finding,
    plan,
    targetPath: draft.targetPath,
    originalBytes: draft.originalBytes,
    determinedBytes: draft.determinedBytes,
  };
}

function replaceHashReferences(bytes: Uint8Array, bindings: ReceiptBinding[]):
  | { ok: true; bytes: Uint8Array }
  | { ok: false; evidence: string[] } {
  let text = Buffer.from(bytes).toString("utf8");
  const replacements = new Map<string, string>();
  for (const binding of bindings) {
    const next = binding.receipt.sha256;
    if (!next) return { ok: false, evidence: [binding.receiptPath, "receipt_unhashed"] };
    const prior = replacements.get(binding.oldHash);
    if (prior && prior !== next) return { ok: false, evidence: [binding.oldHash, prior, next] };
    replacements.set(binding.oldHash, next);
  }
  for (const [oldHash, nextHash] of replacements) {
    const expectedCount = bindings.filter((binding) => binding.oldHash === oldHash).length;
    const actualCount = text.split(oldHash).length - 1;
    if (actualCount !== expectedCount) return { ok: false, evidence: [oldHash, `expected:${String(expectedCount)}`, `actual:${String(actualCount)}`] };
    text = text.split(oldHash).join(nextHash);
  }
  return { ok: true, bytes: Buffer.from(text, "utf8") };
}

function validateDeterminedAuthority(relativePath: string, bytes: Uint8Array): Uint8Array | undefined {
  const text = Buffer.from(bytes).toString("utf8");
  try {
    if (relativePath === STATE_PATH) {
      const value = parseYamlDocument(text) as unknown;
      return RunStateSchema.safeParse(value).success || CaseStateSchema.safeParse(value).success ? bytes : undefined;
    }
    if (relativePath === REGISTRY_PATH) {
      const value = JSON.parse(text) as unknown;
      return ArtifactRegistrySchema.safeParse(value).success ? bytes : undefined;
    }
    if (relativePath === GATE_LEDGER_PATH) {
      for (const line of text.split(/\r?\n/).filter((item) => item.trim())) JSON.parse(line);
      return bytes;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function validAuthority(observation: RawRuntimeObservation, relativePath: string): RawRuntimeFile | undefined {
  const observed = observation.authority.get(relativePath);
  return observed?.kind === "file" && !observed.parseCode && !observed.schemaIssues ? observed : undefined;
}

function artifactReceiptMatches(
  artifact: Record<string, unknown>,
  receipt: Record<string, unknown> | undefined,
): boolean {
  const related = Array.isArray(artifact.related_artifact_ids)
    ? artifact.related_artifact_ids
    : [];
  if (!receipt) return false;
  return receipt.receipt_artifact_id === artifact.artifact_id
    && related.length === 1
    && asRecord(receipt.artifact).artifact_id === related[0];
}

function registryReceiptPath(
  observation: Pick<RawRuntimeObservation, "workspace" | "runtimeMode">,
  registryPath: string,
): string | undefined {
  const resolved = resolveRegisteredArtifactPath(observation, registryPath);
  if (!resolved.contained || !isPathContained(observation.workspace, resolved.absolutePath)) return undefined;
  return toPosixPath(path.relative(observation.workspace, resolved.absolutePath));
}

function finding(input: {
  disposition: DoctorFinding["disposition"];
  scope: string;
  code: string;
  affectedPaths: string[];
  evidenceRefs: string[];
  retrySelector?: string | null;
  repairAvailable?: boolean;
}): DoctorFinding {
  const identity = {
    disposition: input.disposition,
    scope: input.scope,
    code: input.code,
    affected_paths: [...new Set(input.affectedPaths)].sort(compareText),
    evidence_refs: [...new Set(input.evidenceRefs)].sort(compareText),
  };
  return DoctorFindingSchema.parse({
    finding_id: `finding-${sha256(`${JSON.stringify(identity)}\n`).slice(0, 24)}`,
    ...identity,
    retry_selector: input.retrySelector ?? null,
    repair_available: input.repairAvailable ?? false,
  });
}

function deduplicateFindings(findings: DoctorFinding[]): DoctorFinding[] {
  return [...new Map(findings.map((item) => [item.finding_id, item])).values()]
    .sort((left, right) => compareText(`${left.scope}:${left.code}`, `${right.scope}:${right.code}`));
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
