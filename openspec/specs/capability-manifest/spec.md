# capability-manifest Specification

## Purpose
Define version 1 capability packages: atomic, composable research tools with typed roles, first-class
validators, immutable knowledge packs, provenance/licensing and no embedded execution-flow authority.

## Requirements

### Requirement: Capability Manifest Schema Version 1

Every capability package SHALL contain exactly one `manifest.yaml` that parses as capability manifest
schema `"1"`. The manifest SHALL include `schema_version: "1"`, a unique `capability_id`, `title`,
`description`, `class`, `node_kind`, `execution_type`, optional typed `params`, `inputs`, `outputs`,
`validators`, `knowledge_refs`, `gate_policy`, `provenance` and `license`. Extra fields SHALL be
rejected.

#### Scenario: Minimal valid package parses

- **WHEN** a capability package contains a schema-`"1"` manifest with every required field
- **THEN** registry validation accepts the package

#### Scenario: Unknown node kind is rejected

- **WHEN** a manifest declares a `node_kind` outside `producer`, `checker` and `observer`
- **THEN** validation fails with a stable capability-manifest diagnostic

#### Scenario: Duplicate role or validator ID is rejected

- **WHEN** a manifest repeats an input role, output role or validator ID
- **THEN** validation fails and the package is not registered

### Requirement: Capability Registry Resolution

The bundled capability registry SHALL resolve every `capability_id` to exactly one package path,
manifest version and content identity. Registry loading SHALL fail on duplicate IDs, missing manifests,
unknown referenced capabilities or mismatched content hashes.

#### Scenario: Registry is loaded

- **WHEN** the CLI or converter loads the capability registry
- **THEN** every package is structurally valid and exactly one authoritative package exists per ID

#### Scenario: Graph references an unknown capability

- **WHEN** a graph profile references a capability ID absent from the registry
- **THEN** profile validation fails with an unknown-capability diagnostic

### Requirement: Typed Input And Output Roles

Every producer and checker capability SHALL declare unique input and output roles. Each role SHALL
name a versioned schema reference that resolves inside the package or the shared schema registry, a
required flag, and a source policy of `stable_spec`, `handoff`, `node_output` or `parameter` for
inputs. Producer capabilities SHALL declare at least one output role; observer capabilities MAY
declare none.

#### Scenario: Output schema is unresolved

- **WHEN** an output role references a schema ID that is not resolvable
- **THEN** package validation fails and identifies the role and schema ID

#### Scenario: Producer has no output

- **WHEN** a manifest declares `node_kind: producer` with an empty output list
- **THEN** package validation fails

### Requirement: Validators Are First-Class And Deterministic

Every non-advisory rule in a capability `SKILL.md` SHALL be backed by a schema field or by a declared
validator ID. Validator entries SHALL include kind `schema`, `script` or `policy`, a typed
input/output contract, stable error codes, and an explicit interpreter and argument contract for
script validators. Package checking SHALL report `capability_rule_without_validator` for mandatory
prose rules that have no backing artifact.

#### Scenario: Mandatory prose rule lacks a validator

- **WHEN** `SKILL.md` states a mandatory rule that corresponds to no schema field and no declared
  validator
- **THEN** `check capabilities` reports `capability_rule_without_validator`

#### Scenario: Script validator runs outside the engine

- **WHEN** a script validator is invoked
- **THEN** the CLI uses only the declared interpreter and arguments
- **AND** shell interpolation and undeclared arguments are prohibited

#### Scenario: Network validator is unavailable

- **WHEN** a validator declares `network: true` and its service is unavailable
- **THEN** it returns the declared degraded verdict such as `unresolvable`
- **AND** that verdict SHALL NOT satisfy a pass-required Gate

### Requirement: Knowledge Packs Are Immutable And Referenced

Knowledge files inside a capability package SHALL be immutable referenced assets with a knowledge ID,
relative path, content hash and license. `SKILL.md` SHALL reference knowledge by ID and SHALL NOT
inline a divergent copy of the same mandatory standard.

#### Scenario: Knowledge pack drifts

- **WHEN** a packaged knowledge file differs from its manifest content hash
- **THEN** package validation fails with a knowledge-drift diagnostic

#### Scenario: Inlined divergent standard

- **WHEN** `SKILL.md` embeds a mandatory rubric that also exists as a knowledge pack with different
  wording
- **THEN** package checking SHALL flag the duplication for single-sourcing

### Requirement: No Embedded Flow Authority

A capability `SKILL.md` SHALL contain only the procedure for its own node and SHALL end with an
instruction to submit outputs and return control to ResearchSpec. It SHALL NOT instruct the Agent to
choose, start or advance another node, phase, mode or run.

#### Scenario: Skill names a next phase

- **WHEN** a generated capability `SKILL.md` instructs the Agent to continue to another phase or
  invoke another agent as a workflow step
- **THEN** authoring validation fails with a flow-authority-in-skill diagnostic

#### Scenario: Skill completes

- **WHEN** the current node procedure finishes
- **THEN** the Skill directs the Agent to report the declared outputs and consult `researchspec status`
  for the next legal action

### Requirement: Variants Are Parameterized Data

Capabilities that share one procedure and differ only by target template or perspective SHALL be one
package with typed parameter presets. The closed parameter values SHALL be data in `params` or
referenced preset files, not cloned `SKILL.md` files.

#### Scenario: Drafting templates are presets

- **WHEN** manuscript drafting and report compilation are authored
- **THEN** one drafting capability exists and `document_template` is a schema-bound parameter
- **AND** adding a document template does not clone the Skill

#### Scenario: Review perspectives are presets

- **WHEN** specialist review is authored
- **THEN** one specialist-review capability exists with `reviewer_perspective` values `R1`, `R2` and
  `R3`
- **AND** each perspective references its own rubric knowledge pack

### Requirement: Provenance And Licensing Are Mandatory

Every capability package SHALL record extraction-artifact IDs, upstream source path and line range,
content hashes and the license of each included material. ARS-derived capability procedures and
knowledge packs SHALL retain the applicable upstream license and attribution in the package `NOTICE`
and manifest provenance.

#### Scenario: ARS-derived package lacks provenance

- **WHEN** an authored package contains ARS-derived material without an extraction-artifact reference
  and license record
- **THEN** package validation fails with a provenance-required diagnostic

#### Scenario: Provenance resolves to verified extraction

- **WHEN** a manifest references an extraction-artifact ID
- **THEN** the extraction index resolves that ID and records a passing SHA-256 verification against
  the pinned upstream snapshot
