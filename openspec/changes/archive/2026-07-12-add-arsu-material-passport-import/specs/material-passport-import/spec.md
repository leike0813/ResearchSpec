## ADDED Requirements

### Requirement: Strict Material Passport Import
ResearchSpec SHALL accept a contained hash-bound ARS Material Passport JSON or YAML object only on an external `academic-pipeline:mid-entry` Start.

#### Scenario: Input is valid
- **WHEN** source and optional accompanied artifact are regular contained files with matching hashes
- **THEN** the plan SHALL bind their hashes and leave source bytes unchanged

#### Scenario: Input is unsafe
- **WHEN** a path escapes, is a symlink, is malformed, uses Markdown or has hash drift
- **THEN** Start SHALL fail without writes

### Requirement: Imported Evidence Has No Authority
ResearchSpec SHALL project the source into immutable artifacts and `authority: imported_evidence` Gate/Decision records that cannot satisfy current runtime conditions.

#### Scenario: Passport reports pass or branch
- **WHEN** imported records claim a Gate pass, override or branch
- **THEN** current readiness SHALL remain unchanged until the normal current transaction completes

### Requirement: Idempotent Import
One source boundary SHALL bind to at most one subflow instance per run.

#### Scenario: Exact plan is retried
- **WHEN** source hash, boundary, instruction basis and plan match an existing trusted Start
- **THEN** Start SHALL return the existing instance without duplicate records
