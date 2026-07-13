## Purpose

Define the bundled domain Skill plugin registry, workspace plugin lifecycle, and
authority boundary for optional package-owned Skill extensions.

## Requirements

### Requirement: Bundled Domain Skill Registry
ResearchSpec SHALL distribute one package-owned Registry Schema 1 at `skills/plugins/registry.json` and SHALL derive every plugin Skill root from safe plugin and Skill IDs.

#### Scenario: Production registry starts empty
- **WHEN** the package registry is loaded for this change
- **THEN** it SHALL contain `schema_version`, `sources`, and `plugins`
- **AND** the production `sources` and `plugins` collections SHALL be empty

#### Scenario: Registry paths cannot escape the plugin tree
- **WHEN** a registry contains an unsafe ID, duplicate global Skill ID, base-Skill ID collision, unknown source, mutable or unsafe revision, unsafe source path, or missing derived Skill root
- **THEN** registry validation SHALL fail with a structured diagnostic

### Requirement: Registry Schema 1 Provenance
Registry Schema 1 SHALL model sources, plugins, Skills, and immutable Skill-level upstream provenance without a file-by-file mapping.

#### Scenario: Valid provenance is accepted
- **WHEN** a Skill names registered sources, immutable revisions, safe source paths, and `curated` or `converted` adaptation
- **THEN** validation SHALL preserve the source repository, license, revision, paths, and adaptation for inspection

#### Scenario: Invalid provenance is rejected
- **WHEN** an upstream names an unknown source or unsupported adaptation
- **THEN** validation SHALL reject the registry before delivery planning

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
ResearchSpec SHALL manage workspace-level plugin selections through incremental install, update, and uninstall operations.

#### Scenario: Install without a configured tool preserves intent
- **WHEN** a user installs an available plugin in a workspace with no configured Agent tool
- **THEN** ResearchSpec SHALL save the plugin selection
- **AND** it SHALL return a non-blocking projection warning

#### Scenario: Update refreshes installed selections
- **WHEN** a user updates specified installed plugins or omits IDs to update all installed plugins
- **THEN** available clean or forced desired files SHALL be reconciled through one write plan
- **AND** unavailable selected plugins SHALL block update

#### Scenario: Uninstall is transactionally drift-safe
- **WHEN** any manifest-owned file for the requested plugins differs from its recorded hash
- **THEN** the entire uninstall SHALL be blocked without changing selection or deleting files
- **AND** `--force` SHALL NOT weaken this protection

#### Scenario: Retired plugin can be removed safely
- **WHEN** a selected plugin is no longer in the bundled registry but its manifest-owned files are clean or missing
- **THEN** uninstall SHALL remove clean files and selection using manifest evidence

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
