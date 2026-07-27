## Purpose

Define runtime recovery and doctor capabilities for diagnosing and repairing
damaged workspace state without fabricating semantic evidence.

## Requirements

### Requirement: Tolerant Runtime Observation

Doctor SHALL inspect raw runtime files, schemas, receipts and ledgers even when
the standard workspace snapshot cannot be constructed. Its default operation
SHALL be read-only.

#### Scenario: State YAML is invalid

- **WHEN** `state.yaml` cannot be parsed by the normal runtime loader
- **THEN** Doctor SHALL still return structured findings
- **AND** it SHALL preserve the invalid file unchanged

### Requirement: Fixed Recovery Finding Taxonomy

Doctor SHALL classify each affected runtime scope as `healthy`,
`retry_existing_transaction`, `deterministically_repairable`,
`requires_human_reconstruction`, or `conflicting_evidence`.

#### Scenario: Receipt proves an interrupted transaction

- **WHEN** a valid receipt and read preconditions prove that the original
  idempotent transaction can finish
- **THEN** Doctor SHALL prefer `retry_existing_transaction`
- **AND** it SHALL identify the original transaction selector

#### Scenario: Receipts conflict

- **WHEN** receipts or ledgers imply more than one incompatible state
- **THEN** Doctor SHALL report `conflicting_evidence`
- **AND** it SHALL NOT choose a candidate state

### Requirement: Deterministic Repair Planning

Doctor SHALL propose a repair only when the resulting control-plane fact is
uniquely derivable. A repair plan SHALL bind target paths, read hashes,
operations, postconditions and `plan_sha256`.

#### Scenario: Repair is previewed

- **WHEN** the user requests repair for a deterministically repairable finding
- **THEN** Doctor SHALL return a dry-run plan without modifying the workspace
- **AND** non-interactive execution SHALL require explicit confirmation and the
  matching plan hash

### Requirement: Receipt-Bound Repair Commit

Repair execution SHALL preserve the original damaged bytes, revalidate read
preconditions, write dependent facts before authority, commit a repair receipt,
and run a post-repair check.

#### Scenario: Repair precondition changed

- **WHEN** a target hash differs from the approved repair plan
- **THEN** execution SHALL stop without committing authority
- **AND** the caller SHALL obtain a new diagnosis

#### Scenario: Semantic evidence is missing

- **WHEN** recovery would require inventing a Gate verdict, Decision, claim,
  scope, branch or academic evidence
- **THEN** Doctor SHALL require human reconstruction
- **AND** it SHALL NOT emit a repair operation for that fact
