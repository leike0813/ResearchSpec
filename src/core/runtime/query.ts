import { InspectionSelectorSchema } from "../contracts/control-selector.js";
import { sha256 } from "../workspace/write-plan.js";
import type { CurrentWorkspaceIndex, ProjectChangeRecord } from "./workspace-index.js";

export type CurrentListType = "subflows" | "changes" | "gates" | "decisions" | "handoffs" | "profiles" | "tools" | "diagnostics" | "history";

export interface CurrentListPage {
  schema_version: "1";
  type: CurrentListType;
  items: unknown[];
  page: { limit: number; total: number; next_cursor: string | null };
}

export function buildCurrentStatus(index: CurrentWorkspaceIndex) {
  const controls = index.subflows.map((item) => item.control);
  const statusCounts: Record<string, number> = {};
  for (const control of controls) statusCounts[control.status] = (statusCounts[control.status] ?? 0) + 1;
  const events = currentHistory(index);
  return {
    workspace: index.workspace,
    schema_version: index.config.schema_version,
    profile: { id: index.profile.profile_id, version: index.profile.profile_version, path: "profiles/academic-pipeline.yaml" },
    specs: { sources: index.sources.sources.length, claims: index.claims.claims.length, manuscript_sections: index.manuscript.outline.length },
    subflows: statusCounts,
    active_instances: controls.filter((item) => item.status === "active" || item.status === "paused" || item.status === "blocked")
      .map((item) => ({ instance_id: item.instance_id, route_ref: item.route_ref, status: item.status, checkpoint: item.checkpoint })),
    recent_instances: [...controls].sort((left, right) => right.started_at.localeCompare(left.started_at) || left.instance_id.localeCompare(right.instance_id)).slice(0, 10)
      .map((item) => ({ instance_id: item.instance_id, route_ref: item.route_ref, status: item.status, started_at: item.started_at })),
    pending_gates: listCurrentItems(index, "gates").filter((item) => record(item).accepted !== true),
    pending_decisions: controls.flatMap((control) => control.gates.filter((gate) => gate.attempts.at(-1)?.verdict === "fail" && !gate.override).map((gate) => ({ selector: `gate:${control.instance_id}/${gate.gate_id}`, kind: "failed_gate_override" }))),
    pending_changes: index.changes.filter((item) => item.change.status === "draft" || item.change.status === "proposed" || item.change.status === "accepted").map(changeProjection),
    recent_history: events.slice(-10).reverse(),
    diagnostics: index.diagnostics,
  };
}

export function listCurrentItems(index: CurrentWorkspaceIndex, type: CurrentListType): unknown[] {
  if (type === "subflows") return index.subflows.map((item) => ({
    selector: `subflow:${item.control.instance_id}`,
    ...item.control,
    children: index.subflows.filter((candidate) => candidate.control.parent?.instance_id === item.control.instance_id).map((candidate) => candidate.control.instance_id),
    directory: item.directoryName,
  }));
  if (type === "changes") return [...index.changes, ...index.archivedChanges].map(changeProjection);
  if (type === "gates") return index.subflows.flatMap((item) => item.control.gates.map((gate) => ({
    selector: `gate:${item.control.instance_id}/${gate.gate_id}`,
    instance_id: item.control.instance_id,
    ...gate,
    accepted: gateAccepted(gate),
  })));
  if (type === "decisions") return index.subflows.flatMap((item) => item.control.decisions.map((decision) => ({ selector: `decision:${item.control.instance_id}/${decision.decision_id}`, instance_id: item.control.instance_id, ...decision })));
  if (type === "handoffs") return index.subflows.map((item) => ({ selector: `handoff:${item.control.instance_id}`, path: item.handoffPath, ...item.handoff, body: item.handoffBody }));
  if (type === "profiles") return [...(index.profiles?.values() ?? [index.profile])].map((profile) => ({ selector: `profile:${profile.profile_id}`, path: `profiles/${profile.profile_id}.yaml`, ...profile }));
  if (type === "tools") return index.config.agent_tools.selected.map((toolId) => ({ selector: `tool:${toolId}`, tool_id: toolId, installation_count: index.manifest.installations.filter((item) => item.tool_id === toolId).length }));
  if (type === "diagnostics") return index.diagnostics.map((diagnostic, indexValue) => ({ selector: `diagnostic:${String(indexValue + 1)}`, ...diagnostic }));
  return currentHistory(index);
}

export function listCurrentItemsPage(index: CurrentWorkspaceIndex, type: CurrentListType, request: { limit?: number; cursor?: string } = {}): CurrentListPage {
  const limit = request.limit ?? 20;
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) throw new RuntimeQueryError("page_limit_invalid", "List limit must be an integer from 1 to 50.");
  const items = listCurrentItems(index, type);
  const basis = sha256(`${JSON.stringify(items)}\n`);
  const offset = request.cursor ? decodeCurrentCursor(request.cursor, type, basis) : 0;
  const pageItems = items.slice(offset, offset + limit);
  const nextOffset = offset + pageItems.length;
  return {
    schema_version: "1",
    type,
    items: pageItems,
    page: { limit, total: items.length, next_cursor: nextOffset < items.length ? encodeCurrentCursor(type, nextOffset, basis) : null },
  };
}

export function showCurrentItem(index: CurrentWorkspaceIndex, selector: string): unknown {
  const parsed = InspectionSelectorSchema.safeParse(selector);
  if (!parsed.success) throw new RuntimeQueryError("selector_invalid", `Invalid current inspection selector: ${selector}`);
  if (selector === "spec:project") return { selector, path: "specs/project.md", frontmatter: index.project.frontmatter, body: index.project.body };
  if (selector === "spec:sources") return { selector, path: "specs/sources.yaml", ...index.sources };
  if (selector === "spec:claims") return { selector, path: "specs/claims.yaml", ...index.claims };
  if (selector === "spec:manuscript") return { selector, path: "specs/manuscript.yaml", ...index.manuscript };
  if (selector.startsWith("profile:")) return listCurrentItems(index, "profiles").find((item) => record(item).selector === selector);
  if (selector.startsWith("change:")) {
    const id = selector.slice("change:".length);
    return uniqueProjection([...index.changes, ...index.archivedChanges].filter((item) => item.id === id).map(changeDetail), selector);
  }
  if (selector.startsWith("handoff:")) return uniqueProjection(listCurrentItems(index, "handoffs").filter((item) => record(item).selector === selector), selector);
  if (selector.startsWith("subflow:")) return uniqueProjection(listCurrentItems(index, "subflows").filter((item) => record(item).selector === selector), selector);
  if (selector.startsWith("gate:")) return uniqueProjection(listCurrentItems(index, "gates").filter((item) => record(item).selector === selector), selector);
  if (selector.startsWith("decision:")) return uniqueProjection(listCurrentItems(index, "decisions").filter((item) => record(item).selector === selector), selector);
  if (selector.startsWith("tool:")) return uniqueProjection(listCurrentItems(index, "tools").filter((item) => record(item).selector === selector), selector);
  return undefined;
}

function currentHistory(index: CurrentWorkspaceIndex): unknown[] {
  const events: Array<Record<string, unknown> & { timestamp: string }> = [];
  for (const item of index.subflows) {
    const instanceId = item.control.instance_id;
    events.push({ kind: "subflow_started", timestamp: item.control.started_at, instance_id: instanceId, selector: `subflow:${instanceId}` });
    for (const gate of item.control.gates) for (const attempt of gate.attempts) events.push({ kind: "gate_confirmed", timestamp: attempt.confirmed_at, instance_id: instanceId, gate_id: gate.gate_id, verdict: attempt.verdict, selector: `gate:${instanceId}/${gate.gate_id}` });
    for (const gate of item.control.gates) if (gate.override) events.push({ kind: "gate_overridden", timestamp: gate.override.approved_at, instance_id: instanceId, gate_id: gate.gate_id, decision_id: gate.override.decision_id, selector: `gate:${instanceId}/${gate.gate_id}` });
    for (const decision of item.control.decisions) events.push({ kind: "decision_recorded", timestamp: decision.decided_at, instance_id: instanceId, decision_id: decision.decision_id, choice: decision.choice, selector: `decision:${instanceId}/${decision.decision_id}` });
    for (const transition of item.control.transitions) events.push({ kind: "subflow_transitioned", timestamp: transition.transitioned_at, instance_id: instanceId, transition_id: transition.transition_id, from: transition.from, to: transition.to, selector: `subflow:${instanceId}` });
  }
  for (const change of [...index.changes, ...index.archivedChanges]) if (change.change.decision) events.push({ kind: "change_decided", timestamp: change.change.decision.decided_at, change_id: change.id, outcome: change.change.decision.outcome, selector: `change:${change.id}`, archived: change.archived });
  return events.sort((left, right) => left.timestamp.localeCompare(right.timestamp) || String(left.selector).localeCompare(String(right.selector)));
}

function changeProjection(recordValue: ProjectChangeRecord): unknown {
  return { selector: `change:${recordValue.id}`, id: recordValue.id, status: recordValue.change.status, targets: recordValue.change.targets, archived: recordValue.archived };
}

function changeDetail(recordValue: ProjectChangeRecord): unknown {
  return { ...record(changeProjection(recordValue)), path: recordValue.changePath, frontmatter: recordValue.change, body: recordValue.body, documents: [...recordValue.documents.keys()] };
}

function gateAccepted(gate: { attempts: Array<{ verdict: string; confirmed_at: string }>; override?: { approved_at: string } | null }): boolean {
  const latest = gate.attempts.at(-1);
  if (!latest) return false;
  if (latest.verdict === "pass" || latest.verdict === "pass_with_conditions") return true;
  return Boolean(gate.override && Date.parse(gate.override.approved_at) >= Date.parse(latest.confirmed_at));
}

function uniqueProjection(items: unknown[], selector: string): unknown {
  if (items.length > 1) throw new RuntimeQueryError("item_ambiguous", `Item selector is ambiguous: ${selector}`);
  return items[0];
}

function encodeCurrentCursor(type: CurrentListType, offset: number, basis: string): string {
  return Buffer.from(JSON.stringify({ version: 1, type, offset, basis }), "utf8").toString("base64url");
}

function decodeCurrentCursor(cursor: string, type: CurrentListType, basis: string): number {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as { version?: unknown; type?: unknown; offset?: unknown; basis?: unknown };
    if (parsed.version !== 1 || parsed.type !== type || !Number.isInteger(parsed.offset) || Number(parsed.offset) < 0) throw new Error("invalid");
    if (parsed.basis !== basis) throw new RuntimeQueryError("page_cursor_stale", "List cursor no longer matches the current workspace scan.");
    return Number(parsed.offset);
  } catch (error) {
    if (error instanceof RuntimeQueryError) throw error;
    throw new RuntimeQueryError("page_cursor_invalid", "List cursor is invalid.");
  }
}


export class RuntimeQueryError extends Error {
  constructor(readonly code: "page_cursor_invalid" | "page_cursor_stale" | "page_limit_invalid" | "selector_invalid" | "item_ambiguous", message: string) {
    super(message);
    this.name = "RuntimeQueryError";
  }
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
