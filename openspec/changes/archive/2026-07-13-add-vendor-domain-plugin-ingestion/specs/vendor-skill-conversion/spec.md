## ADDED Requirements

### Requirement: Deterministic Vendor Bundle Contract
ResearchSpec SHALL define an internal vendor bundle contract that records immutable vendor identity, admitted Skills, reviewed dependencies, upstream paths, generated files, and converter version without defining a public converter ABI.

#### Scenario: Vendor bundle is reproducible
- **WHEN** a vendor converter runs twice against the same clean pinned source and policy inputs
- **THEN** the generated Skill bytes and semantic manifest content SHALL be identical
- **AND** generated timestamps SHALL not affect idempotence comparison

### Requirement: ToolUniverse Audit-Governed Admission
The ToolUniverse converter SHALL consume the pinned v1.3.1 audit as its complete admission inventory, generate all 130 candidate Skills, exclude all 20 non-business Skills, and reject new or unclassified upstream entries.

#### Scenario: Pinned inventory is converted
- **WHEN** the pinned ToolUniverse checkout matches the audit revision and inventory
- **THEN** exactly the 130 candidate Skill roots SHALL be generated
- **AND** no excluded Skill SHALL enter a vendor bundle or domain

### Requirement: Reviewed Dependency Extraction
The ToolUniverse converter SHALL extract explicit Skill references with evidence and require each relation to be classified as `required`, `related`, or `routing`; only `required` relations SHALL enter the runtime dependency graph.

#### Scenario: Ambiguous reference does not enlarge installation
- **WHEN** an explicit reference lacks reviewed mandatory prerequisite or delegation evidence
- **THEN** it SHALL be classified as `related` or `routing`
- **AND** it SHALL NOT enter the runtime registry dependency list

### Requirement: Safe Open Agent Skill Adaptation
The converter SHALL normalize admitted Skills to the supported Open Agent Skills contract, apply reviewed frontmatter and progressive-disclosure overrides, classify every source resource, add compatibility and authority guidance, and retain license and notice files.

#### Scenario: Vendor scripts remain inert package assets
- **WHEN** an admitted Skill contains scripts or environment assumptions
- **THEN** required runtime scripts MAY be copied with documented compatibility
- **AND** ResearchSpec SHALL NOT execute scripts, install dependencies, configure credentials, or copy tests, evaluations, environment templates, or maintenance history as runtime assets

### Requirement: Vendor Conversion Verification
ResearchSpec SHALL provide ToolUniverse convert, check, and idempotence maintainer commands and SHALL include generated vendor assets in release verification while excluding the vendor checkout.

#### Scenario: Release bundle contains generated assets only
- **WHEN** the npm package is verified
- **THEN** it SHALL contain the assembled registry and generated ToolUniverse Skill trees
- **AND** it SHALL exclude `vendor/tooluniverse`, test fixtures, and converter-only source inputs
