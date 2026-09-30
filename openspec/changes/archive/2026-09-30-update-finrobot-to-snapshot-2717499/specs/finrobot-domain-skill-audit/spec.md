## MODIFIED Requirements

### Requirement: Audit SHALL inventory every tracked source entry
The machine audit SHALL contain one ordered record for every entry of its bound immutable Git tree, without duplicate paths. Summary counts, modes, object IDs, file byte lengths and hashes SHALL agree with the actual inventory. A gitlink SHALL remain an external object with no in-tree byte hash. The `snapshot-2717499` candidate SHALL cover all 1,049 entries and its uninitialized migrated FinNLP gitlink.

#### Scenario: Source inventory is reproduced
- **WHEN** the bound Git tree is compared with its audit
- **THEN** paths, kinds, modes, objects, counts, hashes and byte totals match one-to-one

### Requirement: Audit SHALL represent knowledge surfaces without inventing upstream Skills
Knowledge surfaces SHALL bind real source symbols or actual Skill documents. Each audited snapshot SHALL state whether upstream Skill documents exist. The new candidate SHALL record its 56 real third-party Skills separately from four fixtures and preserve the prior 66 surfaces plus seven selected incremental surfaces.

#### Scenario: Knowledge inventory is validated
- **WHEN** source roots and Skill documents are inventoried
- **THEN** each surface has a unique ID, source, kind, origin, risk, disposition and recommendation
- **AND** third-party Skill inventory grants no admission

## ADDED Requirements

### Requirement: Incremental audits SHALL preserve source decisions
The new audit SHALL preserve unchanged old evidence through verified blob and byte hashes, record path migrations, distinguish first-party Desktop methods from third-party Skills and datasets, and record current license facts. Third-party copies with unresolved original revisions or missing resources SHALL remain excluded from this candidate.

#### Scenario: A third-party Skill lacks its resource closure
- **WHEN** a converted Skill has unpinned attribution or missing referenced resources
- **THEN** the audit records that uncertainty and the candidate does not distribute it
