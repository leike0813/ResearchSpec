## MODIFIED Requirements

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
  runtime-metadata identities recorded by the immutable audit
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
