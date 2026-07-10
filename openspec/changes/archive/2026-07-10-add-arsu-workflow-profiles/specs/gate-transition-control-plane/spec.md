## ADDED Requirements

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
