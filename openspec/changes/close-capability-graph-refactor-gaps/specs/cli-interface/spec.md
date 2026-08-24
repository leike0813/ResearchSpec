## ADDED Requirements

### Requirement: Public Runtime Selectors Are Graph-Only

Runtime discovery and mutation SHALL accept only profile, run, node, Gate and Decision selector families. The public CLI, payload catalog, handbook and generated wrappers SHALL NOT expose route, subflow, control-file or subflow-handoff selectors.

#### Scenario: Legacy selector is supplied

- **WHEN** a caller supplies a route or subflow selector
- **THEN** the CLI returns a catalog-backed usage error with current graph selector families

### Requirement: Subgraph Nodes Start Bound Child Runs

`start node:<parent-run>/<subgraph-node>[@round]` SHALL start or resolve the unique child run declared by an eligible subgraph node. The operation SHALL inherit the confirmed parent authorization, freeze the child profile and return the child run identity and parent binding.

#### Scenario: Pending child is started

- **WHEN** status exposes an eligible pending subgraph start and the Agent invokes its node selector
- **THEN** the CLI creates or returns the matching child run without another run-level confirmation

### Requirement: Ineligible Node Instructions Return A Blocker

Requesting instructions for an ineligible node SHALL return a stable structured blocker containing the unmet prerequisite identities and SHALL NOT return a successful executable Node Card.

#### Scenario: Node prerequisites are unmet

- **WHEN** instructions are requested for an ineligible node
- **THEN** machine output reports a stable blocker code and bounded missing prerequisites

### Requirement: CLI File Inputs Use The Safe Path Contract

All graph CLI inputs that identify project files SHALL use the same safe project-relative path contract as runtime handoffs and outputs.

#### Scenario: File payload escapes the project contract

- **WHEN** a start, advance or decision payload contains an unsafe path
- **THEN** the CLI rejects it before any state mutation

