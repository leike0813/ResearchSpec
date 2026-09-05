import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { stringify } from "yaml";

import {
  GraphNodeInstanceSchema,
  GraphChildRunStartCommandSchema,
  GraphRunSchema,
  GraphRunStartCommandSchema,
  renderRunHandoff,
  RunHandoffSchema,
  type GraphNodeInstance,
  type GraphRun,
  type GraphRunStartCommand,
  type RunHandoff,
} from "../contracts/graph-workspace.js";
import type { CapabilityGraphProfile, GraphDecision, GraphGate } from "../contracts/capability-graph.js";
import { executeWritePlan, planDirectFileEdit, sha256, type PlannedWrite } from "../workspace/write-plan.js";
import type { GraphNodeScanRecord, GraphRunScanRecord, GraphWorkspaceIndex } from "./graph-workspace-index.js";
import { BoundaryPathError, resolveBoundaryPath } from "./boundary-path.js";
import { runCapabilityValidators, type ValidatorInput } from "../../capabilities/validators.js";
import { STABLE_SPEC_PATHS, validateGraphAgainstCapabilityRegistry, type LoadedCapabilityRegistry } from "../../capabilities/registry.js";
import type { CapabilityManifest } from "../contracts/capability-manifest.js";

export class GraphRunError extends Error {
  constructor(readonly code: string, message: string, readonly kind: "usage" | "domain" | "conflict" = "domain", readonly details?: unknown) {
    super(message);
    this.name = "GraphRunError";
  }
}

export interface StartGraphRunInput {
  index: GraphWorkspaceIndex;
  capabilityRegistry: LoadedCapabilityRegistry;
  profileId: string;
  command: unknown;
  confirmedBy: string;
  dryRun?: boolean;
}

export interface StartGraphRunResult {
  status: "started" | "would_start" | "already_started";
  run_id: string;
  directory: string;
  run: GraphRun;
  handoff: RunHandoff;
}

export interface StartGraphChildRunInput {
  index: GraphWorkspaceIndex;
  capabilityRegistry: LoadedCapabilityRegistry;
  parentRunId: string;
  nodeId: string;
  round?: number;
  startedAt: string;
  command?: unknown;
  dryRun?: boolean;
}

export interface GraphFrontierNode {
  node_id: string;
  round?: number;
  selector: string;
}

export interface GraphFrontierBlock {
  node_id: string;
  code: string;
  message: string;
  refs: string[];
}

export interface GraphFrontier {
  eligible_node_ids: string[];
  eligible_nodes: GraphFrontierNode[];
  pending_subgraph_starts: GraphFrontierNode[];
  pending_gates: string[];
  pending_decisions: string[];
  blockers: GraphFrontierBlock[];
  completion_ready: boolean;
}

export interface GraphChildRunSnapshot {
  run: GraphRun;
  graph: CapabilityGraphProfile;
  nodes: readonly GraphNodeInstance[];
  handoff: RunHandoff;
}

export interface ResolvedGraphNodeInput {
  role: string;
  source: "stable_spec" | "handoff" | "node_output" | "parameter";
  path?: string;
  value?: string | number | boolean | null;
  from_node_id?: string;
  source_run_id?: string;
  path_kind?: "file" | "directory";
  entry_path?: string;
}

export interface SubmitGraphNodeInput {
  index: GraphWorkspaceIndex;
  runId: string;
  nodeId: string;
  round?: number;
  outputs: Array<{ role: string; path: string }>;
  submittedAt: string;
  dryRun?: boolean;
  capabilityRegistry: LoadedCapabilityRegistry;
}

export interface SubmitGraphNodeResult {
  node: GraphNodeInstance;
  created: boolean;
  dry_run: boolean;
}

export interface RecordGraphGateInput {
  index: GraphWorkspaceIndex;
  runId: string;
  gateId: string;
  verdict: "pass" | "pass_with_conditions" | "fail";
  confirmedBy: string;
  confirmedAt: string;
  summary: string;
  round?: number;
  dryRun?: boolean;
}

export interface RecordGraphDecisionInput {
  index: GraphWorkspaceIndex;
  runId: string;
  decisionId: string;
  choice: string;
  decidedBy: string;
  decidedAt: string;
  round?: number;
  dryRun?: boolean;
}

export interface OverrideGraphGateInput {
  index: GraphWorkspaceIndex;
  runId: string;
  gateId: string;
  approvedBy: string;
  approvedAt: string;
  reason: string;
  round?: number;
  dryRun?: boolean;
}

export async function startGraphRun(input: StartGraphRunInput): Promise<StartGraphRunResult> {
  const command = GraphRunStartCommandSchema.safeParse(input.command);
  if (!command.success) throw new GraphRunError("run_command_invalid", "Run command does not match graph run start schema.", "usage", command.error.issues);
  const confirmedBy = input.confirmedBy.trim();
  if (!confirmedBy) throw new GraphRunError("confirmation_missing", "Run start requires a human confirmer.", "usage");

  const profile = input.index.profiles.get(input.profileId);
  const profileFile = input.index.profileFiles.get(input.profileId);
  if (!profile || !profileFile) throw new GraphRunError("profile_unknown", `Graph profile is not projected in this workspace: ${input.profileId}`, "usage");

  requireGraphInputContract(input.capabilityRegistry, profile);
  validateEntrySelection(profile, command.data);
  validateSubgraphReferences(profile);

  const identityHash = sha256(JSON.stringify({
    profile_id: profile.profile_id,
    profile_version: profile.profile_version,
    profile_sha256: profileFile.hash,
    command: command.data,
  }));
  const runId = `run-${identityHash.slice(0, 24)}`;
  const existing = input.index.runs.filter((item) => item.run?.run_id === runId);
  if (existing.length > 1) throw new GraphRunError("run_identity_ambiguous", `Multiple runs use ID ${runId}.`, "conflict");
  if (existing.length === 1) {
    const record = existing[0];
    if (record.run && record.graph && record.handoff) {
      return { status: "already_started", run_id: runId, directory: record.directoryPath, run: record.run, handoff: record.handoff.frontmatter };
    }
    throw new GraphRunError("run_identity_damaged", `Existing run identity is invalid or incomplete: ${runId}`, "conflict");
  }

  const run = GraphRunSchema.parse({
    schema_version: "2",
    run_id: runId,
    profile_id: profile.profile_id,
    profile_version: profile.profile_version,
    profile_sha256: profileFile.hash,
    entry_id: command.data.entry_id,
    entry_node_id: command.data.entry_node_id,
    status: "active",
    started_at: command.data.confirmed_at,
    authorization_origin: "human",
    ...(command.data.manuscript_delivery === undefined ? {} : { manuscript_delivery: command.data.manuscript_delivery }),
    start_confirmation: {
      confirmed_by: confirmedBy,
      confirmed_at: command.data.confirmed_at,
      prerequisites: command.data.prerequisites,
      expected_outputs: command.data.planned_outputs.map((item) => item.role),
      formal_gates: command.data.formal_gates,
      cost: command.data.cost,
      ...(command.data.route_ref === undefined ? {} : { route_ref: command.data.route_ref }),
    },
  });
  const handoff = RunHandoffSchema.parse({
    schema_version: "2",
    run_id: runId,
    updated_at: command.data.confirmed_at,
    inputs: command.data.handoff_inputs,
    outputs: command.data.planned_outputs,
  });
  const directory = path.join(input.index.workspace, "runs", runId);
  if (input.dryRun) return { status: "would_start", run_id: runId, directory, run, handoff };

  const temporary = path.join(input.index.workspace, "runs", `.run-${randomUUID()}.tmp`);
  try {
    await mkdir(temporary, { recursive: false });
    await mkdir(path.join(temporary, "nodes"));
    await writeFile(path.join(temporary, "run.yaml"), stringify(run), { encoding: "utf8", flag: "wx" });
    await writeFile(path.join(temporary, "graph.yaml"), profileFile.text, { encoding: "utf8", flag: "wx" });
    await writeFile(path.join(temporary, "handoff.md"), renderRunHandoff(handoff), { encoding: "utf8", flag: "wx" });
    await rename(temporary, directory);
  } catch (error) {
    await rm(temporary, { recursive: true, force: true }).catch(() => undefined);
    if ((error as NodeJS.ErrnoException).code === "EEXIST" || (error as NodeJS.ErrnoException).code === "ENOTEMPTY") {
      throw new GraphRunError("run_create_conflict", `Run directory already exists: ${directory}`, "conflict");
    }
    throw error;
  }
  return { status: "started", run_id: runId, directory, run, handoff };
}

export async function startGraphChildRun(input: StartGraphChildRunInput): Promise<StartGraphRunResult> {
  const parent = requireRun(input.index, input.parentRunId);
  requireActiveRun(parent.run);
  requireGraphInputContract(input.capabilityRegistry, parent.graph);
  const definition = parent.graph.nodes.find((node) => node.node_id === input.nodeId);
  if (!definition) throw new GraphRunError("node_unknown", `Node is not declared by the frozen graph: ${input.nodeId}`, "usage");
  if (definition.kind !== "subgraph" || !definition.subgraph_id) throw new GraphRunError("node_not_subgraph", `Node does not declare a child graph: ${input.nodeId}`, "usage");
  if (definition.multiplicity === "repeatable" && input.round === undefined) throw new GraphRunError("node_round_required", `Repeatable subgraph start requires a round: ${input.nodeId}`, "usage");
  if (definition.multiplicity !== "repeatable" && input.round !== undefined) throw new GraphRunError("node_round_invalid", `Subgraph ${input.nodeId} is not repeatable.`, "usage");
  const childCommand = input.command === undefined ? undefined : GraphChildRunStartCommandSchema.safeParse(input.command);
  if (childCommand && !childCommand.success) throw new GraphRunError("child_run_command_invalid", "Child-run input does not match the child start schema.", "usage", childCommand.error.issues);
  if (childCommand && definition.delivery_requirement === undefined) throw new GraphRunError("child_start_input_forbidden", `Subgraph ${input.nodeId} does not accept delivery input.`, "usage");
  const effectiveRun = childCommand?.success
    ? { ...parent.run, manuscript_delivery: childCommand.data.manuscript_delivery }
    : parent.run;

  const snapshots = graphChildRunSnapshots(input.index);
  const existing = boundChildren(snapshots, input.parentRunId, input.nodeId, input.round);
  if (existing.length > 1) throw new GraphRunError("child_run_ambiguous", `Subgraph node ${input.nodeId} has multiple child runs.`, "conflict");
  if (existing.length === 1) {
    const child = existing[0];
    if (!child) throw new GraphRunError("child_run_missing", "Child run binding disappeared.", "conflict");
    const declaration = parent.graph.subgraphs.find((item) => item.subgraph_id === definition.subgraph_id);
    if (!declaration || !childMatchesDeclaration(child, declaration)) throw new GraphRunError("child_run_binding_invalid", `Existing child run does not match subgraph ${definition.subgraph_id}.`, "conflict");
    const record = input.index.runs.find((candidate) => candidate.run?.run_id === child.run.run_id);
    if (!record) throw new GraphRunError("child_run_missing", `Child run is not indexed: ${child.run.run_id}`, "conflict");
    return { status: "already_started", run_id: child.run.run_id, directory: record.directoryPath, run: child.run, handoff: child.handoff };
  }

  const frontier = evaluateGraphFrontier(effectiveRun, parent.graph, parent.nodeEntries.flatMap((entry) => entry.node ? [entry.node] : []), snapshots);
  if (!frontier.pending_subgraph_starts.some((item) => item.node_id === input.nodeId && item.round === input.round)) {
    throw new GraphRunError("node_not_eligible", `Subgraph node is not currently eligible: ${input.nodeId}`, "conflict", frontier.blockers);
  }

  const declaration = parent.graph.subgraphs.find((item) => item.subgraph_id === definition.subgraph_id);
  if (!declaration) throw new GraphRunError("subgraph_unknown", `Subgraph declaration is missing: ${definition.subgraph_id}`, "domain");
  const childProfile = input.index.profiles.get(declaration.profile_id);
  const childProfileFile = input.index.profileFiles.get(declaration.profile_id);
  const bindingDiagnostics = validateSubgraphNodeBindings(parent.graph, input.nodeId, childProfile);
  if (!childProfile || !childProfileFile || bindingDiagnostics.length > 0) {
    throw new GraphRunError("subgraph_binding_invalid", `Subgraph binding is invalid: ${bindingDiagnostics.join("; ")}`, "domain", bindingDiagnostics);
  }
  requireGraphInputContract(input.capabilityRegistry, childProfile);

  const binding = {
    parent_run_id: input.parentRunId,
    parent_node_id: input.nodeId,
    subgraph_id: declaration.subgraph_id,
    ...(input.round === undefined ? {} : { round: input.round }),
  };
  const manuscriptDelivery = childCommand?.success ? childCommand.data.manuscript_delivery : parent.run.manuscript_delivery;
  const identityHash = sha256(JSON.stringify({ binding, profile_sha256: childProfileFile.hash, entry_id: declaration.entry_id, entry_node_id: declaration.entry_node_id, manuscript_delivery: manuscriptDelivery ?? null }));
  const runId = `run-${identityHash.slice(0, 24)}`;
  const run = GraphRunSchema.parse({
    schema_version: "2",
    run_id: runId,
    profile_id: childProfile.profile_id,
    profile_version: childProfile.profile_version,
    profile_sha256: childProfileFile.hash,
    entry_id: declaration.entry_id,
    entry_node_id: declaration.entry_node_id,
    status: "active",
    started_at: input.startedAt,
    authorization_origin: "parent_run",
    parent_binding: binding,
    ...(manuscriptDelivery === undefined ? {} : { manuscript_delivery: manuscriptDelivery }),
  });
  const parentInputs = resolveGraphNodeInputs({ run: parent.run, graph: parent.graph,
    nodes: parent.nodeEntries.flatMap((entry) => entry.node ? [entry.node] : []),
    childRuns: snapshots, handoff: parent.handoff, nodeId: input.nodeId, round: input.round });
  await consumeGraphNodeInputs(input.index, parentInputs);
  const handoff = RunHandoffSchema.parse({
    schema_version: "2",
    run_id: runId,
    updated_at: input.startedAt,
    inputs: resolveChildHandoffInputs(parent.run, parent.handoff, parentInputs),
    outputs: resolveChildPlannedOutputs(parent.handoff, definition),
  });
  const directory = path.join(input.index.workspace, "runs", runId);
  if (input.dryRun) return { status: "would_start", run_id: runId, directory, run, handoff };

  await writeRunDirectory(input.index.workspace, directory, run, childProfileFile.text, handoff);
  return { status: "started", run_id: runId, directory, run, handoff };
}

export function evaluateGraphFrontier(
  run: GraphRun,
  graph: CapabilityGraphProfile,
  nodes: readonly GraphNodeInstance[],
  childRuns: readonly GraphChildRunSnapshot[] = [],
  inputContext?: { handoff: RunHandoff; registry: LoadedCapabilityRegistry },
): GraphFrontier {
  const eligibleNodes: GraphFrontierNode[] = [];
  const pendingSubgraphStarts: GraphFrontierNode[] = [];
  const pendingGates: string[] = [];
  const pendingDecisions: string[] = [];
  const blockers: GraphFrontierBlock[] = [];
  const entryNodeId = run.entry_node_id;
  const inputDiagnostics = inputContext ? validateGraphAgainstCapabilityRegistry(inputContext.registry, graph) : [];
  if (inputDiagnostics.length > 0) {
    return {
      eligible_node_ids: [], eligible_nodes: [], pending_subgraph_starts: [], pending_gates: [], pending_decisions: [], completion_ready: false,
      blockers: inputDiagnostics.map((diagnostic) => ({ node_id: diagnostic.node_id ?? entryNodeId, code: diagnostic.code ?? "profile_capability_invalid", message: diagnostic.message, refs: [diagnostic.path] })),
    };
  }

  if (run.status !== "active") {
    return {
      eligible_node_ids: [],
      eligible_nodes: [],
      pending_subgraph_starts: [],
      pending_gates: [],
      pending_decisions: [],
      blockers: [{ node_id: entryNodeId, code: "run_not_active", message: `Run ${run.run_id} is ${run.status}.`, refs: [`run:${run.run_id}`] }],
      completion_ready: run.status === "complete",
    };
  }

  const projectedNodes = projectCompletedSubgraphs(run, graph, nodes, childRuns, new Set([run.run_id]));
  const selectedNodeIds = selectedGraphNodeIds(run, graph);
  for (const node of graph.nodes) {
    if (!selectedNodeIds.has(node.node_id)) continue;
    for (const round of candidateRounds(run, graph, projectedNodes, node.node_id)) {
      const instance = instanceFor(projectedNodes, node.node_id, round);
      if (instance && ["complete", "cancelled", "skipped"].includes(instance.state)) continue;

      if (node.delivery_requirement === "quarto_available_for_qmd"
        && boundChildren(childRuns, run.run_id, node.node_id, round).length === 0
        && run.manuscript_delivery?.delivery.working_format === "qmd"
        && run.manuscript_delivery.quarto_probe?.status !== "available") {
        blockers.push({ node_id: node.node_id, code: "quarto_unavailable", message: `Subgraph node ${node.node_id} requires an available Quarto probe.`, refs: [`node:${run.run_id}/${node.node_id}`] });
        continue;
      }

      const failedGates = requiredGates(graph, node.required_gate_ids)
        .filter((gate) => {
          const gateRound = controlRound(graph, gate.owner_node_id, round);
          return latestGateVerdict(projectedNodes, gate, gateRound) === "fail" && !hasGateOverride(projectedNodes, gate, gateRound);
        });
      if (failedGates.length > 0) {
        blockers.push({
          node_id: node.node_id,
          code: "gate_failed",
          message: `Node ${node.node_id} has failed required Gates.`,
          refs: failedGates.map((gate) => `gate:${run.run_id}/${gate.gate_id}`),
        });
        continue;
      }

      const entryExempt = node.node_id === entryNodeId && isFirstEntryRound(run, graph, projectedNodes, node.node_id, round);
      const prerequisitesOk = entryExempt || prerequisitesSatisfiedForRound(graph, node.node_id, node.prerequisites, projectedNodes, round);
      const branchOk = entryExempt || branchUnlocksForRound(graph, projectedNodes, node.node_id, round);
      const gatesOk = requiredGates(graph, node.required_gate_ids)
        .every((gate) => gateAccepted(projectedNodes, gate, controlRound(graph, gate.owner_node_id, round)));
      const decisionsOk = requiredDecisions(graph, node.required_decision_ids)
        .every((decision) => decisionRecordedForRound(projectedNodes, decision, controlRound(graph, decision.owner_node_id, round)));

      if (!prerequisitesOk || !branchOk || !gatesOk || !decisionsOk) continue;

      if (node.kind === "gate") {
        for (const gate of graph.gates.filter((item) => item.owner_node_id === node.node_id)) {
          if (!gateAccepted(projectedNodes, gate, round)) pendingGates.push(round === undefined ? `gate:${run.run_id}/${gate.gate_id}` : `gate:${run.run_id}/${gate.gate_id}@${String(round)}`);
        }
        continue;
      }
      if (node.kind === "decision") {
        for (const decision of graph.decisions.filter((item) => item.owner_node_id === node.node_id)) {
          if (!decisionRecordedForRound(projectedNodes, decision, round)) pendingDecisions.push(round === undefined ? `decision:${run.run_id}/${decision.decision_id}` : `decision:${run.run_id}/${decision.decision_id}@${String(round)}`);
        }
        continue;
      }
      if (inputContext) {
        try {
          resolveGraphNodeInputs({ run, graph, nodes, childRuns, handoff: inputContext.handoff, nodeId: node.node_id, round,
            manifest: node.capability_id ? inputContext.registry.capabilities.get(node.capability_id)?.manifest : undefined });
        } catch (error) {
          if (!(error instanceof GraphRunError)) throw error;
          blockers.push({ node_id: node.node_id, code: error.code, message: error.message, refs: [node.node_id] });
          continue;
        }
      }
      if (node.kind === "subgraph") {
        const children = boundChildren(childRuns, run.run_id, node.node_id, round);
        const selector = round === undefined ? `node:${run.run_id}/${node.node_id}` : `node:${run.run_id}/${node.node_id}@${String(round)}`;
        if (children.length > 1) {
          blockers.push({ node_id: node.node_id, code: "child_run_ambiguous", message: `Subgraph node ${node.node_id} has multiple child runs.`, refs: children.map((child) => `run:${child.run.run_id}`) });
        } else if (children.length === 0) {
          pendingSubgraphStarts.push({ node_id: node.node_id, ...(round === undefined ? {} : { round }), selector });
        } else {
          const child = children[0];
          const declaration = graph.subgraphs.find((item) => item.subgraph_id === node.subgraph_id);
          if (!declaration || !childMatchesDeclaration(child, declaration)) {
            blockers.push({ node_id: node.node_id, code: "child_run_binding_invalid", message: `Subgraph node ${node.node_id} has an inconsistent child binding.`, refs: [`run:${child?.run.run_id ?? "unknown"}`] });
          } else if (child?.run.status !== "active" && child?.run.status !== "complete") {
            blockers.push({ node_id: node.node_id, code: "child_run_blocked", message: `Child run ${child?.run.run_id ?? "unknown"} is ${child?.run.status ?? "unknown"}.`, refs: [`run:${child?.run.run_id ?? "unknown"}`] });
          }
        }
        continue;
      }
      eligibleNodes.push({
        node_id: node.node_id,
        ...(round === undefined ? {} : { round }),
        selector: round === undefined ? `node:${run.run_id}/${node.node_id}` : `node:${run.run_id}/${node.node_id}@${String(round)}`,
      });
    }
  }

  return {
    eligible_node_ids: [...new Set(eligibleNodes.map((item) => item.node_id))],
    eligible_nodes: eligibleNodes,
    pending_subgraph_starts: pendingSubgraphStarts,
    pending_gates: [...new Set(pendingGates)],
    pending_decisions: [...new Set(pendingDecisions)],
    blockers,
    completion_ready: graphRunCompletionReady(run, graph, projectedNodes),
  };
}

export function isGraphNodeEligible(
  run: GraphRun,
  graph: CapabilityGraphProfile,
  nodes: readonly GraphNodeInstance[],
  nodeId: string,
  round?: number,
  childRuns: readonly GraphChildRunSnapshot[] = [],
): boolean {
  const frontier = evaluateGraphFrontier(run, graph, nodes, childRuns);
  return [...frontier.eligible_nodes, ...frontier.pending_subgraph_starts].some((item) => item.node_id === nodeId && item.round === round);
}

export async function submitGraphNode(input: SubmitGraphNodeInput): Promise<SubmitGraphNodeResult> {
  const record = requireRun(input.index, input.runId);
  const { run, graph } = record;
  requireActiveRun(run);
  requireGraphInputContract(input.capabilityRegistry, graph);
  const definition = graph.nodes.find((item) => item.node_id === input.nodeId);
  if (!definition) throw new GraphRunError("node_unknown", `Node is not declared by the frozen graph: ${input.nodeId}`, "usage");
  if (definition.multiplicity === "repeatable" && input.round === undefined) {
    throw new GraphRunError("node_round_required", `Repeatable node submission requires a round: ${input.nodeId}`, "usage");
  }
  if (definition.multiplicity !== "repeatable" && input.round !== undefined) {
    throw new GraphRunError("node_round_invalid", `Node ${input.nodeId} is not repeatable and cannot declare a round.`, "usage");
  }
  const nodes = record.nodeEntries.flatMap((item) => item.node ? [item.node] : []);
  const scanEntry = requireNodeScanEntry(record.nodeEntries, input.nodeId, input.round);
  if (!isGraphNodeEligible(run, graph, nodes, input.nodeId, input.round, graphChildRunSnapshots(input.index))) {
    throw new GraphRunError("node_not_eligible", `Node is not currently eligible: ${input.nodeId}${input.round === undefined ? "" : ` round ${String(input.round)}`}`, "conflict");
  }
  validateNodeOutputs(definition, input.outputs);
  let validatorOutputs: Array<{ role: string; path: string }>;
  try {
    validatorOutputs = await Promise.all(input.outputs.map(async (output) => ({
      ...output,
      path: (await resolveBoundaryPath(input.index.projectRoot, output.path)).absolutePath,
    })));
  } catch (error) {
    if (error instanceof BoundaryPathError) throw new GraphRunError(error.code, error.message, "usage");
    throw error;
  }
  if (!input.capabilityRegistry) {
    throw new GraphRunError("capability_registry_missing", "Node submission requires a resolved capability registry.", "domain");
  }
  if (definition.kind === "subgraph" || definition.kind === "gate" || definition.kind === "decision") {
    throw new GraphRunError("node_advance_forbidden", `Node kind ${definition.kind} cannot be completed through advance.`, "usage");
  }
  if (definition.capability_id !== undefined) {
    const registered = input.capabilityRegistry.capabilities.get(definition.capability_id);
    if (!registered) throw new GraphRunError("capability_unknown", `Capability is not registered for this run: ${definition.capability_id}`, "domain");
    const inputs = resolveGraphNodeInputs({
      run, graph, handoff: record.handoff, nodes,
      childRuns: graphChildRunSnapshots(input.index),
      nodeId: input.nodeId, round: input.round,
      manifest: registered.manifest,
    });
    const validatorInputs = await consumeGraphNodeInputs(input.index, inputs);
    const validation = await runCapabilityValidators(registered.manifest, registered.packageRoot, {
      run_id: input.runId,
      node_id: input.nodeId,
      submitted_at: input.submittedAt,
      inputs: validatorInputs,
      outputs: validatorOutputs,
    });
    if (!validation.ok) {
      throw new GraphRunError("node_validators_failed", `Node validators did not pass: ${validation.results.filter((item) => item.status !== "pass").map((item) => item.validator_id).join(", ")}`, "conflict", validation.results);
    }
  }

  const existing = instanceFor(nodes, input.nodeId, input.round);
  if (existing?.state === "complete") {
    return { node: existing, created: false, dry_run: false };
  }
  const node = GraphNodeInstanceSchema.parse({
    schema_version: "2",
    node_instance_id: nodeInstanceId(input.runId, input.nodeId, input.round),
    run_id: input.runId,
    node_id: input.nodeId,
    ...(input.round === undefined ? {} : { round: input.round }),
    state: "complete",
    updated_at: input.submittedAt,
    outputs: input.outputs,
    gate_attempts: existing?.gate_attempts ?? [],
    gate_overrides: existing?.gate_overrides ?? [],
    decisions: existing?.decisions ?? [],
  });
  if (input.dryRun) return { node, created: existing === undefined, dry_run: true };

  await writeNodeFile(input.index, node, scanEntry);
  return { node, created: existing === undefined, dry_run: false };
}

export async function recordGraphGate(input: RecordGraphGateInput): Promise<GraphNodeInstance> {
  const record = requireRun(input.index, input.runId);
  const { graph, run } = record;
  requireActiveRun(run);
  const gate = graph.gates.find((item) => item.gate_id === input.gateId);
  if (!gate) throw new GraphRunError("gate_unknown", `Gate is not declared by the frozen graph: ${input.gateId}`, "usage");
  const ownerDefinition = graph.nodes.find((item) => item.node_id === gate.owner_node_id);
  if (!ownerDefinition) throw new GraphRunError("gate_owner_unknown", `Gate owner is not declared by the frozen graph: ${gate.owner_node_id}`, "domain");
  if (!gate.verdicts.includes(input.verdict)) throw new GraphRunError("gate_verdict_invalid", `Verdict ${input.verdict} is not allowed for Gate ${input.gateId}.`, "usage");
  const attempt = {
    gate_id: input.gateId,
    verdict: input.verdict,
    confirmed_by: requiredText(input.confirmedBy, "Gate confirmer"),
    confirmed_at: input.confirmedAt,
    summary: requiredText(input.summary, "Gate summary"),
  };
  const nodes = record.nodeEntries.flatMap((item) => item.node ? [item.node] : []);
  const gateSelector = input.round === undefined ? `gate:${input.runId}/${input.gateId}` : `gate:${input.runId}/${input.gateId}@${String(input.round)}`;
  if (!evaluateGraphFrontier(run, graph, nodes, graphChildRunSnapshots(input.index)).pending_gates.includes(gateSelector)) {
    throw new GraphRunError("gate_not_pending", `Gate is not currently pending: ${input.gateId}`, "conflict");
  }
  const scanEntry = requireNodeScanEntry(record.nodeEntries, gate.owner_node_id, input.round);
  const existing = instanceFor(nodes, gate.owner_node_id, input.round);
  const node = GraphNodeInstanceSchema.parse({
    schema_version: "2",
    node_instance_id: nodeInstanceId(input.runId, gate.owner_node_id, input.round),
    run_id: input.runId,
    node_id: gate.owner_node_id,
    ...(input.round === undefined ? {} : { round: input.round }),
    state: existing?.state ?? "pending",
    updated_at: input.confirmedAt,
    outputs: existing?.outputs ?? [],
    gate_attempts: [...(existing?.gate_attempts ?? []).filter((item) => item.gate_id !== input.gateId), attempt],
    gate_overrides: existing?.gate_overrides ?? [],
    decisions: existing?.decisions ?? [],
  });
  if (!input.dryRun) await writeNodeFile(input.index, node, scanEntry);
  return node;
}

export async function recordGraphDecision(input: RecordGraphDecisionInput): Promise<GraphNodeInstance> {
  const record = requireRun(input.index, input.runId);
  const { graph, run } = record;
  requireActiveRun(run);
  const decision = graph.decisions.find((item) => item.decision_id === input.decisionId);
  if (!decision) throw new GraphRunError("decision_unknown", `Decision is not declared by the frozen graph: ${input.decisionId}`, "usage");
  const option = decision.options.find((item) => item.option_id === input.choice);
  if (!option) throw new GraphRunError("decision_choice_invalid", `Unknown choice for Decision ${input.decisionId}: ${input.choice}`, "usage");
  const nodes = record.nodeEntries.flatMap((item) => item.node ? [item.node] : []);
  const decisionSelector = input.round === undefined ? `decision:${input.runId}/${input.decisionId}` : `decision:${input.runId}/${input.decisionId}@${String(input.round)}`;
  if (!evaluateGraphFrontier(run, graph, nodes, graphChildRunSnapshots(input.index)).pending_decisions.includes(decisionSelector)) {
    throw new GraphRunError("decision_not_pending", `Decision is not currently pending: ${input.decisionId}`, "conflict");
  }
  const scanEntry = requireNodeScanEntry(record.nodeEntries, decision.owner_node_id, input.round);
  const existing = instanceFor(nodes, decision.owner_node_id, input.round);
  const node = GraphNodeInstanceSchema.parse({
    schema_version: "2",
    node_instance_id: nodeInstanceId(input.runId, decision.owner_node_id, input.round),
    run_id: input.runId,
    node_id: decision.owner_node_id,
    ...(input.round === undefined ? {} : { round: input.round }),
    state: existing?.state ?? "pending",
    updated_at: input.decidedAt,
    outputs: existing?.outputs ?? [],
    gate_attempts: existing?.gate_attempts ?? [],
    gate_overrides: existing?.gate_overrides ?? [],
    decisions: [
      ...(existing?.decisions ?? []).filter((item) => item.decision_id !== input.decisionId),
      {
        decision_id: input.decisionId,
        choice: requiredText(input.choice, "Decision choice"),
        decided_by: requiredText(input.decidedBy, "Decision actor"),
        decided_at: input.decidedAt,
      },
    ],
  });
  if (!input.dryRun) await writeNodeFile(input.index, node, scanEntry);
  return node;
}

export async function overrideGraphGate(input: OverrideGraphGateInput): Promise<GraphNodeInstance> {
  const record = requireRun(input.index, input.runId);
  const { graph, run } = record;
  requireActiveRun(run);
  const gate = graph.gates.find((item) => item.gate_id === input.gateId);
  if (!gate) throw new GraphRunError("gate_unknown", `Gate is not declared by the frozen graph: ${input.gateId}`, "usage");
  const nodes = record.nodeEntries.flatMap((item) => item.node ? [item.node] : []);
  const latest = latestGateAttempt(nodes, gate, input.round);
  if (!latest || latest.verdict !== "fail") {
    throw new GraphRunError("gate_override_unavailable", `Only the current failed Gate attempt can be overridden: ${input.gateId}`, "conflict");
  }
  if (!graph.override_policy.failed_gate_requires_decision) {
    throw new GraphRunError("gate_override_forbidden", "The graph profile does not allow failed-Gate overrides.", "conflict");
  }
  const scanEntry = requireNodeScanEntry(record.nodeEntries, gate.owner_node_id, input.round);
  const existing = instanceFor(nodes, gate.owner_node_id, input.round);
  const currentOverride = (existing?.gate_overrides ?? []).find((item) => item.gate_id === input.gateId);
  if (currentOverride && Date.parse(currentOverride.approved_at) >= Date.parse(latest.confirmed_at)) {
    throw new GraphRunError("gate_override_exists", `Gate already has a current override: ${input.gateId}`, "conflict");
  }
  const decisionId = `override-${sha256(JSON.stringify({ run: input.runId, gate: input.gateId, by: input.approvedBy, at: input.approvedAt, reason: input.reason })).slice(0, 20)}`;
  const node = GraphNodeInstanceSchema.parse({
    schema_version: "2",
    node_instance_id: nodeInstanceId(input.runId, gate.owner_node_id, input.round),
    run_id: input.runId,
    node_id: gate.owner_node_id,
    ...(input.round === undefined ? {} : { round: input.round }),
    state: existing?.state ?? "pending",
    updated_at: input.approvedAt,
    outputs: existing?.outputs ?? [],
    gate_attempts: existing?.gate_attempts ?? [],
    gate_overrides: [
      ...(existing?.gate_overrides ?? []).filter((item) => item.gate_id !== input.gateId),
      {
        gate_id: input.gateId,
        decision_id: decisionId,
        approved_by: requiredText(input.approvedBy, "Override approver"),
        approved_at: input.approvedAt,
        reason: requiredText(input.reason, "Override reason"),
      },
    ],
    decisions: existing?.decisions ?? [],
  });
  if (!input.dryRun) await writeNodeFile(input.index, node, scanEntry);
  return node;
}

export function validateSubgraphNodeBindings(
  graph: CapabilityGraphProfile,
  nodeId: string,
  childProfile: CapabilityGraphProfile | undefined,
): string[] {
  const node = graph.nodes.find((item) => item.node_id === nodeId);
  if (!node || node.kind !== "subgraph" || node.subgraph_id === undefined) return [`Node ${nodeId} is not a subgraph node.`];
  const declaration = graph.subgraphs.find((item) => item.subgraph_id === node.subgraph_id);
  if (!declaration) return [`Subgraph declaration is missing: ${node.subgraph_id}`];
  if (!childProfile) return [`Subgraph profile is not projected: ${declaration.profile_id}`];
  if (childProfile.profile_id !== declaration.profile_id || childProfile.profile_version !== declaration.profile_version) {
    return [`Subgraph identity mismatch: expected ${declaration.profile_id}@${declaration.profile_version}, got ${childProfile.profile_id}@${childProfile.profile_version}.`];
  }
  const diagnostics: string[] = [];
  const childEntry = childProfile.entries.find((entry) => entry.entry_id === declaration.entry_id);
  if (!childEntry) diagnostics.push(`Subgraph entry is not declared by child graph: ${declaration.entry_id}`);
  else if (childEntry.kind === "end-to-end" ? childEntry.node_id !== declaration.entry_node_id : !childEntry.entry_points.includes(declaration.entry_node_id)) {
    diagnostics.push(`Subgraph entry node is not valid for ${declaration.entry_id}: ${declaration.entry_node_id}`);
  }
  const childInputRoles = new Set(childProfile.nodes.flatMap((item) => item.input_bindings.map((binding) => binding.role)));
  const childOutputRoles = new Set(childProfile.nodes.flatMap((item) => item.expected_outputs.map((output) => output.role)));
  for (const binding of node.input_bindings) {
    if (!childInputRoles.has(binding.role)) diagnostics.push(`Subgraph input role is not consumed by child graph: ${binding.role}`);
  }
  const childEntryNode = childProfile.nodes.find((item) => item.node_id === declaration.entry_node_id);
  const suppliedRoles = new Set(node.input_bindings.map((binding) => binding.role));
  for (const binding of childEntryNode?.input_bindings ?? []) {
    if (binding.source === "handoff" && !suppliedRoles.has(binding.role)) diagnostics.push(`Subgraph entry requires an unmapped handoff role: ${binding.role}`);
  }
  for (const output of node.expected_outputs) {
    const childRole = output.from_role ?? output.role;
    if (!childOutputRoles.has(childRole)) diagnostics.push(`Subgraph output role is not produced by child graph: ${childRole}`);
  }
  return diagnostics;
}

function boundChildren(
  childRuns: readonly GraphChildRunSnapshot[],
  parentRunId: string,
  parentNodeId: string,
  round: number | undefined,
): GraphChildRunSnapshot[] {
  return childRuns.filter((child) => child.run.authorization_origin === "parent_run"
    && child.run.parent_binding?.parent_run_id === parentRunId
    && child.run.parent_binding.parent_node_id === parentNodeId
    && child.run.parent_binding.round === round);
}

function childMatchesDeclaration(
  child: GraphChildRunSnapshot,
  declaration: CapabilityGraphProfile["subgraphs"][number],
): boolean {
  return child.run.parent_binding?.subgraph_id === declaration.subgraph_id
    && child.run.profile_id === declaration.profile_id
    && child.run.profile_version === declaration.profile_version
    && child.run.entry_id === declaration.entry_id
    && child.run.entry_node_id === declaration.entry_node_id
    && child.graph.profile_id === declaration.profile_id
    && child.graph.profile_version === declaration.profile_version;
}

function projectCompletedSubgraphs(
  run: GraphRun,
  graph: CapabilityGraphProfile,
  nodes: readonly GraphNodeInstance[],
  childRuns: readonly GraphChildRunSnapshot[],
  visited: ReadonlySet<string>,
): GraphNodeInstance[] {
  const projected = [...nodes];
  for (const child of childRuns.filter((candidate) => candidate.run.parent_binding?.parent_run_id === run.run_id)) {
    if (visited.has(child.run.run_id)) continue;
    const binding = child.run.parent_binding;
    if (!binding || instanceFor(projected, binding.parent_node_id, binding.round)) continue;
    const parentNode = graph.nodes.find((node) => node.node_id === binding.parent_node_id && node.kind === "subgraph");
    const declaration = graph.subgraphs.find((item) => item.subgraph_id === binding.subgraph_id);
    if (!parentNode || !declaration || !childMatchesDeclaration(child, declaration)) continue;
    if (boundChildren(childRuns, run.run_id, binding.parent_node_id, binding.round).length !== 1) continue;
    const nestedVisited = new Set(visited);
    nestedVisited.add(child.run.run_id);
    const childNodes = projectCompletedSubgraphs(child.run, child.graph, child.nodes, childRuns, nestedVisited);
    if (!graphRunCompletionReady(child.run, child.graph, childNodes)) continue;
    const requiredOutputs = parentNode.expected_outputs.filter((output) => output.required !== false);
    if (requiredOutputs.some((expected) => !child.handoff.outputs.some((output) => output.role === (expected.from_role ?? expected.role)))) continue;
    projected.push(GraphNodeInstanceSchema.parse({
      schema_version: "2",
      node_instance_id: nodeInstanceId(run.run_id, binding.parent_node_id, binding.round),
      run_id: run.run_id,
      node_id: binding.parent_node_id,
      ...(binding.round === undefined ? {} : { round: binding.round }),
      state: "complete",
      updated_at: child.handoff.updated_at,
      outputs: parentNode.expected_outputs.flatMap((expected) => {
        const output = child.handoff.outputs.find((candidate) => candidate.role === (expected.from_role ?? expected.role));
        return output ? [{ role: expected.role, path: output.path }] : [];
      }),
      gate_attempts: [],
      gate_overrides: [],
      decisions: [],
    }));
  }
  return projected;
}

export function graphRunCompletionReady(run: GraphRun, graph: CapabilityGraphProfile, nodes: readonly GraphNodeInstance[]): boolean {
  if (run.status === "complete") return true;
  if (run.status !== "active") return false;
  const template = graph.revision_round_template;
  const selectedNodeIds = selectedGraphNodeIds(run, graph);
  for (const node of graph.nodes.filter((item) => selectedNodeIds.has(item.node_id))) {
    if (node.multiplicity === "optional") continue;
    if (node.kind === "gate") {
      const owned = graph.gates.filter((gate) => gate.owner_node_id === node.node_id);
      if (owned.length === 0) return false;
      if (node.multiplicity === "repeatable" && template) {
        const rounds = nodes
          .filter((item) => item.node_id === template.revision_node_id && item.state === "complete" && item.round !== undefined)
          .map((item) => item.round as number);
        if (rounds.length === 0 || rounds.some((round) => !owned.every((gate) => gateAccepted(nodes, gate, round)))) return false;
      } else if (!owned.every((gate) => gateAccepted(nodes, gate))) {
        return false;
      }
      continue;
    }
    if (node.kind === "decision") {
      const owned = graph.decisions.filter((decision) => decision.owner_node_id === node.node_id);
      if (owned.length === 0) return false;
      if (node.multiplicity === "repeatable" && template && node.node_id === template.review_node_id) {
        const rounds = nodes
          .filter((item) => item.node_id === template.revision_node_id && item.state === "complete" && item.round !== undefined)
          .map((item) => item.round as number);
        if (rounds.length === 0 || rounds.some((round) => !owned.every((decision) => decisionRecordedForRound(nodes, decision, round)))) return false;
      } else if (!owned.every((decision) => decisionRecordedForRound(nodes, decision, undefined))) {
        return false;
      }
      continue;
    }
    if (node.multiplicity === "repeatable") {
      if (template && (node.node_id === template.revision_node_id || node.node_id === template.review_node_id)) {
        if (!templateClosed(graph, nodes)) return false;
      } else if (!nodes.some((item) => item.node_id === node.node_id && item.state === "complete")) {
        return false;
      }
      continue;
    }
    if (!nodes.some((item) => item.node_id === node.node_id && item.state === "complete")) return false;
  }
  return true;
}

interface RequiredRunRecord extends Omit<GraphRunScanRecord, "handoff"> {
  run: GraphRun;
  graph: CapabilityGraphProfile;
  handoff: RunHandoff;
}

function requireRun(index: GraphWorkspaceIndex, runId: string): RequiredRunRecord {
  const records = index.runs.filter((item) => item.run?.run_id === runId);
  if (records.length !== 1) throw new GraphRunError(records.length === 0 ? "run_not_found" : "run_ambiguous", `Run selector must resolve exactly once: ${runId}`, records.length === 0 ? "usage" : "conflict");
  const record = records[0];
  if (!record.run || !record.graph || !record.handoff) throw new GraphRunError("run_incomplete", `Run is missing run.yaml, frozen graph or handoff: ${runId}`, "domain");
  if (!record.graphText || sha256(record.graphText) !== record.run.profile_sha256) throw new GraphRunError("run_graph_hash_mismatch", `Frozen graph integrity check failed for run ${runId}.`, "conflict");
  if (record.graph.profile_id !== record.run.profile_id || record.graph.profile_version !== record.run.profile_version) throw new GraphRunError("run_profile_identity_mismatch", `Frozen graph identity check failed for run ${runId}.`, "conflict");
  return { ...record, run: record.run, graph: record.graph, handoff: record.handoff.frontmatter };
}

export function graphChildRunSnapshots(index: GraphWorkspaceIndex): GraphChildRunSnapshot[] {
  return index.runs.flatMap((record) => record.run && record.graph && record.handoff
    ? [{
        run: record.run,
        graph: record.graph,
        handoff: record.handoff.frontmatter,
        nodes: record.nodeEntries.flatMap((entry) => entry.node ? [entry.node] : []),
      }]
    : []);
}

export function resolveGraphNodeInputs(input: {
  run: GraphRun;
  graph: CapabilityGraphProfile;
  handoff: RunHandoff;
  nodes: readonly GraphNodeInstance[];
  childRuns?: readonly GraphChildRunSnapshot[];
  nodeId: string;
  round?: number;
  manifest?: CapabilityManifest;
}): ResolvedGraphNodeInput[] {
  const definition = input.graph.nodes.find((node) => node.node_id === input.nodeId);
  if (!definition) throw new GraphRunError("node_not_found", `Node is not declared by the frozen graph: ${input.nodeId}`, "usage");
  const projectedNodes = projectCompletedSubgraphs(input.run, input.graph, input.nodes, input.childRuns ?? [], new Set([input.run.run_id]));
  return definition.input_bindings.map((binding) => {
    if (binding.source === "parameter") {
      if (binding.value === undefined) throw new GraphRunError("node_input_unresolved", `Parameter input has no value: ${binding.role}`, "conflict");
      return { role: binding.role, source: binding.source, value: binding.value };
    }
    if (binding.source === "stable_spec") {
      const schema = input.manifest?.inputs.find((declared) => declared.role === binding.role)?.schema_ref;
      const stablePath = schema ? STABLE_SPEC_PATHS[schema] : undefined;
      if (!stablePath) throw new GraphRunError("node_input_unresolved", `Stable-spec input has no bounded path: ${binding.role}`, "conflict");
      return { role: binding.role, source: binding.source, path: stablePath };
    }
    if (binding.source === "handoff") {
      const handoff = [...input.handoff.inputs, ...input.handoff.outputs].find((entry) => entry.role === binding.role);
      if (!handoff) throw new GraphRunError("node_input_unresolved", `Run handoff does not provide input: ${binding.role}`, "conflict");
      return {
        role: binding.role,
        source: binding.source,
        path: handoff.path,
        ...(handoff.path_kind === undefined ? {} : { path_kind: handoff.path_kind }),
        ...(handoff.entry_path === undefined ? {} : { entry_path: handoff.entry_path }),
        ...("source_run_id" in handoff && handoff.source_run_id !== undefined ? { source_run_id: handoff.source_run_id } : {}),
      };
    }
    const candidates = projectedNodes
      .filter((node) => node.node_id === binding.from_node_id && node.state === "complete")
      .filter((node) => input.round === undefined || node.round === undefined || node.round === input.round)
      .sort((left, right) => Date.parse(left.updated_at) - Date.parse(right.updated_at));
    const output = candidates.at(-1)?.outputs.find((entry) => entry.role === (binding.from_role ?? binding.role));
    if (!output) throw new GraphRunError("node_input_unresolved", `Node output is unavailable for ${binding.role} from ${binding.from_node_id ?? "unknown"}.`, "conflict");
    return { role: binding.role, source: binding.source, path: output.path, from_node_id: binding.from_node_id };
  });
}

function requireGraphInputContract(registry: LoadedCapabilityRegistry, graph: CapabilityGraphProfile): void {
  if (!registry) throw new GraphRunError("capability_registry_missing", "Graph execution requires a resolved capability registry.", "domain");
  const diagnostics = validateGraphAgainstCapabilityRegistry(registry, graph);
  if (diagnostics.length > 0) throw new GraphRunError("profile_capability_invalid", "Graph capability input contract is invalid.", "domain", diagnostics);
}

async function consumeGraphNodeInputs(index: GraphWorkspaceIndex, inputs: readonly ResolvedGraphNodeInput[]): Promise<ValidatorInput[]> {
  const consumed: ValidatorInput[] = [];
  for (const input of inputs) {
    if (input.source === "parameter") {
      consumed.push({ role: input.role, value: input.value });
      continue;
    }
    if (input.source === "stable_spec") {
      const relativePath = input.path?.slice("researchspec/".length);
      if (!relativePath || !index.files.has(relativePath)
        || index.diagnostics.some((diagnostic) => diagnostic.blocking && diagnostic.path === path.join(index.workspace, relativePath))) {
        throw new GraphRunError("node_input_unresolved", `Stable specification is unavailable for ${input.role}.`, "conflict", { role: input.role });
      }
      consumed.push({ role: input.role, path: path.join(index.workspace, relativePath) });
      continue;
    }
    try {
      const resolved = await resolveBoundaryPath(index.projectRoot, input.path ?? "", "consume-input", input.path_kind);
      if (input.path_kind === "directory") {
        await resolveBoundaryPath(index.projectRoot, `${input.path ?? ""}/${input.entry_path ?? ""}`, "consume-input");
      }
      consumed.push({ role: input.role, path: resolved.absolutePath });
    } catch (error) {
      if (error instanceof BoundaryPathError) throw new GraphRunError(error.code, error.message, "conflict", { role: input.role, path: input.path });
      throw error;
    }
  }
  return consumed;
}

function resolveChildHandoffInputs(
  parentRun: GraphRun,
  parentHandoff: RunHandoff,
  inputs: readonly ResolvedGraphNodeInput[],
): RunHandoff["inputs"] {
  return inputs.flatMap((binding) => {
    if (binding.source === "stable_spec" || binding.source === "parameter") return [];
    if (binding.source === "node_output") {
      return [{ role: binding.role, type: "node_output", path: requiredText(binding.path ?? "", "Resolved input path"), purpose: `Input ${binding.role} inherited from ${binding.from_node_id ?? "parent node"}.`, source_run_id: parentRun.run_id }];
    }
    const source = [...parentHandoff.inputs, ...parentHandoff.outputs].find((entry) => entry.role === binding.role);
    if (!source) throw new GraphRunError("subgraph_input_missing", `Subgraph handoff input is missing: ${binding.role}`, "conflict");
    return [{
      role: source.role,
      type: source.type,
      path: source.path,
      purpose: source.purpose,
      ...(source.format === undefined ? {} : { format: source.format }),
      ...(source.renderer === undefined ? {} : { renderer: source.renderer }),
      ...(source.path_kind === undefined ? {} : { path_kind: source.path_kind }),
      ...(source.entry_path === undefined ? {} : { entry_path: source.entry_path }),
      ...(source.limits === undefined ? {} : { limits: source.limits }),
      ...(source.notes === undefined ? {} : { notes: source.notes }),
      source_run_id: parentRun.run_id,
    }];
  });
}

function resolveChildPlannedOutputs(
  parentHandoff: RunHandoff,
  node: CapabilityGraphProfile["nodes"][number],
): RunHandoff["outputs"] {
  return node.expected_outputs.flatMap((expected) => {
    const output = parentHandoff.outputs.find((candidate) => candidate.role === expected.role);
    if (!output && expected.required !== false) throw new GraphRunError("subgraph_output_unplanned", `Parent handoff does not plan required subgraph output: ${expected.role}`, "conflict");
    return output ? [{ ...output, role: expected.from_role ?? expected.role }] : [];
  });
}

async function writeRunDirectory(
  workspace: string,
  directory: string,
  run: GraphRun,
  graphText: string,
  handoff: RunHandoff,
): Promise<void> {
  const temporary = path.join(workspace, "runs", `.run-${randomUUID()}.tmp`);
  try {
    await mkdir(temporary, { recursive: false });
    await mkdir(path.join(temporary, "nodes"));
    await writeFile(path.join(temporary, "run.yaml"), stringify(run), { encoding: "utf8", flag: "wx" });
    await writeFile(path.join(temporary, "graph.yaml"), graphText, { encoding: "utf8", flag: "wx" });
    await writeFile(path.join(temporary, "handoff.md"), renderRunHandoff(handoff), { encoding: "utf8", flag: "wx" });
    await rename(temporary, directory);
  } catch (error) {
    await rm(temporary, { recursive: true, force: true }).catch(() => undefined);
    if ((error as NodeJS.ErrnoException).code === "EEXIST" || (error as NodeJS.ErrnoException).code === "ENOTEMPTY") {
      throw new GraphRunError("run_create_conflict", `Run directory already exists: ${directory}`, "conflict");
    }
    throw error;
  }
}

function validateEntrySelection(graph: CapabilityGraphProfile, command: GraphRunStartCommand): void {
  const entry = graph.entries.find((item) => item.entry_id === command.entry_id);
  if (!entry) throw new GraphRunError("entry_unknown", `Entry is not declared by the graph profile: ${command.entry_id}`, "usage");
  if (entry.kind === "end-to-end" && entry.node_id !== command.entry_node_id) {
    throw new GraphRunError("entry_node_invalid", `End-to-end entry ${entry.entry_id} must start at node ${entry.node_id}.`, "conflict");
  }
  if (entry.kind === "mid-entry" && !entry.entry_points.includes(command.entry_node_id)) {
    throw new GraphRunError("entry_node_invalid", `Mid-entry entry ${entry.entry_id} does not declare node ${command.entry_node_id}.`, "conflict");
  }
  if (entry.route_ref !== command.route_ref) {
    throw new GraphRunError("entry_route_mismatch", `Entry ${entry.entry_id} requires route_ref ${entry.route_ref ?? "to be omitted"}.`, "conflict");
  }
  for (const gateId of command.formal_gates) {
    if (!graph.gates.some((item) => item.gate_id === gateId)) throw new GraphRunError("gate_unknown", `Run confirms unknown Gate: ${gateId}`, "usage");
  }
}

function validateSubgraphReferences(graph: CapabilityGraphProfile): void {
  for (const node of graph.nodes) {
    if (node.kind === "subgraph" && node.subgraph_id !== undefined && !graph.subgraphs.some((item) => item.subgraph_id === node.subgraph_id)) {
      throw new GraphRunError("subgraph_unknown", `Subgraph node references an undeclared subgraph: ${node.subgraph_id}`, "domain");
    }
  }
}

function validateNodeOutputs(node: CapabilityGraphProfile["nodes"][number], outputs: Array<{ role: string; path: string }>): void {
  const requiredRoles = node.expected_outputs.filter((item) => item.required !== false).map((item) => item.role);
  const missing = requiredRoles.filter((role) => !outputs.some((item) => item.role === role));
  if (missing.length > 0) throw new GraphRunError("node_output_missing", `Node submission is missing required output roles: ${missing.join(", ")}`, "usage");
  const unknown = outputs.filter((item) => !node.expected_outputs.some((expected) => expected.role === item.role));
  if (unknown.length > 0) throw new GraphRunError("node_output_unknown", `Node submission declares unexpected output roles: ${unknown.map((item) => item.role).join(", ")}`, "usage");
  const duplicates = outputs.filter((item, index) => outputs.findIndex((candidate) => candidate.role === item.role) !== index);
  if (duplicates.length > 0) throw new GraphRunError("node_output_duplicate", "Node submission repeats output roles.", "usage");
}

function candidateRounds(run: GraphRun, graph: CapabilityGraphProfile, nodes: readonly GraphNodeInstance[], nodeId: string): Array<number | undefined> {
  const definition = graph.nodes.find((item) => item.node_id === nodeId);
  if (!definition) return [];
  if (definition.multiplicity !== "repeatable") {
    return instanceFor(nodes, nodeId, undefined)?.state === "complete" ? [] : [undefined];
  }
  const template = graph.revision_round_template;
  if (template && (nodeId === template.revision_node_id || nodeId === template.review_node_id)) {
    return repeatableTemplateRounds(run, graph, nodes, nodeId).filter((round) => instanceFor(nodes, nodeId, round) === undefined);
  }
  if (template?.review_execution_node_id === nodeId) {
    return nodes
      .filter((item) => item.node_id === template.revision_node_id && item.state === "complete" && item.round !== undefined)
      .map((item) => item.round as number)
      .filter((round) => instanceFor(nodes, nodeId, round) === undefined)
      .sort((left, right) => left - right);
  }
  if (template && definition.kind === "gate") {
    const ownedGates = graph.gates.filter((gate) => gate.owner_node_id === nodeId);
    return nodes
      .filter((item) => item.node_id === template.revision_node_id && item.state === "complete" && item.round !== undefined)
      .map((item) => item.round as number)
      .filter((round) => ownedGates.some((gate) => !gateAccepted(nodes, gate, round)))
      .sort((left, right) => left - right);
  }
  return genericRepeatableRounds(nodes, nodeId).filter((round) => instanceFor(nodes, nodeId, round) === undefined);
}

function repeatableTemplateRounds(run: GraphRun, graph: CapabilityGraphProfile, nodes: readonly GraphNodeInstance[], nodeId: string): number[] {
  const template = graph.revision_round_template;
  if (!template) return [];
  const rounds = new Set<number>();
  if (nodeId === template.revision_node_id) {
    if (instanceFor(nodes, nodeId, 1) === undefined) rounds.add(1);
    for (const review of nodes.filter((item) => item.node_id === template.review_node_id && item.round !== undefined)) {
      const continueChoice = review.decisions.some((item) => item.decision_id === revisionDecisionId(graph, template.review_node_id) && item.choice === template.continue_option_id);
      if (continueChoice) rounds.add((review.round ?? 0) + 1);
    }
  } else if (nodeId === template.review_node_id) {
    if (instanceFor(nodes, nodeId, 1) === undefined) rounds.add(1);
    for (const revision of nodes.filter((item) => item.node_id === template.revision_node_id && item.state === "complete" && item.round !== undefined)) {
      rounds.add(revision.round ?? 1);
    }
  }
  return [...rounds].filter((round) => round > 0).sort((a, b) => a - b);
}

function genericRepeatableRounds(nodes: readonly GraphNodeInstance[], nodeId: string): number[] {
  const instances = nodes.filter((item) => item.node_id === nodeId && item.round !== undefined);
  if (instances.some((item) => item.state !== "complete" && item.state !== "cancelled")) return [];
  const maxRound = Math.max(0, ...instances.map((item) => item.round ?? 0));
  return [maxRound + 1];
}

function isFirstEntryRound(run: GraphRun, graph: CapabilityGraphProfile, nodes: readonly GraphNodeInstance[], nodeId: string, round: number | undefined): boolean {
  if (nodeId !== run.entry_node_id) return false;
  const definition = graph.nodes.find((item) => item.node_id === nodeId);
  if (definition?.multiplicity !== "repeatable") return true;
  if (round === 1) return true;
  return nodes.filter((item) => item.node_id === nodeId && item.state === "complete").length === 0;
}

function prerequisitesSatisfiedForRound(
  graph: CapabilityGraphProfile,
  nodeId: string,
  prerequisites: readonly string[],
  nodes: readonly GraphNodeInstance[],
  round: number | undefined,
): boolean {
  const pending = new Set(prerequisites);
  for (const group of graph.parallel_groups) {
    const members = group.node_ids.filter((item) => pending.has(item));
    if (members.length < 2) continue;
    const completed = members.filter((member) => prerequisiteComplete(graph, nodeId, member, nodes, round));
    if (group.join_policy === "all" ? completed.length !== members.length : completed.length === 0) return false;
    for (const member of members) pending.delete(member);
  }
  return [...pending].every((prerequisite) => prerequisiteComplete(graph, nodeId, prerequisite, nodes, round));
}

function prerequisiteComplete(
  graph: CapabilityGraphProfile,
  consumerNodeId: string,
  prerequisiteNodeId: string,
  nodes: readonly GraphNodeInstance[],
  consumerRound: number | undefined,
): boolean {
  const prerequisite = graph.nodes.find((item) => item.node_id === prerequisiteNodeId);
  if (prerequisite?.kind === "gate") {
    const gates = graph.gates.filter((gate) => gate.owner_node_id === prerequisiteNodeId);
    return gates.length > 0 && gates.every((gate) => gateAccepted(nodes, gate, controlRound(graph, prerequisiteNodeId, consumerRound)));
  }
  if (prerequisite?.kind === "decision") {
    const decisions = graph.decisions.filter((decision) => decision.owner_node_id === prerequisiteNodeId);
    return decisions.length > 0 && decisions.every((decision) => decisionRecordedForRound(nodes, decision, controlRound(graph, prerequisiteNodeId, consumerRound)));
  }
  if (prerequisite?.multiplicity !== "repeatable") {
    return nodes.some((item) => item.node_id === prerequisiteNodeId && item.state === "complete");
  }
  const template = graph.revision_round_template;
  if (template && consumerRound !== undefined) {
    if (consumerNodeId === template.review_node_id && prerequisiteNodeId === template.revision_node_id) {
      return nodes.some((item) => item.node_id === prerequisiteNodeId && item.round === consumerRound && item.state === "complete");
    }
    if (consumerNodeId === template.revision_node_id && prerequisiteNodeId === template.review_node_id) {
      return nodes.some((item) => item.node_id === prerequisiteNodeId && item.round === consumerRound - 1 && item.state === "complete");
    }
    if (prerequisite?.multiplicity === "repeatable") {
      return nodes.some((item) => item.node_id === prerequisiteNodeId && item.round === consumerRound && item.state === "complete");
    }
  }
  return nodes.some((item) => item.node_id === prerequisiteNodeId && item.state === "complete");
}

function branchUnlocksForRound(graph: CapabilityGraphProfile, nodes: readonly GraphNodeInstance[], nodeId: string, round: number | undefined): boolean {
  const template = graph.revision_round_template;
  const options = graph.decisions.flatMap((decision) => decision.options.map((option) => ({ decision, option })))
    .filter(({ decision, option }) => option.unlocks.includes(nodeId)
      && !(template
        && nodeId === template.revision_node_id
        && round === 1
        && decision.owner_node_id === template.review_node_id
        && option.option_id === template.continue_option_id));
  if (options.length === 0) return true;
  return options.some(({ decision, option }) => {
    const owners = nodes.filter((item) => item.node_id === decision.owner_node_id);
    if (owners.length === 0) return false;
    const expectedRound = template && nodeId === template.revision_node_id && decision.owner_node_id === template.review_node_id && round !== undefined
      ? round - 1
      : round;
    const candidates = expectedRound === undefined
      ? owners
      : owners.filter((item) => item.round === expectedRound);
    return candidates.some((owner) => owner.decisions.some((item) => item.decision_id === decision.decision_id && item.choice === option.option_id));
  });
}

function requiredGates(graph: CapabilityGraphProfile, gateIds: readonly string[]): GraphGate[] {
  return gateIds.flatMap((gateId) => {
    const gate = graph.gates.find((item) => item.gate_id === gateId);
    return gate ? [gate] : [];
  });
}

function requiredDecisions(graph: CapabilityGraphProfile, decisionIds: readonly string[]): GraphDecision[] {
  return decisionIds.flatMap((decisionId) => {
    const decision = graph.decisions.find((item) => item.decision_id === decisionId);
    return decision ? [decision] : [];
  });
}

function latestGateAttempt(nodes: readonly GraphNodeInstance[], gate: GraphGate, round?: number): GraphNodeInstance["gate_attempts"][number] | undefined {
  const attempts = nodes.filter((item) => item.node_id === gate.owner_node_id && item.round === round)
    .flatMap((item) => item.gate_attempts.map((attempt) => ({ node: item, attempt })))
    .filter(({ attempt }) => attempt.gate_id === gate.gate_id)
    .sort((left, right) => Date.parse(left.attempt.confirmed_at) - Date.parse(right.attempt.confirmed_at));
  return attempts.at(-1)?.attempt;
}

function latestGateVerdict(nodes: readonly GraphNodeInstance[], gate: GraphGate, round?: number): "pass" | "pass_with_conditions" | "fail" | undefined {
  return latestGateAttempt(nodes, gate, round)?.verdict;
}

function gateAccepted(nodes: readonly GraphNodeInstance[], gate: GraphGate, round?: number): boolean {
  const verdict = latestGateVerdict(nodes, gate, round);
  if (verdict === "pass" || verdict === "pass_with_conditions") return true;
  const latest = latestGateAttempt(nodes, gate, round);
  if (!latest || latest.verdict !== "fail") return false;
  const owner = nodes.find((item) => item.node_id === gate.owner_node_id && item.round === round);
  const override = owner?.gate_overrides?.find((item) => item.gate_id === gate.gate_id);
  return override !== undefined && Date.parse(override.approved_at) >= Date.parse(latest.confirmed_at);
}

function hasGateOverride(nodes: readonly GraphNodeInstance[], gate: GraphGate, round?: number): boolean {
  const latest = latestGateAttempt(nodes, gate, round);
  if (!latest || latest.verdict !== "fail") return false;
  return nodes.some((item) => item.node_id === gate.owner_node_id && item.round === round && (item.gate_overrides ?? []).some((override) => override.gate_id === gate.gate_id && Date.parse(override.approved_at) >= Date.parse(latest.confirmed_at)));
}

function decisionRecordedForRound(nodes: readonly GraphNodeInstance[], decision: GraphDecision, round: number | undefined): boolean {
  const owners = nodes.filter((item) => item.node_id === decision.owner_node_id);
  const candidates = round === undefined ? owners : owners.filter((item) => item.round === round);
  return candidates.some((owner) => owner.decisions.some((item) => item.decision_id === decision.decision_id));
}

function controlRound(graph: CapabilityGraphProfile, ownerNodeId: string, consumerRound: number | undefined): number | undefined {
  const owner = graph.nodes.find((item) => item.node_id === ownerNodeId);
  return owner?.multiplicity === "repeatable" ? consumerRound : undefined;
}

function templateClosed(graph: CapabilityGraphProfile, nodes: readonly GraphNodeInstance[]): boolean {
  const template = graph.revision_round_template;
  if (!template) return true;
  const decisionId = revisionDecisionId(graph, template.review_node_id);
  return nodes.some((item) => item.node_id === template.review_node_id
    && item.decisions.some((decision) => decision.decision_id === decisionId && decision.choice === template.exit_option_id));
}

function revisionDecisionId(graph: CapabilityGraphProfile, reviewNodeId: string): string | undefined {
  return graph.decisions.find((item) => item.owner_node_id === reviewNodeId)?.decision_id;
}

function instanceFor(nodes: readonly GraphNodeInstance[], nodeId: string, round: number | undefined): GraphNodeInstance | undefined {
  return nodes.find((item) => item.node_id === nodeId && item.round === round);
}

function nodeInstanceId(runId: string, nodeId: string, round: number | undefined): string {
  return round === undefined ? `${runId}.${nodeId}` : `${runId}.${nodeId}.r${String(round)}`;
}

function selectedGraphNodeIds(run: GraphRun, graph: CapabilityGraphProfile): Set<string> {
  const selected = new Set<string>([run.entry_node_id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of graph.nodes) {
      if (selected.has(node.node_id)) continue;
      const followsSelectedNode = node.prerequisites.some((item) => selected.has(item));
      const unlockedBySelectedDecision = graph.decisions.some((decision) => selected.has(decision.owner_node_id)
        && decision.options.some((option) => option.unlocks.includes(node.node_id)));
      if (followsSelectedNode || unlockedBySelectedDecision) {
        selected.add(node.node_id);
        changed = true;
      }
    }
  }
  return selected;
}

function requireNodeScanEntry(nodeEntries: GraphNodeScanRecord[], nodeId: string, round: number | undefined): GraphNodeScanRecord | undefined {
  const matches = nodeEntries.filter((entry) => entry.node?.node_id === nodeId && entry.node.round === round);
  if (matches.length > 1) throw new GraphRunError("node_identity_ambiguous", `Multiple node instances match ${nodeId}${round === undefined ? "" : ` round ${String(round)}`}.`, "conflict");
  return matches[0];
}

async function writeNodeFile(index: GraphWorkspaceIndex, node: GraphNodeInstance, scanned: GraphNodeScanRecord | undefined): Promise<void> {
  const { nodesDirectory } = requireRun(index, node.run_id);
  const fileName = node.round === undefined ? `${node.node_id}.yaml` : `${node.node_id}.round-${String(node.round)}.yaml`;
  const filePath = path.join(nodesDirectory, fileName);
  let currentText: string | undefined;
  try {
    currentText = await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  if (scanned === undefined && currentText !== undefined) {
    throw new GraphRunError("node_create_conflict", `Node file appeared after workspace scan: ${filePath}`, "conflict");
  }
  if (scanned !== undefined) {
    if (currentText === undefined) throw new GraphRunError("node_file_missing", `Node file disappeared after workspace scan: ${filePath}`, "conflict");
    if (scanned.text !== undefined && currentText !== scanned.text) throw new GraphRunError("node_write_conflict", `Node file changed after workspace scan: ${filePath}`, "conflict");
  }

  await commitGraphMutation(index, node.run_id, planDirectFileEdit({
    path: filePath,
    content: stringify(node),
    previousContent: scanned?.text,
    boundaryRoot: index.workspace,
    reason: "Update the owning graph node",
  }), { node });
}

export async function writeGraphHandoff(index: GraphWorkspaceIndex, handoff: RunHandoff, body: string): Promise<void> {
  const record = requireRun(index, handoff.run_id);
  const current = await readFile(record.handoffPath, "utf8").catch(() => undefined);
  if (current !== record.handoffText) throw new GraphRunError("handoff_write_conflict", "Run handoff changed after workspace scan.", "conflict");
  await commitGraphMutation(index, handoff.run_id, planDirectFileEdit({
    path: record.handoffPath,
    content: renderRunHandoff(handoff, body),
    previousContent: record.handoffText,
    boundaryRoot: index.workspace,
    reason: "Update the run handoff",
  }), { handoff });
}

async function commitGraphMutation(
  index: GraphWorkspaceIndex,
  runId: string,
  operation: PlannedWrite,
  change: { node: GraphNodeInstance } | { handoff: RunHandoff },
): Promise<void> {
  const snapshots = graphChildRunSnapshots(index);
  const candidate = snapshots.find((item) => item.run.run_id === runId);
  if (!candidate) throw new GraphRunError("run_incomplete", `Run snapshot is unavailable: ${runId}`, "conflict");
  if ("node" in change) {
    candidate.nodes = [...candidate.nodes.filter((node) => node.node_id !== change.node.node_id || node.round !== change.node.round), change.node];
  } else {
    candidate.handoff = change.handoff;
  }
  const operations = [operation];
  const affected = new Set<string>();
  let currentId: string | undefined = runId;
  while (currentId !== undefined) {
    if (affected.has(currentId)) throw new GraphRunError("run_parent_cycle", "Run parent bindings contain a cycle.", "conflict");
    affected.add(currentId);
    const record = requireRun(index, currentId);
    const snapshot = snapshots.find((item) => item.run.run_id === currentId);
    if (!snapshot) throw new GraphRunError("run_incomplete", `Run snapshot is unavailable: ${currentId}`, "conflict");
    if (snapshot.run.status === "active" && evaluateGraphFrontier(snapshot.run, snapshot.graph, snapshot.nodes, snapshots).completion_ready) {
      snapshot.run = { ...snapshot.run, status: "complete" };
      operations.push(planDirectFileEdit({
        path: record.runPath,
        content: stringify(snapshot.run),
        previousContent: record.runText,
        boundaryRoot: index.workspace,
        reason: "Persist graph run completion",
      }));
    }
    currentId = snapshot.run.parent_binding?.parent_run_id;
  }

  // Completion can depend on sibling and nested child runs as well as the changed owner.
  const children = new Map<string, string[]>();
  for (const { run } of snapshots) {
    const parentId = run.parent_binding?.parent_run_id;
    if (parentId !== undefined) children.set(parentId, [...(children.get(parentId) ?? []), run.run_id]);
  }
  for (const id of affected) {
    for (const childId of children.get(id) ?? []) affected.add(childId);
  }
  const readPreconditions = index.runs.filter((record) => record.run && affected.has(record.run.run_id)).flatMap((record) => [
    { path: record.runPath, text: record.runText },
    { path: record.graphPath, text: record.graphText },
    { path: record.handoffPath, text: record.handoffText },
    ...record.nodeEntries.map((entry) => ({ path: entry.filePath, text: entry.text })),
  ]).flatMap(({ path: filePath, text }) => text === undefined ? [] : [{ path: filePath, expectedHash: sha256(text), reason: "Graph mutation snapshot" }]);
  try {
    await executeWritePlan({ operations, readPreconditions, boundaryRoot: index.workspace });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT") {
      throw new GraphRunError("graph_write_conflict", error instanceof Error ? error.message : String(error), "conflict");
    }
    throw error;
  }
}

function requiredText(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new GraphRunError("text_required", `${label} is required.`, "usage");
  return trimmed;
}

function requireActiveRun(run: GraphRun): void {
  if (run.status !== "active") throw new GraphRunError("run_not_active", `Run ${run.run_id} is ${run.status} and cannot be mutated.`, "conflict");
}
