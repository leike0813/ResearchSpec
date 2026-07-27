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

### Requirement: Parent transitions wait for child joins
A parent transition SHALL remain blocked until all work, Gate, child node, and join requirements for its source stage are satisfied.

#### Scenario: Work is complete but a required child is active
- **WHEN** all parent work and Gates pass but a required child subflow is not terminal
- **THEN** no source-stage transition is advanceable

### Requirement: Revision branch controls repeatable rounds
The transition frontier SHALL use the accepted workflow branch Decision after a completed review or re-review to select finalization or the next revision round and SHALL not infer a branch from rejected or postponed options.

#### Scenario: Revision option is accepted after round n
- **WHEN** round `n` is complete and the accepted branch option is revision
- **THEN** only the transition that exposes round `n+1` is authorized

### Requirement: Integrity Gates cannot be bypassed by pipeline entry
Pre-review and final-integrity transitions SHALL require their declared blocking Gates even when the pipeline was started through a mid-entry route.

#### Scenario: Mid-entry selects review
- **WHEN** a user enters at review with a manuscript artifact but no trusted pre-review Gate receipt
- **THEN** the profile requires the pre-review integrity stage before review can advance

### Requirement: Completion Effects Are Declared And Scoped

Gate and transition policies SHALL declare whether an accepted action emits no
completion effect, `complete_subflow`, or `complete_run`. Only strict profiles
SHALL use graph advancement as runtime authority.

#### Scenario: Ordinary standalone transition completes

- **WHEN** a standalone subflow satisfies its declared final transition
- **THEN** the transition SHALL emit `complete_subflow`
- **AND** it SHALL NOT infer run completion from the absence of active
  instances

#### Scenario: Strict pipeline final transition completes

- **WHEN** all strict pipeline completion requirements and formal Gates are
  satisfied
- **THEN** its declared final transition MAY emit `complete_run`
- **AND** the effect SHALL be recorded by the same receipt-backed transaction

### Requirement: Formal Human Boundaries Survive Adaptive Planning

Adaptive action ordering SHALL NOT bypass a formal Gate, Decision, override or
branch policy.

#### Scenario: Agent recommends bypassing a failed Gate

- **WHEN** a failed Gate blocks an otherwise useful action
- **THEN** the action SHALL remain blocked until the declared override Decision
  is recorded
- **AND** changing the soft playbook SHALL NOT remove the block

### Requirement: Gate And Transition Risk Tiers Remain Explicit

Formal Gate submission, human Decisions, and accepted high-impact patch or
contract-change application SHALL remain `plan_bound`. A unique strict
non-semantic transition whose descriptor declares `direct` MAY execute without
an external plan replay; it SHALL still be planned and revalidated by the CLI
under current read preconditions.

#### Scenario: Formal Gate is submitted

- **WHEN** a Gate descriptor is selected
- **THEN** the CLI SHALL require validator input, named human confirmation, and
  the current approved plan hash
- **AND** no Start confirmation, direct policy, or `--yes` alone SHALL pass the
  Gate

#### Scenario: Unique mechanical transition is available

- **WHEN** exactly one strict transition is allowed and its descriptor declares
  `direct`
- **THEN** the CLI SHALL perform the transition in one invocation with current
  authority checks
- **AND** it SHALL return its receipt, effects, and next selectors

## ADDED Requirements

### Requirement: Current trusted Gate authority
All Gate instructions, readiness, challenge, reverification, override, status, and completion decisions SHALL resolve authority from the latest trusted event for the same Gate.

#### Scenario: Passing verdicts satisfy a Gate
- **WHEN** the latest trusted Gate event has verdict `pass` or `pass_with_conditions`
- **THEN** the Gate SHALL satisfy completion prerequisites

#### Scenario: Reverification reference is stale or cross-Gate
- **WHEN** a reverification supersedes anything other than the latest trusted event of the same Gate
- **THEN** the action SHALL be rejected without writing a Gate event

#### Scenario: Failed reverification opens an override case
- **WHEN** reverification of the latest Gate event fails
- **THEN** the runtime SHALL create a pending Gate-override case action bound to that event and its receipt

#### Scenario: New Gate event invalidates override
- **WHEN** a newer trusted event is recorded for a Gate
- **THEN** an override Decision bound to an older event SHALL no longer satisfy that Gate
