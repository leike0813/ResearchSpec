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
  | "submit"
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
    option("profile", "--profile <mode>", "adaptive or strict runtime profile"),
  ], ["update", "status"]),
  command("update", ["update"], "update [path]", "bootstrap", "Refresh selected generated agent files", "required", "write", [
    option("tools", "--tools <ids>", "refresh/add a tool subset"),
    option("migrateRuntime", "--migrate-runtime", "migrate a valid Schema 0.2 runtime to adaptive"),
    option("rollback", "--rollback <migration-id>", "restore the pre-migration runtime captured by a migration"),
    option("expectedPlanSha256", "--expected-plan-sha256 <hash>", "bind execution to the previewed migration or rollback plan"),
  ], ["init", "status", "doctor"]),
  command("status", ["status"], "status", "control-plane", "Show current run and pending-item status", "required", "read", [], ["instructions", "show", "list"]),
  command("instructions", ["instructions"], "instructions <selector>", "control-plane", "Show dynamic instructions for a runtime action selector", "required", "read", [], ["status", "start", "submit", "advance", "decide"]),
  command("start", ["start"], "start <subflow>", "control-plane", "Atomically start a confirmed template or delegated child subflow", "required", "write", [
    option("input", "--input <start.json>", "strict semantic Start JSON", true),
    option("actorKind", "--actor-kind <kind>", "human, agent, or script", true),
    option("actorName", "--actor-name <name>", "Start requester name", true),
    option("confirmedBy", "--confirmed-by <name>", "human who confirmed an external route"),
    option("expectedActionBasisSha256", "--expected-action-basis-sha256 <hash>", "bind execution to the current action descriptor"),
    option("expectedPlanSha256", "--expected-plan-sha256 <hash>", "bind execution to the previewed Start plan"),
  ], ["status", "instructions"]),
  command("submit", ["submit"], "submit <runtime-item>", "control-plane", "Submit a runtime candidate, attempt, evidence, resolution, patch, or confirmed Gate verdict", "required", "write", [
    option("input", "--input <payload.json>", "strict semantic submission JSON", true),
    option("actorKind", "--actor-kind <kind>", "human, agent, script, converter, or validator", true),
    option("actorName", "--actor-name <name>", "artifact producer name", true),
    option("confirmedBy", "--confirmed-by <name>", "human who confirmed a Gate verdict"),
    option("expectedActionBasisSha256", "--expected-action-basis-sha256 <hash>", "bind execution to the current action descriptor"),
    option("expectedSha256", "--expected-sha256 <hash>", "bind execution to the previewed candidate SHA-256"),
    option("expectedPlanSha256", "--expected-plan-sha256 <hash>", "bind execution to the previewed submission plan"),
  ], ["status", "instructions", "check"]),
  command("advance", ["advance"], "advance <transition>", "control-plane", "Complete or advance one currently authorized runtime action", "required", "write", [
    option("actorKind", "--actor-kind <kind>", "agent or script", true),
    option("actorName", "--actor-name <name>", "action executor name", true),
    option("expectedActionBasisSha256", "--expected-action-basis-sha256 <hash>", "bind execution to the current action descriptor"),
    option("expectedPlanSha256", "--expected-plan-sha256 <hash>", "bind execution to the previewed action plan"),
  ], ["status", "instructions"]),
  command("check", ["check"], "check [target]", "inspection", "Check all, contracts, runtime, artifacts, tools, plugins, or literature-adapters", "required", "read", [
    option("strict", "--strict", "treat warnings as failures"),
  ], ["status", "doctor", "show"]),
  command("doctor", ["doctor"], "doctor", "recovery", "Diagnose runtime damage or apply one plan-bound deterministic repair", "required", "conditional-write", [
    option("repair", "--repair <finding-id>", "preview or apply a deterministically repairable finding"),
    option("expectedPlanSha256", "--expected-plan-sha256 <hash>", "bind execution to the previewed Doctor repair plan"),
  ], ["check", "status"]),
  command("list", ["list"], "list [type]", "inspection", "List paginated runtime collections", "required", "read", [
    option("limit", "--limit <count>", "page size from 1 to 50"),
    option("cursor", "--cursor <cursor>", "opaque cursor returned by the prior page"),
  ], ["show", "status"]),
  command("show", ["show"], "show <item>", "inspection", "Show a canonical or globally unique item", "required", "read", [], ["list", "check"]),
  command("handoff", ["handoff"], "handoff", "context", "Render the current handoff view", "required", "conditional-write", [
    option("stdout", "--stdout", "print without writing"),
    option("out", "--out <path>", "output path"),
  ], ["pack", "status"]),
  command("pack", ["pack"], "pack", "context", "Create a deterministic context bundle", "required", "write", [
    option("out", "--out <path>", "output ZIP path"),
    option("includeArtifacts", "--include-artifacts", "include safe registered artifacts"),
  ], ["handoff", "check"]),
  command("propose", ["propose"], "propose <change-id>", "governance", "Create a validated pending contract change", "required", "write", [
    option("input", "--input <payload.json>", "strict semantic proposal JSON", true),
    option("actorKind", "--actor-kind <kind>", "human or agent", true),
    option("actorName", "--actor-name <name>", "proposal author name", true),
    option("expectedActionBasisSha256", "--expected-action-basis-sha256 <hash>", "bind execution to the current action descriptor"),
    option("expectedPlanSha256", "--expected-plan-sha256 <hash>", "bind execution to the previewed proposal plan"),
  ], ["decide", "show", "check"]),
  command("decide", ["decide"], "decide [item]", "governance", "Resolve a pending human decision", "required", "write", [
    option("decision", "--decision <choice>", "accept, reject, or postpone"),
    option("actorName", "--actor-name <name>", "human actor name"),
    option("reason", "--reason <text>", "decision rationale"),
    option("expectedActionBasisSha256", "--expected-action-basis-sha256 <hash>", "bind execution to the current action descriptor"),
    option("expectedPlanSha256", "--expected-plan-sha256 <hash>", "bind execution to the previewed decision plan"),
  ], ["instructions", "show", "archive"]),
  command("archive", ["archive"], "archive [item]", "governance", "Archive a resolved change or draft patch", "required", "write", [], ["list", "show"]),
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
    option("expectedPlanSha256", "--expected-plan-sha256 <hash>", "bind execution to the previewed plugin install plan"),
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
  const topLevelNames = new Set(CLI_TOP_LEVEL_COMMANDS.map((item) => item.path[0]));
  const topLevelIndex = argv.findIndex((token) => topLevelNames.has(token));
  if (topLevelIndex < 0) return "researchspec --help";
  const topLevel = argv[topLevelIndex] ?? "";
  if (topLevel !== "plugin") return `researchspec ${topLevel} --help`;
  const pluginName = argv[topLevelIndex + 1];
  const pluginDefinition = CLI_PLUGIN_COMMANDS.find((item) => item.path[1] === pluginName);
  return pluginDefinition
    ? `researchspec plugin ${pluginDefinition.path[1]} --help`
    : "researchspec plugin --help";
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
