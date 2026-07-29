## Purpose

ResearchSpec provides a minimal TypeScript CLI framework for creating and
checking local file-based contract workspaces. This capability covers the first
framework slice: package scaffold, user-facing `init` / `status` / `check`
commands, workspace discovery, and basic workspace validation.
## Requirements
### Requirement: TypeScript CLI Project Scaffold

ResearchSpec SHALL provide a minimal TypeScript project scaffold for a local
file-based CLI framework.

#### Scenario: Package metadata declares CLI entrypoint

- **WHEN** the project scaffold is present
- **THEN** `package.json` SHALL declare a package-managed executable named
  `researchspec`
- **AND** the executable SHALL resolve to the compiled CLI entrypoint
- **AND** package scripts SHALL include build and test commands

#### Scenario: Project uses pnpm as intended package manager

- **WHEN** maintainers inspect the project scaffold
- **THEN** project metadata SHALL indicate pnpm as the intended package manager
- **AND** this change SHALL NOT require a generated lockfile before dependencies
  are explicitly installed

#### Scenario: TypeScript configuration exists

- **WHEN** the project scaffold is present
- **THEN** TypeScript configuration SHALL compile source files from `src/`
- **AND** compiled output SHALL be emitted outside `src/`
- **AND** strict type checking SHALL be enabled

### Requirement: Minimal ResearchSpec CLI

ResearchSpec SHALL expose a local `researchspec` CLI whose public command
registry covers workspace initialization, inspection, generated tool delivery,
derived context artifacts, explicit decisions, and resolved-item archiving.

#### Scenario: CLI displays help

- **WHEN** a user runs `researchspec --help`
- **THEN** the CLI SHALL display the complete public command registry

#### Scenario: CLI displays version

- **WHEN** a user runs `researchspec --version`
- **THEN** the CLI SHALL display the package version
- **AND** the command SHALL NOT require an initialized workspace

#### Scenario: Unsupported command fails clearly

- **WHEN** a user runs an unsupported command
- **THEN** the CLI SHALL return a usage-class error
- **AND** the message SHALL direct the user to help output

### Requirement: Workspace Initialization

ResearchSpec SHALL create or safely extend the documented `researchspec/`
workspace without inventing research content or overwriting user contracts.

#### Scenario: Dry-run initialization reports planned files

- **WHEN** a user runs `researchspec init --tools none --dry-run`
- **THEN** the CLI SHALL report the workspace files and directories it would
  create, update, delete, or skip
- **AND** it SHALL NOT write files

#### Scenario: Initialize workspace without agent tools

- **WHEN** a user runs `researchspec init --tools none`
- **THEN** the CLI SHALL create the `researchspec/` workspace skeleton
- **AND** it SHALL create stable spec files under `researchspec/specs/`
- **AND** it SHALL create run-state files under `researchspec/runs/current/`
- **AND** it SHALL create `researchspec/changes/` and
  `researchspec/draft-patches/`
- **AND** it SHALL NOT generate adapter files

#### Scenario: Existing workspace is extended safely

- **GIVEN** a `researchspec/` workspace already exists
- **WHEN** a user reruns `researchspec init`
- **THEN** the CLI SHALL preserve existing research contracts
- **AND** it SHALL add only missing metadata or safely managed generated files

### Requirement: Workspace Discovery

ResearchSpec SHALL discover the nearest workspace from the current working
directory or an explicit workspace option.

#### Scenario: Discover nearest workspace

- **GIVEN** a project contains a `researchspec/` directory
- **WHEN** the user runs `researchspec status` from the project root or a child
  directory
- **THEN** the CLI SHALL resolve that workspace as the active workspace

#### Scenario: Missing workspace is actionable

- **GIVEN** no `researchspec/` workspace can be found
- **WHEN** the user runs `researchspec status`
- **THEN** the CLI SHALL report that the workspace is missing
- **AND** it SHALL recommend `researchspec init`

### Requirement: Workspace Status

ResearchSpec SHALL summarize initialized workspace state without modifying
files.

#### Scenario: Status reports initialized workspace

- **GIVEN** a workspace created by `researchspec init --tools none`
- **WHEN** the user runs `researchspec status`
- **THEN** the CLI SHALL report that the workspace is initialized
- **AND** it SHALL include the current workflow/run state if available
- **AND** it SHALL report missing optional surfaces as non-blocking diagnostics

#### Scenario: Status supports machine-readable output channel

- **GIVEN** a workspace created by `researchspec init --tools none`
- **WHEN** the user runs `researchspec status --json`
- **THEN** the CLI SHALL print a single machine-readable JSON object to stdout
- **AND** progress or diagnostics SHALL NOT be mixed into stdout

### Requirement: Workspace Checks

ResearchSpec SHALL provide a basic `check` command that validates the minimal
workspace contract files.

#### Scenario: Fresh workspace passes basic checks

- **GIVEN** a workspace created by `researchspec init --tools none`
- **WHEN** the user runs `researchspec check`
- **THEN** the CLI SHALL report success for required workspace structure
- **AND** it SHALL parse machine-facing YAML, JSON, and JSONL files

#### Scenario: Missing required file is reported

- **GIVEN** a required workspace file is missing
- **WHEN** the user runs `researchspec check`
- **THEN** the CLI SHALL report a blocking check result
- **AND** it SHALL identify the missing file path

#### Scenario: Invalid machine contract is reported

- **GIVEN** a required YAML, JSON, or JSONL workspace file is not parseable
- **WHEN** the user runs `researchspec check`
- **THEN** the CLI SHALL report a blocking check result
- **AND** it SHALL identify the invalid file path

### Requirement: Workspace Metadata Sources Of Truth

ResearchSpec SHALL separate user-selected workspace configuration from generated
installation ownership evidence.

#### Scenario: Metadata is created without replacing contracts

- **WHEN** an older valid workspace lacks config or installation manifest files
- **THEN** initialization or update SHALL create the missing metadata
- **AND** existing research contracts SHALL remain unchanged

### Requirement: Shared Write Planning

All public writing commands SHALL use one preflighted write-plan model with
explicit ownership and overwrite policy.

#### Scenario: User contracts are protected

- **WHEN** a planned operation targets an existing user-owned research contract
- **THEN** neither `--force` nor `--yes` SHALL silently overwrite it

#### Scenario: Authoritative records are committed last

- **WHEN** a multi-file operation succeeds
- **THEN** its installation manifest or decision ledger entry SHALL be committed
  after dependent file writes

### Requirement: Deterministic Read-Only Workflow Evaluation

ResearchSpec SHALL derive template, instance, parallel-group and work state from typed workflow/state, contracts, artifact registry/files, decisions and gates without modifying the workspace.

#### Scenario: Unstarted universal workspace exposes subflow frontiers

- **GIVEN** a new `arsu-v0-1` workspace with no subflow instance
- **WHEN** ResearchSpec evaluates the workflow
- **THEN** it SHALL expose eligible external templates as startable
- **AND** it SHALL expose no ready work item before Start

#### Scenario: Started subflow frontier is deterministic

- **GIVEN** a current subflow instance is active with no registered outputs
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

### Requirement: Universal Workflow Profile

ResearchSpec SHALL initialize new workspaces with the adaptive universal ARSU
profile by default and SHALL allow an explicit strict profile selection.
Existing valid Schema `0.2` workspaces SHALL remain readable through the strict
compatibility projection without automatic rewrite.

#### Scenario: Initialization creates adaptive workspace

- **WHEN** a user initializes a new workspace without `--profile`
- **THEN** workflow and state SHALL use the current adaptive runtime schema with
  universal ARSU obligations and no active instances
- **AND** no empty candidate, copied template or started academic work SHALL be
  created

#### Scenario: Strict profile is selected

- **WHEN** a user initializes a new workspace with `--profile strict`
- **THEN** the workspace SHALL use the strict process profile and its declared
  graph, parallel, join, Gate and transition semantics

#### Scenario: Schema 0.2 workspace is opened

- **WHEN** ResearchSpec discovers an existing valid Schema `0.2` workspace
- **THEN** it SHALL evaluate that workspace through the strict compatibility
  projection
- **AND** ordinary init, update, status and check SHALL NOT rewrite its runtime
  authority

### Requirement: Write Plan Read Preconditions

ResearchSpec SHALL allow a writing transaction to declare hashes for authoritative read inputs that must remain unchanged until commit.

#### Scenario: Read drift blocks before staging

- **GIVEN** a write plan declares candidate, workflow, state, registry, contract, ledger, or upstream artifact read preconditions
- **WHEN** any declared path no longer matches its expected hash before staging
- **THEN** execution SHALL fail with a write conflict
- **AND** no planned write SHALL be committed

#### Scenario: Transaction supplies no read preconditions

- **WHEN** a writing transaction supplies no read preconditions
- **THEN** WritePlan SHALL preserve its current write preflight, staging, rollback, and commit behavior

### Requirement: Receipt-Backed Workflow Completion

ResearchSpec SHALL support workflow completion policies that require a valid artifact submission receipt.

#### Scenario: Valid receipt permits completion evaluation

- **GIVEN** the candidate, receipt record, receipt file, registry hashes, validation payload, and candidate references agree
- **WHEN** other completion requirements are satisfied
- **THEN** the work item SHALL be eligible for `done`

#### Scenario: Forged or drifted receipt blocks completion

- **WHEN** a required receipt is missing, unregistered, hash-drifted, outside allowed roots, or inconsistent with the candidate/work item
- **THEN** the work item SHALL be blocked with a stable completion reason

#### Scenario: Stage completion remains derived

- **GIVEN** every work item in the active Slice stage has a valid submitted artifact and required Gates
- **WHEN** status is evaluated
- **THEN** it SHALL report `stage_work_complete` and `transition_required`
- **AND** it SHALL NOT modify state

### Requirement: Typed Instance Gate And Transition Graph

ResearchSpec SHALL parse strict Gate and transition declarations inside Schema 0.2 subflow templates while defaulting missing arrays to empty for existing workspaces.

#### Scenario: New declarations are validated

- **WHEN** a template declares Gates or transitions
- **THEN** Gate/stage/evidence/transition/decision references, scoped IDs, targets and effects SHALL be validated before control-plane use

#### Scenario: Existing Schema 0.2 remains readable

- **WHEN** a valid existing template or instance omits the new arrays or receipt refs
- **THEN** ResearchSpec SHALL interpret them as empty without rewriting the workspace

### Requirement: Per-Instance Gate And Transition Frontier

ResearchSpec SHALL derive Gate and transition state independently for every active subflow instance.

#### Scenario: Work completion exposes a Gate

- **WHEN** an instance stage completes work and declares an unsatisfied formal Gate
- **THEN** its Gate selector SHALL enter the frontier and transitions SHALL remain blocked

#### Scenario: Trusted basis exposes transition candidates

- **WHEN** required Gates pass or have an accepted trusted override
- **THEN** status SHALL report eligible, ambiguous or blocked transitions with their instance-local basis

#### Scenario: Terminal effect updates lifecycle

- **WHEN** a terminal transition commits
- **THEN** the instance SHALL become complete and run lifecycle SHALL be re-derived without modifying unrelated instances

### Requirement: Schema 0.2 supports child subflow graphs
Schema 0.2 SHALL require declarative child subflow node and child join group arrays on every template.

#### Scenario: Template omits child fields
- **WHEN** a Schema 0.2 workflow omits child node or child group properties
- **THEN** strict workflow validation fails

### Requirement: Child completion is derived from trusted state
The workflow evaluator SHALL count a child node complete only when a matching child instance has a trusted parent-scoped start receipt and terminal state satisfying the node completion rule.

#### Scenario: Unrelated child has the same template
- **WHEN** a completed child uses the expected template but belongs to another parent or node
- **THEN** it does not satisfy the current parent node or join

### Requirement: Work producers identify an exact route
New profile work items SHALL identify their producer route, and validation SHALL reject a producer Skill that disagrees with the routing catalog owner.

#### Scenario: Producer mode belongs to another Skill
- **WHEN** a work item declares a producer route whose catalog owner differs from its producer Skill
- **THEN** workflow validation fails

### Requirement: New outputs are instance scoped
The runtime SHALL resolve outputs below the owning subflow instance artifact root.

#### Scenario: Two revision rounds emit the same artifact type
- **WHEN** sibling round instances resolve the same relative output name
- **THEN** they resolve to different concrete paths and artifact registry records

### Requirement: Single Current Runtime Contract
ResearchSpec SHALL parse exactly the `arsu-v0-1` Schema 0.2 subflow workflow and run-state family, with explicit current registry and ledger record variants.

#### Scenario: Pre-instance contract is loaded
- **WHEN** workflow or run state uses the former static contract
- **THEN** validation SHALL fail and SHALL NOT expose a runtime frontier

### Requirement: Workspace Plugin Selection Contract
ResearchSpec SHALL store optional workspace-level plugin intent as `plugins.selected` in `researchspec/config.yaml`, treating its absence in an older workspace as an empty set without increasing the current workspace schema version.

#### Scenario: Old config has no plugin block
- **WHEN** ResearchSpec reads an otherwise valid workspace config without `plugins`
- **THEN** it SHALL expose an empty selected plugin list
- **AND** existing workspace behavior SHALL remain valid

#### Scenario: Plugin selections are normalized
- **WHEN** configuration is written after plugin lifecycle operations
- **THEN** selected IDs SHALL be unique and deterministic
- **AND** all configured Agent tools SHALL share the same selection

### Requirement: Plugin Status Summary
Workspace status SHALL distinguish selected, available, unavailable, and projected plugin state without mutating the workspace.

#### Scenario: Selected plugin is retired
- **WHEN** configuration names a plugin absent from the bundled registry
- **THEN** status SHALL retain it as selected and report it unavailable
- **AND** it SHALL not infer that its files are safely removable without manifest inspection

### Requirement: Plugin Validation Target
`check plugins` and `check all` SHALL validate the bundled registry, derived Skill structure, provenance references, installed-file presence, and manifest hash drift.

#### Scenario: Plugin installation is healthy
- **WHEN** every selected available Skill is projected to every configured tool and owned hashes match
- **THEN** plugin checks SHALL pass

#### Scenario: Projected resource is missing or modified
- **WHEN** a selected plugin resource is missing or differs from its manifest hash
- **THEN** plugin checks SHALL return a stable finding identifying the plugin, Skill, tool, and path

### Requirement: Explicit Runtime Migration

Legacy runtime migration SHALL occur only through
`researchspec update --migrate-runtime`. Migration SHALL first return a dry-run
plan and hash, and non-interactive execution SHALL require `--yes` together
with `--expected-plan-sha256`.

#### Scenario: Ordinary update inspects a legacy workspace

- **WHEN** `researchspec update` runs without `--migrate-runtime`
- **THEN** it SHALL preserve the strict legacy runtime
- **AND** it MAY report migration availability without changing user authority

#### Scenario: Migration fails before authority commit

- **WHEN** a migration write or postcondition fails
- **THEN** the prior strict runtime SHALL remain authoritative
- **AND** ResearchSpec SHALL NOT maintain adaptive and strict authority in
  parallel

### Requirement: Authority And Agent Projections Are Separate

Core SHALL expose a bounded Agent-facing status projection instead of reusing
the complete internal workspace snapshot. Authority writes SHALL retain common
read-precondition and receipt-last guarantees.

#### Scenario: Runtime history grows

- **WHEN** instances, attempts, receipts or artifacts grow over time
- **THEN** default Agent status SHALL remain bounded
- **AND** full internal collections SHALL require directed or paginated reads

### Requirement: Canonical dual-runtime boundary
The framework SHALL make adaptive runtime the default for new workspaces and SHALL retain Schema `0.2` strict compatibility only for explicit strict initialization or unmigrated existing workspaces.

#### Scenario: New default workspace
- **WHEN** a user initializes a workspace without a strict profile
- **THEN** the framework SHALL use adaptive Case obligations, formal Gates, completion, and case actions

#### Scenario: Existing strict workspace
- **WHEN** a Schema `0.2` workspace has not completed an explicit plan-bound migration
- **THEN** the framework SHALL continue to use the strict compatibility graph without automatic migration

### Requirement: Runtime-Aware Registered Artifact Path Basis

ResearchSpec SHALL choose exactly one registered Artifact path basis from the
loaded runtime mode. Adaptive registry paths SHALL be relative to the
`researchspec/` workspace, while unmigrated strict registry paths SHALL remain
relative to the project root. Artifact checks, workflow and Gate evaluation,
Doctor, pack, patch lifecycle, contract lifecycle, and runtime migration SHALL
reuse this path fact and its runtime-specific containment boundary.

#### Scenario: Adaptive Artifact is resolved from the workspace

- **GIVEN** an adaptive workspace registers `runs/current/example.md`
- **WHEN** any registered Artifact consumer resolves that path
- **THEN** it SHALL resolve to `researchspec/runs/current/example.md`
- **AND** it SHALL require the resolved file to remain inside `researchspec/`

#### Scenario: Strict Artifact retains its legacy project-relative basis

- **GIVEN** an unmigrated strict workspace registers
  `researchspec/runs/current/example.md`
- **WHEN** any registered Artifact consumer resolves that path
- **THEN** it SHALL resolve from the project root to the existing workspace file
- **AND** it SHALL preserve the strict registry representation

#### Scenario: Registered Artifact escapes its runtime boundary

- **WHEN** a registered Artifact path or its symlink target escapes the
  runtime-selected containment root
- **THEN** the consumer SHALL reject or exclude the Artifact
- **AND** it SHALL NOT probe another path basis

#### Scenario: Both possible legacy locations contain the same declared path

- **GIVEN** both the project-relative and workspace-relative locations for a
  declared path exist with different bytes
- **WHEN** a consumer resolves the registered Artifact
- **THEN** it SHALL use only the basis selected by the runtime mode
- **AND** file existence SHALL NOT change that selection

