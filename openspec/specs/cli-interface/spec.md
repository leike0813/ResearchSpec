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

### Requirement: Unsupported Workspace Is Zero-Write
Every command that discovers an old or unknown workspace SHALL stop before planning or performing a
write.

#### Scenario: Update sees an old workspace
- **WHEN** `update` encounters old `runs/current` authority
- **THEN** it returns an unsupported-format error and leaves all bytes unchanged
