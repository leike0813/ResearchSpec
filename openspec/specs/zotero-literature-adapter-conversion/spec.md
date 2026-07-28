## Purpose

Define the immutable Zotero bundle admission, curated adapter bundle generation, deterministic conversion, and license/derivation retention for the fixed Zotero literature adapter.

## Requirements

### Requirement: Immutable Zotero Bundle Admission

ResearchSpec SHALL convert only the approved immutable Zotero bundle at commit
`ff1475eea7d3fb6cb07dbdd872e3c7603e7f1a19` and tag
`host-bridge/hbrs-8c6de08010d459a0e87e74f2`. Admission SHALL validate the
complete source tree, release set, seven Skill identities, runtime assets,
runner/output-schema assets, dependencies, licenses, provenance and reviewed
hashes before generation.

#### Scenario: Approved release is admitted

- **WHEN** the local submodule exactly matches the approved commit and release
- **THEN** admission SHALL validate all release, Host Bridge v2 protocol, CLI
  schema v5, build, command-catalog, content, dependency, runtime and
  runtime-metadata identities
  recorded by the immutable audit
- **AND** component-local bundle, CLI and Skill versions SHALL remain
  independent identities

#### Scenario: Source or published bytes drift

- **WHEN** the pinned source is dirty or any admitted identity, file, tree,
  content digest, binary, runner, schema, checksum, license, notice or
  derivation value differs
- **THEN** conversion SHALL fail before committing generated output

#### Scenario: Upstream publication metadata differs

- **WHEN** external release publication metadata differs from the admitted Git
  commit and reviewed release set
- **THEN** admission SHALL rely only on the checked-in immutable audit
- **AND** it SHALL NOT contact the network during normal checking

### Requirement: Curated Adapter Bundle Generation

The converter SHALL generate a self-contained ResearchSpec Adapter tree
containing exactly the reviewed seven-Skill closure and every approved runtime
asset consumed or preserved by the fixed integration.

#### Scenario: Production tree is generated

- **WHEN** conversion succeeds
- **THEN** `literature-adapters/zotero` SHALL contain the router, five task
  Skills, CLI mechanism, required references, profile template, release
  identities, supported platform runtimes, seven runner files, seven output
  schemas, and applicable license, notice and derivation files

#### Scenario: Unconsumed upstream surfaces are excluded

- **WHEN** conversion succeeds
- **THEN** the generated tree SHALL exclude global installers, provider
  configuration, unreviewed agents, tests and unused platform contracts
- **AND** adapted Skill instructions SHALL NOT refer to an excluded file

### Requirement: Conversion Never Executes Adapter Assets

Audit, conversion, checking, idempotence, packaging and installation SHALL NOT
execute a Skill runner, Host Bridge binary or helper, install dependencies,
read credentials or contact Zotero.

#### Scenario: Runner is preserved

- **WHEN** a reviewed runner is copied into generated output
- **THEN** the converter SHALL compare its bytes and hash only
- **AND** it SHALL NOT interpret its completion envelope or output schema

### Requirement: Deterministic Zotero Conversion

Zotero adapter conversion and checking SHALL be offline, non-executing, and
byte-deterministic.

#### Scenario: Converter is repeated

- **WHEN** the converter runs twice against the same admitted input
- **THEN** the complete generated tree and report SHALL be byte-identical

#### Scenario: Conversion is checked

- **WHEN** normal conversion, checking, or idempotence validation runs
- **THEN** it SHALL NOT execute bundled binaries, installers, evidence helpers,
  or Python code
- **AND** it SHALL NOT contact upstream repositories, Zotero, or Host Bridge

### Requirement: Zotero License And Derivation Retention

ResearchSpec SHALL bind the pinned source commit's AGPL-3.0 license to every
redistributed Zotero adapter component through package license, notice, and
derivation evidence.

#### Scenario: Bundle root lacks a license file

- **WHEN** the pinned bundle is traced to its exact source commit
- **THEN** the source commit root AGPL-3.0 license SHALL be accepted as the
  licensing fact
- **AND** the bundle's lack of a root license or notice SHALL NOT independently
  block admission
