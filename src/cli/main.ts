#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { Command, CommanderError, InvalidArgumentError } from "commander";

import {
  handleAdvance, handleArchive, handleCheck, handleDecide, handleHandoff, handleInit, handleInstructions, handleList,
  handlePack, handlePropose, handleShow, handleStart, handleStatus, handleSubmit, handleUpdate, type DecideOptions,
  type AdvanceOptions, type HandoffOptions, type InitOptions, type PackOptions, type ProposeOptions, type StartOptions, type SubmitOptions, type UpdateOptions,
} from "./handlers.js";
import { presentResult } from "./presenter.js";
import { CliError, failure, type CommandContext, type CommandResult } from "./types.js";

export interface CliResult { exitCode: number }

export async function main(argv = process.argv.slice(2)): Promise<CliResult> {
  const jsonRequested = argv.includes("--json");
  let program: Command;
  try { program = await createProgram(); }
  catch (error) {
    const startup = failure("cli", new CliError("startup_error", error instanceof Error ? error.message : String(error), 4));
    presentResult(startup, jsonRequested);
    return { exitCode: 4 };
  }
  let result: CommandResult | undefined;
  program.exitOverride();
  program.configureOutput({
    writeOut: (text) => { if (!jsonRequested) process.stdout.write(text); },
    writeErr: (text) => { if (!jsonRequested) process.stderr.write(text); },
  });

  const run = async (command: string, commandObject: Command, action: () => Promise<CommandResult>) => {
    const context = commandContext(command, commandObject);
    try { result = await action(); }
    catch (error) {
      const cliError = error instanceof CliError ? error : isFileSystemError(error)
        ? new CliError("write_error", error.message, 3)
        : new CliError("internal_error", error instanceof Error ? error.message : String(error), 4);
      result = failure(command, cliError);
    }
    presentResult(result, context.json, context.quiet);
  };

  registerCommands(program, run);
  try {
    await program.parseAsync(argv, { from: "user" });
    return { exitCode: result?.exitCode ?? 0 };
  } catch (error) {
    if (error instanceof CommanderError && (error.code === "commander.helpDisplayed" || error.code === "commander.version")) return { exitCode: 0 };
    const message = error instanceof Error ? error.message : String(error);
    const usage = failure(argv[0] ?? "cli", new CliError("usage_error", message, 2, "Run researchspec --help for usage."));
    if (jsonRequested) presentResult(usage, true);
    return { exitCode: 2 };
  }
}

type Runner = (command: string, commandObject: Command, action: () => Promise<CommandResult>) => Promise<void>;

function registerCommands(program: Command, run: Runner): void {
  program.command("init [path]").description("Initialize or safely extend a ResearchSpec workspace")
    .option("--tools <ids>", "all, none, or comma-separated tool IDs")
    .option("--profile <profile>", "workspace profile")
    .action(async (target: string | undefined, options: InitOptions, command: Command) => run("init", command, () => handleInit(target, options, commandContext("init", command))));
  program.command("update [path]").description("Refresh selected generated agent files")
    .option("--tools <ids>", "refresh/add a tool subset")
    .action(async (target: string | undefined, options: UpdateOptions, command: Command) => run("update", command, () => handleUpdate(target, options, commandContext("update", command))));
  program.command("status").description("Show current run and pending-item status")
    .action(async (_options: Record<string, never>, command: Command) => run("status", command, () => handleStatus(commandContext("status", command))));
  program.command("instructions <selector>").description("Show dynamic instructions for a runtime selector")
    .action(async (selector: string, _options: Record<string, never>, command: Command) => run("instructions", command, () => handleInstructions(selector, commandContext("instructions", command))));
  program.command("start <subflow>").description("Atomically start a confirmed subflow template")
    .requiredOption("--input <start.json>", "strict subflow Start JSON")
    .requiredOption("--actor-kind <kind>", "human, agent, or script")
    .requiredOption("--actor-name <name>", "Start requester name")
    .requiredOption("--confirmed-by <name>", "human who confirmed the route")
    .option("--expected-plan-sha256 <hash>", "bind execution to the previewed Start plan")
    .action(async (subflow: string, options: StartOptions, command: Command) => run("start", command, () => handleStart(subflow, options, commandContext("start", command))));
  program.command("submit <runtime-item>").description("Submit a workflow-owned work candidate or confirmed Gate verdict")
    .requiredOption("--input <payload.json>", "strict work or Gate submission JSON")
    .requiredOption("--actor-kind <kind>", "human, agent, script, converter, or validator")
    .requiredOption("--actor-name <name>", "artifact producer name")
    .option("--confirmed-by <name>", "human who confirmed a Gate verdict")
    .option("--expected-sha256 <hash>", "bind execution to the previewed candidate SHA-256")
    .option("--expected-plan-sha256 <hash>", "bind Gate execution to the previewed plan")
    .action(async (runtimeItem: string, options: SubmitOptions, command: Command) => run("submit", command, () => handleSubmit(runtimeItem, options, commandContext("submit", command))));
  program.command("advance <transition>").description("Atomically advance one uniquely authorized transition")
    .requiredOption("--actor-kind <kind>", "agent or script")
    .requiredOption("--actor-name <name>", "transition executor name")
    .option("--expected-plan-sha256 <hash>", "bind execution to the previewed transition plan")
    .action(async (transition: string, options: AdvanceOptions, command: Command) => run("advance", command, () => handleAdvance(transition, options, commandContext("advance", command))));
  program.command("check [target]").description("Check all, contracts, runtime, artifacts, or tools")
    .option("--strict", "treat warnings as failures")
    .action(async (target: string | undefined, options: { strict?: boolean }, command: Command) => run("check", command, () => handleCheck(target, Boolean(options.strict), commandContext("check", command))));
  program.command("list [type]").description("List changes, artifacts, gates, decisions, or tools")
    .action(async (type: string | undefined, _options: Record<string, never>, command: Command) => run("list", command, () => handleList(type, commandContext("list", command))));
  program.command("show <item>").description("Show a canonical or globally unique item")
    .action(async (item: string, _options: Record<string, never>, command: Command) => run("show", command, () => handleShow(item, commandContext("show", command))));
  program.command("handoff").description("Render the current handoff view")
    .option("--stdout", "print without writing")
    .option("--out <path>", "output path")
    .action(async (options: HandoffOptions, command: Command) => run("handoff", command, () => handleHandoff(options, commandContext("handoff", command))));
  program.command("pack").description("Create a deterministic context bundle")
    .option("--out <path>", "output ZIP path")
    .option("--include-artifacts", "include safe registered artifacts")
    .action(async (options: PackOptions, command: Command) => run("pack", command, () => handlePack(options, commandContext("pack", command))));
  program.command("propose <change-id>").description("Create a validated pending contract change")
    .requiredOption("--input <payload.json>", "strict semantic proposal JSON")
    .requiredOption("--actor-kind <kind>", "human or agent", parseActorKind)
    .requiredOption("--actor-name <name>", "proposal author name")
    .action(async (changeId: string, options: ProposeOptions, command: Command) => run("propose", command, () => handlePropose(changeId, options, commandContext("propose", command))));
  program.command("decide [item]").description("Resolve a pending human decision")
    .option("--decision <choice>", "accept, reject, or postpone", parseDecision)
    .option("--actor-name <name>", "human actor name")
    .option("--reason <text>", "decision rationale")
    .action(async (item: string | undefined, options: DecideOptions, command: Command) => run("decide", command, () => handleDecide(item, options, commandContext("decide", command))));
  program.command("archive [item]").description("Archive a resolved change or draft patch")
    .action(async (item: string | undefined, _options: Record<string, never>, command: Command) => run("archive", command, () => handleArchive(item, commandContext("archive", command))));
}

async function createProgram(): Promise<Command> {
  return new Command()
    .name("researchspec")
    .description("Agent-neutral, file-based research contract framework")
    .version(await readPackageVersion(), "-v, --version")
    .option("--cwd <path>", "project working directory")
    .option("--workspace <path>", "explicit researchspec workspace")
    .option("--json", "emit one machine-readable envelope")
    .option("--dry-run", "plan writes without modifying files")
    .option("--force", "refresh manifest-owned generated files")
    .option("--yes", "skip low-risk confirmations")
    .option("--quiet", "suppress nonessential human output")
    .showHelpAfterError();
}

function commandContext(command: string, commandObject: Command): CommandContext {
  const rawOptions: unknown = commandObject.optsWithGlobals();
  const options = isRecord(rawOptions) ? rawOptions : {};
  const cwd = typeof options.cwd === "string" ? path.resolve(process.cwd(), options.cwd) : process.cwd();
  return {
    command, cwd,
    workspace: typeof options.workspace === "string" ? options.workspace : undefined,
    json: options.json === true, dryRun: options.dryRun === true, force: options.force === true,
    yes: options.yes === true, quiet: options.quiet === true,
    interactive: process.stdin.isTTY && process.stdout.isTTY && !options.json,
  };
}

function parseDecision(value: string): "accept" | "reject" | "postpone" {
  if (value === "accept" || value === "reject" || value === "postpone") return value;
  throw new InvalidArgumentError("decision must be accept, reject, or postpone");
}

function parseActorKind(value: string): "human" | "agent" {
  if (value === "human" || value === "agent") return value;
  throw new InvalidArgumentError("actor kind must be human or agent");
}

async function readPackageVersion(): Promise<string> {
  const packageUrl = new URL("../../../package.json", import.meta.url);
  const packageJson = JSON.parse(await readFile(packageUrl, "utf8")) as { version?: string };
  return packageJson.version ?? "0.0.0";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await main();
  process.exitCode = result.exitCode;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isFileSystemError(value: unknown): value is NodeJS.ErrnoException {
  return value instanceof Error && typeof (value as NodeJS.ErrnoException).code === "string";
}
