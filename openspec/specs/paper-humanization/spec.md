# Paper Humanization

## Purpose

Define deterministic humanization analysis, capability-node review, graph-owned full revision flow,
and agent-neutral packaged Python tools.

## Requirements

### Requirement: Document analysis is deterministic

The packaged `document_pipeline.py` tool SHALL parse plain Markdown, Quarto, and LaTeX documents
while preserving protected code, math, links, citations, and front matter. It SHALL return stable
JSON-compatible analysis with sentence counts and diagnostic error codes.

#### Scenario: Analysis output is stable

- **WHEN** the same document is analyzed twice without edits
- **THEN** the returned sentence statistics, protected spans, and diagnostic codes are identical

### Requirement: Review is a read-only capability node

`check-paper-humanization-review` SHALL accept a boundary manuscript file and emit a review
report and revision plan without changing the manuscript.

#### Scenario: Review leaves inputs unchanged

- **WHEN** review processes a manuscript boundary file
- **THEN** the input bytes are unchanged and no ResearchSpec control file is mutated

### Requirement: Full humanization is graph-owned

The `paper-humanizer` graph profile SHALL declare review, plan approval, revision, verification, and
acceptance nodes. It SHALL require the `paper-humanizer-plan` Gate before revision and the
`paper-humanizer-acceptance` Decision before completion.

#### Scenario: Revision waits for plan approval

- **WHEN** review has completed
- **THEN** the revision node remains blocked until a human confirms `paper-humanizer-plan`

#### Scenario: Acceptance waits for the Decision

- **WHEN** a candidate passes verification
- **THEN** final completion remains blocked until a human records
  `paper-humanizer-acceptance`

### Requirement: Humanization capabilities preserve manuscript boundaries

The review capability SHALL be read-only. The revision capability SHALL write only ordinary boundary
deliverables and candidate artifacts outside `researchspec/`, while the graph engine remains the only
workflow-state authority.

#### Scenario: Start review

- **WHEN** a user confirms a manuscript input for the `paper-humanizer` graph
- **THEN** the review node emits a report and plan without editing the input or creating a Gate
  attempt

#### Scenario: Accept full revision

- **WHEN** a candidate passes protected-content and information-unit verification
- **THEN** the candidate remains pending until a human records the acceptance Decision

### Requirement: Humanization plans support interactive review projection
A paper-humanizer review procedure SHALL be able to project its bounded plan items and exact manuscript into the shared review-workspace contract. The projection SHALL preserve plan item identity, locators, operation, expected effect, preservation constraints, risk, recommendation, and current disposition.

#### Scenario: User reviews a humanization plan
- **WHEN** a valid humanization plan is projected
- **THEN** each plan item is independently reviewable and the exported result identifies include, exclude, revise, or defer intent without editing the source manuscript

#### Scenario: Candidate requires another revision
- **WHEN** a user requests changes after candidate verification
- **THEN** the exported result is advisory input for a new plan/revision round and does not bypass verification or the acceptance Decision

### Requirement: Humanization authority remains graph-owned
Interactive review SHALL NOT approve a humanization plan, accept a candidate, or mark a graph node complete. Current Gate and Decision instructions SHALL remain the only legal source for those mutations.

#### Scenario: User approves all displayed items
- **WHEN** every workspace item is marked included
- **THEN** revision remains blocked until the `paper-humanizer-plan` Gate and plan Decision are separately recorded through the existing CLI

### Requirement: Plan and candidate have distinct browser reviews
Paper-humanizer plan review SHALL expose the bounded plan, risk and preservation constraints against one frozen manuscript. After candidate verification, an optional comparison review SHALL show the current round's direct base and verified candidate side by side, while retaining the plan item decisions as advisory intent. A candidate review SHALL NOT be presented as verified before the owning verification step succeeds.

#### Scenario: User reviews the plan
- **WHEN** no verified candidate exists
- **THEN** the browser shows the original manuscript and plan items without a fabricated before/after comparison

#### Scenario: User reviews a verified candidate
- **WHEN** the current candidate passed verification
- **THEN** the browser can compare it with its direct base and return comments on either side for a new round or acceptance discussion
