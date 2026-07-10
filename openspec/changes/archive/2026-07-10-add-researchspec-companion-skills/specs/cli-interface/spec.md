## MODIFIED Requirements

### Requirement: Complete Public Command Surface

ResearchSpec SHALL expose `init`, `update`, `status`, `check`, `list`, `show`,
`handoff`, `pack`, `propose`, `decide`, and `archive` as the complete
first-version public CLI command set.

#### Scenario: Help lists public commands

- **WHEN** a user runs `researchspec --help`
- **THEN** the CLI SHALL list all eleven public commands
- **AND** it SHALL NOT list ARSU converter or upstream-maintenance commands

#### Scenario: Unsupported syntax is a usage error

- **WHEN** a user supplies an unknown command, option, target, or conflicting
  option combination
- **THEN** the CLI SHALL return exit code 2
- **AND** it SHALL direct the user to the relevant help surface

## ADDED Requirements

### Requirement: Public Contract Change Proposal Command

ResearchSpec SHALL expose `propose <change-id>` with required `--input`,
`--actor-kind`, and `--actor-name` options for deterministic pending contract
change creation.

#### Scenario: Dry run and execution share one proposal plan

- **WHEN** a valid proposal is invoked with `--dry-run`
- **THEN** the command SHALL return the three create operations in JSON envelope
  version 1 and SHALL write nothing
- **AND** confirmed execution SHALL apply the same plan
- **AND** the created change SHALL be visible to `list`, `show`, and `check`

#### Scenario: Creation confirmation is not semantic acceptance

- **WHEN** interactive proposal creation has not been confirmed
- **THEN** no proposal files SHALL be written
- **AND** `--yes` SHALL only skip this creation confirmation
- **AND** neither confirmation nor `--yes` SHALL accept or apply the proposal

#### Scenario: Proposal failures use stable exit classes

- **WHEN** arguments, actor, ID, or payload schema are invalid
- **THEN** the command SHALL return exit code 2
- **WHEN** a target, current value, selector, or evidence reference conflicts
- **THEN** the command SHALL return exit code 1
- **WHEN** an output target exists or a filesystem write conflicts
- **THEN** the command SHALL return exit code 3
- **AND** JSON mode SHALL emit exactly one parseable failure envelope
