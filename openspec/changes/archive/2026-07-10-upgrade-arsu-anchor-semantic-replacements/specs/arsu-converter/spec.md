## MODIFIED Requirements

### Requirement: ResearchSpec-compatible generated output

Generated ARSU skill output SHALL be adapted to the ResearchSpec contract runtime
while preserving upstream workflow intent.

#### Scenario: Semantic replacement profile is declared

- **WHEN** converter output is generated
- **THEN** `skills/arsu/researchspec-contracts.json` SHALL declare anchor
  replacement profile `researchspec-anchor-replacement-v2`
- **AND** it SHALL declare coverage policy `required_and_recommended`
- **AND** it SHALL treat Material Passport content as compatibility artifacts or
  payload projection sources rather than runtime sources of truth

### Requirement: ARSU contract anchor replacement

The converter SHALL replace audited ARS-native contract instructions through
robust anchors and semantic ResearchSpec replacement templates.

#### Scenario: Match evidence and replacement scope are separate

- **GIVEN** an anchor has severity `required` or `recommended`
- **WHEN** maintainers validate anchor assets
- **THEN** the anchor SHALL reference a registered `template_id`
- **AND** it SHALL declare unique ordered start and end snippets for the complete
  replacement span
- **AND** semantic role, ResearchSpec targets, and replacement shape SHALL resolve
  from the template registry as their single source of truth

#### Scenario: High-risk runtime surfaces have coverage decisions

- **WHEN** maintainers validate anchor assets
- **THEN** every detected high-risk runtime-contract occurrence SHALL be covered
  by a replacement anchor, diagnostic anchor, or explicit retain decision
- **AND** uncovered occurrences SHALL fail anchor validation

#### Scenario: Diagnostic anchors remain report-only

- **GIVEN** an anchor has severity `diagnostic`
- **WHEN** conversion runs
- **THEN** conversion SHALL NOT emit replacement text for that anchor
- **AND** its match status SHALL remain visible in the human report

#### Scenario: Matched anchors replace complete semantic spans

- **GIVEN** a `required` or `recommended` anchor is matched
- **WHEN** the converter writes a generated text file
- **THEN** the complete inclusive start/end span SHALL be replaced with the
  renderer registered for the anchor's `template_id`
- **AND** the replacement SHALL preserve the original LF or CRLF boundary
- **AND** the visible replacement text SHALL be shaped for the anchor semantics
- **AND** runtime HTML markers SHALL contain only a compact deterministic marker id needed for pairing

#### Scenario: Replacement instructions respect mutation ownership

- **WHEN** a replacement describes ResearchSpec writes
- **THEN** stable spec changes SHALL use an accepted contract patch or direct human
  edit
- **AND** artifact registry and state writes SHALL be assigned to runtime helpers
- **AND** decision ledger writes SHALL require a human-confirmed decision
- **AND** gate ledger writes SHALL be assigned to validators or gate helpers

#### Scenario: Replacement results record full maintenance metadata

- **WHEN** conversion succeeds
- **THEN** `skills/arsu/conversion-manifest.json` SHALL record semantic role,
  ResearchSpec targets, replacement shape, template id, compact marker id,
  before hash, and after hash for every replaceable anchor record
- **AND** those maintenance fields SHALL NOT be duplicated in runtime markers
- **AND** `skills/arsu/conversion-report.md` SHALL summarize semantic replacement
  coverage

#### Scenario: Human-readable replacement report is generated

- **WHEN** conversion succeeds
- **THEN** `skills/arsu/anchor-replacement-report.md` SHALL list every replaced
  anchor with metadata, generated output paths, diagnostics, before text, and
  after text
- **AND** it SHALL list diagnostic-only anchors separately without an after block

#### Scenario: Generated output validation checks local replacement blocks

- **WHEN** maintainers run generated-output validation
- **THEN** validation SHALL extract and verify the exact marker block for each
  replacement record
- **AND** declared target checks SHALL apply to that block rather than the entire
  output file
- **AND** validation SHALL reject malformed marker boundaries and obsolete generic
  replacement headings

#### Scenario: Idempotence compares semantic manifest content

- **WHEN** maintainers compare current output with a clean regeneration
- **THEN** JSON object key order and explicitly unordered collection order SHALL
  NOT cause drift
- **AND** semantically meaningful field or output hash changes SHALL cause drift
