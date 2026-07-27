## ADDED Requirements

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
