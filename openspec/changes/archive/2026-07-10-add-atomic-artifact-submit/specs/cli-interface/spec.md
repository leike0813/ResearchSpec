## MODIFIED Requirements

### Requirement: Complete Public Command Surface

ResearchSpec SHALL expose `init`, `update`, `status`, `instructions`, `submit`, `check`, `list`, `show`, `handoff`, `pack`, `propose`, `decide`, and `archive` as the complete first-version public CLI command set.

#### Scenario: Help lists public commands

- **WHEN** a user runs `researchspec --help`
- **THEN** the CLI SHALL list all thirteen public commands
- **AND** it SHALL NOT list ARSU converter or upstream-maintenance commands

#### Scenario: Unsupported syntax is a usage error

- **WHEN** a user supplies an unknown command, option, target, or conflicting option combination
- **THEN** the CLI SHALL return exit code 2
- **AND** it SHALL direct the user to the relevant help surface

## ADDED Requirements

### Requirement: Public Artifact Submit Command

ResearchSpec SHALL expose `submit work:<id>` with strict provenance input, actor identity, dry-run, expected-hash binding, confirmation, and versioned JSON results.

#### Scenario: Non-interactive execution binds previewed content

- **WHEN** Submit executes without an interactive TTY
- **THEN** it SHALL require `--expected-sha256` and `--yes`
- **AND** the expected hash SHALL match the candidate at execution time
- **AND** `--yes` SHALL NOT imply academic acceptance, Gate pass, Decision, or stage transition

#### Scenario: Success states are stable

- **WHEN** Submit is previewed, first committed, or exactly retried
- **THEN** JSON data SHALL respectively report `would_submit`, `submitted`, or `already_submitted`
- **AND** it SHALL explicitly report that state, Gate, and Decision were not written

#### Scenario: Submit failures use stable exit classes

- **WHEN** selector, input, actor, or expected hash syntax is invalid
- **THEN** Submit SHALL return exit code 2
- **WHEN** workflow readiness, candidate validation, or dependency trust fails
- **THEN** Submit SHALL return exit code 1
- **WHEN** content, provenance, receipt, ID, registry, or plan preconditions conflict
- **THEN** Submit SHALL return exit code 3

### Requirement: Instructions Advertise Submit Capability

Dynamic work-item instructions SHALL advertise whether the runtime can submit the node's validation profile.

#### Scenario: Supported ready item includes Submit contract

- **WHEN** a ready work item uses a supported validation profile
- **THEN** instructions SHALL retain existing fields and set `submit_available: true`
- **AND** it SHALL include candidate path, input shape, dry-run command, confirmation/hash requirements, and explicit state/Gate/Decision non-effects
