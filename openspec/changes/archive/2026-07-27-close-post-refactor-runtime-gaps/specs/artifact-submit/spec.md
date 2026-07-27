## ADDED Requirements

### Requirement: Recoverable plan-bound artifact submission
Plan-bound adaptive artifact submission SHALL bind its normalized evidence input, read preconditions, registry authority target, and resulting attempt/state projections in receipt v2.

#### Scenario: Evidence retry after registry write
- **WHEN** the receipt and registry entry exist but attempt or Case state projection is missing
- **THEN** exact retry SHALL reuse the existing artifact and event identities and write only the missing projections

#### Scenario: Conflicting evidence retry
- **WHEN** an existing artifact or attempt identity has different content from the receipt-bound semantic input
- **THEN** the retry SHALL fail as conflicting evidence without replacing user content
