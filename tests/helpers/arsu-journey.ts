import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { parseEnvelope, runCli, type Envelope } from "./cli.js";

export interface BoundaryOutput {
  role: string;
  type: string;
  purpose: string;
  structure: string;
  validation_profile: "text-artifact" | "binary-file-artifact";
}

export interface RouteFrontierItem {
  kind: "route";
  selector: string;
  route_ref: string;
  profile_entry?: string;
  parent_instance_id?: string;
  node_id?: string;
  round?: number;
}

export interface ControlFrontierItem {
  kind: "gate" | "decision" | "advance";
  selector: string;
  instance_id: string;
  local_id?: string;
  transition?: string;
}

export type FrontierItem = RouteFrontierItem | ControlFrontierItem;

export interface StatusView {
  schema_version: "1";
  profile: { id: string; version: string; path: string };
  subflows: Record<string, number>;
  active_instances: Array<{ instance_id: string; route_ref: string; status: string; checkpoint: string }>;
  recent_instances: Array<{ instance_id: string; route_ref: string; status: string; started_at: string }>;
  pending_gates: unknown[];
  pending_decisions: unknown[];
  pending_changes: unknown[];
  frontier: FrontierItem[];
  blockers: Array<{ instance_id: string; code: string; message: string; refs: string[] }>;
  literature_adapters: Array<{ adapter_id: string; connection_state: string }>;
}

export interface RouteInstructions {
  selector: string;
  kind: "route";
  route: {
    route_ref: string;
    cost: { effort: string; interaction: string };
    boundary_outputs: BoundaryOutput[];
  };
  current_candidates: RouteFrontierItem[];
  boundary_outputs: BoundaryOutput[];
  formal_gates: string[];
  cost: { effort: string; interaction: string };
  confirmation_required: true;
  start_input: {
    schema_version: "1";
    confirmed_at: string;
    profile_entry?: string;
    prerequisites: string[];
    handoff_inputs: HandoffEntry[];
    planned_outputs: HandoffEntry[];
    formal_gates: string[];
    cost: { effort: string; interaction: string };
  };
}

export interface HandoffEntry {
  role: string;
  type: string;
  path: string;
  purpose: string;
  limits?: string[];
  notes?: string;
  intended_consumer?: string;
  source_instance_id?: string;
}

export interface SubflowView {
  selector: string;
  instance_id: string;
  route_ref: string;
  status: string;
  checkpoint: string;
  parent: { instance_id: string; node_id: string } | null;
  round?: number;
  start_confirmation: { confirmed_by: string; expected_outputs: string[]; formal_gates: string[] };
  gates: Array<{ gate_id: string; attempts: Array<{ verdict: string }>; override?: { decision_id: string } | null }>;
  decisions: Array<{ decision_id: string; kind: string; choice: string }>;
  transitions: Array<{ transition_id: string; from: string; to: string }>;
  children: string[];
}

export interface StartResult {
  instanceId: string;
  selector: string;
  routeRef: string;
  inputPath: string;
  command: Record<string, unknown>;
  outputs: HandoffEntry[];
  candidate?: RouteFrontierItem;
}

export interface JourneyContext {
  root: string;
  workspace: string;
  sequence: number;
  starts: StartResult[];
}

export function cliJson<T>(args: string[], cwd: string): Envelope<T> {
  const result = runCli([...args, "--json"], cwd);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const envelope = parseEnvelope<T>(result);
  assert.equal(envelope.ok, true, JSON.stringify(envelope.error));
  return envelope;
}

export function initialize(root: string, tools = "forgecode"): JourneyContext {
  const initialized = runCli(["init", root, "--tools", tools, "--json"]);
  assert.equal(initialized.status, 0, initialized.stderr || initialized.stdout);
  return { root, workspace: path.join(root, "researchspec"), sequence: 0, starts: [] };
}

export function status(context: JourneyContext): StatusView {
  const data = cliJson<StatusView>(["status"], context.root).data;
  assert.ok(data);
  return data;
}

export function instructions(context: JourneyContext, selector: string): unknown {
  const data = cliJson<unknown>(["instructions", selector], context.root).data;
  assert.ok(data);
  return data;
}

export function showSubflow(context: JourneyContext, instanceId: string): SubflowView {
  const data = cliJson<SubflowView>(["show", `subflow:${instanceId}`], context.root).data;
  assert.ok(data);
  return data;
}

export async function startRoute(
  context: JourneyContext,
  routeRef: string,
  candidate?: RouteFrontierItem,
): Promise<StartResult> {
  const packet = instructions(context, `route:${routeRef}`) as RouteInstructions;
  assert.equal(packet.confirmation_required, true);
  assert.equal(packet.route.route_ref, routeRef);
  const selected = candidate ?? packet.current_candidates.find((item) => item.profile_entry !== undefined);
  const sequence = context.sequence++;
  const outputs = selected?.profile_entry
    ? []
    : packet.boundary_outputs.map((output) => ({
        role: output.role,
        type: output.type,
        path: `outputs/journey-${String(sequence)}/${output.role}.${output.validation_profile === "binary-file-artifact" ? "bin" : "md"}`,
        purpose: output.purpose,
        intended_consumer: selected?.parent_instance_id ? `subflow:${selected.parent_instance_id}` : "user",
      }));
  const formalGates = selected?.node_id
    ? gatesForProfileNode(context, selected.node_id)
    : packet.formal_gates;
  const command = {
    schema_version: "1",
    confirmed_at: new Date(Date.UTC(2026, 7, 2, 2, sequence, 0)).toISOString(),
    ...(selected?.profile_entry ? { profile_entry: selected.profile_entry } : {}),
    ...(selected?.parent_instance_id && selected.node_id
      ? { parent: { instance_id: selected.parent_instance_id, node_id: selected.node_id } }
      : {}),
    ...(selected?.round === undefined ? {} : { round: selected.round }),
    prerequisites: [],
    handoff_inputs: [],
    planned_outputs: outputs,
    formal_gates: formalGates,
    cost: packet.cost,
  };
  const inputPath = await writePayload(context, `start-${slug(routeRef)}`, command);
  const started = cliJson<{ status: string; instance_id: string }>([
    "start", routeRef, "--input", inputPath, "--confirmed-by", "Acceptance Researcher",
  ], context.root).data;
  assert.ok(started?.instance_id);
  assert.ok(started.status === "started" || started.status === "already_started");
  await writeProducerOutputs(context, outputs, routeRef);
  const result: StartResult = {
    instanceId: started.instance_id,
    selector: `subflow:${started.instance_id}`,
    routeRef,
    inputPath,
    command,
    outputs,
    ...(selected ? { candidate: selected } : {}),
  };
  context.starts.push(result);
  return result;
}

export function retryStart(context: JourneyContext, start: StartResult): { status: string; instance_id: string } {
  const retried = cliJson<{ status: string; instance_id: string }>([
    "start", start.routeRef, "--input", start.inputPath, "--confirmed-by", "Acceptance Researcher",
  ], context.root).data;
  assert.ok(retried);
  return retried;
}

export function decideGate(
  context: JourneyContext,
  selector: string,
  verdict: "pass" | "pass_with_conditions" | "fail",
): void {
  const packet = instructions(context, selector) as {
    kind: "gate";
    handoff: { outputs: HandoffEntry[] };
  };
  const evidenceRole = packet.handoff.outputs[0]?.role;
  assert.ok(evidenceRole, `Gate ${selector} requires a produced handoff role.`);
  cliJson([
    "decide", selector,
    "--verdict", verdict,
    "--actor-name", "Acceptance Researcher",
    "--reason", `Acceptance journey recorded ${verdict}.`,
    "--evidence-role", evidenceRole,
  ], context.root);
}

export function overrideGate(context: JourneyContext, selector: string): void {
  cliJson([
    "decide", selector,
    "--override",
    "--actor-name", "Acceptance Researcher",
    "--reason", "Explicit acceptance override after confirmed failure.",
  ], context.root);
}

export function decideBranch(context: JourneyContext, selector: string, choice: string): void {
  cliJson([
    "decide", selector,
    "--kind", "branch",
    "--choice", choice,
    "--actor-name", "Acceptance Researcher",
    "--reason", "Selected by the packaged CLI journey.",
  ], context.root);
}

export function advanceSubflow(context: JourneyContext, item: ControlFrontierItem): void {
  const args = ["advance", item.selector, "--actor-name", "acceptance-driver"];
  if (item.transition) args.push("--transition", item.transition);
  cliJson(args, context.root);
}

export async function drivePipeline(
  context: JourneyContext,
  parentId: string,
  options: { revisionRounds: number },
): Promise<StatusView> {
  let revisionOutcomeCount = 0;
  for (let step = 0; step < 200; step += 1) {
    const current = status(context);
    if (showSubflow(context, parentId).status === "complete") return current;

    const route = current.frontier.find((item): item is RouteFrontierItem =>
      item.kind === "route" && item.parent_instance_id === parentId);
    if (route) {
      await startRoute(context, route.route_ref, route);
      continue;
    }

    const gate = current.frontier.find((item): item is ControlFrontierItem => item.kind === "gate");
    if (gate) {
      decideGate(context, gate.selector, "pass");
      continue;
    }

    const decision = current.frontier.find((item): item is ControlFrontierItem => item.kind === "decision");
    if (decision) {
      const packet = instructions(context, decision.selector) as {
        branch: { options: Array<{ option_id: string }> } | null;
      };
      const optionsAvailable = packet.branch?.options.map((item) => item.option_id) ?? [];
      let choice = optionsAvailable[0] ?? "";
      if (decision.local_id === "editorial-outcome") {
        choice = options.revisionRounds > 0 ? "revision" : "accepted";
      } else if (decision.local_id === "revision-outcome") {
        choice = revisionOutcomeCount < options.revisionRounds - 1 ? "continue-revision" : "accepted";
        revisionOutcomeCount += 1;
      }
      assert.ok(optionsAvailable.includes(choice), `Unsupported branch choice ${choice} for ${decision.selector}`);
      decideBranch(context, decision.selector, choice);
      continue;
    }

    const advance = current.frontier.find((item): item is ControlFrontierItem => item.kind === "advance");
    if (advance) {
      advanceSubflow(context, advance);
      continue;
    }
    throw new Error(`Pipeline journey stalled at step ${String(step)}: ${JSON.stringify(current.frontier)}`);
  }
  throw new Error("Pipeline journey exceeded 200 public CLI actions.");
}

function gatesForProfileNode(context: JourneyContext, nodeId: string): string[] {
  const profile = cliJson<{
    children: Array<{ node_id: string; required_gate_ids: string[] }>;
  }>(["show", "profile:academic-pipeline"], context.root).data;
  const node = profile?.children.find((item) => item.node_id === nodeId);
  assert.ok(node, `Unknown pipeline node: ${nodeId}`);
  return node.required_gate_ids;
}

async function writeProducerOutputs(context: JourneyContext, outputs: HandoffEntry[], routeRef: string): Promise<void> {
  for (const output of outputs) {
    const outputPath = path.join(context.root, output.path);
    await mkdir(path.dirname(outputPath), { recursive: true });
    const bytes = output.path.endsWith(".bin")
      ? Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x52, 0x53])
      : Buffer.from(`# Acceptance deliverable\n\nRoute: ${routeRef}\nRole: ${output.role}\n`, "utf8");
    await writeFile(outputPath, bytes);
  }
}

async function writePayload(context: JourneyContext, prefix: string, value: unknown): Promise<string> {
  const directory = path.join(context.root, ".acceptance-inputs");
  await mkdir(directory, { recursive: true });
  const filePath = path.join(directory, `${prefix}-${String(context.sequence)}.json`);
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return filePath;
}

function slug(value: string): string {
  return value.replace(/[^a-z0-9]+/g, "-");
}
