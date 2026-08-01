import path from "node:path";
import { readFile } from "node:fs/promises";

import { fileExists, isDirectory } from "../../utils/fs.js";
import { inspectArtifacts } from "../runtime/legacy-workflow-control.js";
import { SubflowStartReceiptSchema } from "../contracts/subflow.js";
import { GateSubmitReceiptSchema, TransitionAdvanceReceiptSchema } from "../contracts/gate-transition.js";
import { AdaptiveCaseReceiptSchema } from "../contracts/adaptive-runtime.js";
import { DraftPatchReceiptSchema } from "../contracts/draft-patch.js";
import { ContractChangeDecisionReceiptSchema, ContractChangeProposalReceiptSchema } from "../contracts/contract-change.js";
import { loadWorkspaceSnapshot } from "../workspace/snapshot.js";
import type { WorkspaceSnapshot } from "../workspace/snapshot.js";
import { REQUIRED_DIRECTORIES } from "../workspace/layout.js";
import { sha256 } from "../workspace/write-plan.js";
import type { CheckResult, CheckTarget, Diagnostic } from "./types.js";
import { filesForSkill, loadPluginRegistry, pluginSkillRoot, PluginRegistryError, resolveDomainSelection, type LoadedPluginRegistry } from "../../plugins/registry.js";
import { selectedPluginIds } from "../../plugins/status.js";
import { getTool } from "../../adapters/tools.js";
import { installationRecords, isDomainSkillInstallation } from "../../adapters/installations.js";
import { inspectLiteratureAdapters } from "../../literature-adapters/inspect.js";
import {
  adaptiveReceiptMatchesAuthority,
  gateReceiptMatchesAuthority,
  startReceiptMatchesAuthority,
  transitionReceiptMatchesAuthority,
} from "../runtime/runtime-receipt-integrity.js";
import { verifyAnnotationCoverage } from "../runtime/annotation-coverage.js";

export type { CheckResult, CheckTarget, Diagnostic } from "./types.js";

export async function runWorkspaceChecks(workspace: string, target: CheckTarget = "all", strict = false, providedPluginRegistry?: LoadedPluginRegistry): Promise<CheckResult> {
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
    const coverage = await verifyAnnotationCoverage(snapshot);
    diagnostics.push(...coverage.findings.map((finding): Diagnostic => ({
      severity: "error",
      code: finding.code,
      message: finding.message,
      ...(finding.path ? { path: finding.path } : {}),
      ...(finding.details === undefined ? {} : { details: finding.details }),
      blocking: true,
    })));
  }

  if (target === "all" || target === "runtime") diagnostics.push(...await inspectSubflowStartReceipts(snapshot), ...await inspectGateTransitionReceipts(snapshot), ...await inspectAdaptiveReceipts(snapshot));

  if (target === "all" || target === "tools") {
    const installations = installationRecords(snapshot.manifest.installations).filter((item) => item.owner === "agent-tool" && item.source.kind !== "literature-adapter");
    for (const item of installations) {
      const targetPath = item.target.scope === "shared-global" ? item.target.path : path.resolve(path.dirname(workspace), item.target.path);
      if (!(await fileExists(targetPath))) diagnostics.push({ severity: "warning", code: "generated_file_missing", message: "Manifest-owned generated file is missing.", path: targetPath, blocking: false });
      else if (sha256(await readFile(targetPath)) !== item.sha256) diagnostics.push({ severity: "warning", code: "generated_file_drift", message: "Manifest-owned generated file has changed.", path: targetPath, blocking: false });
    }
  }

  if (target === "all" || target === "plugins") diagnostics.push(...await inspectPlugins(snapshot, providedPluginRegistry));
  if (target === "all" || target === "literature-adapters") diagnostics.push(...(await inspectLiteratureAdapters(snapshot)).diagnostics);

  diagnostics.push(...validateCrossReferences(snapshot, target));

  const ok = diagnostics.every((diagnostic) => !diagnostic.blocking && (!strict || diagnostic.severity !== "warning"));
  return { ok, workspace, target, diagnostics };
}

async function inspectPlugins(snapshot: WorkspaceSnapshot, provided?: LoadedPluginRegistry): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];
  let loaded: LoadedPluginRegistry;
  try { loaded = provided ?? await loadPluginRegistry(); }
  catch (error) {
    if (error instanceof PluginRegistryError) return error.diagnostics;
    return [{ severity: "error", code: "plugin_registry_unreadable", message: error instanceof Error ? error.message : String(error), blocking: true }];
  }
  const selected = selectedPluginIds(snapshot.config);
  diagnostics.push(...loaded.diagnostics);
  const configuredTools = stringArray(record(snapshot.config.agent_tools).selected);
  const manifest = installationRecords(snapshot.manifest.installations).filter(isDomainSkillInstallation);
  const manifestByPath = new Map(manifest.filter((item) => item.target.scope === "project").map((item) => [item.target.path, item]));
  const resolution = resolveDomainSelection(loaded, selected);
  for (const domainId of resolution.unavailableDomainIds) diagnostics.push({ severity: "warning", code: "plugin_unavailable", message: `Selected domain is unavailable in this ResearchSpec package: ${domainId}`, path: path.join(snapshot.workspace, "config.yaml"), blocking: false, details: { domain_id: domainId } });
  if (!configuredTools.length) {
    for (const domainId of resolution.availableDomainIds) diagnostics.push({ severity: "info", code: "plugin_projection_deferred", message: `Domain ${domainId} is selected but no Agent tool is configured.`, path: path.join(snapshot.workspace, "config.yaml"), blocking: false, details: { domain_id: domainId } });
    return diagnostics;
  }
  for (const toolId of configuredTools) {
      const tool = getTool(toolId);
      if (!tool) continue;
      for (const registered of resolution.skills) {
        const skill = registered.definition;
        const vendor = registered.vendor;
        const sourceRoot = pluginSkillRoot(loaded.root, vendor.vendor_id, skill.skill_id);
        for (const relativeAsset of filesForSkill(loaded, skill.skill_id)) {
          const targetPath = path.join(path.dirname(snapshot.workspace), tool.skillsDir, "skills", skill.skill_id, relativeAsset);
          const relativeTarget = path.relative(path.dirname(snapshot.workspace), targetPath).split(path.sep).join("/");
          const owned = manifestByPath.get(relativeTarget);
          if (!owned || owned.source.vendor_id !== vendor.vendor_id || owned.source.vendor_release !== vendor.release || owned.source.skill_id !== skill.skill_id) {
            diagnostics.push({ severity: "warning", code: "plugin_projection_missing", message: "Resolved domain Skill resource is not owned by the installation manifest.", path: targetPath, blocking: false, details: { vendor_id: vendor.vendor_id, skill_id: skill.skill_id, tool_id: toolId, source: path.join(sourceRoot, relativeAsset) } });
            continue;
          }
          if (!(await fileExists(targetPath))) diagnostics.push({ severity: "warning", code: "plugin_file_missing", message: "Manifest-owned domain Skill resource is missing.", path: targetPath, blocking: false, details: { vendor_id: vendor.vendor_id, skill_id: skill.skill_id, tool_id: toolId } });
          else if (sha256(await readFile(targetPath)) !== owned.sha256) diagnostics.push({ severity: "warning", code: "plugin_file_drift", message: "Manifest-owned domain Skill resource has changed.", path: targetPath, blocking: false, details: { vendor_id: vendor.vendor_id, skill_id: skill.skill_id, tool_id: toolId } });
        }
      }
  }
  return diagnostics;
}

async function inspectGateTransitionReceipts(snapshot: WorkspaceSnapshot): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];
  for (const event of snapshot.gates.filter((item) => item.schema_version === "1")) {
    const reference = record(event.receipt);
    const receiptPath = path.resolve(snapshot.workspace, typeof reference.path === "string" ? reference.path : "");
    try {
      const bytes = await readFile(receiptPath);
      const receipt = GateSubmitReceiptSchema.safeParse(JSON.parse(Buffer.from(bytes).toString("utf8")) as unknown);
      if (!receipt.success || sha256(bytes) !== reference.sha256 || !gateReceiptMatchesAuthority(event, reference, receipt.data)) diagnostics.push(dangling("gate_submit_receipt_mismatch", `Gate receipt does not match event ${String(event.event_id)}.`, receiptPath));
    } catch { diagnostics.push(dangling("gate_submit_receipt_missing", `Gate receipt is missing or invalid for ${String(event.event_id)}.`, receiptPath)); }
  }
  if (!snapshot.runState) return diagnostics;
  for (const instance of snapshot.runState.subflows) for (const reference of instance.transition_receipts) {
    const receiptPath = path.resolve(snapshot.workspace, reference.path);
    try {
      const bytes = await readFile(receiptPath);
      const receipt = TransitionAdvanceReceiptSchema.safeParse(JSON.parse(Buffer.from(bytes).toString("utf8")) as unknown);
      if (!receipt.success || sha256(bytes) !== reference.sha256 || !transitionReceiptMatchesAuthority(instance, reference, receipt.data)) diagnostics.push(dangling("transition_receipt_mismatch", `Transition receipt does not match state for ${reference.transition_id}.`, receiptPath));
    } catch { diagnostics.push(dangling("transition_receipt_missing", `Transition receipt is missing or invalid for ${reference.transition_id}.`, receiptPath)); }
  }
  return diagnostics;
}

async function inspectSubflowStartReceipts(snapshot: WorkspaceSnapshot): Promise<Diagnostic[]> {
  if (!snapshot.runState) return [];
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
      if (!receipt.success || !startReceiptMatchesAuthority(instance, receipt.data)) diagnostics.push(dangling("subflow_start_receipt_mismatch", `Start receipt does not match state for ${instance.instance_id}.`, receiptPath));
    } catch {
      diagnostics.push(dangling("subflow_start_receipt_missing", `Start receipt is missing or invalid for ${instance.instance_id}.`, receiptPath));
    }
  }
  return diagnostics;
}

async function inspectAdaptiveReceipts(snapshot: WorkspaceSnapshot): Promise<Diagnostic[]> {
  if (!snapshot.caseState) return [];
  const diagnostics: Diagnostic[] = [];
  for (const reference of snapshot.caseState.receipts) {
    const receiptPath = path.resolve(snapshot.workspace, reference.path);
    if (!(receiptPath === snapshot.workspace || receiptPath.startsWith(`${snapshot.workspace}${path.sep}`))) {
      diagnostics.push(dangling("adaptive_receipt_escape", `Adaptive receipt escapes the workspace: ${reference.path}`, path.join(snapshot.workspace, "runs/current/state.yaml")));
      continue;
    }
    try {
      const bytes = await readFile(receiptPath);
      const value = JSON.parse(Buffer.from(bytes).toString("utf8")) as unknown;
      const receipt = reference.receipt_type === "gate_submit"
        ? GateSubmitReceiptSchema.safeParse(value)
        : reference.receipt_type.startsWith("draft_patch_")
          ? DraftPatchReceiptSchema.safeParse(value)
          : reference.receipt_type === "contract_change_proposal"
            ? ContractChangeProposalReceiptSchema.safeParse(value)
            : reference.receipt_type === "contract_change_decision"
              ? ContractChangeDecisionReceiptSchema.safeParse(value)
            : AdaptiveCaseReceiptSchema.safeParse(value);
      const parsedReceipt = receipt.success ? record(receipt.data) : undefined;
      if (
        !receipt.success
        || sha256(bytes) !== reference.sha256
        || !adaptiveReceiptMatchesAuthority(reference, reference.receipt_type, parsedReceipt)
      ) {
        diagnostics.push(dangling("adaptive_receipt_mismatch", `Adaptive receipt does not match state reference ${reference.receipt_id}.`, receiptPath));
      }
    } catch {
      diagnostics.push(dangling("adaptive_receipt_missing", `Adaptive receipt is missing or invalid for ${reference.receipt_id}.`, receiptPath));
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
    addDuplicateDiagnostics(diagnostics, snapshot.attempts, "attempt_id", "duplicate_attempt_id", "runs/current/attempt-ledger.jsonl", snapshot.workspace);
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
  if (target === "artifacts") {
    return relative === "runs/current/artifact-registry.json"
      || diagnostic.code.startsWith("artifact_")
      || diagnostic.code.startsWith("annotation_");
  }
  if (target === "tools") return relative === "config.yaml" || relative === "tool-installation-manifest.json" || diagnostic.code.startsWith("generated_file_");
  if (target === "plugins") return relative === "config.yaml" || relative === "tool-installation-manifest.json" || diagnostic.code.startsWith("plugin_");
  if (target === "literature-adapters") return relative === "tool-installation-manifest.json" || diagnostic.code.startsWith("literature_adapter_");
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
