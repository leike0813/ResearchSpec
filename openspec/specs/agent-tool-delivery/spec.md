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
ResearchSpec Companion Skills together with the fixed ARSU and seven-Skill
Literature Adapter surface at its registered project-local Skill root.

#### Scenario: Every tool receives the target fifteen-Skill surface

- **WHEN** any of the 31 registered tools is selected
- **THEN** it SHALL receive four ARSU Skills, `researchspec-navigate`,
  `researchspec-propose`, `researchspec-decide`, `researchspec-verify`, and the
  seven fixed Zotero Adapter Skills
- **AND** desired projection counts and files SHALL be derived from the ARSU,
  Companion and Literature Adapter catalogs rather than a second member list

#### Scenario: Obsolete generated projections are cleaned safely

- **WHEN** a manifest-owned project-local file is no longer desired
- **THEN** init and update SHALL remove it only when its bytes match the
  recorded hash
- **AND** a modified file SHALL be preserved, reported as
  `generated_file_drift`, and retained in the manifest
- **AND** a missing stale file SHALL be removed from the manifest without error

### Requirement: Capability-Aware Command Delivery
Each command-capable registered tool SHALL receive wrapper projections for the sixteen current public
commands, while Skill-only tools SHALL receive only the fixed Skills.

#### Scenario: Tool installation is planned
- **WHEN** a user selects Agent tools during init or update
- **THEN** delivery is derived from the current command and Skill catalogs without `submit`

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

ResearchSpec SHALL store selected tool intent in `researchspec/config.yaml` and all generated ownership evidence in the strict current-state `tool-installation-manifest.json` schema version `1`.

#### Scenario: Successful writes update the manifest last

- **WHEN** tool or literature-adapter files are installed or refreshed
- **THEN** the manifest SHALL record only successful paths through structured owner, source, target, executable, and SHA-256 evidence
- **AND** it SHALL record completed literature-adapter resolutions separately
- **AND** it SHALL be committed after generated files

#### Scenario: Previous development manifest shape is read

- **WHEN** the manifest contains a flat installation source or `adapter_version`
- **THEN** validation SHALL reject it as invalid schema version `1` content
- **AND** ResearchSpec SHALL NOT migrate, dual-write, or interpret the legacy shape

### Requirement: Generated File Drift Protection
ResearchSpec SHALL create missing manifest-owned projections and preserve modified generated files
unless an explicit force operation authorizes replacement.

#### Scenario: Project profile was edited
- **WHEN** update compares the profile with its converter-owned source
- **THEN** it reports drift and does not overwrite the profile without `--force`

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

ResearchSpec SHALL deliver applicable license and attribution files with every independently copied ARSU, Companion, and Literature Adapter Skill without weakening generated-file ownership or drift protection.

#### Scenario: ARSU Skill is installed

- **WHEN** a selected tool receives an ARSU Skill tree
- **THEN** the tree SHALL include the converter-owned CC BY-NC 4.0 license and upstream attribution notice
- **AND** those files SHALL be recorded and reconciled through the normal installation manifest

#### Scenario: Companion Skill is installed

- **WHEN** a selected tool receives a generated Companion Skill
- **THEN** the Companion directory SHALL include canonical MIT license text attributed to `ResearchSpec contributors`
- **AND** the license file SHALL follow the same manifest hash, drift-preservation, and safe-retirement rules as its `SKILL.md`

#### Scenario: Literature Adapter Skill is installed

- **WHEN** a selected tool receives a Zotero Adapter Skill
- **THEN** its approved AGPL-3.0 license, notice, and derivation evidence SHALL be delivered with the complete tree
- **AND** those files SHALL use the same managed ownership and drift rules

### Requirement: Optional Plugin Skill Delivery
Every configured tool SHALL receive complete packaged copies of every currently available workspace-selected domain Skill in addition to the fixed base surface; empty or missing selected domains SHALL retain intent and snapshots but SHALL NOT produce desired files.

#### Scenario: Plugin Skills reach all tool adapters
- **WHEN** one or more available non-empty domains are selected and tools are configured
- **THEN** all 31 supported tools SHALL be capable of receiving every registered resource under each resolved Skill root
- **AND** projected paths SHALL be derived from registry IDs

#### Scenario: New tool receives prior selections
- **WHEN** init or update adds a newly configured tool to a workspace whose selected domains are all available
- **THEN** all selected domain Skills and dependency closures SHALL be projected to that tool automatically

#### Scenario: Unavailable selection blocks refresh
- **WHEN** init or update encounters a selected domain that is missing or empty
- **THEN** it SHALL block projection refresh rather than deleting prior files
- **AND** it SHALL preserve the last committed resolution snapshot

### Requirement: Plugin Projection Ownership Evidence
Plugin projection SHALL reuse the structured managed-installation manifest and record its domain, vendor release, Skill ID, Agent-tool owner, target path, executable contract, and SHA-256 without altering literature-adapter resolutions.

#### Scenario: Plugin writes commit manifest last
- **WHEN** plugin files are installed or refreshed successfully
- **THEN** their structured source SHALL identify the owning domain/vendor Skill and their owner SHALL identify the target Agent tool
- **AND** the manifest SHALL be committed after the resource writes
- **AND** existing literature-adapter installations and resolutions SHALL be preserved

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
Delivery reconciliation SHALL commit per-domain resolution snapshots with the installation manifest last and SHALL retain the last snapshot for every selected unavailable domain.

#### Scenario: New Agent tool receives current closure
- **WHEN** init or update adds a configured Agent tool after available domains were selected
- **THEN** the tool SHALL receive every currently resolvable Skill in the selected-domain closure

#### Scenario: Empty selected domain retains uninstall evidence
- **WHEN** a selected domain becomes empty in a later package
- **THEN** reconciliation SHALL retain its prior direct and resolved Skill snapshot
- **AND** safe uninstall SHALL use that snapshot without deleting files still reachable from another selection

### Requirement: Adapter Roles Control Projection Discovery

Delivery SHALL preserve Adapter role, visibility, capability and hard
dependency metadata without creating command wrappers for any Adapter Skill.

#### Scenario: Command-capable tool is selected

- **WHEN** one of the 28 command-capable tools is installed
- **THEN** it SHALL receive fifteen fixed Skills and exactly eight ResearchSpec
  wrappers
- **AND** the CLI mechanism SHALL remain available as a Skill dependency rather
  than a ninth wrapper

#### Scenario: Skills-only tool is selected

- **WHEN** ForgeCode, Kimi, or Mistral Vibe is selected
- **THEN** it SHALL receive all fifteen fixed Skills
- **AND** command absence SHALL remain a non-blocking diagnostic

### Requirement: Adapter Runtime Metadata Is Delivered Statically

Each projected Zotero Skill SHALL retain its admitted `runner.json` and
`output.schema.json` when present, with ownership and hashes managed like other
generated Skill files.

#### Scenario: Projected runner has drifted

- **WHEN** a projected runner differs from its recorded bytes
- **THEN** update SHALL preserve the user-modified file under the common drift
  policy
- **AND** it SHALL report degraded projection without executing the file

### Requirement: Navigate CLI Handbook Reference Delivery

ResearchSpec SHALL project the generated CLI handbook as an optional
manifest-owned reference inside every selected tool's
`researchspec-navigate` Skill tree. The reference SHALL be produced by the same
renderer that produces the packaged CLI handbook; it SHALL NOT be copied from a
separate hand-maintained command description.

#### Scenario: Selected tool receives Navigate guidance

- **WHEN** any registered tool is selected during init or update
- **THEN** its `researchspec-navigate` Skill tree SHALL include the generated
  CLI handbook reference at the documented Navigate-local reference path
- **AND** the reference SHALL be recorded as a generated `companion-skill` file
  with normal manifest ownership and SHA-256 evidence
- **AND** no other Companion is required to carry the reference

#### Scenario: Handbook reference has drifted

- **WHEN** init or update finds that a manifest-owned Navigate handbook
  reference differs from its recorded bytes
- **THEN** it SHALL preserve and report that file under the existing generated
  file drift policy
- **AND** `--force` MAY refresh the desired generated reference
- **AND** a missing or drifted optional reference SHALL NOT prevent delivery of
  the Navigate core `SKILL.md` or the remaining fixed Skill surface

#### Scenario: Reference delivery does not expand the agent surface

- **WHEN** the Navigate handbook reference is projected to selected tools
- **THEN** every tool SHALL still receive exactly the fixed fifteen Skills
- **AND** every command-capable tool SHALL still receive exactly the eight base
  ARSU and Companion wrappers
- **AND** the handbook reference SHALL NOT create a new Skill, command wrapper,
  public CLI command, or Literature Adapter projection

### Requirement: Framework Profile Projection Ownership
The installation manifest SHALL identify `academic-pipeline.yaml` as a project-level
`framework-profile` projection with its source version and generated content identity.

#### Scenario: Fresh workspace is initialized
- **WHEN** init projects the current workspace
- **THEN** the manifest contains exactly one owner record for the project pipeline profile
