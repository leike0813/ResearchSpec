## Purpose

ResearchSpec SHALL provide a universal, converter-owned ARSU workflow profile
(`arsu-v0-1`) that covers every supported deep-research, academic-paper,
academic-paper-reviewer operational route and each academic-pipeline entry route,
composes standalone subflows into an end-to-end pipeline, exposes only legal
mid-entry stages, supports dynamic unbounded revision rounds, and is semantically
validated. This capability is the canonical ARSU work-graph source of truth.

## Requirements

### Requirement: Universal ARSU profile covers every supported route

The system SHALL provide adaptive and strict universal ARSU profile projections
covering exactly one external entry for each supported deep-research,
academic-paper, academic-paper-reviewer operational route and each
academic-pipeline entry route. Adaptive profiles SHALL express obligations and
completion; strict profiles SHALL additionally express the enforceable graph.

#### Scenario: Catalog and profile coverage agree

- **WHEN** each workflow profile projection is validated against the routing
  catalog
- **THEN** all 25 operational routes and both pipeline entries SHALL be covered
  exactly once and no unknown external route SHALL be present

#### Scenario: Route ordering lacks a hard justification

- **WHEN** the routing catalog lists two operations in an editorial order but
  the profile declares no academic or governance dependency
- **THEN** the adaptive profile SHALL NOT generate a hard edge from that order

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

### Requirement: Profile Authority And Playbook Are Separate

Converter-owned profiles SHALL keep hard obligations, justified dependencies,
formal policies and completion criteria separate from the default soft
playbook. The playbook SHALL guide Agents without becoming blocking runtime
state.

#### Scenario: Default playbook changes

- **WHEN** a converter update changes a recommended internal sequence without
  changing hard commitments
- **THEN** existing accepted evidence and CaseState SHALL remain valid
- **AND** the change SHALL NOT require a runtime migration

### Requirement: Strict Profiles Preserve Process Guarantees

Strict profiles SHALL retain their declared work graph, parallel and join
policy, formal Gates, transitions and dynamic revision-round templates.

#### Scenario: User selects strict pipeline

- **WHEN** a run is initialized with a strict profile
- **THEN** ResearchSpec SHALL enforce all declared graph and Gate constraints
- **AND** adaptive planning SHALL operate only inside work boundaries permitted
  by that strict profile
