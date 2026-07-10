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

Every selected tool SHALL receive generated copies of all eight canonical
ResearchSpec companion skills at its registered project-local skill root.

#### Scenario: Every tool receives self-contained companion skills

- **WHEN** any of the 31 registered tools is selected
- **THEN** it SHALL receive `researchspec-explore`, `researchspec-propose`,
  `researchspec-check`, `researchspec-verify`, `researchspec-next`,
  `researchspec-context`, `researchspec-decide`, and `researchspec-archive`
- **AND** each installed companion SHALL contain one self-contained `SKILL.md`
- **AND** all files SHALL participate in the existing installation manifest,
  hashing, drift protection, force refresh, and stale cleanup rules

#### Scenario: Obsolete generated references are cleaned safely

- **WHEN** an installed `references/cli-discipline.md` is manifest-owned but no
  longer desired
- **THEN** update SHALL remove it only when its bytes match the recorded hash
- **AND** a modified reference SHALL be preserved and reported as generated drift

### Requirement: Capability-Aware Command Delivery

ResearchSpec SHALL render typed ARSU and companion wrapper intents through the
registered tool-specific command format without conflating their metadata or
installed skill IDs.

#### Scenario: Command-capable tools receive both wrapper families

- **WHEN** one of the 28 command-capable tools is selected
- **THEN** it SHALL receive wrappers for the four ARSU skill groups and all eight
  ResearchSpec companion skills at the registered command paths and syntax
- **AND** each companion wrapper SHALL route to its installed skill instead of
  duplicating the workflow
- **AND** companion metadata SHALL not inherit ARSU categories or tags

#### Scenario: Skills-only tools remain non-blocking

- **WHEN** ForgeCode, Kimi, or Mistral Vibe is selected
- **THEN** its ARSU and all eight companion skills SHALL be installed
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

`init` and `update` SHALL preserve user-owned and modified generated files by
default.

#### Scenario: Unknown existing file is preserved

- **WHEN** an expected target exists but is not manifest-owned
- **THEN** the operation SHALL skip it as a user-owned conflict

#### Scenario: Drifted generated file requires force

- **WHEN** a manifest-owned file no longer matches its recorded hash
- **THEN** the operation SHALL preserve it and report `generated_file_drift`
- **AND** `--force` SHALL apply only to manifest-owned generated files

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
