## MODIFIED Requirements

### Requirement: Public command surface remains fixed

The CLI SHALL expose exactly the canonical seventeen top-level commands after
adaptive runtime and recovery support is added.

#### Scenario: Help is rendered

- **WHEN** top-level help is requested
- **THEN** it lists init, update, status, instructions, start, submit, advance,
  check, doctor, list, show, handoff, pack, propose, decide, archive, and plugin
  exactly once

## ADDED Requirements

### Requirement: Bounded Agent Runtime Protocol

Default `status` SHALL return a bounded `CaseStatusSummary` containing run and
instance identity, unsatisfied hard obligations, blockers, recommended and
other allowed actions, pending case-action counts, diagnostic counts and next
detail selectors. Growing collections SHALL be available only through directed
or paginated `instructions`, `show` and `list` views.

#### Scenario: Long run status is requested

- **WHEN** a run contains many historical instances, attempts and artifacts
- **THEN** `status --json` SHALL NOT embed the complete workflow or unbounded
  histories
- **AND** it SHALL identify selectors for requested detail

### Requirement: Schema-Derived Action Descriptors

Instructions for every Agent-callable write SHALL expose an action descriptor
derived from the command's validator schema. The descriptor SHALL identify the
canonical selector, availability basis and expiry, CLI-derived mechanical
fields, required semantic inputs, constraints, dry-run/execute requirements
and possible next selectors.

#### Scenario: Agent prepares a write

- **WHEN** an Agent requests instructions for an allowed write selector
- **THEN** it SHALL receive a minimal valid input template without supplying a
  schema version or reconstructing mechanical identities

#### Scenario: Input validation fails

- **WHEN** submitted input violates the action schema
- **THEN** the CLI SHALL return a stable error code, field path, expectation and
  action-schema reference
- **AND** it SHALL NOT require trial submissions to discover the contract

### Requirement: Compact Transaction Results

Successful Start, Submit, Advance, Decide and repair transactions SHALL return
only receipt or plan identity, an effects summary and next selectors.

#### Scenario: Writing transaction succeeds

- **WHEN** an Agent executes an approved writing transaction
- **THEN** the response SHALL NOT embed the complete post-write workflow
- **AND** current detail SHALL be obtained through the returned selectors

### Requirement: Public Doctor Command

`doctor` SHALL diagnose runtime damage read-only by default and SHALL expose
plan-bound deterministic repair as an explicit mode under the same command.

#### Scenario: Doctor repair executes non-interactively

- **WHEN** a caller executes an approved repair without an interactive prompt
- **THEN** it SHALL provide `--yes` and the matching
  `--expected-plan-sha256`
- **AND** the CLI SHALL reject missing or stale approval

### Requirement: Patch And Change Case-Action Selectors

The existing `submit`, `decide`, `advance` and `propose` commands SHALL operate
pending patch and contract-change case actions through canonical selectors.

#### Scenario: Draft patch progresses

- **WHEN** a revision producer creates a patch candidate
- **THEN** `submit patch:<selector>` SHALL create the pending patch
- **AND** `decide patch:<id>` and `advance patch:<id>` SHALL govern acceptance
  and controlled application without a new top-level command

