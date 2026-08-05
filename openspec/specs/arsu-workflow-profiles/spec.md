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

### Requirement: Profile transitions remain data-driven and gate progress
The academic-pipeline profile SHALL include a one-shot `format` child routed to `academic-paper:format-convert`. The accepted branch from review and re-review SHALL unlock `format`; `format` SHALL complete before `final-integrity`; and final-integrity SHALL consume both the selected manuscript source and the rendered output. The profile validator SHALL continue to reject route, gate, branch, and transition drift.

#### Scenario: Review acceptance reaches formatting
- **WHEN** review completes with the `accepted` branch choice
- **THEN** the workflow frontier exposes the `format` child and does not expose `final-integrity` directly

#### Scenario: Re-review acceptance reaches formatting
- **WHEN** a revision round's re-review completes with `accepted`
- **THEN** the next available child is `format`, followed by final-integrity only after formatting completes

#### Scenario: Final integrity consumes source and render
- **WHEN** formatting has completed
- **THEN** final-integrity instructions require both the manuscript source role and the rendered output role
