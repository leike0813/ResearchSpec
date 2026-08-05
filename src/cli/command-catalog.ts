import { Command, Option } from "commander";

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
  | "plugin-update"
  | "plugin-instructions";

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
  command("init", ["init"], "init [path]", "bootstrap", "Initialize or safely extend a ResearchSpec workspace", "none", "write", [
    option("tools", "--tools <ids>", "all, none, or comma-separated tool IDs"),
    option("literatureAdapters", "--literature-adapters <ids>", "all, none, or comma-separated literature Adapter IDs"),
  ], ["update", "status"]),
  command("update", ["update"], "update [path]", "bootstrap", "Refresh selected generated agent files", "required", "write", [
    option("tools", "--tools <ids>", "refresh/add a tool subset"),
    option("literatureAdapters", "--literature-adapters <ids>", "replace selected literature Adapters"),
  ], ["init", "status", "doctor"]),
  command("status", ["status"], "status", "control-plane", "Show derived current workspace and subflow status", "required", "read", [], ["instructions", "show", "list"]),
  command("instructions", ["instructions"], "instructions <selector>", "control-plane", "Show current route, subflow, Gate, Decision, change, or handoff instructions", "required", "read", [], ["status", "start", "advance", "decide"]),
  command("start", ["start"], "start <route-ref>", "control-plane", "Atomically start one independently confirmed route", "required", "write", [
    option("input", "--input <start.yaml|json>", "schema 1 semantic Start input", true),
    option("confirmedBy", "--confirmed-by <name>", "human who confirmed this exact instance", true),
  ], ["status", "instructions"]),
  command("advance", ["advance"], "advance <subflow-selector>", "control-plane", "Complete or advance one currently authorized subflow", "required", "write", [
    option("transition", "--transition <id>", "profile transition ID or pause, resume, cancel, complete"),
    option("actorName", "--actor-name <name>", "action executor name", true),
  ], ["status", "instructions"]),
  command("check", ["check"], "check [target]", "inspection", "Check specs, profiles, subflows, changes, handoffs, tools, plugins, or literature-adapters", "required", "read", [
    option("strict", "--strict", "treat warnings as failures"),
  ], ["status", "doctor", "show"]),
  command("doctor", ["doctor"], "doctor", "recovery", "Diagnose current workspace contracts without modifying them", "required", "read", [], ["check", "status"]),
  command("list", ["list"], "list [type]", "inspection", "List current subflows, changes, Gates, Decisions, handoffs, profiles, tools, diagnostics, or derived history", "required", "read", [
    option("limit", "--limit <count>", "page size from 1 to 50"),
    option("cursor", "--cursor <cursor>", "opaque cursor returned by the prior page"),
  ], ["show", "status"]),
  command("show", ["show"], "show <selector>", "inspection", "Show one exact current item, stable spec, or project profile", "required", "read", [], ["list", "check"]),
  command("handoff", ["handoff"], "handoff <subflow-selector>", "context", "Render or replace one directly editable subflow handoff", "required", "conditional-write", [
    option("input", "--input <handoff.yaml|json>", "semantic inputs, outputs, and optional Markdown body"),
  ], ["pack", "status"]),
  command("pack", ["pack"], "pack", "context", "Create a deterministic bounded current-workspace context bundle", "required", "write", [
    option("output", "--output <zip>", "output ZIP path", true),
    option("scope", "--scope <scope>", "all, specs, profile, subflows, changes, subflow:<id>, or change:<id>"),
  ], ["handoff", "check"]),
  command("propose", ["propose"], "propose <change-id>", "governance", "Create an adaptable project change document package", "required", "write", [
    option("targets", "--targets <specs>", "comma-separated project.md, sources.yaml, claims.yaml, or manuscript.yaml", true),
    option("with", "--with <documents>", "optional comma-separated design,tasks,delta documents"),
  ], ["decide", "show", "check"]),
  command("decide", ["decide"], "decide <selector>", "governance", "Resolve a pending human decision", "required", "write", [
    option("decision", "--decision <choice>", "accept, reject, defer, or supersede"),
    option("actorName", "--actor-name <name>", "human actor name"),
    option("reason", "--reason <text>", "decision rationale"),
    option("verdict", "--verdict <verdict>", "Gate verdict: pass, pass_with_conditions, or fail"),
    option("kind", "--kind <kind>", "local Decision kind: scope, claim, structure, or branch"),
    option("choice", "--choice <choice>", "confirmed local Decision choice"),
    option("override", "--override", "approve an override of the current failed Gate"),
    option("evidenceRole", "--evidence-role <role>", "owning handoff role used as Gate evidence"),
  ], ["instructions", "show", "archive"]),
  command("archive", ["archive"], "archive <change-id>", "governance", "Archive an applied, rejected, deferred, or superseded project change", "required", "write", [], ["list", "show"]),
  command("plugin", ["plugin"], "plugin", "plugins", "Inspect and manage bundled domain Skill plugins", "optional", "conditional-write", [], [
    "plugin-list", "plugin-show", "plugin-install", "plugin-uninstall", "plugin-update", "plugin-instructions",
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
  command("plugin-instructions", ["plugin", "instructions"], "instructions <skill-id>", "plugins", "Read an installed hash-clean plugin Skill for immediate advisory use", "required", "read", [], ["plugin-list", "plugin-show"]),
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
  return registered;
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
  return { id, path, syntax, group, description, workspace, effect, options, related };
}

function option(key: string, flags: string, description: string, required = false): CliOptionDefinition {
  return { key, flags, description, ...(required ? { required: true } : {}) };
}
