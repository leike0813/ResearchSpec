## Purpose
Define the fixed public CLI, its machine contract, and current-workspace behavior.

## Requirements

### Requirement: Complete Public Command Surface
The packaged CLI SHALL expose exactly `init`, `update`, `status`, `instructions`, `start`, `advance`,
`check`, `list`, `show`, `handoff`, `pack`, `propose`, `decide`, `archive`, `doctor`, and `plugin` as
top-level commands.

#### Scenario: User requests top-level help
- **WHEN** the packaged CLI renders top-level help
- **THEN** all sixteen commands are listed exactly once
- **AND** `submit` is not exposed

### Requirement: Common Command Context

ResearchSpec SHALL apply `--cwd`, `--workspace`, `--json`, `--dry-run`,
`--force`, `--yes`, and `--quiet` consistently to commands that support those
behaviors.

#### Scenario: Explicit workspace takes precedence

- **WHEN** both cwd and an explicit workspace path are supplied
- **THEN** the CLI SHALL use the explicit workspace after validating it

#### Scenario: Machine mode never prompts

- **WHEN** a command is run with `--json` or without a TTY
- **THEN** the CLI SHALL NOT wait for interactive input
- **AND** missing required selections SHALL return exit code 2

#### Scenario: Dry run shares the write plan

- **WHEN** a writing command is run with `--dry-run`
- **THEN** it SHALL report the same planned operations that execution would use
- **AND** it SHALL NOT modify files

### Requirement: Versioned Machine Result Contract

Every command supporting `--json` SHALL return one `CliEnvelope` containing
`schema_version`, `command`, `ok`, `data`, `diagnostics`, and an optional
structured `error`.

#### Scenario: JSON success is isolated

- **WHEN** a JSON command succeeds
- **THEN** stdout SHALL contain exactly one valid envelope with
  `schema_version` equal to `1`
- **AND** human progress SHALL NOT be mixed into stdout

#### Scenario: JSON expected failure remains parseable

- **WHEN** a JSON command encounters a domain, usage, or write conflict
- **THEN** stdout SHALL contain exactly one valid failure envelope
- **AND** the process SHALL return the mapped exit class

### Requirement: Read Commands Use Current Workspace State
Status, list, show, instructions, check and doctor SHALL derive their results from current stable
specs, profile, controls, handoffs and changes without writing project files.

#### Scenario: Read command succeeds or reports a blocker
- **WHEN** any read command executes against a current or unsupported workspace
- **THEN** it produces no workspace mutation

### Requirement: Plugin Command Group
The CLI SHALL expose `plugin list [--installed] [--summary]`,
`plugin show <domain-id> [--summary]`, `plugin install <domain-ids...>`,
`plugin uninstall <domain-ids...>`, `plugin update [domain-ids...]`, and
`plugin instructions <skill-id>` while retaining `plugin` as one top-level
command.

#### Scenario: Domain catalog is listed outside a workspace
- **WHEN** a user runs normal `plugin list` without a workspace
- **THEN** the CLI SHALL list only stable non-empty domains without vendor names
- **AND** empty internal domains SHALL be absent from human and JSON output

#### Scenario: Empty domain is not installable
- **WHEN** a user shows or installs an internally registered domain with no reviewed Skills
- **THEN** the CLI SHALL reject it as unavailable without changing workspace state

#### Scenario: Installed unavailable domain remains recoverable
- **WHEN** an already selected domain is missing or empty and the user runs installed list or status
- **THEN** machine and human output SHALL identify the selection as unavailable
- **AND** uninstall SHALL remain available through saved resolution evidence while update SHALL block

#### Scenario: Domain details expose provenance
- **WHEN** a user runs `plugin show <domain-id>` for an available domain
- **THEN** the CLI SHALL distinguish direct and resolved Skills
- **AND** it MAY expose domain type, ANZSRC Group code, vendor, revision, license, and dependency provenance

#### Scenario: Machine output distinguishes intent and projection
- **WHEN** plugin lifecycle or status JSON is requested
- **THEN** it SHALL distinguish selected domains, available domains, unavailable selections, resolved Skills, and projected Skills

#### Scenario: Compact catalog views are requested
- **WHEN** `--summary` is used for list or show
- **THEN** output SHALL omit full license and upstream provenance
- **AND** it SHALL retain identity, availability, installation, projection,
  counts, descriptions, dependencies, and entry hashes needed for Agent
  discovery

#### Scenario: Exact installed instructions are requested
- **WHEN** the caller requests an eligible installed Skill
- **THEN** the command SHALL return one versioned read-only instruction packet
- **AND** it SHALL not enter the runtime selector protocol or modify workspace

### Requirement: Init And Update Reconcile Generated Agent Projections

`init` and `update` SHALL use the same ownership-aware reconciliation for
desired and obsolete project-local Agent and literature-Adapter projections.

#### Scenario: Existing selection converges through update

- **WHEN** a current workspace records selected tools and literature Adapters
- **THEN** update SHALL project the fixed ten-Skill surface and every selected Adapter Skill
- **AND** it SHALL produce manifest ownership facts equivalent to fresh init with the same selections

#### Scenario: Reconciliation preserves user changes

- **WHEN** an obsolete projection is unmanifested or differs from its recorded hash
- **THEN** update SHALL leave it unchanged and report the applicable ownership or drift boundary
- **AND** repeated reconciliation SHALL be idempotent

#### Scenario: Public command surface is unchanged

- **WHEN** Adapter projection becomes optional
- **THEN** CLI help SHALL continue to expose exactly sixteen top-level commands
- **AND** no Adapter management command SHALL be added

### Requirement: Literature Adapter Status Is Static

The existing status and check command surface SHALL report catalog and selected
literature-adapter installation health without adding a top-level command or
live connection probe.

#### Scenario: Unselected Adapter is reported

- **WHEN** `zotero-library` is not selected
- **THEN** status SHALL report `not-selected` and check SHALL not treat absent Adapter files as missing
- **AND** neither command SHALL execute the runtime, connect to Host Bridge, access the network, or read credentials

#### Scenario: Selected Adapter files are inspected

- **WHEN** desired runtime or Skill files are missing, drifted, unsupported, or conflicted
- **THEN** status SHALL return the corresponding structured Adapter state and diagnostics
- **AND** the inspection SHALL remain static

### Requirement: Catalog-Backed Static CLI Discovery

ResearchSpec SHALL maintain one typed static CLI catalog for the seven global
options, the exact sixteen top-level commands, and the `plugin` subcommands.
The catalog SHALL provide the stable synopsis and help metadata used by
Commander help and by the deterministic packaged CLI handbook. Handler binding
and command execution MAY remain explicit, but they SHALL consume the same
catalog identity rather than define a second public command surface.

#### Scenario: Root, command, and plugin help require no workspace

- **WHEN** a user runs `researchspec --help`, `researchspec <command> --help`,
  or `researchspec plugin --help` outside a ResearchSpec workspace
- **THEN** the CLI SHALL render the applicable catalog-backed help without
  attempting workspace discovery or mutation
- **AND** root help SHALL list each of the seventeen top-level commands exactly
  once
- **AND** plugin help SHALL list only its declared subcommands

#### Scenario: Packaged handbook is derived static discovery

- **WHEN** ResearchSpec packages its public documentation
- **THEN** it SHALL include a deterministic CLI handbook derived from the
  static catalog
- **AND** the handbook SHALL identify global options, command and plugin
  synopsis, selector-family discovery, and the boundary to runtime
  instructions
- **AND** it SHALL not require a workspace or encode live action availability

### Requirement: Contextual Usage And Complete Selector-Family Hints

Usage failures SHALL retain exit code 2 and provide a help target appropriate
to the invoked root command or plugin subcommand. Invalid runtime-action
selectors SHALL additionally identify every supported selector family:
`subflow:`, `obligation:`, `gate:`, `completion:`, `case-action:`, `patch:`,
`change:`, `work:`, and `transition:`.

#### Scenario: Invalid action selector is discoverable across profiles

- **WHEN** a caller supplies an invalid selector to `researchspec instructions`
- **THEN** the CLI SHALL return the stable invalid-selector usage error and
  exit code 2
- **AND** its hint SHALL direct the caller to `researchspec instructions --help`
  and identify the complete selector-family set
- **AND** the hint SHALL not imply that every family is currently available in
  the caller's workspace

#### Scenario: Plugin usage failure remains contextual

- **WHEN** a caller supplies invalid syntax to a `plugin` subcommand
- **THEN** the CLI SHALL direct the caller to the corresponding plugin help
  surface
- **AND** it SHALL not redirect the caller to an unrelated runtime selector or
  require a workspace merely to render usage guidance

### Requirement: Static Discovery Does Not Authorize Runtime Actions

Static help and the CLI handbook SHALL describe command shape and discovery
only. They SHALL NOT expand the runtime selector grammar, create an action
descriptor, reveal a live frontier, construct a semantic payload, or authorize
a write. `status` and `instructions <runtime-selector>` remain the only public
sources for current runtime action availability and descriptor-owned execution
requirements.

#### Scenario: Handbook precedes a runtime write

- **WHEN** a user reads static help or the handbook and then intends a
  workspace-bound write
- **THEN** the guidance SHALL direct the caller to current `status` and the
  selected runtime `instructions` packet
- **AND** no `cli:<command>` selector or additional public command SHALL be
  introduced

### Requirement: Every CLI Input Has a Catalog-Backed Payload Contract

The typed CLI catalog SHALL define a payload contract for every public command and plugin subcommand. The contract SHALL identify whether input is absent, scalar, list, selector, or YAML/JSON, and SHALL document field shapes, requiredness, allowed values, and cross-field constraints. File payload documentation SHALL name the runtime schema that validates it.

#### Scenario: Agent reads a file-payload command

- **WHEN** an Agent inspects `start` or `handoff` handbook/help
- **THEN** it SHALL see the complete top-level object shape, nested field forms, required fields, and validation constraints
- **AND** the documented schema SHALL match the runtime Zod contract

#### Scenario: Agent reads a selector-specific command

- **WHEN** an Agent inspects `decide`, `instructions`, `advance`, `show`, or `check`
- **THEN** the help and handbook SHALL identify accepted selector families and selector-dependent options

### Requirement: Help And Handbook Share Payload Rendering

Commander `--help`, the packaged CLI handbook, and generated CLI command pages SHALL render payload descriptions from the same typed catalog. No command SHALL rely on a hand-maintained payload description.

#### Scenario: Help is requested outside a workspace

- **WHEN** a user runs any public command's `--help`
- **THEN** the payload contract SHALL be available without workspace discovery or mutation

### Requirement: Status Is A Bounded Current Snapshot

`status --json` SHALL return a bounded static snapshot containing workspace/schema/profile identity, stable-spec counts, subflow counts and active instances, current frontier selectors, pending Gate/Decision selectors, blockers, aggregate Agent-tool health, compact literature-Adapter health, and diagnostic counts. Growing collections SHALL expose `total` and `truncated` with a fixed item cap.

#### Scenario: Status is requested in a large workspace

- **WHEN** the workspace contains many tools, history events, diagnostics, changes, or frontier items
- **THEN** status SHALL omit full history, full change/control/tool/Adapter objects, per-tool projection arrays, file hashes/paths, and diagnostic details
- **AND** detailed records SHALL remain available through `list`, `show`, `check`, or `doctor`

#### Scenario: Status reports a degraded static surface

- **WHEN** load-time or static Adapter inspection finds blocking or warning conditions
- **THEN** status SHALL report aggregate diagnostic counts and preserve the corresponding non-zero status result
- **AND** the JSON envelope SHALL not include the unbounded diagnostic list

### Requirement: Catalog-aware contextual help
The CLI SHALL parse contextual help targets by skipping recognized option values and matching the longest catalog command path.

#### Scenario: Option value resembles a command
- **WHEN** a global option value equals a top-level command name in either separated or equals syntax
- **THEN** the value SHALL NOT be treated as the help target

#### Scenario: Plugin subcommand help
- **WHEN** the positional path identifies a registered plugin subcommand
- **THEN** the usage hint SHALL target that longest registered command path

### Requirement: Current Bootstrap Options

`init` and `update` SHALL accept `--literature-adapters <ids>` alongside tool
selection while exposing no runtime-profile, migration, rollback or runtime
plan-hash option.

#### Scenario: Adapter expression is supplied

- **WHEN** a caller supplies `--literature-adapters none`, `all`, or comma-separated catalog IDs
- **THEN** the CLI SHALL normalize and validate the selection
- **AND** `all` or `none` mixed with explicit IDs SHALL return a usage error

#### Scenario: Update option is omitted

- **WHEN** update runs without `--literature-adapters`
- **THEN** it SHALL preserve the configured Adapter selection

#### Scenario: Removed option is supplied

- **WHEN** a user supplies `--profile`, `--migrate-runtime`, `--rollback` or a runtime expected-plan option
- **THEN** the CLI SHALL reject the option without modifying the workspace

### Requirement: Agent Delivery Selection

`init` and `update` SHALL accept `--delivery skills|commands|both`. A new
workspace SHALL default to `skills`; an existing current workspace SHALL retain
its configured value when the option is omitted. Init SHALL safely refresh or
extend an existing current workspace, while old or unknown workspaces remain
unchanged.

#### Scenario: Existing delivery is preserved

- **WHEN** update runs without `--delivery`
- **THEN** it SHALL preserve the configured delivery value
- **AND** an explicit `--delivery` SHALL reconcile obsolete generated surfaces

### Requirement: Bootstrap Summary And Preflight

Bootstrap preview and result data SHALL aggregate counts by project/global
directory and SHALL omit ordinary per-file lists. Drift and conflict
diagnostics MAY identify their exact paths. All blocking conflicts SHALL be
reported before config, manifest, or projection writes begin.

#### Scenario: Bootstrap reports an aggregate plan

- **WHEN** init, update, or dry-run reports its plan
- **THEN** human and JSON output SHALL include directories and create, refresh, remove, preserve, and conflict counts
- **AND** ordinary generated file paths SHALL not be listed outside drift or conflict diagnostics

### Requirement: Unsupported Workspace Is Zero-Write
Every command that discovers an old or unknown workspace SHALL stop before planning or performing a
write.

#### Scenario: Update sees an old workspace
- **WHEN** `update` encounters old `runs/current` authority
- **THEN** it returns an unsupported-format error and leaves all bytes unchanged

### Requirement: Bootstrap Delivery Option
`init` and `update` SHALL accept `--delivery <skills|commands|both>`. Current workspaces SHALL retain their configured value when omitted, and init SHALL safely extend an existing current workspace.

#### Scenario: Omitted delivery preserves current intent
- **WHEN** update runs without `--delivery`
- **THEN** the workspace's configured delivery mode SHALL remain unchanged

### Requirement: Aggregate Bootstrap Output
Preview, human output, JSON data, and dry-run output SHALL report roots and aggregate create/refresh/remove/preserve/conflict counts. Individual paths SHALL appear only in structured diagnostics.

#### Scenario: Summary omits file listings
- **WHEN** init or update returns human or JSON output
- **THEN** it SHALL include project root, selected tools, delivery, directories, and action counts without a per-file approval list

### Requirement: Preflight Atomicity
A bootstrap operation with a blocking tool-delivery or ownership conflict SHALL return before executing any write, including config and manifest updates.

#### Scenario: Conflict leaves workspace unchanged
- **WHEN** a selected projection conflicts during preflight
- **THEN** the command SHALL return a blocking error and leave all workspace bytes unchanged
