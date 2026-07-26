## MODIFIED Requirements

### Requirement: Production Skill projection

The harness SHALL derive each Skill family from the same production source used
for installation: ARSU from fixed IDs and generated trees, Companion Skills
from the typed manifest and renderer, Literature Adapter Skills from the
role-aware fixed catalog and generated bundle, and plugin Skills from a
non-writing assembly of domain and vendor catalogs. It MUST NOT run converters,
Adapter assets or maintain copied Companion documents.

#### Scenario: Complete base surface is loaded

- **WHEN** the harness builds its catalog
- **THEN** it exposes exactly four ARSU, four dynamically rendered Companion
  and seven fixed Literature Adapter Skills
- **AND** router, task and mechanism metadata controls grouping and discovery

#### Scenario: Plugin catalog is loaded

- **WHEN** the harness builds its plugin view
- **THEN** it validates the in-memory assembled registry and exposes every
  domain with direct and dependency-resolved Skill membership

#### Scenario: Checked-in registry has drift

- **WHEN** in-memory plugin assembly differs from
  `skills/plugins/registry.json`
- **THEN** the harness reports a drift diagnostic without writing either source

#### Scenario: Adapter runner is browsed

- **WHEN** a user selects an Adapter runtime metadata asset
- **THEN** the harness MAY render its content read-only
- **AND** it SHALL NOT execute or interpret the asset

