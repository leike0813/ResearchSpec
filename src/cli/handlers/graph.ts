import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";

import {
  evaluateGraphFrontier,
  GraphRunError,
  overrideGraphGate,
  recordGraphDecision,
  recordGraphGate,
  startGraphRun,
  submitGraphNode,
} from "../../core/runtime/graph-run.js";
import { loadGraphWorkspaceIndex } from "../../core/runtime/graph-workspace-index.js";
import { requireGraphWorkspace } from "../../core/workspace/graph-discover.js";
import { validateGraphAgainstCapabilityRegistry } from "../../capabilities/registry.js";
import type { CurrentCheckTarget } from "../../core/validation/types.js";
import { pluginWorkspaceDiagnostics } from "../../plugins/graph-check.js";
import { loadWorkspaceCapabilityRegistry } from "../../plugins/runtime-capabilities.js";
import { loadGraphPluginStatusView } from "../../plugins/graph-status.js";
import { CliError, success, type CommandContext, type CommandResult } from "../types.js";

export type GraphDoctorOptions = Record<string, never>;
export interface GraphStartOptions { input: string; profile: string; confirmedBy: string }
export interface GraphDecideOptions {
  verdict?: "pass" | "pass_with_conditions" | "fail";
  override?: boolean;
  choice?: string;
  actorName?: string;
  reason?: string;
  decision?: "accept" | "reject" | "defer" | "supersede";
}
export interface GraphAdvanceOptions { input?: string; actorName?: string }

function graphControlCliError(error: unknown): CliError {
  if (!(error instanceof GraphRunError)) return new CliError("graph_control_internal_error", error instanceof Error ? error.message : String(error), 4);
  return new CliError(error.code, error.message, error.kind === "usage" ? 2 : error.kind === "conflict" ? 3 : 1, undefined, error.details);
}

async function graphWorkspace(context: CommandContext): Promise<string> {
  try {
    return await requireGraphWorkspace(context.cwd, context.workspace);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new CliError("workspace_unsupported", message, 1);
  }
}

function requireActor(actor: string | undefined): string {
  const trimmed = actor?.trim();
  if (!trimmed) throw new CliError("actor_required", "This command requires --actor-name.", 2);
  return trimmed;
}

export async function handleGraphStatus(context: CommandContext): Promise<CommandResult> {
  const workspace = await graphWorkspace(context);
  const index = await loadGraphWorkspaceIndex(workspace);
  const plugins = await loadGraphPluginStatusView(index);
  const frontierItems: Array<Record<string, unknown>> = [];
  const nodesByRun: Record<string, Array<Record<string, unknown>>> = {};
  for (const record of index.runs) {
    if (!record.run || !record.graph) continue;
    const nodes = record.nodeEntries.flatMap((entry) => entry.node ? [entry.node] : []);
    nodesByRun[record.run.run_id] = nodes.map((node) => ({
      node_instance_id: node.node_instance_id,
      node_id: node.node_id,
      ...(node.round === undefined ? {} : { round: node.round }),
      state: node.state,
      updated_at: node.updated_at,
    }));
    for (const item of evaluateGraphFrontier(record.run, record.graph, nodes).eligible_nodes) frontierItems.push({ selector: item.selector, run_id: record.run.run_id, node_id: item.node_id, ...(item.round === undefined ? {} : { round: item.round }) });
  }
  const diagnostics = [...index.diagnostics];
  if (!plugins.loadable) {
    diagnostics.push({
      severity: "warning",
      code: "plugin_status_unavailable",
      message: `Plugin status is unavailable: ${plugins.error ?? "unknown error"}`,
      blocking: false,
    });
  }
  const data = {
    schema_version: "2",
    workspace,
    profiles: [...index.profiles.values()].map((profile) => ({ profile_id: profile.profile_id, profile_version: profile.profile_version })),
    runs: { total: index.runs.length, active: index.runs.filter((item) => item.run?.status === "active").length },
    nodes: nodesByRun,
    frontier: frontierItems,
    plugins,
    diagnostics_summary: { blocking: diagnostics.filter((item) => item.blocking).length, warning: diagnostics.filter((item) => !item.blocking).length },
  };
  const ok = data.diagnostics_summary.blocking === 0;
  return {
    ...success("status", data, { stdout: [
      `ResearchSpec graph workspace: ${workspace}`,
      `Profiles: ${String(data.profiles.length)}; runs: ${String(data.runs.total)}; frontier: ${String(data.frontier.length)} action(s)`,
      `Plugins: ${String(plugins.selected.length)} selected, ${String(plugins.resolved_skills.length)} Skills, ${String(plugins.resolved_capability_ids.length)} capabilities, ${String(plugins.resolved_profile_ids.length)} profiles`,
      `Diagnostics: ${String(data.diagnostics_summary.blocking)} blocking, ${String(data.diagnostics_summary.warning)} warning`,
    ].join("\n") + "\n" }),
    ok,
    exitCode: ok ? 0 : 1,
    diagnostics,
  };
}

export async function handleGraphInstructions(selector: string, context: CommandContext): Promise<CommandResult> {
  const workspace = await graphWorkspace(context);
  const index = await loadGraphWorkspaceIndex(workspace);
  if (selector.startsWith("profile:")) {
    const profileId = selector.slice("profile:".length);
    const profile = index.profiles.get(profileId);
    const source = index.profileFiles.get(profileId);
    if (!profile || !source) throw new CliError("profile_not_found", `Graph profile not found: ${profileId}`, 1);
    return success("instructions", {
      selector,
      kind: "profile",
      profile_id: profile.profile_id,
      profile_version: profile.profile_version,
      capability_registry_version: profile.capability_registry_version,
      entries: profile.entries,
      node_count: profile.nodes.length,
      start_input: {
        schema_version: "2",
        confirmed_at: "<rfc3339>",
        entry_id: "<entry-id>",
        entry_node_id: "<entry-node-id>",
        prerequisites: [],
        handoff_inputs: [],
        planned_outputs: [],
        formal_gates: [],
        cost: { effort: "<effort>", interaction: "<interaction>" },
      },
    }, { stdout: `Graph profile instructions: ${profileId}\n` });
  }
  if (selector.startsWith("run:")) {
    const runId = selector.slice("run:".length);
    const record = index.runs.find((item) => item.run?.run_id === runId);
    if (!record?.run || !record.graph) throw new CliError("run_not_found", `Run not found: ${runId}`, 1);
    const nodes = record.nodeEntries.flatMap((entry) => entry.node ? [entry.node] : []);
    const frontier = evaluateGraphFrontier(record.run, record.graph, nodes);
    return success("instructions", {
      selector,
      kind: "run",
      run: record.run,
      frontier: frontier.eligible_nodes,
      pending_gates: frontier.pending_gates,
      pending_decisions: frontier.pending_decisions,
      blockers: frontier.blockers,
      completion_ready: frontier.completion_ready,
    }, { stdout: `Run instructions: ${runId}\n` });
  }
  const nodeMatch = /^node:([^/]+)\/([^@]+)(?:@(\d+))?$/.exec(selector);
  if (nodeMatch) {
    const runId = nodeMatch[1] ?? "";
    const nodeId = nodeMatch[2] ?? "";
    const round = nodeMatch[3] === undefined ? undefined : Number(nodeMatch[3]);
    const record = index.runs.find((item) => item.run?.run_id === runId);
    if (!record?.run || !record.graph) throw new CliError("run_not_found", `Run not found: ${runId}`, 1);
    const definition = record.graph.nodes.find((item) => item.node_id === nodeId);
    if (!definition) throw new CliError("node_not_found", `Node not found: ${nodeId}`, 1);
    const nodes = record.nodeEntries.flatMap((entry) => entry.node ? [entry.node] : []);
    const eligible = evaluateGraphFrontier(record.run, record.graph, nodes).eligible_nodes.some((item) => item.node_id === nodeId && item.round === round);
    let capability: Record<string, unknown> | null = null;
    if (definition.kind === "capability" && definition.capability_id !== undefined) {
      const registry = await loadWorkspaceCapabilityRegistry(index);
      const registered = registry.capabilities.get(definition.capability_id);
      if (!registered) throw new CliError("capability_unknown", `Capability is not registered for this run: ${definition.capability_id}`, 1);
      capability = {
        capability_id: registered.manifest.capability_id,
        title: registered.manifest.title,
        description: registered.manifest.description,
        class: registered.manifest.class,
        node_kind: registered.manifest.node_kind,
        execution_type: registered.manifest.execution_type,
        params: registered.manifest.params ?? {},
        inputs: registered.manifest.inputs,
        outputs: registered.manifest.outputs,
        validators: registered.manifest.validators,
        knowledge_refs: registered.manifest.knowledge_refs,
        gate_policy: registered.manifest.gate_policy,
      };
    }
    return success("instructions", {
      selector,
      kind: "node",
      run_id: runId,
      node: definition,
      capability,
      round: round ?? null,
      eligible,
      required_input_roles: definition.input_bindings,
      expected_output_roles: definition.expected_outputs,
      required_gate_ids: definition.required_gate_ids,
      required_decision_ids: definition.required_decision_ids,
    }, { stdout: `Node instructions: ${selector}\n` });
  }
  const gateMatch = /^gate:([^/]+)\/(.+)$/.exec(selector);
  if (gateMatch) {
    const runId = gateMatch[1] ?? "";
    const gateId = gateMatch[2] ?? "";
    const record = index.runs.find((item) => item.run?.run_id === runId);
    const gate = record?.graph?.gates.find((item) => item.gate_id === gateId);
    if (!gate) throw new CliError("gate_not_found", `Gate not found: ${gateId}`, 1);
    return success("instructions", { selector, kind: "gate", run_id: runId, gate, allowed_actions: ["confirm", "override_failed"] }, { stdout: `Gate instructions: ${selector}\n` });
  }
  const decisionMatch = /^decision:([^/]+)\/(.+)$/.exec(selector);
  if (decisionMatch) {
    const runId = decisionMatch[1] ?? "";
    const decisionId = decisionMatch[2] ?? "";
    const record = index.runs.find((item) => item.run?.run_id === runId);
    const decision = record?.graph?.decisions.find((item) => item.decision_id === decisionId);
    if (!decision) throw new CliError("decision_not_found", `Decision not found: ${decisionId}`, 1);
    return success("instructions", { selector, kind: "decision", run_id: runId, decision, allowed_actions: ["choose"] }, { stdout: `Decision instructions: ${selector}\n` });
  }
  throw new CliError("selector_invalid", `Unsupported graph selector: ${selector}`, 2);
}

export async function handleGraphStart(options: GraphStartOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = await graphWorkspace(context);
  const index = await loadGraphWorkspaceIndex(workspace);
  let command: unknown;
  try { command = parseYaml(await readFile(path.resolve(context.cwd, options.input), "utf8")); }
  catch (error) { throw new CliError("start_input_unreadable", `Cannot read Start input: ${error instanceof Error ? error.message : String(error)}`, 2); }
  try {
    const profile = index.profiles.get(options.profile);
    if (profile) {
      const capabilityRegistry = await loadWorkspaceCapabilityRegistry(index);
      const validation = validateGraphAgainstCapabilityRegistry(capabilityRegistry, profile);
      if (validation.length > 0) {
        throw new CliError("profile_capability_invalid", `Graph profile references unavailable capabilities: ${validation.map((item) => `${item.path}: ${item.message}`).join("; ")}`, 1, undefined, validation);
      }
    }
    const result = await startGraphRun({ index, profileId: options.profile, command, confirmedBy: options.confirmedBy, dryRun: context.dryRun });
    return success("start", { ...result, dry_run: context.dryRun }, { stdout: `${result.status === "already_started" ? "Already started" : context.dryRun ? "Would start" : "Started"} ${result.run_id}.\n` });
  } catch (error) { throw graphControlCliError(error); }
}

export async function handleGraphDecide(selector: string, options: GraphDecideOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = await graphWorkspace(context);
  const index = await loadGraphWorkspaceIndex(workspace);
  const actor = requireActor(options.actorName);
  const now = new Date().toISOString();
  const gateMatch = /^gate:([^/]+)\/(.+)$/.exec(selector);
  if (gateMatch) {
    const runId = gateMatch[1] ?? "";
    const gateId = gateMatch[2] ?? "";
    try {
      if (options.override) {
        if (options.verdict) throw new CliError("decide_options_invalid", "--override cannot be combined with --verdict.", 2);
        const node = await overrideGraphGate({ index, runId, gateId, approvedBy: actor, approvedAt: now, reason: options.reason ?? "", dryRun: context.dryRun });
        return success("decide", { selector, action: "gate_override", node, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would override" : "Overrode"} ${selector}.\n` });
      }
      if (!options.verdict) throw new CliError("verdict_required", "Gate Decide requires --verdict or --override.", 2);
      const node = await recordGraphGate({ index, runId, gateId, verdict: options.verdict, confirmedBy: actor, confirmedAt: now, summary: options.reason ?? "", dryRun: context.dryRun });
      return success("decide", { selector, action: "gate_attempt", node, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would record" : "Recorded"} ${selector}.\n` });
    } catch (error) { throw graphControlCliError(error); }
  }
  const decisionMatch = /^decision:([^/]+)\/(.+)$/.exec(selector);
  if (decisionMatch) {
    if (!options.choice) throw new CliError("decision_choice_required", "Decision Decide requires --choice.", 2);
    const runId = decisionMatch[1] ?? "";
    const decisionId = decisionMatch[2] ?? "";
    try {
      const node = await recordGraphDecision({ index, runId, decisionId, choice: options.choice, decidedBy: actor, decidedAt: now, dryRun: context.dryRun });
      return success("decide", { selector, action: "decision_choice", node, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would decide" : "Decided"} ${selector}.\n` });
    } catch (error) { throw graphControlCliError(error); }
  }
  throw new CliError("selector_invalid", "Graph Decide requires gate:<run>/<gate> or decision:<run>/<decision>.", 2);
}

export async function handleGraphAdvance(selector: string, options: GraphAdvanceOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = await graphWorkspace(context);
  const index = await loadGraphWorkspaceIndex(workspace);
  const nodeMatch = /^node:([^/]+)\/([^@]+)(?:@(\d+))?$/.exec(selector);
  if (!nodeMatch) throw new CliError("selector_invalid", "Graph Advance requires node:<run>/<node>[@round].", 2);
  if (!options.input) throw new CliError("input_required", "Node Advance requires --input with {outputs:[{role,path}]}.", 2);
  const runId = nodeMatch[1] ?? "";
  const nodeId = nodeMatch[2] ?? "";
  const round = nodeMatch[3] === undefined ? undefined : Number(nodeMatch[3]);
  let payload: unknown;
  try { payload = parseYaml(await readFile(path.resolve(context.cwd, options.input), "utf8")); }
  catch (error) { throw new CliError("advance_input_unreadable", `Cannot read Advance input: ${error instanceof Error ? error.message : String(error)}`, 2); }
  if (typeof payload !== "object" || payload === null || !Array.isArray((payload as { outputs?: unknown }).outputs)) {
    throw new CliError("advance_input_invalid", "Advance input must contain an outputs array.", 2);
  }
  const outputs = (payload as { outputs: Array<{ role: string; path: string }> }).outputs;
  try {
    const capabilityRegistry = await loadWorkspaceCapabilityRegistry(index);
    const result = await submitGraphNode({ index, runId, nodeId, ...(round === undefined ? {} : { round }), outputs, submittedAt: new Date().toISOString(), dryRun: context.dryRun, capabilityRegistry });
    return success("advance", { selector, node: result.node, created: result.created, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would advance" : "Advanced"} ${selector}.\n` });
  } catch (error) { throw graphControlCliError(error); }
}

export async function handleGraphCheck(strict: boolean, context: CommandContext, target: CurrentCheckTarget = "all"): Promise<CommandResult> {
  const workspace = await graphWorkspace(context);
  const index = await loadGraphWorkspaceIndex(workspace);
  const diagnostics = [...index.diagnostics];
  if (target === "all" || target === "plugins") diagnostics.push(...await pluginWorkspaceDiagnostics(index, target === "plugins"));
  const ok = diagnostics.every((item) => !item.blocking && (!strict || item.severity !== "warning"));
  const human = ok
    ? { stdout: `ResearchSpec graph check passed: ${workspace}\n` }
    : { stderr: `ResearchSpec graph check failed: ${workspace}\n${diagnostics.map((item) => `- [${item.code}] ${item.path ?? ""} ${item.message}`).join("\n")}\n` };
  return { command: "check", ok, exitCode: ok ? 0 : 1, data: { workspace, target, diagnostics }, diagnostics, human };
}

export async function handleGraphDoctor(context: CommandContext): Promise<CommandResult> {
  const workspace = await graphWorkspace(context);
  const index = await loadGraphWorkspaceIndex(workspace);
  const report = { workspace, healthy: index.diagnostics.length === 0, diagnostics: index.diagnostics };
  const human = report.healthy
    ? { stdout: `ResearchSpec Doctor found no graph workspace damage: ${workspace}\n` }
    : { stderr: `ResearchSpec Doctor found ${String(index.diagnostics.length)} diagnostic(s): ${workspace}\n${index.diagnostics.map((item) => `- [${item.code}] ${item.path ?? ""} ${item.message}`).join("\n")}\n` };
  return { ...success("doctor", report, human), ok: report.healthy, exitCode: report.healthy ? 0 : 1, diagnostics: index.diagnostics };
}
