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

ResearchSpec SHALL recognize only schema `"2"` workspaces whose managed files follow the current
stable-spec, graph-profile, run, node, handoff and change layout. A current workspace contains
`config.yaml`, an installation manifest, four stable specs, projected graph profiles, run instance
files under `runs/<run-id>/`, node instance files under `runs/<run-id>/nodes/`, run handoffs, and
project changes.

#### Scenario: Fresh workspace is initialized

- **WHEN** a user initializes an empty project
- **THEN** ResearchSpec creates only config, manifest, stable spec skeletons, projected graph profiles,
  changes and empty runs root
- **AND** it does not create runs, registries, ledgers, receipts, playbooks or draft-patches until a
  run is explicitly confirmed

#### Scenario: Old or unknown workspace is encountered

- **WHEN** discovery finds an earlier schema or another unsupported marker
- **THEN** ResearchSpec reports an unsupported workspace without compatibility parsing or writes

### Requirement: Manuscript specs are structured and independently valid
The system SHALL parse `specs/manuscript.yaml` as workspace schema `"2"` with stable manuscript metadata, venue/layout `format_requirements`, outline sections, and a delivery contract containing `working_format: markdown | qmd | null` and `final_output_format: safe Quarto format ID | null`. `format_requirements` SHALL remain independent from format selection. A QMD selection SHALL require a `.qmd` source in manuscript handoffs and a safe non-empty Quarto format ID before final delivery.

#### Scenario: Empty format selection is valid during intake
- **WHEN** both delivery fields are null
- **THEN** the manuscript spec parses successfully and writing intake may ask the user to choose a source format

#### Scenario: Markdown selection is valid
- **WHEN** `working_format` is `markdown` and `final_output_format` is null or a safe target ID
- **THEN** the manuscript spec parses successfully without requiring Quarto metadata

#### Scenario: QMD selection requires a safe target
- **WHEN** `working_format` is `qmd` and `final_output_format` is missing, empty, or contains unsafe path/shell characters
- **THEN** validation fails with a structured format-contract diagnostic

### Requirement: Current Workspace Index Is Derived

ResearchSpec SHALL derive status and validation views by scanning current stable specs, graph profiles,
run files, node files, handoffs and changes without persisting an index or history projection.

#### Scenario: Workspace is inspected

- **WHEN** status, check or doctor scans a current workspace
- **THEN** no project file is created or modified
- **AND** duplicate machine IDs, unsafe paths and symlinked managed entries are diagnosed
- **AND** run/node relationships are derived from owning files, never from a hidden index

### Requirement: Graph Profiles Are Current Project Authority

Projected graph profiles SHALL be the only authored source of executable workflow structure. Status,
instructions and advance SHALL derive legal actions from profiles and run/node files, and no Skill or
Agent surface SHALL add a second workflow authority.

#### Scenario: Profile is missing or drifted

- **WHEN** a current workspace lacks a projected profile or its bytes differ from the manifest-owned
  source
- **THEN** update reports drift and preserves the file unless `--force` is explicit

#### Scenario: Profile is not runtime state

- **WHEN** an Agent edits a projected profile to change an active run
- **THEN** the active run keeps its frozen graph and status reports the drift without applying the
  edit to the run

### Requirement: Converter-Owned Profiles Are The Projection Source

Preset graph profiles SHALL be authored and generated outside the core runtime and exposed through one validated profile registry. Core bootstrap SHALL consume that registry without embedding a second graph definition.

#### Scenario: Preset graph is projected

- **WHEN** a workspace is initialized or updated
- **THEN** the projected profile bytes come from the converter-owned registry
- **AND** the core runtime contains no independently maintained copy of the graph

### Requirement: Framework Projection Is Transactional And Ownership-Aware

Core capability and profile projection SHALL use the same preflight, ownership manifest, current-byte comparison and atomic commit contract as other generated Agent delivery.

#### Scenario: Managed projection has user drift

- **WHEN** init or update encounters a manifest-owned capability or profile whose current bytes differ from the recorded hash
- **THEN** the operation reports drift and preserves the file unless explicit force authorization applies

#### Scenario: Projection preflight fails

- **WHEN** any planned framework projection conflicts before commit
- **THEN** no capability, profile or ownership-manifest write is committed
