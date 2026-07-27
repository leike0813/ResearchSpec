## ADDED Requirements

### Requirement: Submission Uses Descriptor-Owned Semantic Input

Public artifact submission input SHALL contain only producer-supplied semantic
provenance. ResearchSpec SHALL derive candidate location, artifact identity,
hash, dependency, validation, registry, receipt, and authorization facts from
the selected current action descriptor and workspace authority.

#### Scenario: Automatic candidate is submitted

- **WHEN** a ready automatic strict work action receives its minimal semantic
  input and current candidate validates
- **THEN** the CLI SHALL register the candidate and receipt through a `direct`
  transaction
- **AND** it SHALL not require a separately replayed preview plan

#### Scenario: Manual candidate is submitted

- **WHEN** a ready manual strict work action receives its minimal semantic input
- **THEN** the CLI SHALL require the named human confirmation declared by its
  `human_confirmed` descriptor
- **AND** it SHALL not treat `--yes` as academic acceptance

### Requirement: Adaptive Evidence Is Accepted At Obligation Boundaries

Adaptive evidence and attempt operations SHALL use `obligation:` descriptors and
shall keep working material outside accepted authority until the selected
operation validates it as accepted evidence.

#### Scenario: Adaptive producer accepts evidence

- **WHEN** a producer submits valid evidence through an allowed
  `obligation:` descriptor
- **THEN** the CLI SHALL record the scoped attempt, accepted evidence, receipt,
  and CaseState update under one authority transaction
- **AND** unrelated obligations SHALL remain available unless a declared hard
  dependency blocks them

