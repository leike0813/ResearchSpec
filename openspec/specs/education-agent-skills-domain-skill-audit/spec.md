# Education Agent Skills Domain Skill Audit

## Purpose

TBD

## Requirements

### Requirement: Immutable official source snapshot
ResearchSpec SHALL bind the Education Agent Skills audit to official commit
`32fce5c0d097ec675cf81c750a65a379e4d87e3c` under the untagged identifier
`snapshot-32fce5c`, including the exact remote, commit, tree hash, clean checkout,
tracked path set, and per-file hashes. The checkout MUST remain maintainer-only
and MUST NOT authorize dependency installation or execution of upstream code.

#### Scenario: Fixed source is valid
- **WHEN** the audit or audit check inspects `vendor/education-agent-skills`
- **THEN** it verifies the official remote, pinned commit, canonical tree hash, clean state, tracked paths, and every file hash before accepting the source

#### Scenario: Source drift is rejected
- **WHEN** the remote, commit, tree, checkout state, path set, or content differs from the pinned snapshot
- **THEN** the audit check fails without rewriting audit artifacts or contacting an external service

### Requirement: Complete repository inventory
The audit SHALL classify every tracked file exactly once as `skill-content`,
`license-provenance`, `project-doc`, `installer`, `mcp-runtime`, `maintenance`,
`test`, `generated`, or `showcase`, and SHALL audit every tracked
`skills/**/SKILL.md` exactly once with safe normalized paths, unique stable IDs,
correct hashes, and deterministic ordering.

#### Scenario: Complete tree is inventoried
- **WHEN** the audit is generated from the pinned checkout
- **THEN** the inventory contains the exact Git-tracked path set with one permitted classification per path and the Skill set contains every tracked `skills/**/SKILL.md` once

#### Scenario: Invalid inventory is rejected
- **WHEN** a path is unsafe, missing, duplicated, mis-hashed, multiply classified, or omitted from Skill coverage
- **THEN** schema or audit validation fails rather than filling a default conclusion

### Requirement: Exhaustive typed Skill review
For every upstream Skill, the audit SHALL record its source path and hash, both
frontmatter parse results and upstream metadata, audience, capabilities, inputs,
outputs, resources and external permissions, license statements, contributors,
per-file provenance, named research evidence and evidence strength,
`chains_well_with` relationships and target resolution, overlap with ARSU and
all five current vendors, risks involving minors, privacy, learning analytics,
wellbeing, diagnosis, and original frameworks, prospective ANZSRC 2020 FoR
Group mappings with manual rationale, and a non-production
`candidate | defer | exclude` ingest recommendation.

#### Scenario: Every review dimension has a conclusion
- **WHEN** a Skill record passes validation
- **THEN** every evidence, relationship, license, provenance, overlap, risk, domain candidate, and recommendation dimension has an explicit reviewed conclusion or blocker

#### Scenario: Sensitive or unresolved content remains blocked
- **WHEN** a Skill targets real-time student tutoring, minor analytics, wellbeing or motivation diagnosis, an original framework, or content with unresolved evidence or licensing
- **THEN** the audit retains the risk and uses `defer` or `exclude` rather than treating upstream labels as production approval

### Requirement: Verified named evidence
The audit SHALL review every named reference for existence, author/year/title
identity, actual support scope, and misattribution, and SHALL use only
`verified | partial | unverified | conflicting` for `evidence_strength`.
Completed evidence conclusions SHALL be stored in the audit JSON so routine
generation and checking perform no network request.

#### Scenario: Named reference is reviewed
- **WHEN** a Skill names a study, author, publication, or attributed framework
- **THEN** the audit contains a source-bound evidence record with all identity and support conclusions plus one permitted evidence-strength value

#### Scenario: Conflicting or incomplete evidence is preserved
- **WHEN** identity, existence, attribution, or claimed support cannot be fully proved
- **THEN** the JSON records `partial`, `unverified`, or `conflicting` and an explicit blocker instead of upgrading the upstream claim

### Requirement: File-level licensing and provenance
The audit SHALL record contributor and per-file provenance evidence and SHALL
use only `clear | conditional | unresolved` for license status. A repository-root
CC BY-SA 4.0 statement MUST NOT by itself establish production admission for an
individual Skill or embedded third-party content.

#### Scenario: License scope is proved or blocked
- **WHEN** a Skill and its related source files are reviewed
- **THEN** every relevant file has an explicit provenance conclusion and the Skill license status reflects the proved scope, conditions, or unresolved blocker

#### Scenario: Root license is insufficient
- **WHEN** only the repository-level license statement supports redistribution or embedded content has uncertain origin
- **THEN** the audit records `conditional` or `unresolved` rather than `clear`

### Requirement: Relationships and overlap remain non-authoritative
The audit SHALL retain every `chains_well_with` declaration, resolve its target
when possible, report duplicates and missing targets, and designate every future
relationship as advisory by default. It SHALL also record an explicit content
overlap conclusion for ARSU and each existing vendor without creating a hard
Skill dependency or changing production state.

#### Scenario: Relationship target is resolved
- **WHEN** a Skill declares `chains_well_with`
- **THEN** each declared item appears in the relationship catalog with source, target resolution, review status, and prospective advisory semantics

#### Scenario: Invalid relationship remains visible
- **WHEN** a declared target is duplicate, ambiguous, or absent
- **THEN** the audit records the condition as a finding and does not discard the declaration or invent a dependency

### Requirement: Deterministic audit SSOT and derived report
ResearchSpec SHALL expose internal `education-agent-skills:audit` and
`education-agent-skills:audit:check` commands. Generation SHALL validate and
write one JSON SSOT containing exactly the top-level fields `schema_version`,
`vendor`, `snapshot`, `repository_inventory`, `skills`, `evidence`,
`relationships`, `findings`, and `summary`, then derive `report.md` from that
value. Check SHALL be read-only and SHALL verify source binding, coverage,
schema validity, deterministic bytes, and report synchronization.

#### Scenario: Audit generation is idempotent
- **WHEN** the audit command runs twice against the same valid snapshot and review decisions
- **THEN** both the JSON and report are byte-identical across runs

#### Scenario: Report uses actual audit counts
- **WHEN** the report is rendered
- **THEN** Skill, prospective-domain, named-reference, relationship, license, recommendation, and risk totals are calculated from the validated JSON rather than copied from upstream documentation

#### Scenario: Read-only check detects drift
- **WHEN** checked-in JSON or report bytes differ from a freshly built valid audit
- **THEN** the check command fails and leaves both files unchanged

### Requirement: Audit remains separate from production admission
The completed audit SHALL identify itself as non-admission and SHALL leave the
public CLI, current production registry, existing vendor bundles, and domain
memberships unchanged. Vendor source and audit artifacts MUST remain outside the
npm tarball. Production ingest SHALL require a separate
`ingest-education-agent-skills` change that consumes the immutable audit.

#### Scenario: Audit completes with no admitted Skill
- **WHEN** every Skill is deferred or excluded because evidence, license, provenance, overlap, or sensitive-content review remains blocked
- **THEN** the audit is still complete and reproducible without publishing or registering any Skill

#### Scenario: Package and production surfaces remain unchanged
- **WHEN** the project builds and package verification inspects the tarball and registries
- **THEN** no Education Agent Skills vendor checkout, audit artifact, converter output, public command, bundle, vendor registration, or domain membership is present in production surfaces

### Requirement: Future ingestion SHALL resolve licensing and provenance per Skill
The immutable audit SHALL remain unchanged and non-admitting. A separate
production policy MAY admit only source-hash-bound Skills whose sole reviewed
content author is Gareth Manning, whose content is not classified as an original
framework, and whose generated tree carries CC BY-SA 4.0 attribution and change
disclosure. Sean Hu-attributed and original-framework-risk Skills SHALL remain
excluded without independent authorization.

#### Scenario: Production disposition is inspected
- **WHEN** audit and production policy are joined
- **THEN** every audited Skill has exactly one production disposition
- **AND** the immutable audit bytes and conservative license findings remain unchanged

### Requirement: Prospective education domains SHALL require explicit promotion
Audit mappings SHALL remain evidence only for `curriculum-and-pedagogy`,
`education-systems`, and `specialist-studies-in-education` until the complete
generated tree hash is approved. Only admitted Skills MAY be promoted to their
single reviewed domain through the source-neutral catalog.

#### Scenario: Approval has not occurred
- **WHEN** the audit and preview exist but the aggregate hash is pending
- **THEN** the production domain catalog and registry SHALL contain no Education Agent Skills membership
