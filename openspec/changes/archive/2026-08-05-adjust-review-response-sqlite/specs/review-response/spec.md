## ADDED Requirements

### Requirement: standalone route and profile
The system SHALL expose `review-response:full` as a standalone route owned by the `review-response` Skill, with six ordered checkpoints and no membership in `academic-pipeline`.

#### Scenario: route is available
- **WHEN** a current workspace requests route instructions for `review-response:full`
- **THEN** the response identifies the six checkpoints, required Gates, review-response Skill, and confirmation cost without mutating files

### Requirement: SQLite semantic runtime
The Skill SHALL initialize `work/review-response/review-response.db` with foreign keys enabled and tables for reviewer threads, atomic comments, workboard, strategy cards, evidence supplements, manuscript execution items, semantic revision logs, response rows, and local resume state.

#### Scenario: CRUD and rendering
- **WHEN** a valid runtime write is committed
- **THEN** `gate-and-render` validates the control projection, reads the SQLite truth, and renders deterministic Markdown views below the instance `views/` directory

### Requirement: control projection fail-closed
The runtime SHALL treat `control.yaml` as workflow authority and SHALL fail closed when the projected instance, checkpoint, status, or control hash is missing or stale.

#### Scenario: stale checkpoint
- **WHEN** SQLite reports a different current checkpoint than `control.yaml`
- **THEN** no view or transition is produced and the command returns a structured synchronization error

### Requirement: private runtime boundary
The database, local resume material, source snapshots, and working manuscript SHALL remain below `work/review-response/`; `views/` SHALL be a derived instance-root directory.

#### Scenario: bounded pack
- **WHEN** a subflow or full current workspace is packed
- **THEN** control, handoff, specs, profiles, and changes may be included, while `work/`, `views/`, and SQLite bytes are excluded

### Requirement: manuscript format contract
Review-response handoffs SHALL accept Markdown, QMD, single-file LaTeX, and LaTeX project descriptors, with explicit source path and project directory shape where needed. Existing ARSU revision, rebuttal-audit, and re-review routes SHALL retain their behavior.

#### Scenario: LaTeX project handoff
- **WHEN** a handoff declares `format: latex-project`
- **THEN** it includes `path_kind: directory` and a `.tex` `entry_path`, while a single-file LaTeX handoff uses a `.tex` path
