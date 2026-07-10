## ADDED Requirements

### Requirement: Conversion-Time Anchor Matching And Replacement

ResearchSpec SHALL use audited ARSU contract anchors during conversion to
replace ARS-native runtime contract instructions with ResearchSpec-compatible
guidance.

#### Scenario: Anchors are matched before generated output is overwritten

- **GIVEN** `vendor/ars` is a valid clean upstream checkout
- **WHEN** a maintainer runs ARSU conversion
- **THEN** the converter SHALL match contract anchors before deleting or
  overwriting `skills/arsu`
- **AND** any missing blocking anchors SHALL fail conversion before generated
  output is touched

#### Scenario: Matcher uses robust hints

- **WHEN** the converter matches an anchor
- **THEN** it SHALL use the anchor source path plus robust hints such as
  headings, whitespace-tolerant snippets, and case-insensitive keywords
- **AND** it SHALL NOT depend on source line numbers for matching

#### Scenario: Required and recommended anchors are blocking

- **GIVEN** an anchor has severity `required` or `recommended`
- **WHEN** the converter cannot match that anchor in `vendor/ars`
- **THEN** conversion SHALL fail before writing generated output
- **AND** the diagnostic SHALL identify the missing anchor id and source path

#### Scenario: Diagnostic anchors are report-only

- **GIVEN** an anchor has severity `diagnostic`
- **WHEN** the converter cannot match that anchor in `vendor/ars`
- **THEN** conversion SHALL continue
- **AND** the missing diagnostic anchor SHALL be reported as a warning or
  diagnostic finding

#### Scenario: Matched replaceable anchors are rewritten

- **GIVEN** a `required` or `recommended` anchor is matched
- **WHEN** the converter writes the generated text file that corresponds to the
  anchor source path
- **THEN** the matched anchor span SHALL be replaced with generated
  ResearchSpec contract guidance
- **AND** the replacement block SHALL include stable
  `researchspec-anchor-replacement` start and end markers with anchor id,
  template id, source path, and severity

#### Scenario: Replacement preserves ResearchSpec runtime ownership

- **WHEN** an ARS-native contract instruction is replaced
- **THEN** the replacement SHALL state the ResearchSpec runtime owner for the
  relevant state, artifact, decision, gate, source, claim, or draft-patch
  contract
- **AND** it SHALL treat ARS schemas and Material Passport content as
  compatibility artifacts or payload projection sources rather than runtime
  sources of truth

#### Scenario: Replacement results are recorded

- **WHEN** conversion succeeds
- **THEN** `skills/arsu/conversion-manifest.json` SHALL record an anchor
  replacement summary and per-anchor match/replacement records
- **AND** `skills/arsu/conversion-report.md` SHALL summarize anchor replacement
  coverage
- **AND** `skills/arsu/researchspec-contracts.json` SHALL declare the anchor
  replacement compatibility profile

#### Scenario: Generated output validation checks replacement markers

- **WHEN** maintainers run the generated-output validation script
- **THEN** validation SHALL verify that every replaced anchor manifest record
  has matching replacement markers in the generated output file
- **AND** validation SHALL fail if replacement markers reference anchors absent
  from the manifest

#### Scenario: Converter remains developer-only

- **WHEN** maintainers inspect public `researchspec` CLI help
- **THEN** anchor matching and replacement SHALL NOT appear as public user
  commands
- **AND** conversion SHALL remain local-file developer tooling with no LLM API
  calls
