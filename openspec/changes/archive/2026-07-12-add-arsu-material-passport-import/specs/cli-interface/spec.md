## ADDED Requirements

### Requirement: Mid-Entry Material Passport Input
Start SHALL accept an optional strict `material_passport_import` object without adding a public command.

#### Scenario: Import is previewed and executed
- **WHEN** a caller supplies a valid Passport import to the mid-entry Start
- **THEN** dry-run SHALL expose hashes, projected evidence, diagnostics and writes
- **AND** execution SHALL require the identical plan hash and current read basis

### Requirement: Imported-Evidence Runtime Context
Subflow, work and Gate instructions SHALL expose typed scoped import references.

#### Scenario: Imported evidence changes
- **WHEN** registered import evidence or its hashes change
- **THEN** the prior instruction basis SHALL become stale
