import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { parse, stringify } from "yaml";

import { fileExists, readOptionalText } from "../../utils/fs.js";
import type { IndexedItem, WorkspaceSnapshot } from "../workspace/snapshot.js";
import { resolveItem } from "../workspace/snapshot.js";
import { executeWritePlan, hashPath, sha256, type PlannedWrite } from "../workspace/write-plan.js";
import { ContractChangeError, validateAndApplyContractOperations, validateEvidenceReferences } from "./legacy-contract-change.js";
import { evaluateWorkflowControl } from "./legacy-workflow-control.js";
import { GateSubmitReceiptSchema } from "../contracts/gate-transition.js";
import { DecisionInputSchema, type DecisionInput } from "../contracts/case-control.js";
import { CaseStateSchema } from "../contracts/case-state.js";
import { DraftPatchReceiptSchema } from "../contracts/draft-patch.js";
import { ContractChangeDecisionReceiptSchema } from "../contracts/legacy-contract-change.js";
import { resolveRegisteredArtifactPath, serializeRegisteredArtifactPath } from "./artifact-path.js";
import { isPassingGateVerdict, resolveGateAuthority } from "./gate-authority.js";
import { markdownBodyStart, parseAnchoredBlocks, splitMarkdownBlocks } from "./markdown-blocks.js";

export type DecisionChoice = DecisionInput["decision"];

export interface DecisionOutcome {
  item: string;
  decision_id: string;
  event_id: string;
  plan_sha256: string;
  status: "accepted" | "rejected" | "postponed";
  effects: Array<{ kind: "decision_recorded" | "contract_applied" | "change_marked_stale" | "patch_accepted" | "item_rejected" | "item_postponed"; refs: string[] }>;
  next_selectors: string[];
}

export class LifecycleError extends Error {
  constructor(readonly kind: "usage" | "domain" | "conflict", readonly code: string, message: string, readonly details?: unknown) {
    super(message);
    this.name = "LifecycleError";
  }
}

export async function decideItem(input: { snapshot: WorkspaceSnapshot; selector: string; decision: DecisionChoice; actorName: string; reason?: string; dryRun: boolean; expectedPlanSha256?: string }): Promise<DecisionOutcome> {
  const semantic = DecisionInputSchema.safeParse({ decision: input.decision, actor_name: input.actorName, ...(input.reason ? { reason: input.reason } : {}) });
  if (!semantic.success) throw new LifecycleError("usage", "invalid_decision_input", "Decision input does not match the action schema.", semantic.error.issues);
  const blockingDiagnostic = input.snapshot.diagnostics.find((diagnostic) => diagnostic.blocking);
  if (blockingDiagnostic) throw new LifecycleError("domain", "decision_workspace_invalid", `Workspace is not valid for decisions: ${blockingDiagnostic.code}`, blockingDiagnostic);
  if (input.selector.startsWith("transition:")) return decideTransition(input);
  const resolved = resolveItem(input.snapshot, input.selector);
  if (!resolved.item) throw new LifecycleError("usage", resolved.candidates.length > 1 ? "decision_target_ambiguous" : "decision_target_missing", resolved.candidates.length > 1 ? `Ambiguous item: ${resolved.candidates.map((item) => item.selector).join(", ")}` : `Item not found: ${input.selector}`);
  const item = resolved.item;
  if (!(["change", "patch", "gate"] as string[]).includes(item.type)) throw new LifecycleError("usage", "decision_target_unsupported", `Item type cannot be decided: ${item.type}`);
  if (item.type !== "gate") assertSafeId(item.id, "item ID");
  if (item.type === "change" || item.type === "patch") {
    const currentStatus = string(record(item.value).status) || "proposed";
    if (!["proposed", "postponed"].includes(currentStatus)) throw new LifecycleError("conflict", "decision_target_resolved", `Item is already resolved: ${currentStatus}`);
  } else {
    const gate = record(item.value);
    if (gate.blocking !== true || isPassingGateVerdict(gate.verdict) || resolveGateAuthority(input.snapshot, item.id).acceptedOverride) {
      throw new LifecycleError("conflict", "decision_target_resolved", "Gate is not a pending blocking item.");
    }
    if (gate.schema_version === "1") await assertTrustedGateForOverride(input.snapshot, gate);
  }
  const now = new Date().toISOString();
  const planSha256 = decisionPlanSha256(input);
  if (input.expectedPlanSha256 && input.expectedPlanSha256 !== planSha256) throw new LifecycleError("conflict", "decision_plan_stale", "Decision plan no longer matches the approved preview.", { expected: input.expectedPlanSha256, actual: planSha256 });
  const decisionId = `D-${planSha256.slice(0, 24)}`;
  const eventId = `E-${planSha256.slice(24, 48)}`;
  const operations: PlannedWrite[] = [];
  let changeStale = false;
  if (item.type === "change" || item.type === "patch") {
    if (input.decision === "accept" && item.type === "change") {
      try {
        operations.push(...await acceptItem(input.snapshot, item, decisionId, planSha256, now));
      } catch (error) {
        if (!(error instanceof ContractChangeError)) throw error;
        changeStale = true;
        operations.push(await changeRevalidationReceiptWrite(input.snapshot, item, decisionId, planSha256, now, error));
      }
    }
    const lifecycleStatus = input.decision === "accept"
      ? item.type === "patch" ? "accepted" : changeStale ? "stale" : "applied"
      : input.decision === "reject" ? "rejected" : "postponed";
    const lifecycleOperation = await lifecycleWrite(item, lifecycleStatus, decisionId, now);
    const decisionReceipt = await caseActionDecisionReceiptWrite(input.snapshot, item, input.decision, input.actorName, decisionId, planSha256, now);
    operations.push(decisionReceipt.operation, lifecycleOperation);
    const caseActionOperation = caseActionDecisionWrite(input.snapshot, item, lifecycleStatus, lifecycleOperation.nextHash, decisionId, now, decisionReceipt.reference);
    if (caseActionOperation) operations.push(caseActionOperation);
  }

  const ledgerPath = path.join(input.snapshot.workspace, "runs/current/decision-ledger.jsonl");
  const ledger = await readOptionalText(ledgerPath) ?? "";
  const event = {
    event_id: eventId, decision_id: decisionId, timestamp: now,
    actor: { kind: "human", name: input.actorName }, decision_type: item.type === "gate" ? "gate_override" : "patch_acceptance",
    selected_option: input.decision, status: input.decision === "accept" ? "accepted" : input.decision === "reject" ? "rejected" : "postponed",
    rationale: input.reason, ...(item.type === "change" ? { change_id: item.id } : {}), ...(item.type === "patch" ? { draft_patch_id: item.id } : {}), ...(item.type === "gate" ? { gate_id: item.id } : {}),
    ...(item.type === "gate" && typeof record(item.value).event_id === "string" ? {
      gate_event_id: record(item.value).event_id,
      gate_receipt_sha256: string(record(record(item.value).receipt).sha256),
      gate_receipt_plan_sha256: string(record(record(item.value).receipt).plan_sha256),
    } : {}),
  };
  operations.push({ action: await fileExists(ledgerPath) ? "refresh" : "create", path: ledgerPath, relativePath: "runs/current/decision-ledger.jsonl", content: `${ledger}${JSON.stringify(event)}\n`, scope: "workspace", ownership: "user", previousHash: sha256(ledger), nextHash: sha256(`${ledger}${JSON.stringify(event)}\n`), reason: "append human decision last" });
  if (!input.dryRun) await executeWritePlan({ operations });
  const effects: DecisionOutcome["effects"] = [{ kind: "decision_recorded", refs: [`decision:${decisionId}`, `decision-event:${eventId}`] }];
  if (input.decision === "postpone") effects.push({ kind: "item_postponed", refs: [item.selector] });
  else if (input.decision === "reject") effects.push({ kind: "item_rejected", refs: [item.selector] });
  else if (item.type === "change" && changeStale) effects.push({ kind: "change_marked_stale", refs: [item.selector] });
  else if (item.type === "change") effects.push({ kind: "contract_applied", refs: [item.selector, `artifact:A-receipt-${item.id}`] });
  else if (item.type === "patch") effects.push({ kind: "patch_accepted", refs: [item.selector] });
  return {
    item: item.selector,
    decision_id: decisionId,
    event_id: eventId,
    plan_sha256: planSha256,
    status: event.status as DecisionOutcome["status"],
    effects,
    next_selectors: ["status", `show:decision:${decisionId}`, "list:history", "list:case-actions"],
  };
}

async function assertTrustedGateForOverride(snapshot: WorkspaceSnapshot, gate: Record<string, unknown>): Promise<void> {
  if (gate.verification_kind !== "reverification" || typeof gate.confirmed_by !== "object" || typeof gate.receipt !== "object") throw new Error("Gate override requires the latest trusted confirmed reverification.");
  const reference = record(gate.receipt);
  if (typeof reference.path !== "string" || typeof reference.sha256 !== "string" || typeof reference.plan_sha256 !== "string") throw new Error("Gate override receipt reference is invalid.");
  const receiptPath = path.resolve(snapshot.workspace, reference.path);
  try {
    const bytes = await readFile(receiptPath);
    const receipt = GateSubmitReceiptSchema.parse(JSON.parse(Buffer.from(bytes).toString("utf8")) as unknown);
    if (sha256(bytes) !== reference.sha256 || receipt.plan_sha256 !== reference.plan_sha256 || receipt.event_id !== gate.event_id
      || receipt.gate_id !== gate.gate_id || receipt.verdict !== gate.verdict || receipt.verification_kind !== gate.verification_kind
      || JSON.stringify(receipt.evidence) !== JSON.stringify(gate.evidence) || JSON.stringify(receipt.confirmed_by) !== JSON.stringify(gate.confirmed_by)) throw new Error("receipt mismatch");
  } catch (error) { throw new Error(`Gate override requires a trusted receipt: ${error instanceof Error ? error.message : String(error)}`); }
}

async function decideTransition(input: { snapshot: WorkspaceSnapshot; selector: string; decision: DecisionChoice; actorName: string; reason?: string; dryRun: boolean; expectedPlanSha256?: string }): Promise<DecisionOutcome> {
  const control = await evaluateWorkflowControl(input.snapshot);
  const transition = control.transitions.find((item) => item.selector === input.selector);
  if (!transition || transition.state !== "decision_required" || !transition.decision_point_id) throw new LifecycleError("conflict", "decision_target_resolved", "Transition is not awaiting a branch Decision.");
  const existingAccepted = latestDecisions(input.snapshot).find((decision) => decision.decision_type === "workflow_branch" && decision.status === "accepted" && decision.decision_point_id === transition.decision_point_id);
  if (existingAccepted) throw new LifecycleError("conflict", "decision_target_resolved", `Decision point is already resolved: ${transition.decision_point_id}`);
  const now = new Date().toISOString();
  const planSha256 = decisionPlanSha256(input);
  if (input.expectedPlanSha256 && input.expectedPlanSha256 !== planSha256) throw new LifecycleError("conflict", "decision_plan_stale", "Decision plan no longer matches the approved preview.", { expected: input.expectedPlanSha256, actual: planSha256 });
  const decisionId = `D-${planSha256.slice(0, 24)}`;
  const eventId = `E-${planSha256.slice(24, 48)}`;
  const event = {
    event_id: eventId, decision_id: decisionId, timestamp: now, actor: { kind: "human", name: input.actorName },
    decision_type: "workflow_branch", decision_point_id: transition.decision_point_id, transition_id: transition.transition_id,
    subflow_instance_id: transition.subflow_instance_id, selected_option: transition.transition_node_id,
    status: input.decision === "accept" ? "accepted" : input.decision === "reject" ? "rejected" : "postponed", rationale: input.reason,
  };
  const ledgerPath = path.join(input.snapshot.workspace, "runs/current/decision-ledger.jsonl");
  const ledger = await readOptionalText(ledgerPath) ?? "";
  const content = `${ledger}${JSON.stringify(event)}\n`;
  const operation: PlannedWrite = { action: await fileExists(ledgerPath) ? "refresh" : "create", path: ledgerPath, relativePath: "runs/current/decision-ledger.jsonl", content, scope: "workspace", ownership: "user", previousHash: sha256(ledger), nextHash: sha256(content), reason: "append workflow branch decision" };
  if (!input.dryRun) await executeWritePlan({ operations: [operation] });
  const effects: DecisionOutcome["effects"] = [
    { kind: "decision_recorded", refs: [`decision:${decisionId}`, `decision-event:${eventId}`, input.selector] },
    ...(input.decision === "postpone" ? [{ kind: "item_postponed" as const, refs: [input.selector] }] : input.decision === "reject" ? [{ kind: "item_rejected" as const, refs: [input.selector] }] : []),
  ];
  return {
    item: input.selector,
    decision_id: decisionId,
    event_id: eventId,
    plan_sha256: planSha256,
    status: event.status as DecisionOutcome["status"],
    effects,
    next_selectors: ["status", `show:decision:${decisionId}`, "list:history", `instructions:${input.selector}`],
  };
}

function decisionPlanSha256(input: { snapshot: WorkspaceSnapshot; selector: string; decision: DecisionChoice; actorName: string; reason?: string }): string {
  const reads = [
    "specs/workflow.yaml",
    "runs/current/state.yaml",
    "runs/current/artifact-registry.json",
    "runs/current/gate-ledger.jsonl",
    "runs/current/decision-ledger.jsonl",
  ].flatMap((relativePath) => {
    const file = input.snapshot.files.get(relativePath);
    return file ? [{ path: relativePath, sha256: file.hash }] : [];
  });
  return sha256(`${JSON.stringify({
    selector: input.selector,
    decision: input.decision,
    actor_name: input.actorName.trim(),
    reason: input.reason?.trim() ?? null,
    reads,
  })}\n`);
}

export async function archiveItem(input: { snapshot: WorkspaceSnapshot; selector: string; dryRun: boolean }): Promise<{ source: string; target: string }> {
  const resolved = resolveItem(input.snapshot, input.selector);
  const item = resolved.item;
  if (!item || (item.type !== "change" && item.type !== "patch") || !item.path) throw new Error(`Archivable item not found: ${input.selector}`);
  assertSafeId(item.id, "item ID");
  const status = string(record(item.value).status) || "proposed";
  if (!["applied", "rejected", "stale", "superseded"].includes(status)) throw new Error(`Item is not resolved: ${status}`);
  const itemValue = record(item.value);
  const decisionId = string(itemValue.decision_id);
  if (!decisionId) throw new Error("Resolved item has no decision record link.");
  const linkKey = item.type === "change" ? "change_id" : "draft_patch_id";
  const decision = input.snapshot.decisions.filter((event) => event.decision_id === decisionId).at(-1);
  const allowedDecisionStatuses = status === "applied" || status === "stale" ? ["accepted"] : status === "rejected" ? ["rejected"] : ["accepted", "rejected"];
  if (!decision || !allowedDecisionStatuses.includes(String(decision.status)) || decision[linkKey] !== item.id) throw new Error("Item lifecycle is not backed by a matching decision ledger event.");
  const linkedBlockingGate = latestLinkedBlockingGate(input.snapshot, linkKey, item.id);
  if (linkedBlockingGate) {
    const gateId = string(linkedBlockingGate.gate_id);
    const override = latestDecisions(input.snapshot).find((decision) => decision.gate_id === gateId && decision.status === "accepted");
    if (!override) throw new Error(`Linked blocking gate is unresolved: ${gateId}`);
  }
  if (status === "applied") {
    const receiptId = string(itemValue.apply_receipt_artifact_id);
    const receipt = input.snapshot.artifacts.find((artifact) => artifact.artifact_id === receiptId);
    if (!receipt || typeof receipt.path !== "string" || typeof receipt.sha256 !== "string") throw new Error("Applied item is missing its registered receipt.");
    const resolvedReceipt = resolveRegisteredArtifactPath(input.snapshot, receipt.path);
    if (!resolvedReceipt.contained) throw new Error("Apply receipt escapes its runtime root.");
    const receiptPath = resolvedReceipt.absolutePath;
    if (!(await fileExists(receiptPath))) throw new Error(`Apply receipt is missing: ${receiptPath}`);
    await assertContained(resolvedReceipt.root, receiptPath, "apply receipt");
    const receiptBytes = await readFile(receiptPath);
    if (sha256(receiptBytes) !== receipt.sha256) throw new Error("Apply receipt hash does not match the artifact registry.");
    const receiptBody = record(JSON.parse(receiptBytes.toString("utf8")) as unknown);
    if ((receiptBody.item_selector ?? receiptBody.selector) !== item.selector || receiptBody.decision_id !== decisionId) throw new Error("Apply receipt does not match the archived item and decision.");
  }
  if (status === "stale") {
    const staleReceipt = item.type === "patch"
      ? string(itemValue.stale_receipt_path)
      : `runs/current/receipts/contract-change/${item.id}-revalidation.json`;
    const staleReceiptPath = path.resolve(input.snapshot.workspace, staleReceipt);
    if (!staleReceipt || !(await fileExists(staleReceiptPath))) throw new Error("Stale item is missing its revalidation receipt.");
    await assertContained(input.snapshot.workspace, staleReceiptPath, "stale receipt");
  }
  const date = new Date().toISOString().slice(0, 10);
  const target = item.type === "change"
    ? path.join(input.snapshot.workspace, "changes/archive", `${date}-${item.id}`)
    : path.join(input.snapshot.workspace, "draft-patches/archive", `${date}-${path.basename(item.path)}`);
  if (await fileExists(target)) throw writeConflict(`Archive target already exists: ${target}`);
  const operation: PlannedWrite = { action: "move", path: target, sourcePath: item.path, scope: "workspace", ownership: "user", previousHash: await hashPath(item.path), reason: "archive resolved lifecycle item" };
  if (!input.dryRun) await executeWritePlan({ operations: [operation] });
  return { source: item.path, target };
}

async function acceptItem(snapshot: WorkspaceSnapshot, item: IndexedItem, decisionId: string, planSha256: string, now: string): Promise<PlannedWrite[]> {
  if (item.type === "change") return acceptContractChange(snapshot, item, decisionId, planSha256, now);
  return [];
}

async function acceptContractChange(snapshot: WorkspaceSnapshot, item: IndexedItem, decisionId: string, planSha256: string, now: string): Promise<PlannedWrite[]> {
  const patch = record(item.value);
  validateEvidenceReferences(snapshot, records(patch.patches));
  const grouped = new Map<string, Record<string, unknown>[]>();
  for (const operation of records(patch.patches)) {
    if (typeof operation.target_contract !== "string") throw new Error("Contract patch is missing target_contract.");
    grouped.set(operation.target_contract, [...(grouped.get(operation.target_contract) ?? []), operation]);
  }
  const writes: PlannedWrite[] = [];
  const outputHashes: Record<string, string> = {};
  for (const [relativePath, operations] of grouped) {
    const absolutePath = path.resolve(snapshot.workspace, relativePath);
    await assertContained(snapshot.workspace, absolutePath, "contract patch target");
    const original = await readFile(absolutePath, "utf8");
    const next = validateAndApplyContractOperations(relativePath, original, operations);
    outputHashes[relativePath] = sha256(next);
    writes.push({ action: "refresh", path: absolutePath, relativePath, content: next, scope: "workspace", ownership: "user", previousHash: sha256(original), nextHash: sha256(next), reason: `accepted contract change ${item.id}` });
  }
  writes.push(...receiptWrites(snapshot, item, decisionId, planSha256, now, outputHashes));
  return writes;
}

function receiptWrites(snapshot: WorkspaceSnapshot, item: IndexedItem, decisionId: string, planSha256: string, now: string, outputHashes: Record<string, string>, createdArtifacts: Record<string, unknown>[] = []): PlannedWrite[] {
  const receiptPath = path.join(snapshot.workspace, "runs/current/receipts", `${item.id}.json`);
  const receiptRelative = serializeRegisteredArtifactPath(snapshot, receiptPath);
  const receiptArtifact: Record<string, unknown> = { artifact_id: `A-receipt-${item.id}`, artifact_type: "apply_receipt", path: receiptRelative, status: "verified", produced_by: "researchspec decide", created_at: now };
  const receipt = `${JSON.stringify({ schema_version: "1", receipt_type: item.type === "change" ? "contract_patch_apply" : "draft_patch_apply", item_selector: item.selector, decision_id: decisionId, plan_sha256: planSha256, applied_at: now, output_hashes: outputHashes, created_artifact_ids: createdArtifacts.map((artifact) => artifact.artifact_id) }, null, 2)}\n`;
  receiptArtifact.sha256 = sha256(receipt);
  const registryPath = path.join(snapshot.workspace, "runs/current/artifact-registry.json");
  const registrySource = snapshot.files.get("runs/current/artifact-registry.json")?.text ?? `${JSON.stringify({ schema_version: "0.1", run_id: "current", artifacts: [] }, null, 2)}\n`;
  const registry = record(JSON.parse(registrySource) as unknown);
  const existingArtifacts = records(registry.artifacts).filter((artifact) => ![receiptArtifact.artifact_id, ...createdArtifacts.map((created) => created.artifact_id)].includes(artifact.artifact_id));
  registry.artifacts = [...existingArtifacts, ...createdArtifacts, receiptArtifact];
  const registryText = `${JSON.stringify(registry, null, 2)}\n`;
  return [
    { action: "create", path: receiptPath, relativePath: path.relative(snapshot.workspace, receiptPath), content: receipt, scope: "workspace", ownership: "generated", nextHash: sha256(receipt), reason: "write apply receipt" },
    { action: "refresh", path: registryPath, relativePath: "runs/current/artifact-registry.json", content: registryText, scope: "workspace", ownership: "user", previousHash: sha256(registrySource), nextHash: sha256(registryText), reason: "register revised artifacts and receipt" },
  ];
}

async function lifecycleWrite(item: IndexedItem, status: string, decisionId: string, now: string): Promise<PlannedWrite> {
  if (!item.path) throw new Error("Item has no source path.");
  if (item.type === "change") {
    const patchPath = path.join(item.path, "contract-patch.yaml");
    const original = await readFile(patchPath, "utf8");
    const value = record(parse(original));
    Object.assign(value, { status, decision_id: decisionId, resolved_at: now, apply_receipt_artifact_id: status === "applied" ? `A-receipt-${item.id}` : undefined });
    const next = stringify(value);
    return { action: "refresh", path: patchPath, content: next, scope: "workspace", ownership: "user", previousHash: sha256(original), nextHash: sha256(next), reason: "update change lifecycle" };
  }
  const original = await readFile(item.path, "utf8");
  const value = record(JSON.parse(original) as unknown);
  Object.assign(value, { status, decision_id: decisionId, resolved_at: now, applied_artifact_id: status === "applied" ? `A-${item.id}` : undefined, apply_receipt_artifact_id: status === "applied" ? `A-receipt-${item.id}` : undefined });
  const next = `${JSON.stringify(value, null, 2)}\n`;
  return { action: "refresh", path: item.path, content: next, scope: "workspace", ownership: "user", previousHash: sha256(original), nextHash: sha256(next), reason: "update draft patch lifecycle" };
}

function caseActionDecisionWrite(
  snapshot: WorkspaceSnapshot,
  item: IndexedItem,
  status: string,
  payloadSha256: string | undefined,
  decisionId: string,
  now: string,
  receipt: { receipt_id: string; receipt_type: string; path: string; sha256: string },
): PlannedWrite | undefined {
  if (snapshot.runtimeMode !== "adaptive" || !snapshot.caseState || (item.type !== "patch" && item.type !== "change")) return undefined;
  const stateFile = snapshot.files.get("runs/current/state.yaml");
  if (!stateFile) throw new Error("Adaptive CaseState file is unavailable.");
  const caseStatus = status === "proposed" ? "pending" : status;
  const next = CaseStateSchema.parse({
    ...snapshot.caseState,
    formal_decision_refs: [...snapshot.caseState.formal_decision_refs, { decision_id: decisionId, decision_type: "patch_acceptance" }],
    case_actions: snapshot.caseState.case_actions.map((action) => action.selector === item.selector ? {
      ...action,
      status: caseStatus,
      ...(item.path && payloadSha256 ? {
        payload_ref: {
          path: item.type === "patch"
            ? `draft-patches/${item.id}.json`
            : `changes/${item.id}/contract-patch.yaml`,
          sha256: payloadSha256,
        },
      } : {}),
    } : action),
    receipts: [...snapshot.caseState.receipts.filter((item) => item.receipt_id !== receipt.receipt_id), receipt],
    updated_at: now,
  });
  const content = stringify(next);
  return {
    action: "refresh",
    path: stateFile.absolutePath,
    relativePath: stateFile.relativePath,
    content,
    scope: "workspace",
    ownership: "user",
    previousHash: stateFile.hash,
    nextHash: sha256(content),
    reason: "commit adaptive case-action decision",
  };
}

async function caseActionDecisionReceiptWrite(
  snapshot: WorkspaceSnapshot,
  item: IndexedItem,
  decision: DecisionChoice,
  actorName: string,
  decisionId: string,
  planSha256: string,
  now: string,
): Promise<{ operation: PlannedWrite; reference: { receipt_id: string; receipt_type: string; path: string; sha256: string } }> {
  const relativePath = `runs/current/receipts/${item.type === "patch" ? "draft-patch" : "contract-change"}/${item.id}-decision.json`;
  const target = path.join(snapshot.workspace, relativePath);
  if (await fileExists(target)) throw new LifecycleError("conflict", "decision_receipt_conflict", `Decision receipt already exists: ${target}`);
  const receipt = item.type === "patch"
    ? DraftPatchReceiptSchema.parse({
        schema_version: "1",
        receipt_type: "draft_patch_decision",
        receipt_id: `R-patch-decision-${planSha256.slice(0, 16)}`,
        patch_id: item.id,
        selector: item.selector,
        plan_sha256: planSha256,
        actor: { kind: "human", name: actorName },
        decision_id: decisionId,
        base_artifact_id: string(record(item.value).base_artifact_id),
        base_sha256: patchBaseSha256(snapshot, item),
        output_hashes: {},
        artifact_ids: [],
        effects: [{ kind: "decision_recorded", refs: [`decision:${decisionId}`, item.selector] }],
        committed_at: now,
      })
    : ContractChangeDecisionReceiptSchema.parse({
        schema_version: "1",
        receipt_type: "contract_change_decision",
        receipt_id: `R-change-decision-${planSha256.slice(0, 16)}`,
        selector: item.selector,
        decision_id: decisionId,
        plan_sha256: planSha256,
        decision,
        actor: { kind: "human", name: actorName },
        committed_at: now,
      });
  const content = `${JSON.stringify(receipt, null, 2)}\n`;
  const receiptId = string(record(receipt).receipt_id);
  const receiptType = string(record(receipt).receipt_type);
  return {
    operation: {
      action: "create",
      path: target,
      relativePath,
      content,
      scope: "workspace",
      ownership: "user",
      nextHash: sha256(content),
      reason: "record case-action decision receipt",
    },
    reference: { receipt_id: receiptId, receipt_type: receiptType, path: relativePath, sha256: sha256(content) },
  };
}

function patchBaseSha256(snapshot: WorkspaceSnapshot, item: IndexedItem): string {
  const value = record(item.value);
  const declared = string(value.base_sha256) || string(value.base_draft_hash).replace(/^sha256:/, "");
  if (/^[a-f0-9]{64}$/.test(declared)) return declared;
  const artifact = snapshot.artifacts.find((candidate) => candidate.artifact_id === value.base_artifact_id);
  if (artifact && typeof artifact.sha256 === "string" && /^[a-f0-9]{64}$/.test(artifact.sha256)) return artifact.sha256;
  throw new LifecycleError("domain", "patch_base_hash_missing", "Patch decision requires a complete base artifact SHA-256.");
}

async function changeRevalidationReceiptWrite(
  snapshot: WorkspaceSnapshot,
  item: IndexedItem,
  decisionId: string,
  planSha256: string,
  now: string,
  error: ContractChangeError,
): Promise<PlannedWrite> {
  const relativePath = `runs/current/receipts/contract-change/${item.id}-revalidation.json`;
  const target = path.join(snapshot.workspace, relativePath);
  if (await fileExists(target)) throw new LifecycleError("conflict", "change_revalidation_receipt_conflict", `Revalidation receipt already exists: ${target}`);
  const content = `${JSON.stringify({
    schema_version: "1",
    receipt_type: "contract_change_revalidation",
    receipt_id: `R-change-revalidation-${item.id}`,
    selector: item.selector,
    decision_id: decisionId,
    plan_sha256: planSha256,
    outcome: "stale",
    diagnostic_code: error.code,
    checked_at: now,
  }, null, 2)}\n`;
  return {
    action: "create",
    path: target,
    relativePath,
    content,
    scope: "workspace",
    ownership: "user",
    nextHash: sha256(content),
    reason: "record contract-change revalidation failure",
  };
}

export function applyDraftOperations(text: string, operations: Record<string, unknown>[]): string {
  const blocks = parseAnchoredBlocks(text);
  const byId = new Map(blocks.map((block) => [block.id, block]));
  const usedTargets = new Set<string>();
  let nextId = Math.max(0, ...blocks.map((block) => /^B(\d+)$/.exec(block.id)).filter((match): match is RegExpExecArray => Boolean(match)).map((match) => Number(match[1]))) + 1;
  const edits: Array<{ start: number; end: number; replacement: string; order: number }> = [];

  for (const [order, operation] of operations.entries()) {
    const op = string(operation.op);
    const blockId = string(operation.block_id || operation.anchor_block_id);
    if (!blockId) throw new Error("Draft operation is missing block_id.");
    if (usedTargets.has(blockId)) throw new Error(`Draft block has more than one operation: ${blockId}`);
    usedTargets.add(blockId);
    if (!["replace_block", "insert_after", "delete_block"].includes(op)) throw new Error(`Unsupported draft operation: ${op}`);
    const newText = string(operation.new_text);
    if ((op === "replace_block" || op === "insert_after") && !newText.trim()) throw new Error(`${op} requires new_text.`);
    if (/<!--\s*block:/i.test(newText)) throw new Error("Draft patch text cannot inject block markers.");

    if (blockId === "DOC-BODY-START") {
      if (op !== "insert_after" || string(operation.old_hash)) throw new Error("DOC-BODY-START is only valid for hash-less insert_after.");
      const replacement = anchorize(newText, undefined);
      edits.push({ start: blocks[0]?.markerStart ?? markdownBodyStart(text), end: blocks[0]?.markerStart ?? markdownBodyStart(text), replacement: `${replacement}\n\n`, order });
      continue;
    }

    const block = byId.get(blockId);
    if (!block) throw new Error(`Draft block not found: ${blockId}`);
    const oldHash = string(operation.old_hash);
    if (!oldHash || !block.hash.startsWith(oldHash.replace(/^sha256:/, ""))) throw new Error(`Draft block hash is stale: ${blockId}`);
    if (op === "delete_block") edits.push({ start: block.markerStart, end: block.end, replacement: "", order });
    else if (op === "replace_block") edits.push({ start: block.markerStart, end: block.end, replacement: `${anchorize(newText, block.id)}\n\n`, order });
    else edits.push({ start: block.end, end: block.end, replacement: `${anchorize(newText, undefined)}\n\n`, order });
  }

  let result = text;
  for (const edit of edits.sort((left, right) => right.start - left.start || right.order - left.order)) result = `${result.slice(0, edit.start)}${edit.replacement}${result.slice(edit.end)}`;
  return result;

  function anchorize(value: string, firstId: string | undefined): string {
    return splitMarkdownBlocks(value).map((content, index) => {
      const id = index === 0 && firstId ? firstId : `B${String(nextId++).padStart(4, "0")}`;
      return `<!--block:${id}-->\n${content}`;
    }).join("\n\n");
  }
}

function record(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function records(value: unknown): Record<string, unknown>[] { return Array.isArray(value) ? value.map(record) : []; }
function string(value: unknown): string { return typeof value === "string" ? value : ""; }
function assertSafeId(value: string, label: string): void {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value) || value.includes("..")) throw new Error(`Unsafe ${label}: ${value}`);
}

async function assertContained(root: string, candidate: string, label: string): Promise<void> {
  if (!inside(root, candidate)) throw new Error(`${label} escapes its allowed root.`);
  const [realRoot, realCandidate] = await Promise.all([realpath(root), realpath(candidate)]);
  if (!inside(realRoot, realCandidate)) throw new Error(`${label} resolves outside its allowed root.`);
}

function inside(root: string, candidate: string): boolean { return candidate === root || candidate.startsWith(`${root}${path.sep}`); }

function latestLinkedBlockingGate(snapshot: WorkspaceSnapshot, linkKey: string, itemId: string): Record<string, unknown> | undefined {
  const latest = new Map<string, Record<string, unknown>>();
  for (const gate of snapshot.gates) if (typeof gate.gate_id === "string") latest.set(gate.gate_id, gate);
  return [...latest.values()].find((gate) => gate[linkKey] === itemId && gate.blocking === true && gate.verdict !== "pass");
}

function latestDecisions(snapshot: WorkspaceSnapshot): Record<string, unknown>[] {
  const latest = new Map<string, Record<string, unknown>>();
  for (const decision of snapshot.decisions) if (typeof decision.decision_id === "string") latest.set(decision.decision_id, decision);
  return [...latest.values()];
}

function writeConflict(message: string): NodeJS.ErrnoException {
  const error = new Error(message) as NodeJS.ErrnoException;
  error.code = "EWRITE_CONFLICT";
  return error;
}
