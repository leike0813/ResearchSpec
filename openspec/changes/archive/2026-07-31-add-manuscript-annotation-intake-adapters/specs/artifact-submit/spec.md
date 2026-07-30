## ADDED Requirements

### Requirement: Annotation v2 Submission Binds Raw Evidence
Human-confirmed Annotation Submit SHALL validate v2 raw-source snapshots and
Review Delta references and SHALL bind their hashes as transaction read
preconditions before freezing and registering the set.

#### Scenario: Raw source is current
- **WHEN** all referenced source files are contained regular files whose hashes and byte spans match the candidate
- **THEN** submission SHALL proceed through the existing frozen-set, receipt, and registry transaction

#### Scenario: Raw evidence drifts
- **WHEN** a source is missing, a symlink, outside the workspace, hash-mismatched, or inconsistent with a cited source or delta reference
- **THEN** submission SHALL fail before any authoritative write

