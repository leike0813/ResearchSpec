## Purpose

ResearchSpec defines a fixed set of nine self-contained companion workflows that
orient, guide, and gate an agent working inside a ResearchSpec workspace through
read-only authoritative views and deterministic commands. Companion skills are a
separate family from the four ARSU skill groups.

## Requirements

### Requirement: Canonical Nine-Workflow Manifest

ResearchSpec SHALL define exactly nine companion workflows named
`researchspec-explore`, `researchspec-propose`, `researchspec-check`,
`researchspec-verify`, `researchspec-next`, `researchspec-context`,
`researchspec-decide`, `researchspec-submit`, and `researchspec-archive` in one
typed manifest.

#### Scenario: Manifest is the only companion registry

- **WHEN** companion skills or command wrappers are projected
- **THEN** all nine unique IDs SHALL come from the same typed manifest
- **AND** every entry SHALL provide companion-specific description, category,
  tags, installed skill ID, and canonical workflow content
- **AND** the four ARSU intents SHALL remain a separate family

### Requirement: Self-Contained Workflow Skills

Each installed companion SHALL be usable from its own `SKILL.md` without a
runtime companion reference or companion-owned executable.

#### Scenario: Installed skill contains actionable guidance

- **WHEN** a companion is rendered
- **THEN** its `SKILL.md` SHALL contain Mission, When to Use, Do Not Use, Inputs,
  CLI Examples, Workflow, Decision Table, Failure Recovery, Output Contract,
  Guardrails, and Completion sections
- **AND** required common CLI discipline SHALL be inlined at build time
- **AND** it SHALL NOT install companion scripts, state, assets,
  `agents/openai.yaml`, or `references/cli-discipline.md`

#### Scenario: Near-miss routes to the correct owner

- **WHEN** a request is for literature research, academic drafting, manuscript
  review, revision authoring, artifact registration, gate append, or stage
  transition rather than a companion workflow
- **THEN** the skill SHALL route to the responsible ARSU workflow or existing
  deterministic helper instead of expanding its own responsibility

### Requirement: Explore Workflow

`researchspec-explore` SHALL orient an agent within the current workspace using
read-only authoritative views.

#### Scenario: Workspace exploration remains evidence-bound

- **WHEN** the user asks what exists, how state relates, or why work is blocked
- **THEN** the skill SHALL combine `status`, `list`, `show`, and targeted `check`
- **AND** it SHALL report evidence paths or IDs, unknowns, viable options, and
  whether a semantic change should enter `researchspec-propose`
- **AND** it SHALL NOT perform external literature research or write files

### Requirement: Propose Workflow

`researchspec-propose` SHALL transform an evidence-backed high-impact semantic
change into one validated pending contract change without applying it.

#### Scenario: Proposal is inspected, previewed, and confirmed

- **WHEN** a user asks to change research intent, claim strength or limits,
  manuscript constraints, source policy, or workflow semantics
- **THEN** the skill SHALL inspect the current target and referenced evidence
- **AND** it SHALL build the strict proposal JSON input, run the complete
  `propose` command with `--dry-run --json`, and explain diff and risk
- **AND** it SHALL require explicit creation confirmation before execution
- **AND** it SHALL finish with `show` and relevant `check` views

#### Scenario: Proposal cannot silently become accepted state

- **WHEN** proposal creation succeeds
- **THEN** the skill SHALL report the pending selector and required human review
- **AND** it SHALL NOT apply stable-spec changes, append a decision, or treat
  `--yes` as acceptance

### Requirement: Check Workflow

`researchspec-check` SHALL explain deterministic validation and distinguish
mechanical repair from semantic change and human decision.

#### Scenario: Diagnostics determine the repair route

- **WHEN** a targeted JSON check returns diagnostics
- **THEN** the skill SHALL classify them by blocking state, severity, code, and
  affected path
- **AND** it SHALL use `--strict` only when warnings must fail
- **AND** authorized mechanical repair SHALL be followed by the same check
- **AND** semantic repair SHALL route through `researchspec-propose`

#### Scenario: Protected state is not guessed

- **WHEN** repair requires changing research meaning, accepting a pending item,
  or replacing drifted generated content
- **THEN** the skill SHALL stop for the appropriate proposal, decision, or
  explicit ownership action instead of guessing or applying `--force`

### Requirement: Verify Workflow

`researchspec-verify` SHALL perform read-only semantic readiness assessment only
after deterministic contract checks have passed.

#### Scenario: Verification produces an evidence-linked scorecard

- **WHEN** the user asks whether research work is coherent or ready to advance
- **THEN** the skill SHALL first run relevant deterministic checks
- **AND** it SHALL assess research question alignment, source coverage, claim
  support, strength and limits, manuscript constraints, workflow artifacts,
  gates, and decisions
- **AND** every finding SHALL cite an evidence ID or workspace path and distinguish
  pass, concern, blocker, and unknown
- **AND** it SHALL write no files

#### Scenario: Verify routes adjacent work correctly

- **WHEN** the issue is schema validity, a desired contract change, or manuscript
  quality review
- **THEN** the skill SHALL route respectively to `researchspec-check`,
  `researchspec-propose`, or the ARSU reviewer rather than duplicating that work

### Requirement: Next Workflow

`researchspec-next` SHALL restore cross-session context and recommend exactly one
primary next action from authoritative lifecycle state and the CLI-derived
workflow frontier.

#### Scenario: Recommendation follows fixed priority

- **WHEN** the user asks what to do next
- **THEN** the skill SHALL prioritize blocking diagnostics, blocking gates,
  pending changes or patches, archivable resolved items, ready work items, and
  workflow configuration or transition boundaries in that order
- **AND** it SHALL map decision events to their originating pending item
- **AND** it SHALL provide one primary action and no more than two alternatives
- **AND** it SHALL perform no high-impact write

#### Scenario: Ready work item uses dynamic instructions

- **GIVEN** status exposes one ready `work:<id>` selector after higher-priority
  lifecycle work is exhausted
- **WHEN** the skill prepares its recommendation
- **THEN** it SHALL call `researchspec instructions work:<id> --json`
- **AND** it SHALL use the returned producer Skill, dependencies, output, allowed
  writes, validation, and completion policy
- **AND** it SHALL NOT reconstruct those facts from static Skill text

#### Scenario: Ambiguous or unavailable frontier is not guessed

- **WHEN** several equal-priority work items are ready, the graph is absent or
  invalid, or the active stage requires an unavailable transition
- **THEN** the skill SHALL respectively request a user choice, route to
  configuration/check, or report the transition boundary
- **AND** it SHALL NOT infer a producer Skill, edit state, or claim the run is
  complete

### Requirement: Context Workflow

`researchspec-context` SHALL choose and safely preview the appropriate derived
handoff or deterministic context pack.

#### Scenario: Context output matches the sharing need

- **WHEN** a user asks to resume, hand off, export, or share workspace context
- **THEN** the skill SHALL choose handoff stdout, handoff write, or pack based on
  audience and persistence needs
- **AND** it SHALL explain derived-view limits, sensitive artifact exposure,
  artifact inclusion, output size, and overwrite risk
- **AND** writing variants SHALL be dry-run before explicit confirmation

### Requirement: Decide Workflow

`researchspec-decide` SHALL be the only public workflow that accepts, rejects,
or postpones a pending semantic item.

#### Scenario: Decision uses a complete preview-confirm-execute cycle

- **WHEN** one unique change, draft patch, or gate decision is selected
- **THEN** the skill SHALL inspect the item, collect decision, actor, and required
  reason, then run the complete command with `--dry-run --json`
- **AND** it SHALL explain semantic impact and planned writes before obtaining
  explicit confirmation
- **AND** it SHALL execute the identical payload and recheck receipt, status, and
  the relevant deterministic target
- **AND** `--yes` SHALL NOT substitute for the user's decision

#### Scenario: Decision failure preserves authority boundaries

- **WHEN** the CLI reports ambiguity, target drift, missing evidence, blocking
  gate, write conflict, or failed postcondition
- **THEN** the skill SHALL stop, report recovery steps, and SHALL NOT hand-edit
  stable specs, receipts, registries, or ledgers

### Requirement: Archive Workflow

`researchspec-archive` SHALL archive only a unique resolved change or draft
patch with complete authoritative lifecycle evidence.

#### Scenario: Archive is inspected, previewed, and confirmed

- **WHEN** a candidate appears resolved
- **THEN** the skill SHALL inspect its status, decision, receipt, registry, and
  blocking gate evidence
- **AND** it SHALL run `archive` with `--dry-run --json`, explain source and
  destination, and obtain explicit confirmation before execution
- **AND** success SHALL be followed by status and runtime checks

#### Scenario: Missing evidence is not fabricated

- **WHEN** archive validation reports unresolved state, missing receipt or
  decision evidence, blocking gate, collision, or drift
- **THEN** the skill SHALL stop and identify the responsible earlier workflow
- **AND** it SHALL NOT invent, append, bypass, or repair lifecycle evidence

### Requirement: Submit Workflow

`researchspec-submit` SHALL preview, confirm, execute, and verify one workflow-owned artifact submission without modifying the candidate or expanding runtime authority.

#### Scenario: Submit uses preview-confirm-execute

- **GIVEN** status and instructions identify a ready work item with an unregistered candidate
- **WHEN** the user asks to submit it
- **THEN** the skill SHALL run dry-run, present candidate hash, validation, receipt/registry writes, and excluded state/Gate/Decision effects
- **AND** it SHALL obtain explicit confirmation before executing the identical input with expected hash and `--yes`
- **AND** it SHALL finish with status and artifact checks

#### Scenario: Validation failure returns to producer

- **WHEN** candidate validation, dependency coverage, or workflow readiness fails
- **THEN** the skill SHALL report the structured reason and route content repair to the producer Skill
- **AND** it SHALL NOT edit candidate, registry, receipt, state, or ledgers directly

### Requirement: Next Routes Candidate Submission

`researchspec-next` SHALL distinguish work that needs semantic production from a produced candidate that needs deterministic submission.

#### Scenario: Unregistered candidate routes to Submit

- **WHEN** a ready work item reports `candidate_unregistered`
- **THEN** Next SHALL recommend `researchspec-submit work:<id>` before recommending downstream semantic work
- **AND** a ready item without a candidate SHALL continue to route to its producer Skill
