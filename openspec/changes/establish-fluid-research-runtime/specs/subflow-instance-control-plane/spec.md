## ADDED Requirements

### Requirement: Subflow And Run Completion Are Independent

Subflow instance lifecycle SHALL be attached to the enclosing case without
making instance completion equivalent to run completion.

#### Scenario: Standalone instance is completed

- **WHEN** a valid action applies `complete_subflow` to a standalone instance
- **THEN** that instance SHALL become terminal
- **AND** the run SHALL remain open and expose any other allowed starts or case
  actions

#### Scenario: Run is explicitly completed

- **WHEN** a valid run-level action applies `complete_run`
- **THEN** new subflow starts SHALL be terminally blocked
- **AND** instance completion alone SHALL never produce this effect

### Requirement: Subflow Attempts Are Scoped

Attempts and local recovery effects SHALL identify their subflow and obligation
scope and SHALL NOT alter unrelated instance readiness without a declared hard
dependency.

#### Scenario: Instance is paused

- **WHEN** one subflow is paused after a failed attempt
- **THEN** its diagnostics and obligations SHALL remain discoverable
- **AND** an unrelated allowed subflow SHALL remain startable

