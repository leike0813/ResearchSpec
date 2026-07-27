## ADDED Requirements

### Requirement: Current dual-runtime generated guidance
The ARSU converter SHALL generate entrypoints and metadata that describe adaptive-default operation and bounded strict compatibility without asserting that compatibility paths are absent.

#### Scenario: Converter regeneration
- **WHEN** maintained runtime guidance changes
- **THEN** generated Skills, contracts manifest, reports, and handbook-derived references SHALL be regenerated through their owning converter and pass drift and idempotence checks

#### Scenario: Portable converter build
- **WHEN** converter and release verification run on the supported Node matrix
- **THEN** executable permission handling SHALL use Node file APIs without depending on a Unix `chmod` command
