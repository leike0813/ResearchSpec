## MODIFIED Requirements

### Requirement: Installed Tarball Verification
ResearchSpec SHALL provide a cross-platform release verifier that inspects and exercises a real npm tarball, including the fixed literature adapter, in isolated temporary directories.

#### Scenario: Release tarball is verified
- **WHEN** a maintainer runs the release verification script
- **THEN** it SHALL create the tarball through the package lifecycle, validate its allowed files and required release documents, and install it into a temporary project
- **AND** it SHALL execute the installed `researchspec` bin rather than repository source or core planners
- **AND** it SHALL NOT execute a bundled Zotero runtime or contact Zotero

#### Scenario: Installed Codex delivery is smoke tested
- **WHEN** the installed tarball is initialized with explicit Codex selection and an isolated `CODEX_HOME`
- **THEN** the temporary project SHALL receive four ARSU, four Companion, and two Zotero Adapter Skills
- **AND** the isolated prompt directory SHALL receive eight command prompts
- **AND** the project SHALL receive one current-platform `.zotero-bridge` runtime and profile template
- **AND** the installed CLI SHALL expose sixteen top-level commands and pass strict workspace checking

### Requirement: Supported Release Runtime Matrix
ResearchSpec v0.1 SHALL require Node.js 22 or newer and SHALL certify Node 22 and Node 24 on Linux and Windows plus Node 22 on macOS, while statically verifying every supported Zotero runtime mapping.

#### Scenario: Read-only CI validates a supported matrix cell
- **WHEN** CI runs for a supported operating-system and Node-version cell
- **THEN** it SHALL install locked dependencies and run tests, lint, converter checks, idempotence, package verification, and strict main-spec validation
- **AND** it SHALL require only read access and SHALL NOT publish, tag, mutate an external release, or run the Zotero adapter

#### Scenario: Platform assets are verified
- **WHEN** release verification inspects the package
- **THEN** it SHALL require the approved Windows x64, macOS x64 and arm64, and Linux x86, x64, arm, and arm64 assets and checksums
- **AND** unsupported platform resolution SHALL remain deterministic and offline

### Requirement: Mixed-License Distribution Disclosure
The package SHALL state the applicable MIT, CC BY-NC 4.0, and AGPL-3.0 boundaries and SHALL retain upstream attribution in every distributed context that contains ARSU-derived or Zotero Adapter runtime content.

#### Scenario: User inspects the npm tarball
- **WHEN** the package contents are listed
- **THEN** root license, notice, changelog, security, README, and Zotero AGPL license and derivation documents SHALL be present
- **AND** the README and notice SHALL disclose ARSU's CC BY-NC 4.0 boundary and the Zotero Adapter's AGPL-3.0 boundary

#### Scenario: User inspects an installed Skill copy
- **WHEN** ResearchSpec delivers an ARSU, Companion, or Zotero Adapter Skill into an Agent tool directory
- **THEN** that independent Skill directory SHALL contain its applicable license and attribution information

## ADDED Requirements

### Requirement: Fixed Zotero Release Assets
The npm release SHALL contain the approved generated Zotero Adapter tree and all supported runtime assets while excluding maintainer-only and unconsumed upstream surfaces.

#### Scenario: Installed package verifies Zotero assets
- **WHEN** the release verifier packs and installs the npm tarball
- **THEN** both Zotero Adapter Skills, profile template, seven runtime assets, checksums, release identities, AGPL license, notice, and derivation SHALL be present and valid
- **AND** upstream installer scripts, `agents/openai.yaml`, `runner.json`, `output.schema.json`, vendor checkout, audits, converter sources, and test fixtures SHALL be absent
- **AND** default delivery SHALL expose ten fixed Skills and exactly eight wrapper types
