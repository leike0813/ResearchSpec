## Purpose
Define the current graph-based protocol by which ARSU Skills enter, run, and compose ResearchSpec runs.

## Requirements

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

### Requirement: Graph Entry And Child Run Authorization

A root run SHALL require a human-confirmed profile entry summary. Nodes and bound child runs authorized
by that frozen graph SHALL not require another run-level confirmation, while every declared Gate and
Decision SHALL retain its own confirmation. A child run SHALL carry a typed parent binding and SHALL
not expand the authority granted by the parent graph.

#### Scenario: Confirmed parent reaches a child profile

- **WHEN** an eligible parent child-profile node is started
- **THEN** exactly one bound child run is created with inherited run authorization
- **AND** the child still pauses at each of its declared Gates and Decisions

#### Scenario: Child requests undeclared work

- **WHEN** a child attempts to start a node or profile outside its frozen binding
- **THEN** the request is rejected without changing either run

#### Scenario: Declared Gate is reached

- **WHEN** a run reaches a formal Gate
- **THEN** the frontier exposes the Gate selector and no downstream node is eligible until the human
  confirms a verdict and the graph prerequisites are satisfied
