## ADDED Requirements

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

A subgraph declaration SHALL identify a child profile and entry. Starting an eligible subgraph node SHALL create or return exactly one child run whose frozen graph matches that declaration, whose authorization origin is the parent run, and whose parent binding identifies the parent run, node, subgraph and optional round. The parent subgraph node SHALL NOT be directly advanceable and SHALL derive its completion and boundary outputs from the bound child run.

#### Scenario: Eligible subgraph is started

- **WHEN** the Agent starts `node:<parent-run>/<subgraph-node>` for an eligible unbound subgraph
- **THEN** the engine creates one child run at the declared entry without another run-level confirmation
- **AND** status records the typed parent binding on the child run

#### Scenario: Bound subgraph is started again

- **WHEN** the same parent subgraph selector is started after its child run exists
- **THEN** the engine returns the existing matching child run without creating a duplicate

#### Scenario: Child binding is inconsistent

- **WHEN** a child run has a missing, duplicate, version-mismatched or otherwise inconsistent parent binding
- **THEN** the parent subgraph remains blocked and the engine reports a structured integrity failure

#### Scenario: Child run finishes

- **WHEN** the bound child run reaches its declared completion with a valid handoff
- **THEN** the parent subgraph node derives completion and mapped output roles from that child run

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

