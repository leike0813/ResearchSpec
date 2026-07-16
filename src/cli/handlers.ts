import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { confirm, input, select } from "@inquirer/prompts";
import { stringify } from "yaml";

import { planToolDelivery, type InstallationRecord } from "../adapters/delivery.js";
import { detectTools, orderTools, parseToolExpression } from "../adapters/tools.js";
import { DEFAULT_WORKFLOW_PROFILE_ID, WorkItemSelectorSchema } from "../core/contracts/workflow.js";
import { Sha256Schema, SubmitActorKindSchema, SubmitActorSchema } from "../core/contracts/artifact.js";
import { RuntimeActorSchema } from "../core/contracts/gate-transition.js";
import { GateSelectorSchema, RuntimeSelectorSchema, SubflowSelectorSchema, TransitionSelectorSchema, parseRuntimeSelector } from "../core/contracts/runtime-selector.js";
import { StartActorSchema } from "../core/contracts/subflow.js";
import { ArtifactSubmitError, executeArtifactSubmit, planArtifactSubmit } from "../core/runtime/artifact-submit.js";
import { executeGateSubmit, executeTransitionAdvance, GateTransitionError, isSha256, planGateSubmit, planTransitionAdvance } from "../core/runtime/gate-transition-control.js";
import { archiveItem, decideItem, type DecisionChoice } from "../core/runtime/lifecycle.js";
import { assertProposalBasisCurrent, ContractChangeError, planContractChangeProposal } from "../core/runtime/contract-change.js";
import { renderHandoff } from "../core/runtime/handoff.js";
import { buildContextPack } from "../core/runtime/pack.js";
import { buildStatus, formatStatusHuman, listItems, showItem, type ListType } from "../core/runtime/query.js";
import { buildGateTransitionInstructions, buildWorkflowInstructions } from "../core/runtime/workflow-control.js";
import { buildSubflowInstructions, executeSubflowStart, planSubflowStart, SubflowStartError } from "../core/runtime/subflow-control.js";
import { runWorkspaceChecks, type CheckTarget } from "../core/validation/check.js";
import type { Diagnostic } from "../core/validation/types.js";
import { resolveWorkspace } from "../core/workspace/discover.js";
import { getWorkspaceEntries, getWorkspaceTemplates, resolveInitTarget } from "../core/workspace/layout.js";
import { loadWorkspaceSnapshot } from "../core/workspace/snapshot.js";
import { executeWritePlan, planFile, sha256, type PlannedWrite } from "../core/workspace/write-plan.js";
import { fileExists, readOptionalText } from "../utils/fs.js";
import { CliError, success, type CommandContext, type CommandResult } from "./types.js";
import { searchableMultiSelect } from "./prompts/searchable-multi-select.js";
import { availableDomains, domainIsAvailable, loadPluginRegistry, PluginRegistryError, resolveDomainSelection, type LoadedPluginRegistry } from "../plugins/registry.js";
import { buildPluginSkillInstructions, PluginSkillInstructionsError } from "../plugins/instructions.js";
import {
  buildResolutionSnapshots,
  pluginCatalogItem,
  pluginCatalogSummaryItem,
  pluginDomainSummaryItem,
  pluginStatusSummary,
  resolutionSnapshots,
  selectedPluginIds,
  unavailablePluginCatalogItem,
} from "../plugins/status.js";

export interface InitOptions { tools?: string }
export interface UpdateOptions { tools?: string }
export interface HandoffOptions { stdout?: boolean; out?: string }
export interface PackOptions { out?: string; includeArtifacts?: boolean }
export interface DecideOptions { decision?: DecisionChoice; actorName?: string; reason?: string }
export interface ProposeOptions { input: string; actorKind: "human" | "agent"; actorName: string }
export interface SubmitOptions { input: string; actorKind: string; actorName: string; confirmedBy?: string; expectedSha256?: string; expectedPlanSha256?: string }
export interface StartOptions { input: string; actorKind: string; actorName: string; confirmedBy?: string; expectedPlanSha256?: string }
export interface AdvanceOptions { actorKind: string; actorName: string; expectedPlanSha256?: string }
export interface PluginListOptions { installed?: boolean; summary?: boolean }
export interface PluginShowOptions { summary?: boolean }
export interface PluginInstallOptions { expectedPlanSha256?: string; summary?: boolean }

export async function handleInit(inputPath: string | undefined, options: InitOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = context.workspace ? path.resolve(context.cwd, context.workspace) : resolveInitTarget(inputPath, context.cwd);
  const projectRoot = path.dirname(workspace);
  const existing = await fileExists(workspace);
  const priorSnapshot = existing ? await loadWorkspaceSnapshot(workspace) : undefined;
  const profile = DEFAULT_WORKFLOW_PROFILE_ID;
  const configured = strings(record(priorSnapshot?.config.agent_tools).selected);
  const configuredPlugins = selectedPluginIds(record(priorSnapshot?.config));
  const pluginRegistry = await bundledPluginRegistry();
  assertPluginsAvailable(configuredPlugins, pluginRegistry);
  const detected = await detectTools(projectRoot);
  const explicitTools = options.tools !== undefined;
  let selected: string[];
  try {
    if (options.tools !== undefined) selected = parseToolExpression(options.tools);
    else if (context.interactive) {
      const ordered = orderTools(configured, detected);
      selected = await searchableMultiSelect({
        message: "Select agent tools",
        choices: ordered.map((tool) => ({ name: tool.name, value: tool.id, configured: configured.includes(tool.id), detected: detected.includes(tool.id), preSelected: configured.includes(tool.id) || (!existing && detected.includes(tool.id)) })),
      });
    } else if (configured.length) selected = configured;
    else if (detected.length) selected = detected;
    else throw new CliError("tools_required", "No agent tools were selected or detected.", 2, "Pass --tools all, --tools none, or a comma-separated tool list.");
  } catch (error) {
    if (error instanceof CliError) throw error;
    throw new CliError("invalid_tools", error instanceof Error ? error.message : String(error), 2);
  }
  if (!context.interactive && !explicitTools && selected.includes("codex")) throw new CliError("codex_global_write_requires_explicit_selection", "Non-interactive Codex delivery requires explicit --tools codex or --tools all.", 2);

  const operations: PlannedWrite[] = [];
  for (const template of getWorkspaceTemplates()) {
    if (template.relativePath === "config.yaml" || template.relativePath === "tool-installation-manifest.json") continue;
    const target = path.join(workspace, template.relativePath);
    if (await fileExists(target)) {
      operations.push({ action: "skip-unchanged", path: target, relativePath: template.relativePath, scope: "workspace", ownership: "user", reason: "existing research content is protected" });
    } else {
      operations.push(await planFile({ path: target, relativePath: template.relativePath, content: template.content, scope: "workspace", ownership: template.overwritePolicy, force: context.force }));
    }
  }

  const currentInstallations = installationRecords(priorSnapshot?.manifest.installations);
  const delivery = await planToolDelivery({ projectRoot, toolIds: selected, existingInstallations: currentInstallations, force: context.force, pluginRegistry, selectedPluginIds: configuredPlugins });
  operations.push(...delivery.operations);
  const reconciliation = await reconcileInstallations({
    projectRoot,
    existingInstallations: currentInstallations,
    desiredInstallations: delivery.installations,
    reconciledToolIds: [...new Set([...selected, ...currentInstallations.map((item) => item.tool_id)])],
    selectedToolIds: selected,
  });
  operations.push(...reconciliation.operations);
  const installations = deduplicateInstallations([...reconciliation.retainedInstallations, ...delivery.installations]);
  const configText = stringify({ schema_version: "0.1", profile, agent_tools: { selected, delivery: "both" }, plugins: { selected: configuredPlugins } });
  const configPath = path.join(workspace, "config.yaml");
  operations.push(await authoritativeWrite(configPath, "config.yaml", configText, "workspace", "update selected tool intent"));
  const manifestText = pluginManifestText(installations, pluginRegistry, configuredPlugins, priorSnapshot?.manifest);
  const manifestPath = path.join(workspace, "tool-installation-manifest.json");
  operations.push(await authoritativeWrite(manifestPath, "tool-installation-manifest.json", manifestText, "workspace", "commit generated ownership last"));

  const plan = { operations };
  if (!context.dryRun && context.interactive && !context.yes) {
    const approved = await confirm({ message: `${previewSummary(operations)}\nApply these ${String(writableCount(operations))} planned file operations?`, default: true });
    if (!approved) throw new CliError("cancelled", "Initialization cancelled.", 1);
  }
  if (!context.dryRun) {
    for (const entry of getWorkspaceEntries(workspace)) if (entry.kind === "dir") await mkdir(entry.path, { recursive: true });
    await executeWritePlan(plan);
  }
  const diagnostics = [...delivery.diagnostics, ...reconciliation.diagnostics, ...operationDiagnostics(operations)];
  const data = { workspace, profile, selected_tools: selected, selected_plugins: configuredPlugins, dry_run: context.dryRun, plan: summarizePlan(operations) };
  return deliveryResult("init", data, { stdout: formatPlan(context.dryRun ? "ResearchSpec init dry run" : existing ? "ResearchSpec workspace updated" : "ResearchSpec workspace initialized", workspace, operations, context.dryRun) }, diagnostics);
}

export async function handleUpdate(inputPath: string | undefined, options: UpdateOptions, context: CommandContext, providedPluginRegistry?: LoadedPluginRegistry): Promise<CommandResult> {
  const workspace = await requireWorkspace(context, inputPath);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  const projectRoot = path.dirname(workspace);
  const configured = strings(record(snapshot.config.agent_tools).selected);
  const configuredPlugins = selectedPluginIds(snapshot.config);
  const pluginRegistry = providedPluginRegistry ?? await bundledPluginRegistry();
  assertPluginsAvailable(configuredPlugins, pluginRegistry);
  let targetTools = configured;
  let selected = configured;
  if (options.tools !== undefined) {
    try { targetTools = parseToolExpression(options.tools); } catch (error) { throw new CliError("invalid_tools", error instanceof Error ? error.message : String(error), 2); }
    if (options.tools !== "none") selected = [...new Set([...configured, ...targetTools])];
  }
  if (!targetTools.length) return success("update", { workspace, selected_tools: selected, plan: [] }, { stdout: "ResearchSpec update: nothing to do.\n" });
  const existingInstallations = installationRecords(snapshot.manifest.installations);
  const delivery = await planToolDelivery({ projectRoot, toolIds: targetTools, existingInstallations, force: context.force, pluginRegistry, selectedPluginIds: configuredPlugins });
  const operations = [...delivery.operations];
  const reconciliation = await reconcileInstallations({
    projectRoot,
    existingInstallations,
    desiredInstallations: delivery.installations,
    reconciledToolIds: targetTools,
    selectedToolIds: selected,
  });
  operations.push(...reconciliation.operations);
  const diagnostics = [...delivery.diagnostics, ...reconciliation.diagnostics];
  const installations = deduplicateInstallations([...reconciliation.retainedInstallations, ...delivery.installations]);
  if (selected.join("\0") !== configured.join("\0")) {
    const configText = stringify({ ...snapshot.config, agent_tools: { ...record(snapshot.config.agent_tools), selected } });
    operations.push(await authoritativeWrite(path.join(workspace, "config.yaml"), "config.yaml", configText, "workspace", "add explicitly targeted tools"));
  }
  const manifestText = pluginManifestText(installations, pluginRegistry, configuredPlugins, snapshot.manifest);
  operations.push(await authoritativeWrite(path.join(workspace, "tool-installation-manifest.json"), "tool-installation-manifest.json", manifestText, "workspace", "commit generated ownership last"));
  if (!context.dryRun) await executeWritePlan({ operations });
  return deliveryResult("update", { workspace, selected_tools: selected, selected_plugins: configuredPlugins, dry_run: context.dryRun, plan: summarizePlan(operations) }, { stdout: formatPlan(context.dryRun ? "ResearchSpec update dry run" : "ResearchSpec tools updated", workspace, operations, context.dryRun) }, [...diagnostics, ...operationDiagnostics(operations)]);
}

export async function handleStatus(context: CommandContext): Promise<CommandResult> {
  const workspace = await requireWorkspace(context);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  const pluginRegistry = await bundledPluginRegistry();
  const data = await buildStatus(snapshot, pluginStatusSummary(snapshot.config, snapshot.manifest, pluginRegistry));
  const ok = snapshot.diagnostics.every((item) => !item.blocking);
  return { ...success("status", data, { stdout: formatStatusHuman(data) }, snapshot.diagnostics), ok, exitCode: ok ? 0 : 1 };
}

export async function handleInstructions(selector: string, context: CommandContext): Promise<CommandResult> {
  if (!RuntimeSelectorSchema.safeParse(selector).success) throw new CliError("invalid_runtime_selector", `Invalid runtime selector: ${selector}`, 2, "Use subflow:<id>, work:<id>, gate:<id>, or transition:<id>.");
  const workspace = await requireWorkspace(context);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  const parsed = parseRuntimeSelector(selector);
  if (parsed?.kind === "gate" || parsed?.kind === "transition") {
    const result = await buildGateTransitionInstructions(snapshot, selector);
    if (!result.ok) throw new CliError(result.code, `Runtime instructions are unavailable: ${selector}`, 1, undefined, { selector, item: result.item });
    return success("instructions", result.packet, { stdout: `${JSON.stringify(result.packet, null, 2)}\n` });
  }
  if (parsed?.kind === "subflow_template" || parsed?.kind === "subflow_instance" || parsed?.kind === "scoped_subflow_node") {
    const result = await buildSubflowInstructions(snapshot, selector);
    if (!result.ok) throw new CliError(result.code, `Subflow instructions are unavailable: ${selector}`, 1, undefined, { selector });
    return success("instructions", result.packet, { stdout: [`Subflow: ${selector}`, `Route: ${result.packet.route.route_ref}`, `State: ${result.packet.state}`, ""].join("\n") });
  }
  const result = await buildWorkflowInstructions(snapshot, selector);
  if (!result.ok) {
    const messages = {
      workflow_unconfigured: "The current workflow has no dynamic work-item graph.",
      workflow_invalid: "The current workflow graph is invalid.",
      work_item_not_found: `Work item not found: ${selector}`,
      work_item_blocked: `Work item is blocked: ${selector}`,
      work_item_already_done: `Work item is already complete: ${selector}`,
      workflow_resource_unavailable: `The work-item template could not be resolved: ${selector}`,
    } as const;
    throw new CliError(result.code, messages[result.code], 1, undefined, { selector, item: result.item, resolver: result.details });
  }
  const packet = result.packet;
  return success("instructions", packet, { stdout: [`Work item: ${packet.selector}`, `Producer skill: ${packet.producer_skill}`, `Output: ${packet.output.resolved_path}`, `Template: ${packet.output.template_ref}`, ""].join("\n") });
}

export async function handleStart(selector: string, options: StartOptions, context: CommandContext): Promise<CommandResult> {
  const selectorKind = parseRuntimeSelector(selector)?.kind;
  if (!SubflowSelectorSchema.safeParse(selector).success || (selectorKind !== "subflow_template" && selectorKind !== "scoped_subflow_node")) throw new CliError("invalid_subflow_selector", `Invalid start selector: ${selector}`, 2, "Use subflow:tpl-<safe-id> or a scoped child selector returned by status.");
  if (options.expectedPlanSha256 !== undefined && !Sha256Schema.safeParse(options.expectedPlanSha256).success) throw new CliError("invalid_expected_plan_sha256", "--expected-plan-sha256 must be 64 lowercase hexadecimal characters.", 2);
  const actorResult = StartActorSchema.safeParse({ kind: options.actorKind, name: options.actorName });
  if (!actorResult.success) throw new CliError("invalid_start_input", "Start actor is invalid.", 2, undefined, actorResult.error.issues);
  if (selectorKind === "subflow_template" && !options.confirmedBy?.trim()) throw new CliError("invalid_start_input", "External template start requires --confirmed-by.", 2);
  if (!context.dryRun && !context.interactive && (!context.yes || !options.expectedPlanSha256)) throw new CliError("confirmation_required", "Non-interactive Start requires --expected-plan-sha256 and --yes.", 2, "Preview the identical Start input with --dry-run --json after the user confirms the route.");
  const workspace = await requireWorkspace(context);
  const inputPath = path.resolve(context.cwd, options.input);
  let payload: unknown;
  try { payload = JSON.parse(await readFile(inputPath, "utf8")) as unknown; }
  catch (error) { throw new CliError("invalid_start_input", `Cannot read Start input: ${error instanceof Error ? error.message : String(error)}`, 2); }
  try {
    const plan = await planSubflowStart({ snapshot: await loadWorkspaceSnapshot(workspace), selector, payload, actor: actorResult.data, confirmedBy: options.confirmedBy, expectedPlanSha256: options.expectedPlanSha256, sourceRoot: context.cwd });
    if (!context.dryRun && plan.status !== "already_started" && !context.yes) {
      const importSummary = plan.material_passport_import ? ` Import ${String(plan.material_passport_import.artifact_ids.length)} ARS artifacts and ${String(plan.material_passport_import.gate_evidence_ids.length + plan.material_passport_import.decision_evidence_ids.length)} non-authoritative evidence records.` : "";
      const approved = await confirm({ message: `Start ${selector} as ${plan.instance.instance_id}?${importSummary} This authorizes declared automatic artifact registration but not current Gates, Decisions, or transitions.`, default: false });
      if (!approved) throw new CliError("cancelled", "Subflow start cancelled.", 1);
    }
    const outcome = context.dryRun ? undefined : await executeSubflowStart(plan, workspace);
    const status = context.dryRun ? plan.status : outcome?.status ?? plan.status;
    return success("start", { status, selector, plan_sha256: plan.plan_sha256, instance_selector: `subflow:${plan.instance.instance_id}`, instance: plan.instance, receipt: plan.receipt, material_passport_import: plan.material_passport_import ?? null, dry_run: context.dryRun, plan: summarizePlan(plan.writePlan.operations), workflow_control_after: outcome?.workflow_control_after ?? null, artifact_registry_updated: Boolean(plan.material_passport_import), imported_gate_evidence_appended: (plan.material_passport_import?.gate_evidence_ids.length ?? 0) > 0, imported_decision_evidence_appended: (plan.material_passport_import?.decision_evidence_ids.length ?? 0) > 0, state_updated: !context.dryRun && status === "started", semantic_work_executed: false }, { stdout: `${context.dryRun ? "Would start" : status === "already_started" ? "Already started" : "Started"} ${selector} as ${plan.instance.instance_id}.\n` });
  } catch (error) {
    if (error instanceof CliError) throw error;
    if (error instanceof SubflowStartError) throw new CliError(error.code, error.message, error.kind === "usage" ? 2 : error.kind === "conflict" ? 3 : 1, undefined, error.details);
    if ((error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT") throw new CliError("subflow_start_conflict", error instanceof Error ? error.message : String(error), 3);
    throw new CliError("internal_error", error instanceof Error ? error.message : String(error), 4);
  }
}

export async function handleSubmit(selector: string, options: SubmitOptions, context: CommandContext): Promise<CommandResult> {
  if (GateSelectorSchema.safeParse(selector).success && parseRuntimeSelector(selector)?.kind === "gate") return handleGateSubmit(selector, options, context);
  if (!WorkItemSelectorSchema.safeParse(selector).success) throw new CliError("invalid_work_item_selector", `Invalid work-item selector: ${selector}`, 2, "Use the canonical form work:<safe-id>.");
  if (options.expectedSha256 !== undefined && !Sha256Schema.safeParse(options.expectedSha256).success) throw new CliError("invalid_expected_sha256", "--expected-sha256 must be 64 lowercase hexadecimal characters.", 2);
  if (!SubmitActorKindSchema.safeParse(options.actorKind).success) throw new CliError("invalid_actor_kind", "--actor-kind must be human, agent, script, converter, or validator.", 2);
  const actorResult = SubmitActorSchema.safeParse({ kind: options.actorKind, name: options.actorName });
  if (!actorResult.success) throw new CliError("invalid_submission_input", "Submit actor is invalid.", 2, undefined, actorResult.error.issues);
  if (!context.dryRun && !context.interactive && (!context.yes || !options.expectedSha256)) {
    throw new CliError("confirmation_required", "Non-interactive Submit requires --expected-sha256 and --yes.", 2, "Run the identical payload with --dry-run --json first; --yes authorizes registration only.");
  }
  const workspace = await requireWorkspace(context);
  const inputPath = path.resolve(context.cwd, options.input);
  let payload: unknown;
  try { payload = JSON.parse(await readFile(inputPath, "utf8")) as unknown; }
  catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    throw new CliError("invalid_submission_input", nodeError.code === "ENOENT" ? `Submission input file not found: ${inputPath}` : `Cannot read submission input: ${error instanceof Error ? error.message : String(error)}`, 2);
  }
  try {
    const plan = await planArtifactSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector, payload, actor: actorResult.data, expectedSha256: options.expectedSha256 });
    if (!context.dryRun && plan.status !== "already_submitted" && plan.confirmation_basis !== "subflow_start" && !context.yes) {
      const approved = await confirm({ message: `Submit ${selector} at SHA-256 ${plan.candidate_sha256} and register its receipt? This does not update state, Gates, or Decisions.`, default: false });
      if (!approved) throw new CliError("cancelled", "Artifact submission cancelled.", 1);
    }
    const result = context.dryRun ? undefined : await executeArtifactSubmit(plan, workspace);
    const status = context.dryRun ? plan.status : result?.status ?? plan.status;
    return success("submit", {
      status,
      selector,
      candidate_sha256: plan.candidate_sha256,
      artifact: plan.artifact,
      receipt_artifact: plan.receipt_artifact,
      validation: plan.validation,
      projected_completion: plan.projected_completion,
      confirmation_basis: plan.confirmation_basis,
      dry_run: context.dryRun,
      plan: summarizePlan(plan.writePlan.operations),
      workflow_control_after: result?.workflow_control_after ?? null,
      state_updated: false,
      gate_appended: false,
      decision_appended: false,
    }, { stdout: `${context.dryRun ? "Would submit" : status === "already_submitted" ? "Already submitted" : "Submitted"} ${selector} at ${plan.candidate_sha256}.\n` });
  } catch (error) {
    if (error instanceof CliError) throw error;
    if (error instanceof ArtifactSubmitError) throw new CliError(error.code, error.message, error.kind === "usage" ? 2 : error.kind === "conflict" ? 3 : 1, undefined, error.details);
    if ((error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT") throw new CliError("submission_conflict", error instanceof Error ? error.message : String(error), 3);
    if (isFileSystemError(error)) throw error;
    throw new CliError("internal_error", error instanceof Error ? error.message : String(error), 4);
  }
}

async function handleGateSubmit(selector: string, options: SubmitOptions, context: CommandContext): Promise<CommandResult> {
  if (!isSha256(options.expectedPlanSha256)) throw new CliError("invalid_expected_plan_sha256", "--expected-plan-sha256 must be 64 lowercase hexadecimal characters.", 2);
  const actor = RuntimeActorSchema.safeParse({ kind: options.actorKind, name: options.actorName });
  if (!actor.success || actor.data.kind !== "validator" || !options.confirmedBy?.trim()) throw new CliError("invalid_gate_input", "Gate submit requires a validator actor and --confirmed-by human identity.", 2, undefined, actor.success ? undefined : actor.error.issues);
  if (!context.dryRun && !context.interactive && (!context.yes || !options.expectedPlanSha256)) throw new CliError("confirmation_required", "Non-interactive Gate submit requires --expected-plan-sha256 and --yes after explicit human confirmation.", 2);
  const workspace = await requireWorkspace(context);
  let payload: unknown;
  try { payload = JSON.parse(await readFile(path.resolve(context.cwd, options.input), "utf8")) as unknown; }
  catch (error) { throw new CliError("invalid_gate_input", `Cannot read Gate input: ${error instanceof Error ? error.message : String(error)}`, 2); }
  try {
    const plan = await planGateSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector, payload, actor: actor.data, confirmedBy: options.confirmedBy, expectedPlanSha256: options.expectedPlanSha256 });
    if (!context.dryRun && plan.status !== "already_submitted" && !context.yes) {
      const approved = await confirm({ message: `Record the user-confirmed Gate verdict for ${selector}?`, default: false });
      if (!approved) throw new CliError("cancelled", "Gate submission cancelled.", 1);
    }
    const outcome = context.dryRun ? undefined : await executeGateSubmit(plan, workspace);
    const status = context.dryRun ? plan.status : outcome?.status ?? plan.status;
    return success("submit", { status, selector, plan_sha256: plan.plan_sha256, event: plan.event, receipt: plan.receipt, dry_run: context.dryRun, plan: summarizePlan(plan.writePlan.operations), workflow_control_after: outcome?.workflow_control_after ?? null, state_updated: false, artifact_registry_updated: false, decision_appended: false }, { stdout: `${context.dryRun ? "Would submit" : status === "already_submitted" ? "Already submitted" : "Submitted"} ${selector}.\n` });
  } catch (error) { throw gateTransitionCliError(error); }
}

export async function handleAdvance(selector: string, options: AdvanceOptions, context: CommandContext): Promise<CommandResult> {
  if (!TransitionSelectorSchema.safeParse(selector).success) throw new CliError("invalid_transition_selector", `Invalid transition selector: ${selector}`, 2, "Use transition:<instance>/<node>.");
  if (!isSha256(options.expectedPlanSha256)) throw new CliError("invalid_expected_plan_sha256", "--expected-plan-sha256 must be 64 lowercase hexadecimal characters.", 2);
  const actor = RuntimeActorSchema.safeParse({ kind: options.actorKind, name: options.actorName });
  if (!actor.success || !["agent", "script"].includes(actor.data.kind)) throw new CliError("invalid_advance_input", "Advance actor must be an agent or script.", 2, undefined, actor.success ? undefined : actor.error.issues);
  if (!context.dryRun && !context.interactive && (!context.yes || !options.expectedPlanSha256)) throw new CliError("confirmation_required", "Non-interactive Advance requires --expected-plan-sha256 and --yes.", 2);
  const workspace = await requireWorkspace(context);
  try {
    const plan = await planTransitionAdvance({ snapshot: await loadWorkspaceSnapshot(workspace), selector, actor: actor.data, expectedPlanSha256: options.expectedPlanSha256 });
    if (!context.dryRun && plan.status !== "already_advanced" && !context.yes) {
      const approved = await confirm({ message: `Advance the unique authorized transition ${selector}?`, default: false });
      if (!approved) throw new CliError("cancelled", "Transition advance cancelled.", 1);
    }
    const outcome = context.dryRun ? undefined : await executeTransitionAdvance(plan, workspace);
    const status = context.dryRun ? plan.status : outcome?.status ?? plan.status;
    return success("advance", { status, selector, plan_sha256: plan.plan_sha256, from: plan.from, to: plan.to, receipt: plan.receipt, dry_run: context.dryRun, plan: summarizePlan(plan.writePlan.operations), workflow_control_after: outcome?.workflow_control_after ?? null, artifact_registry_updated: false, gate_appended: false, decision_appended: false }, { stdout: `${context.dryRun ? "Would advance" : status === "already_advanced" ? "Already advanced" : "Advanced"} ${selector}.\n` });
  } catch (error) { throw gateTransitionCliError(error); }
}

function gateTransitionCliError(error: unknown): CliError {
  if (error instanceof CliError) return error;
  if (error instanceof GateTransitionError) return new CliError(error.code, error.message, error.kind === "usage" ? 2 : error.kind === "conflict" ? 3 : 1, undefined, error.details);
  if ((error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT") return new CliError("runtime_write_conflict", error instanceof Error ? error.message : String(error), 3);
  if (isFileSystemError(error)) throw error;
  return new CliError("internal_error", error instanceof Error ? error.message : String(error), 4);
}

export async function handleCheck(target: string | undefined, strict: boolean, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireWorkspace(context);
  const validTargets = ["all", "contracts", "runtime", "artifacts", "tools", "plugins"];
  const resolvedTarget = target ?? "all";
  if (!validTargets.includes(resolvedTarget)) throw new CliError("invalid_check_target", `Unknown check target: ${resolvedTarget}`, 2);
  const data = await runWorkspaceChecks(workspace, resolvedTarget as CheckTarget, strict);
  const human = data.ok
    ? { stdout: `ResearchSpec check passed: ${workspace}\n` }
    : { stderr: `ResearchSpec check failed: ${workspace}\n${data.diagnostics.map((item) => `- [${item.code}] ${item.path ?? ""} ${item.message}`).join("\n")}\n` };
  return { command: "check", ok: data.ok, exitCode: data.ok ? 0 : 1, data, diagnostics: data.diagnostics, human };
}

export async function handlePluginList(options: PluginListOptions, context: CommandContext, providedRegistry?: LoadedPluginRegistry): Promise<CommandResult> {
  const pluginRegistry = providedRegistry ?? await bundledPluginRegistry();
  const workspace = await optionalWorkspace(context);
  const snapshot = workspace ? await loadWorkspaceSnapshot(workspace) : undefined;
  const selected = snapshot ? selectedPluginIds(snapshot.config) : [];
  const projected = new Set(snapshot ? pluginStatusSummary(snapshot.config, snapshot.manifest, pluginRegistry).projected : []);
  const domains = options.installed
    ? selected.map((domainId) => {
      const domain = pluginRegistry.domains.get(domainId);
      if (domainIsAvailable(domain)) {
        return options.summary
          ? pluginCatalogSummaryItem(domain, pluginRegistry, selected, projected.has(domainId))
          : pluginCatalogItem(domain, pluginRegistry, selected, projected.has(domainId));
      }
      const unavailable = unavailablePluginCatalogItem(domainId, domain);
      return options.summary
        ? { ...unavailable, direct_skill_count: 0, resolved_skill_count: 0, direct_skills: undefined, resolved_skills: undefined }
        : unavailable;
    })
    : availableDomains(pluginRegistry).map((domain) => options.summary
      ? pluginCatalogSummaryItem(domain, pluginRegistry, selected, projected.has(domain.domain_id))
      : pluginCatalogItem(domain, pluginRegistry, selected, projected.has(domain.domain_id)));
  return success("plugin", { action: "list", workspace: workspace ?? null, domains }, {
    stdout: domains.length ? `${domains.map((domain) => `${domain.domain_id}\t${domain.version ?? "unknown"}${domain.installed ? "\tinstalled" : ""}${domain.available ? "" : "\tunavailable"}`).join("\n")}\n` : "No domain Skill plugins.\n",
  });
}

export async function handlePluginShow(pluginId: string, options: PluginShowOptions, context: CommandContext, providedRegistry?: LoadedPluginRegistry): Promise<CommandResult> {
  const pluginRegistry = providedRegistry ?? await bundledPluginRegistry();
  const domain = pluginRegistry.domains.get(pluginId);
  if (!domainIsAvailable(domain)) throw new CliError("plugin_not_found", `Domain plugin not found or unavailable: ${pluginId}`, 1);
  const workspace = await optionalWorkspace(context);
  const snapshot = workspace ? await loadWorkspaceSnapshot(workspace) : undefined;
  const selected = snapshot ? selectedPluginIds(snapshot.config) : [];
  const projected = snapshot ? pluginStatusSummary(snapshot.config, snapshot.manifest, pluginRegistry).projected.includes(domain.domain_id) : false;
  const item = options.summary
    ? pluginDomainSummaryItem(domain, pluginRegistry, selected, projected)
    : pluginCatalogItem(domain, pluginRegistry, selected, projected);
  return success("plugin", { action: "show", workspace: workspace ?? null, domain: item }, { stdout: `${JSON.stringify(item, null, 2)}\n` });
}

export async function handlePluginInstall(pluginIds: readonly string[], options: PluginInstallOptions, context: CommandContext, providedRegistry?: LoadedPluginRegistry): Promise<CommandResult> {
  const requested = normalizePluginIds(pluginIds);
  if (!requested.length) throw new CliError("plugin_ids_required", "At least one plugin ID is required.", 2);
  if (options.expectedPlanSha256 !== undefined && !Sha256Schema.safeParse(options.expectedPlanSha256).success) {
    throw new CliError("invalid_expected_plan_sha256", "--expected-plan-sha256 must be 64 lowercase hexadecimal characters.", 2);
  }
  const pluginRegistry = providedRegistry ?? await bundledPluginRegistry();
  assertPluginsAvailable(requested, pluginRegistry);
  const workspace = await requireWorkspace(context);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  const selected = uniqueSorted([...selectedPluginIds(snapshot.config), ...requested]);
  return reconcilePluginSelection("install", workspace, snapshot, selected, context, pluginRegistry, options);
}

export async function handlePluginInstructions(skillId: string, context: CommandContext, providedRegistry?: LoadedPluginRegistry): Promise<CommandResult> {
  const pluginRegistry = providedRegistry ?? await bundledPluginRegistry();
  const workspace = await requireWorkspace(context);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  try {
    const packet = await buildPluginSkillInstructions(snapshot, pluginRegistry, skillId);
    return success("plugin", { action: "instructions", workspace, ...packet }, { stdout: `${JSON.stringify(packet, null, 2)}\n` });
  } catch (error) {
    if (error instanceof PluginSkillInstructionsError) throw new CliError(error.code, error.message, 1, undefined, error.details);
    throw error;
  }
}

export async function handlePluginUpdate(pluginIds: readonly string[], context: CommandContext, providedRegistry?: LoadedPluginRegistry): Promise<CommandResult> {
  const pluginRegistry = providedRegistry ?? await bundledPluginRegistry();
  const workspace = await requireWorkspace(context);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  const selected = selectedPluginIds(snapshot.config);
  const requested = pluginIds.length ? normalizePluginIds(pluginIds) : selected;
  const notInstalled = requested.filter((id) => !selected.includes(id));
  if (notInstalled.length) throw new CliError("plugin_not_installed", `Plugin is not installed: ${notInstalled.join(", ")}`, 1);
  assertPluginsAvailable(requested, pluginRegistry);
  if (!requested.length) return success("plugin", { action: "update", workspace, selected_plugins: selected, dry_run: context.dryRun, plan: [] }, { stdout: "No installed domain Skill plugins to update.\n" });
  return reconcilePluginSelection("update", workspace, snapshot, selected, context, pluginRegistry);
}

export async function handlePluginUninstall(pluginIds: readonly string[], context: CommandContext, providedRegistry?: LoadedPluginRegistry): Promise<CommandResult> {
  const requested = normalizePluginIds(pluginIds);
  if (!requested.length) throw new CliError("plugin_ids_required", "At least one plugin ID is required.", 2);
  const workspace = await requireWorkspace(context);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  const selectedBefore = selectedPluginIds(snapshot.config);
  const notInstalled = requested.filter((id) => !selectedBefore.includes(id));
  if (notInstalled.length) throw new CliError("plugin_not_installed", `Plugin is not installed: ${notInstalled.join(", ")}`, 1);
  const requestedSet = new Set(requested);
  const pluginRegistry = providedRegistry ?? await bundledPluginRegistry();
  const existingInstallations = installationRecords(snapshot.manifest.installations);
  const selected = selectedBefore.filter((id) => !requestedSet.has(id));
  const desiredSkillIds = resolvedSkillIdsForSelection(pluginRegistry, selected, snapshot.manifest);
  const owned = existingInstallations.filter((item) => item.skill_id && !desiredSkillIds.has(item.skill_id));
  const drift: Array<{ path: string; vendor_id?: string; skill_id?: string }> = [];
  const operations: PlannedWrite[] = [];
  for (const installation of owned) {
    const target = installation.scope === "shared-global" ? installation.path : path.resolve(path.dirname(workspace), installation.path);
    const bytes = await readBytes(target);
    if (bytes === undefined) continue;
    if (sha256(bytes) !== installation.sha256) {
      drift.push({ path: target, vendor_id: installation.vendor_id, skill_id: installation.skill_id });
      continue;
    }
    operations.push({ action: "remove-owned", path: target, relativePath: installation.path, scope: installation.scope, ownership: "generated", previousHash: installation.sha256, reason: `remove domain Skill ${installation.skill_id ?? "unknown"}` });
  }
  if (drift.length) throw new CliError("plugin_uninstall_drift", "Plugin uninstall is blocked because manifest-owned files were modified.", 1, "Restore the recorded plugin files or preserve them and keep the plugin selected.", { drift });

  const configText = stringify({ ...snapshot.config, plugins: { ...record(snapshot.config.plugins), selected } });
  operations.push(await authoritativeWrite(path.join(workspace, "config.yaml"), "config.yaml", configText, "workspace", "update selected plugin intent"));
  const removalKeys = new Set(owned.map(installationKey));
  const retained = existingInstallations.filter((item) => !removalKeys.has(installationKey(item)));
  const manifestText = pluginManifestText(retained, pluginRegistry, selected, snapshot.manifest);
  operations.push(await authoritativeWrite(path.join(workspace, "tool-installation-manifest.json"), "tool-installation-manifest.json", manifestText, "workspace", "commit generated ownership last"));
  if (!context.dryRun && context.interactive && !context.yes) {
    const approved = await confirm({ message: `Uninstall ${requested.join(", ")} and remove ${String(operations.filter((item) => item.action === "remove-owned").length)} clean owned files?`, default: false });
    if (!approved) throw new CliError("cancelled", "Plugin uninstall cancelled.", 1);
  }
  if (!context.dryRun) await executeWritePlan({ operations });
  return success("plugin", { action: "uninstall", workspace, domain_ids: requested, selected_domains: selected, resolved_skills: [...desiredSkillIds].sort(), dry_run: context.dryRun, plan: summarizePlan(operations) }, { stdout: formatPlan(context.dryRun ? "ResearchSpec plugin uninstall dry run" : "ResearchSpec domain plugins uninstalled", workspace, operations, context.dryRun) });
}

export async function handleList(type: string | undefined, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireWorkspace(context);
  const allowed = ["changes", "artifacts", "gates", "decisions", "tools"];
  const listType = type ?? "changes";
  if (!allowed.includes(listType)) throw new CliError("invalid_list_type", `Unknown list type: ${listType}`, 2);
  const items = listItems(await loadWorkspaceSnapshot(workspace), listType as ListType);
  return success("list", { type: listType, items }, { stdout: items.length ? `${items.map((item) => `${item.selector}\t${item.path ?? ""}`).join("\n")}\n` : `No ${listType}.\n` });
}

export async function handleShow(selector: string, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireWorkspace(context);
  const result = showItem(await loadWorkspaceSnapshot(workspace), selector);
  if (!result.item) {
    if (result.candidates.length) throw new CliError("item_ambiguous", `Item selector is ambiguous: ${selector}`, 2, undefined, { candidates: result.candidates.map((item) => item.selector) });
    throw new CliError("item_not_found", `Item not found: ${selector}`, 1);
  }
  return success("show", result.item, { stdout: `${JSON.stringify(result.item.value, null, 2)}\n` });
}

export async function handleHandoff(options: HandoffOptions, context: CommandContext): Promise<CommandResult> {
  if (options.stdout && options.out) throw new CliError("conflicting_options", "--stdout and --out cannot be used together.", 2);
  const workspace = await requireWorkspace(context);
  const content = await renderHandoff(await loadWorkspaceSnapshot(workspace));
  if (options.stdout) return success("handoff", { workspace, written: false, content }, { stdout: content });
  const target = options.out ? path.resolve(context.cwd, options.out) : path.join(workspace, "runs/current/handoff.md");
  const operation = await authoritativeWrite(target, path.relative(workspace, target), content, "workspace", "render handoff view");
  if (!context.dryRun) await executeWritePlan({ operations: [operation] });
  return success("handoff", { workspace, path: target, sha256: sha256(content), dry_run: context.dryRun, plan: summarizePlan([operation]) }, { stdout: `${context.dryRun ? "Would write" : "Wrote"} handoff: ${target}\n` });
}

export async function handlePack(options: PackOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireWorkspace(context);
  const bundle = await buildContextPack(await loadWorkspaceSnapshot(workspace), Boolean(options.includeArtifacts));
  const projectRoot = path.dirname(workspace);
  const target = options.out ? path.resolve(context.cwd, options.out) : path.join(projectRoot, `${path.basename(projectRoot)}-researchspec-context.zip`);
  if ((await fileExists(target)) && !context.force) throw new CliError("output_exists", `Pack output already exists: ${target}`, 3, "Use --force to replace this derived bundle.");
  const existing = await readBytes(target);
  const operation: PlannedWrite = { action: existing === undefined ? "create" : "refresh", path: target, content: bundle.bytes, scope: "project", ownership: "generated", ...(existing ? { previousHash: sha256(existing) } : {}), nextHash: bundle.sha256, reason: "write deterministic context bundle" };
  if (!context.dryRun) await executeWritePlan({ operations: [operation] });
  return success("pack", { path: target, bytes: bundle.bytes.length, sha256: bundle.sha256, entries: bundle.entries, dry_run: context.dryRun, plan: summarizePlan([operation]) }, { stdout: `${context.dryRun ? "Would write" : "Wrote"} context pack: ${target}\n` });
}

export async function handlePropose(changeId: string, options: ProposeOptions, context: CommandContext): Promise<CommandResult> {
  if (context.force) throw new CliError("force_not_supported", "--force does not apply to create-only proposals.", 2);
  const workspace = await requireWorkspace(context);
  let payload: unknown;
  const inputPath = path.resolve(context.cwd, options.input);
  try { payload = JSON.parse(await readFile(inputPath, "utf8")) as unknown; }
  catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    throw new CliError("invalid_proposal_input", nodeError.code === "ENOENT" ? `Proposal input file not found: ${inputPath}` : `Cannot read proposal input: ${error instanceof Error ? error.message : String(error)}`, 2);
  }
  try {
    const snapshot = await loadWorkspaceSnapshot(workspace);
    const proposal = await planContractChangeProposal({ snapshot, changeId, payload, actorKind: options.actorKind, actorName: options.actorName });
    if (!context.dryRun && !context.yes) {
      if (!context.interactive) throw new CliError("confirmation_required", "Non-interactive proposal creation requires --yes.", 2, "This confirms creation of a pending proposal only; it does not accept the change.");
      const approved = await confirm({ message: `Create pending ${proposal.patch.risk_level}-risk change ${changeId} with ${String(proposal.patch.patches.length)} patch(es)?`, default: false });
      if (!approved) throw new CliError("cancelled", "Proposal creation cancelled.", 1);
    }
    if (!context.dryRun) {
      await assertProposalBasisCurrent(workspace, proposal.patch);
      await executeWritePlan({ operations: proposal.operations });
    }
    return success("propose", {
      workspace,
      selector: `change:${changeId}`,
      status: proposal.patch.status,
      risk_level: proposal.patch.risk_level,
      requires_human_decision: true,
      dry_run: context.dryRun,
      plan: summarizePlan(proposal.operations),
    }, { stdout: `${context.dryRun ? "Would create" : "Created"} pending contract change change:${changeId}.\n` });
  } catch (error) {
    if (error instanceof CliError) throw error;
    if (error instanceof ContractChangeError) {
      const exitCode = error.kind === "usage" ? 2 : error.kind === "conflict" ? 3 : 1;
      throw new CliError(error.code, error.message, exitCode, undefined, error.details);
    }
    if (isFileSystemError(error)) throw error;
    throw new CliError("proposal_blocked", error instanceof Error ? error.message : String(error), 1);
  }
}

export async function handleDecide(selector: string | undefined, options: DecideOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireWorkspace(context);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  if (!selector) {
    const items = [...snapshot.changes, ...snapshot.patches].filter((item) => !["applied", "rejected", "superseded"].includes(String(record(item.value).status)));
    return success("decide", { pending_items: items }, { stdout: items.length ? `${items.map((item) => item.selector).join("\n")}\n` : "No pending items.\n" });
  }
  let decision = options.decision;
  const selectedItem = snapshot.items.find((item) => item.selector === selector);
  const rawRisk = selectedItem ? record(selectedItem.value).risk_level : undefined;
  const risk = typeof rawRisk === "string" ? rawRisk : "unspecified";
  if (!decision && context.interactive) decision = await select({ message: `Decision for ${selector} (${selectedItem?.type ?? "item"}, risk: ${risk})`, choices: [{ name: "Accept", value: "accept" as const }, { name: "Reject", value: "reject" as const }, { name: "Postpone", value: "postpone" as const }] });
  if (!decision) throw new CliError("decision_required", "A decision is required outside a TTY.", 2, "Pass --decision accept, reject, or postpone.");
  const actorName = options.actorName ?? (context.interactive ? await input({ message: "Human actor name", validate: (value) => Boolean(value.trim()) || "Actor name is required." }) : undefined);
  if (!actorName) throw new CliError("actor_required", "--actor-name is required for a human decision.", 2);
  const reason = options.reason ?? (context.interactive && decision !== "postpone" ? await input({ message: "Decision rationale", validate: (value) => Boolean(value.trim()) || "Rationale is required." }) : undefined);
  try {
    const outcome = await decideItem({ snapshot, selector, decision, actorName, reason, dryRun: context.dryRun });
    return success("decide", { ...outcome, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would record" : "Recorded"} ${outcome.status} decision for ${outcome.item}.\n` });
  } catch (error) {
    if (error instanceof ContractChangeError) throw new CliError(error.code, error.message, 1, undefined, error.details);
    if (isFileSystemError(error)) throw error;
    throw new CliError("decision_blocked", error instanceof Error ? error.message : String(error), 1);
  }
}

export async function handleArchive(selector: string | undefined, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireWorkspace(context);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  if (!selector) {
    const items = [...snapshot.changes, ...snapshot.patches].filter((item) => ["applied", "rejected", "superseded"].includes(String(record(item.value).status)));
    return success("archive", { archivable_items: items }, { stdout: items.length ? `${items.map((item) => item.selector).join("\n")}\n` : "No archivable items.\n" });
  }
  try {
    const result = await archiveItem({ snapshot, selector, dryRun: context.dryRun });
    return success("archive", { ...result, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would archive" : "Archived"} ${selector} to ${result.target}.\n` });
  } catch (error) { if (isFileSystemError(error)) throw error; throw new CliError("archive_blocked", error instanceof Error ? error.message : String(error), 1); }
}

async function requireWorkspace(context: CommandContext, positional?: string): Promise<string> {
  const explicit = context.workspace ?? positional;
  const resolution = await resolveWorkspace(context.cwd, explicit);
  if (resolution.status === "found") return resolution.workspace;
  if (resolution.status === "invalid") throw new CliError("workspace_invalid", `Invalid ResearchSpec workspace: ${resolution.path}`, 1);
  throw new CliError("workspace_missing", "No researchspec workspace found.", 1, "Run researchspec init to create one.");
}

async function optionalWorkspace(context: CommandContext): Promise<string | undefined> {
  const resolution = await resolveWorkspace(context.cwd, context.workspace);
  if (resolution.status === "found") return resolution.workspace;
  if (resolution.status === "invalid") throw new CliError("workspace_invalid", `Invalid ResearchSpec workspace: ${resolution.path}`, 1);
  return undefined;
}

async function reconcilePluginSelection(
  action: "install" | "update",
  workspace: string,
  snapshot: Awaited<ReturnType<typeof loadWorkspaceSnapshot>>,
  selected: string[],
  context: CommandContext,
  pluginRegistry: LoadedPluginRegistry,
  installOptions: PluginInstallOptions = {},
): Promise<CommandResult> {
  const projectRoot = path.dirname(workspace);
  const toolIds = strings(record(snapshot.config.agent_tools).selected);
  const existingInstallations = installationRecords(snapshot.manifest.installations);
  const availableSelected = selected.filter((id) => domainIsAvailable(pluginRegistry.domains.get(id)));
  const unavailableSelected = selected.filter((id) => !domainIsAvailable(pluginRegistry.domains.get(id)));
  const delivery = await planToolDelivery({ projectRoot, toolIds, existingInstallations, force: context.force, pluginRegistry, selectedPluginIds: availableSelected });
  const operations = [...delivery.operations];
  const reconciliation = await reconcileInstallations({
    projectRoot,
    existingInstallations,
    desiredInstallations: delivery.installations,
    reconciledToolIds: toolIds,
    selectedToolIds: toolIds,
    preserveSkillIds: [...resolvedSkillIdsForUnavailable(unavailableSelected, snapshot.manifest)],
  });
  operations.push(...reconciliation.operations);
  const installations = deduplicateInstallations([...reconciliation.retainedInstallations, ...delivery.installations]);
  const configText = stringify({ ...snapshot.config, plugins: { ...record(snapshot.config.plugins), selected } });
  operations.push(await authoritativeWrite(path.join(workspace, "config.yaml"), "config.yaml", configText, "workspace", "update selected plugin intent"));
  const manifestText = pluginManifestText(installations, pluginRegistry, selected, snapshot.manifest);
  operations.push(await authoritativeWrite(path.join(workspace, "tool-installation-manifest.json"), "tool-installation-manifest.json", manifestText, "workspace", "commit generated ownership last"));
  const diagnostics = [...delivery.diagnostics, ...reconciliation.diagnostics, ...operationDiagnostics(operations)];
  if (!toolIds.length) diagnostics.push({ severity: "warning", code: "plugin_projection_deferred", message: "Plugin selection was saved, but no Agent tool is configured for projection.", blocking: false, details: { selected_plugins: selected } });
  const resolution = resolveDomainSelection(pluginRegistry, availableSelected);
  const domainVersions = availableSelected.map((domainId) => ({
    domain_id: domainId,
    version: pluginRegistry.domains.get(domainId)?.version ?? null,
  }));
  const plan = summarizePlan(operations);
  const planSha256 = sha256(JSON.stringify({
    action,
    registry: pluginRegistry.registry,
    selected_domains: selected,
    domain_versions: domainVersions,
    resolved_skills: resolution.resolvedSkillIds,
    projected_tools: toolIds,
    plan,
  }));
  if (action === "install" && !context.dryRun) {
    if (!context.interactive && (!context.yes || !installOptions.expectedPlanSha256)) {
      throw new CliError(
        "confirmation_required",
        "Non-interactive plugin install requires --expected-plan-sha256 and --yes.",
        2,
        "Preview the identical plugin install with --dry-run --json after the user confirms the batch.",
      );
    }
    if (installOptions.expectedPlanSha256 !== undefined && installOptions.expectedPlanSha256 !== planSha256) {
      throw new CliError(
        "plugin_install_plan_conflict",
        "Plugin install plan changed after preview.",
        3,
        "Reload compact plugin metadata and preview the installation again.",
        { expected_plan_sha256: installOptions.expectedPlanSha256, actual_plan_sha256: planSha256 },
      );
    }
  }
  if (!context.dryRun && context.interactive && !context.yes) {
    const approved = await confirm({ message: `${action === "install" ? "Install" : "Update"} domain Skill plugins for ${String(toolIds.length)} configured tool(s)?`, default: true });
    if (!approved) throw new CliError("cancelled", `Plugin ${action} cancelled.`, 1);
  }
  if (!context.dryRun) await executeWritePlan({ operations });
  return deliveryResult("plugin", {
    action,
    workspace,
    selected_domains: selected,
    available_domains: availableSelected,
    unavailable_domains: unavailableSelected,
    domain_versions: domainVersions,
    resolved_skills: resolution.resolvedSkillIds,
    projected_tools: toolIds,
    plan_sha256: planSha256,
    dry_run: context.dryRun,
    plan: installOptions.summary ? summarizePluginOperations(plan) : plan,
  }, { stdout: formatPlan(context.dryRun ? `ResearchSpec plugin ${action} dry run` : `ResearchSpec domain plugins ${action === "install" ? "installed" : "updated"}`, workspace, operations, context.dryRun) }, diagnostics);
}

async function bundledPluginRegistry(): Promise<LoadedPluginRegistry> {
  try { return await loadPluginRegistry(undefined, false); }
  catch (error) {
    if (error instanceof PluginRegistryError) throw new CliError("plugin_registry_invalid", "The bundled domain Skill plugin registry is invalid.", 1, undefined, { diagnostics: error.diagnostics });
    throw error;
  }
}

function assertPluginsAvailable(ids: readonly string[], registry: LoadedPluginRegistry): void {
  const unknown = ids.filter((id) => !domainIsAvailable(registry.domains.get(id)));
  if (unknown.length) throw new CliError("plugin_unavailable", `Domain plugin is unavailable in this ResearchSpec package: ${unknown.join(", ")}`, 1, "Unavailable selected domains may still be safely removed with researchspec plugin uninstall.", { domain_ids: unknown });
}

function pluginManifestText(installations: readonly InstallationRecord[], registry: LoadedPluginRegistry, selectedDomainIds: readonly string[], previous?: Record<string, unknown>): string {
  const selected = new Set(selectedDomainIds);
  const current = buildResolutionSnapshots(registry, selectedDomainIds);
  const unavailable = resolutionSnapshots(previous?.plugin_resolutions).filter((snapshot) => selected.has(snapshot.domain_id) && !domainIsAvailable(registry.domains.get(snapshot.domain_id)));
  const pluginResolutions = [...current, ...unavailable].sort((left, right) => left.domain_id.localeCompare(right.domain_id));
  return `${JSON.stringify({ schema_version: "1", package_version: "0.1.0", plugin_resolutions: pluginResolutions, installations }, null, 2)}\n`;
}

function resolvedSkillIdsForUnavailable(domainIds: readonly string[], manifest: Record<string, unknown>): Set<string> {
  const unavailable = new Set(domainIds);
  return new Set(resolutionSnapshots(manifest.plugin_resolutions).filter((snapshot) => unavailable.has(snapshot.domain_id)).flatMap((snapshot) => snapshot.resolved_skill_ids));
}

function resolvedSkillIdsForSelection(registry: LoadedPluginRegistry, selectedDomainIds: readonly string[], manifest: Record<string, unknown>): Set<string> {
  const available = selectedDomainIds.filter((id) => domainIsAvailable(registry.domains.get(id)));
  const unavailable = selectedDomainIds.filter((id) => !domainIsAvailable(registry.domains.get(id)));
  return new Set([...resolveDomainSelection(registry, available).resolvedSkillIds, ...resolvedSkillIdsForUnavailable(unavailable, manifest)]);
}

function normalizePluginIds(ids: readonly string[]): string[] {
  return uniqueSorted(ids.map((id) => id.trim()).filter(Boolean));
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

async function authoritativeWrite(target: string, relativePath: string, content: string | Uint8Array, scope: PlannedWrite["scope"], reason: string): Promise<PlannedWrite> {
  const existing = await readOptionalText(target);
  const nextHash = sha256(content);
  const previousHash = existing === undefined ? undefined : sha256(existing);
  return { action: existing === undefined ? "create" : previousHash === nextHash ? "skip-unchanged" : "refresh", path: target, relativePath, content, scope, ownership: "user", ...(previousHash ? { previousHash } : {}), nextHash, reason };
}

function summarizePlan(operations: PlannedWrite[]) {
  return operations.map((operation) => ({ action: operation.action, path: operation.path, relativePath: operation.relativePath, scope: operation.scope, ownership: operation.ownership, previousHash: operation.previousHash, nextHash: operation.nextHash, reason: operation.reason }));
}
function summarizePluginOperations(operations: ReturnType<typeof summarizePlan>) {
  const counts = new Map<string, number>();
  for (const operation of operations) counts.set(operation.action, (counts.get(operation.action) ?? 0) + 1);
  return {
    operation_count: operations.length,
    writable_count: operations.filter((item) => item.action === "create" || item.action === "refresh" || item.action === "remove-owned").length,
    actions: Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right))),
  };
}
function writableCount(operations: PlannedWrite[]): number { return operations.filter((item) => item.action === "create" || item.action === "refresh" || item.action === "remove-owned").length; }
function formatPlan(title: string, workspace: string, operations: PlannedWrite[], dryRun: boolean): string {
  const labels: Record<PlannedWrite["action"], string> = dryRun
    ? { create: "Would create", refresh: "Would refresh", "remove-owned": "Would remove", move: "Would move", "skip-unchanged": "skip-unchanged", "skip-drift": "skip-drift", conflict: "conflict" }
    : { create: "Created", refresh: "Refreshed", "remove-owned": "Removed", move: "Moved", "skip-unchanged": "skip-unchanged", "skip-drift": "skip-drift", conflict: "conflict" };
  return `${title}\nWorkspace: ${workspace}\n${operations.map((item) => `${labels[item.action]}: ${item.path}`).join("\n")}\n`;
}
function record(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function records(value: unknown): Record<string, unknown>[] { return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item)) : []; }
function strings(value: unknown): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []; }
function installationRecords(value: unknown): InstallationRecord[] {
  return records(value).filter((item): item is Record<string, unknown> & InstallationRecord =>
    typeof item.tool_id === "string" && typeof item.path === "string" &&
    (item.scope === "project" || item.scope === "shared-global") && typeof item.sha256 === "string" &&
    typeof item.source === "string" && item.adapter_version === "1" &&
    (item.vendor_id === undefined || typeof item.vendor_id === "string") &&
    (item.vendor_release === undefined || typeof item.vendor_release === "string") &&
    (item.skill_id === undefined || typeof item.skill_id === "string"));
}
function deduplicateInstallations(items: InstallationRecord[]): InstallationRecord[] { return [...new Map(items.map((item) => [`${item.scope}:${item.path}`, item])).values()].sort((a, b) => a.tool_id.localeCompare(b.tool_id) || a.path.localeCompare(b.path)); }
async function reconcileInstallations(input: {
  projectRoot: string;
  existingInstallations: readonly InstallationRecord[];
  desiredInstallations: readonly InstallationRecord[];
  reconciledToolIds: readonly string[];
  selectedToolIds: readonly string[];
  preserveSkillIds?: readonly string[];
}): Promise<{ operations: PlannedWrite[]; retainedInstallations: InstallationRecord[]; diagnostics: Diagnostic[] }> {
  const operations: PlannedWrite[] = [];
  const retainedInstallations: InstallationRecord[] = [];
  const diagnostics: Diagnostic[] = [];
  const desiredKeys = new Set(input.desiredInstallations.map(installationKey));
  const reconciledTools = new Set(input.reconciledToolIds);
  const selectedTools = new Set(input.selectedToolIds);
  const preservedSkills = new Set(input.preserveSkillIds ?? []);

  for (const installation of input.existingInstallations) {
    if (desiredKeys.has(installationKey(installation))) continue;
    if (installation.skill_id && preservedSkills.has(installation.skill_id)) {
      retainedInstallations.push(installation);
      continue;
    }
    if (!reconciledTools.has(installation.tool_id)) {
      retainedInstallations.push(installation);
      continue;
    }

    const selected = selectedTools.has(installation.tool_id);
    const mayRemove = installation.scope === "project";
    if (!mayRemove) {
      retainedInstallations.push(installation);
      continue;
    }

    const target = installation.scope === "shared-global"
      ? installation.path
      : path.resolve(input.projectRoot, installation.path);
    const bytes = await readBytes(target);
    if (bytes === undefined) continue;
    if (sha256(bytes) !== installation.sha256) {
      retainedInstallations.push(installation);
      diagnostics.push({
        severity: "warning",
        code: "generated_file_drift",
        message: "Stale generated file has user modifications and was preserved.",
        path: target,
        blocking: false,
        details: { source: installation.source },
      });
      continue;
    }
    operations.push({
      action: "remove-owned",
      path: target,
      relativePath: installation.path,
      scope: installation.scope,
      ownership: "generated",
      previousHash: installation.sha256,
      reason: selected ? "remove stale manifest-owned generated file" : "tool was explicitly deselected",
    });
  }
  return { operations, retainedInstallations, diagnostics };
}

function installationKey(item: Pick<InstallationRecord, "scope" | "path">): string {
  return `${item.scope}:${item.path}`;
}

function operationDiagnostics(operations: PlannedWrite[]): Diagnostic[] { return operations.filter((item) => item.action === "skip-drift" || item.action === "conflict").map((item) => ({ severity: "warning", code: item.action === "skip-drift" ? "generated_file_drift" : "generated_file_conflict", message: item.reason, path: item.path, blocking: false })); }
function deliveryResult<T>(command: string, data: T, human: { stdout: string }, diagnostics: Diagnostic[]): CommandResult<T> {
  const base = success(command, data, human, diagnostics);
  return diagnostics.some((item) => item.blocking)
    ? { ...base, ok: false, exitCode: 1, error: { code: "tool_delivery_incomplete", message: "One or more selected tools could not be delivered." } }
    : base;
}

async function readBytes(filePath: string): Promise<Uint8Array | undefined> {
  try { return await readFile(filePath); }
  catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") return undefined;
    throw error;
  }
}

function previewSummary(operations: PlannedWrite[]): string {
  const counts = new Map<string, number>();
  for (const operation of operations) counts.set(operation.action, (counts.get(operation.action) ?? 0) + 1);
  const globals = operations.filter((operation) => operation.scope === "shared-global").map((operation) => operation.path);
  return [`Plan: ${[...counts].map(([action, count]) => `${action}=${String(count)}`).join(", ")}`, ...(globals.length ? ["Shared-global writes:", ...globals.map((filePath) => `- ${filePath}`)] : [])].join("\n");
}

function isFileSystemError(value: unknown): value is NodeJS.ErrnoException { return value instanceof Error && typeof (value as NodeJS.ErrnoException).code === "string"; }
