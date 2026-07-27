## ADDED Requirements

### Requirement: Subflow Start Uses Semantic Input And Declared Risk

ResearchSpec SHALL derive subflow version, basis, prerequisite, parent and
authorization identities from current authority rather than accepting them from
the Agent.

#### Scenario: Confirmed external route starts

- **WHEN** a user-confirmed external route is currently available
- **THEN** one Start invocation with semantic input and named confirmer SHALL
  create the receipt and instance under read preconditions

#### Scenario: Parent delegates a child

- **WHEN** a parent receipt and current frontier identify one exact child
- **THEN** the child SHALL start directly without a second human confirmation or
  external plan replay

### Requirement: Automatic Work Delegation Is Direct

A started subflow SHALL authorize direct deterministic submission for work
declared automatic while retaining validation, receipt and conflict guarantees.

#### Scenario: Automatic candidate is ready

- **WHEN** the candidate and current start authorization validate
- **THEN** one Submit invocation SHALL register it without mandatory dry-run or
  confirmation
- **AND** no Gate, Decision or academic approval SHALL be implied

