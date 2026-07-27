## Purpose

ResearchSpec exposes a workflow-owned, deterministic, receipt-backed artifact
submission capability. This capability is the contract layer for turning a
ready work item's validated candidate into an atomic registry/receipt
registration without expanding runtime authority over state, specs, or ledgers.
## Requirements
### Requirement: Workflow-Owned Artifact Submit

ResearchSpec SHALL submit only the candidate path and artifact type declared by
a ready workflow work item, using descriptor-owned semantic input rather than
caller-supplied mechanical workflow facts.

#### Scenario: Dry-run derives a complete submission plan

- **GIVEN** a ready work item has a valid candidate at its declared output path
- **WHEN** the user runs Submit in dry-run mode with valid provenance
- **THEN** ResearchSpec SHALL return candidate hash, derived IDs, validation result, projected completion, and receipt/registry plan
- **AND** it SHALL write no file

#### Scenario: Caller cannot override workflow facts

- **WHEN** submission input attempts to provide output path, artifact type, stage, producer Skill, status, verification state, registry payload, Gate payload, or Decision payload
- **THEN** ResearchSpec SHALL reject the semantic input before any write

### Requirement: Deterministic Candidate Validation

ResearchSpec SHALL generate `verification_state: verified` only after the candidate passes the workflow node's supported deterministic validation profile.

#### Scenario: Text artifact validation succeeds

- **WHEN** the candidate is a contained regular UTF-8 non-empty file, its hash matches the expected hash, its template ref resolves, and declared artifact dependencies are trusted and covered
- **THEN** validation profile `text-artifact` SHALL succeed
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

### Requirement: Instance-Scoped Artifact Submit
ResearchSpec SHALL scope new subflow artifact submissions by both subflow instance and template-local work item.

#### Scenario: Scoped IDs do not collide across instances
- **WHEN** two instances submit the same logical work node
- **THEN** their candidate/submission/receipt IDs and registry provenance SHALL include distinct instance identity
- **AND** each evaluator match SHALL use the instance/work pair

#### Scenario: Receipt binds start authorization
- **WHEN** an automatic instance work item is submitted
- **THEN** its receipt SHALL identify and validate the trusted subflow start receipt
- **AND** forged or drifted authorization SHALL block completion and submission

### Requirement: ARSU artifact references are controlled
Instructions SHALL resolve `arsu-artifact:<artifact-type>` only through the validated artifact-contract registry and SHALL continue to support existing controlled ARS handoff references.

#### Scenario: Unknown artifact type is referenced
- **WHEN** a work item uses an unregistered `arsu-artifact:` reference
- **THEN** profile validation and instruction rendering reject it

### Requirement: Binary submissions retain transaction guarantees
Binary candidate transactions SHALL retain containment, plan-hash, registry precondition, receipt-first recovery, idempotence, and conflict behavior equivalent to text submissions.

#### Scenario: Binary file changes after dry-run
- **WHEN** the binary candidate hash differs from the expected plan at execution
- **THEN** submission returns a conflict and does not register the changed file

### Requirement: Current Scoped Artifact Submission
Artifact submission SHALL accept only instance-scoped work selectors, `automatic|manual` submission policy, `subflow_start|per_artifact` confirmation basis, and explicit text or binary validation.

#### Scenario: Removed alias is submitted
- **WHEN** a caller uses an unscoped work selector or `research-artifact` validation profile
- **THEN** submission SHALL fail before any registry or receipt write

### Requirement: Working Material And Accepted Artifacts Are Separate

ResearchSpec SHALL distinguish candidate or working material from accepted
evidence and registered artifacts. Only a validated durable commit SHALL
satisfy an obligation or change runtime availability.

#### Scenario: Producer retries an artifact

- **WHEN** a producer creates multiple candidates before acceptance
- **THEN** failed or superseded attempts SHALL remain scoped working history
- **AND** only the accepted hash-bound candidate SHALL satisfy the obligation

### Requirement: Durable Bundle Commit

ResearchSpec SHALL support registering a bounded bundle of related outputs at
an obligation boundary when the descriptor declares their identities, hashes,
producer, scope, provenance and atomic acceptance policy.

#### Scenario: Bundle member fails validation

- **WHEN** any required member of an atomic bundle is invalid or drifted
- **THEN** no member SHALL be promoted to accepted evidence
- **AND** the failed attempt SHALL remain recoverable without blocking
  unrelated obligations

### Requirement: Revision Patch Submission Is Canonical

A revision whose durable result is a draft patch SHALL use
`submit patch:<selector>` and SHALL NOT also register a semantically duplicate
ordinary `revision_patch` artifact.

#### Scenario: Revision producer submits a patch

- **WHEN** an Academic Paper revision action reaches its durable boundary
- **THEN** submission SHALL create one pending patch bound to the base artifact
  and base hash
- **AND** patch lifecycle state SHALL be the only authority for that text
  modification

### Requirement: Provider Evidence Requires Producer Acceptance

Provider handoffs MAY be referenced by a candidate artifact, but SHALL remain
working evidence until the owning ARSU producer validates selection,
deduplication, provenance, coverage and artifact scope.

#### Scenario: Adapter query returns sources

- **WHEN** a Zotero provider returns a valid handoff
- **THEN** it SHALL NOT write the artifact registry or satisfy an obligation
  directly
- **AND** only the owning producer's accepted source or bibliography commit
  SHALL enter authority

### Requirement: Submission Uses Descriptor-Owned Semantic Input

Public artifact submission input SHALL contain only producer-supplied semantic
provenance. ResearchSpec SHALL derive candidate location, artifact identity,
hash, dependency, validation, registry, receipt, and authorization facts from
the selected current action descriptor and workspace authority.

#### Scenario: Automatic candidate is submitted

- **WHEN** a ready automatic strict work action receives its minimal semantic
  input and current candidate validates
- **THEN** the CLI SHALL register the candidate and receipt through a `direct`
  transaction
- **AND** it SHALL not require a separately replayed preview plan

#### Scenario: Manual candidate is submitted

- **WHEN** a ready manual strict work action receives its minimal semantic input
- **THEN** the CLI SHALL require the named human confirmation declared by its
  `human_confirmed` descriptor
- **AND** it SHALL not treat `--yes` as academic acceptance

### Requirement: Adaptive Evidence Is Accepted At Obligation Boundaries

Adaptive evidence and attempt operations SHALL use `obligation:` descriptors and
shall keep working material outside accepted authority until the selected
operation validates it as accepted evidence.

#### Scenario: Adaptive producer accepts evidence

- **WHEN** a producer submits valid evidence through an allowed
  `obligation:` descriptor
- **THEN** the CLI SHALL record the scoped attempt, accepted evidence, receipt,
  and CaseState update under one authority transaction
- **AND** unrelated obligations SHALL remain available unless a declared hard
  dependency blocks them

## ADDED Requirements

### Requirement: Recoverable plan-bound artifact submission
Plan-bound adaptive artifact submission SHALL bind its normalized evidence input, read preconditions, registry authority target, and resulting attempt/state projections in receipt v2.

#### Scenario: Evidence retry after registry write
- **WHEN** the receipt and registry entry exist but attempt or Case state projection is missing
- **THEN** exact retry SHALL reuse the existing artifact and event identities and write only the missing projections

#### Scenario: Conflicting evidence retry
- **WHEN** an existing artifact or attempt identity has different content from the receipt-bound semantic input
- **THEN** the retry SHALL fail as conflicting evidence without replacing user content
