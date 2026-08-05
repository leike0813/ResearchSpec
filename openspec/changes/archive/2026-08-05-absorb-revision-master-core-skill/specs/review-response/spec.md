# Review Response Core Skill

## ADDED Requirements

### Requirement: complete absorbed Skill package
The published `review-response` Core Skill SHALL contain the complete six-stage revision workflow, its references, schema, localization catalogs, templates, and deterministic helper scripts required to execute and recover the workflow.

#### Scenario: installed Skill is executable
- **WHEN** a selected Agent tool receives the fixed `review-response` Skill
- **THEN** it contains the complete Skill instructions, stage references, render assets, SQLite helpers, export helpers, and no upstream development-only files

### Requirement: instance-local runtime layout
The runtime SHALL store SQLite and private working material under `work/review-response/` and SHALL render all human-readable derived views under the instance-root `views/` directory.

#### Scenario: initialize and render
- **WHEN** a valid ResearchSpec subflow scaffold is initialized and gate-rendered
- **THEN** the database is `work/review-response/review-response.db`, localization and manuscript copies remain private, and all 17 views and strategy cards are rendered below `views/`

### Requirement: ResearchSpec authority synchronization
The runtime SHALL read `control.yaml` and `handoff.md`, maintain a diagnostic control projection, and fail closed on projection drift or a checkpoint mismatch between ResearchSpec control and SQLite local state.

#### Scenario: stale control
- **WHEN** the control hash, handoff hash, instance identity, status, or checkpoint differs from the synchronized projection
- **THEN** gate-and-render returns a structured synchronization error and does not render a new view

### Requirement: preserved manuscript and response outputs
The Skill SHALL preserve the absorbed workflow's Markdown, QMD, single-file LaTeX, and LaTeX-project inputs, explicit working-copy rules, marked/clean manuscript export, Markdown response letter, LaTeX response letter, and optional latexdiff output.

#### Scenario: source manuscript remains unchanged
- **WHEN** a marked or clean export is generated
- **THEN** the source snapshot remains unchanged and the output is written only to its explicit target path
