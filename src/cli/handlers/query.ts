import { getArsuRoute } from "../../arsu-converter/routing/catalog.js";
import { standaloneProfileOwner } from "../../arsu-converter/routing/owners.js";
import type { RouteRef } from "../../arsu-converter/routing/contracts.js";
import { ControlSelectorSchema } from "../../core/contracts/control-selector.js";
import { currentHandoff } from "../../core/runtime/handoff.js";
import {
  buildCurrentStatus,
  listCurrentItemsPage,
  showCurrentItem,
  type CurrentListType,
} from "../../core/runtime/query.js";
import { evaluateWorkflowControl } from "../../core/runtime/workflow-control.js";
import { loadCurrentWorkspaceIndex } from "../../core/runtime/workspace-index.js";
import { runCurrentWorkspaceChecks } from "../../core/validation/current-check.js";
import type { CurrentCheckTarget } from "../../core/validation/types.js";
import { inspectLiteratureAdapters } from "../../literature-adapters/inspect.js";
import { CliError, success, type CommandContext, type CommandResult } from "../types.js";
import {
  currentHandoffCliError,
  currentQueryCliError,
  isRecord,
  parseOwnedSelector,
  requireCurrentWorkspace,
} from "./shared.js";

export type CurrentDoctorOptions = Record<string, never>;
export interface CurrentListOptions { limit?: string; cursor?: string }

export async function handleCurrentStatus(context: CommandContext): Promise<CommandResult> {
  const workspace = await requireCurrentWorkspace(context);
  const index = await loadCurrentWorkspaceIndex(workspace);
  const adapterInspection = await inspectLiteratureAdapters(index);
  const checked = await runCurrentWorkspaceChecks(workspace, "all", false);
  const diagnostics = checked.diagnostics;
  const workflow = evaluateWorkflowControl(index);
  const controls = index.subflows.map((item) => item.control);
  const derived = buildCurrentStatus(index);
  const data = {
    ...derived,
    frontier: workflow.frontier,
    pending_gates: workflow.pending_gates,
    pending_decisions: workflow.pending_decisions,
    blockers: workflow.blockers,
    literature_adapters: adapterInspection.adapters,
    diagnostics,
  };
  const ok = diagnostics.every((item) => !item.blocking);
  const stdout = [
    `ResearchSpec current workspace: ${workspace}`,
    `Profile: ${index.profile.profile_id}@${index.profile.profile_version}`,
    `Stable facts: ${String(index.sources.sources.length)} sources, ${String(index.claims.claims.length)} claims, ${String(index.manuscript.outline.length)} manuscript sections`,
    `Subflows: ${String(controls.length)} total, ${String(data.active_instances.length)} active or resumable`,
    `Frontier: ${String(workflow.frontier.length)} available action(s)`,
    `Pending changes: ${String(data.pending_changes.length)}`,
  ].join("\n") + "\n";
  return { ...success("status", data, { stdout }), ok, exitCode: ok ? 0 : 1, diagnostics };
}

export async function handleCurrentList(type: string | undefined, options: CurrentListOptions, context: CommandContext): Promise<CommandResult> {
  const allowed: CurrentListType[] = ["subflows", "changes", "gates", "decisions", "handoffs", "profiles", "tools", "diagnostics", "history"];
  const resolved = (type ?? "subflows") as CurrentListType;
  if (!allowed.includes(resolved)) throw new CliError("invalid_list_type", `Unknown current list type: ${resolved}`, 2);
  const workspace = await requireCurrentWorkspace(context);
  const index = await loadCurrentWorkspaceIndex(workspace);
  if (resolved === "diagnostics") index.diagnostics = (await runCurrentWorkspaceChecks(workspace, "all", false)).diagnostics;
  const limit = options.limit === undefined ? undefined : Number(options.limit);
  try {
    const page = listCurrentItemsPage(index, resolved, { ...(limit === undefined ? {} : { limit }), ...(options.cursor ? { cursor: options.cursor } : {}) });
    const selectors = page.items.map((item) => isRecord(item) && typeof item.selector === "string" ? item.selector : JSON.stringify(item));
    return success("list", page, { stdout: selectors.length ? `${selectors.join("\n")}\n` : `No ${resolved}.\n` });
  } catch (error) { throw currentQueryCliError(error); }
}

export async function handleCurrentShow(selector: string, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireCurrentWorkspace(context);
  const index = await loadCurrentWorkspaceIndex(workspace);
  try {
    const item = showCurrentItem(index, selector);
    if (item === undefined) throw new CliError("item_not_found", `Item not found: ${selector}`, 1);
    return success("show", item, { stdout: `${JSON.stringify(item, null, 2)}\n` });
  } catch (error) {
    if (error instanceof CliError) throw error;
    throw currentQueryCliError(error);
  }
}

export async function handleCurrentInstructions(selector: string, context: CommandContext): Promise<CommandResult> {
  if (!ControlSelectorSchema.safeParse(selector).success) throw new CliError("selector_invalid", `Invalid current selector: ${selector}`, 2);
  const workspace = await requireCurrentWorkspace(context);
  const index = await loadCurrentWorkspaceIndex(workspace);
  const workflow = evaluateWorkflowControl(index);
  if (selector.startsWith("change:")) {
    const changeId = selector.slice("change:".length);
    const records = [...index.changes, ...index.archivedChanges].filter((item) => item.id === changeId);
    if (records.length !== 1) throw new CliError(records.length ? "change_ambiguous" : "change_not_found", `Change selector must resolve exactly once: ${changeId}`, records.length ? 3 : 1);
    const record = records[0];
    return success("instructions", {
      selector,
      kind: "change",
      archived: record?.archived,
      frontmatter: record?.change,
      body: record?.body,
      documents: [...(record?.documents.keys() ?? [])],
      allowed_actions: record?.archived ? ["show", "pack"] : record?.change.status === "proposed" ? ["edit", "decide", "check"] : ["edit", "check", "archive"],
      accepted_does_not_apply_specs: true,
    }, { stdout: `Project change instructions: ${changeId}\n` });
  }
  if (selector.startsWith("handoff:")) {
    const instanceId = selector.slice("handoff:".length);
    try {
      const handoff = currentHandoff(index, instanceId);
      return success("instructions", { selector, kind: "handoff", path: handoff.path, handoff: handoff.handoff, body: handoff.body, allowed_actions: ["render", "edit", "replace"] }, { stdout: `Handoff instructions: ${instanceId}\n` });
    } catch (error) { throw currentHandoffCliError(error); }
  }
  if (selector.startsWith("route:")) {
    const routeRef = selector.slice("route:".length) as RouteRef;
    let route;
    try { route = getArsuRoute(routeRef); }
    catch { throw new CliError("route_not_found", `Unknown route: ${routeRef}`, 1); }
    const candidates = workflow.frontier.filter((item) => item.kind === "route" && item.selector === selector);
    const owner = standaloneProfileOwner(routeRef);
    const selectedProfile = owner ? index.profiles?.get(owner) : index.profile;
    const profileEntry = selectedProfile?.entries.find((item) => item.route_ref === routeRef);
    const childCandidates = candidates.filter((item) => item.kind === "route" && item.node_id !== undefined);
    const firstChild = childCandidates[0];
    const standaloneGateIds = selectedProfile?.gates.map((item) => item.gate_id) ?? [];
    const formalGates = childCandidates.length === 1
      ? selectedProfile?.children.find((item) => item.node_id === (firstChild?.kind === "route" ? firstChild.node_id : undefined))?.required_gate_ids ?? []
      : standaloneProfileOwner(routeRef) ? (route.gate_policy.level === "none" ? [] : (standaloneGateIds.length > 0 ? standaloneGateIds : route.gate_policy.gate_kinds))
        : profileEntry || route.gate_policy.level !== "required" ? [] : route.gate_policy.gate_kinds;
    const childDefinition = childCandidates.length === 1 && firstChild?.kind === "route"
      ? selectedProfile?.children.find((item) => item.node_id === firstChild.node_id)
      : undefined;
    const usesManuscript = routeRef.startsWith("academic-paper:")
      || routeRef.startsWith("academic-paper-reviewer:")
      || routeRef.startsWith("academic-pipeline:")
      || standaloneProfileOwner(routeRef) !== undefined;
    const qmdProbeExpected = index.manuscript.delivery.working_format === "qmd"
      && (routeRef.startsWith("academic-paper:") || routeRef.startsWith("academic-pipeline:") || standaloneProfileOwner(routeRef) !== undefined);
    const formatConversion = routeRef === "academic-paper:format-convert";
    return success("instructions", {
      selector,
      kind: "route",
      route,
      stable_prerequisites: route.prerequisite_groups,
      current_candidates: candidates,
      planned_output_types: route.boundary_outputs.map((item) => item.type),
      boundary_outputs: route.boundary_outputs,
      required_input_roles: childDefinition?.required_input_roles ?? [],
      formal_gates: formalGates,
      cost: route.cost,
      confirmation_required: true,
      manuscript_delivery: usesManuscript ? {
        current: index.manuscript.delivery,
        selection_required: index.manuscript.delivery.working_format === null,
        snapshot_required: true,
      } : null,
      tool_requirements: usesManuscript ? {
        quarto: {
          probe_command: ["quarto", "--version"],
          probe_owner: "agent",
          probe_required_before_start: qmdProbeExpected,
          availability_required_before_start: formatConversion,
          allowed_statuses: ["available", "unavailable", "unknown"],
          read_only: true,
          installs_dependencies: false,
          contacts_network: false,
          writes_workspace: false,
          probe_timing: [
            "before confirming a first manuscript working format",
            "before starting or resuming QMD writing",
            "immediately before academic-paper:format-convert",
          ],
        },
      } : null,
      start_input: {
        schema_version: "1",
        confirmed_at: "<rfc3339>",
        ...(profileEntry ? { profile_entry: profileEntry.entry_id } : {}),
        prerequisites: [],
        handoff_inputs: [],
        planned_outputs: [],
        ...(usesManuscript ? { manuscript_delivery: index.manuscript.delivery } : {}),
        ...(qmdProbeExpected ? { quarto_probe: { status: "<available|unavailable|unknown>", checked_at: "<rfc3339>" } } : {}),
        formal_gates: formalGates,
        cost: route.cost,
      },
    }, { stdout: `Route instructions: ${routeRef}\nConfirmation required before each instance start.\n` });
  }
  const parsed = parseOwnedSelector(selector);
  const record = index.subflows.find((item) => item.control.instance_id === parsed.instanceId);
  if (!record) throw new CliError("subflow_not_found", `Subflow not found: ${parsed.instanceId}`, 1);
  if (parsed.kind === "subflow") {
    return success("instructions", {
      selector,
      kind: "subflow",
      control: record.control,
      handoff: record.handoff,
      frontier: workflow.frontier.filter((item) => "instance_id" in item && item.instance_id === parsed.instanceId),
      blockers: workflow.blockers.filter((item) => item.instance_id === parsed.instanceId),
    }, { stdout: `Subflow instructions: ${parsed.instanceId}\n` });
  }
  if (parsed.kind === "gate") {
    const gate = record.control.gates.find((item) => item.gate_id === parsed.localId);
    if (!gate) throw new CliError("gate_not_found", `Gate not found: ${parsed.localId}`, 1);
    return success("instructions", { selector, kind: "gate", gate, handoff: record.handoff, allowed_actions: ["confirm", "reverify", "override_failed"] }, { stdout: `Gate instructions: ${parsed.localId}\n` });
  }
  const decision = record.control.decisions.find((item) => item.decision_id === parsed.localId);
  const branch = index.profile.branches.find((item) => item.decision_id === parsed.localId && item.owner_node_id === record.control.parent?.node_id);
  return success("instructions", { selector, kind: "decision", decision: decision ?? null, branch: branch ?? null, allowed_kinds: ["scope", "claim", "structure", "branch"] }, { stdout: `Decision instructions: ${parsed.localId}\n` });
}

export async function handleCurrentCheck(target: string | undefined, strict: boolean, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireCurrentWorkspace(context);
  const validTargets: CurrentCheckTarget[] = ["all", "specs", "profiles", "subflows", "changes", "handoffs", "tools", "plugins", "literature-adapters"];
  const resolvedTarget = (target ?? "all") as CurrentCheckTarget;
  if (!validTargets.includes(resolvedTarget)) throw new CliError("invalid_check_target", `Unknown check target: ${resolvedTarget}`, 2);
  const data = await runCurrentWorkspaceChecks(workspace, resolvedTarget, strict);
  const human = data.ok
    ? { stdout: `ResearchSpec check passed: ${workspace}\n` }
    : { stderr: `ResearchSpec check failed: ${workspace}\n${data.diagnostics.map((item) => `- [${item.code}] ${item.path ?? ""} ${item.message}`).join("\n")}\n` };
  return { command: "check", ok: data.ok, exitCode: data.ok ? 0 : 1, data, diagnostics: data.diagnostics, human };
}

export async function handleCurrentDoctor(_options: CurrentDoctorOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireCurrentWorkspace(context);
  const data = await runCurrentWorkspaceChecks(workspace, "all", false);
  const report = { workspace, healthy: data.ok, diagnostics: data.diagnostics };
  const human = data.ok
    ? { stdout: `ResearchSpec Doctor found no current workspace damage: ${workspace}\n` }
    : { stderr: `ResearchSpec Doctor found ${String(data.diagnostics.length)} diagnostic(s): ${workspace}\n${data.diagnostics.map((item) => `- [${item.code}] ${item.path ?? ""} ${item.message}`).join("\n")}\n` };
  return { ...success("doctor", report, human), ok: data.ok, exitCode: data.ok ? 0 : 1, diagnostics: data.diagnostics };
}
