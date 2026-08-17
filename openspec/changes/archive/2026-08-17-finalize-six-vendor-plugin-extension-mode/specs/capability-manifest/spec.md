## MODIFIED Requirements

### Requirement: Knowledge Packs Are Immutable And Referenced

Knowledge files inside a capability package SHALL be immutable referenced assets with a knowledge ID,
relative path, content hash and license. `SKILL.md` SHALL reference knowledge by ID and SHALL NOT
inline a divergent copy of the same mandatory standard.

#### Scenario: Knowledge pack drifts

- **WHEN** a packaged knowledge file differs from its manifest content hash
- **THEN** package validation fails with a knowledge-drift diagnostic

#### Scenario: Inlined divergent standard

- **WHEN** `SKILL.md` embeds a mandatory rubric that also exists as a knowledge pack with different
  wording
- **THEN** package checking SHALL flag the duplication for single-sourcing

#### Scenario: Binary knowledge pack verifies byte-for-byte

- **WHEN** a packaged knowledge file is a binary asset such as PNG or GIF
- **THEN** its manifest `content_hash` SHALL be SHA-256 computed over the file's raw bytes
- **AND** package validation SHALL compare the raw bytes without text decoding

#### Scenario: Text knowledge hash semantics are unchanged

- **WHEN** a packaged knowledge file is UTF-8 text
- **THEN** byte-level SHA-256 SHALL equal the previous UTF-8 string SHA-256 of the same bytes
- **AND** existing knowledge-pack hashes SHALL NOT require regeneration
