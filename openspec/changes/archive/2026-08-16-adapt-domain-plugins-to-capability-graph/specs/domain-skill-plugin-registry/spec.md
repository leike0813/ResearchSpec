## MODIFIED Requirements

### Requirement: Workspace Plugin Lifecycle

Plugin installation, update, and uninstall SHALL operate on the current schema 2 graph workspace.
Selection intent SHALL remain in `config.yaml.plugins.selected`; generated plugin Skill files and
per-domain resolution snapshots SHALL be reconciled through `tool-installation-manifest.json`.
Install and update SHALL use exact domain IDs and generated-file drift protection; explicit
uninstall SHALL fail closed when any scheduled plugin file has user modifications.

#### Scenario: Graph workspace install projects the selected closure

- **WHEN** exact domain IDs are installed in a schema 2 workspace with configured skill-capable tools
- **THEN** every configured tool SHALL receive the sorted union of direct and transitive selected-domain Skills
- **AND** each projected file SHALL be recorded as manifest-owned `domain-skill` evidence
- **AND** the manifest SHALL be committed after the generated files

#### Scenario: Graph init or update synchronizes prior selections

- **WHEN** `init` reconfiguration or `update` changes tool or delivery selection in a workspace with available selected domains
- **THEN** every newly configured skill-capable tool SHALL receive the current selected-domain Skill closure
- **AND** obsolete project-local plugin files SHALL be removed only when hash-clean

#### Scenario: Unavailable selection blocks projection refresh

- **WHEN** `plugin update` or graph init/update encounters a selected domain that is missing or empty
- **THEN** projection refresh SHALL fail with `plugin_unavailable`
- **AND** prior plugin files and the last resolution snapshot SHALL be preserved

#### Scenario: Explicit uninstall contains drift

- **WHEN** `plugin uninstall` would remove a manifest-owned plugin file whose bytes differ from the recorded hash
- **THEN** the uninstall SHALL fail without changing generated files or the workspace selection
- **AND** the modified file SHALL be preserved

### Requirement: Read-Only Installed Skill Instructions

`plugin instructions <skill-id>` SHALL return an exact read-only instruction packet only for a
Skill in the current graph workspace selected-domain closure when the registry entry is available,
every configured skill-capable tool has the complete manifest-owned hash-clean projection, and the
packaged `SKILL.md` matches its validated entry hash.

#### Scenario: Installed graph-workspace Skill is immediately usable

- **WHEN** the selected-domain closure resolves the Skill and every configured skill-capable tool holds the complete projection
- **THEN** the command SHALL return the exact packaged `SKILL.md`, entry SHA-256, resources, providing domain IDs, projected tools, and the advisory authority boundary
- **AND** it SHALL execute no plugin resource or dependency

#### Scenario: Graph-workspace projection is unsafe

- **WHEN** the Skill is unselected, unavailable, missing, unprojected, or drifted
- **THEN** the instruction request SHALL fail with a stable diagnostic
- **AND** no unavailable snapshot SHALL authorize invocation

#### Scenario: Intent is saved without tool projection

- **WHEN** a domain is installed while no skill-capable tool is configured
- **THEN** config and resolution snapshots SHALL be written without Skill files
- **AND** `plugin instructions` SHALL report `plugin_not_projected` until a skill-capable tool receives the projection

### Requirement: Plugin Core Authority Boundary

Domain Skills SHALL remain advisory and SHALL NOT own or directly modify stable specs, graph profiles,
runs, node instances, Gates, Decisions, transitions, or handoffs.

#### Scenario: Plugin helps a capability node

- **WHEN** a selected domain Skill returns semantic assistance while a graph node is being executed
- **THEN** the result SHALL return to the current capability procedure for integration and validation
- **AND** the graph frontier, node state, Gates, and Decisions SHALL remain unchanged
