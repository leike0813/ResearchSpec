## ADDED Requirements

### Requirement: Workspace Plugin Selection Contract
ResearchSpec SHALL store optional workspace-level plugin intent as `plugins.selected` in `researchspec/config.yaml`, treating its absence in an older workspace as an empty set without increasing the current workspace schema version.

#### Scenario: Old config has no plugin block
- **WHEN** ResearchSpec reads an otherwise valid workspace config without `plugins`
- **THEN** it SHALL expose an empty selected plugin list
- **AND** existing workspace behavior SHALL remain valid

#### Scenario: Plugin selections are normalized
- **WHEN** configuration is written after plugin lifecycle operations
- **THEN** selected IDs SHALL be unique and deterministic
- **AND** all configured Agent tools SHALL share the same selection

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
