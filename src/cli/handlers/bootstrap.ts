import { mkdir } from "node:fs/promises";
import path from "node:path";
import { confirm } from "@inquirer/prompts";
import { stringify } from "yaml";

import { installationRecords } from "../../adapters/installations.js";
import { detectTools, orderTools, parseToolExpression, type DeliveryMode } from "../../adapters/tools.js";
import { inspectCurrentWorkspaceFormat } from "../../core/runtime/workspace-index.js";
import { planWorkspaceDelivery } from "../../adapters/workspace-delivery.js";
import { loadCurrentWorkspaceIndex } from "../../core/runtime/workspace-index.js";
import { getWorkspaceEntries, getWorkspaceTemplates, resolveInitTarget } from "../../core/workspace/layout.js";
import { executeWritePlan, planFile, type PlannedWrite } from "../../core/workspace/write-plan.js";
import { assertLiteratureAdapterSelection, LITERATURE_ADAPTER_CATALOG, parseLiteratureAdapterExpression } from "../../literature-adapters/index.js";
import { selectedPluginIds } from "../../plugins/status.js";
import type { LoadedPluginRegistry } from "../../plugins/registry.js";
import { fileExists } from "../../utils/fs.js";
import { searchableMultiSelect, type SearchableChoice } from "../prompts/searchable-multi-select.js";
import { CliError, type CommandContext, type CommandResult } from "../types.js";
import {
  assertPluginsAvailable,
  authoritativeWrite,
  bundledPluginRegistry,
  deliveryResult,
  formatPlan,
  operationDiagnostics,
  nextStepsForTools,
  pluginManifestText,
  previewSummary,
  summarizePlan,
  writableCount,
} from "./plugins.js";
import { requireCurrentWorkspace } from "./shared.js";

export interface CurrentInitOptions { tools?: string; literatureAdapters?: string; delivery?: DeliveryMode }
export interface CurrentUpdateOptions { tools?: string; literatureAdapters?: string; delivery?: DeliveryMode }

interface BootstrapMultiSelectConfig { id: "agent-tools" | "literature-adapters"; message: string; choices: SearchableChoice[]; pageSize?: number }
export interface BootstrapPromptPort { multiSelect(config: BootstrapMultiSelectConfig): Promise<string[]> }

const DEFAULT_BOOTSTRAP_PROMPTS: BootstrapPromptPort = { multiSelect: searchableMultiSelect };

export async function handleCurrentInit(
  inputPath: string | undefined,
  options: CurrentInitOptions,
  context: CommandContext,
  prompts: BootstrapPromptPort = DEFAULT_BOOTSTRAP_PROMPTS,
): Promise<CommandResult> {
  const workspace = context.workspace ? path.resolve(context.cwd, context.workspace) : resolveInitTarget(inputPath, context.cwd);
  if (await fileExists(workspace)) {
    const format = await inspectCurrentWorkspaceFormat(workspace);
    if (format.current) return handleCurrentReinit(workspace, options, context, prompts);
    throw new CliError("unsupported_workspace", `Initialization target is not a current ResearchSpec workspace: ${workspace}`, 1, "Existing files were left unchanged; choose an empty project or inspect the workspace manually.");
  }
  const projectRoot = path.dirname(workspace);
  const pluginRegistry = await bundledPluginRegistry();
  const detected = await detectTools(projectRoot);
  const selected = await selectTools({ configured: [], detected, expression: options.tools, context, mode: "fresh", prompts });
  const selectedLiteratureAdapters = await selectLiteratureAdapters({ configured: [], expression: options.literatureAdapters, context, prompts });
  const configuredPlugins: string[] = [];

  const operations: PlannedWrite[] = [];
  for (const template of getWorkspaceTemplates()) {
    if (["config.yaml", "tool-installation-manifest.json", "profiles/academic-pipeline.yaml", "profiles/review-response.yaml", "profiles/paper-humanizer.yaml"].includes(template.relativePath)) continue;
    operations.push(await planFile({
      path: path.join(workspace, template.relativePath),
      relativePath: template.relativePath,
      content: template.content,
      scope: "workspace",
      ownership: template.overwritePolicy,
      force: context.force,
    }));
  }
  const delivery = await planWorkspaceDelivery({
    projectRoot,
    workspaceRoot: workspace,
    toolIds: selected,
    delivery: options.delivery ?? "skills",
    selectedToolIds: selected,
    reconciledToolIds: selected,
    selectedLiteratureAdapterIds: selectedLiteratureAdapters,
    existingInstallations: [],
    force: context.force,
    pluginRegistry,
    selectedPluginIds: configuredPlugins,
    operation: "init",
    reconcileLegacy: true,
    globalCleanupAuthorized: true,
  });
  operations.push(...delivery.operations);
  operations.push(await authoritativeWrite(
    path.join(workspace, "config.yaml"),
    "config.yaml",
    stringify({ schema_version: "1", agent_tools: { selected, delivery: options.delivery ?? "skills" }, literature_adapters: { selected: selectedLiteratureAdapters }, plugins: { selected: configuredPlugins } }),
    "workspace",
    "record current workspace and selected tool intent",
  ));
  operations.push(await authoritativeWrite(
    path.join(workspace, "tool-installation-manifest.json"),
    "tool-installation-manifest.json",
    pluginManifestText(delivery.installations, pluginRegistry, configuredPlugins, undefined, delivery.literatureAdapterResolutions),
    "workspace",
    "commit generated ownership last",
  ));

  const diagnostics = [...delivery.diagnostics, ...currentOperationDiagnostics(operations)];
  if (!context.dryRun && diagnostics.some((item) => item.blocking)) {
    throw new CliError("static_projection_conflict", "Static projection initialization is blocked by ownership or path conflicts.", 1, "Resolve the reported conflict or use --force only for a manifest-owned drifted projection.", { diagnostics });
  }
  if (!context.dryRun && context.interactive && !context.yes) {
    const approved = await confirm({ message: `${previewSummary(operations, { projectRoot, selectedTools: selected, delivery: options.delivery ?? "skills" })}\nApply these ${String(writableCount(operations))} planned file operations?`, default: true });
    if (!approved) throw new CliError("cancelled", "Initialization cancelled.", 1);
  }
  if (!context.dryRun) {
    for (const entry of getWorkspaceEntries(workspace)) if (entry.kind === "dir") await mkdir(entry.path, { recursive: true });
    await executeWritePlan({ operations });
  }
  return deliveryResult(
    "init",
    { workspace, schema_version: "1", selected_tools: selected, delivery: options.delivery ?? "skills", selected_literature_adapters: selectedLiteratureAdapters, selected_plugins: configuredPlugins, next_steps: nextStepsForTools(selected, options.delivery ?? "skills"), dry_run: context.dryRun, plan: summarizePlan(operations, projectRoot) },
    { stdout: formatPlan(context.dryRun ? "ResearchSpec init dry run" : "ResearchSpec workspace initialized", workspace, operations, context.dryRun, nextStepsForTools(selected, options.delivery ?? "skills")) },
    diagnostics,
  );
}

export async function handleCurrentUpdate(inputPath: string | undefined, options: CurrentUpdateOptions, context: CommandContext, providedPluginRegistry?: LoadedPluginRegistry): Promise<CommandResult> {
  const workspace = await requireCurrentWorkspace(context, inputPath);
  const index = await loadCurrentWorkspaceIndex(workspace);
  const configured = index.config.agent_tools.selected;
  const configuredDelivery = index.config.agent_tools.delivery;
  const configuredLiteratureAdapters = index.config.literature_adapters.selected;
  const pluginRegistry = providedPluginRegistry ?? await bundledPluginRegistry();
  let targetTools = configured;
  let selected = configured;
  if (options.tools !== undefined) {
    try { targetTools = parseToolExpression(options.tools); }
    catch (error) { throw new CliError("invalid_tools", error instanceof Error ? error.message : String(error), 2); }
    selected = options.tools === "none" ? [] : [...new Set([...configured, ...targetTools])];
  }
  let selectedLiteratureAdapters = configuredLiteratureAdapters;
  try {
    if (options.literatureAdapters !== undefined) selectedLiteratureAdapters = parseLiteratureAdapterExpression(options.literatureAdapters);
    else assertLiteratureAdapterSelection(configuredLiteratureAdapters);
  } catch (error) {
    throw new CliError("invalid_literature_adapters", error instanceof Error ? error.message : String(error), 2);
  }
  return reconcileCurrentWorkspace({
    operation: "update",
    workspace,
    index,
    context,
    pluginRegistry,
    targetTools,
    selected,
    reconciledTools: options.tools === undefined ? targetTools : [...new Set([...configured, ...targetTools])],
    deliveryMode: options.delivery ?? configuredDelivery,
    selectedLiteratureAdapters,
  });
}

async function handleCurrentReinit(
  workspace: string,
  options: CurrentInitOptions,
  context: CommandContext,
  prompts: BootstrapPromptPort,
): Promise<CommandResult> {
  const index = await loadCurrentWorkspaceIndex(workspace);
  const configured = index.config.agent_tools.selected;
  const configuredLiteratureAdapters = index.config.literature_adapters.selected;
  const pluginRegistry = await bundledPluginRegistry();
  const detected = await detectTools(index.projectRoot);
  const selected = await selectTools({ configured, detected, expression: options.tools, context, mode: "reconfigure", prompts });
  const selectedLiteratureAdapters = await selectLiteratureAdapters({ configured: configuredLiteratureAdapters, expression: options.literatureAdapters, context, prompts });

  return reconcileCurrentWorkspace({
    operation: "init",
    workspace,
    index,
    context,
    pluginRegistry,
    targetTools: selected,
    selected,
    reconciledTools: [...new Set([...configured, ...selected])],
    deliveryMode: options.delivery ?? index.config.agent_tools.delivery,
    selectedLiteratureAdapters,
  });
}

type CurrentWorkspaceIndex = Awaited<ReturnType<typeof loadCurrentWorkspaceIndex>>;

async function reconcileCurrentWorkspace(input: {
  operation: "init" | "update";
  workspace: string;
  index: CurrentWorkspaceIndex;
  context: CommandContext;
  pluginRegistry: LoadedPluginRegistry;
  targetTools: string[];
  selected: string[];
  reconciledTools: string[];
  deliveryMode: DeliveryMode;
  selectedLiteratureAdapters: string[];
}): Promise<CommandResult> {
  const { operation, workspace, index, context, pluginRegistry, targetTools, selected, reconciledTools, deliveryMode, selectedLiteratureAdapters } = input;
  const projectRoot = index.projectRoot;
  const configured = index.config.agent_tools.selected;
  const configuredDelivery = index.config.agent_tools.delivery;
  const configuredLiteratureAdapters = index.config.literature_adapters.selected;
  const configuredPlugins = selectedPluginIds(index.config);
  assertPluginsAvailable(configuredPlugins, pluginRegistry);
  const existingInstallations = installationRecords(index.manifest.installations);
  const delivery = await planWorkspaceDelivery({
    projectRoot,
    workspaceRoot: workspace,
    toolIds: targetTools,
    delivery: deliveryMode,
    selectedToolIds: selected,
    existingInstallations,
    force: context.force,
    pluginRegistry,
    selectedPluginIds: configuredPlugins,
    operation,
    reconcileLegacy: true,
    globalCleanupAuthorized: operation === "init" || context.force || context.yes || context.interactive,
    reconciledToolIds: reconciledTools,
    selectedLiteratureAdapterIds: selectedLiteratureAdapters,
  });
  const operations = [...delivery.operations];
  if (selected.join("\0") !== configured.join("\0") || selectedLiteratureAdapters.join("\0") !== configuredLiteratureAdapters.join("\0") || deliveryMode !== configuredDelivery) {
    operations.push(await authoritativeWrite(
      path.join(workspace, "config.yaml"),
      "config.yaml",
      stringify({ ...index.config, agent_tools: { ...index.config.agent_tools, selected, delivery: deliveryMode }, literature_adapters: { selected: selectedLiteratureAdapters } }),
      "workspace",
      "update selected tool, delivery, and literature Adapter intent",
    ));
  }
  operations.push(await authoritativeWrite(
    path.join(workspace, "tool-installation-manifest.json"),
    "tool-installation-manifest.json",
    pluginManifestText(delivery.installations, pluginRegistry, configuredPlugins, index.manifest, delivery.literatureAdapterResolutions),
    "workspace",
    "commit generated ownership last",
  ));
  const diagnostics = [...delivery.diagnostics, ...currentOperationDiagnostics(operations)];
  if (!context.dryRun && diagnostics.some((item) => item.blocking)) {
    throw new CliError("static_projection_conflict", `Static projection ${operation === "init" ? "reconfiguration" : "update"} is blocked by ownership or path conflicts.`, 1, "Resolve the reported conflict or use --force only for a manifest-owned drifted projection.", { diagnostics });
  }
  if (!context.dryRun && context.interactive && !context.yes && !context.force && writableCount(operations) > 0) {
    const approved = await confirm({ message: `${previewSummary(operations, { projectRoot, selectedTools: selected, delivery: deliveryMode })}\nApply these ${String(writableCount(operations))} planned file operations?`, default: true });
    if (!approved) throw new CliError("cancelled", `${operation === "init" ? "Reconfiguration" : "Update"} cancelled.`, 1);
  }
  if (!context.dryRun && context.interactive && !context.yes && !context.force) {
    const legacyCleanup = operations.filter((item) => item.scope === "shared-global" && item.action === "remove-owned" && item.reason.includes("legacy Codex prompt"));
    if (legacyCleanup.length && !(await confirm({ message: `Remove ${String(legacyCleanup.length)} allowlisted legacy Codex prompts after Skill replacement?`, default: true }))) {
      const rejected = new Set(legacyCleanup);
      for (let index = operations.length - 1; index >= 0; index -= 1) {
        const operation = operations[index];
        if (operation && rejected.has(operation)) operations.splice(index, 1);
      }
    }
  }
  if (!context.dryRun) await executeWritePlan({ operations });
  return deliveryResult(
    operation,
    { workspace, selected_tools: selected, delivery: deliveryMode, selected_literature_adapters: selectedLiteratureAdapters, selected_plugins: configuredPlugins, next_steps: nextStepsForTools(selected, deliveryMode), dry_run: context.dryRun, plan: summarizePlan(operations, projectRoot) },
    { stdout: formatPlan(context.dryRun ? `ResearchSpec ${operation} dry run` : operation === "init" ? "ResearchSpec workspace reconfigured" : "ResearchSpec static projections updated", workspace, operations, context.dryRun, nextStepsForTools(selected, deliveryMode)) },
    diagnostics,
  );
}

async function selectTools(input: { configured: string[]; detected: string[]; expression?: string; context: CommandContext; mode: "fresh" | "reconfigure"; prompts: BootstrapPromptPort }): Promise<string[]> {
  try {
    if (input.expression !== undefined) return parseToolExpression(input.expression);
    if (input.context.interactive) {
      const ordered = orderTools(input.configured, input.detected);
      const selected = await input.prompts.multiSelect({
        id: "agent-tools",
        message: "Select agent tools",
        choices: ordered.map((tool) => ({ name: tool.name, value: tool.id, configured: input.configured.includes(tool.id), detected: input.detected.includes(tool.id), preSelected: input.configured.includes(tool.id) || (input.mode === "fresh" && input.detected.includes(tool.id)) })),
      });
      return sameSelection(selected, input.configured) ? input.configured : selected;
    }
    if (input.mode === "reconfigure" || input.configured.length) return input.configured;
    if (input.detected.length) return input.detected;
    throw new CliError("tools_required", "No agent tools were selected or detected.", 2, "Pass --tools all, --tools none, or a comma-separated tool list.");
  } catch (error) {
    if (error instanceof CliError) throw error;
    throw new CliError("invalid_tools", error instanceof Error ? error.message : String(error), 2);
  }
}

async function selectLiteratureAdapters(input: { configured: string[]; expression?: string; context: CommandContext; prompts: BootstrapPromptPort }): Promise<string[]> {
  try {
    if (input.expression !== undefined) return parseLiteratureAdapterExpression(input.expression);
    assertLiteratureAdapterSelection(input.configured);
    if (!input.context.interactive) return input.configured;
    const selected = await input.prompts.multiSelect({
      id: "literature-adapters",
      message: "Select optional literature Adapters",
      choices: LITERATURE_ADAPTER_CATALOG.filter((adapter) => adapter.install_policy === "optional").map((adapter) => ({
        name: `${adapter.display.name} (${adapter.adapter_id})`,
        value: adapter.adapter_id,
        description: `${adapter.display.description} Setup: ${adapter.display.setup_url}`,
        configured: input.configured.includes(adapter.adapter_id),
        preSelected: input.configured.includes(adapter.adapter_id),
      })),
    });
    return sameSelection(selected, input.configured) ? input.configured : selected;
  } catch (error) {
    if (error instanceof CliError) throw error;
    throw new CliError("invalid_literature_adapters", error instanceof Error ? error.message : String(error), 2);
  }
}

function sameSelection(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value) => right.includes(value));
}

function currentOperationDiagnostics(operations: readonly PlannedWrite[]) {
  return operationDiagnostics([...operations]).map((item) => item.code === "generated_file_conflict"
    ? { ...item, severity: "error" as const, blocking: true }
    : item);
}
