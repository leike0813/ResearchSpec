# Full Workflow Runtime

## ADDED Requirements

### Requirement: Candidate acceptance is explicit
The full runtime SHALL reject stale analysis and unapproved candidates, expose stable error codes, and accept only a candidate whose protected regions and required plan hash match the current analysis.
#### Scenario: Stale candidate
- **WHEN** a candidate uses a plan hash from an older analysis
- **THEN** validation fails with a stable stale-plan error and does not accept the candidate
