## ADDED Requirements

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
