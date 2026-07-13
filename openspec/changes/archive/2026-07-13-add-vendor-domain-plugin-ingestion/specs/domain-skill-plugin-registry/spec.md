## REMOVED Requirements

### Requirement: Bundled Domain Skill Registry
**Reason**: The unpublished plugin-owned Schema 1 structure conflates upstream ownership and user installation units.
**Migration**: Replace it in place with Vendor And Domain Registry Schema 1; no released workspace migration is required.

### Requirement: Registry Schema 1 Provenance
**Reason**: Provenance now belongs to vendor-owned Skill definitions rather than installable plugin records.
**Migration**: Move source identity and Skill provenance into vendor records and domain membership into domain records.

## ADDED Requirements

### Requirement: Vendor And Domain Registry Schema 1
ResearchSpec SHALL distribute one Schema 1 registry containing `vendors` and `domains`; vendors SHALL own Skill definitions and immutable provenance while domains SHALL own stable versioned direct Skill ID lists.

#### Scenario: Multi-vendor domain is valid
- **WHEN** a domain references globally unique Skills owned by more than one registered vendor
- **THEN** registry validation SHALL accept the domain
- **AND** each Skill root SHALL remain derived from its vendor ID and Skill ID

### Requirement: Dependency Graph Integrity
Every vendor Skill SHALL declare a dependency list whose targets are globally registered Skill IDs; self-dependencies and unknown targets SHALL be rejected and cycles SHALL resolve finitely with a diagnostic.

#### Scenario: Cross-domain dependency closure is resolved
- **WHEN** a selected domain member requires a Skill owned by another vendor or listed in another domain
- **THEN** the resolver SHALL include the required Skill and its transitive dependencies exactly once

### Requirement: Stable Overlapping Domain Catalog
ResearchSpec SHALL provide exactly three initial ToolUniverse-bearing domains with author-owned membership lists that may overlap without duplicating Skill assets.

#### Scenario: ToolUniverse domain membership is assembled
- **WHEN** the audited ToolUniverse catalog is assembled
- **THEN** the translational, genomics, and molecular domains SHALL contain 65, 72, and 40 direct Skills respectively
- **AND** the 130 Skills SHALL have the reviewed 89 single-domain, 35 two-domain, and 6 three-domain distribution

## MODIFIED Requirements

### Requirement: Workspace Plugin Lifecycle
ResearchSpec SHALL manage workspace-level explicit domain selections and dependency-resolved Skill projections through incremental install, update, and uninstall operations.

#### Scenario: Install without a configured tool preserves intent
- **WHEN** a user installs an available domain in a workspace with no configured Agent tool
- **THEN** ResearchSpec SHALL save only the domain selection
- **AND** it SHALL return a non-blocking projection warning

#### Scenario: Update refreshes resolved selections
- **WHEN** a user updates specified selected domains or omits IDs to update all selected domains
- **THEN** ResearchSpec SHALL recompute their dependency closures and reconcile clean or forced desired files through one write plan
- **AND** unavailable selected domains SHALL block update

#### Scenario: Uninstall preserves shared dependencies
- **WHEN** a selected domain is removed and a Skill remains reachable from another selected domain
- **THEN** the Skill and its owned files SHALL remain installed

#### Scenario: Uninstall is transactionally drift-safe
- **WHEN** any no-longer-reachable manifest-owned file differs from its recorded hash
- **THEN** the entire uninstall SHALL be blocked without changing selection or deleting files
- **AND** `--force` SHALL NOT weaken this protection

#### Scenario: Retired domain can be removed safely
- **WHEN** a selected domain is no longer in the bundled registry
- **THEN** its saved resolution snapshot SHALL support removal of clean files not shared by remaining domain snapshots
