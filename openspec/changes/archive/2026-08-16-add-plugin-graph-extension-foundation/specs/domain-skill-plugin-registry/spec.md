## ADDED Requirements

### Requirement: Plugin Graph Extension Registry Foundation

ResearchSpec SHALL distribute a schema 1 graph-extension registry under
`skills/plugins/extensions/registry.json` containing a registry version, capability package entries,
graph profile entries, and stable domain assignments. Each capability entry SHALL bind a safe
relative source path and manifest SHA-256; each profile entry SHALL bind a safe relative source path
and profile SHA-256.

#### Scenario: Extension registry is loaded

- **WHEN** the bundled plugin extension registry is loaded
- **THEN** every capability package SHALL parse as capability manifest schema 1 with matching
  capability ID, non-empty `SKILL.md`, and hash-clean knowledge refs
- **AND** every profile SHALL parse as capability graph profile schema 2 with matching profile ID and
  hash
- **AND** every domain assignment SHALL reference only registered capabilities and profiles

#### Scenario: Extension graph references are validated

- **WHEN** a plugin profile references a capability ID
- **THEN** the reference SHALL resolve in the plugin extension registry or the base capability
  registry
- **AND** unknown references SHALL fail registry validation

#### Scenario: Extension IDs avoid collisions

- **WHEN** `check plugins` resolves selected-domain extensions
- **THEN** a plugin extension capability ID SHALL NOT collide with a bundled base capability ID or a
  raw plugin Skill ID
- **AND** collision SHALL be a blocking diagnostic

#### Scenario: Domain discovery exposes extension counts

- **WHEN** `plugin list` or `plugin show` inspects a domain with graph-extension assignments
- **THEN** summary output SHALL expose the assigned capability count and profile count
- **AND** raw advisory Skill counts SHALL remain separate from graph-extension counts
