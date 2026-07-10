## ADDED Requirements

### Requirement: Init And Update Reconcile Retired Agent Projections

`init` for an existing workspace and `update` SHALL use the same ownership-aware reconciliation for desired and retired Agent projections.

#### Scenario: Existing workspace converges through either command

- **WHEN** a workspace manifest records clean projections for retired Companion Skills or wrappers
- **THEN** init and update SHALL install the four-Companion desired surface and remove those stale project-local files
- **AND** both commands SHALL produce equivalent manifest ownership facts

#### Scenario: Reconciliation preserves user changes

- **WHEN** a retired projection is unmanifested or differs from its recorded hash
- **THEN** init and update SHALL leave it unchanged and report the applicable ownership or drift boundary
- **AND** repeated reconciliation SHALL be idempotent

#### Scenario: Public command surface is unchanged

- **WHEN** agent projections are consolidated
- **THEN** CLI help SHALL continue to expose exactly init, update, status, instructions, start, submit, advance, check, list, show, handoff, pack, propose, decide, and archive
