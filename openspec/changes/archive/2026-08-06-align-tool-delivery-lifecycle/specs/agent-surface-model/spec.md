## ADDED Requirements

### Requirement: Fixed Surface
The public catalog SHALL expose 37 tools, of which 28 have command adapters and the remainder are Skill-only. The command matrix SHALL use current Devin, ZCode, Qwen, CodeArts, Hermes, Rovo Dev, MiniMax, and shared `.agents` paths.

#### Scenario: Capability matrix is exact
- **WHEN** the registry is loaded
- **THEN** it SHALL contain 37 unique IDs and exactly 28 command-backed definitions

### Requirement: Shared Writer
Selecting Codex and `agents` together SHALL generate one shared Skill tree and SHALL not duplicate writes or manifest entries.

#### Scenario: Codex owns the shared projection
- **WHEN** Codex and `agents` are selected for Skill delivery
- **THEN** the planner SHALL emit one physical Skill tree with a ResearchSpec target marker
