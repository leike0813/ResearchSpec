## ADDED Requirements

### Requirement: Single Current Runtime Contract
ResearchSpec SHALL parse exactly the `arsu-v0-1` Schema 0.2 subflow workflow and run-state family, with explicit current registry and ledger record variants.

#### Scenario: Pre-instance contract is loaded
- **WHEN** workflow or run state uses the former static contract
- **THEN** validation SHALL fail and SHALL NOT expose a runtime frontier

## REMOVED Requirements

### Requirement: Typed Workflow Work-Item Contract
**Reason**: It requires the static and instance workflow families to coexist.
**Migration**: None; use the current Schema 0.2 subflow contract.
