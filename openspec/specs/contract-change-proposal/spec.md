## Purpose
Define reviewable project change packages for high-impact updates to stable research specifications.

## Requirements

### Requirement: Safe Change Identity And Create-Only Output

Proposal creation SHALL use a safe unique change ID and SHALL never overwrite an
active or archived change.

#### Scenario: New proposal has a deterministic three-file plan

- **WHEN** the change ID and payload validate
- **THEN** the write plan SHALL create `proposal.md`, `tasks.md`, and
  `contract-patch.yaml` under `researchspec/changes/<change-id>/`
- **AND** all three files SHALL be user-owned create-only outputs
- **AND** `contract-patch.yaml` SHALL be the final write
- **AND** no stable spec, runtime state, registry, or ledger SHALL change

#### Scenario: Reused or unsafe ID is blocked

- **WHEN** the ID is unsafe, already active, already archived, or resolves to an
  existing target
- **THEN** proposal creation SHALL perform no writes
- **AND** `--force` SHALL NOT authorize replacement

### Requirement: High-Impact Annotation Contract Linkage

An implemented high-impact annotation SHALL not bypass the contract-change
lifecycle.

#### Scenario: High-impact resolution changes stable semantics

- **WHEN** an implemented annotation changes scope, claims, structure, source
  policy, or workflow semantics
- **THEN** its Draft Patch SHALL declare the corresponding high semantic delta
  and link a contract-change proposal covering that category
- **AND** the patch SHALL remain blocked until the change is accepted and
  current

#### Scenario: Annotation does not change stable semantics

- **WHEN** an annotation changes wording, formatting, explanation, or evidence
  organization without changing a stable contract
- **THEN** its resolution SHALL not require a contract-change proposal

### Requirement: Project Change Package
A project change SHALL consist of `change.md` and optional design, tasks and delta documents selected
for the change's semantic scope. Direct editing of every document SHALL remain valid.

#### Scenario: User proposes a narrow semantic change
- **WHEN** a safe change ID and target stable specs are supplied
- **THEN** ResearchSpec creates only the requested document skeletons with status `proposed`

### Requirement: Accepted And Applied Are Distinct
Accepting a project change SHALL record the human decision without editing stable specs; a change may
become `applied` only after its targets have been explicitly edited and validate successfully.

#### Scenario: Change is accepted
- **WHEN** the user records an accepted decision
- **THEN** the target specs remain byte-identical and the change remains unapplied

### Requirement: Delta Is Validation-Only
`delta.yaml` SHALL accept add, update and remove record operations for sources and claims and SHALL
validate collisions, missing targets and stable cross-references without executing the operations.

#### Scenario: Delta is checked
- **WHEN** a valid delta targets current source or claim IDs
- **THEN** validation reports whether it could apply but does not modify stable specs
