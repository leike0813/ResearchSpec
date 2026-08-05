## MODIFIED Requirements

### Requirement: Installed Tarball Verification

ResearchSpec SHALL provide a cross-platform release verifier that inspects and
exercises a real npm tarball, including the optional literature Adapter and the
generated CLI handbook, in isolated temporary directories.

#### Scenario: Release tarball is verified

- **WHEN** a maintainer runs the release verification script
- **THEN** it SHALL create the tarball through the package lifecycle, validate its allowed files and required release documents, and install it into a temporary project
- **AND** every packaged README link SHALL resolve inside the tarball
- **AND** it SHALL execute the installed `researchspec` bin rather than repository source or core planners
- **AND** it SHALL NOT execute a bundled Zotero runtime or contact Zotero

#### Scenario: Default installed delivery is smoke tested

- **WHEN** the installed tarball is initialized with explicit Codex selection and no Adapter option
- **THEN** the temporary project SHALL receive ten fixed Skills and no `.zotero-bridge` files
- **AND** the isolated prompt directory SHALL receive sixteen command prompts

#### Scenario: Opted-in Codex delivery is smoke tested

- **WHEN** the installed tarball is initialized with Codex and explicit `zotero-library` selection
- **THEN** the temporary project SHALL receive seventeen Skills and one current-platform `.zotero-bridge` runtime and profile template
- **AND** the installed CLI SHALL expose sixteen top-level commands and pass strict workspace checking

### Requirement: Fixed Zotero Release Assets

The npm release SHALL contain the approved generated seven-Skill Zotero Adapter
tree and supported runtime assets while treating their workspace installation as
optional and excluding maintainer-only and unconsumed upstream surfaces.

#### Scenario: Installed package verifies Zotero assets

- **WHEN** the release verifier packs and installs the npm tarball
- **THEN** all seven Zotero Adapter Skills, reviewed runtime metadata, profile template, supported runtimes, checksums, release identities, licenses, notices and derivations SHALL be present and valid
- **AND** global installers, unreviewed agents, vendor checkout, audits, converter sources and test fixtures SHALL be absent
- **AND** default delivery SHALL expose ten fixed Skills while explicit selection SHALL add the seven Adapter Skills

### Requirement: Release Surface And Guidance Are Converged

The release SHALL contain the fixed ten-Skill surface, optional seven-Skill
Zotero surface, sixteen-command CLI, current profiles and current user guidance,
with no generated or packaged path depending on legacy runtime authority.

#### Scenario: Package is verified

- **WHEN** the packed tarball is installed and exercised in a fresh environment
- **THEN** default init SHALL omit Adapter files and an explicit opt-in SHALL install them
- **AND** all documented base and Zotero journeys SHALL be executable
