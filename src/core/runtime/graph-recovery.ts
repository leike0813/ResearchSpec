import type { GraphRun } from "../contracts/graph-workspace.js";
import type { GraphRunScanRecord } from "./graph-workspace-index.js";
import type { GraphFrontier, GraphFrontierBlock, GraphFrontierNode } from "./graph-run.js";

export interface GraphRunDeclaredMaterial {
  role: string;
  origin: "handoff" | "start_confirmation";
  purpose?: string;
  path?: string;
  path_kind?: "file" | "directory";
  entry_path?: string;
  source_run_id?: string;
}

export interface GraphRunDeclaredDelivery {
  inputs: GraphRunDeclaredMaterial[];
  outputs: GraphRunDeclaredMaterial[];
  expected_output_roles: string[];
  prerequisites: string[];
  formal_gates: string[];
}

export interface GraphRunSummary {
  run_id: string;
  profile_id: string;
  profile_version: string;
  entry_id: string;
  entry_node_id: string;
  status: GraphRun["status"];
  unfinished: boolean;
  authorization_origin: GraphRun["authorization_origin"];
  parent_binding?: {
    parent_run_id: string;
    parent_node_id: string;
    subgraph_id: string;
    round?: number;
  };
  declared_delivery: GraphRunDeclaredDelivery;
  frontier: GraphFrontierNode[];
  pending_subgraph_starts: GraphFrontierNode[];
  pending_gates: string[];
  pending_decisions: string[];
  blockers: GraphFrontierBlock[];
  completion_ready: boolean;
  next_inspections: string[];
}

const UNFINISHED_STATUSES: readonly GraphRun["status"][] = ["active", "paused", "blocked"];

export function graphRunIsUnfinished(status: GraphRun["status"]): boolean {
  return UNFINISHED_STATUSES.includes(status);
}

export function buildGraphRunSummary(record: GraphRunScanRecord, frontier: GraphFrontier): GraphRunSummary | undefined {
  const run = record.run;
  if (!run) return undefined;
  return {
    run_id: run.run_id,
    profile_id: run.profile_id,
    profile_version: run.profile_version,
    entry_id: run.entry_id,
    entry_node_id: run.entry_node_id,
    status: run.status,
    unfinished: graphRunIsUnfinished(run.status),
    authorization_origin: run.authorization_origin,
    ...(run.parent_binding === undefined ? {} : { parent_binding: { ...run.parent_binding } }),
    declared_delivery: declaredDelivery(record),
    frontier: frontier.eligible_nodes,
    pending_subgraph_starts: frontier.pending_subgraph_starts,
    pending_gates: frontier.pending_gates,
    pending_decisions: frontier.pending_decisions,
    blockers: frontier.blockers,
    completion_ready: frontier.completion_ready,
    next_inspections: graphRunIsUnfinished(run.status) ? inspectionCommands([
      ...frontier.eligible_nodes.map((item) => item.selector),
      ...frontier.pending_subgraph_starts.map((item) => item.selector),
      ...frontier.pending_gates,
      ...frontier.pending_decisions,
      ...frontier.blockers.flatMap((blocker) => blocker.selector === undefined ? [] : [blocker.selector]),
    ]) : [],
  };
}

function declaredDelivery(record: GraphRunScanRecord): GraphRunDeclaredDelivery {
  const handoff = record.handoff?.frontmatter;
  const confirmation = record.run?.start_confirmation;
  const inputs: GraphRunDeclaredMaterial[] = (handoff?.inputs ?? []).map((entry) => ({
    role: entry.role,
    origin: "handoff",
    purpose: entry.purpose,
    path: entry.path,
    ...(entry.path_kind === undefined ? {} : { path_kind: entry.path_kind }),
    ...(entry.entry_path === undefined ? {} : { entry_path: entry.entry_path }),
    ...(entry.source_run_id === undefined ? {} : { source_run_id: entry.source_run_id }),
  }));
  const planned = (handoff?.outputs ?? []).map((entry) => ({
    role: entry.role,
    origin: "handoff" as const,
    purpose: entry.purpose,
    path: entry.path,
    ...(entry.path_kind === undefined ? {} : { path_kind: entry.path_kind }),
    ...(entry.entry_path === undefined ? {} : { entry_path: entry.entry_path }),
  }));
  const expected = confirmation?.expected_outputs ?? [];
  return {
    inputs,
    outputs: [...planned, ...expected.filter((role) => !planned.some((item) => item.role === role)).map((role) => ({ role, origin: "start_confirmation" as const }))],
    expected_output_roles: expected,
    prerequisites: confirmation?.prerequisites ?? [],
    formal_gates: confirmation?.formal_gates ?? [],
  };
}

function inspectionCommands(selectors: readonly string[]): string[] {
  const seen = new Set<string>();
  const commands: string[] = [];
  for (const selector of selectors) {
    if (seen.has(selector)) continue;
    seen.add(selector);
    commands.push(`instructions ${selector}`);
  }
  return commands;
}
