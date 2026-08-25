import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";

import {
  evaluateGraphFrontier,
  graphChildRunSnapshots,
  GraphRunError,
  overrideGraphGate,
  recordGraphDecision,
  recordGraphGate,
  resolveGraphNodeInputs,
  startGraphRun,
  startGraphChildRun,
  submitGraphNode,
} from "../../core/runtime/graph-run.js";
import { loadGraphWorkspaceIndex } from "../../core/runtime/graph-workspace-index.js";
import { requireGraphWorkspace } from "../../core/workspace/graph-discover.js";
import { validateGraphAgainstCapabilityRegistry } from "../../capabilities/registry.js";
import { getArsuRoute } from "../../arsu-converter/routing/catalog.js";
import { renderArsuRouteSummary } from "../../arsu-converter/routing/projection.js";
import type { ArsuRouteDefinition, RouteRef } from "../../arsu-converter/routing/contracts.js";
import type { CurrentCheckTarget } from "../../core/validation/types.js";
import { pluginWorkspaceDiagnostics } from "../../plugins/graph-check.js";
import { loadWorkspaceCapabilityRegistry } from "../../plugins/runtime-capabilities.js";
import { loadGraphPluginStatusView } from "../../plugins/graph-status.js";
import { CliError, success, type CommandContext, type CommandResult } from "../types.js";

export type GraphDoctorOptions = Record<string, never>;
export interface GraphStartOptions { input?: string; selector: string; confirmedBy?: string }
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
  const childStartItems: Array<Record<string, unknown>> = [];
  const pendingGateItems: Array<Record<string, unknown>> = [];
  const pendingDecisionItems: Array<Record<string, unknown>> = [];
  const nodesByRun: Record<string, Array<Record<string, unknown>>> = {};
  const childRuns = graphChildRunSnapshots(index);
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
    const frontier = evaluateGraphFrontier(record.run, record.graph, nodes, childRuns);
    for (const item of frontier.eligible_nodes) frontierItems.push({ selector: item.selector, run_id: record.run.run_id, node_id: item.node_id, ...(item.round === undefined ? {} : { round: item.round }) });
    for (const item of frontier.pending_subgraph_starts) childStartItems.push({ selector: item.selector, run_id: record.run.run_id, node_id: item.node_id, ...(item.round === undefined ? {} : { round: item.round }) });
    for (const selector of frontier.pending_gates) pendingGateItems.push({ selector, run_id: record.run.run_id });
    for (const selector of frontier.pending_decisions) pendingDecisionItems.push({ selector, run_id: record.run.run_id });
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
    stable_specs: {
      project_id: index.project.frontmatter.project_id,
      sources: index.sources.sources.length,
      claims: index.claims.claims.length,
      manuscript_id: index.manuscript.manuscript_id,
    },
    agent_tools: {
      selected: index.config.agent_tools.selected,
      delivery: index.config.agent_tools.delivery,
      installations: index.manifest.installations.length,
    },
    literature_adapters: { selected: index.config.literature_adapters.selected },
    profiles: [...index.profiles.values()].map((profile) => ({ profile_id: profile.profile_id, profile_version: profile.profile_version })),
    runs: { total: index.runs.length, active: index.runs.filter((item) => item.run?.status === "active").length },
    nodes: nodesByRun,
    frontier: frontierItems,
    pending_subgraph_starts: childStartItems,
    pending_gates: pendingGateItems,
    pending_decisions: pendingDecisionItems,
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
    const entryInstructions = profile.entries.flatMap((entry) => {
      let route: ArsuRouteDefinition | undefined;
      if (entry.route_ref) {
        try { route = getArsuRoute(entry.route_ref as RouteRef); }
        catch {
          throw new CliError("profile_route_binding_invalid", `Profile entry ${profileId}/${entry.entry_id} references an unknown route: ${entry.route_ref}`, 1);
        }
      }
      const summary = route ? renderArsuRouteSummary(route) : undefined;
      const entryNodeIds = entry.kind === "end-to-end" ? [entry.node_id] : entry.entry_points;
      return entryNodeIds.map((entryNodeId) => {
        const node = profile.nodes.find((item) => item.node_id === entryNodeId);
        if (!node) throw new CliError("profile_route_binding_invalid", `Profile entry ${profileId}/${entry.entry_id} references an unknown node: ${entryNodeId}`, 1);
        return {
          entry_id: entry.entry_id,
          entry_node_id: entryNodeId,
          ...(entry.route_ref ? { route_ref: entry.route_ref } : {}),
          title: route?.title ?? `${profile.profile_id}: ${entry.entry_id}`,
          prerequisites: summary?.prerequisites ?? (node.input_bindings.length > 0
            ? `profile inputs: ${node.input_bindings.map((item) => item.role).join(", ")}`
            : "none"),
          required_input_roles: node.input_bindings.map((item) => item.role),
          boundary_outputs: route?.boundary_outputs ?? node.expected_outputs.map((output) => ({
            role: output.role,
            type: output.role,
            purpose: `Profile-declared boundary output ${output.role}.`,
            structure: "The capability package defines the semantic structure and validation requirements.",
            validation_profile: "text-artifact" as const,
          })),
          expected_output_roles: node.expected_outputs,
          formal_gates: profile.gates,
          decisions: profile.decisions,
          risk_cost: summary?.risk_cost ?? "profile-defined; inspect capability packages before confirmation",
          confirmation: "root-run confirmation authorizes the frozen graph; each formal Gate and Decision remains separately confirmed",
        };
      });
    });
    return success("instructions", {
      selector,
      kind: "profile",
      profile_id: profile.profile_id,
      profile_version: profile.profile_version,
      capability_registry_version: profile.capability_registry_version,
      entries: entryInstructions,
      node_count: profile.nodes.length,
      start_input: {
        schema_version: "2",
        confirmed_at: "<rfc3339>",
        entry_id: "<entry-id>",
        entry_node_id: "<entry-node-id>",
        route_ref: "<route-ref>",
        prerequisites: [],
        handoff_inputs: [],
        planned_outputs: [],
        formal_gates: [],
        cost: { effort: "<effort>", interaction: "<interaction>" },
      },
    }, { stdout: `Graph profile instructions: ${profileId}\n` });
  }
  if (selector.startsWith("change:")) {
    const changeId = selector.slice("change:".length);
    const record = [...index.changes, ...index.archivedChanges].find((item) => item.id === changeId);
    if (!record) throw new CliError("change_not_found", `Project change not found: ${changeId}`, 1);
    const pending = ["draft", "proposed"].includes(record.change.status);
    return success("instructions", {
      selector,
      kind: "change",
      change: record.change,
      archived: record.archived,
      documents: ["change.md", ...record.documents.keys()],
      allowed_actions: record.archived ? [] : pending ? ["decide"] : ["archive"],
      mutation_authority: "researchspec decide/archive",
    }, { stdout: `Change instructions: ${changeId}\n` });
  }
  if (selector.startsWith("run:")) {
    const runId = selector.slice("run:".length);
    const record = index.runs.find((item) => item.run?.run_id === runId);
    if (!record?.run || !record.graph) throw new CliError("run_not_found", `Run not found: ${runId}`, 1);
    const nodes = record.nodeEntries.flatMap((entry) => entry.node ? [entry.node] : []);
    const frontier = evaluateGraphFrontier(record.run, record.graph, nodes, graphChildRunSnapshots(index));
    return success("instructions", {
      selector,
      kind: "run",
      run: record.run,
      frontier: frontier.eligible_nodes,
      pending_subgraph_starts: frontier.pending_subgraph_starts,
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
    const frontier = evaluateGraphFrontier(record.run, record.graph, nodes, graphChildRunSnapshots(index));
    const eligible = [...frontier.eligible_nodes, ...frontier.pending_subgraph_starts].some((item) => item.node_id === nodeId && item.round === round);
    if (!eligible) {
      const related = frontier.blockers.filter((blocker) => blocker.node_id === nodeId);
      throw new CliError("node_not_eligible", `Node is not currently eligible: ${nodeId}`, 3, undefined, {
        selector,
        blockers: related.length > 0 ? related : [{ code: "prerequisites_unmet", refs: definition.prerequisites }],
      });
    }
    let capability: Record<string, unknown> | null = null;
    const stableSpecPaths: Record<string, string> = {};
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
      const stableSpecBySchema: Record<string, string> = {
        "specs.project": "researchspec/specs/project.md",
        "specs.sources": "researchspec/specs/sources.yaml",
        "specs.claims": "researchspec/specs/claims.yaml",
        "specs.manuscript": "researchspec/specs/manuscript.yaml",
      };
      for (const declaredInput of registered.manifest.inputs) {
        const stablePath = stableSpecBySchema[declaredInput.schema_ref];
        if (stablePath) stableSpecPaths[declaredInput.role] = stablePath;
      }
    }
    if (!record.handoff) throw new CliError("run_incomplete", `Run handoff is missing: ${runId}`, 1);
    let resolvedInputs;
    try {
      resolvedInputs = resolveGraphNodeInputs({
        run: record.run,
        graph: record.graph,
        handoff: record.handoff.frontmatter,
        nodes,
        childRuns: graphChildRunSnapshots(index),
        nodeId,
        round,
        stableSpecPaths,
      });
    } catch (error) {
      throw graphControlCliError(error);
    }
    return success("instructions", {
      selector,
      kind: "node",
      run_id: runId,
      node: definition,
      capability,
      round: round ?? null,
      eligible,
      resolved_inputs: resolvedInputs,
      expected_output_roles: definition.expected_outputs,
      required_gate_ids: definition.required_gate_ids,
      required_decision_ids: definition.required_decision_ids,
      ...(definition.delivery_requirement ? {
        child_start_input: {
          schema_version: "2",
          manuscript_delivery: {
            delivery: "<confirmed manuscript delivery contract>",
            quarto_probe: "<captured Quarto availability snapshot for QMD>",
          },
        },
      } : {}),
    }, { stdout: `Node instructions: ${selector}\n` });
  }
  const gateMatch = /^gate:([^/]+)\/([^@]+)(?:@(\d+))?$/.exec(selector);
  if (gateMatch) {
    const runId = gateMatch[1] ?? "";
    const gateId = gateMatch[2] ?? "";
    const round = gateMatch[3] === undefined ? undefined : Number(gateMatch[3]);
    const record = index.runs.find((item) => item.run?.run_id === runId);
    const gate = record?.graph?.gates.find((item) => item.gate_id === gateId);
    if (!gate) throw new CliError("gate_not_found", `Gate not found: ${gateId}`, 1);
    return success("instructions", { selector, kind: "gate", run_id: runId, gate, round: round ?? null, allowed_actions: ["confirm", "override_failed"] }, { stdout: `Gate instructions: ${selector}\n` });
  }
  const decisionMatch = /^decision:([^/]+)\/([^@]+)(?:@(\d+))?$/.exec(selector);
  if (decisionMatch) {
    const runId = decisionMatch[1] ?? "";
    const decisionId = decisionMatch[2] ?? "";
    const round = decisionMatch[3] === undefined ? undefined : Number(decisionMatch[3]);
    const record = index.runs.find((item) => item.run?.run_id === runId);
    const decision = record?.graph?.decisions.find((item) => item.decision_id === decisionId);
    if (!decision) throw new CliError("decision_not_found", `Decision not found: ${decisionId}`, 1);
    return success("instructions", { selector, kind: "decision", run_id: runId, decision, round: round ?? null, allowed_actions: ["choose"] }, { stdout: `Decision instructions: ${selector}\n` });
  }
  throw new CliError("selector_invalid", `Unsupported graph selector: ${selector}`, 2);
}

export async function handleGraphStart(options: GraphStartOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = await graphWorkspace(context);
  const index = await loadGraphWorkspaceIndex(workspace);
  const nodeMatch = /^node:([^/]+)\/([^@]+)(?:@(\d+))?$/.exec(options.selector);
  if (nodeMatch) {
    if (options.confirmedBy) throw new CliError("child_start_options_invalid", "Child-run start inherits parent authorization and does not accept --confirmed-by.", 2);
    let command: unknown;
    if (options.input) {
      try { command = parseYaml(await readFile(path.resolve(context.cwd, options.input), "utf8")); }
      catch (error) { throw new CliError("start_input_unreadable", `Cannot read child Start input: ${error instanceof Error ? error.message : String(error)}`, 2); }
    }
    try {
      const result = await startGraphChildRun({
        index,
        parentRunId: nodeMatch[1] ?? "",
        nodeId: nodeMatch[2] ?? "",
        ...(nodeMatch[3] === undefined ? {} : { round: Number(nodeMatch[3]) }),
        ...(command === undefined ? {} : { command }),
        startedAt: new Date().toISOString(),
        dryRun: context.dryRun,
      });
      return success("start", { ...result, dry_run: context.dryRun }, { stdout: `${result.status === "already_started" ? "Already started" : context.dryRun ? "Would start" : "Started"} ${result.run_id}.\n` });
    } catch (error) { throw graphControlCliError(error); }
  }
  const profileId = options.selector.startsWith("profile:") ? options.selector.slice("profile:".length) : options.selector;
  if (!options.input) throw new CliError("input_required", "Root run start requires --input.", 2);
  if (!options.confirmedBy?.trim()) throw new CliError("confirmation_missing", "Root run start requires --confirmed-by.", 2);
  let command: unknown;
  try { command = parseYaml(await readFile(path.resolve(context.cwd, options.input), "utf8")); }
  catch (error) { throw new CliError("start_input_unreadable", `Cannot read Start input: ${error instanceof Error ? error.message : String(error)}`, 2); }
  try {
    const profile = index.profiles.get(profileId);
    if (profile) {
      const capabilityRegistry = await loadWorkspaceCapabilityRegistry(index);
      const validation = validateGraphAgainstCapabilityRegistry(capabilityRegistry, profile);
      if (validation.length > 0) {
        throw new CliError("profile_capability_invalid", `Graph profile references unavailable capabilities: ${validation.map((item) => `${item.path}: ${item.message}`).join("; ")}`, 1, undefined, validation);
      }
    }
    const result = await startGraphRun({ index, profileId, command, confirmedBy: options.confirmedBy, dryRun: context.dryRun });
    return success("start", { ...result, dry_run: context.dryRun }, { stdout: `${result.status === "already_started" ? "Already started" : context.dryRun ? "Would start" : "Started"} ${result.run_id}.\n` });
  } catch (error) { throw graphControlCliError(error); }
}

export async function handleGraphDecide(selector: string, options: GraphDecideOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = await graphWorkspace(context);
  const index = await loadGraphWorkspaceIndex(workspace);
  const actor = requireActor(options.actorName);
  const now = new Date().toISOString();
  const gateMatch = /^gate:([^/]+)\/([^@]+)(?:@(\d+))?$/.exec(selector);
  if (gateMatch) {
    const runId = gateMatch[1] ?? "";
    const gateId = gateMatch[2] ?? "";
    const round = gateMatch[3] === undefined ? undefined : Number(gateMatch[3]);
    try {
      if (options.override) {
        if (options.verdict) throw new CliError("decide_options_invalid", "--override cannot be combined with --verdict.", 2);
        const node = await overrideGraphGate({ index, runId, gateId, ...(round === undefined ? {} : { round }), approvedBy: actor, approvedAt: now, reason: options.reason ?? "", dryRun: context.dryRun });
        return success("decide", { selector, action: "gate_override", node, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would override" : "Overrode"} ${selector}.\n` });
      }
      if (!options.verdict) throw new CliError("verdict_required", "Gate Decide requires --verdict or --override.", 2);
      const node = await recordGraphGate({ index, runId, gateId, ...(round === undefined ? {} : { round }), verdict: options.verdict, confirmedBy: actor, confirmedAt: now, summary: options.reason ?? "", dryRun: context.dryRun });
      return success("decide", { selector, action: "gate_attempt", node, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would record" : "Recorded"} ${selector}.\n` });
    } catch (error) { throw graphControlCliError(error); }
  }
  const decisionMatch = /^decision:([^/]+)\/([^@]+)(?:@(\d+))?$/.exec(selector);
  if (decisionMatch) {
    if (!options.choice) throw new CliError("decision_choice_required", "Decision Decide requires --choice.", 2);
    const runId = decisionMatch[1] ?? "";
    const decisionId = decisionMatch[2] ?? "";
    const round = decisionMatch[3] === undefined ? undefined : Number(decisionMatch[3]);
    try {
      const node = await recordGraphDecision({ index, runId, decisionId, ...(round === undefined ? {} : { round }), choice: options.choice, decidedBy: actor, decidedAt: now, dryRun: context.dryRun });
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
  const diagnostics = index.diagnostics.filter((item) => target === "all" || diagnosticMatchesTarget(item.path, target));
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
  const diagnostics = [...index.diagnostics, ...await pluginWorkspaceDiagnostics(index, true)];
  const report = { workspace, healthy: diagnostics.every((item) => !item.blocking), diagnostics };
  const human = report.healthy
    ? { stdout: `ResearchSpec Doctor found no graph workspace damage: ${workspace}\n` }
    : { stderr: `ResearchSpec Doctor found ${String(diagnostics.length)} diagnostic(s): ${workspace}\n${diagnostics.map((item) => `- [${item.code}] ${item.path ?? ""} ${item.message}`).join("\n")}\n` };
  return { ...success("doctor", report, human), ok: report.healthy, exitCode: report.healthy ? 0 : 1, diagnostics };
}

function diagnosticMatchesTarget(filePath: string | undefined, target: CurrentCheckTarget): boolean {
  if (!filePath) return true;
  const normalized = filePath.split(path.sep).join("/");
  if (target === "specs") return normalized.includes("/specs/");
  if (target === "profiles") return normalized.includes("/profiles/");
  if (target === "runs") return normalized.includes("/runs/") && !normalized.endsWith("/handoff.md");
  if (target === "handoffs") return normalized.endsWith("/handoff.md");
  if (target === "changes") return normalized.includes("/changes/");
  if (target === "tools") return normalized.includes("tool-installation-manifest") || normalized.includes("/.agents/") || normalized.includes("/.claude/");
  if (target === "plugins") return normalized.includes("/plugins/") || normalized.includes("plugin");
  if (target === "literature-adapters") return normalized.includes("zotero") || normalized.includes("literature");
  return true;
}
