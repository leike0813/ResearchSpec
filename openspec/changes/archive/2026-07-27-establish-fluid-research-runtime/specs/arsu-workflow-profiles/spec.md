## MODIFIED Requirements

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

## ADDED Requirements

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

