import path from "node:path";
import { ExitPromptError } from "@inquirer/core";
import { confirm } from "@inquirer/prompts";
import { stringify } from "yaml";

import { detectTools, orderTools, parseToolExpression, type DeliveryMode } from "../../adapters/tools.js";
import { planWorkspaceDelivery } from "../../adapters/workspace-delivery.js";
import { renderToolInstallationManifest } from "../../adapters/installations.js";
import { GraphWorkspaceConfigSchema } from "../../core/contracts/graph-workspace.js";
import { loadPluginRegistry } from "../../plugins/registry.js";
import { inspectGraphWorkspaceFormat, loadGraphWorkspaceIndex } from "../../core/runtime/graph-workspace-index.js";
import { resolveInitTarget } from "../../core/workspace/layout.js";
import { executeWritePlan, planDirectFileEdit, planFile, type PlannedWrite } from "../../core/workspace/write-plan.js";
import { assertLiteratureAdapterSelection, LITERATURE_ADAPTER_CATALOG, parseLiteratureAdapterExpression } from "../../literature-adapters/index.js";
import { fileExists } from "../../utils/fs.js";
import { loadProcedureCatalog } from "../../procedures/catalog.js";
import { buildSearchDocuments } from "../../procedures/search.js";
import { prepareSemanticSearch, semanticCacheRoot } from "../../procedures/runtime.js";
import type { ProcedureSearchMode } from "../../procedures/search-contracts.js";
import type { Diagnostic } from "../../core/validation/types.js";
import { searchableMultiSelect, type SearchableChoice } from "../prompts/searchable-multi-select.js";
import { CliError, success, type CommandContext, type CommandResult } from "../types.js";

export interface GraphInitOptions { tools?: string; literatureAdapters?: string; delivery?: DeliveryMode; procedureSearch?: string; paperHumanizerGuard?: string }
export interface GraphUpdateOptions { tools?: string; literatureAdapters?: string; delivery?: DeliveryMode; procedureSearch?: string; paperHumanizerGuard?: string }
export interface GraphBootstrapPromptPort {
  multiSelect(config: { id: "agent-tools" | "literature-adapters"; message: string; choices: SearchableChoice[] }): Promise<string[]>;
  confirm(config: { id: "procedure-search"; message: string; default: boolean }): Promise<boolean>;
}

const DEFAULT_BOOTSTRAP_PROMPTS: GraphBootstrapPromptPort = { multiSelect: searchableMultiSelect, confirm };

const PROJECT_SPEC = '---\nschema_version: "2"\nproject_id: project\n---\n\n# Project intent\n\n## Research question\n\n## Scope and boundaries\n\n## Method stance\n\n## Expected contribution\n';

function initialStableSpecs(workspace: string): Array<{ path: string; content: string }> {
  return [
    { path: path.join(workspace, "specs/project.md"), content: PROJECT_SPEC },
    { path: path.join(workspace, "specs/sources.yaml"), content: stringify({ schema_version: "2", sources: [] }) },
    { path: path.join(workspace, "specs/claims.yaml"), content: stringify({ schema_version: "2", claims: [] }) },
    { path: path.join(workspace, "specs/manuscript.yaml"), content: stringify({ schema_version: "2", manuscript_id: "manuscript", output_type: null, working_title: null, language: null, audience: null, venue: null, citation_requirements: [], format_requirements: [], delivery: { working_format: null, final_output_format: null }, outline: [] }) },
  ];
}

async function applyGraphWorkspaceProjection(input: {
  workspace: string;
  tools: string[];
  adapters: string[];
  delivery: DeliveryMode;
  selectedPlugins: string[];
  procedureSearch: ProcedureSearchMode;
  paperHumanizerGuard: PaperHumanizerGuard;
  index?: Awaited<ReturnType<typeof loadGraphWorkspaceIndex>>;
  context: CommandContext;
}): Promise<{ projected: number; operations: PlannedWrite[]; diagnostics: Diagnostic[] }> {
  if (input.index?.manifestStatus === "invalid") throw new CliError("invalid_current_contract", "The installation manifest is invalid; existing files were left unchanged.", 3, undefined, input.index.diagnostics);
  const projectRoot = path.dirname(input.workspace);
  const existingInstallations = input.index?.manifest.installations ?? [];
  const priorTools = input.index?.config.agent_tools.selected ?? [];
  const pluginRegistry = await loadPluginRegistry();
  const deliveryPlan = await planWorkspaceDelivery({
    projectRoot,
    workspaceRoot: input.workspace,
    toolIds: input.tools,
    delivery: input.delivery,
    selectedToolIds: input.tools,
    reconciledToolIds: [...new Set([...priorTools, ...input.tools])],
    selectedLiteratureAdapterIds: input.adapters,
    existingInstallations,
    force: input.context.force,
    pluginRegistry,
    selectedPluginIds: input.selectedPlugins,
    existingPluginResolutions: input.index?.manifest.plugin_resolutions ?? [],
    preserveSkillIds: [],
    operation: input.index ? "update" : "init",
    paperHumanizerGuard: input.paperHumanizerGuard,
  });
  const blocking = deliveryPlan.diagnostics.filter((diagnostic) => diagnostic.blocking);
  if (blocking.length > 0 || deliveryPlan.operations.some((operation) => operation.action === "conflict")) {
    throw new CliError("workspace_projection_conflict", blocking.map((item) => item.message).join("; ") || "Workspace projection contains ownership conflicts.", 3, "Resolve unowned targets or manifest drift before retrying.", deliveryPlan.diagnostics);
  }
  const configContent = stringify(GraphWorkspaceConfigSchema.parse({
    schema_version: "2",
    agent_tools: { selected: input.tools, delivery: input.delivery, paper_humanizer_guard: input.paperHumanizerGuard },
    literature_adapters: { selected: input.adapters },
    plugins: { selected: input.selectedPlugins },
    procedure_search: { mode: input.procedureSearch },
  }));
  const configPath = path.join(input.workspace, "config.yaml");
  const projectOperations: PlannedWrite[] = [input.index
    ? planDirectFileEdit({ boundaryRoot: projectRoot, path: configPath, relativePath: "researchspec/config.yaml", content: configContent, previousContent: input.index.files.get("config.yaml")?.text, scope: "project", reason: "update graph workspace configuration" })
    : await planFile({ boundaryRoot: projectRoot, path: configPath, relativePath: "researchspec/config.yaml", content: configContent, scope: "project", ownership: "user" })];
  if (!input.index) {
    for (const file of initialStableSpecs(input.workspace)) projectOperations.push(await planFile({ boundaryRoot: projectRoot, path: file.path, relativePath: path.relative(projectRoot, file.path).split(path.sep).join("/"), content: file.content, scope: "project", ownership: "user" }));
  }
  const manifestPath = path.join(input.workspace, "tool-installation-manifest.json");
  const manifestContent = renderToolInstallationManifest({
    package_version: "0.1.0",
    plugin_resolutions: deliveryPlan.pluginResolutions,
    literature_adapter_resolutions: deliveryPlan.literatureAdapterResolutions,
    installations: deliveryPlan.installations,
  });
  const manifestOperation = input.index
    ? planDirectFileEdit({ boundaryRoot: projectRoot, path: manifestPath, relativePath: "researchspec/tool-installation-manifest.json", content: manifestContent, previousContent: input.index.files.get("tool-installation-manifest.json")?.text, scope: "project", reason: "commit workspace ownership manifest" })
    : await planFile({ boundaryRoot: projectRoot, path: manifestPath, relativePath: "researchspec/tool-installation-manifest.json", content: manifestContent, scope: "project", ownership: "generated" });
  const operations = [...projectOperations, ...deliveryPlan.operations, manifestOperation];
  if (operations.some((operation) => operation.action === "conflict")) throw new CliError("workspace_projection_conflict", "Workspace files conflict with the projection.", 3);
  if (!input.context.dryRun) await executeWritePlan({ boundaryRoot: projectRoot, operations, ensureDirectories: [input.workspace, path.join(input.workspace, "profiles"), path.join(input.workspace, "specs"), path.join(input.workspace, "runs"), path.join(input.workspace, "changes")] });
  return { projected: deliveryPlan.installations.filter((item) => item.source.kind === "framework-capability").length, operations, diagnostics: deliveryPlan.diagnostics };
}

export async function handleGraphInit(
  inputPath: string | undefined,
  options: GraphInitOptions,
  context: CommandContext,
  prompts: GraphBootstrapPromptPort = DEFAULT_BOOTSTRAP_PROMPTS,
  prepareSearch: typeof prepareSemanticSearch = prepareSemanticSearch,
): Promise<CommandResult> {
  const workspace = context.workspace ? path.resolve(context.cwd, context.workspace) : resolveInitTarget(inputPath, context.cwd);
  if (await fileExists(workspace)) {
    const format = await inspectGraphWorkspaceFormat(workspace);
    if (!format.current) throw new CliError("unsupported_workspace", `Initialization target is not a current schema 2 workspace: ${workspace}`, 1, "Existing files were left unchanged.");
    const index = await loadGraphWorkspaceIndex(workspace);
    return handleGraphReinit(workspace, index, options, context, prompts, prepareSearch);
  }
  const paperHumanizerGuard = resolvePaperHumanizerGuard(options.paperHumanizerGuard, undefined);
  const detected = await detectTools(path.dirname(workspace));
  const tools = await selectTools({ configured: [], detected, expression: options.tools, context, fresh: true, prompts });
  const literatureAdapters = await selectLiteratureAdapters({ configured: [], expression: options.literatureAdapters, context, prompts });
  const delivery = options.delivery ?? "skills";
  const search = await selectProcedureSearch(options.procedureSearch, "offline", context, prompts);
  const applied = await applyGraphWorkspaceProjection({ workspace, tools, adapters: literatureAdapters, delivery, selectedPlugins: [], procedureSearch: search.mode, paperHumanizerGuard, context });
  const searchResult = await prepareSelectedSearch(search, context, prepareSearch);
  return success("init", { workspace, schema_version: "2", dry_run: context.dryRun, selected_tools: tools, delivery, selected_literature_adapters: literatureAdapters, selected_plugins: [], projected_capability_files: applied.projected, paper_humanizer_guard: paperHumanizerGuard, procedure_search: searchResult }, { stdout: `${context.dryRun ? "Would initialize" : "ResearchSpec schema 2 workspace initialized"}: ${workspace}\n`, stderr: bootstrapWarningText(applied.diagnostics, searchResult) }, [...applied.diagnostics, ...preparationDiagnostics(searchResult)]);
}

async function handleGraphReinit(
  workspace: string,
  index: Awaited<ReturnType<typeof loadGraphWorkspaceIndex>>,
  options: GraphInitOptions,
  context: CommandContext,
  prompts: GraphBootstrapPromptPort,
  prepareSearch: typeof prepareSemanticSearch,
): Promise<CommandResult> {
  const configured = index.config.agent_tools.selected;
  const paperHumanizerGuard = resolvePaperHumanizerGuard(options.paperHumanizerGuard, index.config.agent_tools.paper_humanizer_guard);
  const detected = await detectTools(index.projectRoot);
  const tools = await selectTools({ configured, detected, expression: options.tools, context, fresh: false, prompts });
  const literatureAdapters = await selectLiteratureAdapters({ configured: index.config.literature_adapters.selected, expression: options.literatureAdapters, context, prompts });
  const delivery = options.delivery ?? index.config.agent_tools.delivery;
  const search = await selectProcedureSearch(options.procedureSearch, index.config.procedure_search?.mode ?? "offline", context);
  const applied = await applyGraphWorkspaceProjection({ workspace, tools, adapters: literatureAdapters, delivery, selectedPlugins: index.config.plugins.selected, procedureSearch: search.mode, paperHumanizerGuard, index, context });
  const searchResult = await prepareSelectedSearch(search, context, prepareSearch);
  const projected = applied.projected;
  return success("init", { workspace, schema_version: "2", dry_run: context.dryRun, selected_tools: tools, delivery, selected_literature_adapters: literatureAdapters, previous_tools: configured, projected_capability_files: projected, paper_humanizer_guard: paperHumanizerGuard, procedure_search: searchResult }, { stdout: `${context.dryRun ? "Would reconfigure" : "Reconfigured"} schema 2 workspace: ${workspace}\n`, stderr: bootstrapWarningText(applied.diagnostics, searchResult) }, [...applied.diagnostics, ...preparationDiagnostics(searchResult)]);
}

export async function handleGraphUpdate(options: GraphUpdateOptions, context: CommandContext, prepareSearch: typeof prepareSemanticSearch = prepareSemanticSearch): Promise<CommandResult> {
  const explicit = context.workspace ? path.resolve(context.cwd, context.workspace) : undefined;
  const workspace = explicit ?? (await requireGraphWorkspaceForUpdate(context));
  const index = await loadGraphWorkspaceIndex(workspace);
  const configured = index.config.agent_tools.selected;
  const paperHumanizerGuard = resolvePaperHumanizerGuard(options.paperHumanizerGuard, index.config.agent_tools.paper_humanizer_guard);
  const tools = options.tools === undefined ? configured : parseToolExpression(options.tools);
  const adapters = options.literatureAdapters === undefined
    ? index.config.literature_adapters.selected
    : parseLiteratureAdapterExpression(options.literatureAdapters);
  const delivery = options.delivery ?? index.config.agent_tools.delivery;
  const search = await selectProcedureSearch(options.procedureSearch, index.config.procedure_search?.mode ?? "offline", context);
  const applied = await applyGraphWorkspaceProjection({ workspace, tools, adapters, delivery, selectedPlugins: index.config.plugins.selected, procedureSearch: search.mode, paperHumanizerGuard, index, context });
  const searchResult = await prepareSelectedSearch(search, context, prepareSearch);
  const projected = applied.projected;
  return success("update", { workspace, schema_version: "2", dry_run: context.dryRun, selected_tools: tools, delivery, selected_literature_adapters: adapters, projected_capability_files: projected, paper_humanizer_guard: paperHumanizerGuard, procedure_search: searchResult }, { stdout: `${context.dryRun ? "Would update" : "Updated"} schema 2 workspace: ${workspace}\n`, stderr: bootstrapWarningText(applied.diagnostics, searchResult) }, [...applied.diagnostics, ...preparationDiagnostics(searchResult)]);
}

type PaperHumanizerGuard = "on" | "off";

function resolvePaperHumanizerGuard(expression: string | undefined, configured: PaperHumanizerGuard | undefined): PaperHumanizerGuard {
  if (expression === undefined) return configured ?? "on";
  if (expression === "on" || expression === "off") return expression;
  throw new CliError("invalid_paper_humanizer_guard", "--paper-humanizer-guard accepts on or off.", 2);
}

function bootstrapWarningText(diagnostics: readonly Diagnostic[], searchResult: Record<string, unknown>): string | undefined {
  const lines = diagnostics
    .filter((diagnostic) => diagnostic.severity === "warning")
    .map((diagnostic) => `- [${diagnostic.code}] ${diagnostic.path ?? ""} ${diagnostic.message}`);
  const preparation = preparationWarning(searchResult);
  if (preparation) lines.push(preparation.trimEnd());
  return lines.length ? `${lines.join("\n")}\n` : undefined;
}

async function selectProcedureSearch(expression: string | undefined, configured: ProcedureSearchMode, context: CommandContext, prompts?: GraphBootstrapPromptPort): Promise<{ mode: ProcedureSearchMode; prepare: boolean }> {
  if (expression !== undefined) {
    if (expression !== "offline" && expression !== "hybrid") throw new CliError("invalid_procedure_search", "--procedure-search accepts offline or hybrid.", 2);
    return { mode: expression, prepare: expression === "hybrid" };
  }
  if (!prompts || !context.interactive) return { mode: configured, prepare: false };
  try {
    const enabled = await prompts.confirm({ id: "procedure-search", default: true, message: `Enable local multilingual semantic discovery? Downloads about 140 MB of model/tokenizer files plus a CPU runtime to ${semanticCacheRoot()}. Queries stay local; preparation failure falls back to offline search.` });
    return { mode: enabled ? "hybrid" : "offline", prepare: enabled };
  } catch (error) {
    if (error instanceof ExitPromptError) throw new CliError("cancelled", "Initialization cancelled.", 1);
    throw error;
  }
}

async function prepareSelectedSearch(selection: { mode: ProcedureSearchMode; prepare: boolean }, context: CommandContext, prepareSearch: typeof prepareSemanticSearch): Promise<Record<string, unknown>> {
  if (!selection.prepare) return { mode: selection.mode, preparation: "skipped" };
  if (context.dryRun) return { mode: selection.mode, preparation: "planned", cache_root: semanticCacheRoot() };
  try {
    const result = await prepareSearch(buildSearchDocuments(await loadProcedureCatalog()));
    return { mode: selection.mode, preparation: result.ready ? "ready" : "failed", effective_mode: result.ready ? "hybrid" : "offline", ...result };
  } catch (error) {
    return { mode: selection.mode, preparation: "failed", effective_mode: "offline", ready: false, cache_root: semanticCacheRoot(), reason: error instanceof Error ? error.message : String(error) };
  }
}

function preparationDiagnostics(result: Record<string, unknown>): Diagnostic[] {
  const warning = preparationWarning(result);
  return warning ? [{ severity: "warning", blocking: false, code: "procedure_search_fallback", message: warning.trim(), path: typeof result.cache_root === "string" ? result.cache_root : undefined }] : [];
}

function preparationWarning(result: Record<string, unknown>): string | undefined {
  return result.preparation === "failed" ? `Local semantic preparation failed (${String(result.reason)}); offline discovery remains available. Retry update --procedure-search hybrid when ready.\n` : undefined;
}

async function requireGraphWorkspaceForUpdate(context: CommandContext): Promise<string> {
  const { requireGraphWorkspace } = await import("../../core/workspace/graph-discover.js");
  try {
    return await requireGraphWorkspace(context.cwd, context.workspace);
  } catch (error) {
    throw new CliError("workspace_unsupported", error instanceof Error ? error.message : String(error), 1);
  }
}

async function selectTools(input: {
  configured: string[];
  detected: string[];
  expression?: string;
  context: CommandContext;
  fresh: boolean;
  prompts: GraphBootstrapPromptPort;
}): Promise<string[]> {
  try {
    if (input.expression !== undefined) return parseToolExpression(input.expression);
    if (input.context.interactive) {
      const selected = await input.prompts.multiSelect({
        id: "agent-tools",
        message: "Select agent tools",
        choices: orderTools(input.configured, input.detected).map((tool) => ({
          name: tool.name,
          value: tool.id,
          configured: input.configured.includes(tool.id),
          detected: input.detected.includes(tool.id),
          preSelected: input.configured.includes(tool.id) || (input.fresh && input.detected.includes(tool.id)),
        })),
      });
      return sameSelection(selected, input.configured) ? input.configured : selected;
    }
    if (!input.fresh) return input.configured;
    if (input.detected.length) return input.detected;
    throw new CliError("tools_required", "No agent tools were selected or detected.", 2, "Pass --tools all, --tools none, or a comma-separated tool list.");
  } catch (error) {
    if (error instanceof CliError) throw error;
    throw selectionError("invalid_tools", error);
  }
}

async function selectLiteratureAdapters(input: {
  configured: string[];
  expression?: string;
  context: CommandContext;
  prompts: GraphBootstrapPromptPort;
}): Promise<string[]> {
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
    throw selectionError("invalid_literature_adapters", error);
  }
}

function sameSelection(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value) => right.includes(value));
}

function selectionError(code: "invalid_tools" | "invalid_literature_adapters", error: unknown): CliError {
  return error instanceof ExitPromptError
    ? new CliError("cancelled", "Initialization cancelled.", 1)
    : new CliError(code, error instanceof Error ? error.message : String(error), 2);
}
