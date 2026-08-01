import { CurrentHandoffError } from "../../core/runtime/handoff.js";
import { RuntimeQueryError } from "../../core/runtime/query.js";
import { SubflowControlError } from "../../core/runtime/subflow-control.js";
import { ChangeDocumentError } from "../../core/runtime/change-documents.js";
import { ControlSelectorSchema } from "../../core/contracts/control-selector.js";
import { resolveWorkspace } from "../../core/workspace/discover.js";
import { CliError, type CommandContext } from "../types.js";

export async function requireCurrentWorkspace(context: CommandContext, positional?: string): Promise<string> {
  const resolution = await resolveWorkspace(context.cwd, context.workspace ?? positional);
  if (resolution.status === "found") return resolution.workspace;
  if (resolution.status === "unsupported") throw new CliError("workspace_unsupported", `Unsupported workspace format: ${resolution.path}`, 1, undefined, { reason: resolution.reason });
  if (resolution.status === "invalid") throw new CliError("workspace_invalid", `Invalid ResearchSpec workspace: ${resolution.path}`, 1);
  throw new CliError("workspace_missing", "No researchspec workspace found.", 1, "Run researchspec init to create one.");
}

export function parseOwnedSelector(selector: string): { kind: "subflow"; instanceId: string } | { kind: "gate" | "decision"; instanceId: string; localId: string } {
  if (selector.startsWith("subflow:")) return { kind: "subflow", instanceId: selector.slice("subflow:".length) };
  const match = /^(gate|decision):([^/]+)\/(.+)$/.exec(selector);
  if (!match) throw new CliError("selector_invalid", `Unsupported current selector: ${selector}`, 2);
  return { kind: match[1] as "gate" | "decision", instanceId: match[2] ?? "", localId: match[3] ?? "" };
}

export function parseSubflowSelector(selector: string, command: string): string {
  if (!selector.startsWith("subflow:") || !ControlSelectorSchema.safeParse(selector).success) throw new CliError("selector_invalid", `${command} requires subflow:<instance-id>.`, 2);
  return selector.slice("subflow:".length);
}

export function currentControlCliError(error: unknown): CliError {
  if (!(error instanceof SubflowControlError)) return new CliError("control_internal_error", error instanceof Error ? error.message : String(error), 4);
  return new CliError(error.code, error.message, error.kind === "usage" ? 2 : error.kind === "conflict" ? 3 : 1, undefined, error.details);
}

export function currentQueryCliError(error: unknown): CliError {
  if (!(error instanceof RuntimeQueryError)) return new CliError("query_internal_error", error instanceof Error ? error.message : String(error), 4);
  return new CliError(error.code, error.message, error.code === "page_cursor_stale" ? 3 : 2);
}

export function currentHandoffCliError(error: unknown): CliError {
  if (!(error instanceof CurrentHandoffError)) return new CliError("handoff_internal_error", error instanceof Error ? error.message : String(error), 4);
  return new CliError(error.code, error.message, error.kind === "usage" ? 2 : error.kind === "conflict" ? 3 : 1, undefined, error.details);
}

export function currentChangeCliError(error: unknown): CliError {
  if (error instanceof CliError) return error;
  if (!(error instanceof ChangeDocumentError)) return new CliError("change_internal_error", error instanceof Error ? error.message : String(error), 4);
  return new CliError(error.code, error.message, error.kind === "usage" ? 2 : error.kind === "conflict" ? 3 : 1, undefined, error.details);
}

export function commaSeparated(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
