## MODIFIED Requirements

### Requirement: Existence verification SHALL be disclosed during ingestion
Generated Education Agent Skills SHALL state that unmarked citations have
bibliographic identity verification only, not claim-support review. Declarations
mapped to unresolved or conflicting works SHALL receive paired unresolved
markers in their complete frontmatter citations and safely matched body units.

#### Scenario: A work identity is verified
- **WHEN** every work mapped to a declaration is `verified`
- **THEN** that declaration SHALL remain unmarked
- **AND** the general evidence-status rule SHALL still prohibit treating identity verification as support review

#### Scenario: A work identity is unresolved
- **WHEN** any work mapped to a declaration is `unresolved` or `conflicting`
- **THEN** its complete frontmatter citation SHALL be marked
- **AND** any source-bound matching body sentence or list item SHALL be marked without nesting
