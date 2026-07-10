## Purpose

ResearchSpec provides a typed subflow-instance control plane that turns confirmed
subflow templates into runtime instances, derives catalog-bound route summaries
and prerequisites, atomically records receipt-backed starts, computes
workflow-declared parallel frontiers, delegates start-authorized automatic work
submission, and preserves legacy `0.1` static workflow compatibility. This
capability is the contract layer that owns subflow/round instance lifecycle
without executing semantic work.

## Requirements

### Requirement: Typed Subflow And Round Instances
ResearchSpec SHALL represent standalone, pipeline and repeatable round work as strict subflow templates and runtime instances under one active run.

#### Scenario: Confirmed template becomes an instance
- **WHEN** a valid start transaction commits a startable template
- **THEN** state SHALL contain an instance with template, route, parent, round, stage and receipt identity
- **AND** the transaction SHALL NOT execute semantic work

#### Scenario: Round identity is derived
- **WHEN** a round template is started for a valid parent
- **THEN** its round number SHALL be one greater than existing sibling rounds for that parent/template
- **AND** core SHALL NOT impose a fixed maximum round count

### Requirement: Catalog-Bound Subflow Instructions
ResearchSpec SHALL derive subflow route summaries and prerequisites from the canonical ARSU routing catalog and the current workflow template.

#### Scenario: Template instructions are confirmation-ready
- **WHEN** a caller requests instructions for an available subflow template
- **THEN** the packet SHALL separate Skill/route, prerequisites, artifacts, Gate policy, risk, cost, coverage, parent/round policy and work/parallel summary
- **AND** it SHALL include a deterministic instruction basis hash and strict Start contract

#### Scenario: Missing prerequisite does not auto-expand
- **WHEN** a route prerequisite group is not satisfied
- **THEN** status/instructions SHALL expose the missing requirements and fallback route refs
- **AND** ResearchSpec SHALL NOT start the fallback route

### Requirement: Atomic Receipt-Backed Start
ResearchSpec SHALL preview and atomically record a confirmed subflow start with read-precondition protection.

#### Scenario: Dry-run is side-effect free
- **WHEN** Start runs in dry-run mode with valid input
- **THEN** it SHALL return the semantic plan hash, derived instance, receipt and write plan
- **AND** state, artifacts and ledgers SHALL remain byte-for-byte unchanged

#### Scenario: Start commits receipt before state
- **WHEN** the exact previewed plan is authorized
- **THEN** ResearchSpec SHALL create or reuse the matching start receipt before refreshing state
- **AND** state SHALL be the authoritative record of the active instance

#### Scenario: Exact retry is idempotent
- **WHEN** the same plan hash already identifies a trusted instance and receipt
- **THEN** Start SHALL return `already_started` without another write
- **AND** divergent receipts, IDs or basis hashes SHALL fail as conflicts

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

### Requirement: Start-Authorized Automatic Work Submit
ResearchSpec SHALL allow a started subflow to delegate deterministic candidate registration for work nodes declared automatic.

#### Scenario: Automatic work needs no second human prompt
- **WHEN** an automatic instance work item has a valid start authorization and candidate
- **THEN** the Agent MAY perform Submit dry-run and exact-hash execution without another user confirmation
- **AND** the submission SHALL remain mechanical rather than academic approval

#### Scenario: Invalid start evidence blocks delegation
- **WHEN** the referenced start receipt is missing, drifted or inconsistent with state/template/work
- **THEN** automatic Submit SHALL be blocked
- **AND** it SHALL not write registry, state or ledgers

### Requirement: Legacy Runtime Compatibility
ResearchSpec SHALL keep valid static `0.1` workflow workspaces readable and executable without implicit migration.

#### Scenario: Legacy work selector remains usable
- **WHEN** an existing workspace contains top-level work items and no subflow templates
- **THEN** `work:<id>` status, instructions and Submit SHALL retain their established behavior
- **AND** Start SHALL report the workflow as unconfigured for subflow use
