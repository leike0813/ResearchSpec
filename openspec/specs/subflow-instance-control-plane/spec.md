## Purpose
Define independently confirmed subflow instances, parent relationships, and profile-derived concurrency.

## Requirements

### Requirement: Catalog-Bound Subflow Instructions
ResearchSpec SHALL derive subflow route summaries and prerequisites from the canonical ARSU routing catalog and the current workflow template.

#### Scenario: Template instructions are confirmation-ready
- **WHEN** a caller requests instructions for an available subflow template
- **THEN** the packet SHALL separate Skill/route, prerequisites, artifacts, Gate policy, risk, cost, coverage, parent/round policy and work/parallel summary
- **AND** it SHALL include a deterministic instruction basis hash and
  descriptor-owned Start contract

#### Scenario: Missing prerequisite does not auto-expand
- **WHEN** a route prerequisite group is not satisfied
- **THEN** status/instructions SHALL expose the missing requirements and fallback route refs
- **AND** ResearchSpec SHALL NOT start the fallback route

### Requirement: Workflow-Declared Parallel Frontier
ResearchSpec SHALL compute parallel dispatch and join readiness only from profile declarations.

#### Scenario: All join waits for required members
- **WHEN** an all-policy group has unfinished required members
- **THEN** the group SHALL remain unsatisfied and its dependents SHALL remain blocked

#### Scenario: Quorum join unlocks at threshold
- **WHEN** a quorum-policy group reaches its declared completed-member count
- **THEN** the group SHALL be satisfied even if optional or excess members remain

#### Scenario: Dispatch respects capacity
- **WHEN** ready group members exceed `max_concurrency`
- **THEN** only the deterministic capacity-limited subset SHALL appear in `ready_items`
- **AND** remaining ready members SHALL report `parallel_capacity_deferred`

### Requirement: Per-Subflow Authority File
Every started subflow SHALL have exactly one `control.yaml` that owns its immutable instance ID,
route, optional profile/parent/round, start confirmation, lifecycle status, checkpoint, Gate attempts,
local Decisions and formal transitions.

#### Scenario: Standalone subflow starts
- **WHEN** a confirmed standalone route is started
- **THEN** the CLI atomically creates one control, one handoff and an optional private work directory
- **AND** no global state, ledger, receipt or registry is created

### Requirement: Child Relationship Has One Owner
The child control's parent reference SHALL be the only stored parent/child relationship fact; parent
views SHALL be derived by scanning controls.

#### Scenario: Parent status is requested
- **WHEN** status displays a pipeline parent
- **THEN** child summaries are derived from controls that reference the parent instance ID

### Requirement: Subflow starts require a human-confirmed route snapshot
The start contract SHALL preserve the existing human confirmation fields and SHALL additionally carry an optional manuscript format snapshot and Quarto probe summary. When present, the snapshot SHALL match the current manuscript delivery contract at start time; a stale snapshot SHALL reject the start. Handoff input/output descriptors SHALL accept optional `format`, `format_id`, and `renderer` metadata, and QMD paths SHALL end in `.qmd`.

#### Scenario: Confirmed Markdown start
- **WHEN** the start contract carries a `markdown` snapshot matching `manuscript.yaml`
- **THEN** the subflow starts and stores the snapshot in `control.yaml`

#### Scenario: Confirmed QMD start records probe state
- **WHEN** the start contract carries a matching `qmd` snapshot and a Quarto probe summary
- **THEN** the control stores both immutable values for the subflow

#### Scenario: Stale format snapshot is rejected
- **WHEN** the manuscript delivery contract differs from the start snapshot
- **THEN** start fails with a format-snapshot conflict and creates no subflow directory

#### Scenario: Invalid QMD handoff path is rejected
- **WHEN** an input or output declares `format: qmd` but its path does not end in `.qmd`
- **THEN** handoff/start validation fails
