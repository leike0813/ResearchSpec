## ADDED Requirements

### Requirement: Workflow-Owned Artifact Submit

ResearchSpec SHALL submit only the candidate path and artifact type declared by a ready workflow work item.

#### Scenario: Dry-run derives a complete submission plan

- **GIVEN** a ready work item has a valid candidate at its declared output path
- **WHEN** the user runs Submit in dry-run mode with valid provenance
- **THEN** ResearchSpec SHALL return candidate hash, derived IDs, validation result, projected completion, and receipt/registry plan
- **AND** it SHALL write no file

#### Scenario: Caller cannot override workflow facts

- **WHEN** submission input attempts to provide output path, artifact type, stage, producer Skill, status, verification state, registry payload, Gate payload, or Decision payload
- **THEN** ResearchSpec SHALL reject the strict input

### Requirement: Deterministic Candidate Validation

ResearchSpec SHALL generate `verification_state: verified` only after the candidate passes the workflow node's supported deterministic validation profile.

#### Scenario: Research artifact validation succeeds

- **WHEN** the candidate is a contained regular UTF-8 non-empty file, its hash matches the expected hash, its template ref resolves, and declared artifact dependencies are trusted and covered
- **THEN** validation profile `research-artifact` SHALL succeed
- **AND** verification metadata SHALL identify the deterministic validator separately from the producer

#### Scenario: Invalid candidate produces no runtime write

- **WHEN** the candidate is missing, empty, invalid UTF-8, outside allowed roots, a symlink escape, hash-drifted, or has untrusted dependencies
- **THEN** Submit SHALL fail with a stable diagnostic
- **AND** it SHALL create neither receipt nor registry record

### Requirement: Receipt-Backed Atomic Registration

ResearchSpec SHALL atomically create a submission receipt and refresh the artifact registry with candidate and receipt records.

#### Scenario: First submission registers candidate and receipt

- **WHEN** a confirmed submission passes validation and preconditions
- **THEN** ResearchSpec SHALL preserve the candidate bytes
- **AND** it SHALL create one receipt file and two registry records
- **AND** it SHALL commit the receipt before committing the registry

#### Scenario: Runtime authority remains scoped

- **WHEN** Submit succeeds
- **THEN** state, stable specs, Gate ledger, and Decision ledger SHALL remain byte-for-byte unchanged

### Requirement: Submit Idempotency And Conflict Safety

ResearchSpec SHALL treat exact retries as success and all divergent or drifted submissions as conflicts.

#### Scenario: Exact retry is idempotent

- **GIVEN** candidate, receipt, registry, dependencies, producer, and full candidate hash match an existing submission
- **WHEN** Submit is repeated
- **THEN** it SHALL return `already_submitted` with exit code 0
- **AND** it SHALL perform no write

#### Scenario: Divergent retry is rejected

- **WHEN** the work item has another hash or provenance, an ID is occupied by different content, the receipt conflicts, or a read precondition drifted
- **THEN** Submit SHALL return a write-conflict-class result
- **AND** it SHALL preserve all authoritative files

#### Scenario: Matching orphan receipt is recoverable

- **GIVEN** a complete matching receipt file exists but is not registered
- **WHEN** the same submission is retried
- **THEN** ResearchSpec SHALL reuse the receipt and commit only the registry refresh
- **AND** a non-matching orphan receipt SHALL remain a conflict
