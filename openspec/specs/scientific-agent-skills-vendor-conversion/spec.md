## Purpose

Define the complete production admission, deterministic source-specific adaptation,
Skill-level license and notice output, and maintainer command contract for
converting the pinned Scientific Agent Skills v2.53.0 vendor into a
ResearchSpec-owned isolated vendor bundle.

## Requirements

### Requirement: Complete Scientific Agent Skills Admission Decisions
ResearchSpec SHALL resolve every top-level Scientific Agent Skills v2.70.0 Skill into exactly one evidenced production admission decision, SHALL require a completed finding-level maintainer decision for every candidate previously carrying `static-security-review-failed`, and SHALL generate only candidates whose license, manual security, content, overlap, dependency, resource, and domain decisions are complete and passing.

#### Scenario: Candidate admission is evidence governed
- **WHEN** the converter evaluates the pinned 167-Skill audit and manual security policy
- **THEN** every audit record has exactly one admitted or excluded production decision
- **AND** all catalogued manual-security targets have one completed finding-level maintainer decision
- **AND** aggregate readiness labels or upstream scanner severities alone do not grant or deny admission
- **AND** the final generated count equals the reviewed admitted set

#### Scenario: Unresolved decision blocks conversion
- **WHEN** an admission or required manual security decision is missing, pending, stale, contradictory, lacks safe evidence, or retains an unresolved blocker
- **THEN** conversion fails before changing production output

#### Scenario: Cleared security does not erase another blocker
- **WHEN** a manual security decision is `clear` or `clear-with-adaptation` but another admission gate fails
- **THEN** the static security failure is reconciled according to the manual evidence
- **AND** the Skill remains excluded for the independent reason

### Requirement: Deterministic Source-Specific Adaptation
The Scientific Agent Skills converter SHALL validate the pinned v2.70.0 source, generate vendor-prefixed Open Agent Skills, normalize reviewed entry metadata, preserve reviewed resources, and record every source file disposition without executing upstream content.

#### Scenario: Admitted Skill is converted
- **WHEN** an admitted source Skill passes conversion
- **THEN** its generated directory and frontmatter name use `scientific-agent-skills-<upstream-id>`
- **AND** platform metadata, compatibility, environment, tool, description, script disclosure, and authority boundaries match the reviewed policies
- **AND** every copied or excluded source file is recorded with evidence and hashes where applicable

#### Scenario: Upstream content remains inert
- **WHEN** conversion, checking, idempotence verification, packaging, or installation processes a Skill containing scripts or dependency instructions
- **THEN** ResearchSpec does not execute the scripts, install dependencies, configure credentials, or contact services

### Requirement: Skill-Level License And Notice Output
Every admitted Scientific Agent Skill SHALL carry a verified applicable content license and a notice identifying the upstream repository, release, revision, source path, adaptation, and explicit resource exclusions.

#### Scenario: License evidence is incomplete
- **WHEN** an admitted decision lacks an applicable license expression, evidence, or available license text
- **THEN** conversion fails rather than applying the vendor root license by assumption

### Requirement: Scientific Agent Skills Maintenance Commands
ResearchSpec SHALL provide convert, check, and idempotence maintainer commands for the Scientific Agent Skills vendor using the same immutable policy inputs and generated output contract.

#### Scenario: Generated output is reproducible
- **WHEN** maintainers run check and idempotence against unchanged v2.70.0 inputs
- **THEN** the vendor tree, bundle, manifest, report, central registry, and domain availability match the committed output byte-for-byte

### Requirement: Approved Manual Curation Boundary
The Scientific Agent Skills converter SHALL apply only maintainer-approved generated entry normalization, compatibility guidance, fixed non-secret configuration, or non-essential resource exclusions when resolving a `clear-with-adaptation` decision, and SHALL NOT maintain rewritten upstream executable business logic.

#### Scenario: Approved resource is removable
- **WHEN** a reviewed risky resource is not required for the coherent Skill capability
- **THEN** the converter may exclude it through the resource policy
- **AND** the manifest and notice record the omission

#### Scenario: Risk requires executable logic changes
- **WHEN** resolving a confirmed risk requires changing Python, shell, or other executable business behavior
- **THEN** the Skill remains failed or deferred for the pinned revision
- **AND** the converter does not embed a local script patch

### Requirement: Atomic Post-Review Reconciliation
Scientific Agent Skills production policy and generated output SHALL remain unchanged while manual decisions are incomplete and SHALL be reconciled as one complete multi-vendor projection after all catalogued decisions are final.

#### Scenario: All manual decisions are complete
- **WHEN** the catalogued target records have validated non-pending decisions
- **THEN** admission, resources, existing domain membership, vendor output, reports, and central registry are regenerated from the completed policy set
- **AND** unchanged ToolUniverse assets remain byte-identical

#### Scenario: Public boundaries remain stable
- **WHEN** newly eligible Scientific Agent Skills are projected
- **THEN** users continue to install existing domains rather than vendors
- **AND** no public command, registry schema version, domain ID, base Skill, Companion Skill, or wrapper is added
