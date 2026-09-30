## ADDED Requirements

### Requirement: Per-Skill reviewed source identity
Every audit record SHALL carry the release and revision that produced its
reviewed content, so that a later snapshot can leave an unchanged Skill bound to
its earlier review instead of silently adopting the new pin.

#### Scenario: Unchanged Skill keeps its reviewed identity
- **WHEN** a new snapshot changes other Skills but not this one
- **THEN** its source hash SHALL match the retained previous audit
- **AND** the produced Skill SHALL cite the previous release and revision

#### Scenario: Changed Skill takes the new identity
- **WHEN** a Skill's bytes differ from the previous audit
- **THEN** it SHALL be attributed to the current snapshot
- **AND** it SHALL NOT inherit the earlier release or revision

## MODIFIED Requirements

### Requirement: Immutable official source snapshot
ResearchSpec SHALL bind the Education Agent Skills audit to official commit
`6bbbce418f82e11044009c9f3b7373a354de5bd0` under the untagged identifier
`snapshot-6bbbce4`, including the exact remote, commit, tree hash, clean checkout,
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

### Requirement: File-level licensing and provenance
The audit SHALL record contributor and per-file provenance evidence and SHALL
use only `clear | conditional | unresolved` for license status. A repository-root
CC BY-SA 4.0 notice naming Gareth Manning MAY establish origin authorization for
the author's own content, but MUST NOT by itself establish production admission
for an individual Skill or embedded third-party content.

#### Scenario: License scope is proved or blocked
- **WHEN** a Skill and its related source files are reviewed
- **THEN** every relevant file has an explicit provenance conclusion and the Skill license status reflects the proved scope, conditions, or unresolved blocker

#### Scenario: Root license is insufficient
- **WHEN** only the repository-level license statement supports redistribution or embedded content has uncertain origin
- **THEN** the audit records `conditional` or `unresolved` rather than `clear`

#### Scenario: The root notice does not expand admission
- **WHEN** the root notice is present and validated
- **THEN** the original-framework and third-party exclusion sets SHALL stay unchanged
- **AND** a blocking license-scope finding SHALL remain while embedded framework claims or separately attributed content are unauthorized
