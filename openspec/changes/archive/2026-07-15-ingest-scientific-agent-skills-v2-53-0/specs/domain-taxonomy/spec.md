## ADDED Requirements

### Requirement: Reviewed Second-Vendor Domain Membership
Every admitted Scientific Agent Skill SHALL have explicit source-neutral membership in one or more existing ANZSRC Group or ResearchSpec tool domains, and membership SHALL NOT be inferred automatically from primary or additional Field metadata.

#### Scenario: Classified Skill is assigned
- **WHEN** an admitted Skill has ANZSRC Field audit evidence
- **THEN** reviewers select its user-relevant existing domain membership independently of the audit metadata

#### Scenario: Unclassified Skill lacks tool fit
- **WHEN** a candidate has no natural ANZSRC Field and no clear fit to one of the five fixed tool domains
- **THEN** the candidate remains excluded
- **AND** no general-purpose or vendor-specific domain is created
