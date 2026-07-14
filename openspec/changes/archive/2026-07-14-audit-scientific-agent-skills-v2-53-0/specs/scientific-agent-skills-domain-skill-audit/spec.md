## ADDED Requirements

### Requirement: Immutable Scientific Agent Skills Audit Source
ResearchSpec SHALL keep the audited Scientific Agent Skills source as a repository submodule at `vendor/scientific-agent-skills`, pinned to release `v2.53.0` commit `9c9bd2e92af12311ecd0c1a643e0931643f9ea04`, and SHALL keep that checkout outside npm distribution.

#### Scenario: Pinned source is reproducible
- **WHEN** a maintainer or validation check resolves the Scientific Agent Skills audit source
- **THEN** the checkout remote, release, and HEAD commit SHALL match the audit metadata
- **AND** the gitlink SHALL not depend on a floating branch

#### Scenario: Source remains maintainer-only
- **WHEN** the ResearchSpec npm package is built or plugin runtime commands execute
- **THEN** `vendor/scientific-agent-skills` SHALL be absent from the package
- **AND** runtime SHALL NOT read the submodule

### Requirement: Complete Vendor Skill Audit
ResearchSpec SHALL maintain one versioned machine record for every top-level v2.53.0 directory containing `SKILL.md`, and each record SHALL separate scope, adaptation, security, licensing, authority, and domain-fit evidence.

#### Scenario: Every source Skill has one record
- **WHEN** the audit is validated against the pinned source
- **THEN** all 147 source Skills SHALL appear exactly once in stable order
- **AND** no record SHALL reference an absent or unsafe source path

#### Scenario: Blocked review remains distinct from exclusion
- **WHEN** a business-relevant Skill has unresolved Critical or High findings, ambiguous content licensing, or required curation
- **THEN** its audit record SHALL retain the relevant scope classification
- **AND** its ingest readiness SHALL block production admission until the finding is resolved

### Requirement: Source Classification And Existing Domain Fit
The audit SHALL preserve upstream categories and SHALL assess each business-relevant Skill against the three existing ResearchSpec production domains without creating a new domain or installable object.

#### Scenario: Existing-domain fit is explicit
- **WHEN** a Skill directly implements or supports an existing domain
- **THEN** the record SHALL identify the domain and distinguish direct from supporting fit
- **AND** the evidence SHALL not imply production membership

#### Scenario: Broad content remains unassigned
- **WHEN** a Skill belongs to an upstream scientific category outside the existing domains
- **THEN** the audit SHALL preserve that classification
- **AND** it SHALL NOT invent a candidate production domain

### Requirement: Evidence-Based License Security And Relationship Review
Each audit record SHALL provide safe evidence paths for resource counts, applicable license review, upstream security status, authority findings, and cross-Skill relationships classified as `required`, `related`, or `routing`.

#### Scenario: Prohibited content is excluded
- **WHEN** source terms explicitly prohibit extraction, retention, derivatives, or redistribution
- **THEN** the Skill SHALL be excluded from later ingestion
- **AND** the audit SHALL cite the prohibiting source file

#### Scenario: Upstream security labels do not grant approval
- **WHEN** upstream reports a Skill as safe or reports no Critical finding
- **THEN** ResearchSpec SHALL retain the upstream result as evidence only
- **AND** production readiness SHALL still depend on ResearchSpec license, authority, runtime, and resource review

#### Scenario: Only reviewed hard dependencies affect installation
- **WHEN** a cross-Skill reference is advisory, optional, routing, or ambiguous
- **THEN** it SHALL NOT be treated as a required dependency
- **AND** only a reviewed `required` relation MAY be used by a later converter

### Requirement: Audit-Governed Adapter Design Boundary
ResearchSpec SHALL document a vendor-specific, non-executing adapter design in which later converters emit isolated vendor bundles and a central assembler combines them with a source-neutral domain catalog.

#### Scenario: Audit does not perform ingestion
- **WHEN** this change is complete
- **THEN** the production registry SHALL contain no Scientific Agent Skills vendor or derived Skill
- **AND** no upstream script or dependency SHALL be executed or installed

#### Scenario: Mixed licenses remain representable
- **WHEN** a later ingest change admits Skills from this mixed-license vendor
- **THEN** the design SHALL require a verified Skill-level content license in addition to the vendor root license
- **AND** every derived Skill SHALL retain accurate `LICENSE` and `NOTICE.md` content

### Requirement: Human Audit Report
ResearchSpec SHALL provide a human-readable report that summarizes source identity, inventory, standards adaptation, security, licensing, authority, domain fit, overlap, and follow-up adapter decisions while leaving the machine audit authoritative.

#### Scenario: Report remains explanatory
- **WHEN** maintainers review the report
- **THEN** it SHALL reference the pinned source and machine audit
- **AND** validation SHALL test structured evidence rather than exact report prose
