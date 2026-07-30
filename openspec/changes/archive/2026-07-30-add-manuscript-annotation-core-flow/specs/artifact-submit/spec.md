## ADDED Requirements

### Requirement: Human-Confirmed Annotation Submission

Annotation submission SHALL use action schema
`researchspec://actions/submit-annotation/v1`, execution policy
`human_confirmed`, and descriptor-bound semantic input.

#### Scenario: Annotation preview is requested

- **WHEN** `annotation:<id>` instructions or dry-run submission resolves a
  candidate
- **THEN** ResearchSpec SHALL report the candidate and base hashes, validation
  result, confirmation requirements, and create-only frozen-set, receipt, and
  registry operations
- **AND** it SHALL write nothing

#### Scenario: Annotation submission executes

- **WHEN** the action basis is current and named human confirmation is supplied
- **THEN** ResearchSpec SHALL revalidate the candidate, base registry and file,
  targets, clarifications, and supersession before receipt-first registration
- **AND** caller input SHALL not override derived paths, hashes, identities, or
  registry payloads

### Requirement: Annotation Submit Idempotency And Recovery

Annotation submission SHALL treat exact completed retries and exact partial
transaction recovery as success and all divergent states as conflicts.

#### Scenario: Exact retry is complete

- **WHEN** frozen set, receipt, and registry records already match the current
  submission
- **THEN** ResearchSpec SHALL return `already_submitted` without writing

#### Scenario: Matching partial transaction is resumed

- **WHEN** an exact frozen set or exact frozen set plus receipt exists and later
  phases are missing
- **THEN** ResearchSpec SHALL create only the missing receipt or registry phase
- **AND** divergent existing evidence SHALL remain untouched and fail closed
