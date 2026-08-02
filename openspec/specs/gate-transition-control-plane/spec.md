## Purpose
Define local Gate, Decision, branch, join, and transition authority for current subflow controls.

## Requirements

### Requirement: Branch Decisions Select One Transition

ResearchSpec SHALL require an explicit workflow-branch Decision in the owning subflow control whenever more than one transition candidate remains.

#### Scenario: Named transition cannot bypass ambiguity

- **WHEN** multiple transition candidates are available
- **THEN** Advance SHALL fail with a Decision-required result even when one selector is supplied

#### Scenario: Accepted branch unlocks one option

- **WHEN** the user accepts one candidate through `decide transition:<id>`
- **THEN** the owning control SHALL record the selected decision point and transition
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
- **WHEN** a user enters at review with a manuscript artifact but no passed pre-review Gate attempt
- **THEN** the profile requires the pre-review integrity stage before review can advance

### Requirement: Gate Authority Is Local To The Owning Control
Formal Gate attempts SHALL append to the Gate entry in the owning subflow control and contain a
verdict, human confirmer, timestamp, summary and optional handoff evidence.

#### Scenario: Gate is reverified
- **WHEN** a user confirms a new verdict after a prior attempt
- **THEN** the new attempt is appended without rewriting or duplicating the prior attempt

### Requirement: Failed-Gate Override Is One Decision
A failed-Gate override SHALL be embedded under that Gate with one Decision ID, approver, timestamp
and reason, and SHALL NOT be copied to another ledger.

#### Scenario: Failed Gate is overridden
- **WHEN** the user explicitly approves an override with a reason
- **THEN** only the owning control is atomically updated

### Requirement: Advance Is Separate From Confirmation
Gate confirmation or branch choice SHALL NOT advance a checkpoint; `advance` SHALL independently
validate the profile and directly dependent child controls before recording a transition.

#### Scenario: Gate passes
- **WHEN** a Gate attempt is confirmed as pass
- **THEN** the checkpoint remains unchanged until a valid advance occurs
