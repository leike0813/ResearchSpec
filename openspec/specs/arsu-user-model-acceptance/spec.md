## Purpose
Define black-box acceptance at the packaged CLI and installed Agent surface.

## Requirements

### Requirement: Current User Model Acceptance

Packaged CLI journeys SHALL validate the current workspace, sixteen-command
surface, ten fixed Skills, optional seven-Skill Zotero Adapter and independently
confirmed subflows.

#### Scenario: Fresh default journey is exercised

- **WHEN** acceptance starts from an empty project through the packaged CLI without Adapter selection
- **THEN** every authoritative mutation SHALL be performed by a fresh CLI process
- **AND** the workspace SHALL contain no `.zotero-bridge` runtime or Adapter Skill projection

#### Scenario: Fresh Zotero journey is exercised

- **WHEN** acceptance initializes with explicit `zotero-library` selection
- **THEN** the selected Agent host SHALL receive all seven Adapter Skills and the project SHALL receive the current-platform runtime and profile template
- **AND** test helpers SHALL not execute Adapter assets or contact Zotero

### Requirement: Hard-Cut Acceptance
Acceptance SHALL prove that old or unknown workspaces are rejected without mutation and without
legacy projection.

#### Scenario: Legacy runtime is presented
- **WHEN** a journey contains old state, registry, ledger, receipt or Passport files
- **THEN** status/check/doctor report unsupported format
- **AND** no command migrates, archives or repairs those files

### Requirement: User journeys expose format intake and final delivery order
The packaged CLI and installed Skills SHALL make format selection part of writing intake, allow QMD writing when Quarto is unavailable, block formatting when probe status is `unavailable` or `unknown`, route formatting before final-integrity, and keep manuscript/rendered files external and excluded from `pack`.

#### Scenario: QMD writing is possible without Quarto
- **WHEN** the user selects QMD and the probe reports `unavailable`
- **THEN** writing may start with the unavailable probe recorded, while the formatting child remains blocked

#### Scenario: Formatting precedes final integrity
- **WHEN** the user follows an accepted review or dynamic revision round
- **THEN** the route summary and frontier require formatting before the final-integrity Gate

#### Scenario: Pack excludes external deliverables
- **WHEN** a workspace contains the QMD source and rendered output outside `researchspec/`
- **THEN** `pack` does not copy or register either file

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
