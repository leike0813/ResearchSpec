## ADDED Requirements

### Requirement: Annotated Revision Workflow Entry

Workflow profiles SHALL admit a registered Markdown draft and Annotation Set
into existing revision and re-review work without adding a workflow stage.

#### Scenario: Strict annotated mid-entry starts

- **WHEN** `enter-annotated-revision` is selected with a registered draft and
  matching Annotation Set
- **THEN** strict mode SHALL instantiate the existing revision round, child work,
  Decisions, and Gates
- **AND** it SHALL not add a separate annotation stage

#### Scenario: Adaptive annotated work starts

- **WHEN** adaptive mode starts a revision route with one selected Annotation Set
- **THEN** the start receipt SHALL bind that exact prerequisite
- **AND** progress SHALL continue through ordinary obligations and completion
  without a hidden round graph

#### Scenario: Revision continues to re-review

- **WHEN** patch application creates a Resolution Report
- **THEN** the existing re-review and later revision-round recovery paths SHALL
  consume registered evidence through their declared any-of prerequisites
