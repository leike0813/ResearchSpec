## ADDED Requirements

### Requirement: Universal ARSU profile covers every supported route
The system SHALL provide an `arsu-v0-1` profile with exactly one complete external template for each supported deep-research, academic-paper, academic-paper-reviewer operational route and each academic-pipeline entry route.

#### Scenario: Catalog and profile coverage agree
- **WHEN** the workflow catalog is validated against the routing catalog
- **THEN** all 25 operational routes and both pipeline entries are covered exactly once and no unknown external route is present

### Requirement: Workflow data has a single converter-owned source
The system SHALL keep ARSU work graphs, artifact contracts, Gate realization, transitions, joins, and round composition in converter-owned source data and SHALL generate the runtime profile projection deterministically.

#### Scenario: Generated projection is current
- **WHEN** converter check and idempotence validation run
- **THEN** the runtime profile, generated Skill guidance, manifest, and report match the converter-owned source without hand-maintained drift

### Requirement: End-to-end pipeline composes standalone subflows
The `academic-pipeline:end-to-end` template SHALL invoke full research, full writing, full review, integrity, finalization, and summary stages through a parent-owned frontier.

#### Scenario: Review accepts the manuscript
- **WHEN** research and writing children complete, pre-review integrity passes, full review completes, and the accepted branch is confirmed
- **THEN** final integrity, format conversion, and process summary become reachable in order

#### Scenario: Review requests revision
- **WHEN** the confirmed review branch requests revision
- **THEN** the parent exposes the next revision-round child and does not expose final integrity

### Requirement: Mid-entry pipeline exposes only legal entries
The `academic-pipeline:mid-entry` template SHALL derive entry transitions from trusted registered artifacts and SHALL require a workflow branch Decision when multiple entries are eligible.

#### Scenario: Multiple entry stages are possible
- **WHEN** registered artifacts satisfy more than one declared mid-entry prerequisite set
- **THEN** no entry is selected until an accepted `workflow_branch` Decision names one eligible option

### Requirement: Revision rounds are dynamic and unbounded
The profile SHALL instantiate revision rounds with parent-scoped monotonically increasing round numbers and SHALL not define a maximum round count.

#### Scenario: Re-review requests another revision
- **WHEN** round `n` completes and its accepted branch Decision requests revision
- **THEN** the frontier exposes round `n+1` with the prior round Decision and output artifacts as bound prerequisites

### Requirement: Profile coverage is semantically validated
The profile validator SHALL check producer route ownership, primary artifact coverage, artifact-contract resolvability, Gate-policy realization, graph references, and external/internal template rules.

#### Scenario: A primary artifact has no work node
- **WHEN** a complete external template omits a routing-catalog primary artifact
- **THEN** profile generation or validation fails before initialization can use the profile
