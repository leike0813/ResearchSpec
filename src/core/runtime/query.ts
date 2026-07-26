import type { IndexedItem, WorkspaceSnapshot } from "../workspace/snapshot.js";
import { latestById, resolveItem } from "../workspace/snapshot.js";
import { evaluateWorkflowControl } from "./workflow-control.js";
import type { PluginStatusSummary } from "../../plugins/status.js";
import type { LiteratureAdapterInspection } from "../../literature-adapters/inspect.js";
import {
  CaseStatusSummarySchema,
  type ActionAvailability,
  type CaseStatusSummary,
} from "../contracts/case-control.js";
import {
  directedInstructionsSelector,
  directedListSelector,
  directedShowSelector,
} from "../contracts/action-selector.js";
import {
  PageRequestSchema,
  RuntimePageSchema,
  type PageRequest,
  type RuntimePage,
} from "../contracts/runtime-protocol.js";
import { sha256 } from "../workspace/write-plan.js";
import { evaluateActionAvailability } from "./action-availability.js";
import { buildActionDescriptor } from "./action-descriptor.js";
import {
  adaptiveActionCandidates,
  adaptiveInstanceIds,
  adaptiveInstanceState,
} from "./adaptive-case-control.js";

export type ListType = "changes" | "artifacts" | "gates" | "decisions" | "tools" | "actions" | "history" | "case-actions" | "diagnostics";

export async function buildStatus(snapshot: WorkspaceSnapshot, plugins?: PluginStatusSummary, literatureAdapters: LiteratureAdapterInspection[] = []) {
  const latestDecisions = latestById(snapshot.decisions.filter((item) => item.authority !== "imported_evidence"), "decision_id");
  const latestGates = latestById(snapshot.gates.filter((item) => item.authority !== "imported_evidence"), "gate_id");
  const overriddenGateIds = new Set(latestDecisions.filter((item) => item.status === "accepted" && item.decision_type === "gate_override" && typeof item.gate_id === "string").map((item) => item.gate_id as string));
  const pendingDecisions = latestDecisions.filter((item) => item.status === "proposed" || item.status === "postponed");
  const pendingChanges = [...snapshot.changes, ...snapshot.patches].filter((item) => {
    const status = record(item.value).status;
    return status === undefined || status === "proposed" || status === "postponed";
  });
  const blockingGates = latestGates.filter((item) => item.blocking === true && item.verdict !== "pass" && !overriddenGateIds.has(String(item.gate_id)));
  const selectedTools = stringArray(record(snapshot.config.agent_tools).selected);
  const workflowControl = await evaluateWorkflowControl(snapshot);
  return {
    status: "initialized",
    workspace: snapshot.workspace,
    initialized: true,
    run: snapshot.state,
    workflow: snapshot.documents["specs/workflow.yaml"] ?? null,
    workflow_control: workflowControl,
    pending_items: [...pendingChanges.map((item) => item.selector), ...pendingDecisions.map((item) => `decision:${String(item.decision_id)}`)],
    blocking_gates: blockingGates,
    recent_artifacts: snapshot.artifacts.slice(-5),
    tools: { selected: selectedTools, installation_count: Array.isArray(snapshot.manifest.installations) ? snapshot.manifest.installations.length : 0 },
    plugins: plugins ?? { selected: [], available: [], unavailable: [], projected: [] },
    literature_adapters: literatureAdapters,
    validation: { ok: snapshot.diagnostics.every((item) => !item.blocking), diagnostics: snapshot.diagnostics },
  };
}

export function listItems(snapshot: WorkspaceSnapshot, type: ListType): IndexedItem[] {
  switch (type) {
    case "changes": return [...snapshot.changes, ...snapshot.patches];
    case "artifacts": return snapshot.items.filter((item) => item.type === "artifact");
    case "gates": return snapshot.items.filter((item) => item.type === "gate");
    case "decisions": return snapshot.items.filter((item) => item.type === "decision");
    case "tools": return snapshot.items.filter((item) => item.type === "tool");
    case "history":
    case "case-actions":
    case "diagnostics":
    case "actions":
      return [];
  }
}

export function showItem(snapshot: WorkspaceSnapshot, selector: string): { item?: IndexedItem; candidates: IndexedItem[] } {
  return resolveItem(snapshot, selector);
}

export async function buildCaseStatusSummary(snapshot: WorkspaceSnapshot): Promise<CaseStatusSummary> {
  if (snapshot.runtimeMode === "adaptive") return buildAdaptiveCaseStatusSummary(snapshot);
  const control = await evaluateWorkflowControl(snapshot);
  const latestDecisions = latestById(snapshot.decisions.filter((item) => item.authority !== "imported_evidence"), "decision_id");
  const latestGates = latestById(snapshot.gates.filter((item) => item.authority !== "imported_evidence"), "gate_id");
  const overriddenGateIds = new Set(latestDecisions
    .filter((item) => item.status === "accepted" && item.decision_type === "gate_override" && typeof item.gate_id === "string")
    .map((item) => String(item.gate_id)));
  const pendingGates = latestGates.filter((item) => item.blocking === true && item.verdict !== "pass" && !overriddenGateIds.has(String(item.gate_id)));
  const pendingDecisions = latestDecisions.filter((item) => item.status === "proposed" || item.status === "postponed");
  const pendingChanges = snapshot.changes.filter((item) => pendingStatus(item.value));
  const pendingPatches = snapshot.patches.filter((item) => pendingPatchStatus(item.value));
  const candidates = actionCandidates(snapshot, control, pendingGates, pendingChanges, pendingPatches);
  const evaluated = (await Promise.all([...new Set(candidates)].map((selector) => evaluateActionAvailability(snapshot, selector, control))))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => item.availability);
  const recommended = stableActions(evaluated.filter((item) => item.disposition === "recommended"));
  const allowed = stableActions(evaluated.filter((item) => item.disposition === "allowed"));
  const blockers = [
    ...evaluated.filter((item) => item.disposition === "blocked").flatMap((item) => item.blocking_refs),
    ...snapshot.diagnostics.filter((item) => item.blocking).map((item) => item.path ? `diagnostic:${item.code}:${item.path}` : `diagnostic:${item.code}`),
  ];
  const instances = snapshot.runState?.subflows ?? [];
  const active = instances.filter((item) => item.status === "active").map((item) => item.instance_id);
  const idle = instances.filter((item) => item.status === "waiting" || item.status === "blocked").map((item) => item.instance_id);
  const recent = [...instances].sort((left, right) => right.started_at.localeCompare(left.started_at) || left.instance_id.localeCompare(right.instance_id)).map((item) => item.instance_id);
  const profilePath = "specs/workflow.yaml";
  const profileHash = snapshot.files.get(profilePath)?.hash ?? sha256("");
  const nextSelectors = [
    directedShowSelector("workflow:current"),
    directedListSelector("actions"),
    directedListSelector("history"),
    directedListSelector("artifacts"),
    directedListSelector("case-actions"),
    directedListSelector("diagnostics"),
    ...recommended.map((item) => directedInstructionsSelector(item.selector)),
    ...allowed.map((item) => directedInstructionsSelector(item.selector)),
  ];
  return CaseStatusSummarySchema.parse({
    schema_version: "1",
    workspace_id: safeId(snapshot.project.project_id) ?? "project",
    run_id: snapshot.runState?.run_id ?? safeId(snapshot.state.run_id) ?? "current",
    lifecycle: lifecycle(snapshot, control, recommended, allowed),
    profile: { mode: "strict", path: profilePath, sha256: profileHash },
    active_instance_ids: active.slice(0, 20),
    idle_instance_ids: idle.slice(0, 20),
    recent_instance_ids: recent.slice(0, 20),
    unsatisfied_obligation_ids: [],
    blocker_refs: [...new Set(blockers)].sort().slice(0, 20),
    recommended_actions: recommended.slice(0, 20),
    allowed_actions: allowed.slice(0, 20),
    pending: {
      gate_ids: ids(pendingGates, "gate_id"),
      gate_count: pendingGates.length,
      decision_ids: ids(pendingDecisions, "decision_id"),
      decision_count: pendingDecisions.length,
      patch_ids: pendingPatches.map((item) => item.id).sort().slice(0, 20),
      patch_count: pendingPatches.length,
      change_ids: pendingChanges.map((item) => item.id).sort().slice(0, 20),
      change_count: pendingChanges.length,
    },
    diagnostic_counts: {
      error: snapshot.diagnostics.filter((item) => item.severity === "error").length,
      warning: snapshot.diagnostics.filter((item) => item.severity === "warning").length,
      info: snapshot.diagnostics.filter((item) => item.severity === "info").length,
      blocking: snapshot.diagnostics.filter((item) => item.blocking).length,
    },
    next_selectors: [...new Set(nextSelectors)].slice(0, 20),
  });
}

async function buildAdaptiveCaseStatusSummary(snapshot: WorkspaceSnapshot): Promise<CaseStatusSummary> {
  const state = snapshot.caseState;
  if (!state) throw new Error("Adaptive CaseState is unavailable.");
  const candidates = adaptiveActionCandidates(snapshot);
  const evaluated = (await Promise.all(candidates.map((selector) => evaluateActionAvailability(snapshot, selector))))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => item.availability);
  const recommended = stableActions(evaluated.filter((item) => item.disposition === "recommended"));
  const allowed = stableActions(evaluated.filter((item) => item.disposition === "allowed"));
  const instanceIds = adaptiveInstanceIds(snapshot);
  const active = instanceIds.filter((id) => adaptiveInstanceState(snapshot, id) === "active");
  const idle = instanceIds.filter((id) => adaptiveInstanceState(snapshot, id) === "waiting");
  const recent = [...instanceIds].reverse();
  const pendingActions = state.case_actions.filter((item) => item.status === "pending" || item.status === "postponed");
  const pendingGates = evaluated.filter((item) => item.selector.startsWith("gate:") && item.reason_code !== "gate_complete");
  const pendingChanges = snapshot.changes.filter((item) => pendingStatus(item.value));
  const pendingPatches = snapshot.patches.filter((item) => pendingPatchStatus(item.value));
  const profilePath = "specs/workflow.yaml";
  const blockers = [
    ...evaluated.filter((item) => item.disposition === "blocked").flatMap((item) => item.blocking_refs),
    ...snapshot.diagnostics.filter((item) => item.blocking).map((item) => item.path ? `diagnostic:${item.code}:${item.path}` : `diagnostic:${item.code}`),
  ];
  return CaseStatusSummarySchema.parse({
    schema_version: "1",
    workspace_id: safeId(snapshot.project.project_id) ?? "project",
    run_id: state.run_id,
    lifecycle: state.lifecycle,
    profile: { mode: "adaptive", path: profilePath, sha256: snapshot.files.get(profilePath)?.hash ?? sha256("") },
    active_instance_ids: active.slice(0, 20),
    idle_instance_ids: idle.slice(0, 20),
    recent_instance_ids: recent.slice(0, 20),
    unsatisfied_obligation_ids: state.obligations.filter((item) => item.status === "unsatisfied" || item.status === "blocked").map((item) => item.obligation_id).slice(0, 20),
    blocker_refs: [...new Set(blockers)].sort().slice(0, 20),
    recommended_actions: recommended.slice(0, 20),
    allowed_actions: allowed.slice(0, 20),
    pending: {
      gate_ids: pendingGates.map((item) => item.selector.split("/").at(-1) ?? item.selector.slice("gate:".length)).slice(0, 20),
      gate_count: pendingGates.length,
      decision_ids: pendingActions.map((item) => item.action_id).slice(0, 20),
      decision_count: pendingActions.length,
      patch_ids: pendingPatches.map((item) => item.id).sort().slice(0, 20),
      patch_count: pendingPatches.length,
      change_ids: pendingChanges.map((item) => item.id).sort().slice(0, 20),
      change_count: pendingChanges.length,
    },
    diagnostic_counts: {
      error: snapshot.diagnostics.filter((item) => item.severity === "error").length,
      warning: snapshot.diagnostics.filter((item) => item.severity === "warning").length,
      info: snapshot.diagnostics.filter((item) => item.severity === "info").length,
      blocking: snapshot.diagnostics.filter((item) => item.blocking).length,
    },
    next_selectors: [...new Set([
      directedShowSelector("workflow:current"),
      directedListSelector("actions"),
      directedListSelector("history"),
      directedListSelector("case-actions"),
      ...recommended.map((item) => directedInstructionsSelector(item.selector)),
      ...allowed.map((item) => directedInstructionsSelector(item.selector)),
    ])].slice(0, 20),
  });
}

export async function listItemsPage(snapshot: WorkspaceSnapshot, type: ListType, request: Partial<PageRequest> = {}): Promise<RuntimePage> {
  const parsed = PageRequestSchema.parse(request);
  const items = await listProjection(snapshot, type);
  const basisSha256 = sha256(`${JSON.stringify(items)}\n`);
  const offset = parsed.cursor ? decodeCursor(parsed.cursor, type, basisSha256) : 0;
  const pageItems = items.slice(offset, offset + parsed.limit);
  const nextOffset = offset + pageItems.length;
  const nextCursor = nextOffset < items.length ? encodeCursor({ v: 1, type, offset: nextOffset, basis_sha256: basisSha256 }) : null;
  return RuntimePageSchema.parse({
    schema_version: "1",
    type,
    items: pageItems,
    page: { limit: parsed.limit, total: items.length, next_cursor: nextCursor },
  });
}

export async function showRuntimeDetail(snapshot: WorkspaceSnapshot, selector: string): Promise<{ item?: unknown; candidates: IndexedItem[] }> {
  if (selector === "workflow:current") {
    return {
      item: {
        schema_version: "1",
        selector,
        run: snapshot.state,
        workflow: snapshot.documents["specs/workflow.yaml"] ?? null,
        workflow_control: snapshot.runtimeMode === "adaptive"
          ? { mode: "adaptive", action_selectors: adaptiveActionCandidates(snapshot) }
          : await evaluateWorkflowControl(snapshot),
      },
      candidates: [],
    };
  }
  const resolved = resolveItem(snapshot, selector);
  if (resolved.item || resolved.candidates.length) return resolved;
  const projections = [
    ...historyProjection(snapshot),
    ...diagnosticProjection(snapshot),
  ];
  const matches = projections.filter((item) => record(item).selector === selector);
  return { item: matches.length === 1 ? matches[0] : undefined, candidates: [] };
}

export function formatStatusHuman(status: Awaited<ReturnType<typeof buildStatus>>): string {
  const runStatus = typeof status.run.status === "string" ? status.run.status : "unknown";
  const activeStages = status.workflow_control.subflows
    .filter((item) => item.kind === "instance" && item.active_stage_id)
    .map((item) => `${String(item.instance_id)}:${String(item.active_stage_id)}`);
  return [
    `ResearchSpec workspace: ${status.workspace}`,
    "Status: initialized",
    `Run status: ${runStatus}`,
    `Active instances: ${activeStages.length ? activeStages.join(", ") : "none"}`,
    `Pending items: ${String(status.pending_items.length)}`,
    `Blocking gates: ${String(status.blocking_gates.length)}`,
    `Ready work items: ${String(status.workflow_control.ready_items.length)}`,
    `Installed tools: ${String(status.tools.selected.length)}`,
    `Selected plugins: ${String(status.plugins.selected.length)}`,
    `Projected plugins: ${String(status.plugins.projected.length)}`,
    `Literature adapters: ${status.literature_adapters.length ? status.literature_adapters.map((adapter) => `${adapter.adapter_id}=${adapter.state}`).join(", ") : "none"}`,
    "",
  ].join("\n");
}

export function formatCaseStatusHuman(status: CaseStatusSummary): string {
  return [
    `ResearchSpec workspace: ${status.workspace_id}`,
    `Run: ${status.run_id}`,
    `Lifecycle: ${status.lifecycle}`,
    `Active instances: ${status.active_instance_ids.length ? status.active_instance_ids.join(", ") : "none"}`,
    `Pending Gates: ${String(status.pending.gate_count)}`,
    `Pending Decisions: ${String(status.pending.decision_count)}`,
    `Recommended actions: ${String(status.recommended_actions.length)}`,
    `Allowed actions: ${String(status.allowed_actions.length)}`,
    `Blocking diagnostics: ${String(status.diagnostic_counts.blocking ?? 0)}`,
    "",
  ].join("\n");
}

async function listProjection(snapshot: WorkspaceSnapshot, type: ListType): Promise<unknown[]> {
  if (type === "actions") {
    const control = snapshot.runtimeMode === "strict" ? await evaluateWorkflowControl(snapshot) : undefined;
    const candidates = snapshot.runtimeMode === "adaptive" ? adaptiveActionCandidates(snapshot) : actionCandidates(snapshot, control as Awaited<ReturnType<typeof evaluateWorkflowControl>>);
    const descriptors = await Promise.all(candidates.map((selector) => buildActionDescriptor(snapshot, selector, control)));
    return descriptors.filter((item): item is NonNullable<typeof item> => Boolean(item)).sort(compareSelector);
  }
  if (type === "history") return historyProjection(snapshot);
  if (type === "case-actions") return caseActionProjection(snapshot);
  if (type === "diagnostics") return diagnosticProjection(snapshot);
  return listItems(snapshot, type).map((item) => ({
    selector: item.selector,
    type: item.type,
    id: item.id,
    path: item.path ?? null,
    value: item.value,
    ...(item.history ? { history: item.history } : {}),
  })).sort(compareSelector);
}

function actionCandidates(
  snapshot: WorkspaceSnapshot,
  control: Awaited<ReturnType<typeof evaluateWorkflowControl>>,
  pendingGates?: Record<string, unknown>[],
  pendingChanges?: IndexedItem[],
  pendingPatches?: IndexedItem[],
): string[] {
  const gates = pendingGates ?? latestById(snapshot.gates.filter((item) => item.authority !== "imported_evidence"), "gate_id")
    .filter((item) => item.blocking === true && item.verdict !== "pass");
  const changes = pendingChanges ?? snapshot.changes.filter((item) => pendingStatus(item.value));
  const patches = pendingPatches ?? snapshot.patches.filter((item) => pendingPatchStatus(item.value));
  return [...new Set([
    ...control.subflows.filter((item) => item.kind === "template" || item.kind === "child").map((item) => item.selector),
    ...control.work_items.map((item) => item.selector),
    ...control.gates.map((item) => item.selector),
    ...control.transitions.map((item) => item.selector),
    ...gates.map((item) => `gate:${String(item.gate_id)}`),
    ...changes.map((item) => item.selector),
    ...patches.map((item) => item.selector),
  ])];
}

function historyProjection(snapshot: WorkspaceSnapshot): unknown[] {
  const events = [
    ...snapshot.decisions.map((value) => historyItem("decision-event", value, "event_id", "timestamp")),
    ...snapshot.gates.map((value) => historyItem("gate-event", value, "event_id", "timestamp")),
    ...(snapshot.runState?.subflows ?? []).map((value) => ({
      selector: `subflow:${value.instance_id}`,
      type: "subflow",
      timestamp: value.started_at,
      value,
    })),
    ...snapshot.attempts.map((value) => ({
      selector: `attempt:${value.attempt_id}`,
      type: "attempt",
      timestamp: value.recorded_at,
      value,
    })),
  ];
  return events.sort(compareHistory);
}

function caseActionProjection(snapshot: WorkspaceSnapshot): unknown[] {
  const latestDecisions = latestById(
    snapshot.decisions.filter((item) => item.authority !== "imported_evidence"),
    "decision_id",
  );
  const latestGates = latestById(
    snapshot.gates.filter((item) => item.authority !== "imported_evidence"),
    "gate_id",
  );
  const overriddenGateIds = new Set(latestDecisions
    .filter((item) => item.status === "accepted" && item.decision_type === "gate_override" && typeof item.gate_id === "string")
    .map((item) => String(item.gate_id)));
  const proposedDecisions = latestDecisions
    .filter((item) => item.status === "proposed" || item.status === "postponed")
    .map((value) => ({
      selector: `decision:${String(value.decision_id)}`,
      type: "decision",
      id: String(value.decision_id),
      value,
    }));
  const blockingGates = latestGates
    .filter((item) => item.blocking === true && item.verdict !== "pass" && !overriddenGateIds.has(String(item.gate_id)))
    .map((value) => ({
      selector: `gate:${String(value.gate_id)}`,
      type: "gate",
      id: String(value.gate_id),
      value,
    }));
  const canonicalItemSelectors = new Set([...snapshot.changes, ...snapshot.patches].map((item) => item.selector));
  return [
    ...(snapshot.caseState?.case_actions ?? []).filter((value) => !canonicalItemSelectors.has(value.selector)).map((value) => ({
      selector: value.selector,
      type: "case_action",
      id: value.action_id,
      value,
    })),
    ...snapshot.changes,
    ...snapshot.patches,
    ...proposedDecisions,
    ...blockingGates,
  ]
    .filter((item) => item.type === "patch" ? pendingPatchStatus(item.value) : item.type === "case_action" && record(item.value).kind === "patch" ? pendingPatchStatus(item.value) : pendingStatus(item.value))
    .map((item) => ({ selector: item.selector, type: item.type, id: item.id, value: item.value }))
    .sort(compareSelector);
}

function diagnosticProjection(snapshot: WorkspaceSnapshot): unknown[] {
  return snapshot.diagnostics.map((diagnostic) => {
    const id = sha256(`${JSON.stringify({ code: diagnostic.code, path: diagnostic.path ?? null, severity: diagnostic.severity, blocking: diagnostic.blocking })}\n`).slice(0, 16);
    return { selector: `diagnostic:${id}`, type: "diagnostic", value: diagnostic };
  }).sort(compareSelector);
}

function historyItem(type: string, value: Record<string, unknown>, idKey: string, timestampKey: string) {
  const id = safeId(value[idKey]) ?? sha256(`${JSON.stringify(value)}\n`).slice(0, 16);
  return { selector: `${type}:${id}`, type, timestamp: typeof value[timestampKey] === "string" ? value[timestampKey] : "", value };
}

function compareSelector(left: unknown, right: unknown): number {
  return text(record(left).selector).localeCompare(text(record(right).selector));
}

function compareHistory(left: unknown, right: unknown): number {
  const leftRecord = record(left);
  const rightRecord = record(right);
  return text(leftRecord.timestamp).localeCompare(text(rightRecord.timestamp))
    || text(leftRecord.selector).localeCompare(text(rightRecord.selector));
}

function encodeCursor(value: { v: 1; type: ListType; offset: number; basis_sha256: string }): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeCursor(cursor: string, type: ListType, basisSha256: string): number {
  let value: unknown;
  try {
    value = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as unknown;
  } catch {
    throw new RuntimeQueryError("page_cursor_invalid", "Page cursor is malformed.");
  }
  const decoded = record(value);
  if (decoded.v !== 1 || decoded.type !== type || !Number.isInteger(decoded.offset) || Number(decoded.offset) < 0 || typeof decoded.basis_sha256 !== "string") {
    throw new RuntimeQueryError("page_cursor_invalid", "Page cursor does not match this collection.");
  }
  if (decoded.basis_sha256 !== basisSha256) throw new RuntimeQueryError("page_cursor_stale", "Page cursor basis has changed.");
  return Number(decoded.offset);
}

export class RuntimeQueryError extends Error {
  constructor(readonly code: "page_cursor_invalid" | "page_cursor_stale", message: string) {
    super(message);
    this.name = "RuntimeQueryError";
  }
}

function pendingStatus(value: unknown): boolean {
  const status = record(value).status;
  return status === undefined || status === "pending" || status === "proposed" || status === "postponed";
}

function pendingPatchStatus(value: unknown): boolean {
  const status = record(value).status;
  return status === undefined || status === "pending" || status === "proposed" || status === "postponed" || status === "accepted";
}

function ids(items: Record<string, unknown>[], field: string): string[] {
  return items.map((item) => safeId(item[field])).filter((item): item is string => Boolean(item)).sort().slice(0, 20);
}

function stableActions(actions: ActionAvailability[]): ActionAvailability[] {
  return [...actions].sort((left, right) => left.selector.localeCompare(right.selector));
}

function lifecycle(
  snapshot: WorkspaceSnapshot,
  control: Awaited<ReturnType<typeof evaluateWorkflowControl>>,
  recommended: ActionAvailability[],
  allowed: ActionAvailability[],
): CaseStatusSummary["lifecycle"] {
  const status = snapshot.runState?.status;
  if (status === "complete" || status === "failed" || status === "cancelled") return status;
  if (status === "waiting" || control.state === "decision_required" || control.state === "gate_required") return "waiting";
  if (status === "blocked" || (!recommended.length && !allowed.length && snapshot.diagnostics.some((item) => item.blocking))) return "blocked";
  return "open";
}

function safeId(value: unknown): string | undefined {
  return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value) && !value.includes("..") ? value : undefined;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}
