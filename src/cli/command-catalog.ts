import { Command, Option } from "commander";

import { getCliPayloadDefinition, type CliPayloadDefinition } from "./payload-catalog.js";

export type CliCommandGroup =
  | "bootstrap"
  | "control-plane"
  | "inspection"
  | "recovery"
  | "context"
  | "governance"
  | "plugins";

export type CliWorkspaceRequirement = "none" | "optional" | "required";
export type CliEffect = "read" | "write" | "conditional-write";

export interface CliOptionDefinition {
  key: string;
  flags: string;
  description: string;
  required?: boolean;
}

export interface CliCommandDefinition {
  id: CliCommandId;
  path: readonly string[];
  syntax: string;
  group: CliCommandGroup;
  description: string;
  workspace: CliWorkspaceRequirement;
  effect: CliEffect;
  options: readonly CliOptionDefinition[];
  payload: CliPayloadDefinition;
  related: readonly CliCommandId[];
}

export type CliCommandId =
  | "init"
  | "update"
  | "status"
  | "instructions"
  | "start"
  | "advance"
  | "check"
  | "doctor"
  | "list"
  | "show"
  | "handoff"
  | "pack"
  | "propose"
  | "decide"
  | "archive"
  | "plugin"
  | "plugin-list"
  | "plugin-show"
  | "plugin-install"
  | "plugin-uninstall"
  | "plugin-update";

export interface CliGlobalOptionDefinition {
  key: string;
  flags: string;
  description: string;
}

export const CLI_GLOBAL_OPTIONS: readonly CliGlobalOptionDefinition[] = [
  { key: "cwd", flags: "--cwd <path>", description: "project working directory" },
  { key: "workspace", flags: "--workspace <path>", description: "explicit researchspec workspace" },
  { key: "json", flags: "--json", description: "emit one machine-readable envelope" },
  { key: "dryRun", flags: "--dry-run", description: "plan writes without modifying files" },
  { key: "force", flags: "--force", description: "refresh manifest-owned generated files" },
  { key: "yes", flags: "--yes", description: "skip low-risk confirmations" },
  { key: "quiet", flags: "--quiet", description: "suppress nonessential human output" },
];

const definitions: readonly CliCommandDefinition[] = [
  command("init", ["init"], "init [path]", "bootstrap", "Initialize or reconfigure a ResearchSpec workspace", "none", "write", [
    option("tools", "--tools <ids>", "replace with all, none, or comma-separated tool IDs"),
    option("delivery", "--delivery <mode>", "skills, commands, or both"),
    option("literatureAdapters", "--literature-adapters <ids>", "replace with all, none, or comma-separated literature Adapter IDs"),
    option("procedureSearch", "--procedure-search <mode>", "offline or hybrid; explicit hybrid prepares optional local search resources"),
    option("paperHumanizerGuard", "--paper-humanizer-guard <mode>", "on or off; omitted preserves the configured preference"),
  ], ["update", "status"]),
  command("update", ["update"], "update [path]", "bootstrap", "Refresh selected generated agent files", "required", "write", [
    option("tools", "--tools <ids>", "refresh/add a tool subset"),
    option("delivery", "--delivery <mode>", "skills, commands, or both"),
    option("literatureAdapters", "--literature-adapters <ids>", "replace selected literature Adapters"),
    option("procedureSearch", "--procedure-search <mode>", "offline or hybrid; explicit hybrid prepares or refreshes optional local search resources"),
    option("paperHumanizerGuard", "--paper-humanizer-guard <mode>", "on or off; omitted preserves the configured preference"),
  ], ["init", "status", "doctor"]),
  command("status", ["status"], "status", "control-plane", "Show derived schema 2 run/node status", "required", "read", [], ["instructions", "show", "list"]),
  command("instructions", ["instructions"], "instructions <selector>", "control-plane", "Show procedure, profile, run, node, Gate, Decision, or change instructions", "required", "read", [
    option("input", "--input <materials.yaml|json>", "optional standalone Procedure input and planned output bindings"),
  ], ["status", "start", "advance", "decide"]),
  command("start", ["start"], "start <profile-id|node-selector>", "control-plane", "Start a confirmed root run or one graph-authorized child run", "required", "write", [
    option("input", "--input <start.yaml|json>", "schema 2 root Start input"),
    option("confirmedBy", "--confirmed-by <name>", "human who confirmed this exact root run"),
  ], ["status", "instructions"]),
  command("advance", ["advance"], "advance <node-selector>", "control-plane", "Validate and complete one eligible graph node", "required", "write", [
    option("input", "--input <advance.yaml|json>", "output role submission payload", true),
    option("transition", "--transition <id>", "reserved for run-level transitions"),
    option("actorName", "--actor-name <name>", "action executor name"),
  ], ["status", "instructions"]),
  command("check", ["check"], "check [target]", "inspection", "Check schema 2 workspace contracts", "required", "read", [
    option("strict", "--strict", "treat warnings as failures"),
    option("input", "--input <materials.yaml|json>", "explicit input and delivered output bindings for procedure:<id>"),
  ], ["status", "doctor", "show"]),
  command("doctor", ["doctor"], "doctor", "recovery", "Diagnose current workspace contracts without modifying them", "required", "read", [], ["check", "status"]),
  command("list", ["list"], "list [type]", "inspection", "List procedures, tools, profiles, runs, nodes, changes, or diagnostics", "optional", "read", [
    option("limit", "--limit <count>", "page size from 1 to 50"),
    option("cursor", "--cursor <cursor>", "opaque cursor returned by the prior page"),
    option("query", "--query <text>", "original natural-language request for Procedure discovery"),
  ], ["show", "status"]),
  command("show", ["show"], "show <selector>", "inspection", "Show one exact procedure, profile, run, node, or project change", "optional", "read", [], ["list", "check"]),
  command("handoff", ["handoff"], "handoff <run-selector>", "context", "Render or replace one directly editable run handoff", "required", "conditional-write", [
    option("input", "--input <handoff.yaml|json>", "semantic inputs, outputs, and optional Markdown body"),
  ], ["pack", "status"]),
  command("pack", ["pack"], "pack", "context", "Create a deterministic bounded schema 2 context bundle", "required", "write", [
    option("output", "--output <zip>", "output ZIP path", true),
    option("scope", "--scope <scope>", "all, specs, profiles, runs, changes, run:<id>, or change:<id>"),
  ], ["handoff", "check"]),
  command("propose", ["propose"], "propose <change-id>", "governance", "Create an adaptable project change document package", "required", "write", [
    option("targets", "--targets <specs>", "comma-separated project.md, sources.yaml, claims.yaml, or manuscript.yaml", true),
    option("with", "--with <documents>", "optional comma-separated design,tasks,delta documents"),
  ], ["decide", "show", "check"]),
  command("decide", ["decide"], "decide <selector>", "governance", "Resolve a Gate, Decision, or project change choice", "required", "write", [
    option("decision", "--decision <choice>", "accept, reject, defer, or supersede"),
    option("actorName", "--actor-name <name>", "human actor name"),
    option("reason", "--reason <text>", "decision rationale"),
    option("verdict", "--verdict <verdict>", "Gate verdict: pass, pass_with_conditions, or fail"),
    option("choice", "--choice <choice>", "confirmed local Decision choice"),
    option("override", "--override", "approve an override of the current failed Gate"),
    option("evidenceRole", "--evidence-role <role>", "owning handoff role used as Gate evidence"),
  ], ["instructions", "show", "archive"]),
  command("archive", ["archive"], "archive <change-id>", "governance", "Archive an applied, rejected, deferred, or superseded project change", "required", "write", [], ["list", "show"]),
  command("plugin", ["plugin"], "plugin", "plugins", "Inspect and manage bundled domain Skill plugins", "optional", "conditional-write", [], [
    "plugin-list", "plugin-show", "plugin-install", "plugin-uninstall", "plugin-update",
  ]),
  command("plugin-list", ["plugin", "list"], "list", "plugins", "List bundled domain Skill plugins", "optional", "read", [
    option("installed", "--installed", "show only workspace-selected plugins"),
    option("summary", "--summary", "emit compact discovery metadata"),
  ], ["plugin-show", "plugin-install"]),
  command("plugin-show", ["plugin", "show"], "show <plugin-id>", "plugins", "Show bundled plugin metadata and provenance", "optional", "read", [
    option("summary", "--summary", "emit compact Skill descriptions without full provenance"),
  ], ["plugin-list", "plugin-install"]),
  command("plugin-install", ["plugin", "install"], "install <plugin-ids...>", "plugins", "Select and project plugins into the current workspace", "required", "write", [
    option("summary", "--summary", "emit aggregate write-plan impact"),
  ], ["plugin-list", "plugin-show", "plugin-uninstall", "plugin-update"]),
  command("plugin-uninstall", ["plugin", "uninstall"], "uninstall <plugin-ids...>", "plugins", "Remove selected plugins from the current workspace", "required", "write", [], ["plugin-list", "plugin-install"]),
  command("plugin-update", ["plugin", "update"], "update [plugin-ids...]", "plugins", "Refresh selected plugins, or all when IDs are omitted", "required", "write", [], ["plugin-list", "plugin-show"]),
];

export const CLI_COMMAND_CATALOG: readonly CliCommandDefinition[] = definitions;
export const CLI_TOP_LEVEL_COMMANDS = definitions.filter((item) => item.path.length === 1);
export const CLI_PLUGIN_COMMANDS = definitions.filter((item) => item.path[0] === "plugin" && item.path.length === 2);

export type CliOptionParser = (value: string, previous: unknown) => unknown;

export function getCliCommandDefinition(id: CliCommandId): CliCommandDefinition {
  const definition = definitions.find((item) => item.id === id);
  if (!definition) throw new Error(`Unknown CLI command catalog ID: ${id}`);
  return definition;
}

export function registerCliCommand(
  parent: Command,
  id: CliCommandId,
  parsers: Readonly<Partial<Record<string, CliOptionParser>>> = {},
): Command {
  const definition = getCliCommandDefinition(id);
  const registered = parent.command(definition.syntax).description(definition.description);
  for (const optionDefinition of definition.options) {
    const registeredOption = new Option(optionDefinition.flags, optionDefinition.description);
    if (optionDefinition.required) registeredOption.makeOptionMandatory();
    const parser = parsers[optionDefinition.key];
    if (parser) registeredOption.argParser(parser);
    registered.addOption(registeredOption);
  }
  registered.addHelpText("after", `\n${renderCliPayloadHelp(definition)}`);
  return registered;
}

export function renderCliPayloadHelp(definition: CliCommandDefinition): string {
  const payload = definition.payload;
  const lines = ["Input shape:", `  ${payload.summary}`];
  if (payload.schema) lines.push(`  Runtime schema: ${payload.schema}`);
  for (const field of payload.fields) {
    lines.push(`  ${field.name} (${field.type}${field.required ? ", required" : ", optional"}): ${field.description}`);
  }
  if (payload.constraints.length > 0) {
    lines.push("  Constraints:");
    for (const constraint of payload.constraints) lines.push(`    - ${constraint}`);
  }
  return `${lines.join("\n")}\n`;
}

export function applyGlobalCliOptions(program: Command): Command {
  for (const definition of CLI_GLOBAL_OPTIONS) {
    program.addOption(new Option(definition.flags, definition.description));
  }
  return program;
}

export function cliHelpTarget(argv: readonly string[]): string {
  const positional = cliPositionalTokens(argv);
  const target = [...CLI_COMMAND_CATALOG]
    .sort((left, right) => right.path.length - left.path.length)
    .find((definition) => definition.path.every((part, index) => positional[index] === part));
  return target ? `researchspec ${target.path.join(" ")} --help` : "researchspec --help";
}

function cliPositionalTokens(argv: readonly string[]): string[] {
  const optionDefinitions = [
    ...CLI_GLOBAL_OPTIONS,
    ...CLI_COMMAND_CATALOG.flatMap((definition) => definition.options),
  ];
  const valueOptions = new Set(
    optionDefinitions
      .filter((definition) => /[<[].+[>\]]/.test(definition.flags))
      .flatMap((definition) => definition.flags.match(/--[a-z0-9-]+/gi) ?? []),
  );
  const positional: string[] = [];
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index] ?? "";
    if (token === "--") {
      positional.push(...argv.slice(index + 1));
      break;
    }
    if (token.startsWith("--")) {
      const optionName = token.split("=", 1)[0] ?? token;
      if (!token.includes("=") && valueOptions.has(optionName)) index += 1;
      continue;
    }
    if (token.startsWith("-")) continue;
    positional.push(token);
  }
  return positional;
}

function command(
  id: CliCommandId,
  path: readonly string[],
  syntax: string,
  group: CliCommandGroup,
  description: string,
  workspace: CliWorkspaceRequirement,
  effect: CliEffect,
  options: readonly CliOptionDefinition[],
  related: readonly CliCommandId[],
): CliCommandDefinition {
  return { id, path, syntax, group, description, workspace, effect, options, payload: getCliPayloadDefinition(id), related };
}

function option(key: string, flags: string, description: string, required = false): CliOptionDefinition {
  return { key, flags, description, ...(required ? { required: true } : {}) };
}
