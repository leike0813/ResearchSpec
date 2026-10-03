## ADDED Requirements

### Requirement: Patent Maintenance Respects ARSU Output Ownership

Patent artifact maintenance SHALL generate its own capability and analysis output and SHALL inspect shared profile projections without privately writing them. Profile definition changes SHALL require the owning ARSU conversion before maintenance acceptance. Changed maintenance definitions SHALL receive a genuine semantic review and refreshed binding.

#### Scenario: Patent artifacts are regenerated
- **WHEN** the dedicated maintenance artifact command runs
- **THEN** it does not partially rewrite the ARSU preset registry or profile files

#### Scenario: Maintenance definitions change
- **WHEN** the profile ownership repair changes an audited maintenance script
- **THEN** the review binds the current definitions after substantive review rather than copying stale approval

