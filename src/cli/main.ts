import { readFile } from "node:fs/promises";
import path from "node:path";
import { Command, CommanderError, InvalidArgumentError } from "commander";

import {
  handleGraphAdvance,
  handleGraphCheck,
  handleGraphDecide,
  handleGraphDoctor,
  handleGraphInstructions,
  handleGraphStart,
  handleGraphStatus,
  type GraphAdvanceOptions,
  type GraphDecideOptions,
  type GraphDoctorOptions,
  type GraphStartOptions,
} from "./handlers/graph.js";
import { handleGraphInit, handleGraphUpdate, type GraphInitOptions, type GraphUpdateOptions } from "./handlers/graph-bootstrap.js";
import {
  handleGraphArchive,
  handleGraphChangeDecision,
  handleGraphHandoff,
  handleGraphList,
  handleGraphPack,
  handleGraphPropose,
  handleGraphShow,
  type GraphHandoffOptions,
  type GraphListOptions,
  type GraphPackOptions,
  type GraphProposeOptions,
} from "./handlers/graph-context.js";
import {
  handleGraphPluginInstall,
  handleGraphPluginInstructions,
  handleGraphPluginList,
  handleGraphPluginShow,
  handleGraphPluginUninstall,
  handleGraphPluginUpdate,
  type PluginListOptions,
  type PluginShowOptions,
} from "./handlers/graph-plugins.js";
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
  registerCliCommand(program, "init", { delivery: parseDeliveryMode })
    .action(async (target: string | undefined, options: GraphInitOptions, command: Command) => run("init", command, () => handleGraphInit(target, options, commandContext("init", command))));
  registerCliCommand(program, "update", { delivery: parseDeliveryMode })
    .action(async (target: string | undefined, options: GraphUpdateOptions, command: Command) => run("update", command, () => handleGraphUpdate(options, commandContext("update", command))));
  registerCliCommand(program, "status")
    .action(async (_options: Record<string, never>, command: Command) => run("status", command, () => handleGraphStatus(commandContext("status", command))));
  registerCliCommand(program, "instructions")
    .action(async (selector: string, _options: Record<string, never>, command: Command) => run("instructions", command, () => handleGraphInstructions(selector, commandContext("instructions", command))));
  registerCliCommand(program, "start")
    .action(async (profileId: string, options: GraphStartOptions, command: Command) => run("start", command, () => handleGraphStart({ input: options.input, profile: profileId, confirmedBy: options.confirmedBy }, commandContext("start", command))));
  registerCliCommand(program, "advance")
    .action(async (selector: string, options: GraphAdvanceOptions, command: Command) => run("advance", command, () => handleGraphAdvance(selector, { input: options.input, actorName: options.actorName }, commandContext("advance", command))));
  registerCliCommand(program, "check")
    .action(async (_target: string | undefined, options: { strict?: boolean }, command: Command) => run("check", command, () => handleGraphCheck(Boolean(options.strict), commandContext("check", command))));
  registerCliCommand(program, "doctor")
    .action(async (_options: GraphDoctorOptions, command: Command) => run("doctor", command, () => handleGraphDoctor(commandContext("doctor", command))));
  registerCliCommand(program, "list")
    .action(async (type: string | undefined, options: GraphListOptions, command: Command) => run("list", command, () => handleGraphList(type, options, commandContext("list", command))));
  registerCliCommand(program, "show")
    .action(async (item: string, _options: Record<string, never>, command: Command) => run("show", command, () => handleGraphShow(item, commandContext("show", command))));
  registerCliCommand(program, "handoff")
    .action(async (selector: string, options: GraphHandoffOptions, command: Command) => run("handoff", command, () => handleGraphHandoff(selector, options, commandContext("handoff", command))));
  registerCliCommand(program, "pack")
    .action(async (options: GraphPackOptions, command: Command) => run("pack", command, () => handleGraphPack(options, commandContext("pack", command))));
  registerCliCommand(program, "propose")
    .action(async (changeId: string, options: GraphProposeOptions, command: Command) => run("propose", command, () => handleGraphPropose(changeId, options, commandContext("propose", command))));
  registerCliCommand(program, "decide", { decision: parseDecision, verdict: parseVerdict, kind: parseLocalDecisionKind })
    .action(async (item: string | undefined, options: GraphDecideOptions, command: Command) => run("decide", command, async () => {
      const context = commandContext("decide", command);
      if (item?.startsWith("change:")) {
        const changeId = item.slice("change:".length);
        if (!options.decision) throw new CliError("change_decision_required", "Project change Decide requires --decision.", 2);
        const actor = options.actorName?.trim();
        if (!actor) throw new CliError("human_actor_required", "Decide requires --actor-name.", 2);
        const reason = options.reason?.trim();
        if (!reason) throw new CliError("change_reason_required", "Project change Decide requires --reason.", 2);
        return handleGraphChangeDecision(changeId, options.decision, actor, reason, context);
      }
      return handleGraphDecide(item ?? "", options, context);
    }));
  registerCliCommand(program, "archive")
    .action(async (changeId: string, _options: Record<string, never>, command: Command) => run("archive", command, () => handleGraphArchive(changeId, commandContext("archive", command))));
  const plugin = registerCliCommand(program, "plugin");
  registerCliCommand(plugin, "plugin-list")
    .action(async (options: PluginListOptions, command: Command) => run("plugin", command, () => handleGraphPluginList(options, commandContext("plugin", command))));
  registerCliCommand(plugin, "plugin-show")
    .action(async (pluginId: string, options: PluginShowOptions, command: Command) => run("plugin", command, () => handleGraphPluginShow(pluginId, options, commandContext("plugin", command))));
  registerCliCommand(plugin, "plugin-install")
    .action(async (pluginIds: string[], _options: Record<string, never>, command: Command) => run("plugin", command, () => handleGraphPluginInstall(pluginIds, commandContext("plugin", command))));
  registerCliCommand(plugin, "plugin-uninstall")
    .action(async (pluginIds: string[], _options: Record<string, never>, command: Command) => run("plugin", command, () => handleGraphPluginUninstall(pluginIds, commandContext("plugin", command))));
  registerCliCommand(plugin, "plugin-update")
    .action(async (pluginIds: string[], _options: Record<string, never>, command: Command) => run("plugin", command, () => handleGraphPluginUpdate(pluginIds, commandContext("plugin", command))));
  registerCliCommand(plugin, "plugin-instructions")
    .action(async (skillId: string, _options: Record<string, never>, command: Command) => run("plugin", command, () => handleGraphPluginInstructions(skillId, commandContext("plugin", command))));
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

function parseDecision(value: string): "accept" | "reject" | "defer" | "supersede" {
  if (value === "accept" || value === "reject" || value === "defer" || value === "supersede") return value;
  throw new InvalidArgumentError("decision must be accept, reject, defer, or supersede");
}

function parseVerdict(value: string): "pass" | "pass_with_conditions" | "fail" {
  if (value === "pass" || value === "pass_with_conditions" || value === "fail") return value;
  throw new InvalidArgumentError("verdict must be pass, pass_with_conditions, or fail");
}

function parseLocalDecisionKind(value: string): "scope" | "claim" | "structure" | "branch" {
  if (value === "scope" || value === "claim" || value === "structure" || value === "branch") return value;
  throw new InvalidArgumentError("kind must be scope, claim, structure, or branch");
}

function parseDeliveryMode(value: string): "skills" | "commands" | "both" {
  if (value === "skills" || value === "commands" || value === "both") return value;
  throw new InvalidArgumentError("delivery must be skills, commands, or both");
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
