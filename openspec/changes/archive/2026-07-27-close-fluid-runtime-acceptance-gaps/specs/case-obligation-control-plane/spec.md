## ADDED Requirements

### Requirement: Scoped Obligation Operations Execute Directly

Attempt, retry, replacement, pause and accepted-evidence operations within an
authorized adaptive subflow SHALL use semantic-only input and direct execution.

#### Scenario: Producer records an attempt

- **WHEN** an allowed obligation receives valid method, evidence or diagnostic
  semantics
- **THEN** ResearchSpec SHALL derive the obligation, instance, attempt and
  receipt identities and commit one scoped transaction

#### Scenario: Formal resolution is required

- **WHEN** waive, not-applicable or another effect requires a declared Decision
- **THEN** the resolution SHALL remain plan-bound to the required human
  authority

#### Scenario: Unrelated work continues

- **WHEN** a direct obligation transaction fails
- **THEN** only its owning scope and declared hard dependents SHALL be affected

