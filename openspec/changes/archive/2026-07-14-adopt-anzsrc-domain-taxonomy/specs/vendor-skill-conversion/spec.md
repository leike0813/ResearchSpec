## MODIFIED Requirements

### Requirement: Deterministic Vendor Bundle Contract
ResearchSpec SHALL define an internal isolated vendor bundle contract that records immutable vendor identity, admitted Skills, reviewed dependencies, upstream paths, generated files, Skill-level content licenses, and converter version without defining a public converter ABI or owning domain membership.

#### Scenario: Vendor bundle is reproducible
- **WHEN** a vendor converter runs twice against the same clean pinned source and policy inputs
- **THEN** the generated Skill bytes and semantic vendor bundle content SHALL be identical
- **AND** generated timestamps SHALL not affect idempotence comparison

#### Scenario: Vendor converters remain isolated
- **WHEN** one vendor is regenerated
- **THEN** its converter SHALL write only that vendor's bundle and Skill tree
- **AND** it SHALL NOT overwrite another vendor or the source-neutral domain catalog

### Requirement: Vendor Conversion Verification
ResearchSpec SHALL provide ToolUniverse convert, check, and idempotence maintainer commands; a central assembler SHALL validate all vendor bundles against the source-neutral domain catalog and SHALL be the only writer of the production registry.

#### Scenario: Release bundle contains generated assets only
- **WHEN** the npm package is verified
- **THEN** it SHALL contain the assembled registry and generated ToolUniverse Skill trees
- **AND** it SHALL exclude vendor checkouts, audits, test fixtures, taxonomy maintenance inputs, and converter-only source inputs

#### Scenario: Central assembly is deterministic
- **WHEN** unchanged validated vendor bundles and domain catalog are assembled repeatedly
- **THEN** the production registry bytes SHALL remain identical
- **AND** unknown vendor Skills, duplicate Skill IDs, or invalid domain references SHALL block assembly before the registry is replaced
