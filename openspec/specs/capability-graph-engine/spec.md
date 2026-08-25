# capability-graph-engine Specification

## Purpose
Define ResearchSpec as the sole execution-flow authority: version 2 graph profiles, frozen run
instances, node lifecycle, deterministic frontier, Gate/Decision authority, validators, revision
rounds, subgraphs and extensible presets.

## Requirements

### Requirement: Graph Profile Schema Version 2

A graph profile SHALL parse as graph profile schema `"2"` and SHALL include `schema_version: "2"`,
`profile_id`, `profile_version`, `capability_registry_version`, `entries`, `nodes`,
`parallel_groups`, `gates`, `decisions`, `subgraphs`, `revision_round_template` and
`override_policy`. Node definitions SHALL include a unique `node_id`, kind
(`capability`, `subgraph`, `gate`, `decision` or `observer`), optional `capability_id`, bound
parameters, input bindings, expected output roles, prerequisites, required Gate/Decision IDs and
multiplicity (`one`, `optional` or `repeatable`).

#### Scenario: Minimal graph is valid

- **WHEN** a graph contains one entry and one capability node with resolvable inputs and outputs
- **THEN** the profile parses and passes structural validation

#### Scenario: Duplicate node or gate ID is rejected

- **WHEN** a profile repeats a node, gate, decision or parallel-group ID
- **THEN** validation fails with a duplicate-ID diagnostic

#### Scenario: Repeatable node lacks round role

- **WHEN** a node declares `multiplicity: repeatable` without a round role
- **THEN** validation fails

#### Scenario: Unknown capability reference is rejected

- **WHEN** a capability node references a capability ID absent from the capability registry
- **THEN** validation fails with an unknown-capability diagnostic

### Requirement: Graph Edges And Presets Are Data, Not Prose

Every dependency, branch unlock, parallel-join policy and revision-round rule SHALL be declared in the
graph profile. No Skill, Companion or host-Agent guidance SHALL reconstruct, override or invent an
edge at runtime.

#### Scenario: Skill claims a next step

- **WHEN** a capability Skill or Companion names a successor node not declared by the profile
- **THEN** the engine ignores that claim and `status` SHALL continue to expose only graph-derived
  eligible nodes

### Requirement: Run Start Freezes The Graph

`start profile:<profile-id>` SHALL require a human-confirmed summary of entry nodes, expected outputs,
declared Gates, cost and boundary paths, and SHALL create exactly one run with a frozen graph
projection, profile identity, profile version and content hash.

#### Scenario: Run is created

- **WHEN** a user confirms a valid profile entry
- **THEN** the CLI atomically creates `run.yaml`, the frozen graph projection and an empty node state
  directory
- **AND** no node is eligible before entry dependencies and any entry Decision are satisfied

#### Scenario: Profile changes after run start

- **WHEN** a projected graph profile changes after a run was created
- **THEN** the active run continues to evaluate its frozen graph
- **AND** status reports a profile-version difference without altering the run

### Requirement: Node Lifecycle Has One Owner

Every node instance SHALL own exactly one state file under its run. Valid states are `pending`,
`eligible`, `complete`, `blocked`, `cancelled` and `skipped`. Only the engine SHALL compute
`eligible`; only a validated `advance node:<run>/<node>` SHALL write `complete`.

#### Scenario: Out-of-order node is advanced

- **WHEN** an Agent attempts to advance a node that is not currently eligible
- **THEN** the CLI returns a stable not-eligible diagnostic and leaves all run bytes unchanged

#### Scenario: Node completes atomically

- **WHEN** all submitted outputs and validators pass
- **THEN** exactly the owning node file is atomically updated to `complete`

### Requirement: Deterministic Frontier

For identical current workspace bytes, `status --json` SHALL produce an identical frontier, including
selector order. Legal alternatives SHALL arise only from declared parallel groups, optional nodes,
branch Decisions or repeatable rounds.

#### Scenario: Status is read twice

- **WHEN** no workspace mutation occurs between two status calls
- **THEN** the serialized frontier bytes are identical

#### Scenario: Ambiguous successor is blocked

- **WHEN** a node has multiple possible successors and no declared Decision or join policy selects one
- **THEN** status SHALL expose the required Decision selector and SHALL NOT expose any successor as
  immediately eligible

### Requirement: Bounded Node Cards

`instructions node:<run>/<node>` SHALL return exactly one node card containing the node ID, capability
ID or subgraph reference, bound input roles and paths, expected output roles, validators, required
Gate/Decision IDs, human confirmation requirements and the instruction to return to `status` after
submission.

#### Scenario: Node instructions are requested

- **WHEN** a caller requests instructions for an eligible node
- **THEN** the card names only that node and its declared dependencies
- **AND** it does not contain a next-node plan

#### Scenario: Non-eligible node instructions are requested

- **WHEN** a caller requests instructions for a non-eligible node
- **THEN** the CLI returns a stable blocker describing the missing prerequisites

### Requirement: Node Submission Runs All Declared Validators

`advance node:<run>/<node>` SHALL accept declared output role evidence, run every declared validator,
and mark the node complete only when all validators pass. A failed submission SHALL return stable
diagnostics and SHALL NOT write node state, run state or external files.

#### Scenario: Submission fails validation

- **WHEN** a submitted output fails a declared schema or script validator
- **THEN** the CLI returns the validator diagnostic and the node remains eligible

#### Scenario: Dry-run submission

- **WHEN** `--dry-run` is supplied
- **THEN** the same validation runs and no workspace file changes

### Requirement: Gate And Decision Authority

Formal Gate attempts and branch Decisions SHALL be recorded in the owning run/node files through
`decide gate:<run>/<node>` and `decide decision:<run>/<node>`. Confirmation SHALL NOT implicitly
advance. A failed-Gate override SHALL be embedded under that Gate with approver, timestamp and reason.

#### Scenario: Gate passes but is not advanced

- **WHEN** a human confirms a pass verdict for a Gate
- **THEN** the downstream node is not eligible until the graph prerequisites and the Gate pass are
  both satisfied through normal evaluation

#### Scenario: Failed Gate is overridden

- **WHEN** a failed Gate is overridden with a separate human-approved reason
- **THEN** only the owning node file is atomically updated

### Requirement: Parallel Groups, Subgraphs And Mid-Entry Nodes

Parallel groups SHALL declare a join policy of `all` or `any`. A `subgraph` node SHALL bind another
validated profile by input/output role mapping and derive child state without copying child files into
the parent run. Mid-entry profiles SHALL declare explicit entry node IDs and SHALL NOT use synthetic
entry checkpoints.

#### Scenario: All join waits

- **WHEN** an `all` group has an incomplete required member
- **THEN** dependents of the group remain blocked

#### Scenario: Any join unlocks

- **WHEN** an `any` group reaches its declared completed-member count
- **THEN** the successor becomes eligible exactly once

#### Scenario: Mid-entry node is declared

- **WHEN** a mid-entry profile is parsed
- **THEN** each entry ID resolves to a node in the same profile and duplicate entry IDs are rejected

### Requirement: ARSU Entries Bind Routing Meaning Without Owning Runtime Selection

Each converter-owned ARSU profile entry SHALL carry one `route_ref` that resolves to the converter-owned routing catalog. The binding SHALL provide semantic prerequisites, likely inputs and outputs, risk, and cost for confirmation while the profile entry and frozen graph remain the only runtime selection authority.

#### Scenario: Bound entry instructions are requested

- **WHEN** instructions are requested for a converter-owned ARSU profile
- **THEN** every executable entry resolves exactly one routing record and one graph entry node
- **AND** the returned confirmation context is derived without copying routing risk or cost into the profile

#### Scenario: Entry binding is invalid

- **WHEN** a converter-owned ARSU profile entry omits `route_ref` or references an unknown route
- **THEN** profile validation fails before projection or run start

### Requirement: Formatting And Final Integrity Are Graph-Owned Boundaries

The academic pipeline profile SHALL declare formatting and final-integrity nodes and their ordering as graph data. Every converter-declared end-to-end or mid-entry route SHALL resolve to an explicit entry node, and no Skill or runtime handler SHALL synthesize an entry checkpoint.

#### Scenario: Formatting path is selected

- **WHEN** the academic pipeline reaches formatting after accepted writing or revision work
- **THEN** the formatting node becomes eligible before final integrity
- **AND** final integrity remains blocked until formatting completes and its declared Gate conditions are satisfied

#### Scenario: Mid-entry route is selected

- **WHEN** a user starts any converter-declared academic-pipeline mid-entry
- **THEN** the frozen graph begins at that entry's explicit node and exposes only graph-derived frontier items

### Requirement: Revision Rounds Are Template-Bound

Repeatable revision and review nodes SHALL be paired by the profile `revision_round_template`. A
completed review Decision SHALL select either the next revision round or the declared exit option. No
graph SHALL express any other implicit loop, and no global maximum round SHALL be introduced by the
engine.

#### Scenario: Continue option is accepted

- **WHEN** a completed review chooses the continue option
- **THEN** only the next revision round is exposed with its declared round role

#### Scenario: Exit option is accepted

- **WHEN** a completed review chooses the exit option
- **THEN** the revision template closes and only exit successors are eligible

### Requirement: Human And Model Boundaries

The engine SHALL invoke deterministic validators but SHALL NOT invoke model APIs, LLM tools or
host-specific runtimes. LLM capability nodes SHALL be executed by the host Agent from the node card,
and the CLI SHALL validate only submitted outputs and evidence.

#### Scenario: LLM work is outside the CLI

- **WHEN** a capability node has `execution_type: llm`
- **THEN** no CLI command calls a model or external Agent runtime
- **AND** the node can only complete through a validated submission

### Requirement: Recovery Is Status-Based

A new session SHALL recover a run solely from current files by requesting `status` and the instructions
for the first eligible node or pending Gate/Decision. No chat history, receipt or hidden index SHALL be
required.

#### Scenario: New session resumes a run

- **WHEN** status exposes one eligible node after a prior session stopped
- **THEN** the same node card is returned and the Agent may continue without reconstructing past work

### Requirement: Extensible Profiles Require No Engine Change

A user or plugin SHALL be able to add a graph profile that composes registered capabilities, gates,
decisions and subgraphs without changing the engine. The new profile SHALL pass the same structural,
registry and validator checks as preset profiles.

#### Scenario: Custom profile is added

- **WHEN** a valid custom profile is placed in the profile source location and re-projected
- **THEN** status exposes its entry and nodes exactly as declared

#### Scenario: Custom profile hard-codes new semantics

- **WHEN** a custom profile attempts to add a node kind, edge semantics or validator policy outside
  the schema
- **THEN** validation rejects it without changing the engine

### Requirement: Selected Plugin Capability Registry Overlay

The graph CLI SHALL resolve runnable capabilities from a base bundled capability registry plus capabilities assigned to the workspace's selected plugin domains. The combined registry SHALL use the same capability package shape and validator execution rules as the base registry.

#### Scenario: Plugin profile is validated before run start

- **WHEN** `start profile:<plugin-profile-id>` selects a projected plugin profile
- **THEN** the CLI SHALL validate every capability reference against the base-plus-selected-extension registry
- **AND** an unknown capability SHALL block run creation

#### Scenario: Plugin capability node returns its manifest contract

- **WHEN** `instructions node:<run>/<node>` targets a capability node backed by a selected plugin capability
- **THEN** the node card SHALL include the capability manifest's title, class, node kind, execution type, typed inputs/outputs, validators, and knowledge refs

#### Scenario: Plugin capability validators run on advance

- **WHEN** an eligible plugin capability node is advanced
- **THEN** the CLI SHALL run the declared validators from the selected plugin capability manifest
- **AND** a failed validator SHALL leave the node eligible without writing node state

### Requirement: Script-Validated Plugin Capabilities

A selected plugin capability SHALL be allowed to declare script validators with the same runner
contract as bundled capabilities. The CLI SHALL invoke only the declared interpreter and argument
template during `advance`; install, update, status, and check SHALL NOT execute plugin scripts.

#### Scenario: Plugin script validator rejects incomplete evidence

- **WHEN** an eligible mixed-execution plugin capability node is advanced with an output that fails
  its declared script validator
- **THEN** `advance` SHALL return a validator diagnostic
- **AND** the node SHALL remain eligible without a state-file write

#### Scenario: Plugin script validator accepts complete evidence

- **WHEN** the same node is advanced after the output satisfies the declared script validator
- **THEN** `advance` SHALL mark the node complete through the normal atomic write path

#### Scenario: Static commands never execute plugin validators

- **WHEN** install, update, status, or check processes a plugin capability with script validators
- **THEN** those commands SHALL read manifests, paths, and hashes only
- **AND** they SHALL NOT invoke the validator interpreter

### Requirement: Control Records Never Complete Execution Nodes

Gate verdicts and Decision choices SHALL be stored as records owned by the declared control point. A control record SHALL satisfy the corresponding frontier condition but SHALL NOT write an execution node's lifecycle state; only a successful validated node advance SHALL mark an execution node complete.

#### Scenario: Gate verdict is confirmed

- **WHEN** a user confirms a Gate verdict
- **THEN** the Gate record is persisted without marking an execution node complete
- **AND** downstream eligibility is derived from the verdict and the frozen graph

#### Scenario: Decision choice is confirmed

- **WHEN** a user confirms a declared Decision option
- **THEN** the Decision record is persisted without marking an execution node complete
- **AND** the selected graph edge becomes the only eligible branch

### Requirement: Subgraphs Bind Deterministic Child Runs

A child-profile declaration SHALL identify a child profile and entry. Starting an eligible child-profile node SHALL create or return exactly one child run whose frozen graph matches that declaration, whose authorization origin is the parent run, and whose parent binding identifies the parent run, node, graph binding and optional round. The parent node SHALL NOT be directly advanceable and SHALL derive its completion and boundary outputs from the bound child run.

#### Scenario: Eligible child profile is started

- **WHEN** the Agent starts `node:<parent-run>/<child-profile-node>` for an eligible unbound child profile
- **THEN** the engine creates one child run at the declared entry without another run-level confirmation
- **AND** status records the typed parent binding on the child run

#### Scenario: Bound child profile is started again

- **WHEN** the same parent node selector is started after its child run exists
- **THEN** the engine returns the existing matching child run without creating a duplicate

#### Scenario: Child binding is inconsistent

- **WHEN** a child run has a missing, duplicate, version-mismatched or otherwise inconsistent parent binding
- **THEN** the parent node remains blocked and the engine reports a structured integrity failure

#### Scenario: Child run finishes

- **WHEN** the bound child run reaches its declared completion with a valid handoff
- **THEN** the parent node derives completion and mapped output roles from that child run

### Requirement: Runtime Validation Fails Closed

Every node submission SHALL resolve its capability through the active capability registry and execute every declared validator through a supported validator registry. Missing registries, unknown validator IDs or kinds, unresolved schemas, and unsupported policy rules SHALL fail before any run, node or handoff file is modified.

#### Scenario: Validator registry is unavailable

- **WHEN** an execution-node submission cannot resolve its capability or validator registry
- **THEN** validation fails with zero workflow-state writes

#### Scenario: Validator is unsupported

- **WHEN** a manifest declares an unknown policy, schema or validator kind
- **THEN** validation fails closed and the node remains incomplete

### Requirement: Runtime File Paths Are Safe And Bounded

All handoff, input-binding, output and validator file paths SHALL be normalized project-relative paths outside `researchspec/`. Absolute paths, traversal segments, empty or current-directory paths, backslash ambiguity and paths resolving inside workflow state SHALL be rejected before writes.

#### Scenario: Unsafe output is submitted

- **WHEN** a node submission names an absolute, traversing or `researchspec/` output path
- **THEN** the submission fails without modifying the run or handoff

### Requirement: Active Runs Report Current Profile Drift

Status SHALL compare each run's frozen profile identity and hash with the currently projected profile while keeping the frozen graph authoritative.

#### Scenario: Projected profile changed after start

- **WHEN** status inspects a run whose current profile version or hash differs from its frozen graph
- **THEN** status reports a bounded drift diagnostic
- **AND** it does not rewrite or reinterpret the run
