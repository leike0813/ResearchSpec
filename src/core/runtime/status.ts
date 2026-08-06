import type { Diagnostic } from "../validation/types.js";
import type { CurrentWorkspaceIndex } from "./workspace-index.js";
import type { WorkflowControl, WorkflowFrontierItem } from "./workflow-control.js";

export const MAX_STATUS_ITEMS = 20;
const MAX_BLOCKER_REFS = 5;

export interface BoundedStatusCollection<T> {
  total: number;
  items: T[];
  truncated: boolean;
}

export interface DiagnosticSummary {
  total: number;
  blocking: number;
  error: number;
  warning: number;
  info: number;
  detail_command: string;
}

export interface CompactLiteratureAdapterStatus {
  adapter_id: string;
  install_policy: "fixed" | "optional";
  release_set_id: string;
  state: string;
  connection_state: "unchecked";
  projection_state: string;
  diagnostics_summary: DiagnosticSummary;
  check_selector: "check:literature-adapters";
}

export interface CurrentStatus {
  workspace: string;
  schema_version: string;
  profile: { id: string; version: string };
  specs: { sources: number; claims: number; manuscript_sections: number };
  subflows: {
    total: number;
    by_status: Record<string, number>;
    active_instances: BoundedStatusCollection<{
      selector: string;
      route_ref: string;
      status: string;
      checkpoint: string;
    }>;
  };
  frontier: BoundedStatusCollection<WorkflowFrontierItem>;
  pending_gates: BoundedStatusCollection<string>;
  pending_decisions: BoundedStatusCollection<string>;
  blockers: BoundedStatusCollection<{
    instance_id: string;
    code: string;
    refs: string[];
    refs_total: number;
    refs_truncated: boolean;
  }>;
  agent_tools: {
    selected_count: number;
    delivery: string;
    managed_installation_count: number;
    skill_installation_count: number;
    command_installation_count: number;
  };
  literature_adapters: BoundedStatusCollection<CompactLiteratureAdapterStatus>;
  diagnostics_summary: DiagnosticSummary;
}

export interface StatusLiteratureAdapterInspection {
  adapters: ReadonlyArray<{
    adapter_id: string;
    install_policy: "fixed" | "optional";
    release_set_id: string;
    state: string;
    connection_state: "unchecked";
    skills: { projection_state: string };
    diagnostics: Diagnostic[];
  }>;
  diagnostics: Diagnostic[];
}

export function buildCurrentStatus(
  index: CurrentWorkspaceIndex,
  workflow: WorkflowControl,
  adapterInspection: StatusLiteratureAdapterInspection,
): CurrentStatus {
  const controls = index.subflows.map((item) => item.control);
  const byStatus: Record<string, number> = {};
  for (const control of controls) byStatus[control.status] = (byStatus[control.status] ?? 0) + 1;
  const statusDiagnostics = [...index.diagnostics, ...adapterInspection.diagnostics];
  const installations = index.manifest.installations;
  const skillKinds = new Set(["arsu-skill", "core-skill", "companion-skill", "literature-adapter-skill", "domain-skill"]);

  return {
    workspace: index.workspace,
    schema_version: index.config.schema_version,
    profile: { id: index.profile.profile_id, version: index.profile.profile_version },
    specs: {
      sources: index.sources.sources.length,
      claims: index.claims.claims.length,
      manuscript_sections: index.manuscript.outline.length,
    },
    subflows: {
      total: controls.length,
      by_status: byStatus,
      active_instances: bounded(controls
        .filter((item) => item.status === "active" || item.status === "paused" || item.status === "blocked")
        .map((item) => ({
          selector: `subflow:${item.instance_id}`,
          route_ref: item.route_ref,
          status: item.status,
          checkpoint: item.checkpoint,
        }))),
    },
    frontier: bounded(workflow.frontier),
    pending_gates: bounded(workflow.pending_gates),
    pending_decisions: bounded(workflow.pending_decisions),
    blockers: bounded(workflow.blockers.map((item) => ({
      instance_id: item.instance_id,
      code: item.code,
      refs: item.refs.slice(0, MAX_BLOCKER_REFS),
      refs_total: item.refs.length,
      refs_truncated: item.refs.length > MAX_BLOCKER_REFS,
    }))),
    agent_tools: {
      selected_count: index.config.agent_tools.selected.length,
      delivery: index.config.agent_tools.delivery,
      managed_installation_count: installations.length,
      skill_installation_count: installations.filter((item) => skillKinds.has(item.source.kind)).length,
      command_installation_count: installations.filter((item) => item.source.kind === "command").length,
    },
    literature_adapters: bounded(adapterInspection.adapters.map((adapter) => ({
      adapter_id: adapter.adapter_id,
      install_policy: adapter.install_policy,
      release_set_id: adapter.release_set_id,
      state: adapter.state,
      connection_state: adapter.connection_state,
      projection_state: adapter.skills.projection_state,
      diagnostics_summary: summarizeDiagnostics(adapter.diagnostics, "researchspec check literature-adapters --json"),
      check_selector: "check:literature-adapters" as const,
    }))),
    diagnostics_summary: summarizeDiagnostics(statusDiagnostics, "researchspec list diagnostics --json"),
  };
}

export function summarizeDiagnostics(diagnostics: readonly Diagnostic[], detailCommand: string): DiagnosticSummary {
  return {
    total: diagnostics.length,
    blocking: diagnostics.filter((item) => item.blocking).length,
    error: diagnostics.filter((item) => item.severity === "error").length,
    warning: diagnostics.filter((item) => item.severity === "warning").length,
    info: diagnostics.filter((item) => item.severity === "info").length,
    detail_command: detailCommand,
  };
}

function bounded<T>(items: readonly T[]): BoundedStatusCollection<T> {
  return {
    total: items.length,
    items: items.slice(0, MAX_STATUS_ITEMS),
    truncated: items.length > MAX_STATUS_ITEMS,
  };
}
