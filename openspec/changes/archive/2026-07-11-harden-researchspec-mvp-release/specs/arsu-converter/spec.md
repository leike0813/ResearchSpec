## ADDED Requirements

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
