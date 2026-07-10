import type { CliEnvelope, CommandResult } from "./types.js";

export function presentResult(result: CommandResult, json: boolean, quiet = false): void {
  if (json) {
    const envelope: CliEnvelope = {
      schema_version: "1",
      command: result.command,
      ok: result.ok,
      data: result.data ?? null,
      diagnostics: result.diagnostics,
      ...(result.error ? { error: result.error } : {}),
    };
    process.stdout.write(`${JSON.stringify(envelope, null, 2)}\n`);
    return;
  }

  if (!quiet && result.human?.stdout) process.stdout.write(result.human.stdout);
  if (result.human?.stderr) process.stderr.write(result.human.stderr);
  if (!result.human?.stderr && !result.ok && result.error) {
    process.stderr.write(`${result.error.message}\n`);
  }
}
