## ADDED Requirements

### Requirement: Navigate Orchestrates Free-Form Annotation Intake
ResearchSpec Navigate SHALL treat manuscript annotation intake as an
Agent-assisted pre-route activity over the shared session and interpretation
contracts, then continue through the existing annotation registration and
revision routes.

#### Scenario: User supplies a free-form review
- **WHEN** a user provides an annotated copy, feedback file, or conversational comments
- **THEN** Navigate SHALL preserve the raw material, ask the Host Agent to interpret it, surface ambiguities and high-impact items, and materialize only confirmed ready entries
- **AND** it SHALL NOT require a Markdown annotation syntax

#### Scenario: Annotation set is ready
- **WHEN** the interpretation candidate is complete and the human confirms submission
- **THEN** Navigate SHALL use the existing `annotation:<id>` descriptor and submit transaction before selecting the existing revision, revision-coach, re-review, or pipeline route

