import path from "node:path";
import { stringify } from "yaml";

import { parseToolExpression, type DeliveryMode } from "../../adapters/tools.js";
import { planWorkspaceDelivery } from "../../adapters/workspace-delivery.js";
import { renderToolInstallationManifest } from "../../adapters/installations.js";
import { GraphWorkspaceConfigSchema } from "../../core/contracts/graph-workspace.js";
import { loadPluginRegistry } from "../../plugins/registry.js";
import { inspectGraphWorkspaceFormat, loadGraphWorkspaceIndex } from "../../core/runtime/graph-workspace-index.js";
import { resolveInitTarget } from "../../core/workspace/layout.js";
import { executeWritePlan, planDirectFileEdit, planFile, type PlannedWrite } from "../../core/workspace/write-plan.js";
import { parseLiteratureAdapterExpression } from "../../literature-adapters/index.js";
import { fileExists } from "../../utils/fs.js";
import { CliError, success, type CommandContext, type CommandResult } from "../types.js";

export interface GraphInitOptions { tools?: string; literatureAdapters?: string; delivery?: DeliveryMode }
export interface GraphUpdateOptions { tools?: string; literatureAdapters?: string; delivery?: DeliveryMode }

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
  index?: Awaited<ReturnType<typeof loadGraphWorkspaceIndex>>;
  context: CommandContext;
}): Promise<{ projected: number; operations: PlannedWrite[] }> {
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
  });
  const blocking = deliveryPlan.diagnostics.filter((diagnostic) => diagnostic.blocking);
  if (blocking.length > 0 || deliveryPlan.operations.some((operation) => operation.action === "conflict")) {
    throw new CliError("workspace_projection_conflict", blocking.map((item) => item.message).join("; ") || "Workspace projection contains ownership conflicts.", 3, "Resolve unowned targets or manifest drift before retrying.", deliveryPlan.diagnostics);
  }
  const configContent = stringify(GraphWorkspaceConfigSchema.parse({
    schema_version: "2",
    agent_tools: { selected: input.tools, delivery: input.delivery },
    literature_adapters: { selected: input.adapters },
    plugins: { selected: input.selectedPlugins },
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
  return { projected: deliveryPlan.installations.filter((item) => item.source.kind === "framework-capability").length, operations };
}

export async function handleGraphInit(inputPath: string | undefined, options: GraphInitOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = context.workspace ? path.resolve(context.cwd, context.workspace) : resolveInitTarget(inputPath, context.cwd);
  if (await fileExists(workspace)) {
    const format = await inspectGraphWorkspaceFormat(workspace);
    if (!format.current) throw new CliError("unsupported_workspace", `Initialization target is not a current schema 2 workspace: ${workspace}`, 1, "Existing files were left unchanged.");
    const index = await loadGraphWorkspaceIndex(workspace);
    return handleGraphReinit(workspace, index.config.agent_tools.selected, options, context);
  }
  let tools: string[];
  try { tools = parseToolExpression(options.tools ?? "none"); }
  catch (error) { throw new CliError("invalid_tools", error instanceof Error ? error.message : String(error), 2); }
  let literatureAdapters: string[];
  try { literatureAdapters = parseLiteratureAdapterExpression(options.literatureAdapters ?? "none"); }
  catch (error) { throw new CliError("invalid_literature_adapters", error instanceof Error ? error.message : String(error), 2); }
  const delivery = options.delivery ?? "skills";
  const applied = await applyGraphWorkspaceProjection({ workspace, tools, adapters: literatureAdapters, delivery, selectedPlugins: [], context });
  return success("init", { workspace, schema_version: "2", dry_run: context.dryRun, selected_tools: tools, delivery, selected_literature_adapters: literatureAdapters, selected_plugins: [], projected_capability_files: applied.projected }, { stdout: `${context.dryRun ? "Would initialize" : "ResearchSpec schema 2 workspace initialized"}: ${workspace}\n` });
}

async function handleGraphReinit(workspace: string, configured: string[], options: GraphInitOptions, context: CommandContext): Promise<CommandResult> {
  let tools: string[];
  try { tools = parseToolExpression(options.tools ?? "none"); }
  catch (error) { throw new CliError("invalid_tools", error instanceof Error ? error.message : String(error), 2); }
  let literatureAdapters: string[];
  try { literatureAdapters = parseLiteratureAdapterExpression(options.literatureAdapters ?? "none"); }
  catch (error) { throw new CliError("invalid_literature_adapters", error instanceof Error ? error.message : String(error), 2); }
  const index = await loadGraphWorkspaceIndex(workspace);
  const delivery = options.delivery ?? index.config.agent_tools.delivery;
  const applied = await applyGraphWorkspaceProjection({ workspace, tools, adapters: literatureAdapters, delivery, selectedPlugins: index.config.plugins.selected, index, context });
  const projected = applied.projected;
  return success("init", { workspace, schema_version: "2", dry_run: context.dryRun, selected_tools: tools, delivery, selected_literature_adapters: literatureAdapters, previous_tools: configured, projected_capability_files: projected }, { stdout: `${context.dryRun ? "Would reconfigure" : "Reconfigured"} schema 2 workspace: ${workspace}\n` });
}

export async function handleGraphUpdate(options: GraphUpdateOptions, context: CommandContext): Promise<CommandResult> {
  const explicit = context.workspace ? path.resolve(context.cwd, context.workspace) : undefined;
  const workspace = explicit ?? (await requireGraphWorkspaceForUpdate(context));
  const index = await loadGraphWorkspaceIndex(workspace);
  const configured = index.config.agent_tools.selected;
  const tools = options.tools === undefined ? configured : parseToolExpression(options.tools);
  const adapters = options.literatureAdapters === undefined
    ? index.config.literature_adapters.selected
    : parseLiteratureAdapterExpression(options.literatureAdapters);
  const delivery = options.delivery ?? index.config.agent_tools.delivery;
  const applied = await applyGraphWorkspaceProjection({ workspace, tools, adapters, delivery, selectedPlugins: index.config.plugins.selected, index, context });
  const projected = applied.projected;
  return success("update", { workspace, schema_version: "2", dry_run: context.dryRun, selected_tools: tools, delivery, selected_literature_adapters: adapters, projected_capability_files: projected }, { stdout: `${context.dryRun ? "Would update" : "Updated"} schema 2 workspace: ${workspace}\n` });
}

async function requireGraphWorkspaceForUpdate(context: CommandContext): Promise<string> {
  const { requireGraphWorkspace } = await import("../../core/workspace/graph-discover.js");
  try {
    return await requireGraphWorkspace(context.cwd, context.workspace);
  } catch (error) {
    throw new CliError("workspace_unsupported", error instanceof Error ? error.message : String(error), 1);
  }
}
