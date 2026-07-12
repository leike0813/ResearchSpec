## MODIFIED Requirements

### Requirement: Generated File Drift Protection
`init` and `update` SHALL preserve unknown or modified generated files and SHALL reconcile obsolete project-local manifest-owned files without recognizing product-history identifiers.

#### Scenario: No-longer-desired project file is manifest-owned
- **WHEN** its bytes match the recorded hash
- **THEN** generic reconciliation SHALL remove it without a retired-product classification

#### Scenario: No-longer-desired file is modified
- **WHEN** its bytes differ from the recorded hash
- **THEN** it SHALL be preserved and reported as generated-file drift
