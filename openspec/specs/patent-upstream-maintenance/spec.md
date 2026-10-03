# Patent Upstream Maintenance Specification

## Purpose

Keep the third-party patent source, reviewed adaptations and generated fixed packages reproducible and auditable across pinned upstream updates without depending on chat history.

## Requirements

### Requirement: Pinned Source And Complete Admission Inventory

The maintenance catalog SHALL identify the exact source commit/tree and classify every tracked upstream file. Production content SHALL have immutable source, adaptation and license evidence. Source examples with unresolved distribution rights, automation, dependency installers and unrelated runtime authority SHALL remain audit-only.

#### Scenario: Source pin changes
- **WHEN** the pinned source no longer matches the catalog
- **THEN** maintenance checking reports the mismatch before claiming a valid anchor

### Requirement: Generation Is Byte Deterministic

Fixed packages and profiles SHALL be generated from reviewed authoring sources. Binary resources SHALL preserve exact bytes, resources SHALL retain their individual licenses, and unchanged source inputs SHALL produce identical output. Generation SHALL preserve other registered capabilities and SHALL NOT execute vendor resources.

#### Scenario: Binary resource is projected
- **WHEN** a reviewed binary asset is generated into a package
- **THEN** its bytes and recorded digest match the reviewed source

### Requirement: Maintenance Includes Semantic Review

The dedicated maintenance entry SHALL provide artifacts, records, baseline, check and diff operations, bind source and generated identities, and retain an Agent semantic review covering all nine businesses and both compositions. Machine checks SHALL NOT establish legal, scientific or live-service acceptance.

#### Scenario: Review is unfinished
- **WHEN** a baseline has no completed semantic review
- **THEN** the baseline cannot claim production admission

### Requirement: Patent Maintenance Respects ARSU Output Ownership

Patent artifact maintenance SHALL generate its own capability and analysis output and SHALL inspect shared profile projections without privately writing them. Profile definition changes SHALL require the owning ARSU conversion before maintenance acceptance. Changed maintenance definitions SHALL receive a genuine semantic review and refreshed binding.

#### Scenario: Patent artifacts are regenerated

- **WHEN** the dedicated maintenance artifact command runs
- **THEN** it does not partially rewrite the ARSU preset registry or profile files

#### Scenario: Maintenance definitions change

- **WHEN** the profile ownership repair changes an audited maintenance script
- **THEN** the review binds the current definitions after substantive review rather than copying stale approval
