## Purpose

Define the complete production admission, deterministic source-specific adaptation,
Skill-level license and notice output, and maintainer command contract for
converting the pinned Scientific Agent Skills source into a
ResearchSpec-owned isolated vendor bundle.

## Requirements

### Requirement: Complete Scientific Agent Skills Admission Decisions
ResearchSpec SHALL resolve every top-level v2.72.0 Skill into one evidenced production decision. An admitted Skill SHALL satisfy license, manual security, content, overlap, dependency, resource and domain requirements.

#### Scenario: Candidate admission is evidence governed
- **WHEN** the converter evaluates the 177-Skill audit and manual security policy
- **THEN** each audit record SHALL have one admitted or excluded production decision
- **AND** each required manual review target SHALL have a completed finding-level maintainer decision
- **AND** the generated count SHALL match the reviewed admitted set

#### Scenario: Unresolved decision blocks conversion
- **WHEN** an admission or required manual security decision is missing, pending, stale, contradictory, lacks safe evidence or retains an unresolved blocker
- **THEN** conversion SHALL fail before changing production output

#### Scenario: Cleared security does not erase another blocker
- **WHEN** a manual security decision is `clear` or `clear-with-adaptation` and another admission requirement fails
- **THEN** the security decision SHALL be recorded according to its evidence
- **AND** the Skill SHALL remain excluded for the independent reason

### Requirement: Deterministic Source-Specific Adaptation
The converter SHALL validate the pinned v2.72.0 source, generate vendor-prefixed Open Agent Skills, normalize reviewed entry metadata, preserve reviewed resources and record source file dispositions through static processing.

#### Scenario: Admitted Skill is converted
- **WHEN** an admitted source Skill passes conversion
- **THEN** its generated directory and frontmatter name SHALL use `scientific-agent-skills-<upstream-id>`
- **AND** the generated entry SHALL follow the reviewed metadata, compatibility, environment, description, script disclosure and authority policies
- **AND** the conversion manifest SHALL record copied and excluded source files with their evidence and applicable hashes

#### Scenario: Upstream content remains inert
- **WHEN** conversion, checking, idempotence verification, packaging or installation processes scripts or dependency instructions
- **THEN** ResearchSpec SHALL treat these resources as static data and leave external services, credentials and dependencies untouched

### Requirement: Skill-Level License And Notice Output
Every admitted Scientific Agent Skill SHALL carry a verified applicable content license and a notice identifying the upstream repository, release, revision, source path, adaptation, and explicit resource exclusions.

#### Scenario: License evidence is incomplete
- **WHEN** an admitted decision lacks an applicable license expression, evidence, or available license text
- **THEN** conversion fails rather than applying the vendor root license by assumption

### Requirement: Scientific Agent Skills Maintenance Commands
ResearchSpec SHALL provide convert, check and idempotence maintainer commands using the same immutable policy inputs and generated output contract.

#### Scenario: Generated output is reproducible
- **WHEN** maintainers run check and idempotence against unchanged v2.72.0 inputs
- **THEN** the vendor tree, bundle, manifest, report, central registry and domain availability SHALL match the committed output byte-for-byte

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

### Requirement: Retired Scientific Agent Skills Extension Resources
Extension regeneration SHALL remove previously declared Scientific Agent Skills resources that the successor projection no longer declares.

#### Scenario: A reviewed resource is removed upstream
- **WHEN** the prior catalog declared a resource and the next reviewed projection omits it
- **THEN** the generated extension folder and package SHALL omit that resource
- **AND** files outside the retired declared resources SHALL be preserved unless the successor projection explicitly writes them
