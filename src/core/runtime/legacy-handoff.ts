import type { WorkspaceSnapshot } from "../workspace/snapshot.js";
import { buildStatus } from "./legacy-query.js";

export async function renderHandoff(snapshot: WorkspaceSnapshot): Promise<string> {
  const status = await buildStatus(snapshot);
  const claims = records(record(snapshot.documents["specs/claims.yaml"]).claims);
  const sources = records(record(snapshot.documents["specs/sources.yaml"]).sources);
  const instances = status.workflow_control.subflows.filter((item) => item.kind === "instance");
  return `# ResearchSpec Handoff

## Workspace

- Run: ${text(snapshot.state.run_id, "current")}
- Workflow: ${text(snapshot.state.workflow_id, "unknown")}
- Status: ${text(snapshot.state.status, "unknown")}

## Active Subflow Instances

${instances.length ? instances.map((item) => `- ${text(item.instance_id, "unknown")}: ${text(item.active_stage_id, "unknown")} (${item.state})`).join("\n") : "- None"}

## Current Contracts

- Sources: ${String(sources.length)}
- Claims: ${String(claims.length)}
- Registered artifacts: ${String(snapshot.artifacts.length)}

## Pending Work

${status.pending_items.length ? status.pending_items.map((item) => `- ${item}`).join("\n") : "- None"}

## Blocking Gates

${status.blocking_gates.length ? status.blocking_gates.map((item) => `- ${text(item.gate_id, "unknown")}: ${text(item.verdict, "unknown")}`).join("\n") : "- None"}

## Agent Guidance

Read the stable contracts and current runtime ledgers directly before acting. Do not infer accepted decisions from this rendered view.
`;
}

function record(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function records(value: unknown): Record<string, unknown>[] { return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item)) : []; }
function text(value: unknown, fallback: string): string { return typeof value === "string" ? value : fallback; }
