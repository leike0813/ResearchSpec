## MODIFIED Requirements

### Requirement: Complete Agent Tool Registry

ResearchSpec SHALL provide a single registry for all 36 selectable agent tools supported by the bundled OpenSpec 1.5.0 reference.

#### Scenario: All selects every registered tool

- **WHEN** a user supplies `--tools all`
- **THEN** the selection SHALL include exactly `amazon-q`, `antigravity`, `auggie`, `bob`, `claude`, `cline`, `codeartsagent`, `codex`, `devin`, `forgecode`, `codebuddy`, `continue`, `costrict`, `crush`, `cursor`, `factory`, `gemini`, `github-copilot`, `hermes`, `iflow`, `junie`, `kilocode`, `kimi`, `kiro`, `lingma`, `vibe`, `oh-my-pi`, `opencode`, `pi`, `qoder`, `qwen`, `rovodev`, `roocode`, `trae`, `zcode`, and `agents`; `windsurf` resolves to `devin`

#### Scenario: Tool expressions are validated

- **WHEN** a user supplies a comma-separated tool expression
- **THEN** IDs SHALL be normalized and deduplicated
- **AND** `all` or `none` mixed with explicit IDs SHALL return a usage error

### Requirement: Interactive And Detected Selection

Interactive initialization SHALL provide searchable Agent-tool selection followed by optional literature-Adapter selection with catalog-backed guidance.

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

### Requirement: Current Tool Catalog

The catalog SHALL contain exactly 36 current tools, preserve `windsurf` as an alias for `devin`, and describe project Skill roots, legacy Skill roots, detection paths, and command capability from one source of truth.

#### Scenario: Catalog expressions resolve current IDs

- **WHEN** a user selects `windsurf` or `all`
- **THEN** `windsurf` SHALL resolve to `devin` and `all` SHALL resolve to exactly the 36 catalog IDs

### Requirement: Managed installation targets are bounded by their provenance

ResearchSpec SHALL validate each installation target against its scope, owner, source namespace and registered tool or Adapter destination before reading target contents as ownership evidence. Project targets SHALL be canonical nonempty POSIX relative file paths without traversal, absolute paths, drive prefixes, backslashes, NUL or empty segments. Framework and plugin profiles SHALL target the corresponding `researchspec/profiles/<profile_id>.yaml`. Agent resources SHALL remain inside the corresponding tool and source package namespace; commands and markers SHALL use their defined destinations. Shared-global Agent targets SHALL be unsupported and rejected before their files are read or removed.

#### Scenario: Matching hash does not authorize an escaped target

- **WHEN** a manifest claims a project-external path or a file outside its source namespace with a matching hash
- **THEN** ResearchSpec reports a blocking diagnostic before reading its contents or planning removal
- **AND** the referenced file remains unchanged

#### Scenario: Valid profiles and global Skills remain supported

- **WHEN** a manifest identifies a correctly located framework or plugin profile or a historical shared-global Agent resource
- **THEN** the profile path passes the corresponding target rules
- **AND** the shared-global Agent record is rejected without reading or removing its target

## ADDED Requirements

### Requirement: Shared Project Skill Root

Codex and the `agents` target SHALL share one project-local `.agents/skills` tree and one ResearchSpec marker.

#### Scenario: Shared target is written once

- **WHEN** both Codex and `agents` are selected
- **THEN** one `.agents/skills` tree and one ownership marker SHALL be planned
- **AND** removing either selection SHALL preserve the shared Skill files while the other remains selected

## REMOVED Requirements

### Requirement: Shared And Global Skill Roots

**Reason**: MiniMax Code is removed from the current catalog, so no supported tool requires a global Skill root.

**Migration**: Use a supported project-local Agent tool. Existing files under `~/.minimax/skills` remain untouched and user-managed.
