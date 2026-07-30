## ADDED Requirements

### Requirement: Annotation Feedback Routing

The ARSU routing catalog SHALL recognize a registered `annotation_set` as review
feedback for revision-coach, revision, re-review, and pipeline mid-entry
selection.

#### Scenario: User arrives with manuscript annotations

- **WHEN** a user requests work on registered annotations against a registered
  draft
- **THEN** Navigate SHALL present the existing revision or pipeline route with
  the Annotation Set as a prerequisite
- **AND** it SHALL not invent a new ARSU Skill, mode, or Companion

#### Scenario: Re-review has a resolution report

- **WHEN** an `annotation_resolution_report` exists after revision
- **THEN** re-review MAY consume it as supplementary feedback evidence
- **AND** a full peer review SHALL remain independent unless the selected route
  explicitly requires it
