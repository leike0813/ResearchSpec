## Purpose

Define the fixed literature adapter catalog, release-set compatibility, project-local runtime delivery, static inspection, and owner-aware reconciliation for literature adapters.

## Requirements

### Requirement: Fixed Literature Adapter Catalog

ResearchSpec SHALL define literature adapters in a plural catalog and SHALL
install every entry whose install policy is `fixed` without adding a workspace
adapter-selection setting. A `LiteratureAdapterDefinition.skills[]` collection
SHALL be the sole catalog authority for Skill identity, `router | task |
mechanism` role, visibility, capabilities, authority and hard dependencies.

#### Scenario: Fixed Zotero adapter is discovered

- **WHEN** init or update evaluates the packaged literature-adapter catalog
- **THEN** it SHALL find exactly one fixed entry named `zotero-library`
- **AND** that entry SHALL contain exactly `zotero-library-agent`,
  `zotero-library-query`, `zotero-literature-acquisition`,
  `zotero-literature-analysis`, `zotero-research-synthesis`,
  `zotero-library-curation`, and `zotero-bridge-cli`

#### Scenario: Skill roles are inspected

- **WHEN** the fixed Zotero definition is validated
- **THEN** `zotero-library-agent` SHALL be the router, the five task-oriented
  Skills SHALL be tasks, and `zotero-bridge-cli` SHALL be the mechanism
- **AND** primary/helper fields or a second membership list SHALL NOT exist

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

### Requirement: Adapter Facts Have Three Distinct Layers

ResearchSpec SHALL keep static delivery, live readiness and operation results as
separate facts. Static commands SHALL report only catalog, release, runtime,
asset, hash and projection evidence and SHALL never claim live readiness.

#### Scenario: Static status is requested

- **WHEN** init, update, status, check, conversion, packaging or installation
  processes the Adapter
- **THEN** it SHALL NOT execute a binary or runner, contact Zotero or Host
  Bridge, access credentials or perform an operation

#### Scenario: Provider is selected for use

- **WHEN** an Agent needs an authorized Zotero operation
- **THEN** the relevant Adapter Skill SHALL inspect live readiness just in time
- **AND** the result SHALL be scoped to that invocation rather than persisted
  as ResearchSpec workflow authority

### Requirement: Provider Retrieval Handoff

Adapter task results SHALL reach ARSU producers through a provider-neutral
`ProviderRetrievalHandoff` that references provider, Skill, release, operation,
query or filter, library scope, time, paging, Zotero and external source
identities, evidence depth, duplicate/readiness diagnostics, result hash and
coverage limits.

#### Scenario: Producer receives Adapter evidence

- **WHEN** a Zotero task completes for Deep Research
- **THEN** the handoff SHALL reference the upstream result without copying an
  Adapter-specific output schema into ResearchSpec authority
- **AND** the bibliography producer SHALL own screening, deduplication,
  verification, coverage and durable artifact submission

### Requirement: Source Policy Controls Provider Priority

Ordinary literature research SHALL use ready Adapter task providers throughout
and supplement documented gaps externally. Systematic review SHALL follow its
multi-source protocol. Current web facts MAY be external-first or parallel.
Private collection/selection, library-only and offline routes SHALL be
library-bound.

#### Scenario: Ordinary library has a coverage gap

- **WHEN** existing-library query cannot cover a required source class
- **THEN** Acquisition or bounded external search SHALL address the recorded gap
- **AND** the producer SHALL disclose the provider choice and coverage limit

#### Scenario: Library-bound provider is unavailable

- **WHEN** a request depends on private or library-only state and live readiness
  fails
- **THEN** the task SHALL pause
- **AND** public search SHALL NOT masquerade as the requested library state

### Requirement: Managed Library Authorization Is Bounded

Managed-library acquisition SHALL require explicit route-time authorization
bound to a run, one specified collection, screened accepted items, allowed
acquisition effects, expiry and revocation. Without authorization, acquisition
SHALL remain candidate-only.

#### Scenario: Accepted item is imported

- **WHEN** the user has authorized managed-library acquisition and the producer
  accepts a screened item
- **THEN** the Adapter MAY import that item into the authorized collection and
  prepare only permitted attachments
- **AND** the authorization SHALL NOT permit library-wide metadata, tags,
  notes, merging, deletion or other Curation

### Requirement: Upstream Runner And Schema Assets Are Opaque

ResearchSpec SHALL audit, convert, project and publish every reviewed
`runner.json` and `output.schema.json` byte-for-byte as upstream runtime
metadata. It SHALL NOT execute them or promote their protocol to ResearchSpec
state, action or receipt contracts.

#### Scenario: Static delivery verifies runtime metadata

- **WHEN** the seven-Skill fixed bundle is checked
- **THEN** exactly seven runner files and seven output schema files SHALL match
  their admitted hashes
- **AND** no ResearchSpec static or runtime path SHALL invoke them
