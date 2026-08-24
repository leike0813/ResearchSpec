## ADDED Requirements

### Requirement: Graph Entry And Child Run Authorization

A root run SHALL require a human-confirmed profile entry summary. Nodes and bound child runs authorized by that frozen graph SHALL not require another run-level confirmation, while every declared Gate and Decision SHALL retain its own confirmation. A child run SHALL carry a typed parent binding and SHALL not expand the authority granted by the parent graph.

#### Scenario: Confirmed parent reaches a child profile

- **WHEN** an eligible parent subgraph node is started
- **THEN** exactly one bound child run is created with inherited run authorization
- **AND** the child still pauses at each of its declared Gates and Decisions

#### Scenario: Child requests undeclared work

- **WHEN** a child attempts to start a node or profile outside its frozen binding
- **THEN** the request is rejected without changing either run

## REMOVED Requirements

### Requirement: Independent Subflow Confirmation

**Reason**: Schema `"2"` uses graph entries and bound child runs; independent subflow starts and their separate control files no longer exist.

**Migration**: Use a confirmed root profile entry, then start eligible subgraph nodes through `start node:<parent-run>/<subgraph-node>[@round]`. Continue to confirm each declared Gate and Decision.

