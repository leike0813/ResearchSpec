## ADDED Requirements

### Requirement: Decision-qualified obligation readiness
An accepted waiver or not-applicable Decision SHALL make its bound obligation ready for Gate evaluation while preserving the formal Gate requirement.

#### Scenario: Waived obligation reaches Gate readiness
- **WHEN** a current accepted Decision waives an obligation and all other Gate prerequisites are satisfied
- **THEN** the Gate SHALL be ready for Verify without treating the waiver as a Gate pass

#### Scenario: Decision evidence is recorded
- **WHEN** Verify evaluates readiness based on a waiver or not-applicable Decision
- **THEN** Gate evidence SHALL include the Decision ID, Decision event ID, and receipt path, hash, and plan hash
