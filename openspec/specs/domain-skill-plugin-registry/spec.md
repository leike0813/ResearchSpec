## Purpose

Define the bundled domain Skill plugin registry, workspace plugin lifecycle, and
authority boundary for optional package-owned Skill extensions.

## Requirements

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

### Requirement: Open Agent Skills Content Validation
Each registered Skill SHALL conform to the supported Open Agent Skills `SKILL.md` frontmatter and SHALL keep its declared name, registry Skill ID, and directory name equal.

#### Scenario: Complete Skill resources are accepted
- **WHEN** a valid Skill contains `scripts`, `references`, `assets`, or other resource files
- **THEN** validation SHALL accept the resource tree without restricting script language or dependencies
- **AND** delivery SHALL copy every resource byte-for-byte

#### Scenario: Invalid Skill metadata is rejected
- **WHEN** `SKILL.md` is missing, frontmatter is invalid, required fields are missing, or its name differs from the Skill ID
- **THEN** registry validation SHALL fail before projection

### Requirement: Derived Skill Licensing
A registered Skill derived from a third-party source SHALL retain the applicable license and a `NOTICE.md` alongside its Skill content.

#### Scenario: Derived Skill attribution is complete
- **WHEN** a registered Skill has upstream provenance
- **THEN** its derived Skill root SHALL contain `LICENSE` and `NOTICE.md`
- **AND** those files SHALL use the normal manifest ownership and drift rules

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

### Requirement: Plugin Core Authority Boundary
Plugin Skills SHALL be optional semantic helpers and SHALL NOT own ResearchSpec workflow state, routes, work items, artifact registry, Gates, Decisions, or receipts.

#### Scenario: Explicit plugin invocation remains non-authoritative
- **WHEN** a user or ARSU Skill invokes an installed plugin Skill
- **THEN** any authoritative workflow mutation SHALL still occur only through the existing ResearchSpec CLI contracts
- **AND** the plugin SHALL NOT become a workflow-profile node automatically

### Requirement: Offline Maintainer-Owned Distribution
ResearchSpec SHALL consume no upstream repository or remote plugin registry during user runtime.

#### Scenario: Plugin catalog is inspected or projected
- **WHEN** a user lists, shows, installs, or updates a plugin
- **THEN** all catalog metadata and Skill bytes SHALL come from the installed ResearchSpec package
- **AND** `curated` or `converted` SHALL remain provenance only
