## Purpose

Define the immutable ToolUniverse audit source, complete Skill evidence,
classification model, reporting boundary, and traceability into the separately
governed production vendor bundle.

## Requirements

### Requirement: Immutable ToolUniverse Audit Source
ResearchSpec SHALL keep the audited ToolUniverse source as a repository submodule at `vendor/tooluniverse`, pinned to the immutable commit for the declared upstream release, and SHALL keep that checkout outside npm distribution.

#### Scenario: Pinned source is reproducible
- **WHEN** a maintainer or validation check resolves the ToolUniverse audit source
- **THEN** the checkout remote, release, and HEAD commit SHALL match the audit metadata
- **AND** the gitlink SHALL not depend on a floating branch for audit identity

#### Scenario: Source is not user runtime content
- **WHEN** the ResearchSpec npm tarball is built
- **THEN** `vendor/tooluniverse` SHALL be absent
- **AND** plugin list, install, and update SHALL not read the submodule

### Requirement: Complete Skill Audit Inventory
ResearchSpec SHALL maintain one versioned machine audit record for every top-level ToolUniverse directory containing `SKILL.md` at the pinned revision.

#### Scenario: Every Skill has one disposition
- **WHEN** the audit inventory is validated against the pinned source
- **THEN** every top-level Skill SHALL appear exactly once
- **AND** no audit record SHALL name an absent or duplicate Skill
- **AND** each record SHALL distinguish business scope disposition from ingest readiness

#### Scenario: Source update requires re-audit
- **WHEN** the submodule commit or top-level Skill inventory changes
- **THEN** validation SHALL fail until source metadata, records, findings, and aggregate counts are reconciled

### Requirement: Domain and Evidence Classification
Every ToolUniverse audit record SHALL carry validated ANZSRC Field metadata or an explicit unclassified reason, while production domain membership SHALL be maintained independently by the source-neutral domain catalog.

#### Scenario: Field classification is complete
- **WHEN** any of the 150 audited upstream Skills is validated
- **THEN** it SHALL have a valid primary Field and distinct optional additional Fields or a concise unclassified reason
- **AND** its resource and cross-Skill evidence SHALL remain derived from files below its source root

#### Scenario: Exclusion is explicit
- **WHEN** a router, setup, developer, SDK, platform-adapter, or self-maintenance Skill is outside the business plugin scope
- **THEN** its audit record SHALL retain the exclude disposition with a concise reason
- **AND** its Field metadata SHALL NOT assign a production plugin ID or domain membership

### Requirement: Audit Does Not Grant Plugin Admission
The ToolUniverse audit SHALL remain maintainer evidence and SHALL NOT by itself create or mutate production registry entries, plugin trees, runtime installation behavior, or workflow authority; production admission SHALL remain governed by the separately specified vendor converter and registry contracts.

#### Scenario: Audit and admitted production bundle remain separate
- **WHEN** ToolUniverse production Skills are regenerated or delivered
- **THEN** every generated or excluded Skill SHALL trace to the pinned audit record
- **AND** production bytes SHALL be created only by the reviewed converter path
- **AND** no upstream script or dependency SHALL be executed or installed by the audit

### Requirement: Human Audit Report and Follow-up Recommendation
ResearchSpec SHALL provide a human-readable report that summarizes the machine inventory, known limitations, safety and authority boundaries, and evidence-based options for a later ingest change.

#### Scenario: Report remains explanatory rather than authoritative
- **WHEN** maintainers review the audit
- **THEN** the report SHALL reference the pinned source and machine audit
- **AND** tests SHALL validate structured evidence rather than exact report prose
- **AND** future plugin packaging recommendations SHALL remain non-executing until approved in a separate change

### Requirement: Audit-Governed Production Ingestion
Any production ToolUniverse vendor bundle SHALL consume the pinned audit inventory as its include, exclude, Field evidence, finding, and upstream revision input, while the source-neutral domain catalog SHALL independently own direct domain membership.

#### Scenario: Audit and production bundle remain traceable
- **WHEN** ToolUniverse production Skills are regenerated and centrally assembled
- **THEN** every generated or excluded Skill SHALL trace to exactly one audit record
- **AND** changes to the pinned source or inventory SHALL block regeneration until a new reviewed audit is supplied
- **AND** the 130 admitted Skills SHALL be assigned only through reviewed catalog membership
