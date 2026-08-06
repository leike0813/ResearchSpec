## MODIFIED Requirements

### Requirement: Production Skill projection

The harness SHALL derive ARSU, all five Companion Skills, Literature Adapter Skills, and plugin Skills from their production catalogs and renderers without running converters or Adapter assets.

#### Scenario: Complete base surface is loaded

- **WHEN** the harness builds its catalog
- **THEN** it SHALL expose exactly four ARSU, five dynamically rendered Companion and seven fixed Literature Adapter Skills
- **AND** `researchspec-cli-handbook` content SHALL come from the production Companion renderer

#### Scenario: Plugin catalog is loaded

- **WHEN** the harness builds its plugin view
- **THEN** it SHALL validate the in-memory assembled registry and expose every available reviewed domain and Skill without writing generated files

#### Scenario: Checked-in registry has drift

- **WHEN** in-memory plugin assembly differs from `skills/plugins/registry.json`
- **THEN** the harness SHALL report drift without writing either source

#### Scenario: Adapter runner is browsed

- **WHEN** a user selects an Adapter runtime metadata asset
- **THEN** the harness MAY render its content read-only
- **AND** it SHALL NOT execute or interpret the asset
