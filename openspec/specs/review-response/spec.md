# Review Response

## Purpose

Define the complete post-submission review-response workflow as capability-graph nodes with a
package-local SQLite semantic runtime and deterministic gate-and-render tooling.

## Requirements

### Requirement: Five capability packages own the review-response workflow

ResearchSpec SHALL author five capability packages for review-response:
`design-review-response-intake`, `analysis-review-response-manuscript-analysis`,
`transform-review-response-comment-atomization`,
`design-review-response-workboard-planning`, and
`generation-review-response-round`. Each package SHALL be vendor-derived from the pinned
`vendor/revision-master` snapshot and SHALL be registered in `skills/capabilities/registry.json`.

#### Scenario: Packages are registered

- **WHEN** the capability registry loads
- **THEN** all five review-response capability IDs resolve to operational vendor-derived packages

### Requirement: Review-response graph owns stage and revision authority

The `review-response` graph profile SHALL declare the ordered nodes
`intake -> manuscript-analysis -> comment-atomization -> comment-coverage Gate -> workboard ->
strategy Gate -> round`, with `round` as the repeatable revision node and `outcome` as the repeatable
review Decision. The profile SHALL require `review-response-comment-coverage` and
`review-response-strategy` before their downstream nodes, and SHALL require
`review-response-evidence`, `review-response-response-coverage`, and
`review-response-final-assembly` before each outcome Decision.

#### Scenario: Revision loop is template-bound

- **WHEN** the outcome Decision records `continue`
- **THEN** the next `round` instance becomes eligible through the revision-round template
- **AND** no Skill prose selects the next round

#### Scenario: Run completion waits for the exit choice

- **WHEN** the outcome Decision records `complete`
- **THEN** the revision template closes and run completion becomes ready only after all other nodes
  and Gates are complete

### Requirement: SQLite runtime remains a package-local semantic truth

The authored capability packages SHALL package `workspace_db.py`, `runtime_localization.py`,
`gate_and_render_workspace.py`, the schema, localization, and template assets required to initialize,
write, validate, and render the task-local `revision-master.db`. The database SHALL remain semantic
truth for review-response artifacts, while graph files remain the only ResearchSpec workflow
authority.

#### Scenario: CRUD and rendering

- **WHEN** a valid runtime write is committed
- **THEN** `gate-and-render` reads the SQLite truth and renders deterministic Markdown views below
  the task-local workspace

#### Scenario: Database is not ResearchSpec authority

- **WHEN** the SQLite state disagrees with the graph frontier
- **THEN** ResearchSpec run/node files remain authoritative for eligibility and transitions

### Requirement: Private runtime boundary

The database, local resume material, source snapshots, and working manuscript SHALL remain below the
task-local review-response workspace. ResearchSpec SHALL NOT register, hash-bind, copy, or
lifecycle-manage those files as boundary deliverables.

#### Scenario: Bounded pack

- **WHEN** a current workspace is packed
- **THEN** ResearchSpec run/node files, specs, profiles, and changes may be included, while
  review-response SQLite and view bytes are excluded

### Requirement: Manuscript format contract

Review-response handoffs SHALL accept Markdown, QMD, single-file LaTeX, and LaTeX project
descriptors, with explicit source path and project directory shape where needed. Existing ARSU
revision, rebuttal-audit, and re-review routes SHALL retain their behavior.

#### Scenario: LaTeX project handoff

- **WHEN** a handoff declares `format: latex-project`
- **THEN** it includes `path_kind: directory` and a `.tex` `entry_path`, while a single-file LaTeX
  handoff uses a `.tex` path
