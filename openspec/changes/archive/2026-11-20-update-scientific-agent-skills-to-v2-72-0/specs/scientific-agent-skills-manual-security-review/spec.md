## MODIFIED Requirements

### Requirement: Exact Manual Security Review Inventory
ResearchSpec SHALL maintain one finding-level manual security review record for every required v2.72.0 review target and bind it to the pinned release and revision.

#### Scenario: Review target coverage is complete
- **WHEN** the manual review catalog is validated
- **THEN** current high-severity candidates and applicable retained curation targets SHALL appear once in stable order
- **AND** all entries SHALL resolve to a Skill at the pinned revision

#### Scenario: Upstream evidence remains reproducible
- **WHEN** ResearchSpec reviews a carried finding or a Skill missing from the upstream report
- **THEN** the audit SHALL preserve the original upstream report and record its coverage
- **AND** the manual review SHALL cite the dated report and actual pinned Skill-tree evidence separately
