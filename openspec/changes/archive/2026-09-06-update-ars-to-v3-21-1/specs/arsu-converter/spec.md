## ADDED Requirements

### Requirement: ARS v3.21.1 semantic admission

The converter SHALL admit the reviewed ARS v3.21.1 release with coherent extracted capabilities, role-scoped reviewer criteria and ResearchSpec-owned revision authorization. Generated guidance SHALL retain ResearchSpec CLI workflow authority and user-confirmed host-native model delegation.

#### Scenario: Released source and converted evidence agree

- **WHEN** maintainers generate artifacts from the approved v3.21.1 commit
- **THEN** source records, extraction evidence and generated manifests SHALL identify that commit
- **AND** the maintenance audit SHALL record changed semantic obligations and their generated owners.

#### Scenario: Reviewer decision criteria are role-scoped

- **WHEN** generated reviewer guidance uses the upstream sprint contract
- **THEN** it SHALL preserve eligible reviewer roles, fatal versus repairable blocks and the contract decision rules
- **AND** its recommendation SHALL NOT substitute for a ResearchSpec human-confirmed Gate.

#### Scenario: Revision semantics preserve local authority

- **WHEN** generated guidance prepares a revision patch
- **THEN** the emitted schema and helper SHALL use the same ResearchSpec-owned current patch contract
- **AND** author decisions and claim-strength changes SHALL follow ResearchSpec authorization rules rather than upstream workflow-state mutations.

#### Scenario: Upstream runtime additions remain bounded

- **WHEN** upstream guidance references model services, opt-in workflow runtimes or legacy replay helpers
- **THEN** conversion SHALL adapt or exclude those execution instructions with recorded evidence
- **AND** SHALL NOT execute upstream scripts or install their dependencies.

#### Scenario: Executable checkers verify their real reports

- **WHEN** a user runs one of the seven bundled deterministic checker tools on explicit material inputs
- **THEN** the tool SHALL produce a structured report with actual computed findings and explicit unavailable checks
- **AND** `advance` SHALL pass graph-resolved input materials to the declared validator, which recomputes and rejects inconsistent reports without editing them
- **AND** scientific findings SHALL remain evidence for the owning Gate, distinct from report-contract validity.

#### Scenario: Optional output is omitted

- **WHEN** a capability submission omits a manifest output explicitly marked optional
- **THEN** the output-role validator SHALL accept its omission while rejecting missing required roles and unknown roles.
