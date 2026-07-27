## MODIFIED Requirements

### Requirement: Immutable Zotero Bundle Admission

ResearchSpec SHALL convert only the approved immutable Zotero bundle at commit
`cec8fcddd8a3ef134bf6bdd80fcb2324c15707de` and tag
`host-bridge/hbrs-f9f28ddce98be3008e13bbdb`. Admission SHALL validate the
complete source tree, release set, seven Skill identities, runtime assets,
runner/output-schema assets, dependencies, licenses, provenance and reviewed
hashes before generation.

#### Scenario: Approved release is admitted

- **WHEN** the local submodule exactly matches the approved commit and release
- **THEN** admission SHALL validate all release, protocol, CLI schema, build,
  command-catalog, content, dependency, runtime and runtime-metadata identities
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

## ADDED Requirements

### Requirement: Conversion Never Executes Adapter Assets

Audit, conversion, checking, idempotence, packaging and installation SHALL NOT
execute a Skill runner, Host Bridge binary or helper, install dependencies,
read credentials or contact Zotero.

#### Scenario: Runner is preserved

- **WHEN** a reviewed runner is copied into generated output
- **THEN** the converter SHALL compare its bytes and hash only
- **AND** it SHALL NOT interpret its completion envelope or output schema

