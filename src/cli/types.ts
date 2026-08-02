import type { Diagnostic, ValidationViolation } from "../core/validation/types.js";

export type ExitCode = 0 | 1 | 2 | 3 | 4;

export interface CommandContext {
  command: string;
  cwd: string;
  workspace?: string;
  json: boolean;
  dryRun: boolean;
  force: boolean;
  yes: boolean;
  quiet: boolean;
  interactive: boolean;
}

export interface CliErrorBody {
  code: string;
  message: string;
  hint?: string;
  details?: unknown;
  validation?: ValidationViolation[];
}

export interface CommandResult<T = unknown> {
  command: string;
  ok: boolean;
  exitCode: ExitCode;
  data?: T;
  diagnostics: Diagnostic[];
  error?: CliErrorBody;
  human?: { stdout?: string; stderr?: string };
}

export interface CliEnvelope<T = unknown> {
  schema_version: "1";
  command: string;
  ok: boolean;
  data: T | null;
  diagnostics: Diagnostic[];
  error?: CliErrorBody;
}

export class CliError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly exitCode: ExitCode,
    readonly hint?: string,
    readonly details?: unknown,
    readonly validation?: ValidationViolation[],
  ) {
    super(message);
    this.name = "CliError";
  }
}

export function success<T>(
  command: string,
  data: T,
  human?: CommandResult<T>["human"],
  diagnostics: Diagnostic[] = [],
): CommandResult<T> {
  return { command, ok: true, exitCode: 0, data, diagnostics, human };
}

export function failure(command: string, error: CliError, diagnostics: Diagnostic[] = []): CommandResult {
  return {
    command,
    ok: false,
    exitCode: error.exitCode,
    diagnostics,
    error: { code: error.code, message: error.message, hint: error.hint, details: error.details, validation: error.validation },
    human: { stderr: `${error.message}${error.hint ? `\n${error.hint}` : ""}\n` },
  };
}
