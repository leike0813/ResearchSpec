## MODIFIED Requirements

### Requirement: ToolUniverse Audit-Governed Admission
The ToolUniverse converter SHALL consume the audit selected by the maintenance catalog as its complete admission inventory, generate every admitted Skill, exclude every other recorded entry, and reject new or unclassified upstream entries.

#### Scenario: Pinned inventory is converted
- **WHEN** the pinned ToolUniverse checkout matches the audited revision and inventory
- **THEN** exactly the 130 admitted Skill roots SHALL be generated
- **AND** every excluded entry SHALL be absent from the vendor bundle and every domain

#### Scenario: Inventory checks follow evidence rather than historical counts
- **WHEN** the converter validates the audit and its policies
- **THEN** admitted and excluded totals SHALL be derived from the audited records
- **AND** a changed upstream inventory SHALL fail before generated output is modified

#### Scenario: Conversion input is a clean pinned checkout
- **WHEN** the pinned ToolUniverse checkout contains uncommitted changes or a revision that differs from the audited source
- **THEN** conversion SHALL fail without writing production output

### Requirement: Safe Open Agent Skill Adaptation
The converter SHALL normalize admitted Skills to the supported Open Agent Skills contract, apply reviewed frontmatter and progressive-disclosure overrides, classify every source resource, add compatibility and authority guidance, and retain license and notice files.

#### Scenario: Reviewed tool-contract adaptation is applied
- **WHEN** an admitted Skill's published content relies on a tool contract that changed in the pinned release
- **THEN** the converter SHALL apply the reviewed adaptation for that tool family, file and Skill
- **AND** the adapted content SHALL preserve the scientific intent of the reviewed source
- **AND** the applied adaptation SHALL be recorded with the generated file disposition

#### Scenario: Adaptation is deterministic
- **WHEN** the same reviewed content is adapted twice
- **THEN** the result SHALL be byte-identical
- **AND** repeated conversion SHALL NOT compound transformations

#### Scenario: Vendor scripts remain inert package assets
- **WHEN** an admitted Skill contains scripts or environment assumptions
- **THEN** ResearchSpec SHALL NOT execute them, install dependencies, configure credentials or contact services during conversion, checking, packaging or installation

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

#### Scenario: Unaffected generated assets stay byte-stable
- **WHEN** the converter regenerates the projection from unchanged pinned inputs
- **THEN** it SHALL write only files whose content actually changed
- **AND** capabilities, profiles, resources and vendored files outside the affected set SHALL retain their prior bytes and modification state
