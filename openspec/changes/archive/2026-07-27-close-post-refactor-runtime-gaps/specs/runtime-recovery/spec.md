## ADDED Requirements

### Requirement: Adaptive receipt v2 exact recovery
New adaptive transactions SHALL write receipt schema v2 containing action identity, normalized semantic input, complete read preconditions, authority target, effects, and plan hash sufficient for exact retry.

#### Scenario: Retry after a partial write
- **WHEN** a v2 receipt proves an interrupted start, evidence, resolution, Gate, or completion transaction
- **THEN** exact retry SHALL reuse the recorded plan identity and write only missing deterministic phases without duplicating ledger events

#### Scenario: Retry basis conflicts
- **WHEN** current authority contradicts the receipt semantic input or recorded preconditions
- **THEN** recovery SHALL report conflicting or stale evidence and SHALL NOT guess a repair

### Requirement: Bidirectional runtime reconciliation
Doctor and static runtime checks SHALL validate receipt-to-authority and authority-to-receipt/state consistency through the same integrity rules.

#### Scenario: Authority phase lacks a receipt binding
- **WHEN** a ledger or state projection claims a transaction that has no matching trusted receipt
- **THEN** diagnostics SHALL identify the missing reverse binding

#### Scenario: Legacy receipt lacks replay semantics
- **WHEN** a readable receipt v1 cannot prove an exact repair
- **THEN** Doctor SHALL classify it as `requires_human_reconstruction` without migrating or inferring semantic input
