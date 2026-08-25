## ADDED Requirements

### Requirement: ARSU Entries Bind Routing Meaning Without Owning Runtime Selection

Each converter-owned ARSU profile entry SHALL carry one `route_ref` that resolves to the converter-owned routing catalog. The binding SHALL provide semantic prerequisites, likely inputs and outputs, risk, and cost for confirmation while the profile entry and frozen graph remain the only runtime selection authority.

#### Scenario: Bound entry instructions are requested

- **WHEN** instructions are requested for a converter-owned ARSU profile
- **THEN** every executable entry resolves exactly one routing record and one graph entry node
- **AND** the returned confirmation context is derived without copying routing risk or cost into the profile

#### Scenario: Entry binding is invalid

- **WHEN** a converter-owned ARSU profile entry omits `route_ref` or references an unknown route
- **THEN** profile validation fails before projection or run start

### Requirement: Formatting And Final Integrity Are Graph-Owned Boundaries

The academic pipeline profile SHALL declare formatting and final-integrity nodes and their ordering as graph data. Every converter-declared end-to-end or mid-entry route SHALL resolve to an explicit entry node, and no Skill or runtime handler SHALL synthesize an entry checkpoint.

#### Scenario: Formatting path is selected

- **WHEN** the academic pipeline reaches formatting after accepted writing or revision work
- **THEN** the formatting node becomes eligible before final integrity
- **AND** final integrity remains blocked until formatting completes and its declared Gate conditions are satisfied

#### Scenario: Mid-entry route is selected

- **WHEN** a user starts any converter-declared academic-pipeline mid-entry
- **THEN** the frozen graph begins at that entry's explicit node and exposes only graph-derived frontier items
