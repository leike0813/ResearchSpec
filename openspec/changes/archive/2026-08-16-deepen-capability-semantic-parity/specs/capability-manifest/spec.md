## ADDED Requirements

### Requirement: Capability Maturity Is Declared

Capability manifest schema `"1"` SHALL include an optional `maturity` field whose value is one of
`skeleton`, `operational` or `deprecated`. An unknown maturity value SHALL be rejected. The authoring
converter SHALL emit `operational` only for sources that bind a curated procedure file.

#### Scenario: Operational maturity is recorded

- **WHEN** a capability package is authored from a source with a curated procedure file
- **THEN** its manifest records `maturity: operational`

#### Scenario: Unknown maturity is rejected

- **WHEN** a manifest declares a `maturity` value outside the closed enum
- **THEN** capability manifest parsing fails with a stable schema diagnostic

### Requirement: Operational Packages Carry Substantive Curated Procedures

Every bundled `operational` capability package SHALL contain a `SKILL.md` with a `## Procedure`
section carrying the node-local semantic procedure and a `## Completion` section that submits
declared outputs and returns control to ResearchSpec. The bundled registry SHALL contain no
operational package whose Skill is a thin wrapper around knowledge references.

#### Scenario: Bundled registry is loaded

- **WHEN** the capability registry loads the bundled packages
- **THEN** every registered package is operational
- **AND** every operational package has at least one knowledge reference
- **AND** every operational `SKILL.md` contains `## Procedure`

#### Scenario: Thin operational wrapper is prevented

- **WHEN** a bundled operational package contains only inputs, outputs and knowledge references
  without a curated procedure
- **THEN** the bundled capability regression test fails with a thin-wrapper diagnostic
