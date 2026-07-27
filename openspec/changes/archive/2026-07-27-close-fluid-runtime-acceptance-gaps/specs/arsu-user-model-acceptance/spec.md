## MODIFIED Requirements

### Requirement: Canonical Capability Traceability

ResearchSpec SHALL maintain one machine-readable traceability manifest covering
every requirement and scenario in `arsu-user-routing`, `arsu-run-usage`, and
`agent-surface-model`, including Adapter-native routing and separate
source-policy consent.

#### Scenario: Main specs are covered exactly

- **WHEN** the acceptance suite reads the three main capability specs
- **THEN** every requirement and scenario SHALL have at least one responsible
  technical change, journey ID and stable test ID
- **AND** the manifest SHALL not contain unknown capability, requirement,
  scenario, journey, test or technical-change references

#### Scenario: Adapter routing requirements are covered

- **WHEN** routing distinguishes ARSU research from Zotero tasks and separates
  source policy from managed-library consent
- **THEN** explicit user journeys SHALL verify both requirement families

#### Scenario: Archived implementation evidence remains resolvable

- **WHEN** technical changes are archived
- **THEN** traceability SHALL resolve ownership through archived change IDs and
  stable test paths
- **AND** it SHALL not depend on an active umbrella change directory

## ADDED Requirements

### Requirement: Action Protocol Acceptance Is Black-Box

Acceptance SHALL invoke current public CLI descriptors and actions rather than
reconstructing canonical payloads in test helpers.

#### Scenario: Minimal template is executed

- **WHEN** a representative descriptor is returned for each execution policy
- **THEN** its minimal semantic template SHALL reach planning without missing
  CLI-derived fields

#### Scenario: Mechanical action is counted

- **WHEN** a direct action is allowed
- **THEN** acceptance SHALL prove it commits in one public invocation without
  mandatory preview replay

