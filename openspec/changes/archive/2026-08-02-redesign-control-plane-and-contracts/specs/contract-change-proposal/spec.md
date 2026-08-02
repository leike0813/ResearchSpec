## ADDED Requirements

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

## REMOVED Requirements

### Requirement: Strict Semantic Proposal Input
**Reason**: The project change package is adaptable to the semantic scope and directly editable.
**Migration**: Use targets plus optional design, tasks and delta documents.

### Requirement: Contract Changes Are Case Actions
**Reason**: There is no global CaseState or case-action runtime.
**Migration**: Discover changes by scanning `researchspec/changes`.
