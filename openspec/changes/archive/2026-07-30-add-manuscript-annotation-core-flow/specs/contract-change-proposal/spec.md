## ADDED Requirements

### Requirement: High-Impact Annotation Contract Linkage

An implemented high-impact annotation SHALL not bypass the contract-change
lifecycle.

#### Scenario: High-impact resolution changes stable semantics

- **WHEN** an implemented annotation changes scope, claims, structure, source
  policy, or workflow semantics
- **THEN** its Draft Patch SHALL declare the corresponding high semantic delta
  and link a contract-change proposal covering that category
- **AND** the patch SHALL remain blocked until the change is accepted and
  current

#### Scenario: Annotation does not change stable semantics

- **WHEN** an annotation changes wording, formatting, explanation, or evidence
  organization without changing a stable contract
- **THEN** its resolution SHALL not require a contract-change proposal
