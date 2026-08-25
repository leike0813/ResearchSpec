## ADDED Requirements

### Requirement: Confirmed Delivery State Is Run-Bound

When a confirmed graph entry includes QMD writing or formatting, the start confirmation SHALL carry the existing manuscript delivery snapshot and Quarto probe summary defined by the manuscript contract. Run authority SHALL preserve that confirmed snapshot, while the QMD source and rendered output remain ordinary files outside `researchspec/`.

#### Scenario: QMD writing starts while Quarto is unavailable

- **WHEN** the user confirms QMD writing with probe status `unavailable`
- **THEN** the run records the confirmed delivery and probe state and permits writing
- **AND** the formatting node remains blocked until a later explicit probe reports `available`

#### Scenario: A read-only command inspects the run

- **WHEN** status, instructions, check, or doctor reads a run with delivery metadata
- **THEN** it reports the stored state without executing Quarto or changing any file

#### Scenario: Formatting becomes eligible

- **WHEN** the stored or newly confirmed probe summary reports `available` and graph prerequisites are satisfied
- **THEN** the formatting node may become eligible through normal frontier evaluation
