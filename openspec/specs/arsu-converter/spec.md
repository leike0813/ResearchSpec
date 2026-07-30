## Purpose

Define the developer-only converter that turns the vendored ARS upstream
checkout into ResearchSpec-owned ARSU skill artifacts with deterministic output,
checkout validation, and ResearchSpec contract integration.
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
source with deterministic structure, copied dependencies, generated metadata,
and the approved offline Better BibTeX adapter closure.

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

#### Scenario: Offline Better BibTeX adapter is copied

- **GIVEN** `academic-pipeline` uses the upstream offline Zotero adapter
- **WHEN** conversion succeeds
- **THEN** it SHALL contain `zotero.py`, `_common.py`, and required package markers
- **AND** generated guidance SHALL state that this path reads user-supplied Better BibTeX JSON rather than live Zotero state

#### Scenario: Other adapter and development files are excluded

- **GIVEN** upstream contains other platform adapter files or development-only files
- **WHEN** conversion succeeds
- **THEN** unapproved files SHALL NOT be copied into `skills/arsu` runtime Skill groups
- **AND** exclusions SHALL be recorded in the conversion manifest

#### Scenario: Generated output records hashes

- **WHEN** conversion succeeds
- **THEN** the conversion manifest SHALL list generated files with SHA-256
  hashes
- **AND** validation SHALL fail if a listed file no longer matches its recorded
  hash

### Requirement: ResearchSpec Contract Integration Injection

ResearchSpec SHALL inject the current contract integration layer into generated ARSU skill
artifacts during conversion.

#### Scenario: Skill entrypoints contain contract preflight guidance

- **WHEN** conversion succeeds
- **THEN** each generated skill group's `SKILL.md` SHALL include a generated
  `Contract Preflight` guidance block
- **AND** the block SHALL instruct wrappers or agents to locate `researchspec/`,
  read workflow and run state, load required contracts, and use registries and
  ledgers for runtime writes

#### Scenario: Integration metadata is generated

- **WHEN** conversion succeeds
- **THEN** `skills/arsu/researchspec-contracts.json` SHALL be written
- **AND** it SHALL identify the generated skill groups and their first-slice
  ResearchSpec contract integration profile

#### Scenario: Semantic replacement profile is declared

- **WHEN** converter output is generated
- **THEN** `skills/arsu/researchspec-contracts.json` SHALL declare anchor
  replacement profile `researchspec-anchor-replacement-v3`
- **AND** it SHALL declare coverage policy `required_and_recommended`
- **AND** it SHALL treat Material Passport content as imported external evidence or
  payload projection sources rather than runtime sources of truth

#### Scenario: Material Passport is not runtime SSOT

- **WHEN** contract integration guidance is generated
- **THEN** it SHALL state that ARS Material Passport may be treated as a
  imported evidence artifact
- **AND** it SHALL NOT instruct generated skills to use Material Passport as the
  ResearchSpec runtime source of truth

#### Scenario: Full matrix injection is deferred

- **WHEN** conversion injects contract integration guidance
- **THEN** it SHALL use a shared preflight and integration metadata profile
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
  file hashes, and contract integration metadata

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

ResearchSpec SHALL generate ARSU contract preflight guidance that consumes
current action descriptors and follows their declared execution policy.

#### Scenario: Automatic instance work submits directly

- **WHEN** a generated ARSU Skill completes a candidate whose instructions prove `submission.policy: automatic` and trusted start authorization
- **THEN** guidance SHALL submit the descriptor's semantic input through the
  declared direct policy without external plan replay
- **AND** it SHALL continue from returned next selectors or a directed check
  without asking for per-artifact confirmation

#### Scenario: Manual work uses direct CLI submit

- **WHEN** work instructions are manual or lack trusted automatic authorization
- **THEN** guidance SHALL present the descriptor-declared human-confirmation
  boundary or report that registration cannot proceed
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

ResearchSpec SHALL generate ARSU contract preflight guidance that consumes the
selector families exposed by the current adaptive or strict frontier without
duplicating control-plane semantics.

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

### Requirement: Converter-Owned ARSU License Projection

The converter SHALL generate deterministic license and attribution files inside every required ARSU Skill root from the authoritative vendored upstream license and canonical ResearchSpec notice projection.

#### Scenario: Required ARSU groups are generated

- **WHEN** conversion succeeds
- **THEN** every required ARSU Skill root SHALL contain the full upstream CC BY-NC 4.0 license and a notice identifying Cheng-I Wu, the upstream repository, the vendored source, and ResearchSpec adaptation
- **AND** the files SHALL be registered with hashes in the conversion manifest

#### Scenario: License projection is missing or drifted

- **WHEN** converter validation or idempotence checks generated output
- **THEN** a missing, malformed, unregistered, or hash-drifted Skill license or notice SHALL fail validation
- **AND** the generated files SHALL NOT be maintained by direct hand edits

### Requirement: Semantic replacements preserve stable behavior boundaries
The converter SHALL preserve stable prohibitions, applicability boundaries, and mode exceptions contained in every replaced blocking anchor span.

#### Scenario: Revision patch replacement preserves the full-mode exception
- **WHEN** the converter replaces the academic-paper revision patch protocol
- **THEN** the generated revision-mode guidance SHALL use ResearchSpec draft-patch contracts
- **AND** it SHALL state that the academic-paper full-mode Phase 6→4 loop does not use the patch protocol and still requires a complete Draft Body

#### Scenario: Phase boundaries use current ResearchSpec authority
- **WHEN** the converter replaces public phase-boundary guidance
- **THEN** the generated entrypoint SHALL preserve single-stage and cross-stage role boundaries and clarification-before-dispatch behavior
- **AND** it SHALL use the configured workflow, current run state, frontier instructions, and declared outputs as authority instead of ARS phase directories, design notes, hooks, or advisory scripts

### Requirement: Public entrypoints contain no unresolved operational repository paths
Generated public ARSU entrypoints SHALL NOT contain unresolved operational code-span references to excluded upstream documentation or root scripts.

#### Scenario: Missing docs or scripts code-span path blocks validation
- **GIVEN** a top-level generated `<skill-group>/SKILL.md` contains a code span beginning with `docs/` or `scripts/`
- **AND** the referenced path does not resolve inside that generated skill group
- **WHEN** generated-output validation runs
- **THEN** validation SHALL fail and identify the entrypoint and unresolved path

#### Scenario: Nested upstream history remains non-blocking
- **GIVEN** an ARSU-derived nested reference or agent file contains upstream historical path text
- **WHEN** generated-output validation runs
- **THEN** that text SHALL NOT fail validation solely because it is historical or is outside the public entrypoint

### Requirement: Cross-skill entry copies share semantic replacements
The converter SHALL apply source-path anchor replacements to public entrypoints and every copied cross-skill instance of the same upstream entry file.

#### Scenario: Cross-skill copy receives anchor replacement without public projection
- **WHEN** an upstream `SKILL.md` is copied as a cross-skill dependency
- **THEN** every applicable anchor replacement SHALL appear in that copy and its output path SHALL be recorded in the conversion manifest
- **AND** the copy SHALL retain its upstream description and SHALL NOT receive a duplicate Contract Preflight

### Requirement: Current Contract Integration Metadata
The converter SHALL describe the current adaptive-default ResearchSpec contract
integration and the bounded Schema `0.2` strict compatibility path. ARS Material
Passport evidence import SHALL remain one-way and strict-compatibility-only.

#### Scenario: Generated output is inspected
- **WHEN** conversion completes
- **THEN** metadata and generated guidance SHALL distinguish adaptive-default and
  strict compatibility operation and SHALL not offer Passport export as runtime
  state authority

#### Scenario: Upstream history is retained
- **WHEN** vendored source or audit Before text contains historical terminology
- **THEN** conversion SHALL preserve it and SHALL exclude the audit source text from current-guidance risk checks

### Requirement: Generated ARSU Plugin Augmentation Guidance
The ARSU converter SHALL inject one shared current-state plugin augmentation
protocol into all four generated ARSU Skills.

#### Scenario: Expert route bypasses Navigate
- **WHEN** a user directly invokes a supported ARSU Skill or resumes its ready
  work
- **THEN** the generated Skill SHALL still evaluate compact plugin assistance at
  the defined semantic boundaries
- **AND** it SHALL use the same batch consent, installation, helper, and fallback
  rules as Navigate

#### Scenario: Generated guidance preserves producer authority
- **WHEN** an ARSU Skill invokes a plugin helper
- **THEN** the generated guidance SHALL retain the CLI-returned ARSU
  `producer_skill` as candidate owner
- **AND** it SHALL prohibit plugin writes to ResearchSpec state, registries,
  ledgers, Gates, Decisions, transitions, and receipts

### Requirement: Generated Zotero Literature Protocol

ResearchSpec SHALL inject one converter-owned Adapter-native literature protocol
into Deep Research and compatible generated ARSU producers through the shared
contract preflight. The protocol SHALL use the fixed Zotero task Skills as
provider operations and SHALL keep ARSU responsible for academic selection,
verification, coverage and durable artifacts.

#### Scenario: Producer handles ordinary literature work

- **WHEN** a generated producer needs literature and the Adapter is ready
- **THEN** it SHALL query the current Zotero corpus before external gap
  supplementation
- **AND** it SHALL use Acquisition for gap-aware external discovery and live
  duplicate checks

#### Scenario: Deeper source evidence is required

- **WHEN** accepted sources need full text, locators, notes, annotations or
  bounded cross-source context
- **THEN** the producer SHALL preferentially invoke the Analysis or Synthesis
  task Skill that matches the evidence goal
- **AND** it SHALL NOT invoke every Adapter task mechanically

#### Scenario: Query returns no items

- **WHEN** a bounded Zotero query returns an empty result
- **THEN** the generated guidance SHALL prohibit treating that result as proof
  that relevant literature does not exist

#### Scenario: Ordinary adapter use fails

- **WHEN** an ordinary literature task cannot use the Adapter
- **THEN** the producer SHALL use a bounded external or user-supplied fallback
  and disclose the coverage limitation

#### Scenario: Task depends on private Zotero state

- **WHEN** a task explicitly requires a current selection, private collection,
  private metadata, private attachments, library-only or offline behavior and
  the Adapter is unavailable
- **THEN** the producer SHALL pause for readiness or alternative user input
- **AND** it SHALL NOT substitute public search as if it were the private
  library

#### Scenario: Adapter output reaches workflow boundaries

- **WHEN** Adapter-derived material is ready for ResearchSpec use
- **THEN** the producer SHALL consume a provider-neutral handoff as working
  evidence
- **AND** only the active producer and CLI SHALL create accepted artifacts or
  perform workflow authority writes

#### Scenario: Managed-library acquisition is authorized

- **WHEN** the user has granted the current run a bounded collection and
  acquisition-effect authorization
- **THEN** the producer MAY import only screened and accepted items and prepare
  permitted attachments
- **AND** Curation, metadata maintenance, tagging, merging and deletion SHALL
  require a separate request

### Requirement: Generated Adaptive Runtime Preflight

Generated ARSU and Companion entrypoints SHALL consume bounded status and action
descriptors, treat CLI obligations and formal policies as hard authority, and
keep their internal phase ordering as a soft playbook unless the selected
strict profile declares otherwise.

#### Scenario: Generated producer resumes adaptive work

- **WHEN** a producer resumes an adaptive run
- **THEN** it SHALL inspect unsatisfied obligations and allowed actions
- **AND** it SHALL NOT reconstruct a unique workflow frontier from prose or
  maintain an independent stage truth

### Requirement: Generated Revision Emits Canonical Patch

Academic Paper revision guidance SHALL emit the canonical pending patch input
expected by `submit patch:<selector>`.

#### Scenario: Revision reaches a durable boundary

- **WHEN** a generated revision producer has a base-bound text modification
- **THEN** it SHALL submit one canonical patch
- **AND** it SHALL NOT also register an ordinary `revision_patch` artifact for
  the same modification

### Requirement: Generated Preflight Is Dual-Runtime And Descriptor-Driven

The converter SHALL generate one contract-preflight guidance source for all four
ARSU Skills. The generated guidance SHALL obtain runtime mode, allowed actions,
canonical selectors, semantic input templates, execution policy, and next
selectors from CLI status and instructions; it SHALL not reconstruct strict
graph order or caller-authored mechanical payload fields.

#### Scenario: Generated Skill operates in adaptive mode

- **WHEN** an adaptive workspace exposes an `obligation:`, `completion:`,
  `case-action:`, `patch:`, or `change:` descriptor
- **THEN** generated guidance SHALL route durable work through that descriptor
- **AND** it SHALL not require a `work:` or `transition:` selector that the
  adaptive frontier does not expose

#### Scenario: Generated Skill operates in strict mode

- **WHEN** a strict workspace exposes scoped `work:`, `gate:`, or `transition:`
  instructions
- **THEN** generated guidance SHALL retain the strict graph, Gate, branch, and
  delegated-child authority boundaries

### Requirement: Generated Guidance Mirrors Execution Policy

Generated ARSU guidance SHALL describe direct actions as one-invocation semantic
transactions, human-confirmed actions as requiring their named confirmation, and
plan-bound actions as requiring their current approved plan hash. It SHALL
preserve formal Gate, Decision, and high-impact patch/change protections.

#### Scenario: Converter regenerates runtime guidance

- **WHEN** converter output is regenerated and checked
- **THEN** all four generated trees, manifests, and reports SHALL derive from
  the same preflight source and pass deterministic validation and idempotence
- **AND** generated Skill files SHALL not require hand edits

### Requirement: Current dual-runtime generated guidance
The ARSU converter SHALL generate entrypoints and metadata that describe adaptive-default operation and bounded strict compatibility without asserting that compatibility paths are absent.

#### Scenario: Converter regeneration
- **WHEN** maintained runtime guidance changes
- **THEN** generated Skills, contracts manifest, reports, and handbook-derived references SHALL be regenerated through their owning converter and pass drift and idempotence checks

#### Scenario: Portable converter build
- **WHEN** converter and release verification run on the supported Node matrix
- **THEN** executable permission handling SHALL use Node file APIs without depending on a Unix `chmod` command

### Requirement: ARSU Guidance Shares The Annotation Intake Contract
Converter-owned Academic Paper and Pipeline guidance SHALL consume the same
free-form intake, Agent interpretation, Annotation Set submission, and
authority boundary as Navigate without defining a second parser or workflow
stage.

#### Scenario: User enters through an ARSU producer
- **WHEN** a direct Academic Paper or Pipeline request includes unregistered free-form manuscript feedback
- **THEN** generated guidance SHALL complete the shared intake preflight before revision work
- **AND** only a registered Annotation Set SHALL become route prerequisite evidence

#### Scenario: Generated surfaces are checked
- **WHEN** ARSU conversion and idempotence checks run
- **THEN** all generated Skills, manifests, and reports SHALL match the converter-owned intake guidance
