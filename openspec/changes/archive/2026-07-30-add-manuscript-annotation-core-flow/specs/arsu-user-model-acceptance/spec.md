## ADDED Requirements

### Requirement: Manuscript Annotation User Journey Acceptance

ResearchSpec SHALL maintain packaged-CLI acceptance journeys for Annotation Set
registration, revision mapping, patch application, Resolution Report
registration, re-review, and revision-completeness Gate evidence.

#### Scenario: Annotation authority stays in the public CLI

- **WHEN** acceptance previews, confirms, retries, resumes, applies, or gates an
  annotation-driven revision
- **THEN** every authority mutation SHALL run through a fresh packaged CLI
  process with the current descriptor basis and required confirmation
- **AND** the harness SHALL create producer candidates only at paths returned by
  instructions

#### Scenario: Runtime modes preserve their contracts

- **WHEN** acceptance exercises adaptive standalone, strict standalone, strict
  annotated mid-entry, pipeline revision, re-review, or a later revision round
- **THEN** it SHALL assert stable selectors, receipts, registry hashes, patch
  mappings, Resolution Reports, Gate evidence, and recovery behavior
- **AND** it SHALL retain seventeen commands and the fixed Skill surfaces

#### Scenario: Invalid annotation evidence fails closed

- **WHEN** acceptance introduces base or block drift, ambiguous quote, path
  escape, unresolved clarification, conflicting retry, stale patch, missing
  report, or forged resolution mapping
- **THEN** the public CLI SHALL reject the affected mutation without fabricating
  authority or weakening Gate evidence
