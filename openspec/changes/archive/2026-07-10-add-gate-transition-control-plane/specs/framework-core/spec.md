## ADDED Requirements

### Requirement: Typed Instance Gate And Transition Graph
ResearchSpec SHALL parse strict Gate and transition declarations inside Schema 0.2 subflow templates while defaulting missing arrays to empty for existing workspaces.

#### Scenario: New declarations are validated
- **WHEN** a template declares Gates or transitions
- **THEN** Gate/stage/evidence/transition/decision references, scoped IDs, targets and effects SHALL be validated before control-plane use

#### Scenario: Existing Schema 0.2 remains readable
- **WHEN** a valid existing template or instance omits the new arrays or receipt refs
- **THEN** ResearchSpec SHALL interpret them as empty without rewriting the workspace

### Requirement: Per-Instance Gate And Transition Frontier
ResearchSpec SHALL derive Gate and transition state independently for every active subflow instance.

#### Scenario: Work completion exposes a Gate
- **WHEN** an instance stage completes work and declares an unsatisfied formal Gate
- **THEN** its Gate selector SHALL enter the frontier and transitions SHALL remain blocked

#### Scenario: Trusted basis exposes transition candidates
- **WHEN** required Gates pass or have an accepted trusted override
- **THEN** status SHALL report eligible, ambiguous or blocked transitions with their instance-local basis

#### Scenario: Terminal effect updates lifecycle
- **WHEN** a terminal transition commits
- **THEN** the instance SHALL become complete and run lifecycle SHALL be re-derived without modifying unrelated instances
