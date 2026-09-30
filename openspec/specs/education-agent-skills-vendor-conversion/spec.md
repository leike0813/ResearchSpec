# Education Agent Skills Vendor Conversion

## Purpose

Define the reviewed conversion and publication contract that turns admitted
Education Agent Skills records into complete static ResearchSpec Skill trees
without adding runtime authority, commands, dependencies, or provider behavior.

## Requirements

### Requirement: Education Admission SHALL Cover Every Audited Skill
ResearchSpec SHALL resolve every one of the 165 immutable Education Agent Skills records exactly once. The 19 source-bound original-framework-risk Skills and 10 Sean Hu-attributed Skills SHALL remain excluded; every admitted Skill SHALL be authored only by Gareth Manning under the reviewed CC BY-SA 4.0 repository claim.

#### Scenario: Admission policy is loaded
- **WHEN** the immutable audit and production policy are validated
- **THEN** exactly 136 Skills SHALL be admitted and 29 excluded
- **AND** any changed contributor, source hash, original-framework set, or unclassified record SHALL fail validation

### Requirement: Evidence Adaptation SHALL Cover Every Declaration
ResearchSpec SHALL classify all 872 immutable evidence declarations. A declaration mapped to any unresolved or conflicting work SHALL be marked in the complete frontmatter citation and in every safely matched complete body unit. Unmarked citations SHALL disclose identity verification only and SHALL NOT imply claim-support review.

#### Scenario: Generated markers are inspected
- **WHEN** a generated Skill contains unresolved evidence
- **THEN** every marker SHALL be paired and non-nested
- **AND** the adaptation catalog SHALL bind the marker to evidence ID, source path, source SHA-256, and work IDs
- **AND** verified-only units SHALL NOT be marked

### Requirement: Capability SHALL Be Preserved Under Safety Adaptation
Every admitted generated Skill SHALL preserve its complete source body, declared inputs, outputs, main workflow, examples, and teacher-, mixed-, or student-facing interaction. Safety adaptation MAY add authority, privacy, analytics, wellbeing, diagnosis, consent, and human-oversight boundaries but SHALL NOT remove core capability.

#### Scenario: Adapted body is compared to source
- **WHEN** generated markers and inserted boundary blocks are removed
- **THEN** the remaining body SHALL equal the pinned source body
- **AND** input and output schema values SHALL remain semantically identical

### Requirement: Principled Safety Blockers SHALL Be Narrow
Production exclusion for safety SHALL be limited to unavoidable clinical diagnosis or treatment, hidden profiling or monitoring, no-human-high-risk learner decisions, unavoidable unauthorized sensitive-data transmission or persistence, ResearchSpec workflow authority, or unproved content origin. A blocker SHALL exclude the Skill rather than publish a reduced substitute.

#### Scenario: Learner-facing capability is safe with boundaries
- **WHEN** a student-facing, wellbeing, privacy, or analytics Skill can retain its complete capability under explicit consent, data-minimization, educational-scope, safeguarding, and human-oversight boundaries
- **THEN** it MAY remain admitted
- **AND** it SHALL NOT be mechanically rewritten as teacher-facing

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

### Requirement: Relationships SHALL Remain Advisory
All 813 upstream `chains_well_with` declarations SHALL be classified exactly once as advisory relationships. Generated Registry Schema 1 dependency arrays SHALL remain empty.

#### Scenario: Domain installation is resolved
- **WHEN** an Education domain is installed
- **THEN** only its direct reviewed Skills SHALL determine the installation closure
- **AND** advisory relationships SHALL NOT install sibling Skills

### Requirement: Aggregate Hash Approval SHALL Gate Production
Preview generation SHALL compute per-file, per-Skill, and aggregate hashes for all 136 complete trees. Production conversion SHALL fail unless a human review decision explicitly approves the exact recomputed aggregate hash and binds the immutable audit, evidence map, production policy, license, and generated tree.

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

### Requirement: Education Conversion SHALL Remain Lifecycle-Inert
Preview, conversion, checking, idempotence, packaging, installation, discovery, update, and registry assembly SHALL inspect and copy static Skill text only. They SHALL NOT run upstream installers, MCP code, tests, scripts, dependencies, browsers, hosted services, credentials, or learner-data operations.

#### Scenario: Maintainer previews the vendor
- **WHEN** the complete preview is generated
- **THEN** only local pinned files and checked-in policy inputs SHALL be read
- **AND** no upstream or generated runtime behavior SHALL execute

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
