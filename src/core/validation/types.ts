export interface Diagnostic {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  path?: string;
  blocking: boolean;
  details?: unknown;
}

export type ParseResult<T> = { ok: true; value: T } | { ok: false; diagnostic: Diagnostic };

export type CheckTarget = "all" | "contracts" | "runtime" | "artifacts" | "tools" | "plugins" | "literature-adapters";

export interface CheckResult {
  ok: boolean;
  workspace: string;
  target: CheckTarget;
  diagnostics: Diagnostic[];
}
