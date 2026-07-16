## MODIFIED Requirements

### Requirement: Future ingestion SHALL resolve licensing and provenance per Skill
The immutable audit SHALL remain unchanged and non-admitting. A separate
production policy MAY admit only source-hash-bound Skills whose sole reviewed
content author is Gareth Manning, whose content is not classified as an original
framework, and whose generated tree carries CC BY-SA 4.0 attribution and change
disclosure. Sean Hu-attributed and original-framework-risk Skills SHALL remain
excluded without independent authorization.

#### Scenario: Production disposition is inspected
- **WHEN** audit and production policy are joined
- **THEN** every audited Skill has exactly one production disposition
- **AND** the immutable audit bytes and conservative license findings remain unchanged

### Requirement: Prospective education domains SHALL require explicit promotion
Audit mappings SHALL remain evidence only for `curriculum-and-pedagogy`,
`education-systems`, and `specialist-studies-in-education` until the complete
generated tree hash is approved. Only admitted Skills MAY be promoted to their
single reviewed domain through the source-neutral catalog.

#### Scenario: Approval has not occurred
- **WHEN** the audit and preview exist but the aggregate hash is pending
- **THEN** the production domain catalog and registry SHALL contain no Education Agent Skills membership
