#!/usr/bin/env node

import { convertArsu, checkArsuIdempotence, checkArsuOutput } from "./converter.js";
import { resolveRepositoryRoot } from "./upstream.js";
import { ArsuConverterError } from "./types.js";

interface ParsedArgs {
  command?: string;
  options: Map<string, string | boolean>;
}

const HELP = `ResearchSpec ARSU converter developer tooling

Usage:
  node dist/src/arsu-converter/cli.js <command> [options]

Commands:
  convert      Generate skills/arsu from vendor/ars
  check        Validate generated skills/arsu
  idempotence  Compare generated output with a clean regeneration

Options:
  --force      Regenerate even when skills/arsu has drift
  --dry-run    Validate source and report planned paths without writing
  --json       Print JSON result
  --help       Show help

The converter source is fixed to vendor/ars. --source is intentionally unsupported.
`;

export async function main(argv = process.argv.slice(2), cwd = process.cwd()): Promise<{ exitCode: number }> {
  const args = parseArgs(argv);
  if (!args.command || args.options.has("help")) {
    process.stdout.write(HELP);
    return { exitCode: 0 };
  }
  if (args.options.has("source")) {
    process.stderr.write("Unsupported option: --source. ARSU conversion always reads vendor/ars.\n");
    return { exitCode: 1 };
  }

  const json = args.options.has("json");
  try {
    const repoRoot = await resolveRepositoryRoot(cwd);
    if (args.command === "convert") {
      const result = await convertArsu({
        repoRoot,
        force: args.options.has("force"),
        dryRun: args.options.has("dry-run"),
      });
      const output = {
        ok: result.validation?.ok ?? true,
        source: "vendor/ars",
        output: "skills/arsu",
        source_commit: result.source_version.commit,
        generated_groups: Object.keys(result.skill_groups).sort(),
        validation: result.validation,
      };
      if (json) process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
      else if (args.options.has("dry-run")) process.stdout.write("ARSU conversion dry run: vendor/ars -> skills/arsu\n");
      else process.stdout.write("ARSU conversion complete: skills/arsu\n");
      return { exitCode: output.ok ? 0 : 1 };
    }
    if (args.command === "check") {
      const result = await checkArsuOutput(repoRoot);
      if (json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      else if (result.ok) process.stdout.write("ARSU generated output check passed: skills/arsu\n");
      else writeDiagnostics(result.errors, result.warnings);
      return { exitCode: result.ok ? 0 : 1 };
    }
    if (args.command === "idempotence") {
      const result = await checkArsuIdempotence(repoRoot);
      if (json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      else if (result.ok) process.stdout.write("ARSU generated output is idempotent.\n");
      else writeDiagnostics(result.errors, result.drift_paths);
      return { exitCode: result.ok ? 0 : 1 };
    }
    process.stderr.write(`Unsupported ARSU converter command: ${args.command}\n`);
    return { exitCode: 1 };
  } catch (error) {
    if (json) {
      process.stdout.write(`${JSON.stringify(errorToJson(error), null, 2)}\n`);
    } else {
      process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
      if (error instanceof ArsuConverterError && error.details.length > 0) {
        for (const detail of error.details) process.stderr.write(`- ${detail}\n`);
      }
    }
    return { exitCode: 1 };
  }
}

function parseArgs(argv: string[]): ParsedArgs {
  const options = new Map<string, string | boolean>();
  let command: string | undefined;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index] ?? "";
    if (arg.startsWith("--")) {
      const [key, inlineValue] = arg.slice(2).split("=", 2);
      options.set(key, inlineValue ?? true);
      continue;
    }
    if (!command) command = arg;
    else options.set(`positional:${String(index)}`, arg);
  }
  return { command, options };
}

function writeDiagnostics(errors: string[], warnings: string[]): void {
  for (const error of errors) process.stderr.write(`ERROR: ${error}\n`);
  for (const warning of warnings) process.stderr.write(`WARNING: ${warning}\n`);
}

function errorToJson(error: unknown): Record<string, unknown> {
  if (error instanceof ArsuConverterError) {
    return { ok: false, code: error.code, message: error.message, details: error.details };
  }
  return { ok: false, message: error instanceof Error ? error.message : String(error) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await main();
  process.exitCode = result.exitCode;
}
