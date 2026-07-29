## MODIFIED Requirements

### Requirement: Adaptive Evidence Is Accepted At Obligation Boundaries

Adaptive evidence and attempt operations SHALL use `obligation:` descriptors and
shall keep working material outside accepted authority until the selected
operation validates it as accepted evidence. An accepted adaptive Artifact and
its receipt SHALL be stored in the registry with POSIX paths relative to the
`researchspec/` workspace. Shared Artifact consumers SHALL resolve those records
to the same accepted bytes and hashes. Unmigrated strict Artifact Submit SHALL
retain its existing project-relative registry representation.

#### Scenario: Adaptive producer accepts evidence

- **WHEN** a producer submits valid evidence through an allowed
  `obligation:` descriptor
- **THEN** the CLI SHALL record the scoped attempt, accepted evidence, receipt,
  and CaseState update under one authority transaction
- **AND** the accepted Artifact and receipt registry paths SHALL be relative to
  `researchspec/`
- **AND** unrelated obligations SHALL remain available unless a declared hard
  dependency blocks them

#### Scenario: Shared consumer reads accepted adaptive evidence

- **GIVEN** an adaptive evidence transaction has registered an Artifact and
  receipt
- **WHEN** a generic Artifact check, workflow or Gate evaluation, Doctor,
  lifecycle operation, or pack consumes either record
- **THEN** it SHALL resolve the workspace-relative path to the submitted file
- **AND** it SHALL verify the same hash accepted by the submission transaction

#### Scenario: Strict submission remains compatible

- **GIVEN** an unmigrated strict workspace
- **WHEN** strict Artifact Submit registers a candidate and receipt
- **THEN** both paths SHALL remain project-relative and include the
  `researchspec/` workspace segment
- **AND** generic consumers SHALL resolve them through the strict path basis
