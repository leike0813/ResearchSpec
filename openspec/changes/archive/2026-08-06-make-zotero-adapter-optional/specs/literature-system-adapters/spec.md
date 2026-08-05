## MODIFIED Requirements

### Requirement: Fixed Literature Adapter Catalog

ResearchSpec SHALL define literature adapters in a plural catalog with `fixed`
or `optional` install policy. Fixed entries SHALL always be desired; optional
entries SHALL be desired only when their adapter IDs appear in
`config.yaml.literature_adapters.selected`. A
`LiteratureAdapterDefinition.skills[]` collection SHALL remain the sole catalog
authority for Skill identity, role, visibility, capabilities, authority and hard
dependencies.

#### Scenario: Optional Zotero adapter is discovered

- **WHEN** init or update evaluates the packaged literature-adapter catalog
- **THEN** it SHALL find exactly one optional entry named `zotero-library`
- **AND** that entry SHALL contain exactly `zotero-library-agent`,
  `zotero-library-query`, `zotero-literature-acquisition`,
  `zotero-literature-analysis`, `zotero-research-synthesis`,
  `zotero-library-curation`, and `zotero-bridge-cli`

#### Scenario: Skill roles are inspected

- **WHEN** the Zotero definition is validated
- **THEN** `zotero-library-agent` SHALL be the router, the five task-oriented
  Skills SHALL be tasks, and `zotero-bridge-cli` SHALL be the mechanism
- **AND** primary/helper fields or a second membership list SHALL NOT exist

#### Scenario: Configuration is rendered

- **WHEN** a workspace config is initialized or updated
- **THEN** it SHALL contain a `literature_adapters.selected` array
- **AND** the catalog policy plus that selection SHALL be the only desired-installation authority

### Requirement: Project-Local Runtime Delivery

Init and update SHALL coordinate one project-owned current-platform runtime and
profile template for every desired literature adapter without executing
delivered programs or writing user configuration.

#### Scenario: Supported POSIX Adapter is selected

- **WHEN** `zotero-library` is selected and the host platform resolves to a supported POSIX runtime
- **THEN** ResearchSpec SHALL copy it once under `.zotero-bridge/bin/`
- **AND** it SHALL set the runtime mode to `0755`
- **AND** it SHALL create only `.zotero-bridge/profile.template.json`

#### Scenario: Supported Windows Adapter is selected

- **WHEN** `zotero-library` is selected and the host platform resolves to `win32-x64`
- **THEN** ResearchSpec SHALL copy the packaged executable and generate a deterministic project-local `.cmd` shim
- **AND** the shim SHALL forward to the project-local executable without changing PATH

#### Scenario: Adapter is selected without an Agent tool

- **WHEN** `zotero-library` is selected but no Agent tool is selected on a supported platform
- **THEN** the shared runtime and profile template SHALL still be reconciled
- **AND** Skill projection SHALL be recorded as deferred

#### Scenario: Adapter is not selected

- **WHEN** `zotero-library` is absent from the workspace selection
- **THEN** its runtime, profile, Skill projections and resolution SHALL not be desired
- **AND** packaged assets SHALL remain available for a later explicit selection

#### Scenario: Selected Adapter platform is unsupported

- **WHEN** the host platform and architecture have no catalog runtime
- **THEN** ResearchSpec SHALL install no substitute runtime and SHALL report the selected Adapter as unsupported
- **AND** it MAY still project the static Adapter Skills to selected Agent tools

### Requirement: Static Adapter Inspection

Status and validation SHALL inspect catalog selection, resolution, file type,
hashes, executable mode, platform selection and Skill projections without
running or probing an Adapter.

#### Scenario: Adapter status is requested

- **WHEN** `status --json` inspects a workspace
- **THEN** it SHALL return every catalog entry with state `not-selected`, `installed`, `degraded`, `unsupported`, `missing`, or `conflict`
- **AND** every entry SHALL report `connection_state` as `unchecked`

#### Scenario: Unselected Adapter is inspected

- **WHEN** an optional Adapter is not selected and has no retained managed files
- **THEN** status SHALL report `not-selected` with no missing-resolution or missing-file diagnostic
- **AND** `check all` and `check literature-adapters` SHALL not fail for that absence

#### Scenario: Adapter check is requested

- **WHEN** `check literature-adapters` or `check all` runs
- **THEN** it SHALL emit structured diagnostics for invalid selections, catalog data, release identity, missing or drifted desired files, executable mode, incomplete projection and ownership conflicts
- **AND** strict checking SHALL fail on Adapter warnings

#### Scenario: Static commands execute

- **WHEN** init, update, status, check, conversion, packaging, or installation processes Adapter assets
- **THEN** they SHALL NOT execute an Adapter binary or helper, connect to Zotero or Host Bridge, access the network, install dependencies, or read credentials

### Requirement: Owner-Aware Adapter Reconciliation

ResearchSpec SHALL commit a resolution only after every required Adapter-owned
write succeeds and SHALL safely retire deselected Adapter files under the common
managed-file policy.

#### Scenario: Clean selected release is updated

- **WHEN** every prior desired Adapter path is manifest-owned and matches its recorded bytes
- **THEN** update SHALL install the desired release and commit its resolution last

#### Scenario: Selected managed file has drifted

- **WHEN** a desired Adapter file differs from its recorded hash and `--force` is absent
- **THEN** ResearchSpec SHALL preserve the file, retain the prior ownership evidence and report degraded state

#### Scenario: Adapter is deselected

- **WHEN** a previously selected Adapter is removed from `literature_adapters.selected`
- **THEN** update SHALL remove every clean manifest-owned Adapter file and its resolution
- **AND** it SHALL preserve and diagnose any drifted file rather than deleting it

#### Scenario: Unowned target already exists

- **WHEN** a desired Adapter target exists without Adapter ownership evidence
- **THEN** ResearchSpec SHALL preserve the target even when `--force` is supplied
- **AND** it SHALL retain the prior resolution and report a conflict

### Requirement: Bounded Static Adapter Health Appears In Status

Default status SHALL project a bounded static summary of each literature
Adapter from the installation-inspection SSOT. The summary SHALL include
selection policy, identity, installation/runtime/projection state, compact
diagnostic counts and the directed `check:literature-adapters` selector; it
SHALL not perform a live probe, execute Adapter assets, contact a provider, or
read credentials.

#### Scenario: Adapter is not selected

- **WHEN** an optional Adapter is absent from the workspace selection
- **THEN** status SHALL expose `not-selected` with no expected runtime or Skill projection
- **AND** detailed inspection SHALL remain available without changing workspace authority

#### Scenario: Selected Adapter files are degraded

- **WHEN** static inspection finds missing, drifted, unsupported, or conflicted desired Adapter files
- **THEN** status SHALL expose the corresponding compact state and diagnostics
- **AND** detailed inspection SHALL remain available through the directed check selector without changing workspace authority
