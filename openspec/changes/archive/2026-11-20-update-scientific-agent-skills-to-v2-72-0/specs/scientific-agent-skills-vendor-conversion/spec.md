## MODIFIED Requirements

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

### Requirement: Scientific Agent Skills Maintenance Commands
ResearchSpec SHALL provide convert, check and idempotence maintainer commands using the same immutable policy inputs and generated output contract.

#### Scenario: Generated output is reproducible
- **WHEN** maintainers run check and idempotence against unchanged v2.72.0 inputs
- **THEN** the vendor tree, bundle, manifest, report, central registry and domain availability SHALL match the committed output byte-for-byte

## ADDED Requirements

### Requirement: Retired Scientific Agent Skills Extension Resources
Extension regeneration SHALL remove previously declared Scientific Agent Skills resources that the successor projection no longer declares.

#### Scenario: A reviewed resource is removed upstream
- **WHEN** the prior catalog declared a resource and the next reviewed projection omits it
- **THEN** the generated extension folder and package SHALL omit that resource
- **AND** files outside the retired declared resources SHALL be preserved unless the successor projection explicitly writes them
