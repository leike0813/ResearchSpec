export type CliPayloadKind = "none" | "options" | "selector-options" | "yaml-json" | "positional-list";

export interface CliPayloadFieldDefinition {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface CliPayloadDefinition {
  kind: CliPayloadKind;
  summary: string;
  schema?: string;
  fields: readonly CliPayloadFieldDefinition[];
  constraints: readonly string[];
}

const handoffDescriptor = [
  field("role", "non-empty string", true, "Unique semantic role within its input or output list."),
  field("type", "non-empty string", true, "Artifact or information type."),
  field("path", "safe project-relative path", true, "External boundary file or directory; never a researchspec authority file."),
  field("purpose", "non-empty string", true, "Why the producer or consumer needs this role."),
  field("format", "qmd | html | docx | pdf | latex | latex-project", false, "Declared manuscript/render format when applicable."),
  field("renderer", "quarto", false, "Requires format when present."),
  field("path_kind", "file | directory", false, "Directory is allowed only for latex-project."),
  field("entry_path", "relative .tex path", false, "Required for latex-project."),
  field("limits", "string[]", false, "Known limitations or exclusions."),
  field("notes", "string", false, "Additional role-specific context."),
] as const;

export const CLI_PAYLOADS = {
  init: payload("options", "Optional bootstrap selections; the path positional argument defaults to the current directory.", [
    field("path", "directory path", false, "Project root to initialize or safely extend."),
    field("--tools", "all | none | comma-separated tool IDs", false, "Initial Agent-tool selection."),
    field("--delivery", "skills | commands | both", false, "Generated Agent surface mode."),
    field("--literature-adapters", "all | none | comma-separated Adapter IDs", false, "Optional literature Adapter selection."),
  ]),
  update: payload("options", "Optional replacement or extension selections for an existing current workspace.", [
    field("path", "directory path", false, "Project root containing the workspace."),
    field("--tools", "all | none | comma-separated tool IDs", false, "Refresh or add this tool subset."),
    field("--delivery", "skills | commands | both", false, "Replace the generated delivery mode; omission preserves current intent."),
    field("--literature-adapters", "all | none | comma-separated Adapter IDs", false, "Replace the selected Adapter set."),
  ]),
  status: none("No command payload. Reads the nearest current workspace and returns a bounded snapshot."),
  instructions: payload("selector-options", "One exact control or inspection selector.", [
    field("selector", "route:... | subflow:... | gate:... | decision:... | change:... | handoff:...", true, "Current item whose action contract is needed."),
  ]),
  start: payload("yaml-json", "A YAML or JSON object supplied through --input and validated before control creation.", [
    field("schema_version", 'literal "1"', true, "Current workspace command schema."),
    field("confirmed_at", "RFC 3339 timestamp with offset", true, "Time of the exact route confirmation."),
    field("profile_entry", "stable ID", false, "Entry ID for a pipeline parent."),
    field("parent", "{ instance_id, node_id }", false, "Owning parent instance and child node."),
    field("round", "positive integer", false, "Dynamic round number; requires parent."),
    field("prerequisites", "non-empty string[]", true, "Confirmed prerequisites, including an empty array when none apply."),
    field("handoff_inputs", "HandoffInput[]", true, "Confirmed input roles; each uses the descriptor fields below plus optional source_instance_id."),
    field("planned_outputs", "HandoffOutput[]", true, "Confirmed output roles; each uses the descriptor fields below plus optional intended_consumer."),
    field("manuscript_delivery", "ManuscriptDelivery", false, "Current manuscript delivery contract when the route consumes it."),
    field("quarto_probe", "available | unavailable | unknown object", false, "Static probe summary with checked_at and version or reason."),
    field("render_consent", "{ execute: true, confirmed_by, confirmed_at }", false, "Explicit consent for the current render action."),
    field("formal_gates", "stable ID[]", true, "Confirmed formal Gate IDs."),
    field("cost", "{ effort, interaction }", true, "Non-empty effort and interaction summaries."),
    ...handoffDescriptor.map((item) => ({ ...item, name: `handoff descriptor.${item.name}` })),
    field("--confirmed-by", "non-empty human name", true, "Human who confirmed this exact instance."),
  ], [
    "profile_entry and parent are mutually exclusive.",
    "round requires parent.",
    "handoff input roles and planned output roles must each be unique.",
  ], "SubflowStartCommandSchema"),
  advance: payload("selector-options", "A subflow selector plus an actor and optional authorized transition.", [
    field("subflow-selector", "subflow:<instance-id>", true, "Exact current subflow instance."),
    field("--transition", "profile transition ID | pause | resume | cancel | complete", false, "Omit only when the runtime has one unambiguous authorized transition."),
    field("--actor-name", "non-empty string", true, "Executor recorded in the owning control."),
  ]),
  check: payload("options", "An optional validation target and strictness flag.", [
    field("target", "all | specs | profiles | subflows | changes | handoffs | tools | plugins | literature-adapters", false, "Validation scope; defaults to all."),
    field("--strict", "boolean", false, "Treat warnings as failures."),
  ]),
  doctor: none("No command payload. Runs the full current-workspace diagnostic report."),
  list: payload("options", "An optional collection type with cursor pagination.", [
    field("type", "subflows | changes | gates | decisions | handoffs | profiles | tools | diagnostics | history", false, "Collection to list; defaults to subflows."),
    field("--limit", "integer 1..50", false, "Page size; defaults to 20."),
    field("--cursor", "opaque base64url cursor", false, "Cursor returned by the immediately preceding page for the same unchanged collection."),
  ]),
  show: payload("selector-options", "One exact stable spec, profile, subflow, Gate, Decision, change, handoff, or tool selector.", [
    field("selector", "spec:... | profile:... | subflow:... | gate:... | decision:... | change:... | handoff:... | tool:...", true, "Exact item to inspect."),
  ]),
  handoff: payload("yaml-json", "Optional YAML or JSON replacement payload supplied through --input; without it the command renders the current handoff.", [
    field("inputs", "HandoffInput[]", true, "Input role descriptors; each may add source_instance_id."),
    field("outputs", "HandoffOutput[]", true, "Output role descriptors; each may add intended_consumer."),
    field("body", "Markdown string", false, "Body written after generated frontmatter."),
    ...handoffDescriptor,
  ], [
    "Input roles and output roles must each be unique.",
    "qmd paths end in .qmd; single-file latex paths end in .tex; latex-project requires a directory and .tex entry_path.",
  ], "SubflowHandoffInputSchema"),
  pack: payload("options", "A required ZIP output and an optional bounded context scope.", [
    field("--output", "ZIP path", true, "Destination archive path."),
    field("--scope", "all | specs | profile | subflows | changes | subflow:<id> | change:<id>", false, "Bundle scope; defaults to all."),
  ]),
  propose: payload("options", "A safe change ID, target stable specs, and optional supporting documents.", [
    field("change-id", "safe kebab-case ID", true, "New project change directory and selector identity."),
    field("--targets", "comma-separated project.md | sources.yaml | claims.yaml | manuscript.yaml", true, "Stable specs whose meaning may change."),
    field("--with", "comma-separated design | tasks | delta", false, "Optional supporting documents; duplicates are ignored."),
  ]),
  decide: payload("selector-options", "One selector-specific human decision; option groups cannot be mixed.", [
    field("change:<id>", "--decision + --actor-name + optional --reason", false, "Project change outcome: accept, reject, defer, or supersede."),
    field("gate:<instance>/<gate>", "--verdict + --actor-name + optional --reason/--evidence-role", false, "Append pass, pass_with_conditions, or fail."),
    field("gate:<instance>/<gate>", "--override + --actor-name + --reason", false, "Approve the current failed Gate override."),
    field("decision:<instance>/<decision>", "--kind + --choice + --actor-name + optional --reason", false, "Record scope, claim, structure, or branch choice."),
  ], [
    "Exactly one selector-specific option group is valid.",
    "--override cannot be combined with --verdict.",
  ]),
  archive: payload("options", "One project change ID.", [field("change-id", "safe change ID", true, "Applied, rejected, deferred, or superseded change to archive.")]),
  plugin: none("No direct payload. Select one of the plugin subcommands."),
  "plugin-list": payload("options", "Optional discovery filters.", [
    field("--installed", "boolean", false, "Show only workspace-selected domains."),
    field("--summary", "boolean", false, "Use compact discovery metadata."),
  ]),
  "plugin-show": payload("options", "One domain plugin ID.", [
    field("plugin-id", "domain ID", true, "Available or recoverable installed domain."),
    field("--summary", "boolean", false, "Omit full provenance."),
  ]),
  "plugin-install": payload("positional-list", "One or more explicit domain IDs.", [
    field("plugin-ids", "domain ID[]", true, "Exact domains to select and project."),
    field("--summary", "boolean", false, "Emit aggregate write-plan impact."),
  ], ["Non-interactive execution also requires the global --yes flag."]),
  "plugin-uninstall": payload("positional-list", "One or more installed domain IDs.", [field("plugin-ids", "domain ID[]", true, "Exact selections to remove.")]),
  "plugin-update": payload("positional-list", "Zero or more installed domain IDs.", [field("plugin-ids", "domain ID[]", false, "Specific selections to refresh; omission updates all selected domains.")]),
  "plugin-instructions": payload("options", "One installed, projected, hash-clean Skill ID.", [field("skill-id", "Skill ID", true, "Plugin Skill whose advisory instructions are requested.")]),
} as const satisfies Record<string, CliPayloadDefinition>;

export function getCliPayloadDefinition(id: string): CliPayloadDefinition {
  const definition = CLI_PAYLOADS[id as keyof typeof CLI_PAYLOADS];
  if (!definition) throw new Error(`Missing CLI payload definition: ${id}`);
  return definition;
}

function none(summary: string): CliPayloadDefinition {
  return payload("none", summary, []);
}

function payload(
  kind: CliPayloadKind,
  summary: string,
  fields: readonly CliPayloadFieldDefinition[],
  constraints: readonly string[] = [],
  schema?: string,
): CliPayloadDefinition {
  return { kind, summary, fields, constraints, ...(schema ? { schema } : {}) };
}

function field(name: string, type: string, required: boolean, description: string): CliPayloadFieldDefinition {
  return { name, type, required, description };
}
