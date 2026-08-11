## ADDED Requirements

### Requirement: Existing-workspace init has replacement semantics

`init` SHALL treat explicit or interactively confirmed Agent-tool and literature-Adapter selections as complete replacement selections for an existing current workspace. `update` SHALL retain its separately documented refresh and extension semantics.

#### Scenario: Explicit re-init selection is supplied

- **WHEN** a caller runs existing-workspace init with `--tools` or `--literature-adapters`
- **THEN** each supplied expression becomes the complete desired selection for that field
- **AND** an omitted field is prompted only when interactive
- **AND** omitted delivery and plugin configuration are preserved

#### Scenario: Machine re-init omits selection options

- **WHEN** existing-workspace init runs with `--json` or without a TTY and omits selection options
- **THEN** the current tool and Adapter selections are preserved
- **AND** the CLI performs no interactive read

#### Scenario: Unsupported workspace is targeted

- **WHEN** init finds an old or unknown ResearchSpec workspace
- **THEN** it fails before displaying configuration selectors or planning writes
- **AND** all existing bytes remain unchanged
