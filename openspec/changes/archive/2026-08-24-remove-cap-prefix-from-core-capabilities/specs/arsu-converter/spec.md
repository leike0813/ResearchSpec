## MODIFIED Requirements

### Requirement: Authoring Emits Prefix-Free Core Package Identities

The core capability authoring converters SHALL declare `cap-`-free core capability IDs and derive
every generated core package directory, registry `source_path`, manifest `capability_id`, and
`SKILL.md` frontmatter `name` from that prefix-free ID. Generated packaged guidance SHALL reference
the same prefix-free paths.

#### Scenario: Core capability package is authored

- **WHEN** an authoring source declares `<class>-<name>`
- **THEN** the generated core package directory, manifest ID, registry source path, and Skill
  frontmatter name are all byte-identical to that ID

#### Scenario: Authoring remains idempotent after rename

- **WHEN** each authoring converter runs twice with prefix-free core sources
- **THEN** every generated package byte is identical across runs
