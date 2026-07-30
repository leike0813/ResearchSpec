## ADDED Requirements

### Requirement: Annotation Instructions Expose Intake Working Paths
`instructions annotation:<id>` SHALL expose the fixed session, review-copy,
interpretation, derived-delta, content-addressed source, and candidate locations
plus their schema references without adding a command or authorizing a write.

#### Scenario: Adapter requests intake instructions
- **WHEN** an adapter or Agent requests instructions for a valid annotation selector
- **THEN** the packet SHALL return contained workspace-relative working paths and the current Annotation Set candidate schema
- **AND** the existing action descriptor SHALL remain the only submission authorization

#### Scenario: Public surface is enumerated
- **WHEN** static CLI discovery or release acceptance enumerates commands
- **THEN** the surface SHALL remain exactly seventeen top-level commands

