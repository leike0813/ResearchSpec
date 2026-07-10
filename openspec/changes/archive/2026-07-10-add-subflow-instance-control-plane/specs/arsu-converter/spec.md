## MODIFIED Requirements

### Requirement: Generated Skill Submit Handoff

ResearchSpec SHALL generate ARSU contract preflight guidance that consumes generalized runtime instructions and follows the declared automatic/manual submission policy.

#### Scenario: Automatic instance work submits directly

- **WHEN** a generated ARSU Skill completes a candidate whose instructions prove `submission.policy: automatic` and trusted start authorization
- **THEN** guidance SHALL perform Submit dry-run followed by execution bound to the returned exact hash
- **AND** it SHALL query status/check afterward without asking for per-artifact confirmation

#### Scenario: Manual or legacy work uses Submit Companion

- **WHEN** work instructions are manual, legacy, unconfigured or lack trusted authorization
- **THEN** guidance SHALL hand registration to `researchspec-submit` or report the boundary
- **AND** it SHALL not invent automatic authority, paths, provenance or runtime writes

#### Scenario: Converter remains deterministic

- **WHEN** preflight guidance changes
- **THEN** converter regeneration, validation, manifest hashes and idempotence SHALL remain authoritative
- **AND** generated Skill trees SHALL not be hand-edited

