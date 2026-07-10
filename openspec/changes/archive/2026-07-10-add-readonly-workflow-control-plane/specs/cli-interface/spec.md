## MODIFIED Requirements

### Requirement: Complete Public Command Surface

ResearchSpec SHALL expose `init`, `update`, `status`, `instructions`, `check`, `list`, `show`, `handoff`, `pack`, `propose`, `decide`, and `archive` as the complete first-version public CLI command set.

#### Scenario: Help lists public commands

- **WHEN** a user runs `researchspec --help`
- **THEN** the CLI SHALL list all twelve public commands
- **AND** it SHALL NOT list ARSU converter or upstream-maintenance commands

#### Scenario: Unsupported syntax is a usage error

- **WHEN** a user supplies an unknown command, option, target, or conflicting option combination
- **THEN** the CLI SHALL return exit code 2
- **AND** it SHALL direct the user to the relevant help surface

## ADDED Requirements

### Requirement: Dynamic Workflow Status Contract

`researchspec status` SHALL expose one read-only workflow-control view derived from the same current workspace snapshot and workflow evaluator used by instructions.

#### Scenario: Configured workflow reports a frontier

- **GIVEN** a valid workflow with typed work items
- **WHEN** the user runs `researchspec status --json`
- **THEN** `data.workflow_control` SHALL include profile, active stage, control state, canonical ready-item selectors, work-item states, missing dependencies, warnings, outputs, and unlocks
- **AND** existing status fields SHALL remain available
- **AND** work items SHALL NOT be duplicated at another top-level data field

#### Scenario: Unconfigured workflow remains inspectable

- **GIVEN** a valid workflow without typed work items
- **WHEN** the user runs `researchspec status --json`
- **THEN** the command SHALL succeed with `workflow_control.configured` equal to false
- **AND** it SHALL NOT write or migrate workspace files

### Requirement: Dynamic Work-Item Instructions

ResearchSpec SHALL expose `instructions work:<id>` as a read-only CLI primitive for a ready work item.

#### Scenario: Ready item returns a separated instruction packet

- **GIVEN** a work item is ready
- **WHEN** the user runs `researchspec instructions work:<id> --json`
- **THEN** the result SHALL include the canonical selector, work-item and stage IDs, producer Skill, description, context, rules, dependency metadata, candidate output paths, resolved ARSU template, validation profile, completion policy, forbidden writes, and unlocks as separate fields
- **AND** completion SHALL explicitly report `submit_available: false`
- **AND** the command SHALL NOT modify workspace files

#### Scenario: Selector syntax is constrained

- **WHEN** the user supplies a bare, empty, path-like, or otherwise unsafe work-item selector
- **THEN** the command SHALL return `invalid_work_item_selector` with exit code 2

#### Scenario: Runtime frontier prevents invalid instruction use

- **WHEN** the workflow is unconfigured or invalid, the work item is unknown, blocked, or already done, or its template resource cannot be resolved
- **THEN** the command SHALL return the corresponding stable domain error
- **AND** it SHALL NOT infer or fabricate instructions
