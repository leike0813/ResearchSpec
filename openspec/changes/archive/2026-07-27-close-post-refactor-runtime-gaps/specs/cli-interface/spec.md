## ADDED Requirements

### Requirement: Policy-derived execution requirements
Action Descriptor v2 SHALL expose `execution_requirements` derived from its catalog-owned `execution_policy`, and every `plan_bound` CLI execution SHALL enforce the same preview, basis, plan-hash, and confirmation contract.

#### Scenario: Interactive plan-bound execution
- **WHEN** an interactive caller executes a Gate, Decision, or patch-apply action
- **THEN** the CLI SHALL preview the bound plan and hash and require confirmation before any authority write

#### Scenario: Non-interactive plan-bound execution
- **WHEN** a non-interactive caller executes a plan-bound action
- **THEN** the CLI SHALL require matching action basis and plan hash plus `--yes`, and SHALL perform no write when any requirement is absent or stale

### Requirement: Catalog-aware contextual help
The CLI SHALL parse contextual help targets by skipping recognized option values and matching the longest catalog command path.

#### Scenario: Option value resembles a command
- **WHEN** a global option value equals a top-level command name in either separated or equals syntax
- **THEN** the value SHALL NOT be treated as the help target

#### Scenario: Plugin subcommand help
- **WHEN** the positional path identifies a registered plugin subcommand
- **THEN** the usage hint SHALL target that longest registered command path
