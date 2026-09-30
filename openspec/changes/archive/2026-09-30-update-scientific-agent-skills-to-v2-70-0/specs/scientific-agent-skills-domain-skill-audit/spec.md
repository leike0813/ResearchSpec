## MODIFIED Requirements

### Requirement: Immutable Scientific Agent Skills Audit Source
ResearchSpec SHALL keep the audited Scientific Agent Skills source as a repository submodule at `vendor/scientific-agent-skills`, pinned to release `v2.70.0` commit `d0c48af8c7b7a71ccc81fcd04c9db53b48439f9b`, and SHALL keep that checkout outside npm distribution.

#### Scenario: Pinned source is reproducible
- **WHEN** a maintainer or validation check resolves the Scientific Agent Skills audit source
- **THEN** the checkout remote, release, and HEAD commit SHALL match the audit metadata
- **AND** the gitlink SHALL not depend on a floating branch

#### Scenario: Source remains maintainer-only
- **WHEN** the ResearchSpec npm package is built or plugin runtime commands execute
- **THEN** `vendor/scientific-agent-skills` SHALL be absent from the package
- **AND** runtime SHALL NOT read the submodule


### Requirement: Complete Vendor Skill Audit
ResearchSpec SHALL maintain one versioned machine record for every top-level v2.70.0 directory containing `SKILL.md`, and each record SHALL separate scope, adaptation, security, licensing, authority, and domain-fit evidence.

#### Scenario: Every source Skill has one record
- **WHEN** the audit is validated against the pinned source
- **THEN** all 167 source Skills SHALL appear exactly once in stable order
- **AND** no record SHALL reference an absent or unsafe source path

#### Scenario: Blocked review remains distinct from exclusion
- **WHEN** a business-relevant Skill has unresolved Critical or High findings, ambiguous content licensing, or required curation
- **THEN** its audit record SHALL retain the relevant scope classification
- **AND** its ingest readiness SHALL block production admission until the finding is resolved


### Requirement: Source Classification And Existing Domain Fit
The audit SHALL preserve upstream categories and SHALL record validated ANZSRC Field metadata or an explicit unclassified reason for all 167 Scientific Agent Skills without creating a vendor bundle, production membership, or installable object.

#### Scenario: Field classification is explicit
- **WHEN** an audited Skill maps to one or more ANZSRC Fields
- **THEN** the record SHALL distinguish one primary Field from optional additional Fields
- **AND** the evidence SHALL not imply production membership

#### Scenario: Cross-disciplinary content remains explainable
- **WHEN** an audited Skill has no natural ANZSRC Field
- **THEN** the record SHALL retain a concise unclassified reason
- **AND** it SHALL NOT invent a discipline or tool domain assignment


