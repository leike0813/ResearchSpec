import { readFile } from "node:fs/promises";
import path from "node:path";
import { Command, CommanderError, InvalidArgumentError } from "commander";

import {
  handleAdvance, handleArchive, handleDecide, handleHandoff, handleInstructions, handleList,
  handlePack, handlePropose, handleShow, handleStart, handleSubmit, type DecideOptions,
  handlePluginInstall, handlePluginInstructions, handlePluginList, handlePluginShow, handlePluginUninstall, handlePluginUpdate,
  type AdvanceOptions, type HandoffOptions, type ListOptions, type PackOptions, type PluginInstallOptions, type PluginListOptions, type PluginShowOptions, type ProposeOptions, type StartOptions, type SubmitOptions,
} from "./handlers.js";
import {
  handleCurrentCheck,
  handleCurrentDoctor,
  handleCurrentInit,
  handleCurrentStatus,
  handleCurrentUpdate,
  type CurrentDoctorOptions,
  type CurrentInitOptions,
  type CurrentUpdateOptions,
} from "./current-handlers.js";
import { applyGlobalCliOptions, cliHelpTarget, registerCliCommand } from "./command-catalog.js";
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
    const usage = failure(argv[0] ?? "cli", new CliError("usage_error", message, 2, `Run ${cliHelpTarget(argv)} for usage.`));
    if (jsonRequested) presentResult(usage, true);
    return { exitCode: 2 };
  }
}

type Runner = (command: string, commandObject: Command, action: () => Promise<CommandResult>) => Promise<void>;

function registerCommands(program: Command, run: Runner): void {
  registerCliCommand(program, "init")
    .action(async (target: string | undefined, options: CurrentInitOptions, command: Command) => run("init", command, () => handleCurrentInit(target, options, commandContext("init", command))));
  registerCliCommand(program, "update")
    .action(async (target: string | undefined, options: CurrentUpdateOptions, command: Command) => run("update", command, () => handleCurrentUpdate(target, options, commandContext("update", command))));
  registerCliCommand(program, "status")
    .action(async (_options: Record<string, never>, command: Command) => run("status", command, () => handleCurrentStatus(commandContext("status", command))));
  registerCliCommand(program, "instructions")
    .action(async (selector: string, _options: Record<string, never>, command: Command) => run("instructions", command, () => handleInstructions(selector, commandContext("instructions", command))));
  registerCliCommand(program, "start")
    .action(async (subflow: string, options: StartOptions, command: Command) => run("start", command, () => handleStart(subflow, options, commandContext("start", command))));
  registerCliCommand(program, "submit")
    .action(async (runtimeItem: string, options: SubmitOptions, command: Command) => run("submit", command, () => handleSubmit(runtimeItem, options, commandContext("submit", command))));
  registerCliCommand(program, "advance")
    .action(async (transition: string, options: AdvanceOptions, command: Command) => run("advance", command, () => handleAdvance(transition, options, commandContext("advance", command))));
  registerCliCommand(program, "check")
    .action(async (target: string | undefined, options: { strict?: boolean }, command: Command) => run("check", command, () => handleCurrentCheck(target, Boolean(options.strict), commandContext("check", command))));
  registerCliCommand(program, "doctor")
    .action(async (options: CurrentDoctorOptions, command: Command) => run("doctor", command, () => handleCurrentDoctor(options, commandContext("doctor", command))));
  registerCliCommand(program, "list")
    .action(async (type: string | undefined, options: ListOptions, command: Command) => run("list", command, () => handleList(type, options, commandContext("list", command))));
  registerCliCommand(program, "show")
    .action(async (item: string, _options: Record<string, never>, command: Command) => run("show", command, () => handleShow(item, commandContext("show", command))));
  registerCliCommand(program, "handoff")
    .action(async (options: HandoffOptions, command: Command) => run("handoff", command, () => handleHandoff(options, commandContext("handoff", command))));
  registerCliCommand(program, "pack")
    .action(async (options: PackOptions, command: Command) => run("pack", command, () => handlePack(options, commandContext("pack", command))));
  registerCliCommand(program, "propose", { actorKind: parseActorKind })
    .action(async (changeId: string, options: ProposeOptions, command: Command) => run("propose", command, () => handlePropose(changeId, options, commandContext("propose", command))));
  registerCliCommand(program, "decide", { decision: parseDecision })
    .action(async (item: string | undefined, options: DecideOptions, command: Command) => run("decide", command, () => handleDecide(item, options, commandContext("decide", command))));
  registerCliCommand(program, "archive")
    .action(async (item: string | undefined, _options: Record<string, never>, command: Command) => run("archive", command, () => handleArchive(item, commandContext("archive", command))));
  const plugin = registerCliCommand(program, "plugin");
  registerCliCommand(plugin, "plugin-list")
    .action(async (options: PluginListOptions, command: Command) => run("plugin", command, () => handlePluginList(options, commandContext("plugin", command))));
  registerCliCommand(plugin, "plugin-show")
    .action(async (pluginId: string, options: PluginShowOptions, command: Command) => run("plugin", command, () => handlePluginShow(pluginId, options, commandContext("plugin", command))));
  registerCliCommand(plugin, "plugin-install")
    .action(async (pluginIds: string[], options: PluginInstallOptions, command: Command) => run("plugin", command, () => handlePluginInstall(pluginIds, options, commandContext("plugin", command))));
  registerCliCommand(plugin, "plugin-uninstall")
    .action(async (pluginIds: string[], _options: Record<string, never>, command: Command) => run("plugin", command, () => handlePluginUninstall(pluginIds, commandContext("plugin", command))));
  registerCliCommand(plugin, "plugin-update")
    .action(async (pluginIds: string[], _options: Record<string, never>, command: Command) => run("plugin", command, () => handlePluginUpdate(pluginIds ?? [], commandContext("plugin", command))));
  registerCliCommand(plugin, "plugin-instructions")
    .action(async (skillId: string, _options: Record<string, never>, command: Command) => run("plugin", command, () => handlePluginInstructions(skillId, commandContext("plugin", command))));
}

async function createProgram(): Promise<Command> {
  const program = new Command()
    .name("researchspec")
    .description("Agent-neutral, file-based research contract framework")
    .version(await readPackageVersion(), "-v, --version")
    .addHelpText("after", "\nFull documentation: https://leike0813.github.io/ResearchSpec/\n中文文档: https://leike0813.github.io/ResearchSpec/zh-Hans/\n");
  return applyGlobalCliOptions(program).showHelpAfterError();
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isFileSystemError(value: unknown): value is NodeJS.ErrnoException {
  return value instanceof Error && typeof (value as NodeJS.ErrnoException).code === "string";
}
