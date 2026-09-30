## ADDED Requirements

### Requirement: Incremental rebinding of changed declarations
When a new snapshot changes only some Skills, ResearchSpec SHALL rebind only the
declarations of those Skills to their new source hash and citation, and SHALL
inherit every other declaration, work, existence status and discovery record
unchanged from the previous evidence map.

#### Scenario: Only changed Skills are rebound
- **WHEN** an incremental evidence map is generated from a retained previous map
- **THEN** every declaration of an unchanged Skill SHALL be identical to its previous mapping
- **AND** every declaration of a changed Skill SHALL carry its new source hash and citation
- **AND** the rebinding totals SHALL be recorded for declarations, changed citations and unaffected declarations

#### Scenario: A changed citation keeps its verified work
- **WHEN** a rebound declaration corrects citation wording for an already verified work
- **THEN** it SHALL keep the same work ID and existence status
- **AND** it SHALL NOT add, remove or upgrade a work

#### Scenario: Existence conclusions are inherited, not re-verified
- **WHEN** the previous map recorded a work as verified, unresolved, conflicting or not applicable
- **THEN** the incremental map SHALL carry that status unchanged
- **AND** a discovery round SHALL remain discovery metadata only

#### Scenario: Claim support is never upgraded by a pin change
- **WHEN** an incremental update rebinds declarations
- **THEN** every work SHALL keep `claim_support_reviewed` false
- **AND** upstream evidence-strength labels SHALL NOT raise ResearchSpec evidence strength

## MODIFIED Requirements

### Requirement: Immutable audit binding
ResearchSpec SHALL bind the Education Agent Skills evidence map to the exact
`snapshot-6bbbce4` audit file SHA-256, snapshot ID, revision, and tree hash. It
MUST reject use with another audit snapshot or changed audit bytes.

#### Scenario: Bound audit is accepted
- **WHEN** the offline evidence check reads the unchanged immutable audit and evidence map
- **THEN** the recorded audit hash, snapshot, revision, and tree match exactly

#### Scenario: Audit drift is rejected
- **WHEN** any bound audit identity or byte hash differs
- **THEN** validation fails without changing either audit or evidence artifacts

### Requirement: Exhaustive declaration mapping
The evidence map SHALL contain exactly one declaration mapping for every one of
the audit's 872 `evidence_id` values and no extra mapping. Each mapping MUST
preserve the declaration's Skill ID, source path, source SHA-256, and original
citation.

#### Scenario: All declarations are covered once
- **WHEN** the map is validated
- **THEN** its sorted evidence IDs equal the audit evidence IDs and every copied source field matches

#### Scenario: Missing, duplicate, or foreign declaration is rejected
- **WHEN** a declaration is omitted, duplicated, added from another snapshot, or has changed source metadata
- **THEN** validation fails with an actionable declaration error
