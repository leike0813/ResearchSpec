# Spec Delta

## ADDED Requirements

### Requirement: Navigate Owns Conditional Native Delegation

Navigate SHALL treat packet delegation as advisory. It SHALL delegate an eligible Reviewer by default when the active host profile and effective model satisfy the role contract, and SHALL delegate an eligible Executor only when isolation or parallel execution materially helps. It SHALL keep simple work inline, keep `mixed` and `script` work in the parent, dispatch at most one worker per independent frontier node with disjoint outputs, and serialize every CLI mutation in the parent after validating returned outputs.

#### Scenario: Independent review node is eligible
- **WHEN** current graph instructions recommend `researchspec-reviewer` and no alternate-model consent is required
- **THEN** Navigate delegates that node from a fresh worker context
- **AND** the worker may write only the declared review outputs

#### Scenario: Parallel producer nodes are independent
- **WHEN** multiple eligible producer nodes have disjoint declared outputs and no dependency between them
- **THEN** Navigate may delegate one Executor per node in parallel
- **AND** advances each node serially only after parent-side validation

#### Scenario: Worker cannot complete its packet
- **WHEN** a worker lacks an input, authority, or allowed tool
- **THEN** it returns a blocker to Navigate without asking the user or mutating workflow state

### Requirement: Native Workers Return A Fixed Brief

Each native worker SHALL execute exactly one packet, SHALL NOT invoke ResearchSpec mutation commands or delegate another agent, and SHALL return a brief containing status, Procedure identity and content hash, output role-to-path mappings, checks performed, and any blocker. The brief SHALL NOT itself complete a run, node, Gate, Decision, or consent action.

#### Scenario: Worker completes ordinary file work
- **WHEN** the worker produces all declared outputs within its authority
- **THEN** it reports `completed`, the exact Procedure hash, outputs, checks, and no blocker
- **AND** Navigate remains responsible for validation and any CLI mutation

