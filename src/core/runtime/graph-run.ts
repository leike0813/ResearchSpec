import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { stringify } from "yaml";

import {
  GraphNodeInstanceSchema,
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
import { sha256 } from "../workspace/write-plan.js";
import type { GraphNodeScanRecord, GraphWorkspaceIndex } from "./graph-workspace-index.js";
import { runCapabilityValidators } from "../../capabilities/validators.js";
import type { LoadedCapabilityRegistry } from "../../capabilities/registry.js";

export class GraphRunError extends Error {
  constructor(readonly code: string, message: string, readonly kind: "usage" | "domain" | "conflict" = "domain", readonly details?: unknown) {
    super(message);
    this.name = "GraphRunError";
  }
}

export interface StartGraphRunInput {
  index: GraphWorkspaceIndex;
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
  pending_gates: string[];
  pending_decisions: string[];
  blockers: GraphFrontierBlock[];
  completion_ready: boolean;
}

export interface SubmitGraphNodeInput {
  index: GraphWorkspaceIndex;
  runId: string;
  nodeId: string;
  round?: number;
  outputs: Array<{ role: string; path: string }>;
  submittedAt: string;
  dryRun?: boolean;
  capabilityRegistry?: LoadedCapabilityRegistry;
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
    start_confirmation: {
      confirmed_by: confirmedBy,
      confirmed_at: command.data.confirmed_at,
      prerequisites: command.data.prerequisites,
      expected_outputs: command.data.planned_outputs.map((item) => item.role),
      formal_gates: command.data.formal_gates,
      cost: command.data.cost,
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

export function evaluateGraphFrontier(run: GraphRun, graph: CapabilityGraphProfile, nodes: readonly GraphNodeInstance[]): GraphFrontier {
  const eligibleNodes: GraphFrontierNode[] = [];
  const pendingGates: string[] = [];
  const pendingDecisions: string[] = [];
  const blockers: GraphFrontierBlock[] = [];
  const entryNodeId = run.entry_node_id;

  const declaredEntryNodeIds = new Set(graph.entries.flatMap((entry) => entry.kind === "end-to-end" ? [entry.node_id] : entry.entry_points));
  for (const node of graph.nodes) {
    if (declaredEntryNodeIds.has(node.node_id) && node.node_id !== entryNodeId) continue;
    for (const round of candidateRounds(run, graph, nodes, node.node_id)) {
      const instance = instanceFor(nodes, node.node_id, round);
      if (instance && ["complete", "cancelled", "skipped"].includes(instance.state)) continue;

      const failedGates = requiredGates(graph, node.required_gate_ids)
        .filter((gate) => latestGateVerdict(nodes, gate) === "fail" && !hasGateOverride(nodes, gate));
      if (failedGates.length > 0) {
        blockers.push({
          node_id: node.node_id,
          code: "gate_failed",
          message: `Node ${node.node_id} has failed required Gates.`,
          refs: failedGates.map((gate) => `gate:${run.run_id}/${gate.gate_id}`),
        });
        continue;
      }

      const entryExempt = node.node_id === entryNodeId && isFirstEntryRound(run, graph, nodes, node.node_id, round);
      const prerequisitesOk = entryExempt || prerequisitesSatisfiedForRound(graph, node.node_id, node.prerequisites, nodes, round);
      const branchOk = entryExempt || branchUnlocksForRound(graph, nodes, node.node_id, round);
      const gatesOk = requiredGates(graph, node.required_gate_ids).every((gate) => gateAccepted(nodes, gate));
      const decisionsOk = requiredDecisions(graph, node.required_decision_ids).every((decision) => decisionRecordedForRound(nodes, decision, round));

      if (!prerequisitesOk || !branchOk || !gatesOk || !decisionsOk) continue;

      if (node.kind === "gate") {
        for (const gate of graph.gates.filter((item) => item.owner_node_id === node.node_id)) {
          if (!gateAccepted(nodes, gate)) pendingGates.push(`gate:${run.run_id}/${gate.gate_id}`);
        }
        continue;
      }
      if (node.kind === "decision") {
        for (const decision of graph.decisions.filter((item) => item.owner_node_id === node.node_id)) {
          if (!decisionRecordedForRound(nodes, decision, round)) pendingDecisions.push(`decision:${run.run_id}/${decision.decision_id}`);
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
    pending_gates: [...new Set(pendingGates)],
    pending_decisions: [...new Set(pendingDecisions)],
    blockers,
    completion_ready: graphRunCompletionReady(run, graph, nodes),
  };
}

export function isGraphNodeEligible(
  run: GraphRun,
  graph: CapabilityGraphProfile,
  nodes: readonly GraphNodeInstance[],
  nodeId: string,
  round?: number,
): boolean {
  return evaluateGraphFrontier(run, graph, nodes).eligible_nodes.some((item) => item.node_id === nodeId && item.round === round);
}

export async function submitGraphNode(input: SubmitGraphNodeInput): Promise<SubmitGraphNodeResult> {
  const record = requireRun(input.index, input.runId);
  const { run, graph } = record;
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
  if (!isGraphNodeEligible(run, graph, nodes, input.nodeId, input.round)) {
    throw new GraphRunError("node_not_eligible", `Node is not currently eligible: ${input.nodeId}${input.round === undefined ? "" : ` round ${String(input.round)}`}`, "conflict");
  }
  validateNodeOutputs(definition, input.outputs);
  if (definition.kind === "capability" && definition.capability_id !== undefined && input.capabilityRegistry) {
    const registered = input.capabilityRegistry.capabilities.get(definition.capability_id);
    if (!registered) throw new GraphRunError("capability_unknown", `Capability is not registered for this run: ${definition.capability_id}`, "domain");
    const validation = await runCapabilityValidators(registered.manifest, registered.packageRoot, {
      run_id: input.runId,
      node_id: input.nodeId,
      submitted_at: input.submittedAt,
      outputs: input.outputs,
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

  await writeNodeFile(record.nodesDirectory, node, scanEntry);
  return { node, created: existing === undefined, dry_run: false };
}

export async function recordGraphGate(input: RecordGraphGateInput): Promise<GraphNodeInstance> {
  const record = requireRun(input.index, input.runId);
  const { graph } = record;
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
  const scanEntry = requireNodeScanEntry(record.nodeEntries, gate.owner_node_id, input.round);
  const existing = instanceFor(nodes, gate.owner_node_id, input.round);
  const node = GraphNodeInstanceSchema.parse({
    schema_version: "2",
    node_instance_id: nodeInstanceId(input.runId, gate.owner_node_id, input.round),
    run_id: input.runId,
    node_id: gate.owner_node_id,
    ...(input.round === undefined ? {} : { round: input.round }),
    state: input.verdict === "fail" ? "eligible" : "complete",
    updated_at: input.confirmedAt,
    outputs: existing?.outputs ?? [],
    gate_attempts: [...(existing?.gate_attempts ?? []).filter((item) => item.gate_id !== input.gateId), attempt],
    gate_overrides: existing?.gate_overrides ?? [],
    decisions: existing?.decisions ?? [],
  });
  if (!input.dryRun) await writeNodeFile(record.nodesDirectory, node, scanEntry);
  return node;
}

export async function recordGraphDecision(input: RecordGraphDecisionInput): Promise<GraphNodeInstance> {
  const record = requireRun(input.index, input.runId);
  const { graph } = record;
  const decision = graph.decisions.find((item) => item.decision_id === input.decisionId);
  if (!decision) throw new GraphRunError("decision_unknown", `Decision is not declared by the frozen graph: ${input.decisionId}`, "usage");
  const option = decision.options.find((item) => item.option_id === input.choice);
  if (!option) throw new GraphRunError("decision_choice_invalid", `Unknown choice for Decision ${input.decisionId}: ${input.choice}`, "usage");
  const nodes = record.nodeEntries.flatMap((item) => item.node ? [item.node] : []);
  const scanEntry = requireNodeScanEntry(record.nodeEntries, decision.owner_node_id, input.round);
  const existing = instanceFor(nodes, decision.owner_node_id, input.round);
  const node = GraphNodeInstanceSchema.parse({
    schema_version: "2",
    node_instance_id: nodeInstanceId(input.runId, decision.owner_node_id, input.round),
    run_id: input.runId,
    node_id: decision.owner_node_id,
    ...(input.round === undefined ? {} : { round: input.round }),
    state: "complete",
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
  if (!input.dryRun) await writeNodeFile(record.nodesDirectory, node, scanEntry);
  return node;
}

export async function overrideGraphGate(input: OverrideGraphGateInput): Promise<GraphNodeInstance> {
  const record = requireRun(input.index, input.runId);
  const { graph } = record;
  const gate = graph.gates.find((item) => item.gate_id === input.gateId);
  if (!gate) throw new GraphRunError("gate_unknown", `Gate is not declared by the frozen graph: ${input.gateId}`, "usage");
  const nodes = record.nodeEntries.flatMap((item) => item.node ? [item.node] : []);
  const latest = latestGateAttempt(nodes, gate);
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
    state: "complete",
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
  if (!input.dryRun) await writeNodeFile(record.nodesDirectory, node, scanEntry);
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
  const childInputRoles = new Set(childProfile.nodes.flatMap((item) => item.input_bindings.map((binding) => binding.role)));
  const childOutputRoles = new Set(childProfile.nodes.flatMap((item) => item.expected_outputs.map((output) => output.role)));
  for (const binding of node.input_bindings) {
    if (!childInputRoles.has(binding.role)) diagnostics.push(`Subgraph input role is not consumed by child graph: ${binding.role}`);
  }
  for (const output of node.expected_outputs) {
    if (!childOutputRoles.has(output.role)) diagnostics.push(`Subgraph output role is not produced by child graph: ${output.role}`);
  }
  return diagnostics;
}

export function graphRunCompletionReady(run: GraphRun, graph: CapabilityGraphProfile, nodes: readonly GraphNodeInstance[]): boolean {
  if (run.status === "complete" || run.status === "cancelled") return true;
  const template = graph.revision_round_template;
  for (const node of graph.nodes) {
    if (node.multiplicity === "optional") continue;
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
  return !hasPendingHumanActions(graph, nodes);
}

interface RequiredRunRecord {
  run: GraphRun;
  graph: CapabilityGraphProfile;
  nodesDirectory: string;
  nodeEntries: GraphNodeScanRecord[];
}

function requireRun(index: GraphWorkspaceIndex, runId: string): RequiredRunRecord {
  const records = index.runs.filter((item) => item.run?.run_id === runId);
  if (records.length !== 1) throw new GraphRunError(records.length === 0 ? "run_not_found" : "run_ambiguous", `Run selector must resolve exactly once: ${runId}`, records.length === 0 ? "usage" : "conflict");
  const record = records[0];
  if (!record.run || !record.graph) throw new GraphRunError("run_incomplete", `Run is missing run.yaml or frozen graph: ${runId}`, "domain");
  return { run: record.run, graph: record.graph, nodesDirectory: record.nodesDirectory, nodeEntries: record.nodeEntries };
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
  return genericRepeatableRounds(nodes, nodeId).filter((round) => instanceFor(nodes, nodeId, round) === undefined);
}

function repeatableTemplateRounds(run: GraphRun, graph: CapabilityGraphProfile, nodes: readonly GraphNodeInstance[], nodeId: string): number[] {
  const template = graph.revision_round_template;
  if (!template) return [];
  const rounds = new Set<number>();
  if (nodeId === template.revision_node_id) {
    if (instanceFor(nodes, nodeId, 1) === undefined) rounds.add(1);
    for (const review of nodes.filter((item) => item.node_id === template.review_node_id && item.state === "complete" && item.round !== undefined)) {
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
  }
  return nodes.some((item) => item.node_id === prerequisiteNodeId && item.state === "complete");
}

function branchUnlocksForRound(graph: CapabilityGraphProfile, nodes: readonly GraphNodeInstance[], nodeId: string, round: number | undefined): boolean {
  const options = graph.decisions.flatMap((decision) => decision.options.map((option) => ({ decision, option })))
    .filter(({ option }) => option.unlocks.includes(nodeId));
  if (options.length === 0) return true;
  return options.some(({ decision, option }) => {
    const owners = nodes.filter((item) => item.node_id === decision.owner_node_id);
    if (owners.length === 0) return false;
    const template = graph.revision_round_template;
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

function latestGateAttempt(nodes: readonly GraphNodeInstance[], gate: GraphGate): GraphNodeInstance["gate_attempts"][number] | undefined {
  const attempts = nodes.filter((item) => item.node_id === gate.owner_node_id)
    .flatMap((item) => item.gate_attempts.map((attempt) => ({ node: item, attempt })))
    .filter(({ attempt }) => attempt.gate_id === gate.gate_id)
    .sort((left, right) => Date.parse(left.attempt.confirmed_at) - Date.parse(right.attempt.confirmed_at));
  return attempts.at(-1)?.attempt;
}

function latestGateVerdict(nodes: readonly GraphNodeInstance[], gate: GraphGate): "pass" | "pass_with_conditions" | "fail" | undefined {
  return latestGateAttempt(nodes, gate)?.verdict;
}

function gateAccepted(nodes: readonly GraphNodeInstance[], gate: GraphGate): boolean {
  const verdict = latestGateVerdict(nodes, gate);
  if (verdict === "pass" || verdict === "pass_with_conditions") return true;
  const latest = latestGateAttempt(nodes, gate);
  if (!latest || latest.verdict !== "fail") return false;
  const owner = nodes.find((item) => item.node_id === gate.owner_node_id);
  const override = owner?.gate_overrides?.find((item) => item.gate_id === gate.gate_id);
  return override !== undefined && Date.parse(override.approved_at) >= Date.parse(latest.confirmed_at);
}

function hasGateOverride(nodes: readonly GraphNodeInstance[], gate: GraphGate): boolean {
  const latest = latestGateAttempt(nodes, gate);
  if (!latest || latest.verdict !== "fail") return false;
  return nodes.some((item) => item.node_id === gate.owner_node_id && (item.gate_overrides ?? []).some((override) => override.gate_id === gate.gate_id && Date.parse(override.approved_at) >= Date.parse(latest.confirmed_at)));
}

function decisionRecordedForRound(nodes: readonly GraphNodeInstance[], decision: GraphDecision, round: number | undefined): boolean {
  const owners = nodes.filter((item) => item.node_id === decision.owner_node_id);
  const candidates = round === undefined ? owners : owners.filter((item) => item.round === round);
  return candidates.some((owner) => owner.decisions.some((item) => item.decision_id === decision.decision_id));
}

function templateClosed(graph: CapabilityGraphProfile, nodes: readonly GraphNodeInstance[]): boolean {
  const template = graph.revision_round_template;
  if (!template) return true;
  const decisionId = revisionDecisionId(graph, template.review_node_id);
  return nodes.some((item) => item.node_id === template.review_node_id
    && item.state === "complete"
    && item.decisions.some((decision) => decision.decision_id === decisionId && decision.choice === template.exit_option_id));
}

function revisionDecisionId(graph: CapabilityGraphProfile, reviewNodeId: string): string | undefined {
  return graph.decisions.find((item) => item.owner_node_id === reviewNodeId)?.decision_id;
}

function hasPendingHumanActions(graph: CapabilityGraphProfile, nodes: readonly GraphNodeInstance[]): boolean {
  for (const gate of graph.gates) {
    if (!gateAccepted(nodes, gate)) return true;
  }
  for (const decision of graph.decisions) {
    if (!decisionRecordedForRound(nodes, decision, undefined)) return true;
  }
  for (const node of graph.nodes) {
    const failedGates = requiredGates(graph, node.required_gate_ids)
      .filter((gate) => latestGateVerdict(nodes, gate) === "fail" && !hasGateOverride(nodes, gate));
    if (failedGates.length > 0) return true;
  }
  return false;
}

function instanceFor(nodes: readonly GraphNodeInstance[], nodeId: string, round: number | undefined): GraphNodeInstance | undefined {
  return nodes.find((item) => item.node_id === nodeId && item.round === round);
}

function nodeInstanceId(runId: string, nodeId: string, round: number | undefined): string {
  return round === undefined ? `${runId}.${nodeId}` : `${runId}.${nodeId}.r${String(round)}`;
}

function requireNodeScanEntry(nodeEntries: GraphNodeScanRecord[], nodeId: string, round: number | undefined): GraphNodeScanRecord | undefined {
  const matches = nodeEntries.filter((entry) => entry.node?.node_id === nodeId && entry.node.round === round);
  if (matches.length > 1) throw new GraphRunError("node_identity_ambiguous", `Multiple node instances match ${nodeId}${round === undefined ? "" : ` round ${String(round)}`}.`, "conflict");
  return matches[0];
}

async function writeNodeFile(nodesDirectory: string, node: GraphNodeInstance, scanned: GraphNodeScanRecord | undefined): Promise<void> {
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

  const temporary = `${filePath}.${randomUUID()}.tmp`;
  const backup = `${filePath}.${randomUUID()}.bak`;
  await mkdir(path.dirname(filePath), { recursive: true });
  try {
    await writeFile(temporary, stringify(node), { encoding: "utf8", flag: "wx" });
    if (currentText !== undefined) await rename(filePath, backup);
    await rename(temporary, filePath);
    if (currentText !== undefined) await rm(backup, { force: true });
  } catch (error) {
    await rm(temporary, { force: true }).catch(() => undefined);
    if (currentText !== undefined && !await fileExists(filePath) && await fileExists(backup)) {
      await rename(backup, filePath).catch(() => undefined);
    }
    throw error;
  }
}

async function fileExists(target: string): Promise<boolean> {
  try {
    await readFile(target);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

function requiredText(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new GraphRunError("text_required", `${label} is required.`, "usage");
  return trimmed;
}
