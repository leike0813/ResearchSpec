## ADDED Requirements

### Requirement: Annotation Set v2 Raw Provenance
New adapter-produced Annotation Sets SHALL use version 2 to bind every raw
source by contained path, format, and SHA-256 and every annotation to either a
source byte span or Review Delta entry while preserving the existing target and
interpretation fields.

#### Scenario: Version 2 set is frozen
- **WHEN** a complete v2 candidate is submitted
- **THEN** its raw source files, hashes, references, base, targets, and interpretation fields SHALL validate before the existing create-only freeze transaction

#### Scenario: Version 1 set remains usable
- **WHEN** an existing v1 candidate, frozen set, patch reference, or coverage chain is read
- **THEN** ResearchSpec SHALL preserve its current behavior through a normalized v1/v2 reader

### Requirement: Intake Working Material Is Not Authority
Mutable intake sessions, review copies, Review Deltas, interpretation drafts,
and raw snapshots SHALL remain working material until a human-confirmed
Annotation Submit freezes a candidate.

#### Scenario: Session files change
- **WHEN** intake working files are created, refreshed, or abandoned
- **THEN** ResearchSpec SHALL NOT update workflow state, artifact registry, Gate ledger, Decision ledger, or receipts

