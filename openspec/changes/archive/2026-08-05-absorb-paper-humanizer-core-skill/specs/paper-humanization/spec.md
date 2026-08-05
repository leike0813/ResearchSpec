# Paper Humanization

## ADDED Requirements

### Requirement: Humanization routes preserve manuscript boundaries
`paper-humanizer:review` SHALL be read-only and `paper-humanizer:full` SHALL write only ordinary boundary deliverables while ResearchSpec control files remain lifecycle authority.

#### Scenario: Start review
- **WHEN** a user confirms a manuscript input for `paper-humanizer:review`
- **THEN** the runtime emits a report without editing the input or creating a Gate

#### Scenario: Accept full revision
- **WHEN** a full candidate passes plan-hash and protected-region checks
- **THEN** the candidate remains pending until a human confirms `paper-humanizer-acceptance`
