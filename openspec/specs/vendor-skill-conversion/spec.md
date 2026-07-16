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
Each vendor converter SHALL stage its target output together with every unchanged published vendor, validate the complete source-neutral domain catalog through the central assembler, and commit only its own generated vendor outputs plus the assembled registry. The rule SHALL apply to the approved Education Agent Skills sixth vendor.

#### Scenario: Second vendor conversion preserves first vendor
- **WHEN** Scientific Agent Skills is converted or refreshed
- **THEN** ToolUniverse generated files and bundle remain byte-identical
- **AND** the assembled registry contains both reviewed vendors

#### Scenario: First vendor conversion preserves second vendor
- **WHEN** ToolUniverse is converted or refreshed after Scientific Agent Skills admission
- **THEN** Scientific Agent Skills generated files and bundle remain byte-identical
- **AND** central assembly validates all cross-vendor membership and dependencies

#### Scenario: Education Agent Skills is regenerated
- **WHEN** its approved converter commits a staged projection
- **THEN** all five non-target vendor projections remain byte-identical
- **AND** the assembled registry contains all six reviewed vendors

### Requirement: Reviewed Cross-Vendor Dependency Targets
Vendor converters SHALL write only reviewed `required` relationships to the registry graph and SHALL resolve every target to an admitted global Skill ID.

#### Scenario: Required target is unavailable
- **WHEN** a required target is excluded and has no reviewed self-contained adaptation or admitted equivalent
- **THEN** the source Skill is excluded or conversion fails
- **AND** the relationship is not silently downgraded

### Requirement: Non-native vendor Skills SHALL use complete authored instruction trees
ResearchSpec SHALL convert a non-native upstream project through complete vendor-specific Skill trees whose final `SKILL.md` content is authored and reviewed as a unit. Authoring scaffolds MAY guide composition, but a converter SHALL NOT publish runtime instructions assembled from a generic shared contract plus shallow capability fragments.

#### Scenario: Converter prepares a non-native Skill
- **WHEN** a project without a production-ready upstream Skill is proposed for admission
- **THEN** the reviewed input SHALL contain the complete final instruction tree
- **AND** no template placeholder or authoring hint SHALL remain in the generated tree

### Requirement: Main Skill instructions SHALL be execution-complete
Every non-native vendor-derived `SKILL.md` SHALL state purpose and scope, inputs and prerequisites, first action and main workflow, applicable mode or state routing, hard constraints, authority and side effects, LLM and deterministic-tool responsibilities, outputs and completion, failure recovery, and representative success and near-miss or failure behavior.

#### Scenario: Agent loads only the main file
- **WHEN** an Agent begins an ordinary invocation from `SKILL.md`
- **THEN** it SHALL know how to start, execute, complete, and recover without discovering a mandatory rule only in another file

### Requirement: Progressive disclosure SHALL be optional and context-saving
References in a non-native vendor Skill SHALL contain substantial detailed material that is unsuitable for the main context, SHALL be directly linked from `SKILL.md`, and SHALL have an explicit read condition. A reference SHALL NOT contain the sole statement of an execution-critical constraint, authority boundary, output rule, or failure rule.

#### Scenario: Skill includes a reference
- **WHEN** a reviewer follows the reference route from `SKILL.md`
- **THEN** the main file SHALL identify when it is needed
- **AND** omitting the reference during an ordinary path SHALL NOT hide a non-negotiable runtime rule

#### Scenario: Instruction is short and mandatory
- **WHEN** a rule is both concise and required for correct execution
- **THEN** it SHALL be written in `SKILL.md` rather than moved into a reference

### Requirement: Capability claims SHALL map to executable mechanisms
Every advertised non-native vendor capability SHALL have exactly one reviewed primary implementation kind: `agent-procedure`, `bundled-script`, `bundled-resource`, or `external-tool`. The implementation SHALL be present or concretely documented, and the Agent SHALL NOT be expected to invent missing provider, command, resource, or workflow behavior.

#### Scenario: Capability uses an Agent procedure
- **WHEN** semantic Agent work is the complete implementation
- **THEN** `SKILL.md` SHALL provide a concrete procedure, decision boundary, output expectation, and failure path
- **AND** ResearchSpec SHALL NOT require a Python wrapper or machine JSON envelope solely to label the Skill executable

#### Scenario: Capability uses a bundled script
- **WHEN** a deterministic command implements part of the capability
- **THEN** the tree SHALL contain the command
- **AND** `SKILL.md` SHALL state its path, invocation time, command example, input, output or side effect, dependency, and failure handling

#### Scenario: Capability uses a resource or external tool
- **WHEN** execution depends on a bundled resource or user-configured external tool
- **THEN** `SKILL.md` SHALL identify the exact point of use, authority and dependency boundary, expected result, and recovery behavior

### Requirement: Skill thickness SHALL follow a baseline and explicit extensions
Every non-native vendor Skill SHALL satisfy the baseline instruction contract and SHALL add only the `script-assisted`, `stateful`, or `resource-backed` extensions required by its behavior. Stateful extension data SHALL remain Skill-local and SHALL NOT become ResearchSpec workflow authority.

#### Scenario: Skill has no deterministic runtime
- **WHEN** complete Agent procedures are sufficient for execution
- **THEN** the Skill MAY use the baseline without scripts, runner metadata, or machine schemas

#### Scenario: Skill must resume multi-stage work
- **WHEN** later stages depend on persisted Skill-local decisions or artifacts
- **THEN** the stateful extension SHALL define state authority, transitions, gates, resume behavior, and completion
- **AND** ResearchSpec CLI state SHALL remain authoritative for ResearchSpec workflows

### Requirement: Private runner conventions SHALL NOT become implicit project contracts
Non-native vendor authoring SHALL NOT require or advertise `runner.json`, `RUNTIME.json`, generic input/output schemas, or a fixed JSON success and failure envelope unless an explicit ResearchSpec capability introduces and consumes that runtime contract. A schema MAY exist as a script or domain resource only when a bundled consumer and its documented invocation use it.

#### Scenario: Converter includes unconsumed runner files
- **WHEN** a generated tree contains the private runner convention without a ResearchSpec consumer
- **THEN** conformance validation SHALL fail

#### Scenario: Bundled script consumes a domain schema
- **WHEN** the schema is required by a concrete bundled command and the use is documented in `SKILL.md`
- **THEN** the schema MAY be retained as that command's resource
- **AND** it SHALL NOT be described as a universal ResearchSpec Skill protocol

### Requirement: Non-native Skill conformance SHALL combine typed validation and complete-tree review
ResearchSpec SHALL provide a maintainer-only typed definition and validator for non-native vendor Skills. The validator SHALL return stable diagnostic codes for observable contract violations, while production admission SHALL retain hash-bound human review of the complete generated tree for semantic sufficiency, portability, reference placement, dependency honesty, provenance, and safety.

#### Scenario: Maintainer validates a candidate tree
- **WHEN** the tree has duplicate or unsafe paths, missing distribution metadata, missing required main-file sections, unresolved capability mappings, orphan references, undocumented scripts or resources, placeholders, or unsupported runner files
- **THEN** validation SHALL return a deterministic error diagnostic

#### Scenario: Structurally valid prose remains too weak
- **WHEN** automated checks pass but the reviewer cannot execute the advertised capability from the instructions and bundled materials
- **THEN** hash-bound human approval SHALL be withheld

### Requirement: Existing non-native vendors SHALL migrate without implicit readmission
ResearchSpec SHALL record a non-blocking conformance baseline for HistAgent, FinRobot, and Materials-Science-Skills-For-LLM and SHALL migrate them in that order through separately reviewed work. This standard SHALL NOT silently rewrite current trees, admit HistAgent, or make un-migrated production vendors fail global registry or release validation.

#### Scenario: Standard change is completed
- **WHEN** repository validation and release verification run
- **THEN** current production publication SHALL remain unchanged
- **AND** `ingest-histagent` SHALL remain paused pending redesign and renewed complete-tree review
