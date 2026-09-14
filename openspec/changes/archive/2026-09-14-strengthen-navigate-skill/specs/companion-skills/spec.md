## MODIFIED Requirements

### Requirement: Canonical Four-Workflow Manifest

ResearchSpec SHALL keep four canonical Companion identities but SHALL expose only `researchspec-navigate` as a host-visible Skill. Propose, Decide, and Verify SHALL be hidden procedures in the runtime-derived catalog.

#### Scenario: Companion catalog is loaded
- **WHEN** Agent delivery and procedure discovery read the Companion catalog
- **THEN** delivery selects only Navigate while procedure discovery includes the other three identities exactly once

#### Scenario: Manifest is the only companion registry
- **WHEN** delivery and procedure discovery resolve Companions
- **THEN** both derive identities and content from the canonical Companion manifest

### Requirement: Self-Contained Workflow Skills

Each installed companion SHALL be usable from its own `SKILL.md` without a runtime companion reference or companion-owned executable. Navigate SHALL include generated CLI-handbook and ARSU-route references for progressive detail.

#### Scenario: Installed skill contains actionable guidance

- **WHEN** a companion is rendered
- **THEN** its `SKILL.md` SHALL contain its complete ordinary execution flow, input/output contract, authority boundaries, failure recovery, reference-loading rules, and completion criteria
- **AND** required common CLI discipline and safety-critical source-policy guidance SHALL be inlined at build time
- **AND** it SHALL NOT install companion scripts, state, assets, or `agents/openai.yaml`

#### Scenario: Navigate references are rendered

- **WHEN** Navigate is rendered
- **THEN** its tree SHALL include `references/cli-handbook.md` from the typed CLI catalogs and `references/arsu-routes.md` from the converter-owned routing catalog
- **AND** the main `SKILL.md` SHALL identify the exact conditions under which each reference is read

#### Scenario: Near-miss routes to the correct owner

- **WHEN** a request belongs to an ARSU producer, deterministic check, control mutation, or archive transaction
- **THEN** the skill SHALL route to that procedure or existing CLI command instead of expanding its own responsibility

### Requirement: Navigate Provides Progressive CLI Discovery

Navigate SHALL be the complete entry controller for standalone procedure selection and graph-governed work. It SHALL use compact CLI discovery first and SHALL load its generated references only when the current request needs their detail.

#### Scenario: Request is ambiguous
- **WHEN** the user asks for broad or cross-capability work
- **THEN** Navigate reads bounded status when a workspace exists, loads `references/arsu-routes.md`, and searches compact procedure cards before selecting one body

#### Scenario: Detailed CLI help is needed
- **WHEN** Navigate must construct a nontrivial payload, explain the complete CLI, or troubleshoot syntax, options, or error classes
- **THEN** it reads `references/cli-handbook.md` before acting

#### Scenario: User asks which command or option to use
- **WHEN** the user asks a CLI discovery question
- **THEN** Navigate starts with compact catalog help and reads its local handbook only when complete detail is needed

#### Scenario: Compact discovery is sufficient
- **WHEN** command metadata or procedure cards fully resolve the request
- **THEN** Navigate proceeds without loading an unnecessary reference

#### Scenario: Static discovery reaches a workspace action
- **WHEN** static discovery leads to a graph action
- **THEN** Navigate reads current status and exact selector instructions before acting

## REMOVED Requirements

### Requirement: Independent CLI Handbook Companion

**Reason**: CLI operating detail is supporting material for the sole visible Navigate entry, not a separately activatable semantic procedure.

**Migration**: Read `researchspec-navigate/references/cli-handbook.md` or the public `docs/user/cli-handbook.md` generated from the same typed catalogs.

## RENAMED Requirements

- FROM: `### Requirement: Canonical Five-Workflow Manifest`
- TO: `### Requirement: Canonical Four-Workflow Manifest`
