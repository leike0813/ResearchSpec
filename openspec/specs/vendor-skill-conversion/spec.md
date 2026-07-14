## Purpose

Define the deterministic vendor bundle contract, audit-governed admission, dependency extraction, safe adaptation, and verification rules for converting upstream vendor Skill bundles into ResearchSpec-owned assets.

## Requirements

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
ResearchSpec SHALL provide ToolUniverse convert, check, and idempotence maintainer commands; a central assembler SHALL validate all vendor bundles against the source-neutral domain catalog and SHALL be the only writer of the production registry.

#### Scenario: Release bundle contains generated assets only
- **WHEN** the npm package is verified
- **THEN** it SHALL contain the assembled registry and generated ToolUniverse Skill trees
- **AND** it SHALL exclude vendor checkouts, audits, test fixtures, taxonomy maintenance inputs, and converter-only source inputs

#### Scenario: Central assembly is deterministic
- **WHEN** unchanged validated vendor bundles and domain catalog are assembled repeatedly
- **THEN** the production registry bytes SHALL remain identical
- **AND** unknown vendor Skills, duplicate Skill IDs, or invalid domain references SHALL block assembly before the registry is replaced

### Requirement: Complete Multi-Vendor Staging
Each vendor converter SHALL stage its target output together with every unchanged published vendor, validate the complete source-neutral domain catalog through the central assembler, and commit only its own generated vendor outputs plus the assembled registry.

#### Scenario: Second vendor conversion preserves first vendor
- **WHEN** Scientific Agent Skills is converted or refreshed
- **THEN** ToolUniverse generated files and bundle remain byte-identical
- **AND** the assembled registry contains both reviewed vendors

#### Scenario: First vendor conversion preserves second vendor
- **WHEN** ToolUniverse is converted or refreshed after Scientific Agent Skills admission
- **THEN** Scientific Agent Skills generated files and bundle remain byte-identical
- **AND** central assembly validates all cross-vendor membership and dependencies

### Requirement: Reviewed Cross-Vendor Dependency Targets
Vendor converters SHALL write only reviewed `required` relationships to the registry graph and SHALL resolve every target to an admitted global Skill ID.

#### Scenario: Required target is unavailable
- **WHEN** a required target is excluded and has no reviewed self-contained adaptation or admitted equivalent
- **THEN** the source Skill is excluded or conversion fails
- **AND** the relationship is not silently downgraded
