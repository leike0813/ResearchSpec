import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { confirm } from "@inquirer/prompts";
import { parse as parseYaml, stringify } from "yaml";

import { installationRecords } from "../adapters/installations.js";
import { detectTools, orderTools, parseToolExpression } from "../adapters/tools.js";
import { planWorkspaceDelivery } from "../adapters/workspace-delivery.js";
import { inspectLiteratureAdapters } from "../literature-adapters/inspect.js";
import { selectedPluginIds } from "../plugins/status.js";
import { getArsuRoute } from "../arsu-converter/routing/catalog.js";
import type { RouteRef } from "../arsu-converter/routing/contracts.js";
import { ControlSelectorSchema } from "../core/contracts/control-selector.js";
import {
  advanceSubflow,
  appendGateAttempt,
  overrideFailedGate,
  recordLocalDecision,
  startSubflow,
  SubflowControlError,
  type GateVerdict,
  type LocalDecisionKind,
} from "../core/runtime/subflow-control.js";
import { evaluateWorkflowControl } from "../core/runtime/workflow-control.js";
import { loadCurrentWorkspaceIndex } from "../core/runtime/workspace-index.js";
import { runCurrentWorkspaceChecks } from "../core/validation/current-check.js";
import type { CurrentCheckTarget } from "../core/validation/types.js";
import { resolveWorkspace } from "../core/workspace/discover.js";
import { getWorkspaceEntries, getWorkspaceTemplates, resolveInitTarget } from "../core/workspace/layout.js";
import { executeWritePlan, planFile, type PlannedWrite } from "../core/workspace/write-plan.js";
import { fileExists } from "../utils/fs.js";
import { CliError, success, type CommandContext, type CommandResult } from "./types.js";
import { searchableMultiSelect } from "./prompts/searchable-multi-select.js";
import type { LoadedPluginRegistry } from "../plugins/registry.js";
import {
  assertPluginsAvailable,
  authoritativeWrite,
  bundledPluginRegistry,
  deliveryResult,
  formatPlan,
  operationDiagnostics,
  pluginManifestText,
  previewSummary,
  summarizePlan,
  writableCount,
} from "./handlers.js";

export interface CurrentInitOptions { tools?: string }
export interface CurrentUpdateOptions { tools?: string }
export type CurrentDoctorOptions = Record<string, never>;
export interface CurrentStartOptions { input: string; confirmedBy: string }
export interface CurrentAdvanceOptions { transition?: string; actorName?: string }
export interface CurrentDecideOptions {
  verdict?: GateVerdict;
  kind?: LocalDecisionKind;
  choice?: string;
  override?: boolean;
  reason?: string;
  evidenceRole?: string;
  actorName?: string;
  decision?: string;
}

export async function handleCurrentInit(inputPath: string | undefined, options: CurrentInitOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = context.workspace ? path.resolve(context.cwd, context.workspace) : resolveInitTarget(inputPath, context.cwd);
  if (await fileExists(workspace)) throw new CliError("workspace_exists", `Initialization target already exists: ${workspace}`, 1, "Use researchspec update for a current workspace or choose an empty project.");
  const projectRoot = path.dirname(workspace);
  const pluginRegistry = await bundledPluginRegistry();
  const detected = await detectTools(projectRoot);
  const selected = await selectTools({ configured: [], detected, expression: options.tools, context, fresh: true });
  const configuredPlugins: string[] = [];

  const operations: PlannedWrite[] = [];
  for (const template of getWorkspaceTemplates()) {
    if (["config.yaml", "tool-installation-manifest.json", "profiles/academic-pipeline.yaml"].includes(template.relativePath)) continue;
    operations.push(await planFile({
      path: path.join(workspace, template.relativePath),
      relativePath: template.relativePath,
      content: template.content,
      scope: "workspace",
      ownership: template.overwritePolicy,
      force: context.force,
    }));
  }
  const delivery = await planWorkspaceDelivery({
    projectRoot,
    workspaceRoot: workspace,
    toolIds: selected,
    selectedToolIds: selected,
    reconciledToolIds: selected,
    existingInstallations: [],
    force: context.force,
    pluginRegistry,
    selectedPluginIds: configuredPlugins,
  });
  operations.push(...delivery.operations);
  operations.push(await authoritativeWrite(
    path.join(workspace, "config.yaml"),
    "config.yaml",
    stringify({ schema_version: "1", agent_tools: { selected, delivery: "both" }, plugins: { selected: configuredPlugins } }),
    "workspace",
    "record current workspace and selected tool intent",
  ));
  operations.push(await authoritativeWrite(
    path.join(workspace, "tool-installation-manifest.json"),
    "tool-installation-manifest.json",
    pluginManifestText(delivery.installations, pluginRegistry, configuredPlugins, undefined, delivery.literatureAdapterResolutions),
    "workspace",
    "commit generated ownership last",
  ));

  if (!context.dryRun && context.interactive && !context.yes) {
    const approved = await confirm({ message: `${previewSummary(operations)}\nApply these ${String(writableCount(operations))} planned file operations?`, default: true });
    if (!approved) throw new CliError("cancelled", "Initialization cancelled.", 1);
  }
  if (!context.dryRun) {
    for (const entry of getWorkspaceEntries(workspace)) if (entry.kind === "dir") await mkdir(entry.path, { recursive: true });
    await executeWritePlan({ operations });
  }
  const diagnostics = [...delivery.diagnostics, ...currentOperationDiagnostics(operations)];
  return deliveryResult(
    "init",
    { workspace, schema_version: "1", selected_tools: selected, selected_plugins: configuredPlugins, dry_run: context.dryRun, plan: summarizePlan(operations) },
    { stdout: formatPlan(context.dryRun ? "ResearchSpec init dry run" : "ResearchSpec workspace initialized", workspace, operations, context.dryRun) },
    diagnostics,
  );
}

export async function handleCurrentUpdate(inputPath: string | undefined, options: CurrentUpdateOptions, context: CommandContext, providedPluginRegistry?: LoadedPluginRegistry): Promise<CommandResult> {
  const workspace = await requireCurrentWorkspace(context, inputPath);
  const index = await loadCurrentWorkspaceIndex(workspace);
  const projectRoot = index.projectRoot;
  const configured = index.config.agent_tools.selected;
  const configuredPlugins = selectedPluginIds(index.config);
  const pluginRegistry = providedPluginRegistry ?? await bundledPluginRegistry();
  assertPluginsAvailable(configuredPlugins, pluginRegistry);
  let targetTools = configured;
  let selected = configured;
  if (options.tools !== undefined) {
    try { targetTools = parseToolExpression(options.tools); }
    catch (error) { throw new CliError("invalid_tools", error instanceof Error ? error.message : String(error), 2); }
    selected = options.tools === "none" ? [] : [...new Set([...configured, ...targetTools])];
  }
  const existingInstallations = installationRecords(index.manifest.installations);
  const delivery = await planWorkspaceDelivery({
    projectRoot,
    workspaceRoot: workspace,
    toolIds: targetTools,
    selectedToolIds: selected,
    existingInstallations,
    force: context.force,
    pluginRegistry,
    selectedPluginIds: configuredPlugins,
    reconciledToolIds: targetTools,
  });
  const operations = [...delivery.operations];
  if (selected.join("\0") !== configured.join("\0")) {
    operations.push(await authoritativeWrite(
      path.join(workspace, "config.yaml"),
      "config.yaml",
      stringify({ ...index.config, agent_tools: { ...index.config.agent_tools, selected } }),
      "workspace",
      "update selected tool intent",
    ));
  }
  operations.push(await authoritativeWrite(
    path.join(workspace, "tool-installation-manifest.json"),
    "tool-installation-manifest.json",
    pluginManifestText(delivery.installations, pluginRegistry, configuredPlugins, index.manifest, delivery.literatureAdapterResolutions),
    "workspace",
    "commit generated ownership last",
  ));
  const diagnostics = [...delivery.diagnostics, ...currentOperationDiagnostics(operations)];
  if (!context.dryRun && diagnostics.some((item) => item.blocking)) {
    throw new CliError("static_projection_conflict", "Static projection update is blocked by ownership or path conflicts.", 1, "Resolve the reported conflict or use --force only for a manifest-owned drifted projection.", { diagnostics });
  }
  if (!context.dryRun) await executeWritePlan({ operations });
  return deliveryResult(
    "update",
    { workspace, selected_tools: selected, selected_plugins: configuredPlugins, dry_run: context.dryRun, plan: summarizePlan(operations) },
    { stdout: formatPlan(context.dryRun ? "ResearchSpec update dry run" : "ResearchSpec static projections updated", workspace, operations, context.dryRun) },
    diagnostics,
  );
}

export async function handleCurrentStatus(context: CommandContext): Promise<CommandResult> {
  const workspace = await requireCurrentWorkspace(context);
  const index = await loadCurrentWorkspaceIndex(workspace);
  const adapterInspection = await inspectLiteratureAdapters(index);
  const diagnostics = [...index.diagnostics, ...adapterInspection.diagnostics];
  const workflow = evaluateWorkflowControl(index);
  const controls = index.subflows.map((item) => item.control);
  const data = {
    workspace,
    schema_version: index.config.schema_version,
    profile: { id: index.profile.profile_id, version: index.profile.profile_version, path: "profiles/academic-pipeline.yaml" },
    specs: { sources: index.sources.sources.length, claims: index.claims.claims.length, manuscript_sections: index.manuscript.outline.length },
    subflows: summarizeStatuses(controls.map((item) => item.status)),
    active_instances: controls.filter((item) => item.status === "active" || item.status === "paused" || item.status === "blocked").map((item) => ({ instance_id: item.instance_id, route_ref: item.route_ref, status: item.status, checkpoint: item.checkpoint })),
    frontier: workflow.frontier,
    pending_gates: workflow.pending_gates,
    pending_decisions: workflow.pending_decisions,
    blockers: workflow.blockers,
    pending_changes: index.changes.filter((item) => item.status === "proposed" || item.status === "accepted"),
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

export async function handleCurrentInstructions(selector: string, context: CommandContext): Promise<CommandResult> {
  if (!ControlSelectorSchema.safeParse(selector).success) throw new CliError("selector_invalid", `Invalid current selector: ${selector}`, 2);
  const workspace = await requireCurrentWorkspace(context);
  const index = await loadCurrentWorkspaceIndex(workspace);
  const workflow = evaluateWorkflowControl(index);
  if (selector.startsWith("route:")) {
    const routeRef = selector.slice("route:".length) as RouteRef;
    let route;
    try { route = getArsuRoute(routeRef); }
    catch { throw new CliError("route_not_found", `Unknown ARSU route: ${routeRef}`, 1); }
    const candidates = workflow.frontier.filter((item) => item.kind === "route" && item.selector === selector);
    const profileEntry = index.profile.entries.find((item) => item.route_ref === routeRef);
    const childCandidates = candidates.filter((item) => item.kind === "route" && item.node_id !== undefined);
    const firstChild = childCandidates[0];
    const formalGates = childCandidates.length === 1
      ? index.profile.children.find((item) => item.node_id === (firstChild?.kind === "route" ? firstChild.node_id : undefined))?.required_gate_ids ?? []
      : profileEntry || route.gate_policy.level !== "required" ? [] : route.gate_policy.gate_kinds;
    return success("instructions", {
      selector,
      kind: "route",
      route,
      stable_prerequisites: route.prerequisite_groups,
      current_candidates: candidates,
      planned_output_types: route.primary_artifact_types,
      formal_gates: formalGates,
      cost: route.cost,
      confirmation_required: true,
      start_input: {
        schema_version: "1",
        confirmed_at: "<rfc3339>",
        ...(profileEntry ? { profile_entry: profileEntry.entry_id } : {}),
        prerequisites: [],
        handoff_inputs: [],
        planned_outputs: [],
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

export async function handleCurrentStart(routeRef: string, options: CurrentStartOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireCurrentWorkspace(context);
  const index = await loadCurrentWorkspaceIndex(workspace);
  let command: unknown;
  try { command = parseYaml(await readFile(path.resolve(context.cwd, options.input), "utf8")); }
  catch (error) { throw new CliError("start_input_unreadable", `Cannot read Start input: ${error instanceof Error ? error.message : String(error)}`, 2); }
  try {
    const result = await startSubflow({ index, routeRef, command, confirmedBy: options.confirmedBy, dryRun: context.dryRun });
    return success("start", { ...result, dry_run: context.dryRun }, { stdout: `${result.status === "already_started" ? "Already started" : context.dryRun ? "Would start" : "Started"} ${result.instance_id}.\n` });
  } catch (error) { throw currentControlCliError(error); }
}

export async function handleCurrentDecide(selector: string | undefined, options: CurrentDecideOptions, context: CommandContext): Promise<CommandResult> {
  if (!selector) throw new CliError("selector_required", "Decide requires a Gate or Decision selector.", 2);
  const parsed = parseOwnedSelector(selector);
  if (parsed.kind === "subflow") throw new CliError("selector_invalid", "Decide requires gate:<instance>/<gate> or decision:<instance>/<decision>.", 2);
  const actor = options.actorName?.trim();
  if (!actor) throw new CliError("human_actor_required", "Decide requires --actor-name.", 2);
  const now = new Date().toISOString();
  const workspace = await requireCurrentWorkspace(context);
  const index = await loadCurrentWorkspaceIndex(workspace);
  try {
    if (parsed.kind === "gate") {
      if (options.override) {
        if (options.verdict) throw new CliError("decide_options_invalid", "--override cannot be combined with --verdict.", 2);
        const control = await overrideFailedGate({ index, instanceId: parsed.instanceId, gateId: parsed.localId, approvedBy: actor, approvedAt: now, reason: options.reason ?? "", dryRun: context.dryRun });
        return success("decide", { selector, action: "override", control, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would override" : "Overrode"} ${selector}.\n` });
      }
      if (!options.verdict) throw new CliError("verdict_required", "Gate Decide requires --verdict or --override.", 2);
      const control = await appendGateAttempt({ index, instanceId: parsed.instanceId, gateId: parsed.localId, verdict: options.verdict, confirmedBy: actor, confirmedAt: now, summary: options.reason ?? "", evidenceRole: options.evidenceRole, dryRun: context.dryRun });
      return success("decide", { selector, action: "gate_attempt", control, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would record" : "Recorded"} ${selector}.\n` });
    }
    if (!options.kind || !options.choice) throw new CliError("decision_input_required", "Local Decision requires --kind and --choice.", 2);
    const control = await recordLocalDecision({ index, instanceId: parsed.instanceId, decisionId: parsed.localId, kind: options.kind, choice: options.choice, decidedBy: actor, decidedAt: now, reason: options.reason, dryRun: context.dryRun });
    return success("decide", { selector, action: "local_decision", control, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would decide" : "Decided"} ${selector}.\n` });
  } catch (error) {
    if (error instanceof CliError) throw error;
    throw currentControlCliError(error);
  }
}

export async function handleCurrentAdvance(selector: string, options: CurrentAdvanceOptions, context: CommandContext): Promise<CommandResult> {
  const parsed = parseOwnedSelector(selector);
  if (parsed.kind !== "subflow") throw new CliError("selector_invalid", "Advance requires subflow:<instance-id>.", 2);
  const actor = options.actorName?.trim();
  if (!actor) throw new CliError("actor_required", "Advance requires --actor-name.", 2);
  const workspace = await requireCurrentWorkspace(context);
  const index = await loadCurrentWorkspaceIndex(workspace);
  try {
    const result = await advanceSubflow({ index, instanceId: parsed.instanceId, transition: options.transition, actor, transitionedAt: new Date().toISOString(), dryRun: context.dryRun });
    return success("advance", { selector, ...result, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would advance" : "Advanced"} ${selector} via ${result.transition}.\n` });
  } catch (error) { throw currentControlCliError(error); }
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

async function selectTools(input: { configured: string[]; detected: string[]; expression?: string; context: CommandContext; fresh: boolean }): Promise<string[]> {
  try {
    if (input.expression !== undefined) return parseToolExpression(input.expression);
    if (input.context.interactive) {
      const ordered = orderTools(input.configured, input.detected);
      return await searchableMultiSelect({
        message: "Select agent tools",
        choices: ordered.map((tool) => ({ name: tool.name, value: tool.id, configured: input.configured.includes(tool.id), detected: input.detected.includes(tool.id), preSelected: input.configured.includes(tool.id) || (input.fresh && input.detected.includes(tool.id)) })),
      });
    }
    if (input.configured.length) return input.configured;
    if (input.detected.length) return input.detected;
    throw new CliError("tools_required", "No agent tools were selected or detected.", 2, "Pass --tools all, --tools none, or a comma-separated tool list.");
  } catch (error) {
    if (error instanceof CliError) throw error;
    throw new CliError("invalid_tools", error instanceof Error ? error.message : String(error), 2);
  }
}

async function requireCurrentWorkspace(context: CommandContext, positional?: string): Promise<string> {
  const resolution = await resolveWorkspace(context.cwd, context.workspace ?? positional);
  if (resolution.status === "found") return resolution.workspace;
  if (resolution.status === "unsupported") throw new CliError("workspace_unsupported", `Unsupported workspace format: ${resolution.path}`, 1, undefined, { reason: resolution.reason });
  if (resolution.status === "invalid") throw new CliError("workspace_invalid", `Invalid ResearchSpec workspace: ${resolution.path}`, 1);
  throw new CliError("workspace_missing", "No researchspec workspace found.", 1, "Run researchspec init to create one.");
}

function summarizeStatuses(statuses: readonly string[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const status of statuses) result[status] = (result[status] ?? 0) + 1;
  return result;
}

function currentOperationDiagnostics(operations: readonly PlannedWrite[]) {
  return operationDiagnostics([...operations]).map((item) => item.code === "generated_file_conflict"
    ? { ...item, severity: "error" as const, blocking: true }
    : item);
}

function parseOwnedSelector(selector: string): { kind: "subflow"; instanceId: string } | { kind: "gate" | "decision"; instanceId: string; localId: string } {
  if (selector.startsWith("subflow:")) return { kind: "subflow", instanceId: selector.slice("subflow:".length) };
  const match = /^(gate|decision):([^/]+)\/(.+)$/.exec(selector);
  if (!match) throw new CliError("selector_invalid", `Unsupported current selector: ${selector}`, 2);
  return { kind: match[1] as "gate" | "decision", instanceId: match[2] ?? "", localId: match[3] ?? "" };
}

function currentControlCliError(error: unknown): CliError {
  if (!(error instanceof SubflowControlError)) return new CliError("control_internal_error", error instanceof Error ? error.message : String(error), 4);
  return new CliError(error.code, error.message, error.kind === "usage" ? 2 : error.kind === "conflict" ? 3 : 1, undefined, error.details);
}
