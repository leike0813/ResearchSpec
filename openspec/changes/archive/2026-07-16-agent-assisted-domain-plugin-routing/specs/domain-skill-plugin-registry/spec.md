## ADDED Requirements

### Requirement: Packaged Skill Discovery Metadata
ResearchSpec SHALL derive each registered Skill's semantic description and entry
SHA-256 directly from its validated packaged `SKILL.md` without changing
Registry Schema 1.

#### Scenario: Compact Skill metadata is requested
- **WHEN** runtime discovery inspects an available domain
- **THEN** each direct and resolved Skill SHALL expose its ID, description,
  dependencies, and entry SHA-256 from the packaged Skill tree
- **AND** the Skill Browser Harness SHALL use the same metadata parser

### Requirement: Read-Only Installed Skill Instructions
ResearchSpec SHALL return an exact read-only instruction packet only for a Skill
in the selected, available, fully projected, hash-clean domain closure.

#### Scenario: Installed Skill is immediately usable
- **WHEN** every configured tool has the complete manifest-owned Skill tree with
  matching hashes
- **THEN** `plugin instructions <skill-id>` SHALL return the exact `SKILL.md`,
  entry hash, resources, domain IDs, projected tools, and advisory boundary
- **AND** it SHALL execute no resource or dependency

#### Scenario: Skill projection is unsafe
- **WHEN** the Skill is unselected, unavailable, missing, unprojected, or drifted
- **THEN** the instruction request SHALL fail with a stable diagnostic
- **AND** saved unavailable snapshots SHALL not authorize invocation
