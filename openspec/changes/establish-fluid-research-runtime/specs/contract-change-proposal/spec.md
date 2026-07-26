## ADDED Requirements

### Requirement: Contract Changes Are Case Actions

A pending contract change SHALL be a discoverable case action with target
contracts, semantic delta, evidence, lifecycle state and affected obligation
scope.

#### Scenario: High-impact semantic delta is detected

- **WHEN** a producer or verifier finds that scope, claims, structure, source
  policy or workflow semantics must change
- **THEN** it SHALL create or link a contract-change proposal intent
- **AND** obligations that depend on the old contract SHALL become scoped
  blockers until the change is decided

#### Scenario: Ordinary artifact refinement occurs

- **WHEN** work changes wording or evidence organization without changing a
  stable contract
- **THEN** ResearchSpec SHALL NOT require a contract change

### Requirement: Contract Change Lifecycle Is Explicit

Proposal, decision, revalidation and application SHALL be distinct
receipt-backed states. Application SHALL revalidate current targets and
evidence before modifying current contracts.

#### Scenario: Accepted change target has drifted

- **WHEN** an accepted change no longer matches its target hashes
- **THEN** application SHALL stop with a stale or revalidation-required state
- **AND** it SHALL NOT partially apply the change

### Requirement: Patch And Contract Change Lifecycles Remain Distinct

A draft patch SHALL modify a base artifact, while a contract change SHALL
modify stable research contracts. A patch that carries a high-impact semantic
delta SHALL link the required contract change rather than bypassing it.

#### Scenario: Patch depends on unresolved contract change

- **WHEN** an accepted patch would assert semantics not yet accepted in current
  contracts
- **THEN** patch application SHALL remain blocked on the linked change
- **AND** unrelated patch or artifact work MAY continue

