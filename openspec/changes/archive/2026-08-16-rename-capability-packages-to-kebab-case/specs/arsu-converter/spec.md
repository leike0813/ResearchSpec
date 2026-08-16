## ADDED Requirements

### Requirement: Authoring Emits Kebab-Case Package Identities

The authoring converter SHALL derive every generated package directory, registry `source_path`,
manifest `capability_id` and `SKILL.md` frontmatter `name` from one kebab-case capability ID. It
SHALL NOT emit dotted capability package directories or dotted `name` frontmatter values.

#### Scenario: Capability package is authored

- **WHEN** an authoring source declares a kebab-case capability ID
- **THEN** the generated package directory, manifest ID, registry source path and Skill frontmatter
  name are all byte-identical to that ID

#### Scenario: Authoring remains idempotent after rename

- **WHEN** the authoring converter runs twice with kebab-case authoring sources
- **THEN** every generated package byte is identical across runs
