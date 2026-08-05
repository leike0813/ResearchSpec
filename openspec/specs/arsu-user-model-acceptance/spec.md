## Purpose
Define black-box acceptance at the packaged CLI and installed Agent surface.

## Requirements

### Requirement: Current User Model Acceptance
Packaged CLI journeys SHALL validate the current workspace, sixteen-command surface, four ARSU
Skills, four Companion Skills, seven Zotero Adapter Skills and independently confirmed subflows.

#### Scenario: Fresh end-to-end journey is exercised
- **WHEN** acceptance starts from an empty project through the packaged CLI
- **THEN** every authoritative mutation is performed by a fresh CLI process
- **AND** test helpers write only producer files at explicit external paths

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
