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
authority. Workbench result processing SHALL use minimal task-local SQLite records and commit
successful processing records with their semantic database writes in the same transaction. Read-only
snapshot preparation and inspection SHALL NOT invoke initialization or repair paths.

#### Scenario: CRUD and rendering

- **WHEN** a valid runtime write is committed
- **THEN** `gate-and-render` reads the SQLite truth and renders deterministic Markdown views below
  the task-local workspace

#### Scenario: Database is not ResearchSpec authority

- **WHEN** the SQLite state disagrees with the graph frontier
- **THEN** ResearchSpec run/node files remain authoritative for eligibility and transitions

#### Scenario: A returned result is accepted

- **WHEN** the Agent applies validated feedback to semantic database records
- **THEN** the accepted feedback receipt commits with those records and derived views are
  regenerated afterward

#### Scenario: Workbench processing resources are authored

- **WHEN** task-local receipt DDL and processing tools are added
- **THEN** they are delivered as ResearchSpec-owned source-path resources through the existing
  authoring chain, and processing-record tables are created only during semantic initialization or
  acceptance writes
- **AND** this change preserves the extracted upstream schema and its extraction-index provenance
  bytes

### Requirement: Private runtime boundary

The database, local resume material, source snapshots, working manuscript, frozen workbench HTML,
trusted business snapshots, and exported results SHALL remain below the task-local review-response
workspace outside `researchspec/`. ResearchSpec SHALL NOT register, hash-bind, copy, or
lifecycle-manage those files as boundary deliverables.

#### Scenario: Bounded pack

- **WHEN** a current workspace is packed
- **THEN** ResearchSpec run/node files, specs, profiles, and changes may be included, while
  review-response SQLite, view, workbench, source, and result bytes are excluded

### Requirement: Manuscript format contract

Review-response handoffs SHALL accept Markdown, QMD, single-file LaTeX, and LaTeX project
descriptors, with explicit source path and project directory shape where needed. Existing ARSU
revision, rebuttal-audit, and re-review routes SHALL retain their behavior.

#### Scenario: LaTeX project handoff

- **WHEN** a handoff declares `format: latex-project`
- **THEN** it includes `path_kind: directory` and a `.tex` `entry_path`, while a single-file LaTeX
  handoff uses a `.tex` path

### Requirement: Review-response workboards support interactive review projection

The review-response procedure SHALL project its four review handoffs through the independent
`revision-master-review-workspace.v1` business contract: coverage mapping, whole workboard, current
strategy, and round revision/response. It SHALL retain SQLite as semantic truth and the graph as
workflow authority. The atomization, workboard-planning, and round packages SHALL provide the
operational resources for their handoffs. The Agent SHALL proactively prepare those handoffs and
process results through the package-local runtime. Dialogue SHALL remain available for the same
review scopes.

#### Scenario: Atomic comments are reviewed

- **WHEN** the Agent projects current atomic comments and workboard state
- **THEN** each comment remains traceable to its original ID, source text, target locations,
  priority, evidence gap, confirmation need, and next action
- **AND** all original-thread and atomic-comment relations remain explicit

#### Scenario: Workspace result returns to the procedure

- **WHEN** the user exports changed dispositions or notes
- **THEN** the Agent validates their snapshot and dependency scopes and applies accepted feedback
  through the existing package-local runtime before regenerating derived views

#### Scenario: A candidate is ready for review

- **WHEN** coverage, a board, the active strategy, or a round revision/response candidate is ready
- **THEN** the owning procedure prepares the corresponding frozen handoff with the appropriate
  internal confirmation or seen scope
- **AND** formal graph confirmation remains a separate dialogue step

### Requirement: Review-response workspace never writes SQLite or manuscript files
The browser workspace SHALL NOT open or modify `revision-master.db`, rendered task-local views, source snapshots, or the working manuscript. Stage-specific package tools SHALL remain responsible for semantic writes and final manuscript revision logging.

#### Scenario: User proposes manuscript text
- **WHEN** the user records proposed text in the browser
- **THEN** it remains in the exported result until the Agent validates and commits it through the current review-response procedure
