## MODIFIED Requirements

### Requirement: Domain and Evidence Classification

Every ToolUniverse audit record SHALL carry validated ANZSRC Field metadata or an explicit unclassified reason, while production domain membership SHALL be maintained independently by the source-neutral domain catalog.

#### Scenario: Field classification is complete

- **WHEN** a top-level Skill at the pinned ToolUniverse revision is validated
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
