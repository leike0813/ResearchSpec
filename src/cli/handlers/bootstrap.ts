import { mkdir } from "node:fs/promises";
import path from "node:path";
import { confirm } from "@inquirer/prompts";
import { stringify } from "yaml";

import { installationRecords } from "../../adapters/installations.js";
import { detectTools, orderTools, parseToolExpression } from "../../adapters/tools.js";
import { planWorkspaceDelivery } from "../../adapters/workspace-delivery.js";
import { loadCurrentWorkspaceIndex } from "../../core/runtime/workspace-index.js";
import { getWorkspaceEntries, getWorkspaceTemplates, resolveInitTarget } from "../../core/workspace/layout.js";
import { executeWritePlan, planFile, type PlannedWrite } from "../../core/workspace/write-plan.js";
import { selectedPluginIds } from "../../plugins/status.js";
import type { LoadedPluginRegistry } from "../../plugins/registry.js";
import { fileExists } from "../../utils/fs.js";
import { searchableMultiSelect } from "../prompts/searchable-multi-select.js";
import { CliError, type CommandContext, type CommandResult } from "../types.js";
import {
  assertPluginsAvailable,
  authoritativeWrite,
  bundledPluginRegistry,
  deliveryResult,
  formatPlan,
  operationDiagnostics,
  pluginManifestText,
  previewSummary,
  summarizePlan,
  writableCount,
} from "./plugins.js";
import { requireCurrentWorkspace } from "./shared.js";

export interface CurrentInitOptions { tools?: string }
export interface CurrentUpdateOptions { tools?: string }

export async function handleCurrentInit(inputPath: string | undefined, options: CurrentInitOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = context.workspace ? path.resolve(context.cwd, context.workspace) : resolveInitTarget(inputPath, context.cwd);
  if (await fileExists(workspace)) throw new CliError("workspace_exists", `Initialization target already exists: ${workspace}`, 1, "Use researchspec update for a current workspace or choose an empty project.");
  const projectRoot = path.dirname(workspace);
  const pluginRegistry = await bundledPluginRegistry();
  const detected = await detectTools(projectRoot);
  const selected = await selectTools({ configured: [], detected, expression: options.tools, context, fresh: true });
  const configuredPlugins: string[] = [];

  const operations: PlannedWrite[] = [];
  for (const template of getWorkspaceTemplates()) {
    if (["config.yaml", "tool-installation-manifest.json", "profiles/academic-pipeline.yaml", "profiles/review-response.yaml"].includes(template.relativePath)) continue;
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
    selectedToolIds: selected,
    reconciledToolIds: selected,
    existingInstallations: [],
    force: context.force,
    pluginRegistry,
    selectedPluginIds: configuredPlugins,
  });
  operations.push(...delivery.operations);
  operations.push(await authoritativeWrite(
    path.join(workspace, "config.yaml"),
    "config.yaml",
    stringify({ schema_version: "1", agent_tools: { selected, delivery: "both" }, plugins: { selected: configuredPlugins } }),
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

  if (!context.dryRun && context.interactive && !context.yes) {
    const approved = await confirm({ message: `${previewSummary(operations)}\nApply these ${String(writableCount(operations))} planned file operations?`, default: true });
    if (!approved) throw new CliError("cancelled", "Initialization cancelled.", 1);
  }
  if (!context.dryRun) {
    for (const entry of getWorkspaceEntries(workspace)) if (entry.kind === "dir") await mkdir(entry.path, { recursive: true });
    await executeWritePlan({ operations });
  }
  const diagnostics = [...delivery.diagnostics, ...currentOperationDiagnostics(operations)];
  return deliveryResult(
    "init",
    { workspace, schema_version: "1", selected_tools: selected, selected_plugins: configuredPlugins, dry_run: context.dryRun, plan: summarizePlan(operations) },
    { stdout: formatPlan(context.dryRun ? "ResearchSpec init dry run" : "ResearchSpec workspace initialized", workspace, operations, context.dryRun) },
    diagnostics,
  );
}

export async function handleCurrentUpdate(inputPath: string | undefined, options: CurrentUpdateOptions, context: CommandContext, providedPluginRegistry?: LoadedPluginRegistry): Promise<CommandResult> {
  const workspace = await requireCurrentWorkspace(context, inputPath);
  const index = await loadCurrentWorkspaceIndex(workspace);
  const projectRoot = index.projectRoot;
  const configured = index.config.agent_tools.selected;
  const configuredPlugins = selectedPluginIds(index.config);
  const pluginRegistry = providedPluginRegistry ?? await bundledPluginRegistry();
  assertPluginsAvailable(configuredPlugins, pluginRegistry);
  let targetTools = configured;
  let selected = configured;
  if (options.tools !== undefined) {
    try { targetTools = parseToolExpression(options.tools); }
    catch (error) { throw new CliError("invalid_tools", error instanceof Error ? error.message : String(error), 2); }
    selected = options.tools === "none" ? [] : [...new Set([...configured, ...targetTools])];
  }
  const existingInstallations = installationRecords(index.manifest.installations);
  const delivery = await planWorkspaceDelivery({
    projectRoot,
    workspaceRoot: workspace,
    toolIds: targetTools,
    selectedToolIds: selected,
    existingInstallations,
    force: context.force,
    pluginRegistry,
    selectedPluginIds: configuredPlugins,
    reconciledToolIds: targetTools,
  });
  const operations = [...delivery.operations];
  if (selected.join("\0") !== configured.join("\0")) {
    operations.push(await authoritativeWrite(
      path.join(workspace, "config.yaml"),
      "config.yaml",
      stringify({ ...index.config, agent_tools: { ...index.config.agent_tools, selected } }),
      "workspace",
      "update selected tool intent",
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
    throw new CliError("static_projection_conflict", "Static projection update is blocked by ownership or path conflicts.", 1, "Resolve the reported conflict or use --force only for a manifest-owned drifted projection.", { diagnostics });
  }
  if (!context.dryRun) await executeWritePlan({ operations });
  return deliveryResult(
    "update",
    { workspace, selected_tools: selected, selected_plugins: configuredPlugins, dry_run: context.dryRun, plan: summarizePlan(operations) },
    { stdout: formatPlan(context.dryRun ? "ResearchSpec update dry run" : "ResearchSpec static projections updated", workspace, operations, context.dryRun) },
    diagnostics,
  );
}

async function selectTools(input: { configured: string[]; detected: string[]; expression?: string; context: CommandContext; fresh: boolean }): Promise<string[]> {
  try {
    if (input.expression !== undefined) return parseToolExpression(input.expression);
    if (input.context.interactive) {
      const ordered = orderTools(input.configured, input.detected);
      return await searchableMultiSelect({
        message: "Select agent tools",
        choices: ordered.map((tool) => ({ name: tool.name, value: tool.id, configured: input.configured.includes(tool.id), detected: input.detected.includes(tool.id), preSelected: input.configured.includes(tool.id) || (input.fresh && input.detected.includes(tool.id)) })),
      });
    }
    if (input.configured.length) return input.configured;
    if (input.detected.length) return input.detected;
    throw new CliError("tools_required", "No agent tools were selected or detected.", 2, "Pass --tools all, --tools none, or a comma-separated tool list.");
  } catch (error) {
    if (error instanceof CliError) throw error;
    throw new CliError("invalid_tools", error instanceof Error ? error.message : String(error), 2);
  }
}

function currentOperationDiagnostics(operations: readonly PlannedWrite[]) {
  return operationDiagnostics([...operations]).map((item) => item.code === "generated_file_conflict"
    ? { ...item, severity: "error" as const, blocking: true }
    : item);
}
