# materials-science-skills-for-llm-vendor-conversion Specification

## Purpose

Define the non-executing, evidence-bound converter that transforms the pinned
Materials-Science-Skills-For-LLM audit into reviewed generated Skills, vendor
bundle, manifest, conversion report, and combined registry entries.

## Requirements

### Requirement: Complete Materials-Science-Skills Admission Decisions
ResearchSpec SHALL resolve each of the twelve `snapshot-fafd3ab` audit records into exactly one evidenced production decision, SHALL admit exactly seven reviewed Skills, SHALL exclude exactly five reviewed Skills, and SHALL generate IDs as `materials-science-skills-<upstream-id>` only for admitted records.

#### Scenario: Complete admission inventory is evaluated
- **WHEN** the converter validates the pinned audit and production admission catalog
- **THEN** every audit record has exactly one admitted or excluded decision
- **AND** the admitted set contains APEX alloy workflows, Atomsk CLI, DeePTB helper, DP-GEN workflow, GPUMD workflow, Phonopy workflows, and Uni-Mol operations
- **AND** ASE, CMS scripts, DeePMD-kit, pymatgen usage, and Slurm workload manager are unreachable from generated output and the registry

#### Scenario: A production gate is unresolved
- **WHEN** a record lacks a complete license, content, permission, overlap, file, resource, or domain decision
- **THEN** conversion fails before changing generated output

### Requirement: Exhaustive Source File Disposition
The converter SHALL require exactly one `copy`, `curate`, or `exclude` decision for each of the 24 source files under admitted Skill roots and SHALL reject missing, duplicate, stale, or out-of-scope file decisions.

#### Scenario: Reviewed source files are converted
- **WHEN** an admitted Skill is processed
- **THEN** copied files match their recorded source hashes
- **AND** excluded files are absent with a reviewed reason
- **AND** curated files are replaced only by their declared version-controlled assets bound to the reviewed source hash

#### Scenario: Curated input drifts
- **WHEN** a source hash no longer matches or a replacement asset is absent
- **THEN** conversion fails without applying an implicit semantic rewrite

### Requirement: Reviewed Relationship And Resource Boundaries
ResearchSpec SHALL resolve all seven audited Skill relationships as advisory or source-excluded and SHALL classify every external software, model, dataset, service, documentation set, and compute environment as `preconfigured`, `reference-only`, or `removed`; none SHALL create a Registry Schema 1 hard dependency or automatic provisioning action.

#### Scenario: Advisory relationship is generated
- **WHEN** an admitted Skill mentions another audited capability
- **THEN** the relationship remains optional guidance
- **AND** its generated dependency list remains empty

#### Scenario: External resource is needed
- **WHEN** generated guidance relies on software, a model, data, a service, GPU capacity, or an HPC scheduler
- **THEN** the Skill requires the user to provide and approve the resource according to its reviewed classification
- **AND** ResearchSpec does not install, download, configure credentials, access the service, compile software, or submit work

### Requirement: Source-Bound License And Notice Output
Every admitted generated Skill SHALL contain an MIT `LICENSE` and a `NOTICE.md` identifying the official repository, `snapshot-fafd3ab`, full revision, source path, and adaptation; external resources SHALL remain outside the copied-content license conclusion.

#### Scenario: Applicable content license is incomplete
- **WHEN** a Skill cannot form a complete reviewed content-license conclusion
- **THEN** it is excluded and no generated directory is emitted

#### Scenario: Generated attribution is inspected
- **WHEN** an admitted Skill is packaged
- **THEN** its license and notice bind the generated content to the reviewed source and adaptations
- **AND** no external software, model, dataset, service, or documentation is copied or relicensed

### Requirement: Safe Curated Skill Content
Generated Skills SHALL have valid supported frontmatter, compatibility guidance, coherent internal links, and explicit confirmation boundaries for remote state, training, GPU, DFT, scheduler, or long-running operations, and SHALL exclude credential persistence, private absolute paths, unreviewed download endpoints, automatic installation, and upstream development-maintenance instructions.

#### Scenario: Generated Skill tree is validated
- **WHEN** converter checking inspects an admitted tree
- **THEN** frontmatter names equal generated IDs and every local link resolves
- **AND** prohibited authority, portability, and maintenance content is absent

### Requirement: Materials Vendor Maintenance Commands
ResearchSpec SHALL provide `materials-science-skills-for-llm:convert`, `materials-science-skills-for-llm:check`, and `materials-science-skills-for-llm:idempotence` maintainer commands that generate and verify the vendor tree, bundle, manifest, conversion report, and combined registry through complete multi-vendor staging.

#### Scenario: Materials vendor is regenerated
- **WHEN** a maintainer converts unchanged pinned inputs
- **THEN** the Materials outputs and combined registry are deterministic
- **AND** Scientific Agent Skills and ToolUniverse generated files remain byte-identical

#### Scenario: Another vendor is regenerated
- **WHEN** either existing vendor converter runs with the Materials vendor published
- **THEN** the Materials generated tree, bundle, manifest, and report remain byte-identical
- **AND** the assembled registry still contains all three reviewed vendors
