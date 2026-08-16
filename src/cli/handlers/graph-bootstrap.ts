import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { stringify } from "yaml";

import { getTool, parseToolExpression, toolSkillsRoot, toolSupportsSkills, type DeliveryMode } from "../../adapters/tools.js";
import { MINIMAL_GRAPH_PROFILE_TEXT } from "../../core/graph-profiles/minimal.js";
import { RESEARCH_MAIN_GRAPH_PROFILE_TEXT } from "../../core/graph-profiles/research-main.js";
import { ACADEMIC_PAPER_GRAPH_PROFILE_TEXT } from "../../core/graph-profiles/academic-paper.js";
import { ACADEMIC_PAPER_REVIEWER_GRAPH_PROFILE_TEXT } from "../../core/graph-profiles/academic-paper-reviewer.js";
import { ACADEMIC_PIPELINE_GRAPH_PROFILE_TEXT } from "../../core/graph-profiles/academic-pipeline.js";
import { PAPER_HUMANIZER_GRAPH_PROFILE_TEXT } from "../../core/graph-profiles/paper-humanizer.js";
import { REVIEW_RESPONSE_GRAPH_PROFILE_TEXT } from "../../core/graph-profiles/review-response.js";
import { GraphWorkspaceConfigSchema } from "../../core/contracts/graph-workspace.js";
import { loadCapabilityRegistry } from "../../capabilities/registry.js";
import { inspectGraphWorkspaceFormat, loadGraphWorkspaceIndex } from "../../core/runtime/graph-workspace-index.js";
import { resolveInitTarget } from "../../core/workspace/layout.js";
import { parseLiteratureAdapterExpression } from "../../literature-adapters/index.js";
import { fileExists } from "../../utils/fs.js";
import { CliError, success, type CommandContext, type CommandResult } from "../types.js";

export interface GraphInitOptions { tools?: string; literatureAdapters?: string; delivery?: DeliveryMode }
export interface GraphUpdateOptions { tools?: string; literatureAdapters?: string; delivery?: DeliveryMode }

async function projectCapabilitySkills(projectRoot: string, toolIds: readonly string[]): Promise<number> {
  const registry = await loadCapabilityRegistry();
  let projected = 0;
  for (const toolId of toolIds) {
    const tool = getTool(toolId);
    if (!tool || !toolSupportsSkills(tool)) continue;
    const root = toolSkillsRoot(tool, projectRoot).root;
    for (const registered of registry.capabilities.values()) {
      for (const source of registered.files) {
        const relative = path.relative(registered.packageRoot, source);
        const target = path.join(root, registered.entry.capability_id, relative);
        await mkdir(path.dirname(target), { recursive: true });
        await writeFile(target, await readFile(source), "utf8");
        projected += 1;
      }
    }
  }
  return projected;
}

async function writeGraphWorkspace(workspace: string, tools: string[], literatureAdapters: string[], delivery: DeliveryMode): Promise<void> {
  await mkdir(path.join(workspace, "profiles"), { recursive: true });
  await mkdir(path.join(workspace, "specs"), { recursive: true });
  await mkdir(path.join(workspace, "runs"), { recursive: true });
  await mkdir(path.join(workspace, "changes"), { recursive: true });
  await writeFile(path.join(workspace, "config.yaml"), stringify({
    schema_version: "2",
    agent_tools: { selected: tools, delivery },
    literature_adapters: { selected: literatureAdapters },
    plugins: { selected: [] },
  }), "utf8");
  await writeFile(path.join(workspace, "tool-installation-manifest.json"), `${JSON.stringify({ schema_version: "1", package_version: "0.1.0", plugin_resolutions: [], literature_adapter_resolutions: [], installations: [] }, null, 2)}\n`, "utf8");
  await writeFile(path.join(workspace, "profiles", "minimal.yaml"), MINIMAL_GRAPH_PROFILE_TEXT, "utf8");
  await writeFile(path.join(workspace, "profiles", "research-main.yaml"), RESEARCH_MAIN_GRAPH_PROFILE_TEXT, "utf8");
  await writeFile(path.join(workspace, "profiles", "academic-paper.yaml"), ACADEMIC_PAPER_GRAPH_PROFILE_TEXT, "utf8");
  await writeFile(path.join(workspace, "profiles", "academic-paper-reviewer.yaml"), ACADEMIC_PAPER_REVIEWER_GRAPH_PROFILE_TEXT, "utf8");
  await writeFile(path.join(workspace, "profiles", "academic-pipeline.yaml"), ACADEMIC_PIPELINE_GRAPH_PROFILE_TEXT, "utf8");
  await writeFile(path.join(workspace, "profiles", "paper-humanizer.yaml"), PAPER_HUMANIZER_GRAPH_PROFILE_TEXT, "utf8");
  await writeFile(path.join(workspace, "profiles", "review-response.yaml"), REVIEW_RESPONSE_GRAPH_PROFILE_TEXT, "utf8");
  await writeFile(path.join(workspace, "specs", "project.md"), '---\nschema_version: "2"\nproject_id: project\n---\n\n# Project intent\n\n## Research question\n\n## Scope and boundaries\n\n## Method stance\n\n## Expected contribution\n', "utf8");
  await writeFile(path.join(workspace, "specs", "sources.yaml"), stringify({ schema_version: "2", sources: [] }), "utf8");
  await writeFile(path.join(workspace, "specs", "claims.yaml"), stringify({ schema_version: "2", claims: [] }), "utf8");
  await writeFile(path.join(workspace, "specs", "manuscript.yaml"), stringify({
    schema_version: "2",
    manuscript_id: "manuscript",
    output_type: null,
    working_title: null,
    language: null,
    audience: null,
    venue: null,
    citation_requirements: [],
    format_requirements: [],
    delivery: { working_format: null, final_output_format: null },
    outline: [],
  }), "utf8");
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
  if (context.dryRun) return success("init", { workspace, schema_version: "2", dry_run: true, selected_tools: tools, delivery: options.delivery ?? "skills", selected_literature_adapters: literatureAdapters }, { stdout: `Would initialize schema 2 workspace: ${workspace}\n` });
  await writeGraphWorkspace(workspace, tools, literatureAdapters, options.delivery ?? "skills");
  const projected = (options.delivery ?? "skills") === "commands" ? 0 : await projectCapabilitySkills(path.dirname(workspace), tools);
  return success("init", { workspace, schema_version: "2", selected_tools: tools, delivery: options.delivery ?? "skills", selected_literature_adapters: literatureAdapters, selected_plugins: [], projected_capability_files: projected }, { stdout: `ResearchSpec schema 2 workspace initialized: ${workspace}\n` });
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
  let projected = 0;
  if (!context.dryRun) {
    projected = delivery === "commands" ? 0 : await projectCapabilitySkills(index.projectRoot, tools);
    await writeFile(path.join(workspace, "config.yaml"), stringify(GraphWorkspaceConfigSchema.parse({
      schema_version: "2",
      agent_tools: { selected: tools, delivery },
      literature_adapters: { selected: literatureAdapters },
      plugins: { selected: index.config.plugins.selected },
    })), "utf8");
  }
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
  let projected = 0;
  if (!context.dryRun) {
    projected = delivery === "commands" ? 0 : await projectCapabilitySkills(index.projectRoot, tools);
    await writeFile(path.join(workspace, "config.yaml"), stringify(GraphWorkspaceConfigSchema.parse({
      schema_version: "2",
      agent_tools: { selected: tools, delivery },
      literature_adapters: { selected: adapters },
      plugins: { selected: index.config.plugins.selected },
    })), "utf8");
  }
  return success("update", { workspace, schema_version: "2", dry_run: context.dryRun, selected_tools: tools, delivery, selected_literature_adapters: adapters, projected_capability_files: projected }, { stdout: `${context.dryRun ? "Would update" : "Updated"} schema 2 workspace: ${workspace}\n` });
}

async function requireGraphWorkspaceForUpdate(context: CommandContext): Promise<string> {
  const { requireGraphWorkspace } = await import("../../core/workspace/graph-discover.js");
  return requireGraphWorkspace(context.cwd, context.workspace);
}
