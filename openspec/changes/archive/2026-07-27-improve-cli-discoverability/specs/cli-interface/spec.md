## ADDED Requirements

### Requirement: Catalog-Backed Static CLI Discovery

ResearchSpec SHALL maintain one typed static CLI catalog for the seven global
options, the exact seventeen top-level commands, and the `plugin` subcommands.
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
