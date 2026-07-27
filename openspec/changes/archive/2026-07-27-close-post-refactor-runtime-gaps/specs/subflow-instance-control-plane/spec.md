## ADDED Requirements

### Requirement: Recoverable adaptive start and completion
Adaptive Case start and completion transactions SHALL be exactly retryable from receipt v2 across receipt-first, authority-first, and state-projection interruption boundaries.

#### Scenario: Start receipt exists without Case state
- **WHEN** a valid start receipt exists and its recorded preconditions still match but Case authority is absent
- **THEN** exact retry SHALL materialize the recorded Case state without creating a second receipt identity

#### Scenario: Completion state exists without reverse receipt binding
- **WHEN** completion authority exists but its receipt binding is absent or inconsistent
- **THEN** Doctor SHALL report the reverse-consistency failure and SHALL repair it only when the v2 receipt proves one unique projection
