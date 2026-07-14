## ADDED Requirements

### Requirement: Complete Scientific Agent Skills Admission Decisions
ResearchSpec SHALL resolve every top-level Scientific Agent Skills v2.53.0 Skill into exactly one evidenced production admission decision, and SHALL generate only candidates whose license, static security, content, overlap, dependency, resource, and domain decisions are complete and passing.

#### Scenario: Candidate admission is evidence governed
- **WHEN** the converter evaluates the pinned 147-Skill audit
- **THEN** every record has exactly one admitted or excluded decision
- **AND** aggregate readiness labels alone do not grant admission
- **AND** the final generated count equals the reviewed admitted set

#### Scenario: Unresolved decision blocks conversion
- **WHEN** a decision is missing, stale, contradictory, lacks safe evidence, or retains an unresolved blocker
- **THEN** conversion fails before changing production output

### Requirement: Deterministic Source-Specific Adaptation
The Scientific Agent Skills converter SHALL validate the pinned v2.53.0 source, generate vendor-prefixed Open Agent Skills, normalize reviewed entry metadata, preserve reviewed resources, and record every source file disposition without executing upstream content.

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
- **WHEN** maintainers run check and idempotence against unchanged v2.53.0 inputs
- **THEN** the vendor tree, bundle, manifest, report, central registry, and domain availability match the committed output byte-for-byte
