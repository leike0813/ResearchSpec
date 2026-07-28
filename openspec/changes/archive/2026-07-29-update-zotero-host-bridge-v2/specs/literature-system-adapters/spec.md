## MODIFIED Requirements

### Requirement: Exact Release-Set Compatibility

ResearchSpec SHALL resolve adapter compatibility and maintenance from release-set, protocol, schema, build, command-catalog, and binary identities while treating bundle, CLI, and Skill versions as independent components.

#### Scenario: Current fixed release is delivered

- **WHEN** init or update resolves the packaged Zotero adapter
- **THEN** it SHALL use release-set `hbrs-8c6de08010d459a0e87e74f2`, Host
  Bridge protocol v2, and CLI schema v5
- **AND** the project-local profile template SHALL target `/bridge/v2`

#### Scenario: Component patch versions differ

- **WHEN** an otherwise valid release set declares different bundle, CLI, or Skill patch versions
- **THEN** admission, delivery, status, check, and release verification SHALL accept the component versions
- **AND** no cross-component SemVer equality diagnostic SHALL be emitted

#### Scenario: Runtime identity changes without a version change

- **WHEN** the desired release-set or current-platform runtime checksum differs from the installed resolution while component versions and semantic content digests remain unchanged
- **THEN** update SHALL refresh the runtime and release identity
- **AND** it SHALL NOT report the adapter as already current
