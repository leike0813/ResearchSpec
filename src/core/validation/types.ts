export interface Diagnostic {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  path?: string;
  blocking: boolean;
  details?: unknown;
}

export interface ValidationViolation {
  code:
    | "required"
    | "invalid_type"
    | "invalid_value"
    | "invalid_format"
    | "too_small"
    | "too_big"
    | "unrecognized_key"
    | "constraint_failed";
  field_path: string;
  expectation: string;
  schema_ref: string;
}

export type ParseResult<T> = { ok: true; value: T } | { ok: false; diagnostic: Diagnostic };

export type CurrentCheckTarget = "all" | "specs" | "profiles" | "runs" | "changes" | "handoffs" | "tools" | "plugins" | "literature-adapters";

export interface CurrentCheckResult {
  ok: boolean;
  workspace: string;
  target: CurrentCheckTarget;
  diagnostics: Diagnostic[];
}
