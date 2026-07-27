## ADDED Requirements

### Requirement: Artifact Submission Uses Semantic Input

The public artifact input SHALL contain only producer-supplied semantic
provenance. ResearchSpec SHALL derive candidate identity, hash, dependencies,
version, receipt and registry facts.

#### Scenario: Minimal automatic input is submitted

- **WHEN** a ready automatic work selector receives its descriptor's minimal
  semantic input
- **THEN** the CLI SHALL validate and atomically register the current candidate
- **AND** omitted mechanical fields SHALL not require caller reconstruction

#### Scenario: Caller supplies registry facts

- **WHEN** a caller supplies a derived identity, status, dependency, hash or
  receipt field
- **THEN** strict v2 validation SHALL reject the field before writes

### Requirement: Submission Execution Follows Work Policy

Automatic artifact registration SHALL be direct and manual artifact acceptance
SHALL be human-confirmed; neither SHALL require external plan replay.

#### Scenario: Candidate changes during direct execution

- **WHEN** the candidate or a read dependency changes after internal planning
- **THEN** write preconditions SHALL reject the transaction without registration

