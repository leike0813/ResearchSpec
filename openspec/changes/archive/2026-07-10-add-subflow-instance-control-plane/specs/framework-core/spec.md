## MODIFIED Requirements

### Requirement: Typed Workflow Work-Item Contract

ResearchSpec SHALL parse and validate both legacy typed work-item definitions and strict instance-enabled subflow templates without hard-coding ARSU stage semantics into core.

#### Scenario: Valid graph becomes executable control data

- **GIVEN** `specs/workflow.yaml` declares unique legacy work items or strict subflow templates with valid stages, dependencies, outputs, instructions, parallel groups, validation, submission and completion metadata
- **WHEN** ResearchSpec loads the workspace snapshot
- **THEN** it SHALL expose a typed workflow definition to runtime consumers
- **AND** template, work-item, stage, group, route, dependency, output-path and graph references SHALL be validated

#### Scenario: Invalid graph blocks control-plane use

- **GIVEN** a workflow contains duplicate IDs/outputs, missing references, an invalid route/placeholder/join, a dependency cycle, or a path escape
- **WHEN** ResearchSpec loads or checks the workspace
- **THEN** it SHALL emit a blocking diagnostic with a stable reason code
- **AND** it SHALL NOT produce a usable frontier from that graph

#### Scenario: Legacy workflow remains valid but unconfigured

- **GIVEN** a valid existing workflow contract has neither `work_items` nor `subflow_templates`
- **WHEN** ResearchSpec loads, checks, or reports status for the workspace
- **THEN** ordinary workspace operations SHALL continue to succeed
- **AND** workflow control SHALL report `configured: false` without modifying the workspace

### Requirement: Deterministic Read-Only Workflow Evaluation

ResearchSpec SHALL derive template, instance, parallel-group and work state from typed workflow/state, contracts, artifact registry/files, decisions and gates without modifying the workspace.

#### Scenario: Unstarted Slice exposes a subflow frontier

- **GIVEN** a new `arsu-research-slice` workspace with no subflow instance
- **WHEN** ResearchSpec evaluates the workflow
- **THEN** it SHALL expose the research template as startable
- **AND** it SHALL expose no ready work item before Start

#### Scenario: Started Slice frontier is deterministic

- **GIVEN** the research Slice subflow is active with no registered outputs
- **WHEN** ResearchSpec evaluates the workflow
- **THEN** scoped RQ Brief work SHALL be ready and downstream work SHALL be blocked
- **AND** repeated evaluation of unchanged files SHALL return the same frontier

#### Scenario: Registered evidence completes scoped work

- **GIVEN** a registry entry and receipt match the subflow instance, logical work item, artifact type, resolved output, accepted states, SHA-256 and completion Gates
- **WHEN** ResearchSpec evaluates the workflow
- **THEN** that scoped work SHALL be done
- **AND** its dependents SHALL become ready when other dependencies and joins are satisfied

#### Scenario: Candidate file is not mistaken for completion

- **GIVEN** a candidate exists at the resolved output path but no matching registry entry exists
- **WHEN** ResearchSpec evaluates the workflow
- **THEN** the item SHALL remain ready
- **AND** it SHALL report `candidate_unregistered`

#### Scenario: Registered drift blocks the item

- **GIVEN** a scoped registry entry is missing, escaped, hash-drifted or inconsistent with its start/submission receipt
- **WHEN** ResearchSpec evaluates the workflow
- **THEN** the item SHALL be blocked with a stable reason
- **AND** artifact/runtime checks SHALL reuse the same inspection facts

#### Scenario: Instance stage remains authoritative

- **GIVEN** a work item stage differs from its instance `active_stage_id`
- **WHEN** the graph is evaluated
- **THEN** the item SHALL be blocked with reason `inactive_stage`

#### Scenario: Stage completion exposes a transition boundary

- **GIVEN** all required work and parallel joins in an active instance stage are satisfied
- **WHEN** ResearchSpec reports workflow control
- **THEN** it SHALL report `stage_work_complete` and `transition_required: true`
- **AND** it SHALL NOT update state or declare the run/subflow terminal

### Requirement: Explicit Research Slice Profile

ResearchSpec SHALL provide an opt-in dynamic `arsu-research-slice` profile while preserving `arsu-paper` as the default and old Slice workspaces as legacy inputs.

#### Scenario: Explicit Slice initialization creates a startable template

- **WHEN** a user initializes a new workspace with `--profile arsu-research-slice`
- **THEN** workflow/state SHALL use Schema `0.2` with a partial research subflow template and no instances
- **AND** no empty candidate, copied template or started academic work SHALL be created

#### Scenario: Default initialization remains unchanged

- **WHEN** a user initializes without an explicit profile
- **THEN** ResearchSpec SHALL use `arsu-paper`

#### Scenario: Init cannot replace an existing profile

- **GIVEN** an initialized workspace has one profile
- **WHEN** `init` requests another profile
- **THEN** ResearchSpec SHALL return a write-conflict-class failure
- **AND** it SHALL require explicit migration rather than replacing workflow/state

