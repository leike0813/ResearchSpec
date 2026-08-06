## ADDED Requirements

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
