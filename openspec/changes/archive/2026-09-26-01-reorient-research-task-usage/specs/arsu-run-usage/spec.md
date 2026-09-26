# Spec Delta

## MODIFIED Requirements

### Requirement: Current File-Based ARSU Runtime Protocol

ResearchSpec SHALL support a stateless standalone procedure protocol and retain the existing graph runtime protocol. Standalone procedures MAY exchange explicit ordinary project-relative file paths but SHALL NOT create run handoffs or mutate `researchspec/`. Ordinary task notes under `work/researchspec-notes/` SHALL NOT be part of this runtime protocol and SHALL NOT be scanned, validated, or mutated by the CLI. Graph execution SHALL remain `status -> instructions <selector> -> start/decide/advance -> status` and the CLI SHALL remain its only state mutation authority.

#### Scenario: Standalone procedures compose
- **WHEN** one direct procedure's output is needed by another
- **THEN** the Agent passes explicit ordinary project-relative paths without creating hidden activation state

#### Scenario: Capability producer runs under a graph
- **WHEN** a graph node procedure creates a boundary deliverable
- **THEN** it records declared roles and paths through the owning run handoff and requests the packet's exact `advance node:` selector

#### Scenario: Producer completes ordinary work
- **WHEN** a graph producer creates a boundary deliverable
- **THEN** it reports the declared output roles and paths before validated advance

#### Scenario: Standalone procedure attempts workflow mutation
- **WHEN** a standalone procedure directs the Agent to write run, node, Gate, Decision, profile, or handoff state
- **THEN** that instruction is treated as a package defect and no workflow state changes

#### Scenario: Producer attempts internal progression
- **WHEN** any procedure instructs the Agent to choose an undeclared phase or graph action
- **THEN** the activation packet and engine frontier remain authoritative

#### Scenario: Task notes stay outside the runtime protocol
- **WHEN** a workspace contains task notes under `work/researchspec-notes/`
- **THEN** the CLI does not scan, validate, or mutate them
- **AND** they do not affect any run, node, or frontier
