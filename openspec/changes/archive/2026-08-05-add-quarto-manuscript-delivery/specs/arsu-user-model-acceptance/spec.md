## MODIFIED Requirements

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
