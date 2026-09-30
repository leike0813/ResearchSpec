## Purpose

Define the finding-level manual security review process for the 40 Scientific Agent
Skills v2.53.0 candidates carrying `static-security-review-failed`, including
attack-surface inspection, evidence standards, maintainer decision workflow, and
human-readable reporting while preserving the immutable upstream audit.

## Requirements

### Requirement: Exact Manual Security Review Inventory
ResearchSpec SHALL maintain one finding-level manual security review record for every Scientific Agent Skills v2.70.0 production decision carrying `static-security-review-failed`, bound to the pinned vendor release and revision without modifying the immutable upstream audit.

#### Scenario: Review target coverage is complete
- **WHEN** the manual review catalog is validated
- **THEN** the current high-severity candidates and retained approved curation targets appear once in stable order
- **AND** no unrelated, duplicate, unknown, or differently revised Skill appears

#### Scenario: Upstream evidence remains reproducible
- **WHEN** ResearchSpec resolves an upstream security finding
- **THEN** the original audit and upstream `docs/security-report.json` remain unchanged
- **AND** the manual record cites the pinned report and actual Skill-tree evidence separately

### Requirement: Complete Local Attack-Surface Review
Each target review SHALL enumerate the actual pinned resource tree and SHALL inspect the entry, every executable and configuration resource, and every reachable instruction resource without executing scripts, installing dependencies, configuring credentials, or contacting services.

#### Scenario: Scanner claim cites absent resources
- **WHEN** an upstream finding relies on files that are absent from the target Skill tree
- **THEN** the manual record marks that claim `false-positive` or `not-applicable` with inventory evidence
- **AND** nonexistent or cross-Skill resources do not remain a security blocker

#### Scenario: Large static resource is reviewed proportionately
- **WHEN** a schema, dataset, or static template is too large for line-by-line semantic review
- **THEN** the review records its format, origin, reference chain, executable-content boundary, and prompt-injection exposure
- **AND** the resource is not represented as fully semantically certified

### Requirement: Finding-Level Evidence And Outcome
Every upstream finding for a target Skill SHALL have a deterministic identity, upstream code and severity, verdict, safe source evidence, analysis, and residual-risk statement, and each Skill SHALL have one technical recommendation independent of its production eligibility.

#### Scenario: Finding is only partially valid
- **WHEN** source inspection confirms part but not all of an upstream claim
- **THEN** the finding is `partially-confirmed`
- **AND** the confirmed behavior and rejected scanner inference are stated separately

#### Scenario: Intended credential or network use is reviewed
- **WHEN** a Skill reads a service credential or performs a network request
- **THEN** review evaluates the controlled endpoint, transmitted data, configurability, disclosure, and least privilege
- **AND** keyword co-occurrence alone does not determine exfiltration

### Requirement: Explicit Maintainer Decision
ResearchSpec SHALL present five complete Skill review cards per round and SHALL record an explicit maintainer action of `clear`, `clear-with-adaptation`, `fail`, or `defer` for each target before production reconciliation.

#### Scenario: Decision card is presented
- **WHEN** a Skill is ready for maintainer review
- **THEN** its card states actual resources, upstream claims, finding verdicts, residual risks, proposed adaptation, independent blockers, proposed existing domains, recommendation, and production effect

#### Scenario: Decision remains pending
- **WHEN** any target lacks an explicit maintainer action
- **THEN** the manual review catalog is incomplete
- **AND** no partial admission or registry regeneration is authorized

### Requirement: Security Decision Does Not Override Independent Gates
Manual security resolution SHALL remain distinct from license, content, authority, overlap, dependency, resource, and domain decisions.

#### Scenario: Security clears but another blocker remains
- **WHEN** a maintainer clears a Skill that overlaps ToolUniverse or ARSU, lacks domain fit, exceeds plugin authority, or has unresolved license or dependency evidence
- **THEN** the security failure reason is resolved as decided
- **AND** the Skill remains excluded for the independent blocker

#### Scenario: Review is deferred
- **WHEN** the maintainer selects `defer`
- **THEN** production records a manual-review-deferred blocker
- **AND** it does not present the upstream scanner severity as a confirmed ResearchSpec finding

### Requirement: Human-Readable Manual Review Report
ResearchSpec SHALL maintain a human-readable report for all catalogued reviews and maintainer decisions while keeping the structured review catalog authoritative.

#### Scenario: Review report is complete
- **WHEN** all current review records finish
- **THEN** the report accounts for every target, finding conclusion, residual risk, independent blocker, maintainer action, and resulting production disposition
- **AND** tests validate structured evidence rather than exact report prose
