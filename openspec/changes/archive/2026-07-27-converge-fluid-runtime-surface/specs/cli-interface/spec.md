## ADDED Requirements

### Requirement: Action Descriptor V2 And Execution Policy

Every Agent-callable write instruction SHALL expose a version-2 action descriptor
whose public input template contains only semantic fields. The descriptor SHALL
declare exactly one execution policy: `direct`, `human_confirmed`, or
`plan_bound`; the CLI SHALL derive mechanical identities, hashes, dependency
facts, receipt fields, and current basis from the selected action.

#### Scenario: Direct action receives semantic input

- **WHEN** a caller executes a currently allowed `direct` action with the
  descriptor's semantic input
- **THEN** the CLI SHALL plan, validate, and commit under current read
  preconditions in that invocation
- **AND** it SHALL NOT require an externally replayed plan hash

#### Scenario: Caller supplies a mechanical field

- **WHEN** a caller includes a CLI-derived identity, hash, receipt, dependency,
  schema-version, or basis field in a version-2 semantic input
- **THEN** the CLI SHALL reject the input before creating any runtime write

#### Scenario: Plan-bound action is executed

- **WHEN** a descriptor declares `plan_bound`
- **THEN** the CLI SHALL require an approved current plan hash and the explicit
  execution confirmation required by that action
- **AND** a direct or human-confirmed execution path SHALL NOT bypass that
  requirement

### Requirement: Status And Transaction Continuation Are Directed

Default status SHALL remain bounded and SHALL expose recommended actions, other
allowed actions, blockers, pending counts, and directed detail selectors. A
successful write transaction SHALL return compact effects and next selectors so
that a caller can continue with a directed read instead of requiring a complete
status round trip after every mechanical action.

#### Scenario: A durable action succeeds

- **WHEN** Start, Submit, Advance, Decide, Propose, Doctor repair, or runtime
  migration completes successfully
- **THEN** its result SHALL identify its receipt or plan, effects, and next
  selectors without embedding an unbounded post-write workflow snapshot

