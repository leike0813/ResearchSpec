# Patent Upstream Maintenance

## Purpose

Keep the third-party patent source, reviewed adaptations and generated fixed packages reproducible and auditable across pinned upstream updates without depending on chat history.

## ADDED Requirements

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
