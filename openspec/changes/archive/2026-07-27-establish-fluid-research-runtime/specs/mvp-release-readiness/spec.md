## MODIFIED Requirements

### Requirement: Fixed Zotero Release Assets

The npm release SHALL contain the approved generated seven-Skill Zotero Adapter
tree and supported runtime assets while excluding maintainer-only and
unconsumed upstream surfaces.

#### Scenario: Installed package verifies Zotero assets

- **WHEN** the release verifier packs and installs the npm tarball
- **THEN** all seven Zotero Adapter Skills, their reviewed runner and output
  schema assets, profile template, supported runtimes, checksums, release
  identities, licenses, notices and derivations SHALL be present and valid
- **AND** global installers, unreviewed agents, vendor checkout, audits,
  converter sources and test fixtures SHALL be absent
- **AND** default delivery SHALL expose fifteen fixed Skills and exactly eight
  wrapper types

## ADDED Requirements

### Requirement: Fluid Runtime Release Gate

Release verification SHALL cover the seventeen-command registry, adaptive
default, strict legacy compatibility, bounded Agent protocol, explicit
completion, Doctor, proposed/current case actions and Adapter-native user
journeys before the adaptive default is published.

#### Scenario: One convergence gate fails

- **WHEN** any runtime, migration, converter, idempotence, package, OpenSpec or
  acceptance gate fails
- **THEN** the release SHALL retain the prior default behavior
- **AND** maintainers SHALL NOT declare the fluid runtime converged

