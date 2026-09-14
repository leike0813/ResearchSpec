## MODIFIED Requirements

### Requirement: Installed Tarball Verification

ResearchSpec SHALL provide a cross-platform release verifier that derives the fixed Agent surface from packaged Companion and Adapter registries, inspects and exercises a real npm tarball, and verifies the optional literature Adapter in isolated temporary directories.

#### Scenario: Release tarball is verified

- **WHEN** a maintainer runs release verification
- **THEN** it SHALL pack, validate, install and execute the installed CLI without running Adapter or packaged capability assets

#### Scenario: Default installed delivery is smoke tested

- **WHEN** the installed tarball initializes with explicit Codex selection and no Adapter
- **THEN** the project receives exactly one base Skill, `researchspec-navigate`, with its generated CLI-handbook and ARSU-route references
- **AND** the project receives no `.zotero-bridge` files
- **AND** no independent handbook Skill or hidden procedure is projected

#### Scenario: Opted-in Codex delivery is smoke tested

- **WHEN** the installed tarball initializes with Codex and `zotero-library`
- **THEN** the project receives Navigate plus seven Adapter Skills and the current-platform Adapter runtime/profile
- **AND** the installed CLI SHALL expose sixteen top-level commands and pass strict checking

### Requirement: Second-Vendor Release Assets

The npm release SHALL contain the admitted Scientific Agent Skills generated tree, bundle, manifest, conversion report, assembled registry, applicable license and notice files, and canonical adapter documentation while excluding maintainer-only vendor checkout, audit inputs, and test fixtures.

#### Scenario: Installed package verifies second vendor
- **WHEN** the release verifier packs and installs the npm tarball
- **THEN** Scientific Agent Skills convert-derived assets are present and registry-valid
- **AND** the vendor checkout and audit policy inputs are absent
- **AND** default initialization still emits only the one-Skill Navigate base surface and the configured Navigate wrappers

### Requirement: Sixth-Vendor Assets SHALL Publish Without Maintainer Inputs

The npm release SHALL contain the 136 approved Education Agent Skills complete trees with `SKILL.md`, CC BY-SA 4.0 `LICENSE`, and `NOTICE.md`, plus the vendor bundle, manifest, conversion report, assembled registry, and canonical adapter documentation. It SHALL exclude the upstream checkout, immutable audit, evidence map and report, production policy, review decision, preview tree, converter source, upstream MCP, installer, tests, scripts, project docs, and generated caches.

#### Scenario: Installed sixth vendor is verified
- **WHEN** the approved package is packed and installed
- **THEN** representative teacher-facing and student-facing Education Skills are present and registry-valid
- **AND** unresolved markers and attribution files are retained
- **AND** default initialization still installs only the one-Skill Navigate base surface and configured wrappers

### Requirement: Release Surface And Guidance Are Converged

The release SHALL contain one host-visible Navigate Companion Skill with its generated references, hidden procedure packages derived from current registries, the optional seven-Skill Zotero surface, sixteen-command CLI, current graph profiles, and current graph-only guidance.

#### Scenario: Package is verified

- **WHEN** the packed tarball is installed and exercised
- **THEN** default init SHALL project only Navigate and omit Adapter files, while explicit Adapter opt-in SHALL additionally install seven Adapter Skills
- **AND** Navigate's handbook and ARSU-route references SHALL match their canonical renderers
- **AND** no public Skill, wrapper, payload catalog or handbook contains retired runtime selector or state-file guidance

