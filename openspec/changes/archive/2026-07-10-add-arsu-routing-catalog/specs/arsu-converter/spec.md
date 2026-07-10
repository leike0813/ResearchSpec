## ADDED Requirements

### Requirement: Converter-Owned Routing Catalog Projection
The ARSU converter SHALL generate, register, validate, and report the canonical routing catalog and its Skill-description projections.

#### Scenario: Routing catalog JSON is generated
- **WHEN** conversion succeeds
- **THEN** `skills/arsu/routing-catalog.json` SHALL contain the canonical typed catalog with stable formatting
- **AND** the conversion manifest SHALL register its path, identity, metadata, and SHA-256

#### Scenario: Catalog appears in the conversion report
- **WHEN** a conversion report is rendered
- **THEN** it SHALL show the routing catalog path, catalog ID, Skill count, and route counts

#### Scenario: Generated routing projection is validated
- **WHEN** generated-output validation runs
- **THEN** it SHALL validate the routing JSON against the strict Schema and canonical source
- **AND** it SHALL verify every generated Skill description equals its catalog projection
- **AND** missing, malformed, unregistered, hash-drifted, or mismatched output SHALL fail validation
