#!/usr/bin/env node

import { readFile } from "node:fs/promises";

import { runCheckCommand } from "./commands/check.js";
import { runInitCommand } from "./commands/init.js";
import { runStatusCommand } from "./commands/status.js";

export interface CliResult {
  exitCode: number;
}

interface ParsedArgs {
  command?: string;
  positionals: string[];
  options: Map<string, string | boolean>;
}

const HELP_TEXT = `ResearchSpec

Usage:
  researchspec <command> [options]

Commands:
  init [path]       Initialize a ResearchSpec workspace
  status           Show workspace status
  check [target]   Check workspace structure and parseability

Options:
  --help, -h        Show help
  --version, -v     Show version
  --workspace PATH  Use an explicit researchspec workspace path
  --json            Print a single JSON object to stdout where supported
`;

export async function main(argv = process.argv.slice(2)): Promise<CliResult> {
  const args = parseArgs(argv);

  if (!args.command || args.options.has("help") || args.options.has("h")) {
    process.stdout.write(HELP_TEXT);
    return { exitCode: 0 };
  }

  if (args.options.has("version") || args.options.has("v")) {
    process.stdout.write(`${await readPackageVersion()}\n`);
    return { exitCode: 0 };
  }

  switch (args.command) {
    case "init":
      return runInitCommand(args.positionals, args.options);
    case "status":
      return runStatusCommand(args.options);
    case "check":
      return runCheckCommand(args.positionals, args.options);
    default:
      process.stderr.write(`Unsupported command: ${args.command}\nRun researchspec --help for available commands.\n`);
      return { exitCode: 1 };
  }
}

function parseArgs(argv: string[]): ParsedArgs {
  const options = new Map<string, string | boolean>();
  const positionals: string[] = [];
  let command: string | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg.startsWith("--")) {
      const [rawKey, inlineValue] = arg.slice(2).split("=", 2);
      if (inlineValue !== undefined) {
        options.set(rawKey, inlineValue);
        continue;
      }

      const next = argv[index + 1];
      if (next && !next.startsWith("-") && expectsValue(rawKey)) {
        options.set(rawKey, next);
        index += 1;
      } else {
        options.set(rawKey, true);
      }
      continue;
    }

    if (arg.startsWith("-") && arg.length > 1) {
      for (const flag of arg.slice(1)) {
        options.set(flag, true);
      }
      continue;
    }

    if (!command) {
      command = arg;
    } else {
      positionals.push(arg);
    }
  }

  return { command, positionals, options };
}

function expectsValue(key: string): boolean {
  return key === "tools" || key === "workspace";
}

async function readPackageVersion(): Promise<string> {
  const packageUrl = new URL("../../package.json", import.meta.url);
  const packageJson = JSON.parse(await readFile(packageUrl, "utf8")) as { version?: string };
  return packageJson.version ?? "0.0.0";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await main();
  process.exitCode = result.exitCode;
}
