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

### Requirement: Start Is Independently Confirmed And Idempotent
Each start SHALL bind its own semantic input and human confirmation; an exact retry SHALL resolve to
the same instance without reusing confirmation for a different instance.

#### Scenario: Parent confirmation exists
- **WHEN** a child route becomes available
- **THEN** starting the child still requires a new child-scoped confirmation
