## Purpose

ResearchSpec provides a minimal TypeScript CLI framework for creating and
checking local file-based contract workspaces. This capability covers the first
framework slice: package scaffold, user-facing `init` / `status` / `check`
commands, workspace discovery, and basic workspace validation.

## Requirements

### Requirement: TypeScript CLI Project Scaffold

ResearchSpec SHALL provide a minimal TypeScript project scaffold for a local
file-based CLI framework.

#### Scenario: Package metadata declares CLI entrypoint

- **WHEN** the project scaffold is present
- **THEN** `package.json` SHALL declare a package-managed executable named
  `researchspec`
- **AND** the executable SHALL resolve to the compiled CLI entrypoint
- **AND** package scripts SHALL include build and test commands

#### Scenario: Project uses pnpm as intended package manager

- **WHEN** maintainers inspect the project scaffold
- **THEN** project metadata SHALL indicate pnpm as the intended package manager
- **AND** this change SHALL NOT require a generated lockfile before dependencies
  are explicitly installed

#### Scenario: TypeScript configuration exists

- **WHEN** the project scaffold is present
- **THEN** TypeScript configuration SHALL compile source files from `src/`
- **AND** compiled output SHALL be emitted outside `src/`
- **AND** strict type checking SHALL be enabled

### Requirement: Minimal ResearchSpec CLI

ResearchSpec SHALL expose a local `researchspec` CLI whose public command
registry covers workspace initialization, inspection, generated tool delivery,
derived context artifacts, explicit decisions, and resolved-item archiving.

#### Scenario: CLI displays help

- **WHEN** a user runs `researchspec --help`
- **THEN** the CLI SHALL display the complete public command registry

#### Scenario: CLI displays version

- **WHEN** a user runs `researchspec --version`
- **THEN** the CLI SHALL display the package version
- **AND** the command SHALL NOT require an initialized workspace

#### Scenario: Unsupported command fails clearly

- **WHEN** a user runs an unsupported command
- **THEN** the CLI SHALL return a usage-class error
- **AND** the message SHALL direct the user to help output

### Requirement: Workspace Initialization

ResearchSpec SHALL create or safely extend the documented `researchspec/`
workspace without inventing research content or overwriting user contracts.

#### Scenario: Dry-run initialization reports planned files

- **WHEN** a user runs `researchspec init --tools none --dry-run`
- **THEN** the CLI SHALL report the workspace files and directories it would
  create, update, delete, or skip
- **AND** it SHALL NOT write files

#### Scenario: Initialize workspace without agent tools

- **WHEN** a user runs `researchspec init --tools none`
- **THEN** the CLI SHALL create the `researchspec/` workspace skeleton
- **AND** it SHALL create stable spec files under `researchspec/specs/`
- **AND** it SHALL create run-state files under `researchspec/runs/current/`
- **AND** it SHALL create `researchspec/changes/` and
  `researchspec/draft-patches/`
- **AND** it SHALL NOT generate adapter files

#### Scenario: Existing workspace is extended safely

- **GIVEN** a `researchspec/` workspace already exists
- **WHEN** a user reruns `researchspec init`
- **THEN** the CLI SHALL preserve existing research contracts
- **AND** it SHALL add only missing metadata or safely managed generated files

### Requirement: Workspace Discovery

ResearchSpec SHALL discover the nearest workspace from the current working
directory or an explicit workspace option.

#### Scenario: Discover nearest workspace

- **GIVEN** a project contains a `researchspec/` directory
- **WHEN** the user runs `researchspec status` from the project root or a child
  directory
- **THEN** the CLI SHALL resolve that workspace as the active workspace

#### Scenario: Missing workspace is actionable

- **GIVEN** no `researchspec/` workspace can be found
- **WHEN** the user runs `researchspec status`
- **THEN** the CLI SHALL report that the workspace is missing
- **AND** it SHALL recommend `researchspec init`

### Requirement: Workspace Status

ResearchSpec SHALL summarize initialized workspace state without modifying
files.

#### Scenario: Status reports initialized workspace

- **GIVEN** a workspace created by `researchspec init --tools none`
- **WHEN** the user runs `researchspec status`
- **THEN** the CLI SHALL report that the workspace is initialized
- **AND** it SHALL include the current workflow/run state if available
- **AND** it SHALL report missing optional surfaces as non-blocking diagnostics

#### Scenario: Status supports machine-readable output channel

- **GIVEN** a workspace created by `researchspec init --tools none`
- **WHEN** the user runs `researchspec status --json`
- **THEN** the CLI SHALL print a single machine-readable JSON object to stdout
- **AND** progress or diagnostics SHALL NOT be mixed into stdout

### Requirement: Workspace Checks

ResearchSpec SHALL provide a basic `check` command that validates the minimal
workspace contract files.

#### Scenario: Fresh workspace passes basic checks

- **GIVEN** a workspace created by `researchspec init --tools none`
- **WHEN** the user runs `researchspec check`
- **THEN** the CLI SHALL report success for required workspace structure
- **AND** it SHALL parse machine-facing YAML, JSON, and JSONL files

#### Scenario: Missing required file is reported

- **GIVEN** a required workspace file is missing
- **WHEN** the user runs `researchspec check`
- **THEN** the CLI SHALL report a blocking check result
- **AND** it SHALL identify the missing file path

#### Scenario: Invalid machine contract is reported

- **GIVEN** a required YAML, JSON, or JSONL workspace file is not parseable
- **WHEN** the user runs `researchspec check`
- **THEN** the CLI SHALL report a blocking check result
- **AND** it SHALL identify the invalid file path

### Requirement: Workspace Metadata Sources Of Truth

ResearchSpec SHALL separate user-selected workspace configuration from generated
installation ownership evidence.

#### Scenario: Metadata is created without replacing contracts

- **WHEN** an older valid workspace lacks config or installation manifest files
- **THEN** initialization or update SHALL create the missing metadata
- **AND** existing research contracts SHALL remain unchanged

### Requirement: Shared Write Planning

All public writing commands SHALL use one preflighted write-plan model with
explicit ownership and overwrite policy.

#### Scenario: User contracts are protected

- **WHEN** a planned operation targets an existing user-owned research contract
- **THEN** neither `--force` nor `--yes` SHALL silently overwrite it

#### Scenario: Authoritative records are committed last

- **WHEN** a multi-file operation succeeds
- **THEN** its installation manifest or decision ledger entry SHALL be committed
  after dependent file writes
