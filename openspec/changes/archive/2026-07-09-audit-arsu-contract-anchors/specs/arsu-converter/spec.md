## ADDED Requirements

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
