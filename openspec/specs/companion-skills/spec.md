## Purpose

ResearchSpec defines four self-contained Companion workflows that combine user intent, catalog route facts, and CLI-owned workspace evidence without duplicating ARSU semantic work or deterministic runtime authority.
## Requirements
### Requirement: Canonical Four-Workflow Manifest

ResearchSpec SHALL define exactly four companion workflows named `researchspec-navigate`, `researchspec-propose`, `researchspec-decide`, and `researchspec-verify` in one typed manifest.

#### Scenario: Manifest is the only companion registry

- **WHEN** companion skills or command wrappers are projected
- **THEN** all four unique IDs SHALL come from the same typed manifest
- **AND** every entry SHALL provide companion-specific description, category, tags, installed skill ID, and canonical workflow content
- **AND** the four ARSU intents SHALL remain a separate family

### Requirement: Self-Contained Workflow Skills

Each installed companion SHALL be usable from its own `SKILL.md` without a runtime companion reference or companion-owned executable.

#### Scenario: Installed skill contains actionable guidance

- **WHEN** a companion is rendered
- **THEN** its `SKILL.md` SHALL contain Mission, When to Use, Do Not Use, Inputs, CLI Examples, Workflow, Decision Table, Failure Recovery, Output Contract, Guardrails, and Completion sections
- **AND** required common CLI discipline and any catalog-derived route projection SHALL be inlined at build time
- **AND** it SHALL NOT install companion scripts, state, assets, `agents/openai.yaml`, or `references/cli-discipline.md`

#### Scenario: Near-miss routes to the correct owner

- **WHEN** a request belongs to an ARSU producer, deterministic check, artifact submit, transition advance, or archive transaction
- **THEN** the skill SHALL route to that ARSU workflow or existing CLI command instead of expanding its own responsibility

### Requirement: Navigate Workflow

`researchspec-navigate` SHALL provide Route, Resume, Explain, and Export branches by combining catalog-derived route facts with CLI-owned workspace state.

#### Scenario: Route presents a confirmable route summary

- **WHEN** the user supplies a vague, cross-Skill, or changed academic goal
- **THEN** Navigate SHALL present matching routes and near misses with Skill, mode, prerequisites, artifacts, formal Gate policy, risk, and cost
- **AND** it SHALL pair those facts with current workspace availability
- **AND** Start execution SHALL require confirmation of the exact dry-run plan

#### Scenario: Resume follows only the CLI frontier

- **WHEN** work already exists
- **THEN** Navigate SHALL dispatch ready work to its ARSU producer, Gates to Verify, and multiple transitions to Decide
- **AND** it MAY execute an exact receipt-bound unique non-semantic transition
- **AND** it SHALL NOT reconstruct graph state or require route reconfirmation without route or plan drift

#### Scenario: Explain remains read-only

- **WHEN** the user asks what exists, how state relates, or why work is blocked
- **THEN** Navigate SHALL use status, list, show, and targeted check
- **AND** it SHALL distinguish evidence, inference, unknown, and conflict without writing files

#### Scenario: Export previews derived output

- **WHEN** the user asks to resume elsewhere, hand off, export, or share context
- **THEN** Navigate SHALL select handoff stdout, handoff write, or pack based on the audience and persistence need
- **AND** it SHALL explain derivation, staleness, privacy, artifact inclusion, size, and overwrite risk
- **AND** any write SHALL use dry-run followed by explicit confirmation

### Requirement: Propose Workflow

`researchspec-propose` SHALL transform an evidence-backed high-impact semantic change into one validated pending contract change without applying it.

#### Scenario: Proposal is inspected, previewed, and confirmed

- **WHEN** a user asks to change research intent, claim strength or limits, manuscript constraints, source policy, or workflow semantics
- **THEN** the skill SHALL inspect the current target and referenced evidence
- **AND** it SHALL build the strict proposal JSON input, run `propose` with `--dry-run --json`, and explain diff and risk
- **AND** it SHALL require explicit creation confirmation before execution
- **AND** it SHALL finish with `show` and relevant `check` views

#### Scenario: Proposal cannot silently become accepted state

- **WHEN** proposal creation succeeds
- **THEN** the skill SHALL report the pending selector and required human review
- **AND** it SHALL NOT apply stable-spec changes, append a decision, or treat `--yes` as acceptance

### Requirement: Verify Workflow

`researchspec-verify` SHALL perform evidence-linked semantic readiness and formal Gate verification only after deterministic contract checks have passed.

#### Scenario: Verification produces an evidence-linked scorecard

- **WHEN** the user asks whether research work is coherent or ready to advance
- **THEN** the skill SHALL first run relevant deterministic checks
- **AND** it SHALL assess applicable research and workflow evidence and distinguish pass, concern, blocker, and unknown
- **AND** every finding SHALL cite an evidence ID or workspace path

#### Scenario: Gate challenge triggers reverification

- **WHEN** a formal Gate verdict is challenged
- **THEN** Verify SHALL display validator, evidence, limitations and consequences, create a reverification attempt, and require human confirmation before Gate submission
- **AND** it SHALL NOT turn a challenge into an override shortcut

### Requirement: Decide Workflow

`researchspec-decide` SHALL be the only Companion that records a semantic branch, pending-item decision, or failed-Gate override.

#### Scenario: Decision uses a complete preview-confirm-execute cycle

- **WHEN** one unique decision target is selected
- **THEN** the skill SHALL inspect the exact target and trusted evidence, collect the selected outcome and required reason, and run the complete command with `--dry-run --json`
- **AND** it SHALL explain semantic impact and planned writes before explicit confirmation
- **AND** it SHALL execute the identical payload and recheck receipt, status, and the relevant deterministic target
- **AND** `--yes` SHALL NOT substitute for the user's decision

#### Scenario: Parent confirmation does not select a branch

- **WHEN** a pipeline exposes multiple transitions, a mid-entry choice, review branch, or failed-Gate override
- **THEN** Decide SHALL bind only the explicit user choice to the current scoped evidence
- **AND** delegated parent confirmation SHALL NOT authorize the decision

### Requirement: Companion Guidance Respects Composed Subflow Authority

Companion Skills SHALL treat the CLI child-aware frontier as the only authority for starting pipeline stages and revision rounds.

#### Scenario: A pipeline plan names a likely next Skill

- **WHEN** the named child selector is not present in current CLI status
- **THEN** the Agent SHALL NOT start or simulate that child from prose alone

### Requirement: Companion Guidance Preserves Human Boundaries

Companion Skills SHALL distinguish delegated mechanical child starts and unique transitions from formal Gate confirmation, override Decisions, mid-entry choices, and review branch Decisions.

#### Scenario: Parent route was confirmed

- **WHEN** a child start is delegated by the exact parent plan
- **THEN** the Agent MAY execute that start but SHALL NOT use the parent confirmation to pass a Gate or select a branch

### Requirement: Current Companion Submission Guidance
Companion Skills SHALL describe only scoped automatic or manual submission and SHALL contain no retired workflow migration record.

#### Scenario: Navigate explains candidate submission
- **WHEN** a candidate is ready
- **THEN** guidance SHALL use the current scoped submission policy and authority boundary

