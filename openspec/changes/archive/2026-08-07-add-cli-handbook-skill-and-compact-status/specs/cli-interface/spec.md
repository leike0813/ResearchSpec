## ADDED Requirements

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
