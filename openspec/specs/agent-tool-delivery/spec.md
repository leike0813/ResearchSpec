## Purpose

ResearchSpec delivers complete ARSU Skill groups and tool-neutral command
wrappers to a registry of selectable agent tools, with generated-file drift
protection and explicit legacy migration. This capability is the generated
tool delivery layer driven by `init` / `update`.

## Requirements

### Requirement: Complete Agent Tool Registry

ResearchSpec SHALL provide a single registry for all 36 selectable agent tools
supported by the bundled OpenSpec 1.5.0 reference.

#### Scenario: All selects every registered tool

- **WHEN** a user supplies `--tools all`
- **THEN** the selection SHALL include exactly `amazon-q`, `antigravity`, `auggie`, `bob`, `claude`, `cline`, `codeartsagent`, `codex`, `devin`, `forgecode`, `codebuddy`, `continue`, `costrict`, `crush`, `cursor`, `factory`, `gemini`, `github-copilot`, `hermes`, `iflow`, `junie`, `kilocode`, `kimi`, `kiro`, `lingma`, `vibe`, `oh-my-pi`, `opencode`, `pi`, `qoder`, `qwen`, `rovodev`, `roocode`, `trae`, `zcode`, and `agents`; `windsurf` resolves to `devin`

#### Scenario: Tool expressions are validated

- **WHEN** a user supplies a comma-separated tool expression
- **THEN** IDs SHALL be normalized and deduplicated
- **AND** `all` or `none` mixed with explicit IDs SHALL return a usage error

### Requirement: Complete ARSU Skill Delivery

ARSU workflow packages SHALL remain bundled and available to procedure activation but SHALL NOT be copied to selected Agent Skill roots.

#### Scenario: Agent delivery is planned
- **WHEN** a tool installation is reconciled
- **THEN** no ARSU workflow package becomes a host-visible Skill entry

#### Scenario: Skill trees are installed recursively
- **WHEN** an ARSU procedure is activated
- **THEN** its complete bundled tree remains available inside the ResearchSpec package without host-root projection

### Requirement: Complete Companion Skill Delivery

Every selected Agent host SHALL receive only the Navigate Companion for Skill delivery. Propose, Decide, and Verify SHALL remain bundled on-demand procedures. The Navigate tree SHALL include its generated CLI-handbook and ARSU-route references.

#### Scenario: Every tool receives the base surface
- **WHEN** a registered Skill-capable tool is selected
- **THEN** its base Skill tree contains `researchspec-navigate` and no other Companion
- **AND** Navigate contains `SKILL.md`, `LICENSE`, `references/cli-handbook.md`, and `references/arsu-routes.md`

#### Scenario: Every tool receives the fixed base surface
- **WHEN** a registered tool receives Skill delivery
- **THEN** its fixed base surface is the single complete Navigate Skill tree

#### Scenario: Selected Adapter reaches every tool
- **WHEN** `zotero-library` and Agent tools are selected
- **THEN** all seven Adapter Skills are projected through normal managed ownership

#### Scenario: Obsolete generated projections are cleaned safely
- **WHEN** a previously managed ARSU, hidden Companion, core capability, plugin Skill, or obsolete wrapper is no longer desired
- **THEN** reconciliation removes it only when its bytes match the recorded hash
- **AND** preserves and diagnoses modified files under the existing drift policy

### Requirement: Capability-Aware Command Delivery

Each command-capable tool SHALL receive one Navigate wrapper when delivery includes commands. Skill-only tools SHALL receive a Navigate Skill fallback in commands mode and report a non-blocking command-capability diagnostic.

#### Scenario: Commands delivery follows tool capability
- **WHEN** `commands` selects one command-capable tool and one Skill-only tool
- **THEN** the first receives one Navigate wrapper and the second receives one Navigate Skill

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

#### Scenario: Interactive controls remain visible and cancellable

- **WHEN** an interactive selector is open
- **THEN** navigation, selection, confirmation, and cancellation controls SHALL be displayed below the choices
- **AND** `Ctrl+C` SHALL terminate initialization without writing workspace files

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

ResearchSpec SHALL deliver applicable license and attribution files with every independently copied Companion and Literature Adapter Skill without weakening generated-file ownership or drift protection.

#### Scenario: ARSU Skill is installed

- **WHEN** a bundled ARSU procedure package is inspected or activated
- **THEN** its converter-owned CC BY-NC 4.0 license and upstream attribution notice SHALL remain in the packaged tree
- **AND** the package SHALL remain hidden from host Skill roots

#### Scenario: Companion Skill is installed

- **WHEN** a selected tool receives a generated Companion Skill
- **THEN** the Companion directory SHALL include canonical MIT license text attributed to `ResearchSpec contributors`
- **AND** every generated file in the tree SHALL follow the same manifest hash, drift-preservation, and safe-retirement rules as its `SKILL.md`

#### Scenario: Literature Adapter Skill is installed

- **WHEN** a selected tool receives a Zotero Adapter Skill
- **THEN** its approved AGPL-3.0 license, notice, and derivation evidence SHALL be delivered with the complete tree
- **AND** those files SHALL use the same managed ownership and drift rules

### Requirement: Optional Plugin Skill Delivery

Domain plugin selection SHALL retain resolution snapshots, package availability, graph profiles, and managed configuration without projecting raw vendor Skills or extension capability packages to Agent roots.

#### Scenario: Domain is selected
- **WHEN** one or more available non-empty domains are installed
- **THEN** no plugin Skill files are added to any configured Agent root
- **AND** their procedures become activation-eligible through the package registry

#### Scenario: Plugin Skills reach all tool adapters
- **WHEN** available domains are selected
- **THEN** plugin procedures become eligible without writing to Agent Skill roots

#### Scenario: New tool receives prior selections
- **WHEN** a tool is added after domains were selected
- **THEN** domain selection remains available through procedure activation without new plugin projections

#### Scenario: Unavailable selection blocks refresh
- **WHEN** a selected domain is missing or empty
- **THEN** its last resolution snapshot is retained and its procedures are not activation-eligible

### Requirement: Plugin Delivery Adds No Wrappers

Optional plugin procedures SHALL NOT create tool command wrappers or Skill entries.

#### Scenario: Command-capable tool has selected domains
- **WHEN** selected plugins are available to a command-capable host
- **THEN** the host retains only its one Navigate wrapper for command delivery

#### Scenario: Command-capable tool receives plugins
- **WHEN** selected plugin procedures are available to a command-capable tool
- **THEN** the tool still receives only its one Navigate wrapper

### Requirement: Core Capability And Profile Projections Share Managed Ownership

Graph profiles SHALL remain project-level managed projections. Core capability packages SHALL remain bundled runtime inputs and SHALL NOT be projected to Agent Skill roots.

#### Scenario: Core projection succeeds
- **WHEN** bootstrap reconciliation succeeds
- **THEN** every framework profile is managed in the workspace and no core capability Skill is copied to an Agent root

#### Scenario: Re-init encounters a modified capability Skill
- **WHEN** an obsolete managed capability projection differs from its recorded bytes
- **THEN** re-init preserves and diagnoses it rather than deleting it

### Requirement: Delivery Modes

`config.yaml.agent_tools.delivery` SHALL remain `skills`, `commands`, or `both`. New workspaces SHALL default to `skills`; existing values SHALL be preserved unless explicitly changed.

#### Scenario: Delivery mode is planned
- **WHEN** a selected host supports Skills and commands
- **THEN** `skills` plans one Navigate Skill, `commands` plans one Navigate wrapper, and `both` plans one of each

#### Scenario: Command-only delivery targets a Skill-only host
- **WHEN** `commands` selects a host without command support
- **THEN** the host receives one Navigate Skill fallback without changing configured delivery intent

#### Scenario: Commands-only keeps Codex Skills
- **WHEN** a workspace uses `commands` delivery with Codex
- **THEN** Codex receives the Navigate Skill in `.agents/skills` and no custom prompt target

### Requirement: Current Tool Catalog
The catalog SHALL contain exactly 36 current tools, preserve `windsurf` as an alias for `devin`, and describe project Skill roots, legacy Skill roots, detection paths, and command capability from one source of truth.

#### Scenario: Catalog expressions resolve current IDs
- **WHEN** a user selects `windsurf` or `all`
- **THEN** `windsurf` SHALL resolve to `devin` and `all` SHALL resolve to exactly the 36 catalog IDs

### Requirement: Project Research Entry Agreement

Every registered target SHALL describe its documented project-entry mechanism or an explicit discovery-only fallback. Selected targets with a supported mechanism SHALL receive a concise research task agreement independently of skills, commands or both delivery mode. The agreement SHALL reference only delivered entry assets and SHALL NOT add model configuration or runtime permissions.

#### Scenario: Commands mode receives an agreement
- **WHEN** a command-capable host selects commands delivery
- **THEN** its agreement references the delivered Navigate command rather than an absent Navigate Skill

#### Scenario: Commands-only work receives the current Navigate contract
- **WHEN** the selected host receives only the Navigate command entry
- **THEN** that entry exposes the canonical Navigate execution guidance including current continuity and collaboration rules
- **AND** it does not depend on an uninstalled Skill or unavailable Skill-relative reference

#### Scenario: Native rule support is not verified
- **WHEN** a registered target has no reviewed project-rule mapping
- **THEN** it retains its existing discovery entry and reports native-rule support as unverified without writing a guessed rule path

### Requirement: Shared Instruction Regions Preserve User Content

Shared instruction content SHALL be owned by an installation-manifest record identifying a fixed region and its exact bytes. Markers alone SHALL NOT authorize replacement or removal. Updates SHALL preserve bytes outside the owned region and validate the whole-file planning snapshot before writing. Dedicated entry files SHALL retain whole-file ownership.

#### Scenario: User edits outside an owned region
- **WHEN** the user changes shared-file content outside an unchanged owned region before planning
- **THEN** update refreshes only the owned region and preserves the user content

#### Scenario: Optional entry content cannot be safely reconciled
- **WHEN** a safe regular entry file contains modified, malformed or unowned entry content
- **THEN** the content is preserved and a nonblocking diagnostic is returned while other safe projections proceed
- **AND** unsafe paths, symbolic links and invalid manifests remain blocking

#### Scenario: Instruction file changes before commit preflight
- **WHEN** another writer changes the shared file after its snapshot was read and before transaction preflight
- **THEN** the transaction rejects the stale write without replacing the concurrent content

#### Scenario: Shared entry consumers change
- **WHEN** one selected host stops using a shared entry destination while another selected host still requires it
- **THEN** the entry is retained and planned once for the remaining consumers
- **AND** removal of the last consumer removes only unmodified owned content

#### Scenario: Markers lack ownership
- **WHEN** an entry region exists without its manifest record
- **THEN** identical content or force does not authorize adoption, replacement or removal

### Requirement: Safe Reconciliation
Init and update SHALL calculate one ownership-aware plan, migrate known Codex/Kimi legacy trees, remove only unmodified ResearchSpec-owned content, preserve drift and user files, and perform zero writes when any blocking conflict exists. Safe regular-file content conflicts limited to optional project-entry instructions SHALL be nonblocking; invalid ownership manifests and filesystem boundaries SHALL remain blocking.

#### Scenario: Blocking conflict is zero-write
- **WHEN** a planned generated target is a symlink or an unowned conflicting file outside the optional project-entry content exception
- **THEN** init or update SHALL return a blocking diagnostic before changing config, manifest, or any projection

### Requirement: Shared Project Skill Root
Codex and the `agents` target SHALL share one project-local `.agents/skills` tree and one ResearchSpec marker.

#### Scenario: Shared target is written once
- **WHEN** both Codex and `agents` are selected
- **THEN** one `.agents/skills` tree and one ownership marker SHALL be planned
- **AND** removing either selection SHALL preserve the shared Skill files while the other remains selected

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

ResearchSpec SHALL validate each installation target against its scope, owner, source namespace and registered tool or Adapter destination before reading target contents as ownership evidence. Project targets SHALL be canonical nonempty POSIX relative file paths without traversal, absolute paths, drive prefixes, backslashes, NUL or empty segments. Framework and plugin profiles SHALL target the corresponding researchspec/profiles/<profile_id>.yaml. Agent resources SHALL remain inside the corresponding tool and source package namespace; commands, markers and project-entry instruction files or regions SHALL use their registered destinations. Shared-global Agent targets SHALL be unsupported and rejected before their files are read or removed.

#### Scenario: Matching hash does not authorize an escaped target
- **WHEN** a manifest claims a project-external path or a file outside its source namespace with a matching hash
- **THEN** ResearchSpec reports a blocking diagnostic before reading its contents or planning removal
- **AND** the referenced file remains unchanged

#### Scenario: Valid profiles and global Skills remain supported
- **WHEN** a manifest identifies a correctly located framework or plugin profile or a historical shared-global Agent resource
- **THEN** the profile path passes the corresponding target rules
- **AND** the shared-global Agent record is rejected without reading or removing its target

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

### Requirement: Plugin selection and ownership share the projection transaction

Plugin installation, update and uninstall SHALL commit their selected domains, generated files and ownership manifest within one failure-handling boundary, with the manifest committed last. They SHALL validate the config and manifest snapshots used to plan the operation, including unchanged snapshots. Existing ownership, drift and trusted-path protections SHALL apply throughout commit and rollback.

#### Scenario: Planning snapshots change before commit

- **WHEN** config or manifest bytes change after a plugin operation reads them and before its commit preflight
- **THEN** the operation SHALL report a conflict before changing projected files
- **AND** it SHALL preserve the concurrent edits, including when the operation did not plan to rewrite that snapshot

#### Scenario: A plugin commit fails

- **WHEN** a caught commit failure occurs after plugin changes have begun and paths remain safe to restore
- **THEN** projected files, selection and ownership SHALL be restored together to their pre-commit bytes and existence
- **AND** the command SHALL report failure

#### Scenario: A plugin commit succeeds

- **WHEN** the plugin operation succeeds
- **THEN** selected domains, projected files and the final ownership manifest SHALL describe the same committed selection
- **AND** manifest ownership and drift rules SHALL preserve shared and user-modified files

#### Scenario: Transaction guarantees are described

- **WHEN** developer documentation explains plugin consistency
- **THEN** it SHALL distinguish caught-error rollback and snapshot conflict detection from cross-file crash atomicity or cross-process locking

#### Scenario: Only some selected domains are updated

- **WHEN** the user requests an update for a subset of installed domains
- **THEN** the operation SHALL retain the complete selected-domain projection and ownership closure
- **AND** forced refresh SHALL be limited to resources resolved by the requested domains, preserving unrelated user edits

### Requirement: Supported Hosts Receive Managed Native Procedure Profiles

ResearchSpec SHALL install both native Procedure roles by default for the selected `antigravity`, `auggie`, `claude`, `codeartsagent`, `codebuddy`, `codex`, `devin`, `forgecode`, `costrict`, `cursor`, `factory`, `gemini`, `github-copilot`, `iflow`, `junie`, `kilocode`, `kiro`, `vibe`, `oh-my-pi`, `opencode`, `qoder`, `qwen`, `rovodev`, and `trae` adapters. Each profile SHALL use the host's project-local native format, SHALL omit a fixed model unless the host has a documented inherited-model value, and SHALL receive the strongest host-native restriction available against shell use, user questioning, and nested delegation.

#### Scenario: All supported adapters are selected
- **WHEN** installation reconciliation selects all 24 supported adapters
- **THEN** it plans two managed role definitions per adapter
- **AND** Vibe additionally receives one managed prompt body per role
- **AND** the resulting custom-agent installation set contains 50 files

#### Scenario: Unsupported adapter is selected
- **WHEN** a selected adapter is outside the supported set
- **THEN** ResearchSpec installs no custom-agent profile for that adapter
- **AND** its existing Skill or command delivery is unchanged

#### Scenario: A managed profile drifts or becomes obsolete
- **WHEN** update encounters a modified profile or a clean profile that is no longer desired
- **THEN** the existing generated-file drift and safe-retirement rules apply
- **AND** an unmanaged same-path file is preserved as a blocking conflict

### Requirement: Selected hosts receive a persistent writing guard

ResearchSpec SHALL install the complete reviewed Paper Humanizer guard by default for selected reviewed hosts independently of delivery mode. `init/update --paper-humanizer-guard on|off` SHALL persist the preference; omission SHALL preserve it, defaulting to on when absent from a current schema 2 configuration.

#### Scenario: Every prompt receives the guard
- **WHEN** a configured and enabled host processes successive user prompts
- **THEN** its native prompt context or pre-model system channel receives the complete guard on each turn without invoking a Procedure

#### Scenario: A host has no verified protocol
- **WHEN** a selected host has no reviewed guard protocol
- **THEN** no guessed hook is installed and inspection reports the unsupported coverage

### Requirement: Hook ownership preserves user settings

Shared host configuration SHALL retain user settings and hooks. Ownership SHALL cover only ResearchSpec hook entries; the whole-file snapshot SHALL protect writes. Off and deselection SHALL remove only unchanged owned entries. Drifted entries SHALL retain their publisher resources and SHALL be reported as incomplete retirement.

#### Scenario: Unrelated settings change
- **WHEN** user settings change outside an unchanged owned hook entry
- **THEN** update reconciles the entry while preserving those settings

#### Scenario: A managed entry is modified
- **WHEN** off or deselection encounters a modified managed hook
- **THEN** it retains the hook and dependencies with a nonblocking diagnostic and does not report completed removal

### Requirement: Guard delivery is advisory and read-only at runtime

The publisher SHALL read only the shipped guard and the protocol input needed to return context. It SHALL make no model calls, log no prompts, change no workflow state, and continue the request with an empty successful response on failure. Inspection SHALL distinguish installation from host loading and SHALL expose activation prerequisites.

#### Scenario: Guard cannot be read
- **WHEN** the publisher cannot read its guard
- **THEN** it returns the native empty response and exits successfully

#### Scenario: Native subagent context is available
- **WHEN** a reviewed host emits a supported subagent-start event
- **THEN** that subagent receives the same guard without changing model consent or workflow authority
