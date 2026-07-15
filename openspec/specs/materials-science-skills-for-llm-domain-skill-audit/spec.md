# materials-science-skills-for-llm-domain-skill-audit Specification

## Purpose

Define the immutable, evidence-backed audit of the pinned
Materials-Science-Skills-For-LLM snapshot and its boundary from later production
admission and conversion decisions.

## Requirements
### Requirement: Audit SHALL bind the official upstream snapshot
The audit SHALL identify `https://github.com/IntelligentMat/Materials-Science-Skills-For-LLM.git` as its upstream, bind the full revision `fafd3ab011e4c363658a39c4bb62fc739839d58c`, use the version identifier `snapshot-fafd3ab`, and require a clean maintainer-only checkout at `vendor/materials-science-skills-for-llm`.

#### Scenario: Maintainer verifies provenance
- **WHEN** the audit is validated
- **THEN** the checkout origin, exact revision, clean state, and snapshot identifier match the audited source

### Requirement: Audit SHALL cover every top-level Skill exactly once
The machine audit SHALL contain one stably ordered record for each of the twelve top-level upstream Skills and no unrecognized or duplicate record.

#### Scenario: Upstream and audit inventories are compared
- **WHEN** the top-level Skill roots are enumerated at the pinned revision
- **THEN** their identifiers match the audit entries one-to-one in stable order

### Requirement: Audit SHALL preserve safe, verifiable evidence
Every audit entry SHALL validate its Skill root, frontmatter, resource inventory, evidence paths, internal references, content-license review, relationships, overlap, risk flags, findings, readiness, and recommendation. A Skill root MAY be `.`; ordinary evidence paths SHALL continue to reject `.` and unsafe relative paths.

#### Scenario: Root Skill is audited
- **WHEN** a Skill is located at repository root
- **THEN** its Skill root accepts `.` while each evidence item points to a concrete safe path

#### Scenario: Unsafe evidence is supplied
- **WHEN** an evidence path is absolute, traverses a parent, or is `.`
- **THEN** contract validation rejects the audit document

### Requirement: Audit SHALL distinguish evidence from production admission
The audit SHALL classify potentially reusable research workflows or scientific-computing guidance as candidates only when supported by evidence. Development maintenance, platform management, and private local tooling SHALL default to exclusion. Licensing uncertainty, broken references, external services, credentials, downloads, or portability defects SHALL produce `blocked-review` or `needs-curation` where value remains plausible and SHALL NOT constitute automatic approval.

#### Scenario: Root license is present
- **WHEN** the repository root declares MIT licensing
- **THEN** the audit records that fact as evidence but still records a per-Skill content-license review and cited sources

#### Scenario: Known risk boundaries are reviewed
- **WHEN** the audit covers `pymatgen-usage`, `atomsk-cli`, `cms-scripts`, `ase`, `deepmd-kit`, Slurm, APEX, and Uni-Mol-related content
- **THEN** it explicitly records overlap, broken-link, absolute-path, maintenance-scope, installation, download, credential, service, and HPC risks applicable to those Skills

### Requirement: Report SHALL summarize the machine SSOT without replacing it
The audit directory SHALL include `skill-audit.json` as the authoritative complete record and `report.md` as a concise evidence and recommendation summary. The report SHALL NOT duplicate every machine field or imply that audit recommendations are production decisions.

#### Scenario: Reviewer reads the report
- **WHEN** a reviewer examines `report.md`
- **THEN** the reviewer can identify snapshot scope, major findings, per-Skill readiness, future-ingestion constraints, and the absence of production admission

### Requirement: Production Ingestion SHALL Resolve Every Audit Recommendation
The `ingest-materials-science-skills-for-llm` change SHALL bind its production catalogs to the complete `snapshot-fafd3ab` audit and SHALL resolve all twelve recommendations as exactly seven admitted and five excluded Skills without altering the immutable audit evidence.

#### Scenario: Audit and production catalogs are compared
- **WHEN** production policy is validated
- **THEN** every audited Skill maps to exactly one production decision
- **AND** audit readiness remains evidence rather than automatic admission

### Requirement: Maintainer audit inputs SHALL stay outside npm publication
Release verification SHALL reject npm package entries under `audits/` and `vendor/materials-science-skills-for-llm/`.

#### Scenario: Package contents are verified
- **WHEN** the npm tarball is inspected by release verification
- **THEN** neither the new vendor checkout nor audit evidence is published
