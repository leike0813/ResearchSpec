## ADDED Requirements

### Requirement: Canonical Four-Workflow Manifest

ResearchSpec SHALL define exactly four companion workflows named `researchspec-navigate`, `researchspec-propose`, `researchspec-decide`, and `researchspec-verify` in one typed manifest.

#### Scenario: Manifest is the only companion registry

- **WHEN** companion skills or command wrappers are projected
- **THEN** all four unique IDs SHALL come from the same typed manifest
- **AND** every entry SHALL provide companion-specific description, category, tags, installed skill ID, and canonical workflow content
- **AND** the four ARSU intents SHALL remain a separate family

## MODIFIED Requirements

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

### Requirement: Verify Workflow

`researchspec-verify` SHALL perform evidence-linked semantic readiness and formal Gate verification only after deterministic contract checks have passed.

#### Scenario: Verification produces an evidence-linked scorecard

- **WHEN** the user asks whether research work is coherent or ready to advance
- **THEN** the skill SHALL first run relevant deterministic checks
- **AND** it SHALL assess the applicable research and workflow evidence and distinguish pass, concern, blocker, and unknown
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

## ADDED Requirements

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

## REMOVED Requirements

### Requirement: Canonical Nine-Workflow Manifest
**Reason**: The product surface now has four canonical Companion workflows.
**Migration**: Use the Canonical Four-Workflow Manifest with Navigate, Propose, Decide, and Verify.

### Requirement: Explore Workflow
**Reason**: Its read-only orientation behavior is owned by Navigate Explain.
**Migration**: Invoke `researchspec-navigate` with an explain/orientation request.

### Requirement: Check Workflow
**Reason**: Deterministic validation is already a direct public CLI capability.
**Migration**: Use `researchspec check` directly; semantic changes still route to Propose.

### Requirement: Next Workflow
**Reason**: Resume and frontier dispatch are owned by Navigate Resume.
**Migration**: Invoke `researchspec-navigate` to resume from CLI status and instructions.

### Requirement: Context Workflow
**Reason**: Context selection and export are owned by Navigate Export.
**Migration**: Invoke `researchspec-navigate` for handoff or pack selection.

### Requirement: Archive Workflow
**Reason**: Resolved-item archive is already a direct public CLI transaction.
**Migration**: Inspect the resolved selector and use `researchspec archive` with its preview-confirm-execute protocol.

### Requirement: Submit Workflow
**Reason**: Artifact and Gate submission are direct CLI transactions controlled by dynamic instructions.
**Migration**: Use `researchspec submit work:` or `researchspec submit gate:` with dry-run, expected plan/hash and confirmation as applicable.

### Requirement: Next Routes Candidate Submission
**Reason**: Candidate submission dispatch is now part of Navigate Resume and generated ARSU preflight.
**Migration**: Follow the CLI frontier and direct `researchspec submit` protocol.

### Requirement: Transitional Subflow-Aware Next Workflow
**Reason**: Navigate is now the canonical child-aware dispatcher.
**Migration**: Use Navigate Resume and scoped CLI frontier selectors.

### Requirement: Transitional Submit Workflow Boundary
**Reason**: The transitional Submit Companion is retired.
**Migration**: Automatic work follows generated preflight; manual or legacy work uses direct CLI submit or reports the authority boundary.

### Requirement: Transitional Gate And Transition Guidance
**Reason**: The permanent Navigate, Verify and Decide boundaries replace transitional Next guidance.
**Migration**: Route Gates to Verify, branch/override choices to Decide, and unique mechanical transitions through Navigate.
