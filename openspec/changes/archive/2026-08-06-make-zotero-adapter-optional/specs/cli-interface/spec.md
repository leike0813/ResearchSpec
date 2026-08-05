## MODIFIED Requirements

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
literature-Adapter installation health without adding a top-level command or
live connection probe.

#### Scenario: Unselected Adapter is reported

- **WHEN** `zotero-library` is not selected
- **THEN** status SHALL report `not-selected` and check SHALL not treat absent Adapter files as missing
- **AND** neither command SHALL execute the runtime, connect to Host Bridge, access the network, or read credentials

#### Scenario: Selected Adapter files are inspected

- **WHEN** desired runtime or Skill files are missing, drifted, unsupported, or conflicted
- **THEN** status SHALL return the corresponding structured Adapter state and diagnostics
- **AND** the inspection SHALL remain static

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
