## ADDED Requirements

### Requirement: Typed Workflow Work-Item Contract

ResearchSpec SHALL parse and validate optional typed work-item definitions from the workspace workflow contract without hard-coding ARSU stage semantics into core.

#### Scenario: Valid graph becomes executable control data

- **GIVEN** `specs/workflow.yaml` declares unique work items with valid stages, dependencies, outputs, instructions, validation, and completion metadata
- **WHEN** ResearchSpec loads the workspace snapshot
- **THEN** it SHALL expose a typed workflow definition to runtime consumers
- **AND** work-item IDs, stage references, dependencies, output paths, and graph acyclicity SHALL be validated

#### Scenario: Invalid graph blocks control-plane use

- **GIVEN** a workflow graph contains a duplicate ID or output, missing stage or dependency, cycle, absolute output, or parent-directory escape
- **WHEN** ResearchSpec loads or checks the workspace
- **THEN** it SHALL emit a blocking diagnostic with a stable reason code
- **AND** it SHALL NOT produce a usable next-action frontier from that graph

#### Scenario: Legacy workflow remains valid but unconfigured

- **GIVEN** a valid existing workflow contract has no `work_items`
- **WHEN** ResearchSpec loads, checks, or reports status for the workspace
- **THEN** ordinary workspace operations SHALL continue to succeed
- **AND** the workflow control result SHALL report `configured: false` without modifying the workspace

### Requirement: Deterministic Read-Only Workflow Evaluation

ResearchSpec SHALL derive work-item state from the typed workflow, active stage, current contracts, artifact registry, artifact files, decisions, and gates without modifying any workspace file.

#### Scenario: Initial Slice frontier is deterministic

- **GIVEN** an initialized `arsu-research-slice` workspace with no registered outputs
- **WHEN** ResearchSpec evaluates the workflow
- **THEN** RQ Brief SHALL be ready
- **AND** Bibliography and Synthesis SHALL be blocked by their declared dependencies
- **AND** repeated evaluation of unchanged files SHALL return the same frontier

#### Scenario: Registered evidence completes a work item

- **GIVEN** a registry entry matches the work item, artifact type, normalized output path, accepted artifact state, verification state, SHA-256, and required completion gates
- **WHEN** ResearchSpec evaluates the workflow
- **THEN** the work item SHALL be done
- **AND** its dependent work item SHALL become ready when all other dependencies are satisfied

#### Scenario: Candidate file is not mistaken for completion

- **GIVEN** a candidate exists at the declared output path but no matching registry entry exists
- **WHEN** ResearchSpec evaluates the workflow
- **THEN** the item SHALL remain ready
- **AND** it SHALL report a `candidate_unregistered` warning

#### Scenario: Registered drift blocks the item

- **GIVEN** a registry entry claims a work-item output but the file is missing, escapes allowed roots, or no longer matches its SHA-256
- **WHEN** ResearchSpec evaluates the workflow
- **THEN** the item SHALL be blocked with the corresponding stable reason
- **AND** workspace artifact checks SHALL use the same inspection result

#### Scenario: Active stage remains authoritative

- **GIVEN** a work item's stage differs from `state.active_stage_id`
- **WHEN** the graph is evaluated
- **THEN** the item SHALL be blocked with reason `inactive_stage`

#### Scenario: Stage completion exposes a transition boundary

- **GIVEN** all configured work items in the active Slice stage are done
- **WHEN** ResearchSpec reports workflow control state
- **THEN** it SHALL report `stage_work_complete` and `transition_required: true`
- **AND** it SHALL NOT change run state or declare the workflow terminal

### Requirement: Explicit Research Slice Profile

ResearchSpec SHALL provide an opt-in `arsu-research-slice` initialization profile while preserving `arsu-paper` as the default.

#### Scenario: Explicit Slice initialization creates the graph

- **WHEN** a user initializes a new workspace with `--profile arsu-research-slice`
- **THEN** the workflow SHALL contain RQ Brief, Bibliography, and Synthesis nodes in the `research` stage
- **AND** state SHALL use `research` as its active stage
- **AND** output directories SHALL be derived from node output paths
- **AND** no empty artifact or copied template SHALL be created

#### Scenario: Default initialization remains unchanged

- **WHEN** a user initializes a workspace without an explicit profile
- **THEN** ResearchSpec SHALL use `arsu-paper`

#### Scenario: Init cannot replace an existing profile

- **GIVEN** an initialized workspace has one profile
- **WHEN** a user invokes `init` with a different profile
- **THEN** ResearchSpec SHALL return a write-conflict-class failure
- **AND** it SHALL require an explicit future contract migration rather than replacing workflow or state files
