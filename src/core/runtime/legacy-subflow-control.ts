import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { ARSU_ROUTING_CATALOG, getArsuRoute } from "../../arsu-converter/routing/catalog.js";
import type { PrerequisiteGroup, PrerequisiteRequirement, RouteRef } from "../../arsu-converter/routing/contracts.js";
import type { RunState, SubflowInstanceState } from "../contracts/run-state.js";
import { parseRuntimeSelector } from "../contracts/runtime-selector.js";
import {
  StartActorSchema,
  SubflowStartInputSchema,
  SubflowStartReceiptSchema,
  SubflowStartSemanticInputSchema,
  type SubflowStartInput,
  type SubflowStartReceipt,
} from "../contracts/subflow.js";
import type { SubflowTemplateDefinition } from "../contracts/workflow.js";
import type { WorkspaceSnapshot } from "../workspace/snapshot.js";
import { loadWorkspaceSnapshot } from "../workspace/snapshot.js";
import { executeWritePlan, planFile, sha256, type WritePlan } from "../workspace/write-plan.js";
import { evaluateStartActionAvailability, evaluateWorkflowControl, inspectArtifacts, type WorkflowControlResult } from "./legacy-workflow-control.js";
import { buildMaterialPassportImportPlan, MaterialPassportImportError, prepareMaterialPassportImport, type MaterialPassportImportPlan, type PreparedMaterialPassportImport } from "./material-passport-import.js";
import { buildRuntimeContext } from "./runtime-context.js";

export class SubflowStartError extends Error {
  constructor(public readonly code: string, message: string, public readonly kind: "usage" | "domain" | "conflict", public readonly details?: unknown) { super(message); }
}

export interface SubflowInstructionPacket {
  selector: string;
  subject_kind: "template" | "instance" | "child";
  state: string;
  template_id: string;
  instance_id?: string;
  route: ReturnType<typeof getArsuRoute>;
  route_coverage: "complete" | "partial";
  parent_policy: SubflowTemplateDefinition["parent_policy"];
  prerequisites: Array<{ operator: "all_of" | "any_of"; requirements: Array<PrerequisiteRequirement & { available: boolean; artifact_ids?: string[] }>; satisfied_without_user_input: boolean; fallback_route_refs: string[] }>;
  required_user_input_ids: string[];
  work_items: Array<{ id: string; title: string; producer_skill: string; artifact_type: string; submission_policy: "automatic" | "manual" }>;
  parallel_groups: SubflowTemplateDefinition["parallel_groups"];
  subflow_nodes: NonNullable<SubflowTemplateDefinition["subflow_nodes"]>;
  subflow_parallel_groups: NonNullable<SubflowTemplateDefinition["subflow_parallel_groups"]>;
  gates: SubflowTemplateDefinition["gates"];
  transitions: SubflowTemplateDefinition["transitions"];
  warnings: Array<{ code: "profile_partial"; covered_artifact_types: string[]; route_artifact_types: string[] }>;
  instruction_basis_sha256: string;
  runtime_context: ReturnType<typeof buildRuntimeContext>;
  start?: {
    semantic_input_schema_version: "2";
    required_semantic_fields: string[];
    execution_policy: "direct" | "human_confirmed";
    dry_run: "optional";
    command: string;
  };
  runtime?: { parent_subflow_id: string | null; parent_node_id?: string | null; round_number: number | null; active_stage_id?: string; ready_items: string[]; blockers: unknown[] };
}

export type SubflowInstructionResult = { ok: true; packet: SubflowInstructionPacket } | { ok: false; code: "workflow_unconfigured" | "workflow_invalid" | "subflow_template_not_found" | "subflow_instance_not_found" | "subflow_blocked" | "run_terminal" };

export interface SubflowStartPlan {
  status: "would_start" | "already_started";
  selector: string;
  plan_sha256: string;
  instance: SubflowInstanceState;
  receipt: SubflowStartReceipt;
  material_passport_import?: { import_id: string; projection: unknown; artifact_ids: string[]; gate_evidence_ids: string[]; decision_evidence_ids: string[]; diagnostics: Array<{ code: string; message: string }> };
  writePlan: WritePlan;
}

export interface SubflowStartOutcome { status: "started" | "already_started"; plan: SubflowStartPlan; workflow_control_after: WorkflowControlResult }

export async function buildSubflowInstructions(snapshot: WorkspaceSnapshot, selector: string): Promise<SubflowInstructionResult> {
  if (!snapshot.workflow || !snapshot.runState) return { ok: false, code: "workflow_unconfigured" };
  const parsed = parseRuntimeSelector(selector);
  const control = await evaluateWorkflowControl(snapshot);
  if (!control.valid) return { ok: false, code: "workflow_invalid" };
  if (parsed?.kind === "subflow_template") {
    const template = snapshot.workflow.subflow_templates.find((item) => item.template_id === parsed.templateId);
    const status = control.subflows.find((item) => item.selector === selector && item.kind === "template");
    if (!template || !status) return { ok: false, code: "subflow_template_not_found" };
    const availability = evaluateStartActionAvailability(snapshot, control, selector);
    if (availability.disposition === "blocked") return { ok: false, code: availability.reason_code === "run_terminal" ? "run_terminal" : "subflow_blocked" };
    return { ok: true, packet: await templatePacket(snapshot, template, "available") };
  }
  if (parsed?.kind === "scoped_subflow_node") {
    const status = control.subflows.find((item) => item.selector === selector && item.kind === "child");
    const parent = snapshot.runState.subflows.find((item) => item.instance_id === parsed.instanceId);
    const template = status ? snapshot.workflow.subflow_templates.find((item) => item.template_id === status.template_id) : undefined;
    if (!status || !parent || !template) return { ok: false, code: "subflow_template_not_found" };
    const availability = evaluateStartActionAvailability(snapshot, control, selector);
    if (availability.disposition === "blocked") return { ok: false, code: availability.reason_code === "run_terminal" ? "run_terminal" : "subflow_blocked" };
    const packet = await templatePacket(snapshot, template, "available", selector, "child", parent.instance_id);
    return { ok: true, packet: { ...packet, runtime: { parent_subflow_id: parent.instance_id, parent_node_id: status.parent_node_id, round_number: status.round_number ?? null, ready_items: [], blockers: status.missing_dependencies } } };
  }
  if (parsed?.kind === "subflow_instance") {
    const instance = snapshot.runState.subflows.find((item) => item.instance_id === parsed.instanceId);
    if (!instance) return { ok: false, code: "subflow_instance_not_found" };
    const template = snapshot.workflow.subflow_templates.find((item) => item.template_id === instance.template_id);
    if (!template) return { ok: false, code: "workflow_invalid" };
    const packet = await templatePacket(snapshot, template, instance.status, selector, "template", instance.instance_id);
    return { ok: true, packet: { ...packet, selector, subject_kind: "instance", instance_id: instance.instance_id, runtime: { parent_subflow_id: instance.parent_subflow_id, parent_node_id: instance.parent_node_id ?? null, round_number: instance.round_number, active_stage_id: instance.active_stage_id, ready_items: control.frontier.filter((item) => item.includes(instance.instance_id)), blockers: control.work_items.filter((item) => item.instance_id === instance.instance_id && item.state === "blocked").map((item) => ({ selector: item.selector, missing_dependencies: item.missing_dependencies })) }, start: undefined } };
  }
  return { ok: false, code: "subflow_template_not_found" };
}

async function templatePacket(snapshot: WorkspaceSnapshot, template: SubflowTemplateDefinition, state: string, selector = `subflow:${template.template_id}`, subjectKind: "template" | "child" = "template", contextInstanceId?: string): Promise<SubflowInstructionPacket> {
  const parsedSelector = parseRuntimeSelector(selector);
  const inheritedRouteRef = parsedSelector?.kind === "scoped_subflow_node" ? snapshot.runState?.subflows.find((item) => item.instance_id === parsedSelector.instanceId)?.route_ref : null;
  const routeRef = template.route_ref ?? inheritedRouteRef;
  if (!routeRef) throw new Error(`Internal template ${template.template_id} has no parent route context.`);
  const route = getArsuRoute(routeRef as RouteRef);
  const inspections = await inspectArtifacts(snapshot);
  const prerequisites = template.route_ref ? route.prerequisite_groups.map((group) => prerequisiteView(snapshot, inspections, group)) : [];
  const requiredUserInputs = [...new Set(template.route_ref ? route.prerequisite_groups.flatMap((group) => group.requirements.filter((item) => item.kind === "user_input").map((item) => item.id)) : [])];
  const covered = template.work_items.map((item) => item.output.artifact_type);
  const runtimeContext = buildRuntimeContext(snapshot, contextInstanceId);
  const basis = {
    catalog_id: ARSU_ROUTING_CATALOG.catalog_id,
    catalog_sha256: sha256(`${JSON.stringify(ARSU_ROUTING_CATALOG)}\n`),
    workflow_sha256: snapshot.files.get("specs/workflow.yaml")?.hash,
    state_sha256: snapshot.files.get("runs/current/state.yaml")?.hash,
    template,
    route,
    prerequisites,
    runtime_context: runtimeContext,
  };
  const instructionBasis = sha256(`${JSON.stringify(basis)}\n`);
  return {
    selector, subject_kind: subjectKind, state, template_id: template.template_id, route, route_coverage: template.route_coverage, parent_policy: template.parent_policy,
    prerequisites, required_user_input_ids: requiredUserInputs,
    work_items: template.work_items.map((item) => ({ id: item.id, title: item.title, producer_skill: item.producer_skill, artifact_type: item.output.artifact_type, submission_policy: item.submission.policy })),
    parallel_groups: template.parallel_groups,
    subflow_nodes: template.subflow_nodes ?? [], subflow_parallel_groups: template.subflow_parallel_groups ?? [], gates: template.gates, transitions: template.transitions,
    warnings: template.route_coverage === "partial" ? [{ code: "profile_partial", covered_artifact_types: covered, route_artifact_types: route.primary_artifact_types }] : [],
    instruction_basis_sha256: instructionBasis,
    runtime_context: runtimeContext,
    start: {
      semantic_input_schema_version: "2",
      required_semantic_fields: [],
      execution_policy: subjectKind === "template" ? "human_confirmed" : "direct",
      dry_run: "optional",
      command: `researchspec start ${selector} --input <semantic-input.json> --actor-kind <kind> --actor-name <name>${subjectKind === "template" ? " --confirmed-by <human>" : ""} --json`,
    },
  };
}

function prerequisiteView(snapshot: WorkspaceSnapshot, inspections: Awaited<ReturnType<typeof inspectArtifacts>>, group: PrerequisiteGroup): SubflowInstructionPacket["prerequisites"][number] {
  const requirements = group.requirements.map((requirement) => {
    if (requirement.kind === "contract") return { ...requirement, available: snapshot.files.has(requirement.id) && !snapshot.diagnostics.some((item) => item.blocking && item.path === snapshot.files.get(requirement.id)?.absolutePath) };
    if (requirement.kind === "artifact") {
      const artifacts = inspections.filter((item) => item.artifact.artifact_type === requirement.id && item.exists && item.inside_project && item.hash_matches === true);
      return { ...requirement, available: artifacts.length > 0, artifact_ids: artifacts.map((item) => String(item.artifact.artifact_id)) };
    }
    return { ...requirement, available: false };
  });
  const deterministic = group.operator === "all_of" ? requirements.every((item) => item.available || item.kind === "user_input") : requirements.some((item) => item.available || item.kind === "user_input");
  return { operator: group.operator, requirements, satisfied_without_user_input: deterministic && requirements.every((item) => item.kind !== "user_input" || item.available), fallback_route_refs: group.fallback_route_refs };
}

export async function planSubflowStart(input: { snapshot: WorkspaceSnapshot; selector: string; payload: unknown; actor: unknown; confirmedBy?: string; expectedPlanSha256?: string; now?: string; sourceRoot?: string }): Promise<SubflowStartPlan> {
  const semanticResult = SubflowStartSemanticInputSchema.safeParse(input.payload);
  if (!semanticResult.success) throw new SubflowStartError("invalid_start_input", "Start semantic input is invalid.", "usage", semanticResult.error.issues);
  const actorResult = StartActorSchema.safeParse(input.actor);
  if (!actorResult.success) throw new SubflowStartError("invalid_start_input", "Start actor is invalid.", "usage", actorResult.error.issues);
  const snapshot = input.snapshot;
  if (!snapshot.workflow || !snapshot.runState) throw new SubflowStartError("workflow_unconfigured", "Workflow has no subflow templates.", "domain");
  if (snapshot.diagnostics.some((item) => item.blocking)) throw new SubflowStartError("workflow_invalid", "Workspace has blocking diagnostics.", "domain", snapshot.diagnostics.filter((item) => item.blocking));

  const preparedImport = semanticResult.data.material_passport_import ? await preparePassportImport(snapshot, semanticResult.data.material_passport_import, input.sourceRoot ?? path.dirname(snapshot.workspace)) : undefined;

  if (input.expectedPlanSha256) {
    const existing = snapshot.runState.subflows.find((item) => item.start_receipt.plan_sha256 === input.expectedPlanSha256);
    if (existing) return existingStartPlan(snapshot, existing, input.selector, input.expectedPlanSha256, preparedImport);
  }
  const parsed = parseRuntimeSelector(input.selector);
  if (parsed?.kind !== "subflow_template" && parsed?.kind !== "scoped_subflow_node") throw new SubflowStartError("invalid_subflow_selector", "Start requires an external template or parent-scoped child selector.", "usage");
  const control = await evaluateWorkflowControl(snapshot);
  const childStatus = parsed.kind === "scoped_subflow_node" ? control.subflows.find((item) => item.selector === input.selector && item.kind === "child") : undefined;
  if (parsed.kind === "scoped_subflow_node" && !childStatus) throw new SubflowStartError("subflow_blocked", "Child subflow is not in the current frontier.", "domain");
  const templateId = parsed.kind === "subflow_template" ? parsed.templateId : childStatus?.template_id;
  const template = snapshot.workflow.subflow_templates.find((item) => item.template_id === templateId);
  if (!template) throw new SubflowStartError("subflow_template_not_found", `Subflow template not found: ${input.selector}`, "domain");
  if (parsed.kind === "subflow_template" && template.visibility === "internal") throw new SubflowStartError("subflow_template_not_found", "Internal subflows can only start from a parent frontier.", "domain");
  if (preparedImport && (parsed.kind !== "subflow_template" || template.route_ref !== "academic-pipeline:mid-entry")) throw new SubflowStartError("invalid_start_input", "Material Passport import is allowed only for the external academic-pipeline mid-entry template.", "usage");
  const availability = evaluateStartActionAvailability(snapshot, control, input.selector);
  if (availability.disposition === "blocked") {
    const code = availability.reason_code === "run_terminal" ? "run_terminal" : "subflow_blocked";
    throw new SubflowStartError(code, code === "run_terminal" ? `Run status is terminal: ${snapshot.runState.status}` : "Subflow is not in the current frontier.", "domain", availability);
  }
  const instructions = await buildSubflowInstructions(snapshot, input.selector);
  if (!instructions.ok) throw new SubflowStartError(instructions.code, "Subflow cannot be started.", "domain");
  const payloadResult = SubflowStartInputSchema.safeParse({
    ...semanticResult.data,
    schema_version: "1",
    instruction_basis_sha256: instructions.packet.instruction_basis_sha256,
    acknowledged_user_input_ids: instructions.packet.required_user_input_ids,
    prerequisite_artifact_ids: [...new Set(instructions.packet.prerequisites.flatMap((group) =>
      group.requirements.flatMap((requirement) => requirement.kind === "artifact" ? requirement.artifact_ids ?? [] : [])))].sort(),
    prerequisite_decision_ids: snapshot.decisions
      .filter((item) => item.status === "accepted" && template.start_requires.decision_types.includes(String(item.decision_type)))
      .map((item) => String(item.decision_id))
      .sort(),
    parent_subflow_selector: parsed.kind === "scoped_subflow_node" ? `subflow:${parsed.instanceId}` : null,
  });
  if (!payloadResult.success) throw new SubflowStartError("invalid_start_input", "CLI-derived Start input is invalid.", "domain", payloadResult.error.issues);

  const parentId = parsed.kind === "scoped_subflow_node" ? parsed.instanceId : validateParent(snapshot.runState, template, payloadResult.data.parent_subflow_selector);
  const parentNodeId = parsed.kind === "scoped_subflow_node" ? parsed.nodeId : null;
  const parentInstance = parentId ? snapshot.runState.subflows.find((item) => item.instance_id === parentId) : undefined;
  const roundNumber = template.template_kind === "round"
    ? nextRound(snapshot.runState, template.template_id, parentId, parsed.kind === "scoped_subflow_node" ? undefined : null)
    : parsed.kind === "scoped_subflow_node"
      ? childStatus?.round_number ?? null
      : null;
  const parentReceipt = parsed.kind === "scoped_subflow_node" && parentInstance ? await trustedParentReceipt(snapshot, parentInstance) : undefined;
  if (parsed.kind === "scoped_subflow_node" && !parentReceipt) throw new SubflowStartError("subflow_start_conflict", "Parent start receipt is unavailable or untrusted.", "conflict");
  const confirmer = parentReceipt?.confirmed_by.name ?? input.confirmedBy?.trim();
  if (!confirmer) throw new SubflowStartError("invalid_start_input", "External start requires a human confirmer.", "usage");
  const selectedArtifacts = await validateStartPrerequisites(snapshot, template, payloadResult.data);
  validateDecisionPrerequisites(snapshot, template, payloadResult.data.prerequisite_decision_ids);
  const basis = startBasis(snapshot, selectedArtifacts, payloadResult.data.prerequisite_decision_ids);
  const authorization = parentReceipt && parentInstance && parentNodeId ? { kind: "parent_delegated" as const, parent_instance_id: parentInstance.instance_id, parent_node_id: parentNodeId, parent_start_receipt_path: parentInstance.start_receipt.path, parent_start_receipt_sha256: parentInstance.start_receipt.sha256, parent_plan_sha256: parentInstance.start_receipt.plan_sha256 } : { kind: "user_confirmed" as const };
  const planIdentity = { selector: input.selector, template_id: template.template_id, route_ref: template.route_ref, route_coverage: template.route_coverage, parent_subflow_id: parentId, parent_node_id: parentNodeId, round_number: roundNumber, actor: actorResult.data, confirmed_by: { kind: "human", name: confirmer }, authorization, payload: payloadResult.data, material_passport_import_identity: preparedImport?.identity ?? null, basis };
  const planSha256 = sha256(`${JSON.stringify(planIdentity)}\n`);
  if (input.expectedPlanSha256 && input.expectedPlanSha256 !== planSha256) throw new SubflowStartError("subflow_start_conflict", "Start plan differs from the confirmed preview.", "conflict", { expected: input.expectedPlanSha256, actual: planSha256 });
  await assertNoConflictingOrphanReceipt(snapshot, input.selector, planSha256);
  const instanceId = `sf-${template.template_id.slice(4)}-${planSha256.slice(0, 12)}`;
  if (snapshot.runState.subflows.some((item) => item.instance_id === instanceId)) throw new SubflowStartError("subflow_start_conflict", `Subflow instance ID collision: ${instanceId}`, "conflict");
  const receiptRelativePath = `runs/current/receipts/subflow-start/${instanceId}.json`;
  const receiptPath = path.join(snapshot.workspace, receiptRelativePath);
  let startedAt = input.now ?? new Date().toISOString();
  const importPlan = preparedImport ? await buildPassportImportPlan(snapshot, preparedImport, instanceId, startedAt) : undefined;
  let receipt = SubflowStartReceiptSchema.parse({ schema_version: "1", receipt_type: "subflow_start", plan_sha256: planSha256, instruction_basis_sha256: payloadResult.data.instruction_basis_sha256, selector: input.selector, instance_id: instanceId, template_id: template.template_id, route_ref: template.route_ref, route_coverage: template.route_coverage, parent_subflow_id: parentId, parent_node_id: parentNodeId, round_number: roundNumber, actor: actorResult.data, confirmed_by: { kind: "human", name: confirmer }, authorization, acknowledged_user_input_ids: payloadResult.data.acknowledged_user_input_ids, prerequisite_artifact_ids: payloadResult.data.prerequisite_artifact_ids, prerequisite_decision_ids: payloadResult.data.prerequisite_decision_ids, ...(importPlan ? { material_passport_import: importPlan.receiptSummary } : {}), basis, started_at: startedAt });
  try {
    const orphanBytes = await readFile(receiptPath);
    const orphan = SubflowStartReceiptSchema.parse(JSON.parse(Buffer.from(orphanBytes).toString("utf8")) as unknown);
    if (orphan.plan_sha256 !== planSha256 || orphan.selector !== input.selector || orphan.instance_id !== instanceId || orphan.template_id !== template.template_id || orphan.parent_subflow_id !== parentId || (orphan.parent_node_id ?? null) !== parentNodeId || orphan.round_number !== roundNumber) throw new Error("receipt identity mismatch");
    receipt = orphan;
    startedAt = orphan.started_at;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw new SubflowStartError("subflow_start_conflict", `Orphan start receipt conflicts: ${error instanceof Error ? error.message : String(error)}`, "conflict");
  }
  const receiptText = `${JSON.stringify(receipt, null, 2)}\n`;
  const receiptHash = sha256(receiptText);
  const instance: SubflowInstanceState = { instance_id: instanceId, template_id: template.template_id, route_ref: template.route_ref, parent_subflow_id: parentId, parent_node_id: parentNodeId, round_number: roundNumber, status: "active", active_stage_id: template.entry_stage_id, acknowledged_user_input_ids: payloadResult.data.acknowledged_user_input_ids, prerequisite_artifact_ids: payloadResult.data.prerequisite_artifact_ids, prerequisite_decision_ids: payloadResult.data.prerequisite_decision_ids, start_receipt: { path: receiptRelativePath, sha256: receiptHash, plan_sha256: planSha256 }, transition_receipts: [], started_at: startedAt };
  const nextState: RunState = { ...snapshot.runState, status: "in_progress", started_at: snapshot.runState.started_at ?? startedAt, updated_at: startedAt, subflows: [...snapshot.runState.subflows, instance], material_passport_imports: importPlan ? [...snapshot.runState.material_passport_imports, importPlan.stateEntry] : snapshot.runState.material_passport_imports, resume_candidate: importPlan?.resumeCandidate ?? snapshot.runState.resume_candidate };
  const statePath = snapshot.files.get("runs/current/state.yaml")?.absolutePath;
  if (!statePath) throw new SubflowStartError("workflow_invalid", "Run state file is unavailable.", "domain");
  const { stringify } = await import("yaml");
  const stateText = stringify(nextState);
  const receiptOperation = await planFile({ path: receiptPath, relativePath: receiptRelativePath, content: receiptText, scope: "workspace", ownership: "user" });
  if (receiptOperation.action === "conflict") throw new SubflowStartError("subflow_start_conflict", `Start receipt conflicts: ${receiptPath}`, "conflict");
  const stateOperation = { action: "refresh" as const, path: statePath, relativePath: "runs/current/state.yaml", content: stateText, scope: "workspace" as const, ownership: "user" as const, previousHash: snapshot.files.get("runs/current/state.yaml")?.hash, nextHash: sha256(stateText), reason: "commit subflow instance state last" };
  return { status: "would_start", selector: input.selector, plan_sha256: planSha256, instance, receipt, ...(importPlan ? { material_passport_import: { import_id: importPlan.importId, projection: importPlan.projection, artifact_ids: importPlan.artifacts.map((item) => item.artifact_id), gate_evidence_ids: importPlan.gateEvidence.map((item) => item.event_id), decision_evidence_ids: importPlan.decisionEvidence.map((item) => item.event_id), diagnostics: preparedImport?.diagnostics ?? [] } } : {}), writePlan: { operations: [...(importPlan?.operations ?? []), receiptOperation, stateOperation], readPreconditions: [...startPreconditions(snapshot, selectedArtifacts, parentInstance), ...(importPlan?.readPreconditions ?? [])] } };
}

export async function executeSubflowStart(plan: SubflowStartPlan, workspace: string): Promise<SubflowStartOutcome> {
  if (plan.status === "already_started") return { status: "already_started", plan, workflow_control_after: await evaluateWorkflowControl(await loadWorkspaceSnapshot(workspace)) };
  await executeWritePlan(plan.writePlan);
  return { status: "started", plan, workflow_control_after: await evaluateWorkflowControl(await loadWorkspaceSnapshot(workspace)) };
}

async function existingStartPlan(snapshot: WorkspaceSnapshot, instance: SubflowInstanceState, selector: string, planSha256: string, preparedImport?: PreparedMaterialPassportImport): Promise<SubflowStartPlan> {
  const receiptPath = path.resolve(snapshot.workspace, instance.start_receipt.path);
  try {
    const bytes = await readFile(receiptPath);
    const parsed = SubflowStartReceiptSchema.parse(JSON.parse(Buffer.from(bytes).toString("utf8")) as unknown);
    if (sha256(bytes) !== instance.start_receipt.sha256 || parsed.plan_sha256 !== planSha256 || parsed.instance_id !== instance.instance_id || parsed.selector !== selector || parsed.template_id !== instance.template_id || parsed.route_ref !== instance.route_ref || parsed.parent_subflow_id !== instance.parent_subflow_id || (parsed.parent_node_id ?? null) !== (instance.parent_node_id ?? null) || parsed.round_number !== instance.round_number) throw new Error("receipt mismatch");
    if ((preparedImport?.source.sha256 ?? null) !== (parsed.material_passport_import?.passport_sha256 ?? null) || (preparedImport?.request.boundary_hash ?? null) !== (parsed.material_passport_import?.boundary_hash ?? null)) throw new Error("Material Passport import source mismatch");
    return { status: "already_started", selector, plan_sha256: planSha256, instance, receipt: parsed, writePlan: { operations: [] } };
  } catch (error) { throw new SubflowStartError("subflow_start_conflict", `Existing start receipt is untrusted: ${error instanceof Error ? error.message : String(error)}`, "conflict"); }
}

async function preparePassportImport(snapshot: WorkspaceSnapshot, request: SubflowStartInput["material_passport_import"] & {}, sourceRoot: string): Promise<PreparedMaterialPassportImport> {
  try { return await prepareMaterialPassportImport(snapshot, request, sourceRoot); }
  catch (error) { if (error instanceof MaterialPassportImportError) throw new SubflowStartError(error.code, error.message, error.kind, error.details); throw error; }
}

async function buildPassportImportPlan(snapshot: WorkspaceSnapshot, prepared: PreparedMaterialPassportImport, instanceId: string, now: string): Promise<MaterialPassportImportPlan> {
  try { return await buildMaterialPassportImportPlan(snapshot, prepared, instanceId, now); }
  catch (error) { if (error instanceof MaterialPassportImportError) throw new SubflowStartError(error.code, error.message, error.kind, error.details); throw error; }
}

function validateParent(state: RunState, template: SubflowTemplateDefinition, selector: string | null): string | null {
  if (template.parent_policy === "required" && !selector) throw new SubflowStartError("subflow_parent_required", "This subflow requires a parent instance.", "domain");
  if (template.parent_policy === "none" && selector) throw new SubflowStartError("subflow_parent_invalid", "This subflow does not accept a parent.", "domain");
  if (!selector) return null;
  const parsed = parseRuntimeSelector(selector);
  if (parsed?.kind !== "subflow_instance" || !state.subflows.some((item) => item.instance_id === parsed.instanceId)) throw new SubflowStartError("subflow_parent_invalid", `Parent subflow does not exist: ${selector}`, "domain");
  return parsed.instanceId;
}

function nextRound(state: RunState, templateId: string, parentId: string | null, parentNodeId: string | null | undefined): number {
  return Math.max(0, ...state.subflows
    .filter((item) =>
      item.template_id === templateId
      && item.parent_subflow_id === parentId
      && (parentNodeId === undefined || (item.parent_node_id ?? null) === parentNodeId))
    .map((item) => item.round_number ?? 0)) + 1;
}

async function validateStartPrerequisites(snapshot: WorkspaceSnapshot, template: SubflowTemplateDefinition, payload: SubflowStartInput) {
  const inspections = await inspectArtifacts(snapshot);
  const selected = payload.prerequisite_artifact_ids.map((id) => inspections.find((item) => item.artifact.artifact_id === id));
  if (selected.some((item) => !item || !item.exists || !item.inside_project || item.hash_matches !== true)) throw new SubflowStartError("subflow_prerequisite_missing", "A prerequisite artifact is missing or untrusted.", "domain");
  if (!template.route_ref) return selected.filter((item): item is NonNullable<typeof item> => Boolean(item));
  const route = getArsuRoute(template.route_ref as RouteRef);
  const acknowledged = new Set(payload.acknowledged_user_input_ids);
  for (const group of route.prerequisite_groups) {
    const satisfied = group.requirements.map((requirement) => {
      if (requirement.kind === "user_input") return acknowledged.has(requirement.id);
      if (requirement.kind === "contract") return snapshot.files.has(requirement.id) && !snapshot.diagnostics.some((item) => item.blocking && item.path === snapshot.files.get(requirement.id)?.absolutePath);
      return selected.some((item) => item?.artifact.artifact_type === requirement.id);
    });
    if (group.operator === "all_of" ? !satisfied.every(Boolean) : !satisfied.some(Boolean)) throw new SubflowStartError("subflow_prerequisite_missing", "Route prerequisites are not satisfied.", "domain", { requirements: group.requirements, fallback_route_refs: group.fallback_route_refs });
  }
  return selected.filter((item): item is NonNullable<typeof item> => Boolean(item));
}

function validateDecisionPrerequisites(snapshot: WorkspaceSnapshot, template: SubflowTemplateDefinition, ids: string[]): void {
  const selected = ids.map((id) => snapshot.decisions.find((item) => item.decision_id === id && item.status === "accepted"));
  if (selected.some((item) => !item)) throw new SubflowStartError("subflow_prerequisite_missing", "A prerequisite decision is missing or not accepted.", "domain");
  for (const decisionType of template.start_requires.decision_types) if (!selected.some((item) => item?.decision_type === decisionType)) throw new SubflowStartError("subflow_prerequisite_missing", `Accepted decision type is missing: ${decisionType}`, "domain");
}

function startBasis(snapshot: WorkspaceSnapshot, artifacts: Awaited<ReturnType<typeof validateStartPrerequisites>>, decisionIds: string[]): SubflowStartReceipt["basis"] {
  const required = (relativePath: string) => { const file = snapshot.files.get(relativePath); if (!file) throw new SubflowStartError("workflow_invalid", `Start basis is missing: ${relativePath}`, "domain"); return file.hash; };
  const routeContracts = snapshot.workflow ? snapshot.workflow.subflow_templates.flatMap((template) => template.route_ref ? getArsuRoute(template.route_ref as RouteRef).prerequisite_groups.flatMap((group) => group.requirements.filter((item) => item.kind === "contract").map((item) => item.id)) : []) : [];
  return { workflow_sha256: required("specs/workflow.yaml"), state_sha256: required("runs/current/state.yaml"), registry_sha256: required("runs/current/artifact-registry.json"), gate_ledger_sha256: required("runs/current/gate-ledger.jsonl"), decision_ledger_sha256: required("runs/current/decision-ledger.jsonl"), catalog_sha256: sha256(`${JSON.stringify(ARSU_ROUTING_CATALOG)}\n`), contract_hashes: Object.fromEntries([...new Set(routeContracts)].filter((item) => snapshot.files.has(item)).map((item) => [item, required(item)])), artifact_hashes: Object.fromEntries(artifacts.map((item) => [String(item.artifact.artifact_id), String(item.artifact.sha256)])), decision_event_ids: snapshot.decisions.filter((item) => decisionIds.includes(String(item.decision_id))).map((item) => String(item.event_id)) };
}

function startPreconditions(snapshot: WorkspaceSnapshot, artifacts: Awaited<ReturnType<typeof validateStartPrerequisites>>, parent?: SubflowInstanceState) {
  const paths = ["specs/workflow.yaml", "runs/current/state.yaml", "runs/current/artifact-registry.json", "runs/current/gate-ledger.jsonl", "runs/current/decision-ledger.jsonl", ...Object.keys(startBasis(snapshot, artifacts, []).contract_hashes)];
  return [...new Set(paths)].map((item) => { const file = snapshot.files.get(item); if (!file) throw new SubflowStartError("workflow_invalid", `Start precondition is missing: ${item}`, "domain"); return { path: file.absolutePath, expectedHash: file.hash, reason: `subflow start basis ${item}` }; }).concat(artifacts.flatMap((item) => item.resolved_path && typeof item.artifact.sha256 === "string" ? [{ path: item.resolved_path, expectedHash: item.artifact.sha256, reason: `prerequisite artifact ${String(item.artifact.artifact_id)}` }] : []), parent ? [{ path: path.resolve(snapshot.workspace, parent.start_receipt.path), expectedHash: parent.start_receipt.sha256, reason: `delegated parent start ${parent.instance_id}` }] : []);
}

async function trustedParentReceipt(snapshot: WorkspaceSnapshot, parent: SubflowInstanceState): Promise<SubflowStartReceipt | undefined> {
  try {
    const bytes = await readFile(path.resolve(snapshot.workspace, parent.start_receipt.path));
    const receipt = SubflowStartReceiptSchema.parse(JSON.parse(Buffer.from(bytes).toString("utf8")) as unknown);
    if (sha256(bytes) !== parent.start_receipt.sha256 || receipt.plan_sha256 !== parent.start_receipt.plan_sha256 || receipt.instance_id !== parent.instance_id) return undefined;
    return receipt;
  } catch { return undefined; }
}

async function assertNoConflictingOrphanReceipt(snapshot: WorkspaceSnapshot, selector: string, planSha256: string): Promise<void> {
  const directory = path.join(snapshot.workspace, "runs/current/receipts/subflow-start");
  let entries: string[];
  try { entries = await readdir(directory); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return; throw error; }
  const stateInstanceIds = new Set(snapshot.runState?.subflows.map((item) => item.instance_id) ?? []);
  for (const entry of entries.filter((item) => item.endsWith(".json"))) {
    try {
      const receipt = SubflowStartReceiptSchema.parse(JSON.parse(await readFile(path.join(directory, entry), "utf8")) as unknown);
      if (receipt.selector === selector && !stateInstanceIds.has(receipt.instance_id) && receipt.plan_sha256 !== planSha256) throw new SubflowStartError("subflow_start_conflict", `A different orphan start receipt already owns ${selector}.`, "conflict", { orphan_plan_sha256: receipt.plan_sha256 });
    } catch (error) {
      if (error instanceof SubflowStartError) throw error;
    }
  }
}
