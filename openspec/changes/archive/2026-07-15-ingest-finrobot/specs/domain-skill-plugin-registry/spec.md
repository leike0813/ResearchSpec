## ADDED Requirements

### Requirement: Reviewed FinRobot Vendor SHALL Be The Fourth Vendor
Registry Schema 1 SHALL represent the approved FinRobot
`snapshot-297a8d2` bundle as an isolated fourth vendor with six globally unique
neutral Skill IDs, immutable provenance, empty hard-dependency arrays,
advisory-only relations, and explicit source-neutral domain memberships.

#### Scenario: Four-vendor registry is assembled
- **WHEN** the central assembler loads all published bundles
- **THEN** vendors appear in stable dictionary order as FinRobot, Materials,
  Scientific Agent Skills, and ToolUniverse
- **AND** exactly six FinRobot Skills are reachable from reviewed domains
- **AND** no excluded source surface or hard dependency appears

#### Scenario: Domain collection is projected
- **WHEN** a user installs a reviewed finance domain
- **THEN** membership projects the approved independent Skills
- **AND** advisory Skill relationships do not change installation closure
