## Purpose
Define the current ResearchSpec workspace, stable contracts, derived views, and static projections.

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

### Requirement: Plugin Status Summary
Workspace status SHALL distinguish selected, available, unavailable, and projected plugin state without mutating the workspace.

#### Scenario: Selected plugin is retired
- **WHEN** configuration names a plugin absent from the bundled registry
- **THEN** status SHALL retain it as selected and report it unavailable
- **AND** it SHALL not infer that its files are safely removable without manifest inspection

### Requirement: Plugin Validation Target
`check plugins` and `check all` SHALL validate the bundled registry, derived Skill structure, provenance references, installed-file presence, and manifest hash drift.

#### Scenario: Plugin installation is healthy
- **WHEN** every selected available Skill is projected to every configured tool and owned hashes match
- **THEN** plugin checks SHALL pass

#### Scenario: Projected resource is missing or modified
- **WHEN** a selected plugin resource is missing or differs from its manifest hash
- **THEN** plugin checks SHALL return a stable finding identifying the plugin, Skill, tool, and path

### Requirement: Current Workspace Contract
ResearchSpec SHALL recognize only schema `"1"` workspaces whose managed files follow the current
stable-spec, profile, subflow, handoff and change layout.

#### Scenario: Fresh workspace is initialized
- **WHEN** a user initializes an empty project
- **THEN** ResearchSpec creates only config, manifest, project profile, four stable spec skeletons,
  changes and subflows
- **AND** it does not create runs, registries, ledgers, receipts, playbooks or draft-patches

#### Scenario: Old or unknown workspace is encountered
- **WHEN** discovery finds an unsupported schema or an old control-plane marker
- **THEN** ResearchSpec reports an unsupported workspace without compatibility parsing or writes

### Requirement: Stable Research Specifications
ResearchSpec SHALL provide separate typed contracts for project intent, sources, claims and
manuscript structure while allowing incomplete early-research content.

#### Scenario: Early workspace is checked
- **WHEN** sources and claims are empty and manuscript details are incomplete
- **THEN** validation accepts the skeleton and validates only facts and references that are present

### Requirement: Current Workspace Index Is Derived
ResearchSpec SHALL derive status and validation views by scanning current files without persisting an
index or history projection.

#### Scenario: Workspace is inspected
- **WHEN** status, check or doctor scans a current workspace
- **THEN** no project file is created or modified
- **AND** duplicate machine IDs, unsafe paths and symlinked managed entries are diagnosed
