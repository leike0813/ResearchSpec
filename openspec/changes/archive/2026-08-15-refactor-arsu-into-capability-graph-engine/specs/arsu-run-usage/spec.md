## MODIFIED Requirements

### Requirement: Current File-Based ARSU Runtime Protocol

Capability Skills SHALL read the current node card and its bound inputs, execute only that node's
procedure, write boundary outputs outside `researchspec/`, record output roles and paths in the owning
run handoff, and request completion through `advance node:<run>/<node>`. Capability Skills SHALL NOT
advance their own phase, choose another node or edit run/node state.

#### Scenario: Producer completes ordinary work

- **WHEN** a capability producer creates a boundary deliverable
- **THEN** it records the explicit role and project-relative path in the run handoff
- **AND** it requests a validated `advance node:` instead of registering or hash-binding the deliverable

#### Scenario: Producer attempts internal progression

- **WHEN** a Skill instructs the Agent to move to another phase without a graph-derived selector
- **THEN** the instruction is treated as a Skill defect and the engine frontier remains authoritative

### Requirement: Independent Subflow Confirmation

A run entry SHALL require a human-confirmed summary of entry nodes, prerequisites, boundary outputs,
formal Gates, risks and cost. Nodes authorized by the confirmed frozen graph SHALL NOT require
additional per-node start confirmations; every formal Gate and branch Decision declared by the graph
SHALL still require its own human confirmation.

#### Scenario: Run entry is confirmed

- **WHEN** a user confirms a graph profile entry
- **THEN** the CLI creates exactly that run and no node starts without graph eligibility

#### Scenario: Declared Gate is reached

- **WHEN** the run reaches a formal Gate
- **THEN** the frontier exposes the Gate selector and no downstream node is eligible until the human
  confirms a verdict and the graph prerequisites are satisfied

#### Scenario: Pipeline parent is confirmed

- **WHEN** a user confirms a composed or pipeline profile entry
- **THEN** no node is eligible before its graph prerequisites are satisfied
- **AND** no Gate, Decision or child node is pre-authorized by the run confirmation
