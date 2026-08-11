## ADDED Requirements

### Requirement: Reference mode is self-contained for consumers

The published `paper-humanizer/SKILL.md` SHALL be the sole packaged entrypoint
that consumers load for Reference mode. Consumers SHALL NOT require
`paper-humanizer/references/prose-guidance.md`.

#### Scenario: drafting consumer uses Reference mode

- **WHEN** a consumer creates or edits manuscript prose
- **THEN** it loads `paper-humanizer/SKILL.md` without starting a humanizer
  subflow, running diagnostics, or requesting additional confirmation
