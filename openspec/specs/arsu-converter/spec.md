## Purpose

Define the developer-only converter that turns the vendored ARS upstream
checkout into ResearchSpec-owned ARSU skill artifacts with deterministic output,
checkout validation, and first-slice ResearchSpec contract compatibility.

## Requirements

### Requirement: Vendored ARS Upstream Source

ResearchSpec SHALL treat `vendor/ars` as the fixed upstream source for ARSU
conversion.

#### Scenario: Converter source path is fixed

- **WHEN** a maintainer runs the ARSU conversion script
- **THEN** the converter SHALL read source files from `vendor/ars`
- **AND** it SHALL NOT require or accept a normal source-directory argument for
  the upstream checkout

#### Scenario: Upstream checkout must exist

- **GIVEN** `vendor/ars` is missing
- **WHEN** a maintainer runs the ARSU conversion script
- **THEN** conversion SHALL fail before writing generated skill output
- **AND** the diagnostic SHALL identify the missing upstream checkout

#### Scenario: Upstream checkout must be git-backed

- **GIVEN** `vendor/ars` is not an initialized git checkout or submodule
- **WHEN** a maintainer runs the ARSU conversion script
- **THEN** conversion SHALL fail before writing generated skill output
- **AND** the diagnostic SHALL identify the invalid checkout state

#### Scenario: Upstream commit is recorded

- **GIVEN** `vendor/ars` is a valid clean checkout
- **WHEN** conversion succeeds
- **THEN** the conversion manifest SHALL record the upstream commit used for
  generation

#### Scenario: Dirty upstream checkout blocks conversion

- **GIVEN** `vendor/ars` has uncommitted changes
- **WHEN** a maintainer runs the ARSU conversion script
- **THEN** conversion SHALL fail before writing generated skill output
- **AND** the diagnostic SHALL explain that dirty upstream state is blocking

### Requirement: Deterministic ARSU Skill Generation

ResearchSpec SHALL generate ARSU-derived skill artifacts from the vendored ARS
source with deterministic structure, copied dependencies, and generated
metadata.

#### Scenario: Required skill groups are generated

- **GIVEN** `vendor/ars` contains the required ARSU skill groups
- **WHEN** conversion succeeds
- **THEN** `skills/arsu` SHALL contain generated directories for
  `deep-research`, `academic-paper`, `academic-paper-reviewer`, and
  `academic-pipeline`
- **AND** each generated group SHALL contain `SKILL.md`

#### Scenario: Missing required skill group blocks conversion

- **GIVEN** a required ARSU skill group is missing from `vendor/ars`
- **WHEN** a maintainer runs the ARSU conversion script
- **THEN** conversion SHALL fail before producing a successful manifest
- **AND** the diagnostic SHALL identify the missing group

#### Scenario: Shared and cross-skill dependencies are copied

- **GIVEN** an upstream skill references shared or cross-skill runtime resources
- **WHEN** conversion succeeds
- **THEN** the required resources SHALL be copied into the generated skill group
- **AND** generated links SHALL point to the copied local resources

#### Scenario: Adapter-only files are excluded

- **GIVEN** upstream contains platform adapter files or development-only files
- **WHEN** conversion succeeds
- **THEN** those files SHALL NOT be copied into `skills/arsu` runtime skill
  groups
- **AND** exclusions SHALL be recorded in the conversion manifest

#### Scenario: Generated output records hashes

- **WHEN** conversion succeeds
- **THEN** the conversion manifest SHALL list generated files with SHA-256
  hashes
- **AND** validation SHALL fail if a listed file no longer matches its recorded
  hash

### Requirement: ResearchSpec Contract Compatibility Injection

ResearchSpec SHALL inject a first compatibility layer into generated ARSU skill
artifacts during conversion.

#### Scenario: Skill entrypoints contain contract preflight guidance

- **WHEN** conversion succeeds
- **THEN** each generated skill group's `SKILL.md` SHALL include a generated
  `Contract Preflight` guidance block
- **AND** the block SHALL instruct wrappers or agents to locate `researchspec/`,
  read workflow and run state, load required contracts, and use registries and
  ledgers for runtime writes

#### Scenario: Compatibility metadata is generated

- **WHEN** conversion succeeds
- **THEN** `skills/arsu/researchspec-contracts.json` SHALL be written
- **AND** it SHALL identify the generated skill groups and their first-slice
  ResearchSpec contract compatibility profile

#### Scenario: Material Passport is not runtime SSOT

- **WHEN** contract compatibility guidance is generated
- **THEN** it SHALL state that ARS Material Passport may be treated as a
  compatibility artifact
- **AND** it SHALL NOT instruct generated skills to use Material Passport as the
  ResearchSpec runtime source of truth

#### Scenario: Full matrix injection is deferred

- **WHEN** conversion injects contract compatibility in this change
- **THEN** it SHALL use a shared preflight and compatibility metadata profile
- **AND** it SHALL NOT require every upstream stage or mode section to be
  rewritten with the full ResearchSpec workflow matrix

### Requirement: Generated Output Safety

ResearchSpec SHALL protect converter-owned generated output from accidental
overwrite or unnoticed drift.

#### Scenario: Missing output is created

- **GIVEN** `skills/arsu` does not exist
- **WHEN** conversion succeeds
- **THEN** the converter SHALL create `skills/arsu`
- **AND** it SHALL write generated skill artifacts and conversion metadata

#### Scenario: Clean generated output may be refreshed

- **GIVEN** `skills/arsu` exists and matches its conversion manifest
- **WHEN** a maintainer runs conversion again
- **THEN** the converter MAY refresh the generated output
- **AND** it SHALL preserve deterministic generated content except for declared
  volatile metadata fields

#### Scenario: Modified generated output is protected

- **GIVEN** `skills/arsu` exists and no longer matches its conversion manifest
- **WHEN** a maintainer runs conversion without an explicit force option
- **THEN** conversion SHALL fail before overwriting the modified output
- **AND** the diagnostic SHALL identify drifted paths

#### Scenario: Force allows regeneration

- **GIVEN** `skills/arsu` exists and has generated-output drift
- **WHEN** a maintainer runs conversion with the explicit force option
- **THEN** the converter MAY replace the generated output
- **AND** the new manifest SHALL reflect the regenerated files

### Requirement: Converter Validation And Diagnostics

ResearchSpec SHALL validate generated ARSU output and distinguish blocking
defects from non-blocking upstream content diagnostics.

#### Scenario: Generated output validation passes

- **GIVEN** conversion succeeds from a valid clean upstream checkout
- **WHEN** the maintainer runs the ARSU generated-output check script
- **THEN** validation SHALL pass
- **AND** it SHALL verify required groups, generated manifests, rewritten links,
  file hashes, and contract compatibility metadata

#### Scenario: Broken generated links are blocking

- **GIVEN** generated skill content contains a local Markdown link that does not
  resolve to a generated file
- **WHEN** validation runs
- **THEN** validation SHALL fail
- **AND** the diagnostic SHALL identify the broken link

#### Scenario: Upstream history markers are non-blocking

- **GIVEN** upstream ARS runtime content contains version, history, changelog,
  issue, or schema-version text
- **WHEN** conversion and validation run
- **THEN** those markers MAY be reported as risk findings or diagnostics
- **AND** they SHALL NOT fail validation solely because they are historical
  markers

### Requirement: Developer-Only Converter Surface

ResearchSpec SHALL expose ARSU conversion as developer tooling rather than as
public user-facing CLI behavior.

#### Scenario: Package scripts expose converter operations

- **WHEN** maintainers inspect package scripts
- **THEN** scripts SHALL include developer entries for ARSU conversion and ARSU
  generated-output validation

#### Scenario: Public CLI help does not expose ARSU maintenance

- **WHEN** a user runs `researchspec --help`
- **THEN** the public command list SHALL NOT include ARSU converter maintenance
  commands

#### Scenario: Converter does not run semantic workflows

- **WHEN** ARSU conversion or validation runs
- **THEN** it SHALL operate only on local files
- **AND** it SHALL NOT execute ARSU research, writing, review, or agentic
  semantic workflows
- **AND** it SHALL NOT call any LLM API

### Requirement: ARSU Contract Anchor Audit Assets

ResearchSpec SHALL maintain audited upstream anchor assets for ARS-native
contract instructions that require future ResearchSpec compatibility
replacement.

#### Scenario: Anchor table records robust replacement targets

- **WHEN** maintainers inspect the ARSU converter anchor assets
- **THEN** `src/arsu-converter/anchors/contract-anchors.json` SHALL list audited
  upstream contract anchors
- **AND** each anchor SHALL identify its source path, owner skill, contract
  category, severity, robust match hints, replacement intent, and future
  template id

#### Scenario: Required anchors are future blocking targets

- **WHEN** an anchor has required severity
- **THEN** it SHALL include a non-empty replacement intent
- **AND** it SHALL include a non-empty future template id
- **AND** it SHALL represent a target that a future matcher should treat as
  blocking if not found

#### Scenario: Anchors do not rely only on line numbers

- **WHEN** anchor assets are validated
- **THEN** validation SHALL fail if an anchor's matching strategy depends only
  on file line numbers
- **AND** anchors SHALL use more robust hints such as headings, stable phrases,
  schema names, or nearby text patterns

#### Scenario: Upstream manifest records audited runtime shape

- **WHEN** maintainers inspect the ARSU converter anchor assets
- **THEN** `src/arsu-converter/anchors/upstream-manifest.json` SHALL record the
  audited `vendor/ars` commit, runtime file tree, frontmatter, heading tree,
  normalized content hashes, and contract-risk keyword hits for audited runtime
  sources

#### Scenario: Anchor validation checks current upstream checkout

- **WHEN** maintainers run the anchor validation script
- **THEN** it SHALL verify that the manifest commit matches
  `git -C vendor/ars rev-parse HEAD`
- **AND** it SHALL verify that manifest paths and normalized hashes match the
  current audited runtime file tree
- **AND** it SHALL verify that anchor source files exist in `vendor/ars`

#### Scenario: Anchor validation is developer-only

- **WHEN** maintainers inspect public `researchspec` CLI help
- **THEN** ARSU anchor audit validation SHALL NOT appear as a public user command
- **AND** anchor validation MAY be exposed through a developer package script

#### Scenario: Anchor audit does not rewrite generated skills

- **WHEN** this anchor audit capability is implemented
- **THEN** it SHALL NOT implement anchor matching
- **AND** it SHALL NOT perform contract text replacement
- **AND** it SHALL NOT regenerate `skills/arsu`
- **AND** it SHALL NOT perform upstream current-only cleanup
