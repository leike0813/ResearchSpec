import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";

import type { ProjectChangeDecision } from "../../core/runtime/change-documents.js";
import {
  advanceSubflow,
  appendGateAttempt,
  overrideFailedGate,
  recordLocalDecision,
  startSubflow,
  type GateVerdict,
  type LocalDecisionKind,
} from "../../core/runtime/subflow-control.js";
import { loadCurrentWorkspaceIndex } from "../../core/runtime/workspace-index.js";
import { CliError, success, type CommandContext, type CommandResult } from "../types.js";
import { handleCurrentChangeDecision } from "./change.js";
import { currentControlCliError, parseOwnedSelector, requireCurrentWorkspace } from "./shared.js";

export interface CurrentStartOptions { input: string; confirmedBy: string }
export interface CurrentAdvanceOptions { transition?: string; actorName?: string }
export interface CurrentDecideOptions {
  verdict?: GateVerdict;
  kind?: LocalDecisionKind;
  choice?: string;
  override?: boolean;
  reason?: string;
  evidenceRole?: string;
  actorName?: string;
  decision?: ProjectChangeDecision;
}

export async function handleCurrentStart(routeRef: string, options: CurrentStartOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireCurrentWorkspace(context);
  const index = await loadCurrentWorkspaceIndex(workspace);
  let command: unknown;
  try { command = parseYaml(await readFile(path.resolve(context.cwd, options.input), "utf8")); }
  catch (error) { throw new CliError("start_input_unreadable", `Cannot read Start input: ${error instanceof Error ? error.message : String(error)}`, 2); }
  try {
    const result = await startSubflow({ index, routeRef, command, confirmedBy: options.confirmedBy, dryRun: context.dryRun });
    return success("start", { ...result, dry_run: context.dryRun }, { stdout: `${result.status === "already_started" ? "Already started" : context.dryRun ? "Would start" : "Started"} ${result.instance_id}.\n` });
  } catch (error) { throw currentControlCliError(error); }
}

export async function handleCurrentDecide(selector: string | undefined, options: CurrentDecideOptions, context: CommandContext): Promise<CommandResult> {
  if (!selector) throw new CliError("selector_required", "Decide requires a Gate or Decision selector.", 2);
  if (context.force) throw new CliError("force_not_supported", "--force cannot overwrite a control or project change decision.", 2);
  if (selector.startsWith("change:")) {
    return handleCurrentChangeDecision(selector, selector.slice("change:".length), options, context);
  }
  const parsed = parseOwnedSelector(selector);
  if (parsed.kind === "subflow") throw new CliError("selector_invalid", "Decide requires gate:<instance>/<gate> or decision:<instance>/<decision>.", 2);
  const actor = options.actorName?.trim();
  if (!actor) throw new CliError("human_actor_required", "Decide requires --actor-name.", 2);
  const now = new Date().toISOString();
  const workspace = await requireCurrentWorkspace(context);
  const index = await loadCurrentWorkspaceIndex(workspace);
  try {
    if (parsed.kind === "gate") {
      if (options.override) {
        if (options.verdict) throw new CliError("decide_options_invalid", "--override cannot be combined with --verdict.", 2);
        const control = await overrideFailedGate({ index, instanceId: parsed.instanceId, gateId: parsed.localId, approvedBy: actor, approvedAt: now, reason: options.reason ?? "", dryRun: context.dryRun });
        return success("decide", { selector, action: "override", control, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would override" : "Overrode"} ${selector}.\n` });
      }
      if (!options.verdict) throw new CliError("verdict_required", "Gate Decide requires --verdict or --override.", 2);
      const control = await appendGateAttempt({ index, instanceId: parsed.instanceId, gateId: parsed.localId, verdict: options.verdict, confirmedBy: actor, confirmedAt: now, summary: options.reason ?? "", evidenceRole: options.evidenceRole, dryRun: context.dryRun });
      return success("decide", { selector, action: "gate_attempt", control, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would record" : "Recorded"} ${selector}.\n` });
    }
    if (!options.kind || !options.choice) throw new CliError("decision_input_required", "Local Decision requires --kind and --choice.", 2);
    const control = await recordLocalDecision({ index, instanceId: parsed.instanceId, decisionId: parsed.localId, kind: options.kind, choice: options.choice, decidedBy: actor, decidedAt: now, reason: options.reason, dryRun: context.dryRun });
    return success("decide", { selector, action: "local_decision", control, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would decide" : "Decided"} ${selector}.\n` });
  } catch (error) {
    if (error instanceof CliError) throw error;
    throw currentControlCliError(error);
  }
}

export async function handleCurrentAdvance(selector: string, options: CurrentAdvanceOptions, context: CommandContext): Promise<CommandResult> {
  const parsed = parseOwnedSelector(selector);
  if (parsed.kind !== "subflow") throw new CliError("selector_invalid", "Advance requires subflow:<instance-id>.", 2);
  const actor = options.actorName?.trim();
  if (!actor) throw new CliError("actor_required", "Advance requires --actor-name.", 2);
  const workspace = await requireCurrentWorkspace(context);
  const index = await loadCurrentWorkspaceIndex(workspace);
  try {
    const result = await advanceSubflow({ index, instanceId: parsed.instanceId, transition: options.transition, actor, transitionedAt: new Date().toISOString(), dryRun: context.dryRun });
    return success("advance", { selector, ...result, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would advance" : "Advanced"} ${selector} via ${result.transition}.\n` });
  } catch (error) { throw currentControlCliError(error); }
}
