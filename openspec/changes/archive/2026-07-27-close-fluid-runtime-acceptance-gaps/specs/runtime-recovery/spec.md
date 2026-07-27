## MODIFIED Requirements

### Requirement: Receipt-Bound Repair Commit

Repair execution SHALL preserve the original damaged bytes, revalidate read
preconditions, commit the repair receipt before replacing authority, and run a
post-repair check. The receipt SHALL bind expected authority bytes and SHALL be
valid retry evidence rather than an assertion that post-check already completed.

#### Scenario: Repair precondition changed

- **WHEN** a target or read hash differs from the approved repair plan
- **THEN** execution SHALL stop without committing receipt or authority
- **AND** the caller SHALL obtain a new diagnosis

#### Scenario: Process stops after receipt

- **WHEN** a repair receipt commits but authority replacement does not
- **THEN** Doctor SHALL classify the receipt as a retryable interrupted repair
- **AND** exact retry SHALL commit the expected authority without duplicating
  evidence

#### Scenario: Semantic evidence is missing

- **WHEN** recovery would require inventing a Gate verdict, Decision, claim,
  scope, branch or academic evidence
- **THEN** Doctor SHALL require human reconstruction
- **AND** it SHALL not emit a repair operation for that fact

