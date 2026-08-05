import { readFile } from "node:fs/promises";
import path from "node:path";
import { confirm } from "@inquirer/prompts";
import { stringify } from "yaml";

import {
  installationKey,
  installationRecords,
  isDomainSkillInstallation,
  literatureAdapterResolutions,
  managedSkillId,
  renderToolInstallationManifest,
  type LiteratureAdapterResolution,
  type ManagedInstallation,
} from "../../adapters/installations.js";
import { planWorkspaceDelivery } from "../../adapters/workspace-delivery.js";
import { buildPluginSkillInstructions, PluginSkillInstructionsError } from "../../plugins/instructions.js";
import {
  availableDomains,
  domainIsAvailable,
  loadPluginRegistry,
  PluginRegistryError,
  resolveDomainSelection,
  type LoadedPluginRegistry,
} from "../../plugins/registry.js";
import {
  buildResolutionSnapshots,
  pluginCatalogItem,
  pluginCatalogSummaryItem,
  pluginDomainSummaryItem,
  pluginStatusSummary,
  resolutionSnapshots,
  selectedPluginIds,
  unavailablePluginCatalogItem,
} from "../../plugins/status.js";
import { loadCurrentWorkspaceIndex, type CurrentWorkspaceIndex } from "../../core/runtime/workspace-index.js";
import type { Diagnostic } from "../../core/validation/types.js";
import { resolveWorkspace } from "../../core/workspace/discover.js";
import { executeWritePlan, sha256, type PlannedWrite } from "../../core/workspace/write-plan.js";
import { readOptionalText } from "../../utils/fs.js";
import { CliError, success, type CommandContext, type CommandResult } from "../types.js";

export interface PluginListOptions { installed?: boolean; summary?: boolean }
export interface PluginShowOptions { summary?: boolean }
export interface PluginInstallOptions { summary?: boolean }

export async function handlePluginList(
  options: PluginListOptions,
  context: CommandContext,
  providedRegistry?: LoadedPluginRegistry,
): Promise<CommandResult> {
  const pluginRegistry = providedRegistry ?? await bundledPluginRegistry();
  const workspace = await optionalWorkspace(context);
  const snapshot = workspace ? await loadCurrentWorkspaceIndex(workspace) : undefined;
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
    stdout: domains.length
      ? `${domains.map((domain) => `${domain.domain_id}\t${domain.version ?? "unknown"}${domain.installed ? "\tinstalled" : ""}${domain.available ? "" : "\tunavailable"}`).join("\n")}\n`
      : "No domain Skill plugins.\n",
  });
}

export async function handlePluginShow(
  pluginId: string,
  options: PluginShowOptions,
  context: CommandContext,
  providedRegistry?: LoadedPluginRegistry,
): Promise<CommandResult> {
  const pluginRegistry = providedRegistry ?? await bundledPluginRegistry();
  const domain = pluginRegistry.domains.get(pluginId);
  if (!domainIsAvailable(domain)) throw new CliError("plugin_not_found", `Domain plugin not found or unavailable: ${pluginId}`, 1);
  const workspace = await optionalWorkspace(context);
  const snapshot = workspace ? await loadCurrentWorkspaceIndex(workspace) : undefined;
  const selected = snapshot ? selectedPluginIds(snapshot.config) : [];
  const projected = snapshot ? pluginStatusSummary(snapshot.config, snapshot.manifest, pluginRegistry).projected.includes(domain.domain_id) : false;
  const item = options.summary
    ? pluginDomainSummaryItem(domain, pluginRegistry, selected, projected)
    : pluginCatalogItem(domain, pluginRegistry, selected, projected);
  return success("plugin", { action: "show", workspace: workspace ?? null, domain: item }, { stdout: `${JSON.stringify(item, null, 2)}\n` });
}

export async function handlePluginInstall(
  pluginIds: readonly string[],
  options: PluginInstallOptions,
  context: CommandContext,
  providedRegistry?: LoadedPluginRegistry,
): Promise<CommandResult> {
  const requested = normalizePluginIds(pluginIds);
  if (!requested.length) throw new CliError("plugin_ids_required", "At least one plugin ID is required.", 2);
  const pluginRegistry = providedRegistry ?? await bundledPluginRegistry();
  assertPluginsAvailable(requested, pluginRegistry);
  const workspace = await requireWorkspace(context);
  const snapshot = await loadCurrentWorkspaceIndex(workspace);
  const selected = uniqueSorted([...selectedPluginIds(snapshot.config), ...requested]);
  return reconcilePluginSelection("install", workspace, snapshot, selected, context, pluginRegistry, options);
}

export async function handlePluginInstructions(
  skillId: string,
  context: CommandContext,
  providedRegistry?: LoadedPluginRegistry,
): Promise<CommandResult> {
  const pluginRegistry = providedRegistry ?? await bundledPluginRegistry();
  const workspace = await requireWorkspace(context);
  const snapshot = await loadCurrentWorkspaceIndex(workspace);
  try {
    const packet = await buildPluginSkillInstructions(snapshot, pluginRegistry, skillId);
    return success("plugin", { action: "instructions", workspace, ...packet }, { stdout: `${JSON.stringify(packet, null, 2)}\n` });
  } catch (error) {
    if (error instanceof PluginSkillInstructionsError) throw new CliError(error.code, error.message, 1, undefined, error.details);
    throw error;
  }
}

export async function handlePluginUpdate(
  pluginIds: readonly string[],
  context: CommandContext,
  providedRegistry?: LoadedPluginRegistry,
): Promise<CommandResult> {
  const pluginRegistry = providedRegistry ?? await bundledPluginRegistry();
  const workspace = await requireWorkspace(context);
  const snapshot = await loadCurrentWorkspaceIndex(workspace);
  const selected = selectedPluginIds(snapshot.config);
  const requested = pluginIds.length ? normalizePluginIds(pluginIds) : selected;
  const notInstalled = requested.filter((id) => !selected.includes(id));
  if (notInstalled.length) throw new CliError("plugin_not_installed", `Plugin is not installed: ${notInstalled.join(", ")}`, 1);
  assertPluginsAvailable(requested, pluginRegistry);
  if (!requested.length) {
    return success("plugin", { action: "update", workspace, selected_plugins: selected, dry_run: context.dryRun, plan: [] }, {
      stdout: "No installed domain Skill plugins to update.\n",
    });
  }
  return reconcilePluginSelection("update", workspace, snapshot, selected, context, pluginRegistry);
}

export async function handlePluginUninstall(
  pluginIds: readonly string[],
  context: CommandContext,
  providedRegistry?: LoadedPluginRegistry,
): Promise<CommandResult> {
  const requested = normalizePluginIds(pluginIds);
  if (!requested.length) throw new CliError("plugin_ids_required", "At least one plugin ID is required.", 2);
  const workspace = await requireWorkspace(context);
  const snapshot = await loadCurrentWorkspaceIndex(workspace);
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
    const target = installation.target.scope === "shared-global"
      ? installation.target.path
      : path.resolve(path.dirname(workspace), installation.target.path);
    const bytes = await readBytes(target);
    if (bytes === undefined) continue;
    if (sha256(bytes) !== installation.sha256) {
      drift.push({
        path: target,
        vendor_id: installation.source.kind === "domain-skill" ? installation.source.vendor_id : undefined,
        skill_id: managedSkillId(installation),
      });
      continue;
    }
    operations.push({
      action: "remove-owned",
      path: target,
      relativePath: installation.target.path,
      scope: installation.target.scope,
      ownership: "generated",
      previousHash: installation.sha256,
      reason: `remove domain Skill ${managedSkillId(installation) ?? "unknown"}`,
    });
  }
  if (drift.length) {
    throw new CliError(
      "plugin_uninstall_drift",
      "Plugin uninstall is blocked because manifest-owned files were modified.",
      1,
      "Restore the recorded plugin files or preserve them and keep the plugin selected.",
      { drift },
    );
  }

  const configText = stringify({ ...snapshot.config, plugins: { ...record(snapshot.config.plugins), selected } });
  operations.push(await authoritativeWrite(path.join(workspace, "config.yaml"), "config.yaml", configText, "workspace", "update selected plugin intent"));
  const removalKeys = new Set(owned.map(installationKey));
  const retained = existingInstallations.filter((item) => !removalKeys.has(installationKey(item)));
  const manifestText = pluginManifestText(
    retained,
    pluginRegistry,
    selected,
    snapshot.manifest,
    literatureAdapterResolutions(snapshot.manifest.literature_adapter_resolutions),
  );
  operations.push(await authoritativeWrite(
    path.join(workspace, "tool-installation-manifest.json"),
    "tool-installation-manifest.json",
    manifestText,
    "workspace",
    "commit generated ownership last",
  ));
  if (!context.dryRun && context.interactive && !context.yes) {
    const approved = await confirm({
      message: `Uninstall ${requested.join(", ")} and remove ${String(operations.filter((item) => item.action === "remove-owned").length)} clean owned files?`,
      default: false,
    });
    if (!approved) throw new CliError("cancelled", "Plugin uninstall cancelled.", 1);
  }
  if (!context.dryRun) await executeWritePlan({ operations });
  return success("plugin", {
    action: "uninstall",
    workspace,
    domain_ids: requested,
    selected_domains: selected,
    resolved_skills: [...desiredSkillIds].sort(),
    dry_run: context.dryRun,
    plan: summarizePlan(operations),
  }, { stdout: formatPlan(context.dryRun ? "ResearchSpec plugin uninstall dry run" : "ResearchSpec domain plugins uninstalled", workspace, operations, context.dryRun) });
}

async function reconcilePluginSelection(
  action: "install" | "update",
  workspace: string,
  snapshot: CurrentWorkspaceIndex,
  selected: string[],
  context: CommandContext,
  pluginRegistry: LoadedPluginRegistry,
  installOptions: PluginInstallOptions = {},
): Promise<CommandResult> {
  const projectRoot = path.dirname(workspace);
  const toolIds = snapshot.config.agent_tools.selected;
  const existingInstallations = installationRecords(snapshot.manifest.installations);
  const availableSelected = selected.filter((id) => domainIsAvailable(pluginRegistry.domains.get(id)));
  const unavailableSelected = selected.filter((id) => !domainIsAvailable(pluginRegistry.domains.get(id)));
  const delivery = await planWorkspaceDelivery({
    projectRoot,
    workspaceRoot: workspace,
    toolIds,
    selectedToolIds: toolIds,
    selectedLiteratureAdapterIds: snapshot.config.literature_adapters.selected,
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
  operations.push(await authoritativeWrite(
    path.join(workspace, "tool-installation-manifest.json"),
    "tool-installation-manifest.json",
    manifestText,
    "workspace",
    "commit generated ownership last",
  ));
  const diagnostics = [...delivery.diagnostics, ...operationDiagnostics(operations)];
  if (!toolIds.length) {
    diagnostics.push({
      severity: "warning",
      code: "plugin_projection_deferred",
      message: "Plugin selection was saved, but no Agent tool is configured for projection.",
      blocking: false,
      details: { selected_plugins: selected },
    });
  }
  const resolution = resolveDomainSelection(pluginRegistry, availableSelected);
  const domainVersions = availableSelected.map((domainId) => ({
    domain_id: domainId,
    version: pluginRegistry.domains.get(domainId)?.version ?? null,
  }));
  const plan = summarizePlan(operations);
  if (action === "install" && !context.dryRun && !context.interactive && !context.yes) {
    throw new CliError(
      "confirmation_required",
      "Non-interactive plugin install requires exact domain IDs and --yes.",
      2,
      "Preview the same plugin IDs with --dry-run --summary --json, obtain separate plugin consent, then repeat with --yes.",
    );
  }
  if (!context.dryRun && context.interactive && !context.yes) {
    const approved = await confirm({
      message: `${previewSummary(operations)}\n${action === "install" ? "Install" : "Update"} domain Skill plugins for ${String(toolIds.length)} configured tool(s)?`,
      default: true,
    });
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
    dry_run: context.dryRun,
    plan: installOptions.summary ? summarizePluginOperations(plan) : plan,
  }, { stdout: formatPlan(context.dryRun ? `ResearchSpec plugin ${action} dry run` : `ResearchSpec domain plugins ${action === "install" ? "installed" : "updated"}`, workspace, operations, context.dryRun) }, diagnostics);
}

export async function bundledPluginRegistry(): Promise<LoadedPluginRegistry> {
  try {
    return await loadPluginRegistry(undefined, false);
  } catch (error) {
    if (error instanceof PluginRegistryError) {
      throw new CliError("plugin_registry_invalid", "The bundled domain Skill plugin registry is invalid.", 1, undefined, { diagnostics: error.diagnostics });
    }
    throw error;
  }
}

export function assertPluginsAvailable(ids: readonly string[], registry: LoadedPluginRegistry): void {
  const unknown = ids.filter((id) => !domainIsAvailable(registry.domains.get(id)));
  if (unknown.length) {
    throw new CliError(
      "plugin_unavailable",
      `Domain plugin is unavailable in this ResearchSpec package: ${unknown.join(", ")}`,
      1,
      "Unavailable selected domains may still be safely removed with researchspec plugin uninstall.",
      { domain_ids: unknown },
    );
  }
}

export function pluginManifestText(
  installations: readonly ManagedInstallation[],
  registry: LoadedPluginRegistry,
  selectedDomainIds: readonly string[],
  previous: Record<string, unknown> | undefined,
  adapterResolutions: readonly LiteratureAdapterResolution[],
): string {
  const selected = new Set(selectedDomainIds);
  const current = buildResolutionSnapshots(registry, selectedDomainIds);
  const unavailable = resolutionSnapshots(previous?.plugin_resolutions)
    .filter((snapshot) => selected.has(snapshot.domain_id) && !domainIsAvailable(registry.domains.get(snapshot.domain_id)));
  const pluginResolutions = [...current, ...unavailable].sort((left, right) => left.domain_id.localeCompare(right.domain_id));
  return renderToolInstallationManifest({
    package_version: "0.1.0",
    plugin_resolutions: pluginResolutions,
    literature_adapter_resolutions: [...adapterResolutions],
    installations: [...installations],
  });
}

export async function authoritativeWrite(
  target: string,
  relativePath: string,
  content: string | Uint8Array,
  scope: PlannedWrite["scope"],
  reason: string,
): Promise<PlannedWrite> {
  const existing = await readOptionalText(target);
  const nextHash = sha256(content);
  const previousHash = existing === undefined ? undefined : sha256(existing);
  return {
    action: existing === undefined ? "create" : previousHash === nextHash ? "skip-unchanged" : "refresh",
    path: target,
    relativePath,
    content,
    scope,
    ownership: "user",
    ...(previousHash ? { previousHash } : {}),
    nextHash,
    reason,
  };
}

export function summarizePlan(operations: readonly PlannedWrite[]) {
  return operations.map((operation) => ({
    action: operation.action,
    path: operation.path,
    relativePath: operation.relativePath,
    scope: operation.scope,
    ownership: operation.ownership,
    previousHash: operation.previousHash,
    nextHash: operation.nextHash,
    reason: operation.reason,
  }));
}

export function writableCount(operations: readonly PlannedWrite[]): number {
  return operations.filter((item) => item.action === "create" || item.action === "refresh" || item.action === "remove-owned").length;
}

export function formatPlan(title: string, workspace: string, operations: readonly PlannedWrite[], dryRun: boolean): string {
  const labels: Record<PlannedWrite["action"], string> = dryRun
    ? { create: "Would create", refresh: "Would refresh", "remove-owned": "Would remove", move: "Would move", "skip-unchanged": "skip-unchanged", "skip-drift": "skip-drift", conflict: "conflict" }
    : { create: "Created", refresh: "Refreshed", "remove-owned": "Removed", move: "Moved", "skip-unchanged": "skip-unchanged", "skip-drift": "skip-drift", conflict: "conflict" };
  return `${title}\nWorkspace: ${workspace}\n${operations.map((item) => `${labels[item.action]}: ${item.path}`).join("\n")}\n`;
}

export function operationDiagnostics(operations: readonly PlannedWrite[]): Diagnostic[] {
  return operations
    .filter((item) => item.action === "skip-drift" || item.action === "conflict")
    .map((item) => ({
      severity: "warning",
      code: item.action === "skip-drift" ? "generated_file_drift" : "generated_file_conflict",
      message: item.reason,
      path: item.path,
      blocking: false,
    }));
}

export function deliveryResult<T>(
  command: string,
  data: T,
  human: { stdout: string },
  diagnostics: Diagnostic[],
): CommandResult<T> {
  const base = success(command, data, human, diagnostics);
  return diagnostics.some((item) => item.blocking)
    ? { ...base, ok: false, exitCode: 1, error: { code: "tool_delivery_incomplete", message: "One or more selected tools could not be delivered." } }
    : base;
}

export function previewSummary(operations: readonly PlannedWrite[]): string {
  const counts = new Map<string, number>();
  for (const operation of operations) counts.set(operation.action, (counts.get(operation.action) ?? 0) + 1);
  const globals = operations.filter((operation) => operation.scope === "shared-global").map((operation) => operation.path);
  return [
    `Plan: ${[...counts].map(([action, count]) => `${action}=${String(count)}`).join(", ")}`,
    ...(globals.length ? ["Shared-global writes:", ...globals.map((filePath) => `- ${filePath}`)] : []),
  ].join("\n");
}

async function requireWorkspace(context: CommandContext): Promise<string> {
  const resolution = await resolveWorkspace(context.cwd, context.workspace);
  if (resolution.status === "found") return resolution.workspace;
  if (resolution.status === "invalid") throw new CliError("workspace_invalid", `Invalid ResearchSpec workspace: ${resolution.path}`, 1);
  if (resolution.status === "unsupported") throw new CliError("workspace_unsupported", `Unsupported workspace format: ${resolution.path}`, 1, undefined, { reason: resolution.reason });
  throw new CliError("workspace_missing", "No researchspec workspace found.", 1, "Run researchspec init to create one.");
}

async function optionalWorkspace(context: CommandContext): Promise<string | undefined> {
  const resolution = await resolveWorkspace(context.cwd, context.workspace);
  if (resolution.status === "found") return resolution.workspace;
  if (resolution.status === "invalid") throw new CliError("workspace_invalid", `Invalid ResearchSpec workspace: ${resolution.path}`, 1);
  if (resolution.status === "unsupported") throw new CliError("workspace_unsupported", `Unsupported workspace format: ${resolution.path}`, 1, undefined, { reason: resolution.reason });
  return undefined;
}

function resolvedSkillIdsForUnavailable(domainIds: readonly string[], manifest: Record<string, unknown>): Set<string> {
  const unavailable = new Set(domainIds);
  return new Set(resolutionSnapshots(manifest.plugin_resolutions)
    .filter((snapshot) => unavailable.has(snapshot.domain_id))
    .flatMap((snapshot) => snapshot.resolved_skill_ids));
}

function resolvedSkillIdsForSelection(
  registry: LoadedPluginRegistry,
  selectedDomainIds: readonly string[],
  manifest: Record<string, unknown>,
): Set<string> {
  const available = selectedDomainIds.filter((id) => domainIsAvailable(registry.domains.get(id)));
  const unavailable = selectedDomainIds.filter((id) => !domainIsAvailable(registry.domains.get(id)));
  return new Set([
    ...resolveDomainSelection(registry, available).resolvedSkillIds,
    ...resolvedSkillIdsForUnavailable(unavailable, manifest),
  ]);
}

function normalizePluginIds(ids: readonly string[]): string[] {
  return uniqueSorted(ids.map((id) => id.trim()).filter(Boolean));
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
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

async function readBytes(filePath: string): Promise<Uint8Array | undefined> {
  try {
    return await readFile(filePath);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") return undefined;
    throw error;
  }
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
