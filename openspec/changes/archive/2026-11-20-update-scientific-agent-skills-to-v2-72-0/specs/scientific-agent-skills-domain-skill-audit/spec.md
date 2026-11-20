## MODIFIED Requirements

### Requirement: Immutable Scientific Agent Skills Audit Source
ResearchSpec SHALL keep the audited Scientific Agent Skills source as a repository submodule at `vendor/scientific-agent-skills`, pinned to release `v2.72.0` commit `526ebce143bc326f44471554e33d66a19c840360`, and SHALL keep that checkout outside npm distribution.

#### Scenario: Pinned source is reproducible
- **WHEN** a maintainer or validation check resolves the Scientific Agent Skills audit source
- **THEN** the checkout remote, release and HEAD commit SHALL match the audit metadata
- **AND** the gitlink SHALL resolve an immutable commit

#### Scenario: Source remains maintainer-only
- **WHEN** the ResearchSpec npm package is built or plugin runtime commands execute
- **THEN** the package SHALL exclude `vendor/scientific-agent-skills`
- **AND** runtime SHALL resolve the generated assets independently of the submodule

### Requirement: Complete Vendor Skill Audit
ResearchSpec SHALL maintain one versioned machine record for every top-level v2.72.0 directory containing `SKILL.md`, and each record SHALL identify the scope, adaptation, security, licensing, authority and domain-fit evidence.

#### Scenario: Every source Skill has one record
- **WHEN** the audit is validated against the pinned source
- **THEN** all 177 source Skills SHALL appear exactly once in stable order
- **AND** each record SHALL reference present and safe source paths

#### Scenario: Blocked review remains distinct from exclusion
- **WHEN** a business-relevant Skill has unresolved Critical or High findings, ambiguous content licensing or required curation
- **THEN** its audit record SHALL retain the relevant scope classification
- **AND** its ingest readiness SHALL block production admission until the finding is resolved

### Requirement: Source Classification And Existing Domain Fit
The audit SHALL preserve upstream categories and record validated ANZSRC Field metadata or an explicit unclassified reason for all 177 Scientific Agent Skills. Production membership remains a separate decision.

#### Scenario: Field classification is explicit
- **WHEN** an audited Skill maps to one or more ANZSRC Fields
- **THEN** the record SHALL distinguish one primary Field from optional additional Fields
- **AND** production membership SHALL require a separate reviewed domain decision

#### Scenario: Cross-disciplinary content remains explainable
- **WHEN** an audited Skill has no natural ANZSRC Field
- **THEN** the record SHALL retain a concise unclassified reason
- **AND** the audit SHALL leave Field codes empty
