import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";

import { currentHandoff, updateCurrentHandoff } from "../../core/runtime/handoff.js";
import { buildCurrentContextPack, CurrentPackError, type CurrentPackScope } from "../../core/runtime/pack.js";
import { loadCurrentWorkspaceIndex } from "../../core/runtime/workspace-index.js";
import { executeWritePlan, sha256, type PlannedWrite } from "../../core/workspace/write-plan.js";
import { CliError, success, type CommandContext, type CommandResult } from "../types.js";
import { currentHandoffCliError, parseSubflowSelector, requireCurrentWorkspace } from "./shared.js";

export interface CurrentHandoffOptions { input?: string }
export interface CurrentPackOptions { output: string; scope?: string }

export async function handleCurrentHandoff(selector: string, options: CurrentHandoffOptions, context: CommandContext): Promise<CommandResult> {
  if (options.input && context.force) throw new CliError("force_not_supported", "--force cannot overwrite a directly editable handoff.", 2);
  const instanceId = parseSubflowSelector(selector, "Handoff");
  const workspace = await requireCurrentWorkspace(context);
  const index = await loadCurrentWorkspaceIndex(workspace);
  try {
    if (!options.input) {
      const result = currentHandoff(index, instanceId);
      return success("handoff", { selector, path: result.path, handoff: result.handoff, body: result.body, content: result.content }, { stdout: result.content });
    }
    const inputPath = path.resolve(context.cwd, options.input);
    let semanticInput: unknown;
    try { semanticInput = parseYaml(await readFile(inputPath, "utf8")); }
    catch (error) { throw new CliError("handoff_input_unreadable", `Cannot read Handoff input: ${error instanceof Error ? error.message : String(error)}`, 2); }
    const result = await updateCurrentHandoff({ index, instanceId, semanticInput, updatedAt: new Date().toISOString(), dryRun: context.dryRun });
    return success("handoff", { selector, path: result.path, handoff: result.handoff, body: result.body, created: result.created, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would update" : "Updated"} ${selector}.\n` });
  } catch (error) {
    if (error instanceof CliError) throw error;
    throw currentHandoffCliError(error);
  }
}

export async function handleCurrentPack(options: CurrentPackOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireCurrentWorkspace(context);
  const index = await loadCurrentWorkspaceIndex(workspace);
  const scope = (options.scope ?? "all") as CurrentPackScope;
  const output = path.resolve(context.cwd, options.output);
  const relativeToWorkspace = path.relative(workspace, output);
  if (relativeToWorkspace === "" || (!relativeToWorkspace.startsWith("..") && !path.isAbsolute(relativeToWorkspace))) {
    throw new CliError("pack_output_managed", "Pack output must remain outside researchspec/.", 2);
  }
  try {
    const bundle = buildCurrentContextPack(index, scope);
    let previous: Uint8Array | undefined;
    try { previous = await readFile(output); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    if (previous !== undefined && !context.force) throw new CliError("output_exists", `Pack output already exists: ${output}`, 3, "Use --force to replace this derived bundle.");
    const operation: PlannedWrite = {
      action: previous === undefined ? "create" : "refresh",
      path: output,
      content: bundle.bytes,
      scope: "project",
      ownership: "generated",
      ...(previous === undefined ? {} : { previousHash: sha256(previous) }),
      nextHash: bundle.sha256,
      reason: `write deterministic current context pack (${scope})`,
    };
    if (!context.dryRun) await executeWritePlan({ operations: [operation] });
    return success("pack", { path: output, scope, bytes: bundle.bytes.length, sha256: bundle.sha256, entries: bundle.entries, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would write" : "Wrote"} context pack: ${output}\n` });
  } catch (error) {
    if (error instanceof CliError) throw error;
    if (error instanceof CurrentPackError) throw new CliError(error.code, error.message, 2);
    throw error;
  }
}
