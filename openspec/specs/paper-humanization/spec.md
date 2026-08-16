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

`cap-check-paper-humanization-review` SHALL accept a boundary manuscript file and emit a review
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
