import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { parseEnvelope, runCli, type Envelope } from "./cli.js";

export interface WorkflowControlView {
  state: string;
  frontier: string[];
  ready_items: string[];
  startable_subflows: string[];
  work_items: Array<{ selector: string; state: string; dispatchable: boolean; instance_id?: string; work_item_id: string }>;
  subflows: Array<{ selector: string; kind: string; state: string; instance_id?: string; parent_subflow_id?: string | null; parent_node_id?: string | null; round_number?: number | null }>;
  parallel_groups: Array<{ selector: string; state: string; join_policy: string; ready_members: string[]; dispatchable_members: string[]; done_members: string[] }>;
  gates: Array<{ selector: string; state: string; latest_event_id?: string; subflow_instance_id: string }>;
  transitions: Array<{ selector: string; transition_node_id: string; decision_point_id?: string; state: string; automatic: boolean; subflow_instance_id: string }>;
}

export interface StatusView {
  run: { status: string; subflows?: Array<Record<string, unknown>> };
  workflow_control: WorkflowControlView;
  pending_items: string[];
  blocking_gates: Array<Record<string, unknown>>;
}

export interface SubflowPacket {
  selector: string;
  subject_kind: "template" | "child" | "instance";
  template_id: string;
  route: Record<string, unknown>;
  required_user_input_ids: string[];
  prerequisites: Array<{ requirements: Array<{ kind: string; available: boolean; artifact_ids?: string[] }> }>;
  work_items: Array<Record<string, unknown>>;
  parallel_groups: Array<Record<string, unknown>>;
  subflow_nodes: Array<Record<string, unknown>>;
  gates: Array<Record<string, unknown>>;
  transitions: Array<Record<string, unknown>>;
  instruction_basis_sha256: string;
  runtime?: { parent_subflow_id: string | null; parent_node_id?: string | null; round_number: number | null };
}

export interface WorkPacket {
  selector: string;
  producer_skill: string;
  output: { artifact_type: string; resolved_path: string; template_ref: string };
  dependencies: { artifacts: Array<{ artifact_type: string; artifact_ids: string[] }> };
  validation: { profile: string };
  completion: { submit_available: boolean };
}

export interface GatePacket {
  selector: string;
  instruction_basis_sha256: string;
  evidence: Array<Record<string, unknown>>;
  latest_attempt: { event_id: string; verdict: string } | null;
}

export interface JourneyContext { root: string; workspace: string }

export function cliJson<T>(args: string[], cwd: string): Envelope<T> {
  const result = runCli([...args, "--json"], cwd);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const envelope = parseEnvelope<T>(result);
  assert.equal(envelope.ok, true, JSON.stringify(envelope.error));
  return envelope;
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

export function initialize(root: string): JourneyContext {
  const result = runCli(["init", root, "--tools", "forgecode", "--json"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return { root, workspace: path.join(root, "researchspec") };
}

export async function startSubflow(context: JourneyContext, selector: string): Promise<string> {
  const packet = instructions(context, selector) as SubflowPacket;
  const decisions = cliJson<{ items: Array<{ id?: string; value?: { decision_id?: string; status?: string } }> }>(["list", "decisions"], context.root).data?.items ?? [];
  const payload = {
    schema_version: "1",
    instruction_basis_sha256: packet.instruction_basis_sha256,
    acknowledged_user_input_ids: packet.required_user_input_ids,
    prerequisite_artifact_ids: [...new Set(packet.prerequisites.flatMap((group) => group.requirements.flatMap((item) => item.available ? item.artifact_ids ?? [] : [])))],
    prerequisite_decision_ids: decisions.filter((item) => item.value?.status === "accepted").map((item) => item.value?.decision_id ?? item.id).filter((item): item is string => Boolean(item)),
    parent_subflow_selector: packet.subject_kind === "child" ? `subflow:${packet.runtime?.parent_subflow_id ?? ""}` : null,
  };
  const inputPath = await writePayload(context, "start", payload);
  const base = ["start", selector, "--input", inputPath, "--actor-kind", "agent", "--actor-name", "acceptance-driver"];
  if (packet.subject_kind === "template") base.push("--confirmed-by", "Acceptance Researcher");
  const preview = cliJson<{ plan_sha256: string; instance_selector: string }>([...base, "--dry-run"], context.root).data;
  assert.ok(preview?.plan_sha256);
  const execution = cliJson<{ instance_selector: string }>([...base, "--expected-plan-sha256", preview.plan_sha256, "--yes"], context.root).data;
  assert.ok(execution?.instance_selector);
  return execution.instance_selector;
}

export async function submitWork(context: JourneyContext, selector: string): Promise<void> {
  const packet = instructions(context, selector) as WorkPacket;
  assert.equal(packet.completion.submit_available, true);
  await mkdir(path.dirname(packet.output.resolved_path), { recursive: true });
  const content = packet.validation.profile === "binary-file-artifact"
    ? Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x52, 0x53])
    : Buffer.from(`# Acceptance candidate\n\n${selector}\n`, "utf8");
  await writeFile(packet.output.resolved_path, content);
  const payload = {
    schema_version: "1",
    dependency_artifact_ids: [...new Set(packet.dependencies.artifacts.flatMap((item) => item.artifact_ids))],
  };
  const inputPath = await writePayload(context, "submit", payload);
  const base = ["submit", selector, "--input", inputPath, "--actor-kind", "agent", "--actor-name", packet.producer_skill];
  const preview = cliJson<{ candidate_sha256: string }>([...base, "--dry-run"], context.root).data;
  assert.ok(preview?.candidate_sha256);
  cliJson([...base, "--expected-sha256", preview.candidate_sha256, "--yes"], context.root);
}

export async function submitGate(context: JourneyContext, selector: string, verdict: "pass" | "fail", verificationKind: "initial" | "reverification" = "initial"): Promise<{ event_id: string }> {
  const packet = instructions(context, selector) as GatePacket;
  assert.ok(packet.evidence.length > 0);
  const payload = {
    schema_version: "1",
    instruction_basis_sha256: packet.instruction_basis_sha256,
    verdict,
    verification_kind: verificationKind,
    evidence: packet.evidence,
    findings: [{ code: verdict === "pass" ? "acceptance-pass" : "acceptance-fail", summary: `Acceptance ${verdict}`, evidence_indexes: [0] }],
    ...(verificationKind === "reverification" ? { supersedes_event_id: packet.latest_attempt?.event_id } : {}),
  };
  const inputPath = await writePayload(context, "gate", payload);
  const base = ["submit", selector, "--input", inputPath, "--actor-kind", "validator", "--actor-name", "researchspec-verify", "--confirmed-by", "Acceptance Researcher"];
  const preview = cliJson<{ plan_sha256: string }>([...base, "--dry-run"], context.root).data;
  assert.ok(preview?.plan_sha256);
  const execution = cliJson<{ event: { event_id: string } }>([...base, "--expected-plan-sha256", preview.plan_sha256, "--yes"], context.root).data;
  assert.ok(execution?.event.event_id);
  return execution.event;
}

export function decideTransition(context: JourneyContext, selector: string): void {
  const base = ["decide", selector, "--decision", "accept", "--actor-name", "Acceptance Researcher", "--reason", "Selected by acceptance journey"];
  cliJson([...base, "--dry-run"], context.root);
  cliJson(base, context.root);
}

export function overrideGate(context: JourneyContext, selector: string): void {
  const base = ["decide", selector, "--decision", "accept", "--actor-name", "Acceptance Researcher", "--reason", "Explicit acceptance override"];
  cliJson([...base, "--dry-run"], context.root);
  cliJson(base, context.root);
}

export function advanceTransition(context: JourneyContext, selector: string): void {
  const base = ["advance", selector, "--actor-kind", "agent", "--actor-name", "acceptance-driver"];
  const preview = cliJson<{ plan_sha256: string }>([...base, "--dry-run"], context.root).data;
  assert.ok(preview?.plan_sha256);
  cliJson([...base, "--expected-plan-sha256", preview.plan_sha256, "--yes"], context.root);
}

export async function drive(context: JourneyContext, rootSelector: string, choose: (candidates: WorkflowControlView["transitions"]) => string = chooseAccepted): Promise<StatusView> {
  const instanceId = rootSelector.slice("subflow:".length);
  for (let step = 0; step < 300; step += 1) {
    const current = status(context);
    const root = current.workflow_control.subflows.find((item) => item.kind === "instance" && item.instance_id === instanceId);
    if (root?.state === "complete") return current;

    const readyWork = current.workflow_control.ready_items[0];
    if (readyWork) { await submitWork(context, readyWork); continue; }

    const child = current.workflow_control.subflows.find((item) => item.kind === "child" && item.state === "available");
    if (child) { await startSubflow(context, child.selector); continue; }

    const gate = current.workflow_control.gates.find((item) => item.state === "ready");
    if (gate) { await submitGate(context, gate.selector, "pass"); continue; }

    const decisionCandidates = current.workflow_control.transitions.filter((item) => item.state === "decision_required");
    if (decisionCandidates.length) { decideTransition(context, choose(decisionCandidates)); continue; }

    const transition = current.workflow_control.transitions.find((item) => item.state === "ready");
    if (transition) { advanceTransition(context, transition.selector); continue; }

    throw new Error(`Journey stalled at step ${String(step)}: ${JSON.stringify(current.workflow_control.frontier)}`);
  }
  throw new Error("Journey exceeded 300 public CLI actions.");
}

export function chooseAccepted(candidates: WorkflowControlView["transitions"]): string {
  const accepted = candidates.find((item) => /accept/.test(item.transition_node_id));
  return (accepted ?? candidates[0])?.selector ?? "";
}

export async function readRegistry(context: JourneyContext): Promise<{ artifacts: Array<Record<string, unknown>> }> {
  return JSON.parse(await readFile(path.join(context.workspace, "runs/current/artifact-registry.json"), "utf8")) as { artifacts: Array<Record<string, unknown>> };
}

async function writePayload(context: JourneyContext, prefix: string, value: unknown): Promise<string> {
  const directory = path.join(context.root, ".acceptance-inputs");
  await mkdir(directory, { recursive: true });
  const filePath = path.join(directory, `${prefix}-${String(Date.now())}-${Math.random().toString(16).slice(2)}.json`);
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return filePath;
}
