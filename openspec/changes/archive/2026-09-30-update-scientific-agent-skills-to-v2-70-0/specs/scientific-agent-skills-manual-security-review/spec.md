## MODIFIED Requirements

### Requirement: Exact Manual Security Review Inventory
ResearchSpec SHALL maintain one finding-level manual security review record for every Scientific Agent Skills v2.70.0 production decision carrying `static-security-review-failed`, bound to the pinned vendor release and revision without modifying the immutable upstream audit.

#### Scenario: Review target coverage is complete
- **WHEN** the manual review catalog is validated
- **THEN** the current high-severity candidates and retained approved curation targets appear once in stable order
- **AND** no unrelated, duplicate, unknown, or differently revised Skill appears

#### Scenario: Upstream evidence remains reproducible
- **WHEN** ResearchSpec resolves an upstream security finding
- **THEN** the original audit and upstream `docs/security-report.json` remain unchanged
- **AND** the manual record cites the pinned report and actual Skill-tree evidence separately


### Requirement: Human-Readable Manual Review Report
ResearchSpec SHALL maintain a human-readable report for all catalogued reviews and maintainer decisions while keeping the structured review catalog authoritative.

#### Scenario: Review report is complete
- **WHEN** all current review records finish
- **THEN** the report accounts for every target, finding conclusion, residual risk, independent blocker, maintainer action, and resulting production disposition
- **AND** tests validate structured evidence rather than exact report prose


