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
