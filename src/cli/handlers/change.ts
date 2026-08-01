import type { ConditionalChangeDocument, ProjectChangeDecision } from "../../core/runtime/change-documents.js";
import { archiveProjectChange, decideProjectChange, scaffoldProjectChange } from "../../core/runtime/change-documents.js";
import { loadCurrentWorkspaceIndex } from "../../core/runtime/workspace-index.js";
import { CliError, success, type CommandContext, type CommandResult } from "../types.js";
import { commaSeparated, currentChangeCliError, requireCurrentWorkspace } from "./shared.js";

export interface CurrentProposeOptions { targets: string; with?: string }

export interface CurrentChangeDecisionOptions {
  decision?: ProjectChangeDecision;
  reason?: string;
  actorName?: string;
}

export async function handleCurrentPropose(changeId: string, options: CurrentProposeOptions, context: CommandContext): Promise<CommandResult> {
  if (context.force) throw new CliError("force_not_supported", "--force does not apply to create-only project changes.", 2);
  const workspace = await requireCurrentWorkspace(context);
  const index = await loadCurrentWorkspaceIndex(workspace);
  const targets = commaSeparated(options.targets);
  const withDocuments = commaSeparated(options.with ?? "") as ConditionalChangeDocument[];
  if (withDocuments.some((item) => !["design", "tasks", "delta"].includes(item))) throw new CliError("change_documents_invalid", "--with accepts only design,tasks,delta.", 2);
  try {
    const result = await scaffoldProjectChange({ index, changeId, targets, withDocuments, dryRun: context.dryRun });
    return success("propose", { change_id: result.change_id, directory: result.directory, documents: result.documents, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would create" : "Created"} project change change:${changeId}.\n` });
  } catch (error) { throw currentChangeCliError(error); }
}

export async function handleCurrentArchive(changeId: string, context: CommandContext): Promise<CommandResult> {
  if (context.force) throw new CliError("force_not_supported", "--force cannot override project change archive safety.", 2);
  const workspace = await requireCurrentWorkspace(context);
  const index = await loadCurrentWorkspaceIndex(workspace);
  try {
    const result = await archiveProjectChange({ index, changeId, dryRun: context.dryRun });
    return success("archive", { ...result, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would archive" : "Archived"} change:${changeId}.\n` });
  } catch (error) { throw currentChangeCliError(error); }
}

export async function handleCurrentChangeDecision(
  selector: string,
  changeId: string,
  options: CurrentChangeDecisionOptions,
  context: CommandContext,
): Promise<CommandResult> {
  if (!options.decision) throw new CliError("change_decision_required", "Project change Decide requires --decision.", 2);
  const actor = options.actorName?.trim();
  if (!actor) throw new CliError("human_actor_required", "Decide requires --actor-name.", 2);
  const reason = options.reason?.trim();
  if (!reason) throw new CliError("change_reason_required", "Project change Decide requires --reason.", 2);
  const workspace = await requireCurrentWorkspace(context);
  const index = await loadCurrentWorkspaceIndex(workspace);
  try {
    const result = await decideProjectChange({ index, changeId, decision: options.decision, actorName: actor, reason, decidedAt: new Date().toISOString(), dryRun: context.dryRun });
    return success("decide", { selector, action: "change_decision", frontmatter: result.change.frontmatter, path: result.path, stable_specs_modified: false, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would decide" : "Decided"} ${selector}.\n` });
  } catch (error) { throw currentChangeCliError(error); }
}
