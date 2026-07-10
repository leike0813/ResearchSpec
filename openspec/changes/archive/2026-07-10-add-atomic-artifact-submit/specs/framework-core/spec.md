## ADDED Requirements

### Requirement: Write Plan Read Preconditions

ResearchSpec SHALL allow a writing transaction to declare hashes for authoritative read inputs that must remain unchanged until commit.

#### Scenario: Read drift blocks before staging

- **GIVEN** a write plan declares candidate, workflow, state, registry, contract, ledger, or upstream artifact read preconditions
- **WHEN** any declared path no longer matches its expected hash before staging
- **THEN** execution SHALL fail with a write conflict
- **AND** no planned write SHALL be committed

#### Scenario: Existing callers remain compatible

- **WHEN** an existing writing workflow supplies no read preconditions
- **THEN** WritePlan SHALL preserve its current write preflight, staging, rollback, and commit behavior

### Requirement: Receipt-Backed Workflow Completion

ResearchSpec SHALL support workflow completion policies that require a valid artifact submission receipt.

#### Scenario: Valid receipt permits completion evaluation

- **GIVEN** the candidate, receipt record, receipt file, registry hashes, validation payload, and candidate references agree
- **WHEN** other completion requirements are satisfied
- **THEN** the work item SHALL be eligible for `done`

#### Scenario: Forged or drifted receipt blocks completion

- **WHEN** a required receipt is missing, unregistered, hash-drifted, outside allowed roots, or inconsistent with the candidate/work item
- **THEN** the work item SHALL be blocked with a stable completion reason

#### Scenario: Stage completion remains derived

- **GIVEN** every work item in the active Slice stage has a valid submitted artifact and required Gates
- **WHEN** status is evaluated
- **THEN** it SHALL report `stage_work_complete` and `transition_required`
- **AND** it SHALL NOT modify state
