## ADDED Requirements

### Requirement: Instance-Scoped Artifact Submit
ResearchSpec SHALL scope new subflow artifact submissions by both subflow instance and template-local work item.

#### Scenario: Scoped IDs do not collide across instances
- **WHEN** two instances submit the same logical work node
- **THEN** their candidate/submission/receipt IDs and registry provenance SHALL include distinct instance identity
- **AND** each evaluator match SHALL use the instance/work pair

#### Scenario: Receipt binds start authorization
- **WHEN** an automatic instance work item is submitted
- **THEN** its receipt SHALL identify and validate the trusted subflow start receipt
- **AND** forged or drifted authorization SHALL block completion and submission

### Requirement: Automatic Registration Confirmation Policy
ResearchSpec SHALL distinguish route-delegated automatic registration from manual and legacy artifact confirmation.

#### Scenario: Started automatic work uses delegated confirmation
- **WHEN** a work packet declares automatic submission and its start authorization is trusted
- **THEN** exact-hash non-interactive Submit MAY execute with `--yes` without a second user prompt
- **AND** the result SHALL report `confirmation_basis: subflow_start`

#### Scenario: Manual and legacy policy remains compatible
- **WHEN** a work item is manual or belongs to a legacy workflow
- **THEN** its established dry-run/hash confirmation behavior SHALL remain available
- **AND** automatic policy SHALL not be inferred from Skill identity or route risk

