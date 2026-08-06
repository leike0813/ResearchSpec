## MODIFIED Requirements

### Requirement: Installed Tarball Verification

ResearchSpec SHALL provide a cross-platform release verifier that inspects and exercises a real npm tarball, including the optional literature Adapter and generated independent CLI handbook Skill, in isolated temporary directories.

#### Scenario: Release tarball is verified

- **WHEN** a maintainer runs release verification
- **THEN** it SHALL pack, validate, install, and execute the installed CLI without running Adapter assets

#### Scenario: Default installed delivery is smoke tested

- **WHEN** the installed tarball initializes with explicit Codex selection and no Adapter
- **THEN** the project SHALL receive eleven fixed Skills and no `.zotero-bridge` files
- **AND** the handbook SHALL be `researchspec-cli-handbook/SKILL.md`, not a Navigate reference

#### Scenario: Opted-in Codex delivery is smoke tested

- **WHEN** the installed tarball initializes with Codex and `zotero-library`
- **THEN** the project SHALL receive eighteen Skills and the current-platform Adapter runtime/profile
- **AND** the installed CLI SHALL expose sixteen top-level commands and pass strict checking

### Requirement: Fixed Zotero Release Assets

The npm release SHALL contain the approved seven-Skill Zotero Adapter tree and supported runtime assets while keeping installation optional.

#### Scenario: Installed package verifies Zotero assets

- **WHEN** release verification packs and installs the npm tarball
- **THEN** all reviewed Adapter assets and identities SHALL be present without maintainer-only inputs
- **AND** default delivery SHALL expose eleven fixed Skills while explicit selection adds seven Adapter Skills

### Requirement: Release Surface And Guidance Are Converged

The release SHALL contain the fixed eleven-Skill surface, optional seven-Skill Zotero surface, sixteen-command CLI, current profiles, and current guidance, with no Navigate-local handbook reference.

#### Scenario: Package is verified

- **WHEN** the packed tarball is installed and exercised
- **THEN** default init SHALL omit Adapter files and explicit opt-in SHALL install them
- **AND** the independent handbook Skill SHALL match the packaged CLI handbook renderer
