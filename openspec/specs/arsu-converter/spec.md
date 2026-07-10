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

#### Scenario: Semantic replacement profile is declared

- **WHEN** converter output is generated
- **THEN** `skills/arsu/researchspec-contracts.json` SHALL declare anchor
  replacement profile `researchspec-anchor-replacement-v3`
- **AND** it SHALL declare coverage policy `required_and_recommended`
- **AND** it SHALL treat Material Passport content as compatibility artifacts or
  payload projection sources rather than runtime sources of truth

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

### Requirement: ARSU contract anchor replacement

The converter SHALL replace audited ARS-native contract instructions through
stable occurrence-level anchors and complete one-to-one ResearchSpec Markdown
replacement bodies.

#### Scenario: Match evidence and replacement scope are separate

- **GIVEN** an anchor has severity `required` or `recommended`
- **WHEN** maintainers validate anchor assets
- **THEN** the anchor SHALL declare unique ordered start and end snippets for
  the complete replacement span
- **AND** match evidence SHALL remain separate from explicit replacement
  boundaries
- **AND** semantic role, ResearchSpec targets, and replacement shape SHALL be
  declared by that individual anchor record

#### Scenario: Anchors have stable domain identities

- **WHEN** maintainers validate anchor assets
- **THEN** every anchor SHALL have one globally unique `<DOMAIN>-NNN` id from the
  registered domain set
- **AND** an allocated id SHALL NOT be renumbered or reused
- **AND** runtime HTML markers SHALL use that id directly without a second hash
  alias

#### Scenario: Replaceable anchors own dedicated bodies

- **GIVEN** an anchor has severity `required` or `recommended`
- **WHEN** maintainers validate anchor assets
- **THEN** exactly one Markdown replacement body SHALL exist at the path derived
  from its stable id
- **AND** that body SHALL NOT be shared with another anchor, empty, orphaned,
  marker-containing, or byte-identical to another complete replacement body
- **AND** renderer-injected semantic headings, shared prose macros, and common
  mutation sections SHALL NOT be required

#### Scenario: High-risk runtime surfaces have coverage decisions

- **WHEN** maintainers validate anchor assets
- **THEN** every detected high-risk runtime-contract occurrence SHALL be covered
  by a replacement anchor, diagnostic anchor, or explicit retain decision
- **AND** uncovered occurrences SHALL fail anchor validation

#### Scenario: Diagnostic anchors remain report-only

- **GIVEN** an anchor has severity `diagnostic`
- **WHEN** conversion runs
- **THEN** conversion SHALL NOT require or emit a replacement body for that
  anchor
- **AND** its stable id and match status SHALL remain visible in the human report

#### Scenario: Assets are validated before generated output is overwritten

- **GIVEN** `vendor/ars` is a valid clean upstream checkout
- **WHEN** a maintainer runs ARSU conversion
- **THEN** the converter SHALL validate coverage, match all blocking anchors,
  and preload all dedicated bodies before deleting or overwriting `skills/arsu`
- **AND** any anchor, body, or matching failure SHALL abort before generated
  output is touched

#### Scenario: Matcher uses robust hints

- **WHEN** the converter matches an anchor
- **THEN** it SHALL use the anchor source path plus robust hints such as
  headings, whitespace-tolerant snippets, and case-insensitive keywords
- **AND** it SHALL NOT depend on source line numbers for matching
- **AND** ambiguous, missing, reversed, or overlapping replacement spans SHALL
  block conversion

#### Scenario: Required and recommended anchors are blocking

- **GIVEN** an anchor has severity `required` or `recommended`
- **WHEN** the converter cannot match that anchor in `vendor/ars`
- **THEN** conversion SHALL fail before writing generated output
- **AND** the diagnostic SHALL identify the stable anchor id and source path

#### Scenario: Matched anchors render exact dedicated bodies

- **GIVEN** a `required` or `recommended` anchor is matched
- **WHEN** the converter writes a generated text file
- **THEN** the complete inclusive start/end span SHALL be replaced with that
  anchor's dedicated Markdown body
- **AND** the converter SHALL add only the paired stable-id markers and required
  line-ending normalization
- **AND** it SHALL NOT compose or append semantic prose
- **AND** the replacement SHALL preserve the original LF or CRLF boundary

#### Scenario: Replacement instructions respect mutation ownership

- **WHEN** an individual replacement body describes ResearchSpec writes
- **THEN** stable spec changes SHALL use an accepted contract patch or direct
  human edit
- **AND** artifact registry and state writes SHALL be assigned to runtime helpers
- **AND** decision ledger writes SHALL require a human-confirmed decision
- **AND** gate ledger writes SHALL be assigned to validators or gate helpers
- **AND** a body without write semantics SHALL NOT receive an unrelated generic
  mutation section

#### Scenario: Replacement results record full maintenance metadata

- **WHEN** conversion succeeds
- **THEN** `skills/arsu/conversion-manifest.json` SHALL record stable anchor id,
  anchor name, semantic role, ResearchSpec targets, replacement shape,
  replacement-body hash, before hash, and after hash for every replaceable anchor
- **AND** those maintenance fields SHALL NOT be duplicated in runtime markers
- **AND** `skills/arsu/conversion-report.md` SHALL summarize one-to-one replacement
  coverage

#### Scenario: Human-readable replacement report is generated

- **WHEN** conversion succeeds
- **THEN** `skills/arsu/anchor-replacement-report.md` SHALL list every replaced
  anchor with metadata, generated output paths, diagnostics, complete before
  text, and complete after text
- **AND** it SHALL list diagnostic-only anchors separately without an after block

#### Scenario: Generated output validation checks local replacement blocks

- **WHEN** maintainers run generated-output validation
- **THEN** validation SHALL extract and verify the exact stable-id marker block
  for each replacement record
- **AND** the block body SHALL equal the dedicated Markdown asset after declared
  normalization
- **AND** declared target checks SHALL apply to that block rather than the entire
  output file
- **AND** validation SHALL reject malformed marker boundaries, unknown ids, old
  hash-alias markers, and renderer-injected generic replacement headings

#### Scenario: Idempotence compares semantic manifest content

- **WHEN** maintainers compare current output with a clean regeneration
- **THEN** JSON object key order and explicitly unordered collection order SHALL
  NOT cause drift
- **AND** replacement body, semantic field, stable id, or output hash changes
  SHALL cause drift

#### Scenario: Anchor validation is developer-only

- **WHEN** maintainers inspect public `researchspec` CLI help
- **THEN** ARSU anchor audit validation and replacement SHALL NOT appear as
  public user commands
- **AND** anchor validation MAY be exposed through a developer package script
- **AND** conversion SHALL remain local-file developer tooling with no LLM API
  calls

### Requirement: Generated Skill Submit Handoff

ResearchSpec SHALL generate ARSU contract preflight guidance that consumes generalized runtime instructions and follows the declared automatic/manual submission policy.

#### Scenario: Automatic instance work submits directly

- **WHEN** a generated ARSU Skill completes a candidate whose instructions prove `submission.policy: automatic` and trusted start authorization
- **THEN** guidance SHALL perform Submit dry-run followed by execution bound to the returned exact hash
- **AND** it SHALL query status/check afterward without asking for per-artifact confirmation

#### Scenario: Manual or legacy work uses direct CLI submit

- **WHEN** work instructions are manual, legacy, unconfigured or lack trusted authorization
- **THEN** guidance SHALL present the direct `researchspec submit` dry-run and
  confirmation boundary or report that registration cannot proceed
- **AND** it SHALL NOT invoke a Submit Companion or invent automatic authority,
  paths, provenance, or runtime writes

#### Scenario: Converter remains deterministic

- **WHEN** preflight guidance changes
- **THEN** converter regeneration, validation, manifest hashes and idempotence SHALL remain authoritative
- **AND** generated Skill trees SHALL not be hand-edited

### Requirement: Converter-Owned Routing Catalog Projection
The ARSU converter SHALL generate, register, validate, and report the canonical routing catalog and its Skill-description projections.

#### Scenario: Routing catalog JSON is generated
- **WHEN** conversion succeeds
- **THEN** `skills/arsu/routing-catalog.json` SHALL contain the canonical typed catalog with stable formatting
- **AND** the conversion manifest SHALL register its path, identity, metadata, and SHA-256

#### Scenario: Catalog appears in the conversion report
- **WHEN** a conversion report is rendered
- **THEN** it SHALL show the routing catalog path, catalog ID, Skill count, and route counts

#### Scenario: Generated routing projection is validated
- **WHEN** generated-output validation runs
- **THEN** it SHALL validate the routing JSON against the strict Schema and canonical source
- **AND** it SHALL verify every generated Skill description equals its catalog projection
- **AND** missing, malformed, unregistered, hash-drifted, or mismatched output SHALL fail validation

### Requirement: Generated Full Runtime Preflight

ResearchSpec SHALL generate ARSU contract preflight guidance that consumes subflow, work, Gate and transition frontier without duplicating control-plane semantics.

#### Scenario: Generated Skill encounters a Gate

- **WHEN** status exposes a formal Gate selector
- **THEN** generated guidance SHALL route semantic verification through Verify, require human confirmation and use `submit gate:` rather than editing the ledger

#### Scenario: Generated Skill encounters transitions

- **WHEN** status exposes one authorized transition or multiple branch candidates
- **THEN** guidance SHALL respectively use receipt-bound Advance or route the choice through Decide

#### Scenario: Converter output remains authoritative

- **WHEN** preflight guidance changes
- **THEN** converter regeneration, manifest hashes, validation and idempotence SHALL remain the generated-file source of truth

### Requirement: Converter generates the universal runtime profile
The converter SHALL generate a marked runtime projection from its workflow and artifact catalogs and SHALL fail check mode when the projection differs from source data.

#### Scenario: Workflow source changes without regeneration
- **WHEN** converter check detects a stale runtime projection or generated guidance
- **THEN** it reports drift and exits unsuccessfully without rewriting in check mode

### Requirement: Converter cross-validates routing and workflow catalogs
The converter SHALL reject missing, duplicate, unknown, owner-mismatched, artifact-incomplete, or Gate-inconsistent external route templates.

#### Scenario: External template coverage is duplicated
- **WHEN** two complete external templates claim the same operational route
- **THEN** conversion validation fails with that route identified

### Requirement: Generated guidance follows the runtime frontier
Generated Skill instructions SHALL direct Agents to dispatch only selectors returned by the CLI and SHALL describe delegated child starts, explicit branch Decisions, formal Gate confirmation, and dynamic revision rounds.

#### Scenario: Another revision is requested
- **WHEN** generated pipeline guidance handles a revision branch after re-review
- **THEN** it directs the Agent to use the next CLI-provided round selector rather than inventing or limiting a round number
