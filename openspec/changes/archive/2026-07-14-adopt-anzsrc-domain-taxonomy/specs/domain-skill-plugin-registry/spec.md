## MODIFIED Requirements

### Requirement: Vendor And Domain Registry Schema 1
ResearchSpec SHALL distribute one Schema 1 registry containing taxonomy metadata, `vendors`, and `domains`; vendors SHALL own Skill definitions and immutable provenance while typed discipline or tool domains SHALL own stable versioned direct Skill ID lists, including valid empty internal domains.

#### Scenario: Multi-vendor domain is valid
- **WHEN** a non-empty domain references globally unique Skills owned by more than one registered vendor
- **THEN** registry validation SHALL accept the domain
- **AND** each Skill root SHALL remain derived from its vendor ID and Skill ID

#### Scenario: Typed domain metadata is valid
- **WHEN** a discipline or tool domain is validated
- **THEN** a discipline domain SHALL declare one canonical ANZSRC Group code
- **AND** a tool domain SHALL NOT declare an ANZSRC Group code

### Requirement: Stable Overlapping Domain Catalog
ResearchSpec SHALL provide one source-neutral catalog containing all 213 ANZSRC Group domains and five ResearchSpec tool domains whose reviewed membership lists may be empty or overlap without duplicating Skill assets.

#### Scenario: ToolUniverse domain membership is assembled
- **WHEN** the audited ToolUniverse bundle and domain catalog are assembled
- **THEN** all 130 admitted Skills SHALL remain reachable from at least one non-empty domain
- **AND** the public catalog SHALL initially contain 28 discipline and two tool domains

### Requirement: Workspace Plugin Lifecycle
ResearchSpec SHALL manage workspace-level explicit available-domain selections and dependency-resolved Skill projections through incremental install, update, and uninstall operations while retaining unavailable selections for recovery.

#### Scenario: Install without a configured tool preserves intent
- **WHEN** a user installs an available non-empty domain in a workspace with no configured Agent tool
- **THEN** ResearchSpec SHALL save only the domain selection
- **AND** it SHALL return a non-blocking projection warning

#### Scenario: Update refreshes resolved selections
- **WHEN** a user updates specified selected domains or omits IDs to update all selected domains
- **THEN** ResearchSpec SHALL recompute their dependency closures and reconcile clean or forced desired files through one write plan
- **AND** missing or empty selected domains SHALL block update

#### Scenario: Uninstall preserves shared dependencies
- **WHEN** a selected domain is removed and a Skill remains reachable from another selected domain
- **THEN** the Skill and its owned files SHALL remain installed

#### Scenario: Uninstall is transactionally drift-safe
- **WHEN** any no-longer-reachable manifest-owned file differs from its recorded hash
- **THEN** the entire uninstall SHALL be blocked without changing selection or deleting files
- **AND** `--force` SHALL NOT weaken this protection

#### Scenario: Unavailable domain can be removed safely
- **WHEN** a selected domain is missing from the bundled registry or remains internally present with no Skills
- **THEN** installed status SHALL expose it as unavailable
- **AND** its saved resolution snapshot SHALL support removal of clean files not shared by remaining domain snapshots

#### Scenario: Empty domain can recover
- **WHEN** a selected empty domain receives reviewed Skills in a later package version
- **THEN** it SHALL become available again under the same stable ID
- **AND** update SHALL resolve its current dependency closure normally
