## Purpose

ResearchSpec delivers complete ARSU Skill groups and tool-neutral command
wrappers to a registry of selectable agent tools, with generated-file drift
protection and explicit legacy migration. This capability is the generated
tool delivery layer driven by `init` / `update`.
## Requirements

### Requirement: Complete Agent Tool Registry

ResearchSpec SHALL provide a single registry for all 37 selectable agent tools
supported by the bundled OpenSpec 1.5.0 reference.

#### Scenario: All selects every registered tool

- **WHEN** a user supplies `--tools all`
- **THEN** the selection SHALL include exactly `amazon-q`, `antigravity`,
  `auggie`, `bob`, `claude`, `cline`, `codeartsagent`, `codex`, `devin`,
  `forgecode`, `codebuddy`, `continue`, `costrict`, `crush`, `cursor`, `factory`, `gemini`,
  `github-copilot`, `hermes`, `iflow`, `junie`, `kilocode`, `kimi`, `kiro`, `lingma`,
  `minimax-code`, `vibe`, `oh-my-pi`, `opencode`, `pi`, `qoder`, `qwen`, `rovodev`,
  `roocode`, `trae`, `zcode`, and `agents`; `windsurf` resolves to `devin`

#### Scenario: Tool expressions are validated

- **WHEN** a user supplies a comma-separated tool expression
- **THEN** IDs SHALL be normalized and deduplicated
- **AND** `all` or `none` mixed with explicit IDs SHALL return a usage error

### Requirement: Complete ARSU Skill Delivery

Every selected Skill-capable tool SHALL receive complete packaged copies of the four ARSU
Skill groups at its registered Skill root. Codex SHALL receive Skills even when
the configured delivery mode is `commands`.

#### Scenario: Skill trees are installed recursively

- **WHEN** a tool installation is planned
- **THEN** `deep-research`, `academic-paper`, `academic-paper-reviewer`, and
  `academic-pipeline` SHALL include their packaged instructions, references,
  assets, templates, agents, and other runtime files

### Requirement: Complete Companion Skill Delivery

Every selected Skill-capable tool SHALL receive five generated ResearchSpec Companion Skills together with the four ARSU Skills and all registered capability packages projected for that tool. ResearchSpec SHALL deliver no separate Core Skill group. The handbook content SHALL be delivered as the `SKILL.md` of `researchspec-cli-handbook`; no Navigate-local `references/cli-handbook.md` file SHALL be generated.

#### Scenario: Every tool receives the fixed base surface

- **WHEN** any registered tool is selected without optional Adapter selection
- **THEN** it SHALL receive four ARSU Skills, five Companion Skills, and the registered capability packages supported by its delivery mode
- **AND** desired projection counts and files SHALL be derived from their owning catalogs

#### Scenario: Selected Adapter reaches every tool

- **WHEN** `zotero-library` and one or more Agent tools are selected
- **THEN** all seven Adapter Skills SHALL be projected to every selected tool
- **AND** their complete trees SHALL use the normal managed ownership records

#### Scenario: Obsolete generated projections are cleaned safely

- **WHEN** a manifest-owned project-local file is no longer desired
- **THEN** init and update SHALL remove it only when its bytes match the
  recorded hash
- **AND** a modified file SHALL be preserved, reported as
  `generated_file_drift`, and retained in the manifest
- **AND** a missing stale file SHALL be removed from the manifest without error

### Requirement: Capability-Aware Command Delivery
Each of the 28 command-capable registered tools SHALL receive wrapper projections for the sixteen current public commands when delivery includes commands. Skill-only tools SHALL receive only the fixed Skills, and Codex SHALL receive project Skills even in commands-only mode.

#### Scenario: Commands delivery follows tool capability
- **WHEN** `commands` delivery selects one command-backed tool and one Skill-only tool
- **THEN** the command-backed tool SHALL receive sixteen wrappers
- **AND** the Skill-only tool SHALL report a non-blocking capability diagnostic
- **AND** Codex SHALL still receive its project Skills when selected

### Requirement: Delivery Mode
`agent_tools.delivery` SHALL be `skills`, `commands`, or `both`, with new workspaces defaulting to `skills` and existing values preserved when the option is omitted.

#### Scenario: Tool installation is planned
- **WHEN** a user selects Agent tools during init or update
- **THEN** delivery is derived from the current command and Skill catalogs without `submit`

### Requirement: Interactive And Detected Selection

Interactive initialization SHALL provide searchable Agent-tool selection
followed by optional literature-Adapter selection with catalog-backed guidance.

#### Scenario: First initialization preselects detected tools

- **WHEN** no tool configuration exists and a TTY is available
- **THEN** detected tools SHALL be preselected

#### Scenario: Optional Adapter choices are presented

- **WHEN** Agent-tool selection completes in an interactive init
- **THEN** the CLI SHALL present `zotero-library` unselected by default
- **AND** its description SHALL identify the seven-Skill bundle, require Zotero with `zotero-agents`, and link to `https://github.com/leike0813/zotero-agents`

#### Scenario: Non-interactive selection is deterministic

- **WHEN** no TTY is available
- **THEN** tool selection SHALL use `--tools` or detected tools under the existing rules
- **AND** Adapter selection SHALL default to none unless `--literature-adapters` is supplied

### Requirement: Local Selection And Ownership Facts

ResearchSpec SHALL store selected tool and literature-Adapter intent in
`researchspec/config.yaml` and all generated ownership evidence in the strict
current-state `tool-installation-manifest.json` schema version `1`.

#### Scenario: Successful writes update the manifest last

- **WHEN** tool or selected literature-Adapter files are installed or refreshed
- **THEN** the manifest SHALL record only successful paths through structured owner, source, target, executable and SHA-256 evidence
- **AND** it SHALL record resolutions only for selected literature Adapters
- **AND** it SHALL be committed after generated files

#### Scenario: Optional Skill IDs are reserved

- **WHEN** the plugin registry validates a vendor Skill ID
- **THEN** it SHALL reject collisions with packaged literature Adapter Skill IDs even when the Adapter is not selected
- **AND** reserved IDs SHALL NOT be counted as installed fixed Skills

#### Scenario: Previous current config shape is read

- **WHEN** a workspace config lacks required `literature_adapters.selected`
- **THEN** validation SHALL reject it as an unsupported current contract
- **AND** ResearchSpec SHALL NOT migrate, dual-write, or infer selection from old manifest records

### Requirement: Generated File Drift Protection
ResearchSpec SHALL create missing manifest-owned projections and preserve modified generated files
unless an explicit force operation authorizes replacement.

#### Scenario: Project profile was edited
- **WHEN** update compares the profile with its converter-owned source
- **THEN** it reports drift and does not overwrite the profile without `--force`

### Requirement: Codex And Kimi Migration

Codex SHALL write `.agents/skills` and Kimi SHALL write `.kimi-code/skills`.
Known ResearchSpec files under `.codex/skills` and `.kimi/skills` MAY be migrated
after replacement projection; custom files, configuration, drift, symlinks and
unknown paths SHALL be preserved. Allowlisted historical Codex prompts under
`$CODEX_HOME/prompts` MAY be removed only after the replacement Skill exists.

#### Scenario: Legacy prompt cleanup is explicit outside a TTY

- **WHEN** a non-interactive invocation would write Codex prompts
- **THEN** only allowlisted historical ResearchSpec prompt names SHALL be considered
- **AND** cleanup SHALL be deferred unless `init`, `--force`, `--yes`, or an interactive confirmation authorizes it

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
- **THEN** all 37 supported tools SHALL be capable of receiving every registered resource under each resolved Skill root
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
- **THEN** the tool SHALL still contain exactly the sixteen fixed wrappers managed by ResearchSpec
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

Delivery SHALL preserve Adapter role, visibility, capability and hard dependency metadata without creating command wrappers for any Adapter Skill.

#### Scenario: Command-capable tool and Adapter are selected

- **WHEN** one of the 28 command-capable tools and `zotero-library` are selected
- **THEN** the tool SHALL receive the registry-derived fixed base surface plus seven Adapter Skills and exactly sixteen ResearchSpec wrappers
- **AND** the CLI mechanism SHALL remain available as a Skill dependency rather than another wrapper

#### Scenario: Skills-only tool and Adapter are selected

- **WHEN** a Skill-only tool and `zotero-library` are selected
- **THEN** the tool SHALL receive the registry-derived fixed base surface plus all seven Adapter Skills
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

### Requirement: Independent CLI Handbook Skill Delivery

ResearchSpec SHALL deliver the generated CLI handbook as the `SKILL.md` of `researchspec-cli-handbook` through normal Companion ownership and reconciliation.

#### Scenario: Selected tool receives the handbook Skill

- **WHEN** a tool is selected during init or update with Skill delivery
- **THEN** its managed Skill tree SHALL contain `researchspec-cli-handbook/SKILL.md`
- **AND** its Navigate tree SHALL not contain `references/cli-handbook.md`

#### Scenario: Handbook Skill has drifted

- **WHEN** the managed handbook Skill differs from its recorded bytes
- **THEN** update SHALL preserve and diagnose it under the common generated-file drift policy
- **AND** `--force` MAY refresh the desired generated Skill

### Requirement: Framework Profile Projection Ownership
The installation manifest SHALL identify every registry-owned graph profile as a project-level
`framework-profile` projection with its source version and generated content identity.

#### Scenario: Fresh workspace is initialized
- **WHEN** init projects the current workspace
- **THEN** the manifest contains one owner record for every projected profile

### Requirement: Core Capability And Profile Projections Share Managed Ownership

The capability packages and graph profiles projected by framework bootstrap SHALL participate in the same desired-file plan, conflict preflight, hash ownership manifest and commit-last behavior as ARSU, Companion, Adapter and plugin delivery.

#### Scenario: Re-init encounters a modified capability Skill

- **WHEN** a previously projected core capability file differs from its recorded bytes
- **THEN** re-init and update preserve the file and report generated-file drift

#### Scenario: Core projection succeeds

- **WHEN** all desired framework and Agent files pass preflight
- **THEN** files are committed atomically and the ownership manifest is updated last

### Requirement: Current Tool Catalog
The catalog SHALL contain exactly 37 current tools, preserve `windsurf` as an alias for `devin`, and describe legacy Skill roots, global Skill roots, detection paths, and command capability from one source of truth.

#### Scenario: Catalog expressions resolve current IDs
- **WHEN** a user selects `windsurf` or `all`
- **THEN** `windsurf` SHALL resolve to `devin` and `all` SHALL resolve to exactly the 37 catalog IDs

### Requirement: Delivery Modes
`config.yaml.agent_tools.delivery` SHALL be `skills`, `commands`, or `both`. New workspaces SHALL default to `skills`; existing values SHALL be preserved unless explicitly changed. Codex SHALL always receive project `.agents/skills` Skills and SHALL never receive custom prompt files.

#### Scenario: Commands-only keeps Codex Skills
- **WHEN** a workspace uses `commands` delivery with Codex and a command-capable tool
- **THEN** Codex SHALL receive `.agents/skills` and the command-capable tool SHALL receive wrappers
- **AND** no Codex prompt target SHALL be created

### Requirement: Safe Reconciliation
Init and update SHALL calculate one ownership-aware plan, migrate known Codex/Kimi legacy trees, remove only unmodified ResearchSpec-generated files, preserve drift and user files, and perform zero writes when any blocking conflict exists.

#### Scenario: Blocking conflict is zero-write
- **WHEN** a planned generated target is a symlink or an unowned conflicting file
- **THEN** init or update SHALL return a blocking diagnostic before changing config, manifest, or any projection

### Requirement: Shared And Global Skill Roots
Codex and the `agents` target SHALL share one `.agents/skills` tree and one ResearchSpec marker. MiniMax SHALL use a global `~/.minimax/skills` root and workspace reconciliation SHALL never remove it.

#### Scenario: Shared target is written once
- **WHEN** both Codex and `agents` are selected
- **THEN** one `.agents/skills` tree and one ownership marker SHALL be planned
- **AND** removing either selection SHALL preserve the shared global Skill files

### Requirement: Interactive re-init replaces current static selections

Interactive init against an existing current workspace SHALL present the same searchable Agent-tool and optional literature-Adapter selectors used for first initialization. Current selections SHALL be preselected, detected-only tools SHALL remain visible but unselected, and the confirmed selector results SHALL become the complete desired selections.

#### Scenario: Existing configuration is reopened

- **WHEN** a user runs `researchspec init` against an existing current workspace in a TTY without explicit selection options
- **THEN** the CLI presents Agent tools followed by optional literature Adapters
- **AND** each currently configured item is preselected
- **AND** detected-only Agent tools are not preselected

#### Scenario: A configured item is deselected

- **WHEN** the user confirms a re-init selection that omits a previously selected project-local tool or Adapter
- **THEN** the workspace config records the confirmed exact selection
- **AND** clean manifest-owned obsolete projections are removed
- **AND** drifted projections are preserved with ownership evidence and a structured diagnostic
- **AND** shared-global files are not deleted by the project deselection

#### Scenario: Unmanaged configuration remains outside init

- **WHEN** existing-workspace init reconfigures tools or literature Adapters
- **THEN** an omitted delivery option preserves `agent_tools.delivery`
- **AND** domain plugin selection remains unchanged

### Requirement: Managed installation targets are bounded by their provenance

ResearchSpec SHALL validate each installation target against its scope, owner, source namespace and registered tool or Adapter destination before reading target contents as ownership evidence. Project targets SHALL be canonical nonempty POSIX relative file paths without traversal, absolute paths, drive prefixes, backslashes, NUL or empty segments. Framework and plugin profiles SHALL target the corresponding `researchspec/profiles/<profile_id>.yaml`. Agent resources SHALL remain inside the corresponding tool and source package namespace; commands and markers SHALL use their defined destinations. Shared-global targets SHALL use the owning tool's defined global namespace, and workspace reconciliation SHALL NOT remove shared-global Skill files.

#### Scenario: Matching hash does not authorize an escaped target
- **WHEN** a manifest claims a project-external path or a file outside its source namespace with a matching hash
- **THEN** ResearchSpec reports a blocking diagnostic before reading its contents or planning removal
- **AND** the referenced file remains unchanged

#### Scenario: Valid profiles and global Skills remain supported
- **WHEN** a manifest identifies a correctly located profile or MiniMax global Skill resource
- **THEN** its path passes the corresponding target rules
- **AND** deselection preserves shared-global Skill files

### Requirement: Unsafe manifests do not authorize mutations

An existing malformed, non-regular, symlinked or unsafe installation manifest SHALL block init, update and plugin lifecycle mutations before config, manifest or projection writes. Missing manifests SHALL remain distinguishable from invalid manifests. Read-only inspection SHALL report the invalid contract without repairing it.

#### Scenario: Invalid manifest is not replaced by empty ownership
- **WHEN** a mutation encounters an existing invalid installation manifest
- **THEN** it fails with a structured blocking diagnostic
- **AND** config, manifest and projection bytes remain unchanged even with force authorization

### Requirement: Managed filesystem operations reject symlink components

ResearchSpec SHALL check managed paths against trusted roots before planning reads and before executing writes, moves or removals. Every descendant component, including the projection root and target, SHALL be free of symbolic links; the trusted project root itself MAY resolve through a symbolic link. Execution SHALL recheck the boundary after planning and SHALL apply the same boundary to temporary files, backups, cleanup and rollback.

#### Scenario: Parent directory redirects a projection
- **WHEN** a target or descendant ancestor is a symbolic link, including one pointing within the permitted root
- **THEN** the operation is blocked without following that link to read or mutate projected content

#### Scenario: Parent changes after planning
- **WHEN** a parent directory becomes a symbolic link between planning and execution
- **THEN** execution rejects the operation
- **AND** cleanup and rollback do not modify files through that link
