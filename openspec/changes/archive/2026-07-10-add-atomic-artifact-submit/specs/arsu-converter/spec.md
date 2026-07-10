## ADDED Requirements

### Requirement: Generated Skill Submit Handoff

ResearchSpec SHALL generate ARSU contract preflight guidance that hands a completed workflow-owned candidate to the public Submit capability rather than an unspecified runtime helper.

#### Scenario: Supported workflow uses Submit capability

- **WHEN** a generated ARSU Skill writes the candidate path declared by dynamic instructions and `submit_available` is true
- **THEN** generated guidance SHALL route registration through `researchspec-submit`
- **AND** it SHALL forbid hand-written artifact registry, receipt, Gate, Decision, and state updates

#### Scenario: Unsupported workflow remains explicit

- **WHEN** dynamic instructions are unavailable, the workflow is unconfigured, or Submit capability is false
- **THEN** generated guidance SHALL report the missing capability or compatibility boundary
- **AND** it SHALL NOT invent a path, artifact type, producer mapping, or runtime write

#### Scenario: Converter remains deterministic

- **WHEN** Submit handoff guidance changes
- **THEN** converter regeneration, validation, manifest hashes, and idempotence checks SHALL remain authoritative
- **AND** generated Skill trees SHALL NOT be hand-edited
