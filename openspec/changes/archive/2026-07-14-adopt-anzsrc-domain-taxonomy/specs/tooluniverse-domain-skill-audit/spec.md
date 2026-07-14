## MODIFIED Requirements

### Requirement: Domain and Evidence Classification
Every ToolUniverse audit record SHALL carry validated ANZSRC Field metadata or an explicit unclassified reason, while production domain membership SHALL be maintained independently by the source-neutral domain catalog.

#### Scenario: Field classification is complete
- **WHEN** any of the 150 audited upstream Skills is validated
- **THEN** it SHALL have a valid primary Field and distinct optional additional Fields or a concise unclassified reason
- **AND** its resource and cross-Skill evidence SHALL remain derived from files below its source root

#### Scenario: Exclusion is explicit
- **WHEN** a router, setup, developer, SDK, platform-adapter, or self-maintenance Skill is outside the business plugin scope
- **THEN** its audit record SHALL retain the exclude disposition with a concise reason
- **AND** its Field metadata SHALL NOT assign a production plugin ID or domain membership

### Requirement: Audit-Governed Production Ingestion
Any production ToolUniverse vendor bundle SHALL consume the pinned audit inventory as its include, exclude, Field evidence, finding, and upstream revision input, while the source-neutral domain catalog SHALL independently own direct domain membership.

#### Scenario: Audit and production bundle remain traceable
- **WHEN** ToolUniverse production Skills are regenerated and centrally assembled
- **THEN** every generated or excluded Skill SHALL trace to exactly one audit record
- **AND** changes to the pinned source or inventory SHALL block regeneration until a new reviewed audit is supplied
- **AND** the 130 admitted Skills SHALL be assigned only through reviewed catalog membership
