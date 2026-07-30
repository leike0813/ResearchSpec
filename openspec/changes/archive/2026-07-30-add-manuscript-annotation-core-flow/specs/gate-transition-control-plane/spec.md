## ADDED Requirements

### Requirement: Revision Completeness Annotation Evidence

Strict and adaptive `revision_completeness` Gate transactions SHALL invoke the
same mechanical annotation coverage verifier before accepting `pass` or
`pass_with_conditions`.

#### Scenario: Passing verdict has complete coverage

- **WHEN** a human submits a passing or conditional revision-completeness
  verdict
- **THEN** the transaction SHALL validate the apply report, accepted patch,
  Annotation Sets, Resolution Report, registry records, current files, hashes,
  mappings, dispositions, and zero unresolved count

#### Scenario: Incomplete coverage is recorded as failure

- **WHEN** mechanical annotation coverage is incomplete
- **THEN** the Gate SHALL reject a passing or conditional verdict
- **AND** it SHALL still allow a `fail` verdict to record trustworthy failure
  evidence

#### Scenario: Mechanical pass retains semantic review

- **WHEN** annotation coverage is mechanically complete
- **THEN** reviewer or Verify analysis and named human confirmation SHALL still
  determine semantic sufficiency
