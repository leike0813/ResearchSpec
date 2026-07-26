## MODIFIED Requirements

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

## ADDED Requirements

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

