## MODIFIED Requirements

### Requirement: Exhaustive Source File Disposition
The converter SHALL require exactly one `adapted` or `excluded` decision for
each of the 24 source files under admitted Skill roots and SHALL reject missing,
duplicate, stale, out-of-scope, or unresolved decisions. Every adapted source
SHALL name one or more complete authored-tree output paths, and every path SHALL
be represented in the corresponding generated derivation record.

#### Scenario: Reviewed source files inform complete trees
- **WHEN** an admitted Skill is rendered
- **THEN** every source hash matches the immutable snapshot
- **AND** adapted sources resolve to reviewed authored outputs
- **AND** excluded sources are absent with an evidenced reason

#### Scenario: Source coverage drifts
- **WHEN** a source hash changes, an output path is missing, or a source record is unclassified
- **THEN** conversion fails without applying an implicit semantic rewrite

### Requirement: Reviewed Relationship And Resource Boundaries
ResearchSpec SHALL preserve all seven audited Skill relationships as advisory or
source-excluded and SHALL classify every external software, model, dataset,
service, documentation set, and compute environment as `preconfigured`,
`reference-only`, or `removed`. Every advertised execution surface SHALL also
resolve to a concrete user-configured external-tool contract in the complete
Skill tree; none SHALL create a Registry Schema 1 hard dependency or automatic
provisioning action.

#### Scenario: Advisory relationship is generated
- **WHEN** an admitted Skill mentions another audited capability
- **THEN** the relationship remains optional guidance
- **AND** its generated dependency list remains empty

#### Scenario: External resource or tool is needed
- **WHEN** generated guidance relies on software, a model, data, a service, GPU capacity, or an HPC scheduler
- **THEN** the Skill states its configuration, authority, data boundary, expected result, and unavailable-tool recovery
- **AND** ResearchSpec does not install, download, authenticate, compile, contact, or submit work

### Requirement: Source-Bound License And Notice Output
Every admitted generated Skill SHALL contain an MIT `LICENSE`, a `NOTICE.md`
identifying the official repository, `snapshot-fafd3ab`, full revision, source
scope, and adaptation, and a `DERIVATION.json` mapping authored files and
capabilities to reviewed source evidence and implementation mechanisms. External
resources SHALL remain outside the copied-content license conclusion.

#### Scenario: Applicable content license is incomplete
- **WHEN** a Skill cannot form a complete reviewed content-license conclusion
- **THEN** it is excluded and no generated directory is emitted

#### Scenario: Generated attribution is inspected
- **WHEN** an admitted Skill is packaged
- **THEN** its license, notice, and derivation bind every runtime and review file to approved evidence
- **AND** no external software, model, dataset, service, or documentation is copied or relicensed

### Requirement: Safe Curated Skill Content
Generated Skills SHALL be complete current-state non-native Skill trees with
supported frontmatter, coherent links, explicit Agent/external-tool
responsibilities, output and failure behavior, examples, and confirmation
boundaries for remote state, training, GPU, DFT, scheduler, or long-running
operations. A reference SHALL exist only when substantial conditionally read
detail meaningfully saves main-context capacity, SHALL be directly routed from
`SKILL.md`, and SHALL not contain the only copy of a governing constraint or
ordinary decision rule. Trees SHALL exclude credential persistence, private
paths, unreviewed downloads, automatic installation, maintenance instructions,
generic runners and schemas, product UI metadata, and unused resources.

#### Scenario: Generated Skill tree is validated
- **WHEN** `validateNonNativeVendorSkill` checks an admitted tree
- **THEN** the main file contains the first action, ordinary workflow, hard constraints, responsibilities, outputs, failure handling, and examples
- **AND** every capability and optional reference resolves to a concrete documented anchor
- **AND** prohibited authority, portability, maintenance, and unused auxiliary content is absent

#### Scenario: Reference detail is optional
- **WHEN** the ordinary path does not need property, configuration, file-format, or mode-specific detail
- **THEN** the Agent can complete that path from `SKILL.md` without loading a reference

### Requirement: Materials Vendor Maintenance Commands
ResearchSpec SHALL retain the `materials-science-skills-for-llm:convert`,
`materials-science-skills-for-llm:check`, and
`materials-science-skills-for-llm:idempotence` maintainer commands. Converter
version 2 SHALL render only the approved complete authored trees and SHALL stage
all five vendors while committing only the Materials tree, bundle, manifest,
conversion report, and combined registry.

#### Scenario: Materials vendor is regenerated
- **WHEN** a maintainer converts unchanged approved inputs
- **THEN** the Materials outputs and combined registry are deterministic
- **AND** the other four vendor projections remain byte-identical

#### Scenario: Another vendor is regenerated
- **WHEN** another published vendor converter runs with Materials version 2 present
- **THEN** the Materials generated tree, bundle, manifest, and report remain byte-identical
- **AND** the assembled registry retains all five reviewed vendors

## ADDED Requirements

### Requirement: Complete Materials Skills SHALL Use The Lowest Sufficient Thickness
Atomsk SHALL be a Tier 1 baseline Skill with no reference. APEX, DeePTB, DP-GEN,
GPUMD, Phonopy, and Uni-Mol SHALL each be a Tier 2 baseline with exactly one
substantial conditional reference. All seven SHALL map semantic scientific work
to Agent procedures and real execution to explicit external tools, SHALL contain
no bundled scripts or state authority, and SHALL retain their fixed IDs,
memberships, MIT license, empty hard dependencies, and current business scope.

#### Scenario: Complete trees are inspected
- **WHEN** all seven authored trees are rendered
- **THEN** Atomsk contains only its main and distribution/provenance files
- **AND** each Tier 2 tree contains one directly routed context-saving reference
- **AND** no tree contains a script, state store, runner, generic schema, installer, provider client, or product UI metadata

### Requirement: Complete Tree Approval SHALL Gate Production
Production conversion SHALL bind the complete seven-tree aggregate hash, every
per-tree and per-file hash, the immutable audit hash, and converter version 2 in
`review-decision.json`. Approval SHALL apply only to the exact current tree set;
any authored byte change SHALL invalidate the binding and fail conversion until
the recomputed hash is explicitly approved.

#### Scenario: Exact complete tree is approved
- **WHEN** the generated review artifact and review decision record the same current aggregate hash
- **THEN** converter version 2 emits exactly those complete trees
- **AND** the manifest, bundle, report, and registry bind the same approved hash

#### Scenario: Approved bytes drift
- **WHEN** any authored, reference, license, notice, or derivation input changes
- **THEN** complete-tree rendering produces a different aggregate hash
- **AND** production conversion fails before changing generated output
