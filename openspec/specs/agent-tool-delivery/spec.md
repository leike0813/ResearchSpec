## Purpose

ResearchSpec delivers complete ARSU skill groups and tool-neutral command
wrappers to a registry of selectable agent tools, with generated-file drift
protection and shared-global prompt management. This capability is the generated
tool delivery layer driven by `init` / `update`.
## Requirements
### Requirement: Complete Agent Tool Registry

ResearchSpec SHALL provide a single registry for all 31 selectable agent tools
supported by the bundled OpenSpec 1.5.0 reference.

#### Scenario: All selects every registered tool

- **WHEN** a user supplies `--tools all`
- **THEN** the selection SHALL include exactly `amazon-q`, `antigravity`,
  `auggie`, `bob`, `claude`, `cline`, `codex`, `forgecode`, `codebuddy`,
  `continue`, `costrict`, `crush`, `cursor`, `factory`, `gemini`,
  `github-copilot`, `iflow`, `junie`, `kilocode`, `kimi`, `kiro`, `lingma`,
  `vibe`, `oh-my-pi`, `opencode`, `pi`, `qoder`, `qwen`, `roocode`, `trae`, and
  `windsurf`

#### Scenario: Tool expressions are validated

- **WHEN** a user supplies a comma-separated tool expression
- **THEN** IDs SHALL be normalized and deduplicated
- **AND** `all` or `none` mixed with explicit IDs SHALL return a usage error

### Requirement: Complete ARSU Skill Delivery

Every selected tool SHALL receive complete packaged copies of the four ARSU
skill groups at its registered project-local skill root.

#### Scenario: Skill trees are installed recursively

- **WHEN** a tool installation is planned
- **THEN** `deep-research`, `academic-paper`, `academic-paper-reviewer`, and
  `academic-pipeline` SHALL include their packaged instructions, references,
  assets, templates, agents, and other runtime files

### Requirement: Complete Companion Skill Delivery

Every selected tool SHALL receive generated copies of all four canonical
ResearchSpec companion skills at its registered project-local skill root.

#### Scenario: Every tool receives the target eight-Skill surface

- **WHEN** any of the 31 registered tools is selected
- **THEN** it SHALL receive four ARSU Skills plus `researchspec-navigate`,
  `researchspec-propose`, `researchspec-decide`, and `researchspec-verify`
- **AND** each installed companion SHALL contain one self-contained `SKILL.md`
- **AND** desired projection counts SHALL be derived from the ARSU and Companion
  registries rather than a second member list

#### Scenario: Obsolete generated projections are cleaned safely

- **WHEN** a manifest-owned project-local file is no longer desired
- **THEN** init and update SHALL remove it only when its bytes match the recorded hash
- **AND** a modified file SHALL be preserved, reported as `generated_file_drift`,
  and retained in the manifest
- **AND** a missing stale file SHALL be removed from the manifest without error

### Requirement: Capability-Aware Command Delivery

ResearchSpec SHALL render typed ARSU and companion wrapper intents through the
registered tool-specific command format without conflating their metadata or
installed skill IDs.

#### Scenario: Command-capable tools receive the target eight-wrapper surface

- **WHEN** one of the 28 command-capable tools is selected
- **THEN** it SHALL receive wrappers for four ARSU Skills and four Companion Skills
  at the registered command paths and syntax
- **AND** each companion wrapper SHALL route to its installed skill instead of
  duplicating the workflow
- **AND** companion metadata SHALL not inherit ARSU categories or tags

#### Scenario: Skills-only tools remain non-blocking

- **WHEN** ForgeCode, Kimi, or Mistral Vibe is selected
- **THEN** its four ARSU and four Companion Skills SHALL be installed
- **AND** the CLI SHALL report a non-blocking `commands_not_supported`
  diagnostic instead of inventing a command format

### Requirement: Interactive And Detected Selection

Interactive initialization SHALL provide searchable selection informed by
configured and detected tools.

#### Scenario: First initialization preselects detected tools

- **WHEN** no tool configuration exists and a TTY is available
- **THEN** detected tools SHALL be preselected

#### Scenario: Reconfiguration preserves explicit intent

- **WHEN** a workspace already has configured tools
- **THEN** configured tools SHALL sort first and remain selected
- **AND** newly detected unconfigured tools SHALL be shown without automatic
  selection

#### Scenario: Non-interactive selection is deterministic

- **WHEN** no TTY is available
- **THEN** the CLI SHALL use an explicit `--tools` expression or detected tools
- **AND** it SHALL fail clearly if neither yields a selection

### Requirement: Local Selection And Ownership Facts

ResearchSpec SHALL store selected tool intent in `researchspec/config.yaml` and
generated ownership evidence in `tool-installation-manifest.json`.

#### Scenario: Successful writes update the manifest last

- **WHEN** tool files are installed or refreshed
- **THEN** the manifest SHALL record only successful paths with source,
  adapter, scope, version, and SHA-256 evidence
- **AND** it SHALL be committed after generated files

### Requirement: Generated File Drift Protection
`init` and `update` SHALL preserve unknown or modified generated files and SHALL reconcile obsolete project-local manifest-owned files without recognizing product-history identifiers.

#### Scenario: No-longer-desired project file is manifest-owned
- **WHEN** its bytes match the recorded hash
- **THEN** generic reconciliation SHALL remove it without a retired-product classification

#### Scenario: No-longer-desired file is modified
- **WHEN** its bytes differ from the recorded hash
- **THEN** it SHALL be preserved and reported as generated-file drift

### Requirement: Shared Global Codex Prompts

Codex command prompts SHALL be managed as shared-global workspace-neutral files
under `$CODEX_HOME/prompts` or `~/.codex/prompts`.

#### Scenario: Global write is explicit outside a TTY

- **WHEN** a non-interactive invocation would write Codex prompts
- **THEN** Codex SHALL have been explicitly included in `--tools`
- **AND** the write plan SHALL identify the out-of-workspace scope

#### Scenario: Project deselection does not delete shared prompts

- **WHEN** one project removes Codex from its selected tools
- **THEN** shared-global Codex prompts SHALL NOT be deleted

### Requirement: Installed Skill License Retention

ResearchSpec SHALL deliver applicable license and attribution files with every independently copied ARSU and Companion Skill without weakening generated-file ownership or drift protection.

#### Scenario: ARSU Skill is installed

- **WHEN** a selected tool receives an ARSU Skill tree
- **THEN** the tree SHALL include the converter-owned CC BY-NC 4.0 license and upstream attribution notice
- **AND** those files SHALL be recorded and reconciled through the normal installation manifest

#### Scenario: Companion Skill is installed

- **WHEN** a selected tool receives a generated Companion Skill
- **THEN** the Companion directory SHALL include canonical MIT license text attributed to `ResearchSpec contributors`
- **AND** the license file SHALL follow the same manifest hash, drift-preservation, and safe-retirement rules as its `SKILL.md`

### Requirement: Optional Plugin Skill Delivery
Every configured tool SHALL receive complete packaged copies of every available workspace-selected plugin Skill in addition to the fixed base surface.

#### Scenario: Plugin Skills reach all tool adapters
- **WHEN** one or more plugins are selected and tools are configured
- **THEN** all 31 supported tools SHALL be capable of receiving every registered resource under each selected plugin Skill root
- **AND** projected paths SHALL be derived from registry IDs

#### Scenario: New tool receives prior selections
- **WHEN** init or update adds a newly configured tool to a workspace with selected plugins
- **THEN** all available selected plugin Skills SHALL be projected to that tool automatically

### Requirement: Plugin Projection Ownership Evidence
Plugin projection SHALL reuse the installation manifest and record optional plugin ID, plugin version, and Skill ID in addition to existing path, hash, source, adapter, scope, and version evidence.

#### Scenario: Plugin writes commit manifest last
- **WHEN** plugin files are installed or refreshed successfully
- **THEN** their manifest entries SHALL identify the owning plugin and Skill
- **AND** the manifest SHALL be committed after the resource writes

### Requirement: Plugin Delivery Adds No Wrappers
Optional plugin Skills SHALL NOT create tool command wrappers.

#### Scenario: Command-capable tool receives plugins
- **WHEN** a selected plugin is projected to one of the 28 command-capable tools
- **THEN** the tool SHALL still contain exactly the eight base command wrappers managed by ResearchSpec
- **AND** the plugin SHALL be invoked as an installed Skill

### Requirement: Plugin Reconciliation Preserves Drift
Plugin desired-file refresh and retirement SHALL use existing manifest hash and drift rules, with stricter whole-transaction preflight for explicit uninstall.

#### Scenario: Desired plugin file is modified
- **WHEN** install or update encounters a desired plugin file whose current bytes differ from the recorded hash
- **THEN** it SHALL preserve and report the file by default
- **AND** `--force` MAY refresh that desired file

#### Scenario: Explicit uninstall contains drift
- **WHEN** any requested plugin file has manifest-recorded ownership but modified bytes
- **THEN** no file or selection in that uninstall transaction SHALL change

### Requirement: Dependency-Resolved Domain Delivery
Agent delivery SHALL project the sorted union of direct and transitive Skills resolved from selected domains and SHALL write each Skill at most once per configured tool.

#### Scenario: Overlapping domain installation is deduplicated
- **WHEN** multiple selected domains directly or transitively require the same Skill
- **THEN** every configured Agent tool SHALL receive one copy of that Skill tree
- **AND** the manifest SHALL retain its vendor and Skill ownership evidence

### Requirement: Domain Resolution Snapshot Delivery
Delivery reconciliation SHALL commit per-domain resolution snapshots with the installation manifest last.

#### Scenario: New Agent tool receives current closure
- **WHEN** init or update adds a configured Agent tool after domains were selected
- **THEN** the tool SHALL receive every currently resolvable Skill in the selected-domain closure

