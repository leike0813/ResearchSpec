## Purpose
Define converter-owned workflow profiles that compose independently confirmed ARSU subflows.

## Requirements

### Requirement: Universal ARSU profile covers every supported route
The converter SHALL publish one `academic-pipeline` project profile covering the pipeline entries,
children, dependencies, parallel/join policies, Gates, branches, transitions, override policy and
dynamic revision-round template required by supported pipeline routes.

#### Scenario: Profile coverage is checked
- **WHEN** converter validation examines every supported pipeline entry and child route
- **THEN** each has one profile node with all declared formal boundaries

### Requirement: Workflow data has a single converter-owned source
The converter workflow source SHALL be the only authored source for the project pipeline profile;
the workspace YAML SHALL be a manifest-owned static projection.

#### Scenario: Project profile drifts
- **WHEN** update detects modified projected bytes
- **THEN** it reports drift and preserves the file unless `--force` is explicit

### Requirement: End-to-end pipeline composes standalone subflows
The `academic-pipeline:end-to-end` template SHALL invoke full research, full writing, full review, integrity, finalization, and summary stages through a parent-owned frontier.

#### Scenario: Review accepts the manuscript
- **WHEN** research and writing children complete, pre-review integrity passes, full review completes, and the accepted branch is confirmed
- **THEN** final integrity, format conversion, and process summary become reachable in order

#### Scenario: Review requests revision
- **WHEN** the confirmed review branch requests revision
- **THEN** the parent exposes the next revision-round child and does not expose final integrity

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
