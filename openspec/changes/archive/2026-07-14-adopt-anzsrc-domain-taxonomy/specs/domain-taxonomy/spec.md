## ADDED Requirements

### Requirement: Canonical ANZSRC Discipline Taxonomy
ResearchSpec SHALL use ANZSRC 2020 Fields of Research Group as its only discipline-domain classification and SHALL retain the complete official Division, Group, and Field hierarchy in a versioned attributed snapshot.

#### Scenario: Official hierarchy is reproducible
- **WHEN** the taxonomy snapshot is validated
- **THEN** it SHALL contain 23 Divisions, 213 Groups, and 1,967 Fields with valid parent relationships
- **AND** its source release, source hash, URL, edition, and CC BY 4.0 attribution SHALL be recorded

#### Scenario: Group defines a discipline domain
- **WHEN** an ANZSRC discipline domain is created
- **THEN** its ID SHALL be derived from the official English Group title
- **AND** its four-digit Group code SHALL be retained as structured metadata

### Requirement: ResearchSpec Tool Taxonomy
ResearchSpec SHALL maintain exactly five coarse tool domains for cross-disciplinary work and SHALL prefer an applicable ANZSRC Group when a Skill's primary meaning is disciplinary.

#### Scenario: Tool catalog is fixed
- **WHEN** the internal domain catalog is validated
- **THEN** it SHALL contain the five documented ResearchSpec tool domain IDs
- **AND** tool domains SHALL NOT declare ANZSRC Group codes

### Requirement: Complete Fixed Internal Domain Catalog
ResearchSpec SHALL pre-create all 213 ANZSRC Group domains and all five tool domains internally, while public availability SHALL be derived exclusively from a non-empty reviewed direct Skill list.

#### Scenario: Empty domain remains internal
- **WHEN** a catalog domain contains no reviewed Skill
- **THEN** registry validation SHALL retain it as one of 218 internal domains
- **AND** normal discovery, show, install, JSON, and Navigate surfaces SHALL not expose it as available

### Requirement: ANZSRC Field Audit Metadata
Every audited upstream Skill SHALL record one nullable primary ANZSRC Field, zero or more distinct additional ANZSRC Fields, and an explicit unclassified reason exactly when no primary Field applies.

#### Scenario: Classified audit record is valid
- **WHEN** an audit record has a primary Field
- **THEN** every Field code SHALL exist in the canonical snapshot
- **AND** the reason SHALL be absent and additional Fields SHALL be unique and differ from the primary

#### Scenario: Unclassified audit record is explainable
- **WHEN** an audit record has no primary Field
- **THEN** it SHALL carry a concise non-empty reason
- **AND** Field metadata SHALL NOT imply production admission or domain membership
