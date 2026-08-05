## MODIFIED Requirements

### Requirement: Subflow starts require a human-confirmed route snapshot
The start contract SHALL preserve the existing human confirmation fields and SHALL additionally carry an optional manuscript format snapshot and Quarto probe summary. When present, the snapshot SHALL match the current manuscript delivery contract at start time; a stale snapshot SHALL reject the start. Handoff input/output descriptors SHALL accept optional `format`, `format_id`, and `renderer` metadata, and QMD paths SHALL end in `.qmd`.

#### Scenario: Confirmed Markdown start
- **WHEN** the start command carries a `markdown` snapshot matching `manuscript.yaml`
- **THEN** the subflow starts and stores the snapshot in `control.yaml`

#### Scenario: Confirmed QMD start records probe state
- **WHEN** the start command carries a matching `qmd` snapshot and a Quarto probe summary
- **THEN** the control stores both immutable values for the subflow

#### Scenario: Stale format snapshot is rejected
- **WHEN** the manuscript delivery contract differs from the start snapshot
- **THEN** start fails with a format-snapshot conflict and creates no subflow directory

#### Scenario: Invalid QMD handoff path is rejected
- **WHEN** an input or output declares `format: qmd` but its path does not end in `.qmd`
- **THEN** handoff/start validation fails
