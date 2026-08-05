# Paper Humanization

## Purpose

TBD

## Requirements

### Requirement: Document analysis is deterministic
The system SHALL parse plain Markdown, Quarto, and LaTeX documents while preserving protected code, math, links, citations, and front matter. It SHALL return stable JSON-compatible analysis with sentence counts and diagnostic error codes.

### Requirement: Review is read-only
`paper-humanizer:review` SHALL accept a boundary manuscript file and emit a review report without changing the manuscript or creating a ResearchSpec Gate.

### Requirement: Full workflow is gated
`paper-humanizer:full` SHALL emit a review report and revision plan, validate candidate revisions, preserve protected content, and require the `paper-humanizer-acceptance` Gate before final acceptance.

### Requirement: Runtime remains agent-neutral
The runtime SHALL use only Node standard-library APIs and SHALL not execute upstream code, install dependencies, contact external services, or mutate ResearchSpec control files.
#### Scenario: Analyze a manuscript
- **WHEN** the runtime receives Markdown, Quarto, or LaTeX text
- **THEN** it returns stable sentence statistics and protected spans without executing document code
#### Scenario: Review route
- **WHEN** `paper-humanizer:review` starts with a manuscript boundary file
- **THEN** it produces a review report and leaves the manuscript and control authority unchanged
#### Scenario: Full acceptance
- **WHEN** a candidate passes plan-hash and protected-content checks
- **THEN** final output remains pending until `paper-humanizer-acceptance` receives human confirmation
#### Scenario: Offline execution
- **WHEN** conversion, checking, or runtime validation runs
- **THEN** no upstream executable, dependency installer, network service, or model API is invoked

### Requirement: Humanization routes preserve manuscript boundaries
`paper-humanizer:review` SHALL be read-only and `paper-humanizer:full` SHALL write only ordinary boundary deliverables while ResearchSpec control files remain lifecycle authority.

#### Scenario: Start review
- **WHEN** a user confirms a manuscript input for `paper-humanizer:review`
- **THEN** the runtime emits a report without editing the input or creating a Gate

#### Scenario: Accept full revision
- **WHEN** a full candidate passes plan-hash and protected-region checks
- **THEN** the candidate remains pending until a human confirms `paper-humanizer-acceptance`
