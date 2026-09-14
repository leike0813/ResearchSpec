## MODIFIED Requirements

### Requirement: Catalog-Owned Navigate Projection

ResearchSpec SHALL derive `researchspec-navigate/references/arsu-routes.md` from the canonical routing catalog without creating another route registry.

#### Scenario: Navigate presents catalog facts

- **WHEN** `researchspec-navigate` is rendered
- **THEN** its ARSU route reference SHALL contain deterministic projections of route IDs, intents, near misses, primary artifacts, prerequisite groups, risk, Gate policy, and coarse cost
- **AND** current availability SHALL remain sourced from CLI status and scoped graph selectors

#### Scenario: Catalog changes update Navigate deterministically

- **WHEN** a canonical routing fact changes
- **THEN** the rendered Navigate reference and adapter validation SHALL reflect that change from the same catalog source
- **AND** no handwritten Companion route table SHALL require a parallel edit

