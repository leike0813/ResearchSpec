## ADDED Requirements

### Requirement: Packaged mid-entry journeys can start the selected child
Packaged CLI acceptance SHALL cover every declared academic-pipeline mid-entry point and SHALL prove that a newly confirmed parent exposes only the selected first child and can start that child through a separately confirmed Start.

#### Scenario: Existing research materials enter at writing
- **WHEN** a packaged CLI journey confirms `academic-pipeline:mid-entry` with `entry_point: write`
- **THEN** the parent frontier exposes the writing child without `child_start_blocked`
- **AND** a separately confirmed writing Start succeeds

#### Scenario: Every declared entry is exercised
- **WHEN** acceptance parameterizes the academic-pipeline mid-entry Start over all declared entry points
- **THEN** each parent begins at the selected checkpoint and exposes only the corresponding first child
- **AND** revision and re-review entries begin at local round 1

#### Scenario: Existing end-to-end and standalone journeys run
- **WHEN** the packaged acceptance suite exercises end-to-end, formatting, final-integrity, and standalone routes
- **THEN** their existing order and Start contracts remain unchanged
