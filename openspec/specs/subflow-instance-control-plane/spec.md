## Purpose

ResearchSpec provides a typed subflow-instance control plane that turns confirmed
subflow templates into runtime instances, derives catalog-bound route summaries
and prerequisites, atomically records receipt-backed starts, computes
workflow-declared parallel frontiers, and delegates start-authorized automatic work
submission. This
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
- **AND** it SHALL include a deterministic instruction basis hash and
  descriptor-owned Start contract

#### Scenario: Missing prerequisite does not auto-expand
- **WHEN** a route prerequisite group is not satisfied
- **THEN** status/instructions SHALL expose the missing requirements and fallback route refs
- **AND** ResearchSpec SHALL NOT start the fallback route

### Requirement: Atomic Receipt-Backed Start
ResearchSpec SHALL compose an optional `material_passport_import` only for external academic-pipeline mid-entry, write imported evidence and receipt before state, and bind the complete import identity into the Start plan.

#### Scenario: Dry-run and commit
- **WHEN** a valid import Start is previewed and then confirmed with its plan hash
- **THEN** dry-run SHALL write nothing and execution SHALL commit immutable evidence before current instance state

#### Scenario: Import is route constrained
- **WHEN** any other selector receives `material_passport_import`
- **THEN** Start SHALL reject the input without writes

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
- **THEN** the Agent MAY execute the descriptor-declared direct Submit without
  another user confirmation or external plan replay
- **AND** the submission SHALL remain mechanical rather than academic approval

#### Scenario: Invalid start evidence blocks delegation
- **WHEN** the referenced start receipt is missing, drifted or inconsistent with state/template/work
- **THEN** automatic Submit SHALL be blocked
- **AND** it SHALL not write registry, state or ledgers

### Requirement: Parent frontier exposes scoped child selectors
The subflow frontier SHALL expose a ready child as `subflow:<parent-instance>/<node-id>` and SHALL resolve its template, dependencies, and next round from the workflow profile.

#### Scenario: Same node exists under two parents
- **WHEN** two active parents make the same node ID ready
- **THEN** each scoped selector resolves only the child candidate of its named parent

### Requirement: Parent confirmation delegates exact child starts
A child start SHALL derive and validate parent receipt, graph, node, frontier,
input artifacts, Decisions, and computed round from current authority before a
direct delegated execution.

#### Scenario: Parent graph or inputs drift
- **WHEN** a child executes against changed graph, prerequisite, Decision, or
  round authority
- **THEN** execution returns a conflict and creates no child instance

### Requirement: Child start receipts bind orchestration identity
A successful parent-scoped start receipt SHALL bind parent instance ID, parent node ID, child template ID, round number, delegated confirmation receipt, prerequisite artifact IDs, trigger Decision IDs, and plan hash.

#### Scenario: Exact child start is retried
- **WHEN** a start request repeats with the same complete receipt basis
- **THEN** it returns the existing child instance without creating a duplicate

### Requirement: Subflow And Run Completion Are Independent

Subflow instance lifecycle SHALL be attached to the enclosing case without
making instance completion equivalent to run completion.

#### Scenario: Standalone instance is completed

- **WHEN** a valid action applies `complete_subflow` to a standalone instance
- **THEN** that instance SHALL become terminal
- **AND** the run SHALL remain open and expose any other allowed starts or case
  actions

#### Scenario: Run is explicitly completed

- **WHEN** a valid run-level action applies `complete_run`
- **THEN** new subflow starts SHALL be terminally blocked
- **AND** instance completion alone SHALL never produce this effect

### Requirement: Subflow Attempts Are Scoped

Attempts and local recovery effects SHALL identify their subflow and obligation
scope and SHALL NOT alter unrelated instance readiness without a declared hard
dependency.

#### Scenario: Instance is paused

- **WHEN** one subflow is paused after a failed attempt
- **THEN** its diagnostics and obligations SHALL remain discoverable
- **AND** an unrelated allowed subflow SHALL remain startable

### Requirement: Start Follows Declared Execution Policy

Subflow Start SHALL derive route, instance, parent, prerequisite, authorization,
and receipt identities from current authority. An external route Start SHALL be
`human_confirmed`; an exact delegated strict child Start SHALL be `direct` when
its parent authority and current frontier permit it.

#### Scenario: User starts an external route

- **WHEN** an available external `subflow:` action is selected
- **THEN** the CLI SHALL require the named user confirmation declared by its
  descriptor and create the start receipt and instance under current read
  preconditions

#### Scenario: Parent starts an exact child

- **WHEN** a strict parent frontier exposes one delegated child selector with
  valid parent authorization
- **THEN** the CLI SHALL permit a direct child Start without a second human
  confirmation or external plan replay
- **AND** it SHALL reject changed parent, graph, prerequisite, or decision facts

## ADDED Requirements

### Requirement: Recoverable adaptive start and completion
Adaptive Case start and completion transactions SHALL be exactly retryable from receipt v2 across receipt-first, authority-first, and state-projection interruption boundaries.

#### Scenario: Start receipt exists without Case state
- **WHEN** a valid start receipt exists and its recorded preconditions still match but Case authority is absent
- **THEN** exact retry SHALL materialize the recorded Case state without creating a second receipt identity

#### Scenario: Completion state exists without reverse receipt binding
- **WHEN** completion authority exists but its receipt binding is absent or inconsistent
- **THEN** Doctor SHALL report the reverse-consistency failure and SHALL repair it only when the v2 receipt proves one unique projection
