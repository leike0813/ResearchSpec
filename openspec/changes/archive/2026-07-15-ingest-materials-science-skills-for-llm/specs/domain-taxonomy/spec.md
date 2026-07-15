## ADDED Requirements

### Requirement: Reviewed Third-Vendor Domain Membership
Every admitted Materials-Science-Skills-For-LLM Skill SHALL have explicit source-neutral membership in at least one existing reviewed discipline domain, and membership SHALL NOT be inferred automatically from ANZSRC Field metadata, external tools, GPU use, or HPC execution.

#### Scenario: Third vendor is assembled
- **WHEN** all seven admitted Materials Skills are added to the catalog
- **THEN** they are assigned only among `materials-engineering`, `macromolecular-and-materials-chemistry`, and `computational-modeling-and-simulation`
- **AND** `materials-engineering` becomes publicly discoverable
- **AND** the public domain count increases from 48 to 49 while the internal catalog remains 218
