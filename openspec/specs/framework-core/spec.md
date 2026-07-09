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

ResearchSpec SHALL expose a local `researchspec` CLI with the first framework
commands needed to initialize and inspect a contract workspace.

#### Scenario: CLI displays help

- **WHEN** a user runs `researchspec --help`
- **THEN** the CLI SHALL display available commands
- **AND** the command list SHALL include `init`, `status`, and `check`

#### Scenario: CLI displays version

- **WHEN** a user runs `researchspec --version`
- **THEN** the CLI SHALL display the package version
- **AND** the command SHALL NOT require an initialized workspace

#### Scenario: Unsupported command fails clearly

- **WHEN** a user runs an unsupported command
- **THEN** the CLI SHALL fail with a clear message
- **AND** the message SHALL direct the user to help output

### Requirement: Workspace Initialization

ResearchSpec SHALL create the documented `researchspec/` workspace skeleton
without inventing research content.

#### Scenario: Dry-run initialization reports planned files

- **WHEN** a user runs `researchspec init --tools none --dry-run`
- **THEN** the CLI SHALL report the workspace files and directories it would
  create
- **AND** it SHALL NOT write files

#### Scenario: Initialize workspace without agent tools

- **WHEN** a user runs `researchspec init --tools none`
- **THEN** the CLI SHALL create the `researchspec/` workspace skeleton
- **AND** it SHALL create stable spec files under `researchspec/specs/`
- **AND** it SHALL create run-state files under `researchspec/runs/current/`
- **AND** it SHALL create `researchspec/changes/` and
  `researchspec/draft-patches/`
- **AND** it SHALL NOT generate adapter files

#### Scenario: Initialization does not overwrite user content by default

- **GIVEN** a `researchspec/` workspace already exists
- **WHEN** a user runs `researchspec init --tools none`
- **THEN** the CLI SHALL report that the workspace already exists
- **AND** it SHALL NOT overwrite existing contract files unless an explicit
  overwrite mode is implemented and requested

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

### Requirement: First Slice Boundaries

The framework core first slice SHALL avoid surfaces that belong to later
ResearchSpec changes.

#### Scenario: Later commands are not exposed as implemented behavior

- **WHEN** a user asks the CLI for available commands
- **THEN** the CLI SHALL NOT present `decide`, `archive`, `pack`, `handoff`,
  `list`, or `show` as implemented commands in this change

#### Scenario: ARSU maintenance remains out of scope

- **WHEN** the framework core first slice is implemented
- **THEN** it SHALL NOT include ARSU upstream synchronization, converter
  maintenance, generated skill delivery, or ARSU semantic workflow execution
