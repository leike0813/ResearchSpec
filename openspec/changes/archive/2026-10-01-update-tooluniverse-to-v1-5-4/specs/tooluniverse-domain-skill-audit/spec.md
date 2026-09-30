## MODIFIED Requirements

### Requirement: Complete Skill Audit Inventory
ResearchSpec SHALL maintain one versioned machine audit record for every top-level ToolUniverse directory containing `SKILL.md` at the pinned revision, and each record SHALL identify the release and revision its content was reviewed against.

#### Scenario: Every Skill has one disposition
- **WHEN** the audit inventory is validated against the pinned source
- **THEN** every top-level Skill SHALL appear exactly once
- **AND** no audit record SHALL name an absent or duplicate Skill
- **AND** each record SHALL distinguish business scope disposition from ingest readiness

#### Scenario: Source update requires re-audit
- **WHEN** the submodule commit or top-level Skill inventory changes
- **THEN** validation SHALL fail until source metadata, records, findings, and aggregate counts are reconciled

#### Scenario: Per-Skill source identity is recorded
- **WHEN** a record is created for an admitted Skill
- **THEN** it SHALL carry the release and revision that produced its reviewed content
- **AND** a candidate that was not changed by the current pin SHALL retain its earlier identity rather than adopt the new release

### Requirement: Domain and Evidence Classification
Every ToolUniverse audit record SHALL carry validated ANZSRC Field metadata or an explicit unclassified reason, while production domain membership SHALL be maintained independently by the source-neutral domain catalog.

#### Scenario: Field classification is complete
- **WHEN** any of the 185 audited upstream Skills is validated
- **THEN** it SHALL have a valid primary Field and distinct optional additional Fields or a concise unclassified reason
- **AND** its resource and cross-Skill evidence SHALL remain derived from files below its source root

#### Scenario: Exclusion is explicit
- **WHEN** a router, setup, developer, SDK, platform-adapter, or self-maintenance Skill is outside the business plugin scope
- **THEN** its audit record SHALL retain the exclude disposition with a concise reason
- **AND** its Field metadata SHALL NOT assign a production plugin ID or domain membership

#### Scenario: Unreviewed business candidate stays outside production
- **WHEN** a new upstream Skill is business-relevant but its license, resource, dependency, overlap or domain review is incomplete
- **THEN** its audit record SHALL be classified as a candidate deferred from production
- **AND** it SHALL NOT enter the vendor bundle, extension packages or domain membership

