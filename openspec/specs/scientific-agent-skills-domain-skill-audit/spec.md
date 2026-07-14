## Purpose

Define the immutable Scientific Agent Skills audit source, complete Skill
evidence, risk and relationship review, adapter boundary, and strict separation
between audit findings and production admission.

## Requirements

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
The audit SHALL preserve upstream categories and SHALL record validated ANZSRC Field metadata or an explicit unclassified reason for all 147 Scientific Agent Skills without creating a vendor bundle, production membership, or installable object.

#### Scenario: Field classification is explicit
- **WHEN** an audited Skill maps to one or more ANZSRC Fields
- **THEN** the record SHALL distinguish one primary Field from optional additional Fields
- **AND** the evidence SHALL not imply production membership

#### Scenario: Cross-disciplinary content remains explainable
- **WHEN** an audited Skill has no natural ANZSRC Field
- **THEN** the record SHALL retain a concise unclassified reason
- **AND** it SHALL NOT invent a discipline or tool domain assignment

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
ResearchSpec SHALL document a vendor-specific, non-executing adapter design in which a later Scientific Agent Skills converter emits only its isolated vendor bundle and a central assembler combines reviewed bundle Skills with a source-neutral domain catalog.

#### Scenario: Audit does not perform ingestion
- **WHEN** this change is complete
- **THEN** the production registry SHALL contain no Scientific Agent Skills vendor or derived Skill
- **AND** no ANZSRC Field mapping SHALL grant admission and no upstream script or dependency SHALL be executed or installed

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

### Requirement: Audit Findings Resolve Through Separate Admission Policy
The immutable Scientific Agent Skills audit SHALL remain the source evidence for the pinned inventory and findings, while a separate complete production policy SHALL resolve every record without rewriting audit observations or treating upstream labels as approval.

#### Scenario: Audit blocker is resolved
- **WHEN** a later production decision admits or excludes an audited Skill
- **THEN** the decision cites the applicable audit and source evidence
- **AND** the original finding remains reproducible

#### Scenario: Hard exclusions remain excluded
- **WHEN** a Skill prohibits redistribution or owns Agent, workflow, state, or platform authority
- **THEN** its production decision is excluded and no generated vendor asset exists

### Requirement: Overlap Decisions Are Explicit
Every business candidate SHALL record an explicit ARSU and ToolUniverse overlap conclusion before production admission.

#### Scenario: Existing capability takes precedence
- **WHEN** a candidate overlaps the fixed ARSU or Companion surface, or any ToolUniverse semantic capability
- **THEN** the Scientific Agent Skills candidate is excluded with the corresponding capability evidence
