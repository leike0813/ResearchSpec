import { readFile } from "node:fs/promises";
import path from "node:path";
import { stringify } from "yaml";

import {
  ARSU_ADAPTIVE_PLAYBOOK,
  createArsuAdaptiveProfile,
} from "../../arsu-converter/workflow/catalog.js";
import {
  RuntimeMigrationPlanSchema,
  RuntimeMigrationReceiptSchema,
  RuntimeMigrationRollbackPlanSchema,
  RuntimeMigrationRollbackReceiptSchema,
  type RuntimeMigrationBackupEntry,
  type RuntimeMigrationFinding,
  type RuntimeMigrationPlan,
  type RuntimeMigrationProjectedObligation,
  type RuntimeMigrationReceipt,
  type RuntimeMigrationRollbackPlan,
  type RuntimeMigrationRollbackReceipt,
} from "../contracts/runtime-migration.js";
import {
  CaseStateSchema,
  type CaseState,
  type FormalDecisionReference,
  type FormalGateReference,
  type HardObligation,
} from "../contracts/case-state.js";
import { evaluateWorkflowControl, type WorkflowControlResult } from "./workflow-control.js";
import { projectStrictCompatibility } from "./strict-compatibility.js";
import { loadWorkspaceSnapshot, type SnapshotFile, type WorkspaceSnapshot } from "../workspace/snapshot.js";
import {
  executeWritePlan,
  planFile,
  sha256,
  type PlannedWrite,
  type ReadPrecondition,
  type WritePlan,
} from "../workspace/write-plan.js";
import {
  isPathContained,
  resolveRegisteredArtifactPath,
  serializeRegisteredArtifactPath,
} from "./artifact-path.js";

const CONFIG_PATH = "config.yaml";
const WORKFLOW_PATH = "specs/workflow.yaml";
const STATE_PATH = "runs/current/state.yaml";
const REGISTRY_PATH = "runs/current/artifact-registry.json";
const GATE_LEDGER_PATH = "runs/current/gate-ledger.jsonl";
const DECISION_LEDGER_PATH = "runs/current/decision-ledger.jsonl";
const PLAYBOOK_PATH = "playbooks/arsu-adaptive.yaml";
const ATTEMPT_LEDGER_PATH = "runs/current/attempt-ledger.jsonl";
const BASIS_PATHS = [
  CONFIG_PATH,
  WORKFLOW_PATH,
  STATE_PATH,
  REGISTRY_PATH,
  GATE_LEDGER_PATH,
  DECISION_LEDGER_PATH,
] as const;

export class RuntimeMigrationError extends Error {
  constructor(
    readonly code:
      | "migration_source_invalid"
      | "migration_not_executable"
      | "migration_conflict"
      | "migration_postcheck_failed"
      | "migration_receipt_missing"
      | "migration_rollback_blocked",
    message: string,
    readonly kind: "domain" | "conflict" = "domain",
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export interface PreparedRuntimeMigration {
  snapshot: WorkspaceSnapshot;
  plan: RuntimeMigrationPlan;
  targetContents: Readonly<Record<string, string>>;
  writePlan: WritePlan;
  createdPaths: string[];
}

export interface PreparedRuntimeMigrationRollback {
  snapshot: WorkspaceSnapshot;
  migrationReceipt: RuntimeMigrationReceipt;
  plan: RuntimeMigrationRollbackPlan;
  writePlan: WritePlan;
}

export interface RuntimeMigrationExecution {
  plan: RuntimeMigrationPlan;
  receipt: RuntimeMigrationReceipt;
  receiptPath: string;
  receiptSha256: string;
}

export interface RuntimeMigrationRollbackExecution {
  plan: RuntimeMigrationRollbackPlan;
  receipt: RuntimeMigrationRollbackReceipt;
  receiptPath: string;
  receiptSha256: string;
}

export async function planRuntimeMigration(
  snapshot: WorkspaceSnapshot,
  providedControl?: WorkflowControlResult,
): Promise<PreparedRuntimeMigration> {
  if (snapshot.runtimeMode !== "strict" || !snapshot.runState || !snapshot.workflow || snapshot.runState.schema_version !== "0.2") {
    throw new RuntimeMigrationError("migration_source_invalid", "Runtime migration requires one valid Schema 0.2 strict workspace.");
  }

  const requiredFiles = BASIS_PATHS.map((relativePath) => requireSnapshotFile(snapshot, relativePath));
  const sourceHashes = Object.fromEntries(requiredFiles.map((file) => [file.relativePath, file.hash]));
  const control = providedControl ?? await evaluateWorkflowControl(snapshot);
  const compatibility = projectStrictCompatibility({
    runState: snapshot.runState,
    workflow: snapshot.workflow,
    control,
    sourceHashes: {
      workflow: sourceHashes[WORKFLOW_PATH] ?? "",
      state: sourceHashes[STATE_PATH] ?? "",
      registry: sourceHashes[REGISTRY_PATH] ?? "",
      gate_ledger: sourceHashes[GATE_LEDGER_PATH] ?? "",
      decision_ledger: sourceHashes[DECISION_LEDGER_PATH] ?? "",
      config: sourceHashes[CONFIG_PATH] ?? "",
    },
  });

  const playbookText = stringify(ARSU_ADAPTIVE_PLAYBOOK);
  const profile = createArsuAdaptiveProfile(sha256(playbookText));
  const projection = projectCaseState(snapshot, control, profile);
  const findings: RuntimeMigrationFinding[] = [
    ...projection.findings,
    ...snapshot.diagnostics.filter((item) => item.blocking).map((item, index) => ({
      finding_id: `migration-diagnostic-${String(index + 1)}`,
      code: safeCode(item.code),
      scope: item.path ?? "workspace",
      detail: item.message,
      blocking: true,
    })),
  ];
  if (!control.configured || !control.valid) {
    findings.push({
      finding_id: "migration-workflow-control-invalid",
      code: "workflow_control_invalid",
      scope: "runtime:current",
      detail: "The Schema 0.2 workflow evaluator did not produce a valid configured control result.",
      blocking: true,
    });
  }

  const stateText = stringify(projection.state);
  const workflowText = stringify(profile);
  const configText = stringify({ ...snapshot.config, profile: "adaptive" });
  const targetContents: Record<string, string> = {
    [CONFIG_PATH]: configText,
    [WORKFLOW_PATH]: workflowText,
    [STATE_PATH]: stateText,
    [PLAYBOOK_PATH]: playbookText,
    [ATTEMPT_LEDGER_PATH]: "",
  };

  const optionalFindings = optionalTargetFindings(snapshot, targetContents);
  findings.push(...optionalFindings);
  const sourceIdentity = sha256(`${JSON.stringify({
    source_hashes: sourceHashes,
    projected_obligations: projection.projectedObligations,
    retained_strict_policies: retainedStrictPolicies(compatibility),
  })}\n`);
  const migrationId = `migration-${sourceIdentity.slice(0, 20)}`;
  const backupEntries = [CONFIG_PATH, WORKFLOW_PATH, STATE_PATH].map((relativePath) => {
    const file = requireSnapshotFile(snapshot, relativePath);
    return {
      source_path: relativePath,
      backup_path: `runs/current/migrations/${migrationId}/backup/${backupName(relativePath)}-${file.hash}.original`,
      sha256: file.hash,
      mode: file.mode,
    };
  });
  const receiptPath = `runs/current/migrations/${migrationId}/receipt.json`;
  const createdPaths = [PLAYBOOK_PATH, ATTEMPT_LEDGER_PATH].filter((relativePath) => !snapshot.files.has(relativePath));
  const targetEntries = Object.entries(targetContents).map(([relativePath, content]) => ({
    path: relativePath,
    action: snapshot.files.has(relativePath) ? "refresh" as const : "create" as const,
    sha256: sha256(content),
  }));
  const readPreconditions = requiredFiles.map((file) => ({
    path: file.relativePath,
    sha256: file.hash,
  }));
  const retainedPolicies = retainedStrictPolicies(compatibility);
  const operations: PlannedWrite[] = [];
  for (const entry of backupEntries) {
    const source = requireSnapshotFile(snapshot, entry.source_path);
    const operation = await planFile({
      path: path.join(snapshot.workspace, entry.backup_path),
      relativePath: entry.backup_path,
      content: source.bytes,
      scope: "workspace",
      ownership: "user",
      mode: source.mode,
    });
    if (operation.action === "conflict") findings.push(conflictFinding("migration_backup_conflict", entry.backup_path));
    operations.push(operation);
  }
  for (const relativePath of [PLAYBOOK_PATH, ATTEMPT_LEDGER_PATH, WORKFLOW_PATH, CONFIG_PATH, STATE_PATH]) {
    operations.push(targetOperation(snapshot, relativePath, targetContents[relativePath] ?? ""));
  }
  const unsigned = {
    schema_version: "1" as const,
    migration_id: migrationId,
    source_schema_version: "0.2" as const,
    target_mode: "adaptive" as const,
    read_preconditions: readPreconditions,
    compatibility_findings: findings,
    projected_obligations: projection.projectedObligations,
    retained_strict_policies: retainedPolicies,
    backup_entries: backupEntries,
    target_entries: targetEntries,
    receipt_path: receiptPath,
    executable: !findings.some((item) => item.blocking),
  };
  const plan = RuntimeMigrationPlanSchema.parse({
    ...unsigned,
    plan_sha256: sha256(`${JSON.stringify(unsigned)}\n`),
  });

  return {
    snapshot,
    plan,
    targetContents,
    writePlan: {
      operations,
      readPreconditions: absolutePreconditions(snapshot, readPreconditions),
    },
    createdPaths,
  };
}

export async function executeRuntimeMigration(
  prepared: PreparedRuntimeMigration,
  now = new Date().toISOString(),
): Promise<RuntimeMigrationExecution> {
  if (!prepared.plan.executable) {
    throw new RuntimeMigrationError("migration_not_executable", "Runtime migration has blocking compatibility findings.", "domain", {
      findings: prepared.plan.compatibility_findings.filter((item) => item.blocking),
    });
  }
  const sourceHashes = Object.fromEntries(prepared.plan.backup_entries.map((entry) => [entry.source_path, entry.sha256]));
  const targetHashes = Object.fromEntries(prepared.plan.target_entries.flatMap((entry) => entry.sha256 ? [[entry.path, entry.sha256]] : []));
  const receipt = RuntimeMigrationReceiptSchema.parse({
    schema_version: "1",
    receipt_type: "runtime_migration",
    migration_id: prepared.plan.migration_id,
    plan_sha256: prepared.plan.plan_sha256,
    source_schema_version: "0.2",
    target_mode: "adaptive",
    source_hashes: sourceHashes,
    target_hashes: targetHashes,
    backup_entries: prepared.plan.backup_entries,
    created_paths: prepared.createdPaths,
    committed_at: now,
  });
  const receiptText = `${JSON.stringify(receipt, null, 2)}\n`;
  const receiptOperation = await planFile({
    path: path.join(prepared.snapshot.workspace, prepared.plan.receipt_path),
    relativePath: prepared.plan.receipt_path,
    content: receiptText,
    scope: "workspace",
    ownership: "user",
  });
  if (receiptOperation.action === "conflict") {
    throw new RuntimeMigrationError("migration_conflict", "Runtime migration receipt path conflicts with existing bytes.", "conflict");
  }
  const authority = prepared.writePlan.operations.at(-1);
  if (!authority || authority.relativePath !== STATE_PATH) throw new RuntimeMigrationError("migration_conflict", "Runtime migration authority operation is unavailable.", "conflict");
  const operations = [...prepared.writePlan.operations.slice(0, -1), receiptOperation, authority];

  try {
    await executeWritePlan(
      { operations, readPreconditions: prepared.writePlan.readPreconditions },
      {
        validateCommittedState: async () => {
          const after = await loadWorkspaceSnapshot(prepared.snapshot.workspace);
          if (after.runtimeMode !== "adaptive" || !after.caseProfile || !after.caseState || after.diagnostics.some((item) => item.blocking)) {
            throw new RuntimeMigrationError("migration_postcheck_failed", "Migrated workspace failed adaptive runtime validation.");
          }
          await assertHashes(prepared.snapshot.workspace, targetHashes);
        },
      },
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT") {
      throw new RuntimeMigrationError("migration_conflict", "Runtime migration basis changed; obtain a new dry-run plan.", "conflict");
    }
    throw error;
  }
  return {
    plan: prepared.plan,
    receipt,
    receiptPath: prepared.plan.receipt_path,
    receiptSha256: sha256(receiptText),
  };
}

export async function planRuntimeMigrationRollback(
  snapshot: WorkspaceSnapshot,
  migrationId: string,
): Promise<PreparedRuntimeMigrationRollback> {
  const receiptPath = `runs/current/migrations/${migrationId}/receipt.json`;
  let receipt: RuntimeMigrationReceipt;
  try {
    receipt = RuntimeMigrationReceiptSchema.parse(JSON.parse(await readFile(path.join(snapshot.workspace, receiptPath), "utf8")) as unknown);
  } catch (error) {
    throw new RuntimeMigrationError("migration_receipt_missing", `Runtime migration receipt is unavailable or invalid: ${migrationId}`, "domain", error);
  }
  if (receipt.migration_id !== migrationId || snapshot.runtimeMode !== "adaptive") {
    throw new RuntimeMigrationError("migration_rollback_blocked", "Runtime rollback requires the adaptive workspace produced by the selected migration.");
  }

  const findings: RuntimeMigrationFinding[] = [];
  for (const [relativePath, expectedHash] of Object.entries(receipt.target_hashes)) {
    const file = snapshot.files.get(relativePath);
    if (!file || file.hash !== expectedHash) findings.push(conflictFinding("migration_target_drift", relativePath));
  }
  for (const entry of receipt.backup_entries) {
    try {
      const bytes = await readFile(path.join(snapshot.workspace, entry.backup_path));
      if (sha256(bytes) !== entry.sha256) findings.push(conflictFinding("migration_backup_drift", entry.backup_path));
    } catch {
      findings.push(conflictFinding("migration_backup_missing", entry.backup_path));
    }
  }

  const rollbackIdentity = sha256(`${JSON.stringify({
    migration_id: migrationId,
    target_hashes: receipt.target_hashes,
    backups: receipt.backup_entries,
    created_paths: receipt.created_paths,
  })}\n`);
  const rollbackId = `rollback-${rollbackIdentity.slice(0, 20)}`;
  const rollbackReceiptPath = `runs/current/migrations/${migrationId}/${rollbackId}.json`;
  const readPreconditions = [
    ...Object.entries(receipt.target_hashes).map(([relativePath, expectedHash]) => ({ path: relativePath, sha256: expectedHash })),
    ...receipt.backup_entries.map((entry) => ({ path: entry.backup_path, sha256: entry.sha256 })),
  ];
  const unsigned = {
    schema_version: "1" as const,
    rollback_id: rollbackId,
    migration_id: migrationId,
    read_preconditions: readPreconditions,
    restore_entries: receipt.backup_entries,
    remove_paths: receipt.created_paths,
    receipt_path: rollbackReceiptPath,
    executable: findings.length === 0,
  };
  const plan = RuntimeMigrationRollbackPlanSchema.parse({
    ...unsigned,
    plan_sha256: sha256(`${JSON.stringify(unsigned)}\n`),
  });
  const stateEntry = receipt.backup_entries.find((entry) => entry.source_path === STATE_PATH);
  if (!stateEntry) throw new RuntimeMigrationError("migration_rollback_blocked", "Migration backup has no state authority.");
  const nonStateEntries = receipt.backup_entries.filter((entry) => entry.source_path !== STATE_PATH);
  const operations: PlannedWrite[] = [];
  for (const entry of nonStateEntries) operations.push(await restoreOperation(snapshot, entry));
  for (const relativePath of receipt.created_paths) {
    const file = snapshot.files.get(relativePath);
    if (!file) {
      findings.push(conflictFinding("migration_target_missing", relativePath));
      continue;
    }
    operations.push({
      action: "remove-owned",
      path: file.absolutePath,
      relativePath,
      scope: "workspace",
      ownership: "user",
      previousHash: file.hash,
      previousMode: file.mode,
      reason: "remove migration-created adaptive file during rollback",
    });
  }
  operations.push(await restoreOperation(snapshot, stateEntry));
  return {
    snapshot,
    migrationReceipt: receipt,
    plan: findings.length === 0 ? plan : RuntimeMigrationRollbackPlanSchema.parse({ ...plan, executable: false }),
    writePlan: { operations, readPreconditions: absolutePreconditions(snapshot, readPreconditions) },
  };
}

export async function executeRuntimeMigrationRollback(
  prepared: PreparedRuntimeMigrationRollback,
  now = new Date().toISOString(),
): Promise<RuntimeMigrationRollbackExecution> {
  if (!prepared.plan.executable) {
    throw new RuntimeMigrationError("migration_rollback_blocked", "Runtime rollback basis has drifted; no files were changed.", "conflict");
  }
  const restoredHashes = Object.fromEntries(prepared.plan.restore_entries.map((entry) => [entry.source_path, entry.sha256]));
  const receipt = RuntimeMigrationRollbackReceiptSchema.parse({
    schema_version: "1",
    receipt_type: "runtime_migration_rollback",
    rollback_id: prepared.plan.rollback_id,
    migration_id: prepared.plan.migration_id,
    plan_sha256: prepared.plan.plan_sha256,
    restored_hashes: restoredHashes,
    removed_paths: prepared.plan.remove_paths,
    rolled_back_at: now,
  });
  const receiptText = `${JSON.stringify(receipt, null, 2)}\n`;
  const receiptOperation = await planFile({
    path: path.join(prepared.snapshot.workspace, prepared.plan.receipt_path),
    relativePath: prepared.plan.receipt_path,
    content: receiptText,
    scope: "workspace",
    ownership: "user",
  });
  if (receiptOperation.action === "conflict") throw new RuntimeMigrationError("migration_rollback_blocked", "Rollback receipt path conflicts.", "conflict");
  const stateAuthority = prepared.writePlan.operations.at(-1);
  if (!stateAuthority || stateAuthority.relativePath !== STATE_PATH) throw new RuntimeMigrationError("migration_rollback_blocked", "Rollback state authority is unavailable.", "conflict");
  try {
    await executeWritePlan(
      {
        operations: [...prepared.writePlan.operations.slice(0, -1), receiptOperation, stateAuthority],
        readPreconditions: prepared.writePlan.readPreconditions,
      },
      {
        validateCommittedState: async () => {
          const after = await loadWorkspaceSnapshot(prepared.snapshot.workspace);
          if (after.runtimeMode !== "strict" || !after.workflow || !after.runState || after.diagnostics.some((item) => item.blocking)) {
            throw new RuntimeMigrationError("migration_postcheck_failed", "Rolled-back workspace failed strict runtime validation.");
          }
          await assertHashes(prepared.snapshot.workspace, restoredHashes);
        },
      },
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT") {
      throw new RuntimeMigrationError("migration_rollback_blocked", "Runtime rollback basis changed; obtain a new dry-run plan.", "conflict");
    }
    throw error;
  }
  return {
    plan: prepared.plan,
    receipt,
    receiptPath: prepared.plan.receipt_path,
    receiptSha256: sha256(receiptText),
  };
}

function projectCaseState(
  snapshot: WorkspaceSnapshot,
  control: WorkflowControlResult,
  profile: ReturnType<typeof createArsuAdaptiveProfile>,
): {
  state: CaseState;
  findings: RuntimeMigrationFinding[];
  projectedObligations: RuntimeMigrationProjectedObligation[];
} {
  if (!snapshot.runState) throw new RuntimeMigrationError("migration_source_invalid", "Schema 0.2 state is unavailable.");
  const findings: RuntimeMigrationFinding[] = [];
  const obligations: HardObligation[] = [];
  const acceptedEvidence: CaseState["accepted_evidence"] = [];
  const projectedObligations: RuntimeMigrationProjectedObligation[] = [];
  const formalGateRefs = formalGateReferences(control);
  const formalDecisionRefs = formalDecisionReferences(snapshot);

  for (const subflow of snapshot.runState.subflows) {
    if (!subflow.route_ref) {
      findings.push({
        finding_id: `migration-internal-${sha256(subflow.instance_id).slice(0, 12)}`,
        code: subflow.status === "complete" || subflow.status === "cancelled" ? "internal_strict_subflow_retained" : "internal_strict_subflow_active",
        scope: `subflow:${subflow.instance_id}`,
        detail: "Internal strict-only subflow state is retained in the migration receipt and has no adaptive route authority.",
        blocking: subflow.status !== "complete" && subflow.status !== "cancelled",
      });
      continue;
    }
    const route = profile.routes.find((item) => item.route_ref === subflow.route_ref);
    if (!route) {
      findings.push({
        finding_id: `migration-route-${sha256(subflow.route_ref).slice(0, 12)}`,
        code: "adaptive_route_missing",
        scope: `subflow:${subflow.instance_id}`,
        detail: `No adaptive route matches ${subflow.route_ref}.`,
        blocking: true,
      });
      continue;
    }
    const definitions = route.obligation_ids.map((id) => profile.obligations.find((item) => item.obligation_id === id));
    if (definitions.some((item) => !item)) {
      findings.push({
        finding_id: `migration-obligations-${sha256(subflow.instance_id).slice(0, 12)}`,
        code: "adaptive_obligation_definition_missing",
        scope: `subflow:${subflow.instance_id}`,
        detail: `Adaptive obligation definitions are incomplete for ${subflow.route_ref}.`,
        blocking: true,
      });
      continue;
    }
    const suffix = sha256(subflow.instance_id).slice(0, 8);
    const runtimeIds = new Map(definitions.map((definition) => [definition?.obligation_id ?? "", `${definition?.obligation_id ?? "missing"}-${suffix}`]));
    for (const definition of definitions) {
      if (!definition) continue;
      const runtimeId = runtimeIds.get(definition.obligation_id);
      if (!runtimeId) continue;
      const statuses = control.work_items.filter((item) => {
        const artifactId = item.artifact_id;
        return item.instance_id === subflow.instance_id
          && item.state === "done"
          && typeof artifactId === "string"
          && definition.required_evidence_types.some((type) => artifactById(snapshot, artifactId)?.artifact_type === type);
      });
      const status = statuses[statuses.length - 1];
      const artifact = status?.artifact_id ? artifactById(snapshot, status.artifact_id) : undefined;
      const receiptArtifact = artifact && typeof artifact.submit_receipt_artifact_id === "string"
        ? artifactById(snapshot, artifact.submit_receipt_artifact_id)
        : undefined;
      const trusted = artifact && receiptArtifact
        && typeof artifact.artifact_id === "string"
        && typeof artifact.artifact_type === "string"
        && typeof artifact.path === "string"
        && typeof artifact.sha256 === "string"
        && typeof artifact.created_at === "string"
        && typeof receiptArtifact.path === "string"
        && typeof receiptArtifact.sha256 === "string";
      const evidenceId = trusted ? `${String(artifact.artifact_id)}-legacy` : undefined;
      if (trusted && evidenceId) {
        acceptedEvidence.push({
          evidence_id: evidenceId,
          obligation_id: runtimeId,
          artifact_id: String(artifact.artifact_id),
          artifact_type: String(artifact.artifact_type),
          path: workspaceRelativeArtifactPath(snapshot, String(artifact.path)),
          sha256: String(artifact.sha256),
          accepted_at: String(artifact.created_at),
          acceptance_receipt: {
            path: workspaceRelativeArtifactPath(snapshot, String(receiptArtifact.path)),
            sha256: String(receiptArtifact.sha256),
          },
        });
      }
      const instanceGateRefs = control.gates
        .filter((gate) => gate.subflow_instance_id === subflow.instance_id && (gate.state === "passed" || gate.state === "overridden"))
        .map((gate) => gateReference(gate.selector, gate.latest_event_id));
      const obligation: HardObligation = {
        obligation_id: runtimeId,
        definition_id: definition.obligation_id,
        title: definition.title,
        scope: { run_id: snapshot.runState.run_id, subflow_instance_id: subflow.instance_id },
        owner: "researchspec-cli",
        status: trusted ? "satisfied" : subflow.status === "blocked" ? "blocked" : "unsatisfied",
        status_reason: trusted ? "Projected from trusted Schema 0.2 accepted artifact evidence." : null,
        policy_justification: definition.policy_justification,
        dependencies: definition.dependencies.map((dependency) => ({
          obligation_id: runtimeIds.get(dependency.obligation_id) ?? `${dependency.obligation_id}-${suffix}`,
          justification: dependency.justification,
        })),
        accepted_evidence_ids: evidenceId ? [evidenceId] : [],
        formal_gate_refs: instanceGateRefs,
        formal_decision_refs: [],
      };
      obligations.push(obligation);
      projectedObligations.push({
        obligation_id: runtimeId,
        definition_id: definition.obligation_id,
        subflow_instance_id: subflow.instance_id,
        strict_selector: status?.selector ?? null,
        status: obligation.status,
        accepted_artifact_id: trusted ? String(artifact.artifact_id) : null,
      });
    }
  }

  const completionEffects: CaseState["completion_effects"] = [
    ...snapshot.runState.subflows.filter((item) => item.status === "complete").map((item) => ({
      kind: "complete_subflow" as const,
      subflow_instance_id: item.instance_id,
    })),
    ...(snapshot.runState.status === "complete" ? [{ kind: "complete_run" as const }] : []),
  ];
  const receipts = snapshot.runState.subflows.flatMap((subflow) => [
    {
      receipt_id: `legacy-start-${sha256(subflow.start_receipt.path).slice(0, 16)}`,
      receipt_type: "subflow_start",
      path: subflow.start_receipt.path,
      sha256: subflow.start_receipt.sha256,
    },
    ...subflow.transition_receipts.map((receipt) => ({
      receipt_id: `legacy-transition-${sha256(receipt.path).slice(0, 16)}`,
      receipt_type: "transition_advance",
      path: receipt.path,
      sha256: receipt.sha256,
    })),
  ]);
  return {
    state: CaseStateSchema.parse({
      schema_version: "1",
      case_id: snapshot.runState.run_id,
      run_id: snapshot.runState.run_id,
      profile_mode: "adaptive",
      lifecycle: caseLifecycle(snapshot.runState.status),
      obligations,
      accepted_evidence: acceptedEvidence,
      formal_gate_refs: formalGateRefs,
      formal_decision_refs: formalDecisionRefs,
      case_actions: [],
      completion_effects: completionEffects,
      receipts,
      updated_at: snapshot.runState.updated_at,
    }),
    findings,
    projectedObligations,
  };
}

function retainedStrictPolicies(compatibility: ReturnType<typeof projectStrictCompatibility>): string[] {
  return [
    ...compatibility.strict_facts.parallel_groups.map((item) => `parallel:${item.selector}:${item.join_policy}`),
    ...compatibility.strict_facts.gates.map((item) => `gate:${item.selector}:${item.state}`),
    ...compatibility.strict_facts.transitions.map((item) => `transition:${item.selector}:${JSON.stringify(item.effects)}`),
  ].sort(compareText);
}

function formalGateReferences(control: WorkflowControlResult): FormalGateReference[] {
  return control.gates
    .filter((gate) => gate.state === "passed" || gate.state === "overridden")
    .map((gate) => gateReference(gate.selector, gate.latest_event_id));
}

function gateReference(selector: string, eventId?: string): FormalGateReference {
  return {
    gate_id: `legacy-gate-${sha256(selector).slice(0, 16)}`,
    event_id: eventId ?? null,
  };
}

function formalDecisionReferences(snapshot: WorkspaceSnapshot): FormalDecisionReference[] {
  const seen = new Set<string>();
  return snapshot.decisions.flatMap((event) => {
    if (event.status !== "accepted" || typeof event.decision_id !== "string" || typeof event.decision_type !== "string" || seen.has(event.decision_id)) return [];
    seen.add(event.decision_id);
    return [{ decision_id: event.decision_id, decision_type: event.decision_type }];
  });
}

function artifactById(snapshot: WorkspaceSnapshot, artifactId: string): Record<string, unknown> | undefined {
  return snapshot.artifacts.find((artifact) => artifact.artifact_id === artifactId);
}

function optionalTargetFindings(snapshot: WorkspaceSnapshot, targetContents: Readonly<Record<string, string>>): RuntimeMigrationFinding[] {
  return [PLAYBOOK_PATH, ATTEMPT_LEDGER_PATH].flatMap((relativePath) => {
    const file = snapshot.files.get(relativePath);
    if (!file || file.hash === sha256(targetContents[relativePath] ?? "")) return [];
    return [{
      finding_id: `migration-optional-${sha256(relativePath).slice(0, 12)}`,
      code: "adaptive_optional_file_drift",
      scope: relativePath,
      detail: "A pre-existing adaptive-only file differs from the canonical migration target.",
      blocking: true,
    }];
  });
}

function targetOperation(snapshot: WorkspaceSnapshot, relativePath: string, content: string): PlannedWrite {
  const file = snapshot.files.get(relativePath);
  if (!file) {
    return {
      action: "create",
      path: path.join(snapshot.workspace, relativePath),
      relativePath,
      content,
      scope: "workspace",
      ownership: "user",
      nextHash: sha256(content),
      reason: "create adaptive runtime migration target",
    };
  }
  const nextHash = sha256(content);
  return {
    action: file.hash === nextHash ? "skip-unchanged" : "refresh",
    path: file.absolutePath,
    relativePath,
    content,
    scope: "workspace",
    ownership: "user",
    previousHash: file.hash,
    nextHash,
    previousMode: file.mode,
    reason: "replace Schema 0.2 authority with adaptive migration target",
  };
}

async function restoreOperation(snapshot: WorkspaceSnapshot, entry: RuntimeMigrationBackupEntry): Promise<PlannedWrite> {
  const bytes = await readFile(path.join(snapshot.workspace, entry.backup_path));
  const current = snapshot.files.get(entry.source_path);
  if (!current) throw new RuntimeMigrationError("migration_rollback_blocked", `Rollback target is missing: ${entry.source_path}`, "conflict");
  return {
    action: "refresh",
    path: current.absolutePath,
    relativePath: entry.source_path,
    content: bytes,
    scope: "workspace",
    ownership: "user",
    previousHash: current.hash,
    nextHash: entry.sha256,
    previousMode: current.mode,
    nextMode: entry.mode,
    reason: "restore pre-migration runtime authority from durable backup",
  };
}

function absolutePreconditions(
  snapshot: WorkspaceSnapshot,
  preconditions: Array<{ path: string; sha256: string }>,
): ReadPrecondition[] {
  return preconditions.map((item) => ({
    path: path.join(snapshot.workspace, item.path),
    expectedHash: item.sha256,
    reason: `runtime migration basis ${item.path}`,
  }));
}

async function assertHashes(workspace: string, expected: Readonly<Record<string, string>>): Promise<void> {
  for (const [relativePath, expectedHash] of Object.entries(expected)) {
    const bytes = await readFile(path.join(workspace, relativePath));
    if (sha256(bytes) !== expectedHash) throw new RuntimeMigrationError("migration_postcheck_failed", `Runtime migration postcondition failed: ${relativePath}`);
  }
}

function requireSnapshotFile(snapshot: WorkspaceSnapshot, relativePath: string): SnapshotFile {
  const file = snapshot.files.get(relativePath);
  if (!file) throw new RuntimeMigrationError("migration_source_invalid", `Runtime migration source is missing: ${relativePath}`);
  return file;
}

function workspaceRelativeArtifactPath(snapshot: WorkspaceSnapshot, artifactPath: string): string {
  const source = resolveRegisteredArtifactPath(snapshot, artifactPath);
  if (!source.contained || !isPathContained(snapshot.workspace, source.absolutePath)) {
    throw new RuntimeMigrationError("migration_source_invalid", `Artifact path is outside the workspace: ${artifactPath}`);
  }
  return serializeRegisteredArtifactPath(
    { workspace: snapshot.workspace, runtimeMode: "adaptive" },
    source.absolutePath,
  );
}

function backupName(relativePath: string): string {
  return relativePath.replaceAll("/", "-").replaceAll(".", "-");
}

function conflictFinding(code: string, scope: string): RuntimeMigrationFinding {
  return {
    finding_id: `${safeCode(code)}-${sha256(scope).slice(0, 12)}`,
    code: safeCode(code),
    scope,
    detail: `Runtime migration basis conflicts at ${scope}.`,
    blocking: true,
  };
}

function safeCode(value: string): string {
  const normalized = value.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || "migration_finding";
}

function caseLifecycle(status: string): CaseState["lifecycle"] {
  if (status === "waiting" || status === "blocked" || status === "complete" || status === "failed" || status === "cancelled") return status;
  return "open";
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
