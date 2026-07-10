## MODIFIED Requirements

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
