## ADDED Requirements

### Requirement: Authored Whitespace Is Checked Without Rewriting Reviewed Bytes

Release verification SHALL reject whitespace errors in authored files while exempting only exact files enumerated as byte-preserved and whose current SHA-256 matches their reviewed registry or catalog evidence. An unverified exemption SHALL fail the gate.

#### Scenario: Authored file has trailing whitespace

- **WHEN** a changed authored text file fails the whitespace check
- **THEN** release verification fails with the file and location

#### Scenario: Byte-preserved resource has upstream whitespace

- **WHEN** a changed resource is explicitly registered as byte-preserved and its current hash is verified
- **THEN** the authored-whitespace gate does not require normalization of that resource

## MODIFIED Requirements

### Requirement: Installed Tarball Verification

ResearchSpec SHALL provide a cross-platform release verifier that derives the fixed Agent surface from packaged ARSU, Companion and capability registries, inspects and exercises a real npm tarball, and verifies the optional literature Adapter in isolated temporary directories.

#### Scenario: Release tarball is verified

- **WHEN** a maintainer runs release verification
- **THEN** it packs, validates, installs and executes the installed CLI without running Adapter or packaged capability assets

#### Scenario: Default installed delivery is smoke tested

- **WHEN** the installed tarball initializes with explicit Codex selection and no Adapter
- **THEN** the project receives four ARSU Skills, five Companion Skills and every packaged capability registry entry
- **AND** the handbook is `researchspec-cli-handbook/SKILL.md`

#### Scenario: Opted-in Codex delivery is smoke tested

- **WHEN** the installed tarball initializes with Codex and `zotero-library`
- **THEN** the project receives the registry-derived fixed surface plus seven Adapter Skills
- **AND** the installed CLI exposes sixteen top-level commands and passes strict checking

### Requirement: Release Surface And Guidance Are Converged

The release SHALL contain the four ARSU Skills, five Companion Skills, every packaged capability registry entry, optional seven-Skill Zotero surface, sixteen-command CLI, current graph profiles and current graph-only guidance.

#### Scenario: Package is verified

- **WHEN** the packed tarball is installed and exercised
- **THEN** default init omits Adapter files and explicit opt-in installs them
- **AND** no public Skill, wrapper, payload catalog or handbook contains route, subflow or control-file runtime guidance

