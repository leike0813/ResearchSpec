## ADDED Requirements

### Requirement: Evidence-First Repair Is Retryable

Doctor repair SHALL preserve original bytes, revalidate current read
preconditions, commit a repair receipt before replacing repaired authority, and
perform a post-repair check. The repair receipt SHALL bind the expected authority
bytes and shall be retry evidence rather than proof that post-check already
completed.

#### Scenario: Process stops after repair receipt

- **WHEN** a repair receipt has committed but the intended authority replacement
  has not occurred
- **THEN** Doctor SHALL classify the state as a retryable interrupted repair
- **AND** exact retry SHALL write the expected authority without duplicating
  recovery evidence

#### Scenario: Repair basis has drifted

- **WHEN** a repair target or read hash differs from the approved repair plan
- **THEN** Doctor SHALL commit neither the repair receipt nor repaired authority
- **AND** it SHALL direct the caller to obtain a new diagnosis

### Requirement: Doctor Guidance Is Bounded And Non-Semantic

Doctor SHALL expose bounded diagnostics and directed recovery detail without
inventing a Gate verdict, Decision, claim, scope, branch, or academic evidence.

#### Scenario: Semantic authority is missing

- **WHEN** repair would require a missing semantic fact
- **THEN** Doctor SHALL classify the scope as requiring human reconstruction
- **AND** it SHALL not offer a deterministic repair transaction

