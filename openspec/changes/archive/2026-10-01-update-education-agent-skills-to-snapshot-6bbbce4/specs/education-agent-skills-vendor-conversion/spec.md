## ADDED Requirements

### Requirement: Incremental conversion preserves unaffected bytes
Conversion and extension generation SHALL write a generated file only when its
content differs from the published file, so that an incremental update changes
only the Skills whose reviewed content changed.

#### Scenario: Unchanged trees survive a pin bump
- **WHEN** an incremental update runs with a new global pin
- **THEN** raw Skills, capabilities and profiles whose reviewed content is unchanged SHALL keep their published bytes and modification state
- **AND** the observed changed-file set SHALL be recorded in the anchor artifacts

#### Scenario: Repeated generation is a no-op
- **WHEN** the same approved preview is converted or regenerated again
- **THEN** no file content or modification time SHALL change

#### Scenario: Extension identity follows the vendor bundle
- **WHEN** the extension catalog is regenerated
- **THEN** its release, revision, anchor and audit paths SHALL be derived from the published vendor bundle rather than duplicated literals

## MODIFIED Requirements

### Requirement: Generated Skills SHALL Carry Complete Attribution
Every generated Skill SHALL have the global ID
`education-agent-skills-<upstream-name>`, CC BY-SA 4.0 `LICENSE`, and
`NOTICE.md` naming Gareth Manning, the source repository, the reviewed snapshot
and revision of that Skill, source path, source hash, license link, and
ResearchSpec modifications.

#### Scenario: A generated Skill is redistributed
- **WHEN** its directory is inspected independently
- **THEN** license and attribution SHALL remain complete
- **AND** ShareAlike and change disclosure SHALL be visible without consulting maintainer files

#### Scenario: Attribution names the reviewed source of that Skill
- **WHEN** a Skill was not changed by the current pin
- **THEN** its notice and frontmatter SHALL cite the earlier reviewed release and revision
- **AND** the aggregate manifest MAY still report the current global pin

### Requirement: Aggregate Hash Approval SHALL Gate Production
Preview generation SHALL compute per-file, per-Skill, and aggregate hashes for all
136 complete trees. Production conversion SHALL fail unless a human review
decision explicitly approves the exact recomputed aggregate hash and binds the
immutable audit, evidence map, production policy, license, and generated tree.
An approval SHALL NOT be reused for a later candidate.

#### Scenario: Approval is absent or stale
- **WHEN** the review status is pending, rejected, or bound to a different hash
- **THEN** no sixth vendor, production tree, domain membership, bundle, manifest, report, or registry update SHALL be written

#### Scenario: A new pin cannot inherit the previous approval
- **WHEN** the pinned revision changes
- **THEN** the previous approval SHALL NOT authorize the new candidate
- **AND** the previous anchor SHALL remain readable as historical evidence

#### Scenario: Approved candidate is published and verified
- **WHEN** the review is approved and its candidate aggregate, approved aggregate, policy hash, approver and time match the rendered trees
- **THEN** conversion SHALL publish the vendor projection and the central registry
- **AND** output checking and idempotence SHALL succeed against the approved bytes

### Requirement: Capability SHALL Be Preserved Under Safety Adaptation
Every admitted generated Skill SHALL preserve its complete source body, declared
inputs, outputs, main workflow, examples, and teacher-, mixed-, or student-facing
interaction. Safety adaptation MAY add authority, privacy, analytics, wellbeing,
diagnosis, consent, and human-oversight boundaries but SHALL NOT remove core
capability.

#### Scenario: Adapted body is compared to source
- **WHEN** generated markers and inserted boundary blocks are removed
- **THEN** the remaining body SHALL equal the pinned source body
- **AND** input and output schema values SHALL remain semantically identical
