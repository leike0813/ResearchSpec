## ADDED Requirements

### Requirement: Generated Full Runtime Preflight
ResearchSpec SHALL generate ARSU contract preflight guidance that consumes subflow, work, Gate and transition frontier without duplicating control-plane semantics.

#### Scenario: Generated Skill encounters a Gate
- **WHEN** status exposes a formal Gate selector
- **THEN** generated guidance SHALL route semantic verification through Verify, require human confirmation and use `submit gate:` rather than editing the ledger

#### Scenario: Generated Skill encounters transitions
- **WHEN** status exposes one authorized transition or multiple branch candidates
- **THEN** guidance SHALL respectively use receipt-bound Advance or route the choice through Decide

#### Scenario: Converter output remains authoritative
- **WHEN** preflight guidance changes
- **THEN** converter regeneration, manifest hashes, validation and idempotence SHALL remain the generated-file source of truth
