## ADDED Requirements

### Requirement: Canonical dual-runtime boundary
The framework SHALL make adaptive runtime the default for new workspaces and SHALL retain Schema `0.2` strict compatibility only for explicit strict initialization or unmigrated existing workspaces.

#### Scenario: New default workspace
- **WHEN** a user initializes a workspace without a strict profile
- **THEN** the framework SHALL use adaptive Case obligations, formal Gates, completion, and case actions

#### Scenario: Existing strict workspace
- **WHEN** a Schema `0.2` workspace has not completed an explicit plan-bound migration
- **THEN** the framework SHALL continue to use the strict compatibility graph without automatic migration
