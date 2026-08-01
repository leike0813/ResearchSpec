## MODIFIED Requirements

### Requirement: Complete Public Command Surface
The packaged CLI SHALL expose exactly `init`, `update`, `status`, `instructions`, `start`, `advance`,
`check`, `list`, `show`, `handoff`, `pack`, `propose`, `decide`, `archive`, `doctor`, and `plugin` as
top-level commands.

#### Scenario: User requests top-level help
- **WHEN** the packaged CLI renders top-level help
- **THEN** all sixteen commands are listed exactly once
- **AND** `submit` is not exposed

### Requirement: Read Commands Use Current Workspace State
Status, list, show, instructions, check and doctor SHALL derive their results from current stable
specs, profile, controls, handoffs and changes without writing project files.

#### Scenario: Read command succeeds or reports a blocker
- **WHEN** any read command executes against a current or unsupported workspace
- **THEN** it produces no workspace mutation

## ADDED Requirements

### Requirement: Current Bootstrap Options
`init` SHALL accept tool selection without a runtime-profile option; `update` SHALL reconcile only
manifest-owned static content and SHALL NOT expose migration, rollback or runtime plan-hash options.

#### Scenario: Removed option is supplied
- **WHEN** a user supplies `--profile`, `--migrate-runtime`, `--rollback` or a runtime expected-plan
  option
- **THEN** the CLI rejects the option without modifying the workspace

### Requirement: Unsupported Workspace Is Zero-Write
Every command that discovers an old or unknown workspace SHALL stop before planning or performing a
write.

#### Scenario: Update sees an old workspace
- **WHEN** `update` encounters old `runs/current` authority
- **THEN** it returns an unsupported-format error and leaves all bytes unchanged

## REMOVED Requirements

### Requirement: Public Artifact Submit Command
**Reason**: Boundary deliverables are ordinary files referenced through handoffs, not registered
artifacts.
**Migration**: Producers write explicit outputs outside `researchspec/` and record role/path entries.

### Requirement: Public Doctor Command
**Reason**: Receipt-backed repair semantics are removed; Doctor remains a read-only diagnostic
command under the current contract.
**Migration**: Recover semantic authority through explicit user edits or source control.

