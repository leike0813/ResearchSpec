## ADDED Requirements

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
