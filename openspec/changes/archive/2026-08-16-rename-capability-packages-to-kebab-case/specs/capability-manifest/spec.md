## ADDED Requirements

### Requirement: Capability IDs Are Kebab-Case Open Agent Skills Names

A capability `capability_id` SHALL be a lowercase kebab-case Open Agent Skills name matching
`^[a-z0-9]+(?:-[a-z0-9]+)*$` with length 1-128. Every bundled capability package SHALL use the same
value as its `SKILL.md` frontmatter `name`, its registry `source_path`, and its package directory
name.

#### Scenario: Bundled registry identity is consistent

- **WHEN** the bundled capability registry loads
- **THEN** every capability ID matches the kebab-case pattern
- **AND** every entry `source_path` equals its capability ID
- **AND** the package directory basename equals the capability ID

#### Scenario: Dotted capability ID is rejected

- **WHEN** a capability manifest declares `capability_id: cap.design.rq`
- **THEN** manifest parsing fails with a kebab-case diagnostic

#### Scenario: Registry source path diverges from capability ID

- **WHEN** a bundled registry entry declares `source_path` different from `capability_id`
- **THEN** registry parsing fails and identifies the source path mismatch
