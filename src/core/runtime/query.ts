import type { IndexedItem, WorkspaceSnapshot } from "../workspace/snapshot.js";
import { latestById, resolveItem } from "../workspace/snapshot.js";
import { evaluateWorkflowControl } from "./workflow-control.js";

export type ListType = "changes" | "artifacts" | "gates" | "decisions" | "tools";

export async function buildStatus(snapshot: WorkspaceSnapshot) {
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
  }
}

export function showItem(snapshot: WorkspaceSnapshot, selector: string): { item?: IndexedItem; candidates: IndexedItem[] } {
  return resolveItem(snapshot, selector);
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
    "",
  ].join("\n");
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}
