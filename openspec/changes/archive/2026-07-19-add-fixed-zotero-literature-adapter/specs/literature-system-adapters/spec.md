## ADDED Requirements

### Requirement: Fixed Literature Adapter Catalog
ResearchSpec SHALL define literature adapters in a plural catalog and SHALL install every entry whose install policy is `fixed` without adding a workspace adapter-selection setting.

#### Scenario: Fixed Zotero adapter is discovered
- **WHEN** init or update evaluates the packaged literature-adapter catalog
- **THEN** it SHALL find exactly one fixed entry named `zotero-library`
- **AND** that entry SHALL identify `zotero-library-agent` as its primary Skill and `zotero-bridge-cli` as its helper Skill

#### Scenario: Configuration is rendered
- **WHEN** a workspace config is initialized or updated
- **THEN** it SHALL NOT contain a literature-adapter selector
- **AND** the fixed catalog policy SHALL remain the installation authority

### Requirement: Exact Release-Set Compatibility
ResearchSpec SHALL resolve adapter compatibility and maintenance from release-set, protocol, schema, build, command-catalog, and binary identities while treating bundle, CLI, and Skill versions as independent components.

#### Scenario: Component patch versions differ
- **WHEN** an otherwise valid release set declares different bundle, CLI, or Skill patch versions
- **THEN** admission, delivery, status, check, and release verification SHALL accept the component versions
- **AND** no cross-component SemVer equality diagnostic SHALL be emitted

#### Scenario: Runtime identity changes without a version change
- **WHEN** the desired release-set or current-platform runtime checksum differs from the installed resolution while component versions and semantic content digests remain unchanged
- **THEN** update SHALL refresh the runtime and release identity
- **AND** it SHALL NOT report the adapter as already current

### Requirement: Project-Local Runtime Delivery
Init and update SHALL coordinate one project-owned current-platform runtime and profile template for every fixed adapter without executing delivered programs or writing user configuration.

#### Scenario: Supported POSIX project is initialized
- **WHEN** the host platform resolves to a supported POSIX runtime
- **THEN** ResearchSpec SHALL copy it once under `.zotero-bridge/bin/`
- **AND** it SHALL set the runtime mode to `0755`
- **AND** it SHALL create only `.zotero-bridge/profile.template.json`

#### Scenario: Supported Windows project is initialized
- **WHEN** the host platform resolves to `win32-x64`
- **THEN** ResearchSpec SHALL copy the packaged executable and generate a deterministic project-local `.cmd` shim
- **AND** the shim SHALL forward to the project-local executable without changing PATH

#### Scenario: No Agent tool is selected
- **WHEN** init or update has no selected Agent tool on a supported platform
- **THEN** the shared runtime and profile template SHALL still be reconciled
- **AND** Skill projection SHALL be recorded as deferred

#### Scenario: Platform is unsupported
- **WHEN** the host platform and architecture have no catalog runtime
- **THEN** ResearchSpec SHALL install no substitute runtime and SHALL report the adapter as unsupported
- **AND** it MAY still project the two static Adapter Skills to selected Agent tools

### Requirement: Static Adapter Inspection
Status and validation SHALL inspect adapter catalog, resolution, file type, hashes, executable mode, platform selection, and Skill projections without running or probing the adapter.

#### Scenario: Adapter status is requested
- **WHEN** `status --json` inspects a workspace
- **THEN** it SHALL return a `literature_adapters` collection with state `installed`, `degraded`, `unsupported`, `missing`, or `conflict`
- **AND** every entry SHALL report `connection_state` as `unchecked`

#### Scenario: Adapter check is requested
- **WHEN** `check literature-adapters` or `check all` runs
- **THEN** it SHALL emit structured diagnostics for invalid catalog data, release identity, missing or drifted files, executable mode, incomplete projection, and ownership conflicts
- **AND** strict checking SHALL fail on adapter warnings

#### Scenario: Static commands execute
- **WHEN** init, update, status, check, conversion, packaging, or installation processes adapter assets
- **THEN** they SHALL NOT execute an adapter binary or helper, connect to Zotero or Host Bridge, access the network, install dependencies, or read credentials

### Requirement: Owner-Aware Adapter Reconciliation
ResearchSpec SHALL commit an adapter resolution only after every required adapter-owned write succeeds and SHALL preserve user-owned or drifted files according to the common managed-file policy.

#### Scenario: Clean prior release is updated
- **WHEN** every prior adapter path is manifest-owned and matches its recorded bytes
- **THEN** update SHALL install the desired release and commit its resolution last

#### Scenario: Managed file drift is present
- **WHEN** a desired adapter file differs from its recorded hash and `--force` is absent
- **THEN** ResearchSpec SHALL preserve the file, retain the previous resolution, and report degraded state

#### Scenario: Unowned target already exists
- **WHEN** a desired adapter target exists without adapter ownership evidence
- **THEN** ResearchSpec SHALL preserve the target even when `--force` is supplied
- **AND** it SHALL retain the previous resolution and report a conflict

