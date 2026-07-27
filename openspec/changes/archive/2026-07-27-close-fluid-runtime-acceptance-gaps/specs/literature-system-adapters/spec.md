## MODIFIED Requirements

### Requirement: Static Adapter Inspection

Status and validation SHALL inspect the fixed Adapter catalog, resolution, file
type, hashes, executable mode, platform selection and Skill projections without
running or probing the Adapter. The inspection result SHALL be the only source
for both compact status and detailed check output.

#### Scenario: Adapter status is requested

- **WHEN** `status --json` inspects a workspace
- **THEN** it SHALL return a bounded Adapter summary with fixed count, healthy
  count, compact per-Adapter state and diagnostic counts
- **AND** it SHALL direct detailed inspection to
  `check:literature-adapters`

#### Scenario: Adapter check is requested

- **WHEN** `check literature-adapters` or `check all` runs
- **THEN** it SHALL emit structured diagnostics for invalid catalog data,
  release identity, missing or drifted files, executable mode, incomplete
  projection and ownership conflicts

#### Scenario: Static commands execute

- **WHEN** init, update, status, check, conversion, packaging or installation
  processes Adapter assets
- **THEN** they SHALL NOT execute an Adapter binary or runner, connect to Zotero
  or Host Bridge, access the network, install dependencies or read credentials

