import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { confirm, input, select } from "@inquirer/prompts";
import { stringify } from "yaml";

import { planWorkspaceDelivery } from "../adapters/workspace-delivery.js";
import {
  installationKey,
  installationRecords,
  isDomainSkillInstallation,
  literatureAdapterResolutions,
  managedSkillId,
  renderToolInstallationManifest,
  type LiteratureAdapterResolution,
  type ManagedInstallation,
} from "../adapters/installations.js";
import { detectTools, orderTools, parseToolExpression } from "../adapters/tools.js";
import { WorkItemSelectorSchema } from "../core/contracts/workflow.js";
import { Sha256Schema, SubmitActorKindSchema, SubmitActorSchema } from "../core/contracts/artifact.js";
import { RuntimeActorSchema } from "../core/contracts/gate-transition.js";
import { GateSelectorSchema, RuntimeSelectorSchema, SubflowSelectorSchema, TransitionSelectorSchema, parseRuntimeSelector } from "../core/contracts/runtime-selector.js";
import { ActionTargetSelectorSchema, AnnotationSelectorSchema, CaseActionSelectorSchema, CompletionSelectorSchema, formatActionTargetSelectorHint, ObligationSelectorSchema, PatchSelectorSchema } from "../core/contracts/action-selector.js";
import { StartActorSchema } from "../core/contracts/subflow.js";
import { ArtifactSubmitError, executeArtifactSubmit, planArtifactSubmit } from "../core/runtime/artifact-submit.js";
import { executeGateSubmit, executeTransitionAdvance, GateTransitionError, isSha256, planGateSubmit, planTransitionAdvance } from "../core/runtime/gate-transition-control.js";
import { archiveItem, decideItem, LifecycleError, type DecisionChoice } from "../core/runtime/lifecycle.js";
import { assertProposalBasisCurrent, ContractChangeError, planContractChangeProposal } from "../core/runtime/contract-change.js";
import { renderHandoff } from "../core/runtime/handoff.js";
import { buildContextPack } from "../core/runtime/pack.js";
import {
  buildCaseStatusSummary,
  formatCaseStatusHuman,
  listItemsPage,
  RuntimeQueryError,
  showRuntimeDetail,
  type ListType,
} from "../core/runtime/query.js";
import { buildActionDescriptor } from "../core/runtime/action-descriptor.js";
import { buildGateTransitionInstructions, buildWorkflowInstructions } from "../core/runtime/workflow-control.js";
import { evaluateWorkflowControl } from "../core/runtime/workflow-control.js";
import { buildSubflowInstructions, executeSubflowStart, planSubflowStart, SubflowStartError } from "../core/runtime/subflow-control.js";
import { runWorkspaceChecks, type CheckTarget } from "../core/validation/check.js";
import type { Diagnostic } from "../core/validation/types.js";
import { resolveWorkspace } from "../core/workspace/discover.js";
import { getWorkspaceEntries, getWorkspaceTemplates, resolveInitTarget, type InitRuntimeProfile } from "../core/workspace/layout.js";
import { loadWorkspaceSnapshot } from "../core/workspace/snapshot.js";
import { executeWritePlan, planFile, sha256, type PlannedWrite } from "../core/workspace/write-plan.js";
import { fileExists, readOptionalText } from "../utils/fs.js";
import { CliError, success, type CommandContext, type CommandResult } from "./types.js";
import {
  assertPlanBoundActionAvailable,
  authorizePlanBoundExecution,
} from "./execution-guard.js";
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
import { evaluateActionAvailability, type RuntimeActionKey } from "../core/runtime/action-availability.js";
import { compactTransactionResult } from "../core/runtime/transaction-result.js";
import { inspectLiteratureAdapters } from "../literature-adapters/inspect.js";
import { executePatchPlan, PatchLifecycleError, planPatchAdvance, planPatchSubmit } from "../core/runtime/patch-lifecycle.js";
import { annotationCandidateRelativePath, AnnotationLifecycleError, executeAnnotationPlan, planAnnotationSubmit } from "../core/runtime/annotation-lifecycle.js";
import { buildAdaptiveInstructions } from "../core/runtime/adaptive-case-control.js";
import {
  AdaptiveCaseError,
  executeAdaptivePlan,
  planAdaptiveCompletion,
  planAdaptiveGate,
  planAdaptiveObligationSubmit,
  planAdaptiveResolutionDecision,
  planAdaptiveStart,
  type AdaptiveTransactionPlan,
} from "../core/runtime/adaptive-case-transactions.js";
import {
  diagnoseRuntime,
  DoctorRecoveryError,
  executeDoctorRepair,
  prepareDoctorRepair,
} from "../core/runtime/runtime-recovery.js";
import {
  executeRuntimeMigration,
  executeRuntimeMigrationRollback,
  planRuntimeMigration,
  planRuntimeMigrationRollback,
  RuntimeMigrationError,
} from "../core/runtime/runtime-migration.js";
import { validationViolations, zodIssues } from "./validation.js";
import type { CompactTransactionEffect } from "../core/contracts/runtime-protocol.js";

export interface InitOptions { tools?: string; profile?: string }
export interface UpdateOptions {
  tools?: string;
  migrateRuntime?: boolean;
  rollback?: string;
  expectedPlanSha256?: string;
}
export interface HandoffOptions { stdout?: boolean; out?: string }
export interface PackOptions { out?: string; includeArtifacts?: boolean }
export interface DecideOptions { decision?: DecisionChoice; actorName?: string; reason?: string; expectedActionBasisSha256?: string; expectedPlanSha256?: string }
export interface ProposeOptions { input: string; actorKind: "human" | "agent"; actorName: string; expectedActionBasisSha256?: string; expectedPlanSha256?: string }
export interface SubmitOptions { input?: string; actorKind: string; actorName: string; confirmedBy?: string; expectedSha256?: string; expectedPlanSha256?: string; expectedActionBasisSha256?: string }
export interface StartOptions { input: string; actorKind: string; actorName: string; confirmedBy?: string; expectedPlanSha256?: string; expectedActionBasisSha256?: string }
export interface AdvanceOptions { actorKind: string; actorName: string; expectedPlanSha256?: string; expectedActionBasisSha256?: string }
export interface DoctorOptions { repair?: string; expectedPlanSha256?: string }
export interface ListOptions { limit?: string; cursor?: string }
export interface PluginListOptions { installed?: boolean; summary?: boolean }
export interface PluginShowOptions { summary?: boolean }
export interface PluginInstallOptions { expectedPlanSha256?: string; summary?: boolean }

export async function handleInit(inputPath: string | undefined, options: InitOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = context.workspace ? path.resolve(context.cwd, context.workspace) : resolveInitTarget(inputPath, context.cwd);
  const projectRoot = path.dirname(workspace);
  const existing = await fileExists(workspace);
  const priorSnapshot = existing ? await loadWorkspaceSnapshot(workspace) : undefined;
  if (options.profile !== undefined && options.profile !== "adaptive" && options.profile !== "strict") {
    throw new CliError("invalid_profile", "--profile must be adaptive or strict.", 2);
  }
  const requestedProfile: InitRuntimeProfile = options.profile ?? "adaptive";
  const priorProfile = typeof priorSnapshot?.config.profile === "string" ? priorSnapshot.config.profile : undefined;
  if (existing && options.profile && priorSnapshot && priorSnapshot.runtimeMode !== options.profile) {
    throw new CliError("profile_change_requires_migration", "init cannot replace an existing workspace runtime profile.", 2, "Use the explicit runtime migration workflow when it becomes available.");
  }
  const profile = existing ? priorProfile ?? (priorSnapshot?.runtimeMode === "adaptive" ? "adaptive" : "strict") : requestedProfile;
  const templateProfile: InitRuntimeProfile = existing
    ? priorSnapshot?.runtimeMode === "adaptive" ? "adaptive" : "strict"
    : requestedProfile;
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
  for (const template of getWorkspaceTemplates(templateProfile)) {
    if (template.relativePath === "config.yaml" || template.relativePath === "tool-installation-manifest.json") continue;
    const target = path.join(workspace, template.relativePath);
    if (await fileExists(target)) {
      operations.push({ action: "skip-unchanged", path: target, relativePath: template.relativePath, scope: "workspace", ownership: "user", reason: "existing research content is protected" });
    } else {
      operations.push(await planFile({ path: target, relativePath: template.relativePath, content: template.content, scope: "workspace", ownership: template.overwritePolicy, force: context.force }));
    }
  }

  const currentInstallations = installationRecords(priorSnapshot?.manifest.installations);
  const delivery = await planWorkspaceDelivery({
    projectRoot,
    toolIds: selected,
    selectedToolIds: selected,
    existingInstallations: currentInstallations,
    force: context.force,
    pluginRegistry,
    selectedPluginIds: configuredPlugins,
    reconciledToolIds: [...new Set([...selected, ...currentInstallations.flatMap((item) => item.tool_id === null ? [] : [item.tool_id])])],
  });
  operations.push(...delivery.operations);
  const configText = stringify({ schema_version: "0.1", profile, agent_tools: { selected, delivery: "both" }, plugins: { selected: configuredPlugins } });
  const configPath = path.join(workspace, "config.yaml");
  operations.push(await authoritativeWrite(configPath, "config.yaml", configText, "workspace", "update selected tool intent"));
  const manifestText = pluginManifestText(delivery.installations, pluginRegistry, configuredPlugins, priorSnapshot?.manifest, delivery.literatureAdapterResolutions);
  const manifestPath = path.join(workspace, "tool-installation-manifest.json");
  operations.push(await authoritativeWrite(manifestPath, "tool-installation-manifest.json", manifestText, "workspace", "commit generated ownership last"));

  const plan = { operations };
  if (!context.dryRun && context.interactive && !context.yes) {
    const approved = await confirm({ message: `${previewSummary(operations)}\nApply these ${String(writableCount(operations))} planned file operations?`, default: true });
    if (!approved) throw new CliError("cancelled", "Initialization cancelled.", 1);
  }
  if (!context.dryRun) {
    for (const entry of getWorkspaceEntries(workspace, templateProfile)) if (entry.kind === "dir") await mkdir(entry.path, { recursive: true });
    await executeWritePlan(plan);
  }
  const diagnostics = [...delivery.diagnostics, ...operationDiagnostics(operations)];
  const data = { workspace, profile, selected_tools: selected, selected_plugins: configuredPlugins, dry_run: context.dryRun, plan: summarizePlan(operations) };
  return deliveryResult("init", data, { stdout: formatPlan(context.dryRun ? "ResearchSpec init dry run" : existing ? "ResearchSpec workspace updated" : "ResearchSpec workspace initialized", workspace, operations, context.dryRun) }, diagnostics);
}

export async function handleUpdate(inputPath: string | undefined, options: UpdateOptions, context: CommandContext, providedPluginRegistry?: LoadedPluginRegistry): Promise<CommandResult> {
  const workspace = await requireWorkspace(context, inputPath);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  if (options.rollback && !options.migrateRuntime) {
    throw new CliError("migration_option_invalid", "--rollback requires --migrate-runtime.", 2);
  }
  if (options.migrateRuntime) {
    if (options.tools !== undefined) throw new CliError("migration_option_invalid", "--migrate-runtime cannot be combined with --tools.", 2);
    try {
      const prepared = options.rollback
        ? await planRuntimeMigrationRollback(snapshot, options.rollback)
        : await planRuntimeMigration(snapshot, await evaluateWorkflowControl(snapshot));
      const plan = prepared.plan;
      if (context.dryRun) {
        return success("update", {
          workspace,
          operation: options.rollback ? "runtime_migration_rollback" : "runtime_migration",
          dry_run: true,
          plan,
        }, { stdout: `${options.rollback ? "Runtime migration rollback" : "Runtime migration"} dry run\nPlan: ${plan.plan_sha256}\nExecutable: ${String(plan.executable)}\n` });
      }
      if (!context.yes || !options.expectedPlanSha256) {
        throw new CliError(
          "migration_confirmation_required",
          "Runtime migration execution requires --yes and --expected-plan-sha256 from a dry run.",
          2,
        );
      }
      if (!isSha256(options.expectedPlanSha256)) throw new CliError("invalid_expected_plan_sha256", "--expected-plan-sha256 must be 64 lowercase hexadecimal characters.", 2);
      if (options.expectedPlanSha256 !== plan.plan_sha256) {
        throw new CliError("migration_plan_stale", "Runtime migration plan differs from the approved dry run.", 3, undefined, {
          expected: options.expectedPlanSha256,
          actual: plan.plan_sha256,
        });
      }
      if (options.rollback) {
        const execution = await executeRuntimeMigrationRollback(prepared as Awaited<ReturnType<typeof planRuntimeMigrationRollback>>);
        return success("update", {
          workspace,
          operation: "runtime_migration_rollback",
          dry_run: false,
          identity: {
            migration_id: execution.receipt.migration_id,
            rollback_id: execution.receipt.rollback_id,
            plan_sha256: execution.plan.plan_sha256,
            receipt_path: execution.receiptPath,
            receipt_sha256: execution.receiptSha256,
          },
        }, { stdout: `Rolled back runtime migration ${execution.receipt.migration_id}.\n` });
      }
      const execution = await executeRuntimeMigration(prepared as Awaited<ReturnType<typeof planRuntimeMigration>>);
      return success("update", {
        workspace,
        operation: "runtime_migration",
        dry_run: false,
        identity: {
          migration_id: execution.receipt.migration_id,
          plan_sha256: execution.plan.plan_sha256,
          receipt_path: execution.receiptPath,
          receipt_sha256: execution.receiptSha256,
        },
      }, { stdout: `Migrated Schema 0.2 runtime ${execution.receipt.migration_id} to adaptive.\n` });
    } catch (error) {
      if (error instanceof CliError) throw error;
      if (error instanceof RuntimeMigrationError) {
        throw new CliError(error.code, error.message, error.kind === "conflict" ? 3 : 1, undefined, error.details);
      }
      throw error;
    }
  }
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
  const existingInstallations = installationRecords(snapshot.manifest.installations);
  const delivery = await planWorkspaceDelivery({
    projectRoot,
    toolIds: targetTools,
    selectedToolIds: selected,
    existingInstallations,
    force: context.force,
    pluginRegistry,
    selectedPluginIds: configuredPlugins,
    reconciledToolIds: targetTools,
  });
  const operations = [...delivery.operations];
  const diagnostics = [...delivery.diagnostics];
  if (selected.join("\0") !== configured.join("\0")) {
    const configText = stringify({ ...snapshot.config, agent_tools: { ...record(snapshot.config.agent_tools), selected } });
    operations.push(await authoritativeWrite(path.join(workspace, "config.yaml"), "config.yaml", configText, "workspace", "add explicitly targeted tools"));
  }
  const manifestText = pluginManifestText(delivery.installations, pluginRegistry, configuredPlugins, snapshot.manifest, delivery.literatureAdapterResolutions);
  operations.push(await authoritativeWrite(path.join(workspace, "tool-installation-manifest.json"), "tool-installation-manifest.json", manifestText, "workspace", "commit generated ownership last"));
  if (!context.dryRun) await executeWritePlan({ operations });
  return deliveryResult("update", { workspace, selected_tools: selected, selected_plugins: configuredPlugins, dry_run: context.dryRun, plan: summarizePlan(operations) }, { stdout: formatPlan(context.dryRun ? "ResearchSpec update dry run" : "ResearchSpec tools updated", workspace, operations, context.dryRun) }, [...diagnostics, ...operationDiagnostics(operations)]);
}

export async function handleStatus(context: CommandContext): Promise<CommandResult> {
  const workspace = await requireWorkspace(context);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  const adapterInspection = await inspectLiteratureAdapters(snapshot);
  const data = await buildCaseStatusSummary(snapshot, adapterInspection.adapters);
  const diagnostics = [...snapshot.diagnostics, ...adapterInspection.diagnostics];
  const ok = diagnostics.every((item) => !item.blocking);
  return { ...success("status", data, { stdout: formatCaseStatusHuman(data) }), ok, exitCode: ok ? 0 : 1, diagnostics };
}

export async function handleInstructions(selector: string, context: CommandContext): Promise<CommandResult> {
  if (!ActionTargetSelectorSchema.safeParse(selector).success) throw new CliError("invalid_runtime_selector", `Invalid runtime selector: ${selector}`, 2, formatActionTargetSelectorHint());
  const workspace = await requireWorkspace(context);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  const descriptor = await buildActionDescriptor(snapshot, selector);
  if (!descriptor) throw new CliError("action_descriptor_unavailable", `Action descriptor is unavailable: ${selector}`, 1);
  if (AnnotationSelectorSchema.safeParse(selector).success) {
    if (descriptor.availability.disposition === "blocked") throw new CliError("action_blocked", `Action is blocked: ${selector}`, 1, undefined, { descriptor });
    const annotationSetId = selector.slice("annotation:".length);
    const packet = {
      kind: "submit",
      selector,
      candidate: {
        path: annotationCandidateRelativePath(annotationSetId),
        schema_ref: "researchspec://contracts/annotation-set-candidate/v1",
        normalized_json_only: true,
      },
      registered: snapshot.annotations.some((item) => item.id === annotationSetId),
      action_descriptor: descriptor,
    };
    return success("instructions", packet, { stdout: `${JSON.stringify(packet, null, 2)}\n` });
  }
  if (snapshot.runtimeMode === "adaptive") {
    const packet = { ...buildAdaptiveInstructions(snapshot, selector), action_descriptor: descriptor };
    return success("instructions", packet, { stdout: `${JSON.stringify(packet, null, 2)}\n` });
  }
  if (!RuntimeSelectorSchema.safeParse(selector).success) {
    if (descriptor.availability.disposition === "blocked") throw new CliError("action_blocked", `Action is blocked: ${selector}`, 1, undefined, { descriptor });
    const packet = { kind: descriptor.command, selector, action_descriptor: descriptor };
    return success("instructions", packet, { stdout: `${JSON.stringify(packet, null, 2)}\n` });
  }
  const parsed = parseRuntimeSelector(selector);
  if (parsed?.kind === "gate" || parsed?.kind === "transition") {
    const result = await buildGateTransitionInstructions(snapshot, selector);
    if (!result.ok) throw new CliError(result.code, `Runtime instructions are unavailable: ${selector}`, 1, undefined, { selector, item: result.item });
    const packet = { ...result.packet, action_descriptor: descriptor };
    return success("instructions", packet, { stdout: `${JSON.stringify(packet, null, 2)}\n` });
  }
  if (parsed?.kind === "subflow_template" || parsed?.kind === "subflow_instance" || parsed?.kind === "scoped_subflow_node") {
    const result = await buildSubflowInstructions(snapshot, selector);
    if (!result.ok) throw new CliError(result.code, `Subflow instructions are unavailable: ${selector}`, 1, undefined, { selector });
    return success("instructions", { ...result.packet, action_descriptor: descriptor }, { stdout: [`Subflow: ${selector}`, `Route: ${result.packet.route.route_ref}`, `State: ${result.packet.state}`, ""].join("\n") });
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
  return success("instructions", { ...packet, action_descriptor: descriptor }, { stdout: [`Work item: ${packet.selector}`, `Producer skill: ${packet.producer_skill}`, `Output: ${packet.output.resolved_path}`, `Template: ${packet.output.template_ref}`, ""].join("\n") });
}

export async function handleStart(selector: string, options: StartOptions, context: CommandContext): Promise<CommandResult> {
  const selectorKind = parseRuntimeSelector(selector)?.kind;
  if (!SubflowSelectorSchema.safeParse(selector).success || (selectorKind !== "subflow_template" && selectorKind !== "scoped_subflow_node")) throw new CliError("invalid_subflow_selector", `Invalid start selector: ${selector}`, 2, "Use subflow:tpl-<safe-id> or a scoped child selector returned by status.");
  if (options.expectedPlanSha256 !== undefined && !Sha256Schema.safeParse(options.expectedPlanSha256).success) throw new CliError("invalid_expected_plan_sha256", "--expected-plan-sha256 must be 64 lowercase hexadecimal characters.", 2);
  const actorResult = StartActorSchema.safeParse({ kind: options.actorKind, name: options.actorName });
  if (!actorResult.success) throw new CliError("invalid_start_input", "Start actor is invalid.", 2, undefined, actorResult.error.issues);
  if (selectorKind === "subflow_template" && !options.confirmedBy?.trim()) throw new CliError("invalid_start_input", "External template start requires --confirmed-by.", 2);
  const workspace = await requireWorkspace(context);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  const inputPath = path.resolve(context.cwd, options.input);
  let payload: unknown;
  try { payload = JSON.parse(await readFile(inputPath, "utf8")) as unknown; }
  catch (error) { throw new CliError("invalid_start_input", `Cannot read Start input: ${error instanceof Error ? error.message : String(error)}`, 2); }
  try {
    if (snapshot.runtimeMode === "adaptive") {
      const plan = await planAdaptiveStart({ snapshot, selector, payload, actor: actorResult.data, confirmedBy: options.confirmedBy, expectedPlanSha256: options.expectedPlanSha256 });
      if (plan.status !== "already_applied") await assertActionBasis(snapshot, selector, options.expectedActionBasisSha256);
      if (!context.dryRun) await executeAdaptivePlan(plan);
      return adaptiveTransactionResult("start", plan, context);
    }
    const plan = await planSubflowStart({ snapshot, selector, payload, actor: actorResult.data, confirmedBy: options.confirmedBy, expectedPlanSha256: options.expectedPlanSha256, sourceRoot: context.cwd });
    if (plan.status !== "already_started") await assertActionBasis(snapshot, selector, options.expectedActionBasisSha256);
    const outcome = context.dryRun ? undefined : await executeSubflowStart(plan, workspace);
    const status = context.dryRun ? plan.status : outcome?.status ?? plan.status;
    const instanceSelector = `subflow:${plan.instance.instance_id}`;
    const effects: CompactTransactionEffect[] = status === "already_started"
      ? [{ kind: "no_change", refs: [instanceSelector] }]
      : [{ kind: "subflow_started", refs: [instanceSelector] }];
    if (plan.material_passport_import) effects.push({
      kind: "material_passport_imported",
      refs: [...plan.material_passport_import.artifact_ids.map((id) => `artifact:${id}`), ...plan.material_passport_import.gate_evidence_ids.map((id) => `gate:${id}`), ...plan.material_passport_import.decision_evidence_ids.map((id) => `decision:${id}`)].slice(0, 20),
    });
    const data = compactTransactionResult({
      command: "start",
      selector,
      outcome: status,
      dryRun: context.dryRun,
      identity: context.dryRun
        ? { kind: "plan", selector, plan_sha256: plan.plan_sha256 }
        : { kind: "receipt", selector: instanceSelector, sha256: plan.instance.start_receipt.sha256, plan_sha256: plan.plan_sha256 },
      effects,
      nextSelectors: [`show:${instanceSelector}`, `instructions:${instanceSelector}`],
    });
    return success("start", data, { stdout: `${context.dryRun ? "Would start" : status === "already_started" ? "Already started" : "Started"} ${selector} as ${plan.instance.instance_id}.\n` });
  } catch (error) {
    if (error instanceof CliError) throw error;
    if (error instanceof AdaptiveCaseError) throw adaptiveCliError(error, "start", payload);
    if (error instanceof SubflowStartError) throw actionCliError("start", error.code, error.message, error.kind, error.details, payload);
    if ((error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT") throw new CliError("subflow_start_conflict", error instanceof Error ? error.message : String(error), 3);
    throw new CliError("internal_error", error instanceof Error ? error.message : String(error), 4);
  }
}

export async function handleSubmit(selector: string, options: SubmitOptions, context: CommandContext): Promise<CommandResult> {
  if (AnnotationSelectorSchema.safeParse(selector).success) return handleAnnotationSubmit(selector, options, context);
  if (PatchSelectorSchema.safeParse(selector).success) return handlePatchSubmit(selector, options, context);
  if (ObligationSelectorSchema.safeParse(selector).success) return handleObligationSubmit(selector, options, context);
  if (GateSelectorSchema.safeParse(selector).success && parseRuntimeSelector(selector)?.kind === "gate") return handleGateSubmit(selector, options, context);
  if (!WorkItemSelectorSchema.safeParse(selector).success) throw new CliError("invalid_work_item_selector", `Invalid work-item selector: ${selector}`, 2, "Use the canonical form work:<safe-id>.");
  if (options.expectedSha256 !== undefined && !Sha256Schema.safeParse(options.expectedSha256).success) throw new CliError("invalid_expected_sha256", "--expected-sha256 must be 64 lowercase hexadecimal characters.", 2);
  if (!SubmitActorKindSchema.safeParse(options.actorKind).success) throw new CliError("invalid_actor_kind", "--actor-kind must be human, agent, script, converter, or validator.", 2);
  const actorResult = SubmitActorSchema.safeParse({ kind: options.actorKind, name: options.actorName });
  if (!actorResult.success) throw new CliError("invalid_submission_input", "Submit actor is invalid.", 2, undefined, actorResult.error.issues);
  const workspace = await requireWorkspace(context);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  if (!options.input) throw new CliError("invalid_submission_input", "--input is required for work-item submission.", 2);
  const inputPath = path.resolve(context.cwd, options.input);
  let payload: unknown;
  try { payload = JSON.parse(await readFile(inputPath, "utf8")) as unknown; }
  catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    throw new CliError("invalid_submission_input", nodeError.code === "ENOENT" ? `Submission input file not found: ${inputPath}` : `Cannot read submission input: ${error instanceof Error ? error.message : String(error)}`, 2);
  }
  try {
    const plan = await planArtifactSubmit({ snapshot, selector, payload, actor: actorResult.data, expectedSha256: options.expectedSha256 });
    if (plan.status !== "already_submitted") await assertActionBasis(snapshot, selector, options.expectedActionBasisSha256);
    if (!context.dryRun && plan.status !== "already_submitted" && plan.confirmation_basis === "per_artifact" && !context.interactive && !options.confirmedBy?.trim()) {
      throw new CliError("confirmation_required", "Manual artifact Submit requires --confirmed-by outside a TTY.", 2);
    }
    if (!context.dryRun && plan.status !== "already_submitted" && plan.confirmation_basis !== "subflow_start" && !context.yes) {
      const approved = await confirm({ message: `Submit ${selector} at SHA-256 ${plan.candidate_sha256} and register its receipt? This does not update state, Gates, or Decisions.`, default: false });
      if (!approved) throw new CliError("cancelled", "Artifact submission cancelled.", 1);
    }
    const result = context.dryRun ? undefined : await executeArtifactSubmit(plan, workspace);
    const status = context.dryRun ? plan.status : result?.status ?? plan.status;
    const artifactSelector = `artifact:${plan.artifact.artifact_id}`;
    const receiptSelector = `artifact:${plan.receipt_artifact.artifact_id}`;
    const data = compactTransactionResult({
      command: "submit",
      selector,
      outcome: status,
      dryRun: context.dryRun,
      identity: { kind: "artifact", selector: artifactSelector, sha256: plan.candidate_sha256 },
      effects: status === "already_submitted"
        ? [{ kind: "no_change", refs: [artifactSelector] }]
        : [{ kind: "artifact_registered", refs: [artifactSelector, receiptSelector] }],
      nextSelectors: [`show:${artifactSelector}`, `show:${receiptSelector}`, `instructions:${selector}`],
    });
    return success("submit", data, { stdout: `${context.dryRun ? "Would submit" : status === "already_submitted" ? "Already submitted" : "Submitted"} ${selector} at ${plan.candidate_sha256}.\n` });
  } catch (error) {
    if (error instanceof CliError) throw error;
    if (error instanceof ArtifactSubmitError) throw actionCliError("submit_artifact", error.code, error.message, error.kind, error.details, payload);
    if ((error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT") throw new CliError("submission_conflict", error instanceof Error ? error.message : String(error), 3);
    if (isFileSystemError(error)) throw error;
    throw new CliError("internal_error", error instanceof Error ? error.message : String(error), 4);
  }
}

async function handleAnnotationSubmit(selector: string, options: SubmitOptions, context: CommandContext): Promise<CommandResult> {
  if (options.input) throw new CliError("annotation_input_not_supported", "Annotation Submit reads only the candidate path returned by instructions; do not pass --input.", 2);
  if (options.expectedPlanSha256) throw new CliError("annotation_plan_hash_not_supported", "Annotation Submit is human_confirmed and does not accept --expected-plan-sha256.", 2);
  const actor = SubmitActorSchema.safeParse({ kind: options.actorKind, name: options.actorName });
  if (!actor.success) throw new CliError("invalid_annotation_input", "Annotation actor is invalid.", 2, undefined, actor.error.issues);
  if (!options.confirmedBy?.trim()) throw new CliError("annotation_confirmation_missing", "Annotation Submit requires --confirmed-by.", 2);
  if (!context.dryRun && !context.interactive && !context.yes) {
    throw new CliError("annotation_confirmation_required", "Non-interactive Annotation Submit requires --yes.", 2);
  }
  if (!context.dryRun && !context.interactive && !options.expectedActionBasisSha256) {
    throw new CliError("annotation_action_basis_required", "Non-interactive Annotation Submit requires --expected-action-basis-sha256.", 2);
  }
  const workspace = await requireWorkspace(context);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  try {
    await assertActionBasis(snapshot, selector, options.expectedActionBasisSha256);
    const plan = await planAnnotationSubmit({
      snapshot,
      selector,
      actor: actor.data,
      confirmedBy: options.confirmedBy,
      expectedActionBasis: options.expectedActionBasisSha256,
    });
    if (!context.dryRun && context.interactive && !context.yes && plan.status !== "already_submitted") {
      const approved = await confirm({
        message: `Freeze and register ${selector} at candidate SHA-256 ${plan.candidate_sha256}?`,
        default: false,
      });
      if (!approved) throw new CliError("cancelled", "Annotation submission cancelled.", 1);
    }
    if (!context.dryRun) await executeAnnotationPlan(plan);
    const setArtifactSelector = `artifact:A-annotation-set-${plan.annotation_set.annotation_set_id}`;
    const receiptArtifactSelector = `artifact:A-annotation-receipt-${plan.annotation_set.annotation_set_id}`;
    const data = compactTransactionResult({
      command: "submit",
      selector,
      outcome: context.dryRun ? plan.status : plan.status === "already_submitted" ? "already_submitted" : "submitted",
      dryRun: context.dryRun,
      identity: { kind: "artifact", selector: setArtifactSelector, sha256: plan.frozen_sha256 },
      effects: plan.status === "already_submitted"
        ? [{ kind: "no_change", refs: [selector, setArtifactSelector] }]
        : [{ kind: "annotation_registered", refs: [selector, setArtifactSelector, receiptArtifactSelector] }],
      nextSelectors: [`show:${selector}`, `show:${setArtifactSelector}`, "list:annotations"],
    });
    return success("submit", data, {
      stdout: `${context.dryRun ? "Would submit" : plan.status === "already_submitted" ? "Already submitted" : "Submitted"} ${selector}.\n`,
    });
  } catch (error) {
    if (error instanceof CliError) throw error;
    if (error instanceof AnnotationLifecycleError) {
      throw actionCliError("submit_annotation", error.code, error.message, error.kind, error.details);
    }
    if ((error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT") {
      throw new CliError("annotation_write_conflict", error instanceof Error ? error.message : String(error), 3);
    }
    if (isFileSystemError(error)) throw error;
    throw new CliError("internal_error", error instanceof Error ? error.message : String(error), 4);
  }
}

async function handlePatchSubmit(selector: string, options: SubmitOptions, context: CommandContext): Promise<CommandResult> {
  if (options.expectedPlanSha256 !== undefined && !isSha256(options.expectedPlanSha256)) throw new CliError("invalid_expected_plan_sha256", "--expected-plan-sha256 must be 64 lowercase hexadecimal characters.", 2);
  const actor = SubmitActorSchema.safeParse({ kind: options.actorKind, name: options.actorName });
  if (!actor.success) throw new CliError("invalid_patch_input", "Patch actor is invalid.", 2, undefined, actor.error.issues);
  const workspace = await requireWorkspace(context);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  if (!options.input) throw new CliError("invalid_patch_input", "--input is required for patch submission.", 2);
  let payload: unknown;
  try { payload = JSON.parse(await readFile(path.resolve(context.cwd, options.input), "utf8")) as unknown; }
  catch (error) { throw new CliError("invalid_patch_input", `Cannot read patch input: ${error instanceof Error ? error.message : String(error)}`, 2); }
  try {
    const plan = await planPatchSubmit({ snapshot, selector, payload, actor: actor.data, expectedPlanSha256: options.expectedPlanSha256 });
    if (plan.status !== "already_submitted") await assertActionBasis(snapshot, selector, options.expectedActionBasisSha256);
    if (!context.dryRun) await executePatchPlan(plan);
    const outcome = context.dryRun ? plan.status : plan.status === "already_submitted" ? "already_submitted" : "submitted";
    const data = compactTransactionResult({
      command: "submit",
      selector,
      outcome,
      dryRun: context.dryRun,
      identity: context.dryRun
        ? { kind: "plan", selector, plan_sha256: plan.plan_sha256 }
        : { kind: "receipt", selector, sha256: plan.receipt_sha256, plan_sha256: plan.plan_sha256 },
      effects: plan.status === "already_submitted"
        ? [{ kind: "no_change", refs: [selector] }]
        : [{ kind: "patch_submitted", refs: [selector] }],
      nextSelectors: [`show:${selector}`, `instructions:${selector}`, "list:case-actions"],
    });
    return success("submit", data, { stdout: `${context.dryRun ? "Would submit" : plan.status === "already_submitted" ? "Already submitted" : "Submitted"} ${selector}.\n` });
  } catch (error) {
    if (error instanceof CliError) throw error;
    if (error instanceof PatchLifecycleError) throw actionCliError("submit_patch", error.code, error.message, error.kind, error.details, payload);
    if ((error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT") throw new CliError("patch_write_conflict", error instanceof Error ? error.message : String(error), 3);
    if (isFileSystemError(error)) throw error;
    throw new CliError("internal_error", error instanceof Error ? error.message : String(error), 4);
  }
}

async function handleObligationSubmit(selector: string, options: SubmitOptions, context: CommandContext): Promise<CommandResult> {
  if (options.expectedPlanSha256 !== undefined && !isSha256(options.expectedPlanSha256)) throw new CliError("invalid_expected_plan_sha256", "--expected-plan-sha256 must be 64 lowercase hexadecimal characters.", 2);
  const actor = SubmitActorSchema.safeParse({ kind: options.actorKind, name: options.actorName });
  if (!actor.success) throw new CliError("invalid_obligation_input", "Adaptive obligation actor is invalid.", 2, undefined, actor.error.issues);
  const workspace = await requireWorkspace(context);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  if (!options.input) throw new CliError("invalid_obligation_input", "--input is required for obligation submission.", 2);
  if (snapshot.runtimeMode !== "adaptive") throw new CliError("adaptive_runtime_unavailable", "Obligation selectors require an adaptive workspace.", 1);
  let payload: unknown;
  try { payload = JSON.parse(await readFile(path.resolve(context.cwd, options.input), "utf8")) as unknown; }
  catch (error) { throw new CliError("invalid_obligation_input", `Cannot read obligation input: ${error instanceof Error ? error.message : String(error)}`, 2); }
  try {
    const plan = await planAdaptiveObligationSubmit({ snapshot, selector, payload, actor: actor.data, expectedPlanSha256: options.expectedPlanSha256 });
    if (plan.status !== "already_applied") await assertActionBasis(snapshot, selector, options.expectedActionBasisSha256);
    if (!context.dryRun) await executeAdaptivePlan(plan);
    return adaptiveTransactionResult("submit", plan, context);
  } catch (error) {
    throw adaptiveCliError(error, "submit_obligation", payload);
  }
}

async function handleGateSubmit(selector: string, options: SubmitOptions, context: CommandContext): Promise<CommandResult> {
  if (options.expectedPlanSha256 !== undefined && !isSha256(options.expectedPlanSha256)) throw new CliError("invalid_expected_plan_sha256", "--expected-plan-sha256 must be 64 lowercase hexadecimal characters.", 2);
  const actor = RuntimeActorSchema.safeParse({ kind: options.actorKind, name: options.actorName });
  if (!actor.success || actor.data.kind !== "validator" || !options.confirmedBy?.trim()) throw new CliError("invalid_gate_input", "Gate submit requires a validator actor and --confirmed-by human identity.", 2, undefined, actor.success ? undefined : actor.error.issues);
  const workspace = await requireWorkspace(context);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  if (!options.input) throw new CliError("invalid_gate_input", "--input is required for Gate submission.", 2);
  let payload: unknown;
  try { payload = JSON.parse(await readFile(path.resolve(context.cwd, options.input), "utf8")) as unknown; }
  catch (error) { throw new CliError("invalid_gate_input", `Cannot read Gate input: ${error instanceof Error ? error.message : String(error)}`, 2); }
  try {
    if (snapshot.runtimeMode === "adaptive") {
      const plan = await planAdaptiveGate({ snapshot, selector, payload, actor: actor.data, confirmedBy: options.confirmedBy, expectedPlanSha256: options.expectedPlanSha256 });
      await authorizePlanBoundExecution({
        snapshot,
        selector,
        planSha256: plan.plan_sha256,
        expectedActionBasisSha256: options.expectedActionBasisSha256,
        expectedPlanSha256: options.expectedPlanSha256,
        context,
        action: "Gate submit",
        alreadyApplied: plan.status === "already_applied",
      });
      if (!context.dryRun) await executeAdaptivePlan(plan);
      return adaptiveTransactionResult("submit", plan, context);
    }
    const plan = await planGateSubmit({ snapshot, selector, payload, actor: actor.data, confirmedBy: options.confirmedBy, expectedPlanSha256: options.expectedPlanSha256 });
    await authorizePlanBoundExecution({
      snapshot,
      selector,
      planSha256: plan.plan_sha256,
      expectedActionBasisSha256: options.expectedActionBasisSha256,
      expectedPlanSha256: options.expectedPlanSha256,
      context,
      action: "Gate submit",
      alreadyApplied: plan.status === "already_submitted",
    });
    const outcome = context.dryRun ? undefined : await executeGateSubmit(plan, workspace);
    const status = context.dryRun ? plan.status : outcome?.status ?? plan.status;
    const eventSelector = `gate-event:${String(plan.event.event_id)}`;
    const data = compactTransactionResult({
      command: "submit",
      selector,
      outcome: status,
      dryRun: context.dryRun,
      identity: context.dryRun
        ? { kind: "plan", selector, plan_sha256: plan.plan_sha256 }
        : { kind: "receipt", selector: eventSelector, sha256: String(record(plan.event.receipt).sha256), plan_sha256: plan.plan_sha256 },
      effects: status === "already_submitted"
        ? [{ kind: "no_change", refs: [eventSelector] }]
        : [{ kind: "gate_recorded", refs: [selector, eventSelector] }],
      nextSelectors: [`show:${eventSelector}`, `instructions:${selector}`],
    });
    return success("submit", data, { stdout: `${context.dryRun ? "Would submit" : status === "already_submitted" ? "Already submitted" : "Submitted"} ${selector}.\n` });
  } catch (error) {
    if (error instanceof AdaptiveCaseError) throw adaptiveCliError(error, "submit_gate", payload);
    throw gateTransitionCliError(error, "submit_gate", payload);
  }
}

export async function handleAdvance(selector: string, options: AdvanceOptions, context: CommandContext): Promise<CommandResult> {
  if (!TransitionSelectorSchema.safeParse(selector).success && !CompletionSelectorSchema.safeParse(selector).success && !PatchSelectorSchema.safeParse(selector).success) throw new CliError("invalid_transition_selector", `Invalid transition selector: ${selector}`, 2, "Use transition:<instance>/<node>, completion:<instance>/<criterion>, or patch:<id>.");
  if (options.expectedPlanSha256 !== undefined && !isSha256(options.expectedPlanSha256)) throw new CliError("invalid_expected_plan_sha256", "--expected-plan-sha256 must be 64 lowercase hexadecimal characters.", 2);
  const actor = RuntimeActorSchema.safeParse({ kind: options.actorKind, name: options.actorName });
  if (!actor.success || !["agent", "script"].includes(actor.data.kind)) throw new CliError("invalid_advance_input", "Advance actor must be an agent or script.", 2, undefined, actor.success ? undefined : actor.error.issues);
  const workspace = await requireWorkspace(context);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  try {
    if (PatchSelectorSchema.safeParse(selector).success) {
      const plan = await planPatchAdvance({ snapshot, selector, actor: actor.data, expectedPlanSha256: options.expectedPlanSha256 });
      await authorizePlanBoundExecution({
        snapshot,
        selector,
        planSha256: plan.plan_sha256,
        expectedActionBasisSha256: options.expectedActionBasisSha256,
        expectedPlanSha256: options.expectedPlanSha256,
        context,
        action: "Patch advance",
        alreadyApplied: plan.status.startsWith("already_"),
      });
      if (!context.dryRun) await executePatchPlan(plan);
      const effects: CompactTransactionEffect[] = plan.status === "already_applied" || plan.status === "already_stale"
        ? [{ kind: "no_change", refs: [selector] }]
        : plan.status === "would_mark_stale"
          ? [{ kind: "patch_marked_stale", refs: [selector] }]
          : [{
            kind: "patch_applied",
            refs: [
              selector,
              ...(plan.revised_artifact_id ? [`artifact:${plan.revised_artifact_id}`] : []),
              ...(plan.apply_report_artifact_id ? [`artifact:${plan.apply_report_artifact_id}`] : []),
              ...(plan.annotation_resolution_report_artifact_id ? [`artifact:${plan.annotation_resolution_report_artifact_id}`] : []),
            ],
          }];
      const data = compactTransactionResult({
        command: "advance",
        selector,
        outcome: context.dryRun ? plan.status : plan.status === "would_apply" ? "applied" : plan.status === "would_mark_stale" ? "stale" : plan.status,
        dryRun: context.dryRun,
        identity: context.dryRun
          ? { kind: "plan", selector, plan_sha256: plan.plan_sha256 }
          : plan.receipt_sha256
            ? { kind: "receipt", selector, sha256: plan.receipt_sha256, plan_sha256: plan.plan_sha256 }
            : { kind: "plan", selector, plan_sha256: plan.plan_sha256 },
        effects,
        nextSelectors: [`show:${selector}`, `instructions:${selector}`, "list:case-actions"],
      });
      return success("advance", data, { stdout: `${context.dryRun ? "Would advance" : plan.status === "would_mark_stale" ? "Marked stale" : plan.status.startsWith("already_") ? "Already resolved" : "Advanced"} ${selector}.\n` });
    }
    if (snapshot.runtimeMode === "adaptive") {
      if (!CompletionSelectorSchema.safeParse(selector).success) throw new CliError("invalid_completion_selector", "Adaptive Advance requires a completion selector.", 2);
      const plan = await planAdaptiveCompletion({ snapshot, selector, actor: actor.data, expectedPlanSha256: options.expectedPlanSha256 });
      if (plan.status !== "already_applied") await assertActionBasis(snapshot, selector, options.expectedActionBasisSha256);
      if (!context.dryRun) await executeAdaptivePlan(plan);
      return adaptiveTransactionResult("advance", plan, context);
    }
    const plan = await planTransitionAdvance({ snapshot, selector, actor: actor.data, expectedPlanSha256: options.expectedPlanSha256 });
    if (plan.status !== "already_advanced") await assertActionBasis(snapshot, selector, options.expectedActionBasisSha256);
    const outcome = context.dryRun ? undefined : await executeTransitionAdvance(plan, workspace);
    const status = context.dryRun ? plan.status : outcome?.status ?? plan.status;
    const effects: CompactTransactionEffect[] = status === "already_advanced"
      ? [{ kind: "no_change", refs: [selector] }]
      : plan.effects.map((effect): CompactTransactionEffect => effect.kind === "activate_stage"
        ? { kind: "stage_activated", refs: [`stage:${effect.stage_id}`] }
        : effect.kind === "complete_subflow"
          ? { kind: "subflow_completed", refs: [`subflow:${plan.receipt.subflow_instance_id}`] }
          : { kind: "run_completed", refs: [`run:${snapshot.runState?.run_id ?? "current"}`] });
    const data = compactTransactionResult({
      command: "advance",
      selector,
      outcome: status,
      dryRun: context.dryRun,
      identity: { kind: "plan", selector, plan_sha256: plan.plan_sha256 },
      effects,
      nextSelectors: [`instructions:${selector}`, `show:subflow:${plan.receipt.subflow_instance_id}`],
    });
    return success("advance", data, { stdout: `${context.dryRun ? "Would advance" : status === "already_advanced" ? "Already advanced" : "Advanced"} ${selector}.\n` });
  } catch (error) {
    if (error instanceof AdaptiveCaseError) throw adaptiveCliError(error, "advance_completion");
    if (error instanceof PatchLifecycleError) throw actionCliError("advance_patch", error.code, error.message, error.kind, error.details);
    throw gateTransitionCliError(error, "advance");
  }
}

function gateTransitionCliError(error: unknown, key: "submit_gate" | "advance", validationInput?: unknown): CliError {
  if (error instanceof CliError) return error;
  if (error instanceof GateTransitionError) return actionCliError(key, error.code, error.message, error.kind, error.details, validationInput);
  if ((error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT") return new CliError("runtime_write_conflict", error instanceof Error ? error.message : String(error), 3);
  if (isFileSystemError(error)) throw error;
  return new CliError("internal_error", error instanceof Error ? error.message : String(error), 4);
}

export async function handleCheck(target: string | undefined, strict: boolean, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireWorkspace(context);
  const validTargets = ["all", "contracts", "runtime", "artifacts", "tools", "plugins", "literature-adapters"];
  const resolvedTarget = target ?? "all";
  if (!validTargets.includes(resolvedTarget)) throw new CliError("invalid_check_target", `Unknown check target: ${resolvedTarget}`, 2);
  const data = await runWorkspaceChecks(workspace, resolvedTarget as CheckTarget, strict);
  const human = data.ok
    ? { stdout: `ResearchSpec check passed: ${workspace}\n` }
    : { stderr: `ResearchSpec check failed: ${workspace}\n${data.diagnostics.map((item) => `- [${item.code}] ${item.path ?? ""} ${item.message}`).join("\n")}\n` };
  return { command: "check", ok: data.ok, exitCode: data.ok ? 0 : 1, data, diagnostics: data.diagnostics, human };
}

export async function handleDoctor(options: DoctorOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireWorkspace(context);
  if (!options.repair) {
    if (options.expectedPlanSha256) throw new CliError("invalid_doctor_input", "--expected-plan-sha256 requires --repair.", 2);
    const diagnosis = await diagnoseRuntime(workspace);
    const human = diagnosis.report.healthy
      ? { stdout: `ResearchSpec Doctor found no runtime damage: ${workspace}\n` }
      : { stderr: `ResearchSpec Doctor found ${String(diagnosis.report.findings.length)} recovery finding(s): ${workspace}\n${diagnosis.report.findings.map((item) => `- [${item.disposition}] ${item.code} (${item.finding_id})`).join("\n")}\n` };
    return { ...success("doctor", diagnosis.report, human), ok: diagnosis.report.healthy, exitCode: diagnosis.report.healthy ? 0 : 1 };
  }
  if (options.expectedPlanSha256 !== undefined && !isSha256(options.expectedPlanSha256)) {
    throw new CliError("invalid_expected_plan_sha256", "--expected-plan-sha256 must be 64 lowercase hexadecimal characters.", 2);
  }
  try {
    const prepared = await prepareDoctorRepair(workspace, options.repair);
    if (context.dryRun) {
      return success("doctor", prepared.plan, { stdout: `Doctor repair plan ${prepared.plan.plan_sha256} is available for ${options.repair}.\n` });
    }
    if (!context.interactive && (!context.yes || !options.expectedPlanSha256)) {
      throw new CliError("confirmation_required", "Non-interactive Doctor repair requires --expected-plan-sha256 and --yes.", 2, "Preview the current finding with --repair <finding-id> --dry-run --json.");
    }
    if (options.expectedPlanSha256 && options.expectedPlanSha256 !== prepared.plan.plan_sha256) {
      throw new CliError("doctor_plan_stale", "Doctor repair plan differs from the approved preview.", 3, "Run Doctor again and approve the new plan.", { expected: options.expectedPlanSha256, actual: prepared.plan.plan_sha256 });
    }
    if (!context.yes) {
      const approved = await confirm({
        message: `Apply Doctor repair ${prepared.plan.plan_sha256} for ${options.repair}? Original bytes will be retained in the workspace recovery area.`,
        default: false,
      });
      if (!approved) throw new CliError("cancelled", "Doctor repair cancelled.", 1);
    }
    const execution = await executeDoctorRepair(prepared);
    const data = compactTransactionResult({
      command: "doctor",
      selector: `repair:${options.repair}`,
      outcome: "repaired",
      dryRun: false,
      identity: {
        kind: "receipt",
        selector: `repair:${options.repair}`,
        sha256: execution.receiptSha256,
        plan_sha256: prepared.plan.plan_sha256,
      },
      effects: [{ kind: "runtime_repaired", refs: prepared.finding.affected_paths.slice(0, 20) }],
      nextSelectors: ["doctor", "check:runtime"],
    });
    const diagnostics: Diagnostic[] = execution.postCheckOk ? [] : [{
      severity: "warning",
      code: "doctor_postcheck_has_remaining_diagnostics",
      message: "The selected repair committed, but other runtime diagnostics remain.",
      path: workspace,
      blocking: false,
      details: { remaining_finding_ids: execution.remainingFindings.map((item) => item.finding_id) },
    }];
    return success("doctor", data, { stdout: `Repaired ${options.repair}; receipt: ${execution.receiptPath}\n` }, diagnostics);
  } catch (error) {
    if (error instanceof CliError) throw error;
    if (error instanceof DoctorRecoveryError) {
      const exitCode = error.code === "repair_conflict" ? 3 : error.code === "repair_postcheck_failed" ? 4 : 1;
      throw new CliError(`doctor_${error.code}`, error.message, exitCode, error.code === "repair_conflict" ? "Run Doctor again and approve the new plan." : undefined);
    }
    throw error;
  }
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
  const owned = existingInstallations.filter((item) => isDomainSkillInstallation(item) && !desiredSkillIds.has(item.source.skill_id));
  const drift: Array<{ path: string; vendor_id?: string; skill_id?: string }> = [];
  const operations: PlannedWrite[] = [];
  for (const installation of owned) {
    const target = installation.target.scope === "shared-global" ? installation.target.path : path.resolve(path.dirname(workspace), installation.target.path);
    const bytes = await readBytes(target);
    if (bytes === undefined) continue;
    if (sha256(bytes) !== installation.sha256) {
      drift.push({ path: target, vendor_id: installation.source.kind === "domain-skill" ? installation.source.vendor_id : undefined, skill_id: managedSkillId(installation) });
      continue;
    }
    operations.push({ action: "remove-owned", path: target, relativePath: installation.target.path, scope: installation.target.scope, ownership: "generated", previousHash: installation.sha256, reason: `remove domain Skill ${managedSkillId(installation) ?? "unknown"}` });
  }
  if (drift.length) throw new CliError("plugin_uninstall_drift", "Plugin uninstall is blocked because manifest-owned files were modified.", 1, "Restore the recorded plugin files or preserve them and keep the plugin selected.", { drift });

  const configText = stringify({ ...snapshot.config, plugins: { ...record(snapshot.config.plugins), selected } });
  operations.push(await authoritativeWrite(path.join(workspace, "config.yaml"), "config.yaml", configText, "workspace", "update selected plugin intent"));
  const removalKeys = new Set(owned.map(installationKey));
  const retained = existingInstallations.filter((item) => !removalKeys.has(installationKey(item)));
  const manifestText = pluginManifestText(retained, pluginRegistry, selected, snapshot.manifest, literatureAdapterResolutions(snapshot.manifest.literature_adapter_resolutions));
  operations.push(await authoritativeWrite(path.join(workspace, "tool-installation-manifest.json"), "tool-installation-manifest.json", manifestText, "workspace", "commit generated ownership last"));
  if (!context.dryRun && context.interactive && !context.yes) {
    const approved = await confirm({ message: `Uninstall ${requested.join(", ")} and remove ${String(operations.filter((item) => item.action === "remove-owned").length)} clean owned files?`, default: false });
    if (!approved) throw new CliError("cancelled", "Plugin uninstall cancelled.", 1);
  }
  if (!context.dryRun) await executeWritePlan({ operations });
  return success("plugin", { action: "uninstall", workspace, domain_ids: requested, selected_domains: selected, resolved_skills: [...desiredSkillIds].sort(), dry_run: context.dryRun, plan: summarizePlan(operations) }, { stdout: formatPlan(context.dryRun ? "ResearchSpec plugin uninstall dry run" : "ResearchSpec domain plugins uninstalled", workspace, operations, context.dryRun) });
}

export async function handleList(type: string | undefined, options: ListOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireWorkspace(context);
  const allowed = ["changes", "artifacts", "annotations", "gates", "decisions", "tools", "actions", "history", "case-actions", "diagnostics"];
  const listType = type ?? "changes";
  if (!allowed.includes(listType)) throw new CliError("invalid_list_type", `Unknown list type: ${listType}`, 2);
  const limit = options.limit === undefined ? undefined : Number(options.limit);
  try {
    const page = await listItemsPage(await loadWorkspaceSnapshot(workspace), listType as ListType, { ...(limit === undefined ? {} : { limit }), ...(options.cursor ? { cursor: options.cursor } : {}) });
    return success("list", page, { stdout: page.items.length ? `${page.items.map((item) => text(record(item).selector)).join("\n")}\n` : `No ${listType}.\n` });
  } catch (error) {
    if (error instanceof RuntimeQueryError) throw new CliError(error.code, error.message, error.code === "page_cursor_stale" ? 3 : 2);
    throw error;
  }
}

export async function handleShow(selector: string, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireWorkspace(context);
  const result = await showRuntimeDetail(await loadWorkspaceSnapshot(workspace), selector);
  if (!result.item) {
    if (result.candidates.length) throw new CliError("item_ambiguous", `Item selector is ambiguous: ${selector}`, 2, undefined, { candidates: result.candidates.map((item) => item.selector) });
    throw new CliError("item_not_found", `Item not found: ${selector}`, 1);
  }
  const value = "value" in record(result.item) ? record(result.item).value : result.item;
  return success("show", result.item, { stdout: `${JSON.stringify(value, null, 2)}\n` });
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
    const selector = `change:${changeId}`;
    await assertActionBasis(snapshot, selector, options.expectedActionBasisSha256);
    const proposal = await planContractChangeProposal({ snapshot, changeId, payload, actorKind: options.actorKind, actorName: options.actorName });
    const planSha256 = sha256(`${JSON.stringify({
      selector,
      actor: { kind: options.actorKind, name: options.actorName.trim() },
      proposal: {
        title: proposal.patch.title,
        rationale: proposal.patch.rationale,
        risk_level: proposal.patch.risk_level,
        impact: proposal.patch.impact,
        obligation_scope: proposal.patch.obligation_scope,
        patches: proposal.patch.patches,
      },
      target_hashes: proposal.patch.validation.target_hashes,
    })}\n`);
    if (options.expectedPlanSha256 && options.expectedPlanSha256 !== planSha256) throw new CliError("proposal_plan_stale", "Proposal plan no longer matches the approved preview.", 3, undefined, { expected: options.expectedPlanSha256, actual: planSha256 });
    if (!context.dryRun) {
      await assertProposalBasisCurrent(workspace, proposal.patch);
      await executeWritePlan({ operations: proposal.operations });
    }
    const data = compactTransactionResult({
      command: "propose",
      selector,
      outcome: proposal.patch.status,
      dryRun: context.dryRun,
      identity: context.dryRun
        ? { kind: "plan", selector, plan_sha256: planSha256 }
        : { kind: "change", selector, plan_sha256: planSha256 },
      effects: [{ kind: "change_proposed", refs: [selector] }],
      nextSelectors: [`show:${selector}`, `instructions:${selector}`, "list:case-actions"],
    });
    return success("propose", data, { stdout: `${context.dryRun ? "Would create" : "Created"} pending contract change change:${changeId}.\n` });
  } catch (error) {
    if (error instanceof CliError) throw error;
    if (error instanceof ContractChangeError) {
      throw actionCliError("propose", error.code, error.message, error.kind, error.details, payload);
    }
    if (isFileSystemError(error)) throw error;
    throw new CliError("proposal_blocked", error instanceof Error ? error.message : String(error), 1);
  }
}

export async function handleDecide(selector: string | undefined, options: DecideOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireWorkspace(context);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  if (!selector) {
    const page = await listItemsPage(snapshot, "case-actions");
    return success("decide", page, { stdout: page.items.length ? `${page.items.map((item) => text(record(item).selector)).join("\n")}\n` : "No pending items.\n" });
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
    await assertPlanBoundActionAvailable(snapshot, selector, options.expectedActionBasisSha256);
    if (snapshot.runtimeMode === "adaptive" && CaseActionSelectorSchema.safeParse(selector).success) {
      const plan = await planAdaptiveResolutionDecision({ snapshot, selector, decision, actorName, reason, expectedPlanSha256: options.expectedPlanSha256 });
      await authorizePlanBoundExecution({
        snapshot,
        selector,
        planSha256: plan.plan_sha256,
        expectedActionBasisSha256: options.expectedActionBasisSha256,
        expectedPlanSha256: options.expectedPlanSha256,
        context,
        action: "Decision",
        alreadyApplied: plan.status === "already_applied",
      });
      if (!context.dryRun) await executeAdaptivePlan(plan);
      return adaptiveTransactionResult("decide", plan, context);
    }
    const preview = await decideItem({ snapshot, selector, decision, actorName, reason, dryRun: true });
    await authorizePlanBoundExecution({
      snapshot,
      selector,
      planSha256: preview.plan_sha256,
      expectedActionBasisSha256: options.expectedActionBasisSha256,
      expectedPlanSha256: options.expectedPlanSha256,
      context,
      action: "Decision",
      alreadyApplied: preview.status.startsWith("already_"),
    });
    const outcome = context.dryRun
      ? preview
      : await decideItem({ snapshot, selector, decision, actorName, reason, dryRun: false, expectedPlanSha256: options.expectedPlanSha256 });
    const data = compactTransactionResult({
      command: "decide",
      selector,
      outcome: outcome.status,
      dryRun: context.dryRun,
      identity: context.dryRun
        ? { kind: "plan", selector, plan_sha256: outcome.plan_sha256 }
        : { kind: "decision", selector: `decision:${outcome.decision_id}`, plan_sha256: outcome.plan_sha256 },
      effects: outcome.effects,
      nextSelectors: outcome.next_selectors,
    });
    return success("decide", data, { stdout: `${context.dryRun ? "Would record" : "Recorded"} ${outcome.status} decision for ${outcome.item}.\n` });
  } catch (error) {
    if (error instanceof AdaptiveCaseError) throw adaptiveCliError(error, "decide", {
      decision,
      actor_name: actorName,
      ...(reason ? { reason } : {}),
    });
    if (error instanceof ContractChangeError) throw new CliError(error.code, error.message, 1, undefined, error.details);
    if (error instanceof LifecycleError) {
      throw actionCliError("decide", error.code, error.message, error.kind, error.details, {
        decision,
        actor_name: actorName,
        ...(reason ? { reason } : {}),
      });
    }
    if (isFileSystemError(error)) throw error;
    throw new CliError("decision_blocked", error instanceof Error ? error.message : String(error), 1);
  }
}

function adaptiveTransactionResult(
  command: "start" | "submit" | "advance" | "decide",
  plan: AdaptiveTransactionPlan,
  context: CommandContext,
): CommandResult {
  const data = compactTransactionResult({
    command,
    selector: plan.selector,
    outcome: plan.status === "already_applied" ? "already_applied" : context.dryRun ? "would_apply" : "applied",
    dryRun: context.dryRun,
    identity: context.dryRun
      ? { kind: "plan", selector: plan.identity_selector, plan_sha256: plan.plan_sha256 }
      : {
        kind: command === "decide" ? "decision" : "receipt",
        selector: plan.identity_selector,
        ...(plan.identity_sha256 ? { sha256: plan.identity_sha256 } : {}),
        plan_sha256: plan.plan_sha256,
      },
    effects: plan.status === "already_applied" ? [{ kind: "no_change", refs: [plan.identity_selector] }] : plan.effects,
    nextSelectors: plan.next_selectors,
  });
  return success(command, data, { stdout: `${context.dryRun ? "Would apply" : plan.status === "already_applied" ? "Already applied" : "Applied"} ${plan.selector}.\n` });
}

function adaptiveCliError(error: unknown, key: "submit_obligation" | "submit_gate" | "advance_completion" | "decide" | "start", validationInput?: unknown): CliError {
  if (error instanceof CliError) return error;
  if (error instanceof AdaptiveCaseError) return actionCliError(key, error.code, error.message, error.kind, error.details, validationInput);
  if ((error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT") return new CliError("runtime_write_conflict", error instanceof Error ? error.message : String(error), 3);
  if (isFileSystemError(error)) throw error;
  return new CliError("internal_error", error instanceof Error ? error.message : String(error), 4);
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
  const delivery = await planWorkspaceDelivery({
    projectRoot,
    toolIds,
    selectedToolIds: toolIds,
    existingInstallations,
    force: context.force,
    pluginRegistry,
    selectedPluginIds: availableSelected,
    reconciledToolIds: toolIds,
    preserveSkillIds: [...resolvedSkillIdsForUnavailable(unavailableSelected, snapshot.manifest)],
  });
  const operations = [...delivery.operations];
  const configText = stringify({ ...snapshot.config, plugins: { ...record(snapshot.config.plugins), selected } });
  operations.push(await authoritativeWrite(path.join(workspace, "config.yaml"), "config.yaml", configText, "workspace", "update selected plugin intent"));
  const manifestText = pluginManifestText(delivery.installations, pluginRegistry, selected, snapshot.manifest, delivery.literatureAdapterResolutions);
  operations.push(await authoritativeWrite(path.join(workspace, "tool-installation-manifest.json"), "tool-installation-manifest.json", manifestText, "workspace", "commit generated ownership last"));
  const diagnostics = [...delivery.diagnostics, ...operationDiagnostics(operations)];
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

function pluginManifestText(
  installations: readonly ManagedInstallation[],
  registry: LoadedPluginRegistry,
  selectedDomainIds: readonly string[],
  previous: Record<string, unknown> | undefined,
  literatureAdapterResolutions: readonly LiteratureAdapterResolution[],
): string {
  const selected = new Set(selectedDomainIds);
  const current = buildResolutionSnapshots(registry, selectedDomainIds);
  const unavailable = resolutionSnapshots(previous?.plugin_resolutions).filter((snapshot) => selected.has(snapshot.domain_id) && !domainIsAvailable(registry.domains.get(snapshot.domain_id)));
  const pluginResolutions = [...current, ...unavailable].sort((left, right) => left.domain_id.localeCompare(right.domain_id));
  return renderToolInstallationManifest({
    package_version: "0.1.0",
    plugin_resolutions: pluginResolutions,
    literature_adapter_resolutions: [...literatureAdapterResolutions],
    installations: [...installations],
  });
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
function text(value: unknown): string { return typeof value === "string" ? value : ""; }
function strings(value: unknown): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []; }

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

async function assertActionBasis(snapshot: Awaited<ReturnType<typeof loadWorkspaceSnapshot>>, selector: string, expected: string | undefined): Promise<void> {
  if (expected !== undefined && !Sha256Schema.safeParse(expected).success) {
    throw new CliError("invalid_expected_action_basis_sha256", "--expected-action-basis-sha256 must be 64 lowercase hexadecimal characters.", 2);
  }
  const evaluated = await evaluateActionAvailability(snapshot, selector);
  if (!evaluated) throw new CliError("action_descriptor_unavailable", `Action descriptor is unavailable: ${selector}`, 1);
  if (evaluated.availability.disposition === "blocked") {
    throw new CliError("action_blocked", `Action is blocked: ${selector}`, 1, `Refresh instructions:${selector}.`, { availability: evaluated.availability });
  }
  if (expected && expected !== evaluated.availability.basis_sha256) {
    throw new CliError("action_basis_stale", `Action descriptor is stale: ${selector}`, 3, `Refresh instructions:${selector}.`, {
      expected,
      actual: evaluated.availability.basis_sha256,
      next_selector: `instructions:${selector}`,
    });
  }
}

function actionCliError(
  key: RuntimeActionKey,
  code: string,
  message: string,
  kind: "usage" | "domain" | "conflict",
  details?: unknown,
  validationInput?: unknown,
): CliError {
  const issues = zodIssues(details);
  return new CliError(
    code,
    message,
    kind === "usage" ? 2 : kind === "conflict" ? 3 : 1,
    undefined,
    issues ? undefined : details,
    issues ? validationViolations(key, issues, validationInput) : undefined,
  );
}

function isFileSystemError(value: unknown): value is NodeJS.ErrnoException { return value instanceof Error && typeof (value as NodeJS.ErrnoException).code === "string"; }
