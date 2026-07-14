## MODIFIED Requirements

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
