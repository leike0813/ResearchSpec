## MODIFIED Requirements

### Requirement: ResearchSpec Tool Taxonomy
ResearchSpec SHALL maintain exactly six coarse tool domains for cross-disciplinary work and SHALL prefer an applicable ANZSRC Group when a Skill's primary meaning is disciplinary.

#### Scenario: Tool catalog is fixed
- **WHEN** the internal domain catalog is validated
- **THEN** it SHALL contain the six documented ResearchSpec tool domain IDs
- **AND** tool domains SHALL NOT declare ANZSRC Group codes

### Requirement: Complete Fixed Internal Domain Catalog
ResearchSpec SHALL pre-create all 213 ANZSRC Group domains and all six tool domains internally, while public availability SHALL be derived exclusively from a non-empty reviewed direct Skill list.

#### Scenario: Empty domain remains internal
- **WHEN** a catalog domain contains no reviewed Skill
- **THEN** registry validation SHALL retain it as one of 219 internal domains
- **AND** normal discovery, show, install, JSON, and Navigate surfaces SHALL not expose it as available

### Requirement: Reviewed Second-Vendor Domain Membership
Every admitted Scientific Agent Skill SHALL have explicit source-neutral membership in one or more existing ANZSRC Group or ResearchSpec tool domains, and membership SHALL NOT be inferred automatically from primary or additional Field metadata.

#### Scenario: Classified skill is assigned
- **WHEN** an admitted Skill has ANZSRC Field audit evidence
- **THEN** reviewers select its user-relevant existing domain membership independently of the audit metadata

#### Scenario: Unclassified skill lacks tool fit
- **WHEN** a candidate has no natural ANZSRC Field and no clear fit to one of the six fixed tool domains
- **THEN** the candidate remains excluded
- **AND** no general-purpose or vendor-specific domain is created

### Requirement: Reviewed Sixth-Vendor Education Membership SHALL Be Explicit
Every admitted Education Agent Skill SHALL belong directly to exactly one of
`curriculum-and-pedagogy`, `education-systems`, or
`specialist-studies-in-education` according to its reviewed source-bound audit
mapping. Membership SHALL NOT be inferred from upstream domain names, tags,
Fields, evidence strength, audience, or relationships.

#### Scenario: Sixth vendor is assembled
- **WHEN** all 136 approved Skills are added to the source-neutral catalog
- **THEN** curriculum and pedagogy SHALL receive 54 Skills
- **AND** education systems SHALL receive 9 Skills
- **AND** specialist studies in education SHALL receive 73 Skills
- **AND** the internal domain count SHALL remain 219

## ADDED Requirements

### Requirement: Reviewed Seventh-Vendor Intellectual Property Membership SHALL Be Explicit
Every admitted software copyright materials Skill SHALL have explicit source-neutral membership in `intellectual-property-materials` and SHALL NOT belong to `private-law-and-civil-obligations` or any other discipline domain. Membership SHALL NOT be inferred from ANZSRC Field metadata.

#### Scenario: Copyright materials Skill is assigned
- **WHEN** the admitted software copyright materials Skill is added to the domain catalog
- **THEN** `intellectual-property-materials` SHALL become publicly discoverable
- **AND** `private-law-and-civil-obligations` SHALL remain internally empty and hidden from user discovery
- **AND** the public domain count SHALL increase from 62 to 63
- **AND** the internal catalog SHALL contain 219 domains

### Requirement: Patent Preparation Reuses Reviewed Projections
The Intellectual property materials domain SHALL reuse the reviewed patent preparation packages and profiles shipped with ResearchSpec. The extension registry SHALL own these assignments, while the domain catalog lists the reviewed vendor Skill.

#### Scenario: Patent preparation is installed with the domain
- **WHEN** a user selects the intellectual property materials domain
- **THEN** the patent preparation capabilities and profiles SHALL become eligible in the workspace
- **AND** the domain catalog SHALL list only the vendor-backed software copyright materials Skill
