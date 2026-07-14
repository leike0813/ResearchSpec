## ADDED Requirements

### Requirement: Second-Vendor Release Assets
The npm release SHALL contain the admitted Scientific Agent Skills generated tree, bundle, manifest, conversion report, assembled registry, applicable license and notice files, and canonical adapter documentation while excluding maintainer-only vendor checkout, audit inputs, and test fixtures.

#### Scenario: Installed package verifies second vendor
- **WHEN** the release verifier packs and installs the npm tarball
- **THEN** Scientific Agent Skills convert-derived assets are present and registry-valid
- **AND** the vendor checkout and audit policy inputs are absent
- **AND** default initialization still emits only the eight base Skills and eight wrappers
