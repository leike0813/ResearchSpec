## Purpose

ResearchSpec SHALL provide a strict, receipt-backed control plane that derives
per-instance Gate packets, commits Gate verdicts only after human confirmation,
manages challenge/reverification/override discipline, and advances at most one
authorized transition per frontier state. This capability owns Gate and
transition semantics independently of artifact submission and work-item flow.

## Requirements

### Requirement: Instance-Scoped Gate Instructions

ResearchSpec SHALL derive each formal Gate packet from the active subflow instance, workflow template and authoritative evidence state.

#### Scenario: Ready Gate exposes confirmation contract

- **WHEN** stage work and Gate prerequisites are satisfied
- **THEN** `instructions gate:<instance>/<node>` SHALL return validator, evidence contract, risk, proposed-attempt input, instruction basis and mandatory human confirmation requirements

#### Scenario: Gate IDs remain isolated across instances

- **WHEN** two instances use the same logical Gate node
- **THEN** their selectors, attempts and receipts SHALL preserve distinct instance identity

### Requirement: Confirmed Receipt-Backed Gate Submit

ResearchSpec SHALL append a Gate verdict only after validating its evidence and binding an explicit human confirmation to the previewed plan.

#### Scenario: Confirmed attempt commits atomically

- **WHEN** the exact dry-run payload, plan hash and confirmation execute successfully
- **THEN** the runtime SHALL create or reuse the matching Gate receipt before appending the Gate ledger event
- **AND** it SHALL NOT update state, artifacts or Decisions

#### Scenario: Retry and drift are safe

- **WHEN** an exact Gate submission is retried
- **THEN** it SHALL return `already_submitted` without duplicate events
- **AND** divergent verdict, evidence, provenance, receipt or read-basis state SHALL fail as a conflict

### Requirement: Gate Challenge And Override Discipline

ResearchSpec SHALL distinguish initial verification, reverification and explicit failed-Gate override.

#### Scenario: Challenge produces a new verification attempt

- **WHEN** the user challenges a proposed or recorded verdict
- **THEN** Verify SHALL re-run assessment and bind the new attempt to challenged evidence and any superseded confirmed event

#### Scenario: Override requires trusted failed reverification

- **WHEN** the user accepts an override for a blocking Gate
- **THEN** `researchspec-decide` SHALL require the latest trusted confirmed attempt to be a failed reverification
- **AND** the Decision SHALL bind that exact Gate event and receipt

### Requirement: Unique Receipt-Backed Transition Advancement

ResearchSpec SHALL advance only one transition authorized by the current Gate and Decision basis.

#### Scenario: Unique transition advances without another semantic decision

- **WHEN** exactly one non-semantic transition is eligible
- **THEN** the Agent MAY dry-run and execute `advance transition:<instance>/<node>` automatically

#### Scenario: Advance commits receipt before state

- **WHEN** the exact transition plan executes
- **THEN** the runtime SHALL create or reuse its receipt before changing the target instance stage or terminal status
- **AND** an exact retry SHALL be idempotent

### Requirement: Branch Decisions Select One Transition

ResearchSpec SHALL require an explicit workflow-branch Decision whenever more than one transition candidate remains.

#### Scenario: Named transition cannot bypass ambiguity

- **WHEN** multiple transition candidates are available
- **THEN** Advance SHALL fail with a Decision-required result even when one selector is supplied

#### Scenario: Accepted branch unlocks one option

- **WHEN** the user accepts one candidate through `decide transition:<id>`
- **THEN** the Decision ledger SHALL record the selected decision point and transition
- **AND** only that transition SHALL become eligible
