## ADDED Requirements

### Requirement: Reviewed Scientific Agent Skills Vendor
Registry Schema 1 SHALL represent the admitted Scientific Agent Skills v2.53.0 bundle as an isolated second vendor with vendor-prefixed global Skill IDs, verified Skill-level licenses, immutable provenance, and reviewed dependency arrays.

#### Scenario: Combined registry is assembled
- **WHEN** the central assembler loads the ToolUniverse and Scientific Agent Skills bundles
- **THEN** every global Skill ID is unique
- **AND** every domain member and dependency resolves to an available generated Skill
- **AND** no excluded or unreviewed Scientific Agent Skill appears in the registry

### Requirement: Domain-Only Multi-Vendor Installation
Scientific Agent Skills SHALL be installable only through existing domain selections, and the resolved installation SHALL deduplicate all transitive required Skills across vendors without adding command wrappers.

#### Scenario: Domain spans vendors
- **WHEN** a user installs a domain containing reviewed Skills from both vendors
- **THEN** every configured Agent tool receives the same dependency-resolved Skill trees
- **AND** the workspace records only the selected domain
- **AND** wrapper count remains fixed at eight on command-capable tools
