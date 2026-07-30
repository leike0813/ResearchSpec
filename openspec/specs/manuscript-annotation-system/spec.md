## Purpose

ResearchSpec binds normalized human manuscript annotations to registered
Markdown drafts and carries their deterministic identity through revision,
resolution reporting, artifact checking, and formal Gate evidence without
claiming semantic sufficiency.

## Requirements

### Requirement: Versioned Annotation Set Contract

ResearchSpec SHALL represent a frozen Annotation Set v1 with safe set identity,
registered base artifact identity and hash, raw candidate path and hash,
human-confirmation evidence, annotations, and an optional superseded-set
reference.

#### Scenario: Normalized annotation is frozen

- **WHEN** a valid candidate is confirmed and registered
- **THEN** every annotation SHALL preserve its raw body, JSON source pointer,
  typed target, Agent interpretation, expected action, semantic impact, and
  resolved clarification
- **AND** the frozen set SHALL bind the exact registered base draft bytes

#### Scenario: Unsupported base is rejected

- **WHEN** a candidate targets an unregistered artifact, a non-Markdown file, or
  an artifact type other than `paper_draft`, `verified_draft`, or
  `revised_draft`
- **THEN** registration SHALL fail before any authoritative write

### Requirement: Deterministic Annotation Targets

An annotation target SHALL be exactly one of document, section, block, or quote;
block and quote targets SHALL bind a stable block ID and complete block SHA-256,
and quote targets SHALL also bind exact quote, prefix, and suffix.

#### Scenario: Quote resolves uniquely

- **WHEN** a quote target is validated
- **THEN** its block ID and hash SHALL resolve against the registered base draft
- **AND** its exact quote SHALL occur exactly once within that block

#### Scenario: Target evidence drifts

- **WHEN** the base hash, block hash, section identity, quote context, or path
  containment no longer matches
- **THEN** registration and later coverage verification SHALL fail closed with
  a stable diagnostic

### Requirement: Immutable Annotation Registration

ResearchSpec SHALL expose a fixed candidate path under
`runs/current/annotation-sessions/<id>/candidate.json`, freeze a set at
`runs/current/annotation-sets/<id>.json`, create its receipt under
`runs/current/receipts/annotation-submit/<id>.json`, and register the frozen set
and receipt by current hashes.

#### Scenario: First registration commits receipt first

- **WHEN** a confirmed candidate passes validation
- **THEN** ResearchSpec SHALL create-only write the frozen set and receipt before
  refreshing the artifact registry
- **AND** it SHALL leave state, Gate ledger, and Decision ledger unchanged

#### Scenario: Retry or partial recovery occurs

- **WHEN** all existing frozen-set, receipt, and registry evidence matches the
  current transaction exactly
- **THEN** ResearchSpec SHALL return success and write only missing later
  transaction phases
- **AND** any divergent occupied ID, content, receipt, or registry record SHALL
  be a write conflict

### Requirement: Draft Patch Annotation Resolution

Draft Patch v3 SHALL give every operation a stable operation ID and zero or more
Annotation references, and SHALL use those operation references as the only
authoritative annotation-to-operation mapping.

#### Scenario: Resolution entries are complete

- **WHEN** a patch declares annotation resolution
- **THEN** every annotation from every referenced set SHALL appear exactly once
  with disposition `implemented`, `answered_without_text_change`, `deferred`,
  `rejected`, `unresolved`, or `superseded`
- **AND** duplicate, missing, or dangling annotation and operation references
  SHALL be rejected

#### Scenario: Disposition evidence is validated

- **WHEN** an entry is `implemented`
- **THEN** at least one patch operation SHALL reference it
- **WHEN** an entry is answered, deferred, rejected, or superseded
- **THEN** its required answer, reason, or successor annotation SHALL be present
  and valid

#### Scenario: High-impact annotation is implemented

- **WHEN** an implemented annotation declares high semantic impact
- **THEN** the patch SHALL carry a corresponding high semantic delta category
  and link the required contract change
- **AND** patch application SHALL remain blocked while that change is unresolved

### Requirement: Derived Annotation Resolution Report

Successful Draft Patch application SHALL derive one immutable
`annotation_resolution_report` from the accepted patch mapping and register the
report as an artifact.

#### Scenario: Accepted fresh patch produces a report

- **WHEN** an accepted non-stale patch is applied
- **THEN** the report SHALL bind base draft, revised draft, patch, Decision,
  Annotation Sets, hashes, per-item disposition, derived operation links,
  mechanical coverage counts, and unresolved count
- **AND** the apply report SHALL store only the report reference

#### Scenario: Patch does not apply

- **WHEN** a patch is rejected, stale, conflicting, or otherwise not applied
- **THEN** no Annotation Resolution Report SHALL be created or registered

### Requirement: Shared Mechanical Coverage Verification

ResearchSpec SHALL use one deterministic annotation coverage verifier for
`revision_completeness` Gate submission and artifact checking.

#### Scenario: Coverage is mechanically complete

- **WHEN** all apply-report, patch, set, report, registry, file, hash,
  disposition, and operation references validate and unresolved count is zero
- **THEN** the verifier SHALL report complete mechanical coverage
- **AND** it SHALL NOT claim semantic sufficiency or user satisfaction

#### Scenario: Coverage evidence is incomplete or forged

- **WHEN** evidence is missing, drifted, dangling, duplicated, or inconsistent
- **THEN** a passing or conditional `revision_completeness` verdict SHALL be
  rejected
- **AND** artifact checking SHALL report the same underlying diagnostic

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
