## MODIFIED Requirements

### Requirement: Installed Tarball Verification

ResearchSpec SHALL provide a cross-platform release verifier that inspects and
exercises a real npm tarball, including the fixed literature adapter and the
generated CLI handbook, in isolated temporary directories.

#### Scenario: Release tarball is verified

- **WHEN** a maintainer runs the release verification script
- **THEN** it SHALL create the tarball through the package lifecycle, validate
  its allowed files and required release documents, and install it into a
  temporary project
- **AND** the tarball SHALL include `docs/cli_handbook.md` with the same digest
  as the source-controlled catalog-rendered handbook
- **AND** every repository-relative documentation target linked from the
  packaged README SHALL resolve to a file contained in the same tarball
- **AND** it SHALL execute the installed `researchspec` bin rather than
  repository source or core planners
- **AND** it SHALL NOT execute a bundled Zotero runtime or contact Zotero

#### Scenario: Installed Codex delivery is smoke tested

- **WHEN** the installed tarball is initialized with explicit Codex selection
  and an isolated `CODEX_HOME`
- **THEN** the temporary project SHALL receive four ARSU, four Companion, and
  seven Zotero Adapter Skills
- **AND** the isolated prompt directory SHALL receive eight command prompts
- **AND** the project SHALL receive one current-platform `.zotero-bridge`
  runtime and profile template
- **AND** the installed CLI SHALL expose seventeen top-level commands and pass
  strict workspace checking

### Requirement: Release Surface And Guidance Are Converged

Release verification SHALL require exactly seventeen public top-level commands,
fifteen fixed Skills for all thirty-one registered tools, and exactly eight
command wrappers for the twenty-eight command-capable tools. It SHALL verify
that packaged and projected guidance uses the current adaptive-default,
strict-compatible action-descriptor protocol and one catalog-rendered static
CLI handbook.

#### Scenario: Installed release is smoke tested

- **WHEN** the release verifier initializes an isolated installed package
- **THEN** it SHALL observe four ARSU, four Companion, and seven Zotero Adapter
  Skills, seventeen CLI commands, and eight wrappers for a command-capable tool
- **AND** it SHALL reject stale release expectations for sixteen commands or two
  adapter Skills

#### Scenario: Handbook source and renderer remain converged

- **WHEN** release verification renders the CLI handbook from the typed static
  command catalog
- **THEN** the rendered bytes SHALL match the source-controlled
  `docs/cli_handbook.md`
- **AND** the packaged handbook SHALL have the same digest
- **AND** verification SHALL derive expected command identities and structural
  sections from the catalog rather than lock the complete handbook prose

#### Scenario: Every Navigate projection receives the same handbook

- **WHEN** release verification projects all thirty-one registered tools
- **THEN** each `researchspec-navigate` Skill SHALL receive one manifest-owned
  CLI handbook reference whose digest matches packaged `docs/cli_handbook.md`
- **AND** all tools SHALL still receive exactly fifteen fixed Skills
- **AND** only the twenty-eight command-capable tools SHALL receive the same
  eight wrapper types

#### Scenario: Guidance convergence gate fails

- **WHEN** static help, the source-controlled or packaged CLI handbook,
  projected Navigate references, generated guidance, canonical usage
  documentation, runtime documentation, or rendered diagrams contradict the
  current runtime protocol
- **THEN** release verification SHALL fail before declaring the adaptive default
  converged
