import { randomUUID } from "node:crypto";
import { lstat, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml, stringify } from "yaml";

import { getArsuRoute } from "../../arsu-converter/routing/catalog.js";
import { RouteRefSchema, type RouteRef } from "../../arsu-converter/routing/contracts.js";
import { SubflowStartCommandSchema, type SubflowStartCommand } from "../contracts/subflow-command.js";
import {
  SubflowControlSchema,
  type SubflowControl,
} from "../contracts/subflow-control.js";
import { renderSubflowHandoff, type SubflowHandoff } from "../contracts/subflow-handoff.js";
import { sha256 } from "../workspace/write-plan.js";
import { BoundaryPathError, resolveBoundaryPath } from "./boundary-path.js";
import {
  childStartCandidates,
  eligibleProfileTransitions,
  isGateAccepted,
  isSubflowCompletionReady,
} from "./workflow-control.js";
import type { CurrentWorkspaceIndex, SubflowRecord } from "./workspace-index.js";

export type LifecycleTransition = "pause" | "resume" | "cancel" | "complete";
export type GateVerdict = "pass" | "pass_with_conditions" | "fail";
export type LocalDecisionKind = "scope" | "claim" | "structure" | "branch";

export class SubflowControlError extends Error {
  constructor(readonly code: string, message: string, readonly kind: "usage" | "domain" | "conflict" = "domain", readonly details?: unknown) {
    super(message);
    this.name = "SubflowControlError";
  }
}

export interface StartSubflowInput {
  index: CurrentWorkspaceIndex;
  routeRef: string;
  command: unknown;
  confirmedBy: string;
  dryRun?: boolean;
}

export interface StartSubflowResult {
  status: "started" | "would_start" | "already_started";
  instance_id: string;
  directory: string;
  control: SubflowControl;
  handoff: SubflowHandoff;
}

export async function startSubflow(input: StartSubflowInput): Promise<StartSubflowResult> {
  const parsedRoute = RouteRefSchema.safeParse(input.routeRef);
  if (!parsedRoute.success) throw new SubflowControlError("route_invalid", `Unknown or invalid route reference: ${input.routeRef}`, "usage");
  const command = parseStartCommand(input.command);
  const confirmedBy = input.confirmedBy.trim();
  if (!confirmedBy) throw new SubflowControlError("confirmation_missing", "Start requires a human confirmer.", "usage");
  const route = getArsuRoute(parsedRoute.data as RouteRef);
  if (command.cost.effort !== route.cost.effort || command.cost.interaction !== route.cost.interaction) {
    throw new SubflowControlError("start_cost_mismatch", "Confirmed cost must match the selected route summary.", "conflict");
  }
  validateManuscriptDeliveryStart(input.index, parsedRoute.data as RouteRef, command);

  for (const item of command.handoff_inputs) {
    await resolveCommandBoundaryPath(input.index.projectRoot, item.path, "consume-input");
    if (item.source_instance_id && findRecords(input.index, item.source_instance_id).length !== 1) {
      throw new SubflowControlError("handoff_source_invalid", `Input source instance is unavailable: ${item.source_instance_id}`);
    }
  }
  for (const item of command.planned_outputs) await resolveCommandBoundaryPath(input.index.projectRoot, item.path);

  const context = resolveStartContext(input.index, parsedRoute.data, command);
  const semanticIdentity = { route_ref: parsedRoute.data, confirmed_by: confirmedBy, command };
  const identityHash = sha256(JSON.stringify(semanticIdentity));
  const instanceId = `sf-${identityHash.slice(0, 24)}`;
  const scanned = input.index.subflowEntries.filter((item) => item.control?.instance_id === instanceId);
  if (scanned.some((item) => item.handoff === undefined)) {
    throw new SubflowControlError("subflow_identity_damaged", `Existing subflow identity has an invalid or missing handoff: ${instanceId}`, "conflict");
  }
  const existing = findRecords(input.index, instanceId);
  if (existing.length > 1) throw new SubflowControlError("subflow_identity_ambiguous", `Multiple controls use instance ID ${instanceId}.`, "conflict");
  if (existing[0]) {
    return {
      status: "already_started",
      instance_id: instanceId,
      directory: existing[0].directoryPath,
      control: existing[0].control,
      handoff: existing[0].handoff,
    };
  }

  const [skillId, modeId] = parsedRoute.data.split(":", 2) as [string, string];
  const control = SubflowControlSchema.parse({
    schema_version: "1",
    instance_id: instanceId,
    route_ref: parsedRoute.data,
    skill_id: skillId,
    mode_id: modeId,
    profile: context.profile,
    parent: context.parent,
    ...(context.round === undefined ? {} : { round: context.round }),
    started_at: command.confirmed_at,
    start_confirmation: {
      confirmed_by: confirmedBy,
      confirmed_at: command.confirmed_at,
      prerequisites: command.prerequisites,
      expected_outputs: command.planned_outputs.map((item) => item.role),
      ...(command.manuscript_delivery ? { manuscript_delivery: command.manuscript_delivery } : {}),
      ...(command.quarto_probe ? { quarto_probe: command.quarto_probe } : {}),
      ...(command.render_consent ? { render_consent: command.render_consent } : {}),
      formal_gates: command.formal_gates,
      cost: command.cost,
    },
    status: "active",
    checkpoint: context.checkpoint,
    gates: command.formal_gates.map((gateId) => ({ gate_id: gateId, attempts: [] })),
    decisions: [],
    transitions: [],
  });
  const handoff: SubflowHandoff = {
    schema_version: "1",
    subflow_instance_id: instanceId,
    updated_at: command.confirmed_at,
    inputs: command.handoff_inputs,
    outputs: command.planned_outputs,
  };
  const directoryName = startDirectoryName(skillId, modeId, command.confirmed_at, identityHash);
  const directory = path.join(input.index.workspace, "subflows", directoryName);
  if (input.dryRun) return { status: "would_start", instance_id: instanceId, directory, control, handoff };

  await createSubflowDirectory(directory, control, handoff);
  return { status: "started", instance_id: instanceId, directory, control, handoff };
}

function validateManuscriptDeliveryStart(
  index: CurrentWorkspaceIndex,
  routeRef: RouteRef,
  command: SubflowStartCommand,
): void {
  const usesManuscript = routeRef.startsWith("academic-paper:")
    || routeRef.startsWith("academic-paper-reviewer:")
    || routeRef.startsWith("academic-pipeline:");
  if (!usesManuscript) {
    if (command.render_consent) throw new SubflowControlError("render_consent_route_invalid", "Render consent is valid only for format conversion.", "usage");
    return;
  }
  if (!command.manuscript_delivery) {
    throw new SubflowControlError("manuscript_delivery_snapshot_missing", "Start requires the current manuscript delivery snapshot.", "usage");
  }
  if (JSON.stringify(command.manuscript_delivery) !== JSON.stringify(index.manuscript.delivery)) {
    throw new SubflowControlError("manuscript_delivery_snapshot_stale", "Confirmed manuscript delivery does not match specs/manuscript.yaml.", "conflict");
  }
  if (command.manuscript_delivery.working_format === null) {
    throw new SubflowControlError("manuscript_format_unselected", "Select and confirm the manuscript working format before starting this route.", "conflict");
  }
  const qmdWritingRoute = routeRef.startsWith("academic-paper:") || routeRef.startsWith("academic-pipeline:");
  if (command.manuscript_delivery.working_format === "qmd" && qmdWritingRoute && !command.quarto_probe) {
    throw new SubflowControlError("quarto_probe_missing", "QMD writing and resume starts require a current Quarto probe summary.", "usage");
  }
  if (routeRef !== "academic-paper:format-convert") {
    if (command.render_consent) throw new SubflowControlError("render_consent_route_invalid", "Render consent is valid only for format conversion.", "usage");
    return;
  }
  const source = command.handoff_inputs.find((item) => item.role === "manuscript_source" && item.format === index.manuscript.delivery.working_format);
  if (!source) {
    throw new SubflowControlError("format_handoff_mismatch", "Format conversion requires a manuscript source matching the selected working format.", "conflict");
  }
  if (index.manuscript.delivery.working_format === "markdown") {
    if (command.render_consent) throw new SubflowControlError("render_consent_route_invalid", "Quarto render consent is not valid for Markdown delivery.", "usage");
    return;
  }
  if (command.quarto_probe?.status !== "available") {
    throw new SubflowControlError(
      command.quarto_probe?.status === "unavailable" ? "quarto_unavailable" : "quarto_status_unknown",
      "Format conversion requires a current available Quarto probe.",
      "conflict",
    );
  }
  const targetFormat = index.manuscript.delivery.final_output_format;
  const rendered = command.planned_outputs.find((item) => item.role === "formatted_manuscript" && item.renderer === "quarto" && item.format === targetFormat);
  if (!rendered) {
    throw new SubflowControlError("format_handoff_mismatch", "Format conversion requires a QMD input and a Quarto output matching the selected target format.", "conflict");
  }
}

export async function appendGateAttempt(input: {
  index: CurrentWorkspaceIndex;
  instanceId: string;
  gateId: string;
  verdict: GateVerdict;
  confirmedBy: string;
  confirmedAt: string;
  summary: string;
  evidenceRole?: string;
  dryRun?: boolean;
  expectedControlText?: string;
}): Promise<SubflowControl> {
  const record = requireRecord(input.index, input.instanceId);
  const evidence = input.evidenceRole ? await gateEvidence(input.index, record, input.evidenceRole) : undefined;
  const attemptId = `attempt-${sha256(JSON.stringify({ gate: input.gateId, verdict: input.verdict, by: input.confirmedBy, at: input.confirmedAt, summary: input.summary, evidence })).slice(0, 20)}`;
  return mutateControl(record, (control) => {
    const gate = control.gates.find((item) => item.gate_id === input.gateId);
    if (!gate) throw new SubflowControlError("gate_not_found", `Gate does not belong to this subflow: ${input.gateId}`, "usage");
    const allowed = profileGateVerdicts(input.index, input.gateId);
    if (allowed && !allowed.includes(input.verdict)) throw new SubflowControlError("gate_verdict_invalid", `Verdict ${input.verdict} is not allowed for Gate ${input.gateId}.`, "usage");
    const attempt = { attempt_id: attemptId, verdict: input.verdict, confirmed_by: requiredText(input.confirmedBy, "Gate confirmer"), confirmed_at: input.confirmedAt, summary: requiredText(input.summary, "Gate summary"), ...(evidence ? { evidence: [evidence] } : {}) };
    const prior = gate.attempts.find((item) => item.attempt_id === attemptId);
    if (prior) {
      if (JSON.stringify(prior) !== JSON.stringify(attempt)) throw new SubflowControlError("gate_attempt_conflict", `Gate attempt ID conflicts: ${attemptId}`, "conflict");
      return control;
    }
    gate.attempts.push(attempt);
    return control;
  }, input);
}

export async function recordLocalDecision(input: {
  index: CurrentWorkspaceIndex;
  instanceId: string;
  decisionId: string;
  kind: LocalDecisionKind;
  choice: string;
  decidedBy: string;
  decidedAt: string;
  reason?: string;
  dryRun?: boolean;
  expectedControlText?: string;
}): Promise<SubflowControl> {
  const record = requireRecord(input.index, input.instanceId);
  return mutateControl(record, (control) => {
    if (control.decisions.some((item) => item.decision_id === input.decisionId)) {
      throw new SubflowControlError("decision_exists", `Decision already exists: ${input.decisionId}`, "conflict");
    }
    if (input.kind === "branch") validateBranchChoice(input.index, record, input.decisionId, input.choice);
    control.decisions.push({
      decision_id: input.decisionId,
      kind: input.kind,
      choice: requiredText(input.choice, "Decision choice"),
      decided_by: requiredText(input.decidedBy, "Decision actor"),
      decided_at: input.decidedAt,
      ...(input.reason?.trim() ? { reason: input.reason.trim() } : {}),
    });
    return control;
  }, input);
}

export async function overrideFailedGate(input: {
  index: CurrentWorkspaceIndex;
  instanceId: string;
  gateId: string;
  approvedBy: string;
  approvedAt: string;
  reason: string;
  dryRun?: boolean;
  expectedControlText?: string;
}): Promise<SubflowControl> {
  const record = requireRecord(input.index, input.instanceId);
  return mutateControl(record, (control) => {
    const gate = control.gates.find((item) => item.gate_id === input.gateId);
    const latest = gate?.attempts.at(-1);
    if (!gate || latest?.verdict !== "fail") throw new SubflowControlError("gate_override_unavailable", "Only the current failed Gate attempt can be overridden.", "conflict");
    if (!input.index.profile.override_policy.failed_gate_requires_decision) throw new SubflowControlError("gate_override_forbidden", "The project profile does not allow failed-Gate override.");
    if (gate.override && Date.parse(gate.override.approved_at) >= Date.parse(latest.confirmed_at)) {
      throw new SubflowControlError("gate_override_exists", `Gate already has a current override: ${input.gateId}`, "conflict");
    }
    gate.override = {
      decision_id: `override-${sha256(JSON.stringify({ gate: input.gateId, by: input.approvedBy, at: input.approvedAt, reason: input.reason })).slice(0, 20)}`,
      approved_by: requiredText(input.approvedBy, "Override approver"),
      approved_at: input.approvedAt,
      reason: requiredText(input.reason, "Override reason"),
    };
    return control;
  }, input);
}

export async function advanceSubflow(input: {
  index: CurrentWorkspaceIndex;
  instanceId: string;
  transition?: string;
  actor: string;
  transitionedAt: string;
  dryRun?: boolean;
  expectedControlText?: string;
}): Promise<{ control: SubflowControl; transition: string }> {
  const record = requireRecord(input.index, input.instanceId);
  const transition = resolveAdvanceTransition(input.index, record, input.transition);
  const control = await mutateControl(record, (current) => {
    const from = current.checkpoint;
    if (isLifecycleTransition(transition)) applyLifecycle(input.index, record, current, transition);
    else {
      const definition = eligibleProfileTransitions(input.index, record).find((item) => item.transition_id === transition);
      if (!definition) throw new SubflowControlError("transition_blocked", `Profile transition is not currently eligible: ${transition}`, "conflict");
      current.checkpoint = definition.to;
    }
    current.transitions.push({ transition_id: transition, from, to: current.status === "active" ? current.checkpoint : current.status, transitioned_at: input.transitionedAt, actor: requiredText(input.actor, "Transition actor") });
    return current;
  }, input);
  return { control, transition };
}

function resolveStartContext(index: CurrentWorkspaceIndex, routeRef: string, command: SubflowStartCommand): {
  profile: SubflowControl["profile"];
  parent: SubflowControl["parent"];
  round?: number;
  checkpoint: string;
} {
  if (command.parent) {
    const parent = requireRecord(index, command.parent.instance_id);
    const node = index.profile.children.find((item) => item.node_id === command.parent?.node_id && item.route_ref === routeRef);
    if (!node) throw new SubflowControlError("profile_child_invalid", "Parent node does not match the selected route.", "conflict");
    const available = childStartCandidates(index).some((item) => item.parent.control.instance_id === parent.control.instance_id && item.node.node_id === node.node_id && item.round === command.round);
    if (!available) throw new SubflowControlError("child_start_blocked", "The selected child is not in the current profile frontier.", "conflict");
    const requiredInputRoles = node.required_input_roles ?? [];
    const suppliedInputRoles = new Set(command.handoff_inputs.map((item) => item.role));
    if (!requiredInputRoles.every((role) => suppliedInputRoles.has(role))) {
      throw new SubflowControlError("start_handoff_inputs_missing", "Confirmed handoff inputs do not include all profile-required roles.", "conflict", { required_input_roles: requiredInputRoles });
    }
    const requiredGates = node.required_gate_ids.filter((gateId) => index.profile.gates.find((item) => item.gate_id === gateId)?.policy === "required");
    if (!requiredGates.every((gateId) => command.formal_gates.includes(gateId)) || command.formal_gates.some((gateId) => !node.required_gate_ids.includes(gateId))) {
      throw new SubflowControlError("start_gates_mismatch", "Confirmed Gates must include required profile Gates and only triggered conditional Gates.", "conflict");
    }
    return {
      profile: { id: index.profile.profile_id, version: index.profile.profile_version, path: "profiles/academic-pipeline.yaml" },
      parent: command.parent,
      ...(command.round === undefined ? {} : { round: command.round }),
      checkpoint: node.node_id,
    };
  }
  const entry = command.profile_entry
    ? index.profile.entries.find((item) => item.entry_id === command.profile_entry && item.route_ref === routeRef)
    : index.profile.entries.find((item) => item.route_ref === routeRef);
  if (entry) {
    if (command.formal_gates.length > 0) throw new SubflowControlError("start_gates_mismatch", "Pipeline parent confirmation cannot declare child Gates.", "conflict");
    return {
      profile: { id: index.profile.profile_id, version: index.profile.profile_version, path: "profiles/academic-pipeline.yaml" },
      parent: null,
      checkpoint: entry.checkpoint,
    };
  }
  if (command.profile_entry) throw new SubflowControlError("profile_entry_invalid", `Profile entry does not match route ${routeRef}.`, "usage");
  return { profile: null, parent: null, checkpoint: routeRef.split(":", 2)[1] ?? "started" };
}

function resolveAdvanceTransition(index: CurrentWorkspaceIndex, record: SubflowRecord, requested: string | undefined): string {
  if (requested) {
    if (isLifecycleTransition(requested)) return requested;
    if (!index.profile.transitions.some((item) => item.transition_id === requested)) throw new SubflowControlError("transition_invalid", `Unknown transition: ${requested}`, "usage");
    return requested;
  }
  const eligible = eligibleProfileTransitions(index, record);
  if (eligible.length === 1) return eligible[0]?.transition_id ?? "";
  if (eligible.length > 1) throw new SubflowControlError("transition_ambiguous", "Multiple profile transitions are eligible; pass --transition.", "conflict", { transitions: eligible.map((item) => item.transition_id) });
  if (record.control.status === "paused") return "resume";
  if (isSubflowCompletionReady(index, record)) return "complete";
  throw new SubflowControlError("transition_blocked", "No transition is currently eligible.", "conflict");
}

function applyLifecycle(index: CurrentWorkspaceIndex, record: SubflowRecord, control: SubflowControl, transition: LifecycleTransition): void {
  if (transition === "pause") {
    if (control.status !== "active") throw new SubflowControlError("lifecycle_invalid", "Only an active subflow can be paused.", "conflict");
    control.status = "paused";
  } else if (transition === "resume") {
    if (control.status !== "paused") throw new SubflowControlError("lifecycle_invalid", "Only a paused subflow can be resumed.", "conflict");
    control.status = "active";
  } else if (transition === "cancel") {
    if (control.status === "complete" || control.status === "cancelled") throw new SubflowControlError("lifecycle_invalid", "A terminal subflow cannot be cancelled.", "conflict");
    control.status = "cancelled";
  } else {
    if (!isSubflowCompletionReady(index, { ...record, control })) throw new SubflowControlError("completion_blocked", "Subflow completion requirements are not satisfied.", "conflict");
    control.status = "complete";
  }
}

async function mutateControl(
  record: SubflowRecord,
  mutate: (control: SubflowControl) => SubflowControl,
  options: { dryRun?: boolean; expectedControlText?: string },
): Promise<SubflowControl> {
  const currentText = await readRegularControl(record.controlPath);
  if (options.expectedControlText !== undefined && currentText !== options.expectedControlText) {
    throw new SubflowControlError("control_write_conflict", "Control changed after it was read.", "conflict");
  }
  const current = SubflowControlSchema.parse(parseYaml(currentText));
  const next = SubflowControlSchema.parse(mutate(structuredClone(current)));
  const nextText = stringify(next);
  if (nextText === currentText || options.dryRun) return next;
  const temporary = `${record.controlPath}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, nextText, { encoding: "utf8", flag: "wx" });
    if (await readFile(record.controlPath, "utf8") !== currentText) throw new SubflowControlError("control_write_conflict", "Control changed during mutation.", "conflict");
    await rename(temporary, record.controlPath);
  } catch (error) {
    await rm(temporary, { force: true }).catch(() => undefined);
    throw error;
  }
  return next;
}

async function createSubflowDirectory(directory: string, control: SubflowControl, handoff: SubflowHandoff): Promise<void> {
  const root = path.dirname(directory);
  const temporary = path.join(root, `.subflow-${randomUUID()}.tmp`);
  try {
    await mkdir(temporary, { recursive: false });
    await mkdir(path.join(temporary, "work"));
    await writeFile(path.join(temporary, "control.yaml"), stringify(control), { encoding: "utf8", flag: "wx" });
    await writeFile(path.join(temporary, "handoff.md"), renderSubflowHandoff(handoff), { encoding: "utf8", flag: "wx" });
    await rename(temporary, directory);
  } catch (error) {
    await rm(temporary, { recursive: true, force: true }).catch(() => undefined);
    if ((error as NodeJS.ErrnoException).code === "EEXIST" || (error as NodeJS.ErrnoException).code === "ENOTEMPTY") {
      throw new SubflowControlError("subflow_create_conflict", `Subflow directory already exists: ${directory}`, "conflict");
    }
    throw error;
  }
}

async function gateEvidence(index: CurrentWorkspaceIndex, record: SubflowRecord, role: string): Promise<{ role: string; path: string }> {
  const matches = [...record.handoff.inputs, ...record.handoff.outputs].filter((item) => item.role === role);
  if (matches.length !== 1) throw new SubflowControlError("gate_evidence_role_invalid", `Evidence role must resolve exactly once in the owning handoff: ${role}`, "usage");
  const match = matches[0];
  if (!match) throw new SubflowControlError("gate_evidence_role_invalid", `Unknown evidence role: ${role}`, "usage");
  await resolveCommandBoundaryPath(index.projectRoot, match.path, "consume-input");
  return { role, path: match.path };
}

function validateBranchChoice(index: CurrentWorkspaceIndex, record: SubflowRecord, decisionId: string, choice: string): void {
  const nodeId = record.control.parent?.node_id;
  const branch = index.profile.branches.find((item) => item.decision_id === decisionId && item.owner_node_id === nodeId);
  if (!branch) throw new SubflowControlError("branch_decision_invalid", `Branch does not belong to this subflow: ${decisionId}`, "usage");
  if (!branch.options.some((item) => item.option_id === choice)) throw new SubflowControlError("branch_choice_invalid", `Unknown branch choice: ${choice}`, "usage");
  if (!record.control.gates.every(isGateAccepted)) throw new SubflowControlError("branch_gate_blocked", "Branch choice requires accepted owning Gates.", "conflict");
}

function profileGateVerdicts(index: CurrentWorkspaceIndex, gateId: string): GateVerdict[] | undefined {
  return index.profile.gates.find((item) => item.gate_id === gateId)?.verdicts;
}

function parseStartCommand(value: unknown): SubflowStartCommand {
  const parsed = SubflowStartCommandSchema.safeParse(value);
  if (!parsed.success) throw new SubflowControlError("start_input_invalid", "Start input does not match schema 1.", "usage", parsed.error.issues);
  return parsed.data;
}

function requireRecord(index: CurrentWorkspaceIndex, instanceId: string): SubflowRecord {
  const records = findRecords(index, instanceId);
  if (records.length !== 1) throw new SubflowControlError(records.length === 0 ? "subflow_not_found" : "subflow_identity_ambiguous", `Subflow selector must resolve exactly once: ${instanceId}`, records.length === 0 ? "usage" : "conflict");
  return records[0];
}

function findRecords(index: CurrentWorkspaceIndex, instanceId: string): SubflowRecord[] {
  return index.subflows.filter((item) => item.control.instance_id === instanceId);
}

async function readRegularControl(controlPath: string): Promise<string> {
  const info = await lstat(controlPath);
  if (!info.isFile() || info.isSymbolicLink()) throw new SubflowControlError("control_file_invalid", `Control must be a regular file: ${controlPath}`, "conflict");
  return readFile(controlPath, "utf8");
}

function requiredText(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new SubflowControlError("command_text_missing", `${label} must not be empty.`, "usage");
  return trimmed;
}

function startDirectoryName(skillId: string, modeId: string, confirmedAt: string, identityHash: string): string {
  const timestamp = confirmedAt.replace(/[^0-9]/g, "").slice(0, 14);
  return `${skillId}-${modeId}-${timestamp}-${identityHash.slice(0, 8)}`;
}

function isLifecycleTransition(value: string): value is LifecycleTransition {
  return value === "pause" || value === "resume" || value === "cancel" || value === "complete";
}

async function resolveCommandBoundaryPath(projectRoot: string, requestedPath: string, use: "reference" | "consume-input" = "reference"): Promise<void> {
  try { await resolveBoundaryPath(projectRoot, requestedPath, use); }
  catch (error) {
    if (error instanceof BoundaryPathError) throw new SubflowControlError(error.code, error.message, "usage");
    throw error;
  }
}
