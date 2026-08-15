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
