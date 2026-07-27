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
- **AND** Start execution SHALL require the descriptor-declared named
  confirmation or plan binding

#### Scenario: Resume follows only the CLI frontier

- **WHEN** work already exists
- **THEN** Navigate SHALL dispatch ready work to its ARSU producer, Gates to Verify, and multiple transitions to Decide
- **AND** it MAY execute a unique non-semantic transition according to its
  descriptor-declared execution policy
- **AND** it SHALL NOT reconstruct graph state or require route reconfirmation without route or plan drift

#### Scenario: Explain remains read-only

- **WHEN** the user asks what exists, how state relates, or why work is blocked
- **THEN** Navigate SHALL use status, list, show, and targeted check
- **AND** it SHALL distinguish evidence, inference, unknown, and conflict without writing files

#### Scenario: Export previews derived output

- **WHEN** the user asks to resume elsewhere, hand off, export, or share context
- **THEN** Navigate SHALL select handoff stdout, handoff write, or pack based on the audience and persistence need
- **AND** it SHALL explain derivation, staleness, privacy, artifact inclusion, size, and overwrite risk
- **AND** any plan-bound write SHALL use dry-run followed by the explicit
  confirmation required by its descriptor

### Requirement: Propose Workflow

`researchspec-propose` SHALL transform an evidence-backed high-impact semantic change into one validated pending contract change without applying it.

#### Scenario: Proposal is inspected, previewed, and confirmed

- **WHEN** a user asks to change research intent, claim strength or limits, manuscript constraints, source policy, or workflow semantics
- **THEN** the skill SHALL inspect the current target and referenced evidence
- **AND** it SHALL build the descriptor-declared semantic proposal input and
  explain diff and risk
- **AND** it SHALL require the creation confirmation declared by that descriptor
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

### Requirement: Navigate Plugin Skill Recommendation
The Navigate Companion SHALL use compact packaged-domain JSON to discover
installed or uninstalled semantically matching Skills, obtain batch consent
before installation, and invoke eligible installed Skills only as advisory
helpers of the canonical ARSU producer.

#### Scenario: Uninstalled domain matches user intent
- **WHEN** one or more specific Skills in an available uninstalled domain
  materially fit a Route or ready-work need
- **THEN** Navigate MAY propose at most three domains with compact impact
- **AND** it SHALL install them only through preview, explicit confirmation, and
  matching plan-hash execution

#### Scenario: Installed helper matches active work
- **WHEN** a projected Skill materially assists the current ARSU producer
- **THEN** Navigate MAY dispatch it natively or through the read-only instruction
  bridge with a bounded helper brief
- **AND** the recommendation or invocation SHALL NOT create a route, subflow,
  work item, Gate, Decision, receipt, frontier, producer change, or second state
  machine

#### Scenario: Augmentation is declined or unavailable
- **WHEN** the user declines installation or the Skill cannot be used safely
- **THEN** Navigate SHALL continue the canonical ARSU route without treating the
  plugin as a blocker

### Requirement: Navigate Distinguishes Research And Zotero Tasks

Navigate SHALL classify a request as ResearchSpec/ARSU research or a
Zotero-bound library task before route confirmation. A broad Zotero request
SHALL route to `zotero-library-agent`; an already explicit Zotero task MAY route
directly to the matching task Skill.

#### Scenario: Broad research request needs literature

- **WHEN** the user asks for research whose literature work is one part of an
  ARSU producer route
- **THEN** Navigate SHALL retain the ARSU route
- **AND** it SHALL describe Zotero as a nested provider rather than a separate
  ResearchSpec subflow

#### Scenario: User asks to inspect a Zotero collection

- **WHEN** the user's primary intent is a bounded current-library query
- **THEN** Navigate SHALL route to the Zotero query task through the Adapter
  surface
- **AND** it SHALL NOT start a ResearchSpec workflow merely to access the
  library

### Requirement: Navigate Presents Contextual Source Policy

Each literature-bearing route SHALL present a compact source-policy card before
route confirmation. Full Adapter setup or consent SHALL be requested only when
first needed, readiness changed, private scope is requested, or library-bound
or managed-library behavior applies.

#### Scenario: User previously skipped Adapter setup

- **WHEN** ordinary literature research starts and live readiness is unchecked
- **THEN** Navigate SHALL offer contextual setup, a one-run skip and the
  workspace prompt preference
- **AND** skipping SHALL not block ordinary external research

#### Scenario: Managed-library mode is proposed

- **WHEN** the route would import accepted literature into a collection
- **THEN** Navigate SHALL request separate run- and collection-bound consent
- **AND** plugin or route confirmation SHALL NOT imply that consent

### Requirement: Companions Consume Runtime Descriptors

Navigate, Propose, Decide and Verify SHALL consume CLI status summaries, action
descriptors and case actions without reimplementing availability, state
transitions or payload schemas.

#### Scenario: Companion executes a decision

- **WHEN** Decide handles a pending Gate, patch or contract-change action
- **THEN** it SHALL obtain the current descriptor and submit only the required
  human semantic choice
- **AND** the CLI SHALL derive and validate mechanical fields

### Requirement: Companions Dispatch Through Current Descriptors

Navigate, Propose, Decide, and Verify SHALL consume the current runtime mode,
selector, semantic input template, execution policy, availability basis, and
next selectors from CLI descriptors. They SHALL not reimplement availability,
strict-only selector assumptions, or caller-authored mechanical DTO fields.

#### Scenario: Navigate resumes an adaptive run

- **WHEN** status exposes an adaptive allowed action
- **THEN** Navigate SHALL dispatch the relevant ARSU producer, Verify, or Decide
  from that action's descriptor and ownership boundary
- **AND** it SHALL not invent a strict work stage or transition

#### Scenario: Companion executes a direct action

- **WHEN** a current descriptor declares `direct`
- **THEN** the responsible Companion SHALL submit the semantic input once and
  continue from returned next selectors
- **AND** it SHALL not require external preview replay unless the user requests
  an optional dry run

### Requirement: Companions Preserve Formal Boundaries By Policy

Companions SHALL obtain named human confirmation for `human_confirmed` actions
and an approved plan hash for `plan_bound` actions. They SHALL continue to route
formal Gate verification to Verify and semantic Decisions to Decide.

#### Scenario: Verify prepares a formal Gate

- **WHEN** Verify receives a current Gate descriptor
- **THEN** it SHALL construct only the descriptor-declared semantic verdict
  input, display evidence and consequences, and obtain the required human
  confirmation and plan binding before submission

### Requirement: Navigate Provides Progressive CLI Discovery

`researchspec-navigate` SHALL keep the core distinction between static command
discovery and runtime authorization self-contained in its `SKILL.md`. It SHALL
use a three-level discovery rule: classify whether the user needs a static CLI
explanation or a workspace action; use root and command-scoped CLI help to
identify a static command and its invocation; and use current `status` followed
by `instructions <runtime-selector>` before any workspace-bound action.

#### Scenario: User asks which command or option to use

- **WHEN** the user asks for a CLI command, option, command family, or static
  invocation explanation
- **THEN** Navigate SHALL identify the smallest relevant command family from
  static discovery guidance
- **AND** it SHALL use `researchspec --help` or the selected command's `--help`
  when current executable detail is required
- **AND** it SHALL explain that static help does not authorize a workspace write

#### Scenario: Static discovery reaches a workspace action

- **WHEN** a static CLI explanation identifies an action that depends on current
  workspace state, a selector, availability, confirmation, or a plan
- **THEN** Navigate SHALL resume the canonical `status` then
  `instructions <runtime-selector>` protocol before proposing or executing that
  action
- **AND** it SHALL NOT use static guidance to infer a selector, action basis,
  accepted payload, execution policy, or authorization

### Requirement: Navigate CLI Handbook Is Optional Progressive Disclosure

The complete generated CLI handbook MAY be delivered as a Navigate-local
progressive-disclosure reference. Navigate SHALL read that reference only while
explaining static CLI behavior; its core Route, Resume, Explain, Export, and
runtime-control workflow SHALL remain complete without the reference.

#### Scenario: Handbook is available for a CLI explanation

- **WHEN** the user needs a broader static explanation that the compact
  self-contained discovery rules cannot answer
- **THEN** Navigate MAY read its local CLI handbook reference
- **AND** it SHALL treat the handbook as static discovery material rather than
  runtime state or action authority

#### Scenario: Handbook is missing or drifted

- **WHEN** the local handbook reference is missing, unavailable, or known to
  differ from its manifest-owned generated bytes
- **THEN** Navigate SHALL fall back to the relevant root or command-scoped
  `--help` output
- **AND** it SHALL continue the canonical route or runtime workflow without
  treating the reference as a blocker

## ADDED Requirements

### Requirement: Companion plan and Gate guidance
Companion Skills SHALL instruct Agents to consume policy-derived execution requirements, present the bound plan, obtain required confirmation, and preserve formal Gate authority.

#### Scenario: Plan-bound Companion action
- **WHEN** a Companion receives a plan-bound descriptor
- **THEN** it SHALL satisfy the descriptor's preview, basis, plan-hash, and confirmation requirements before execution

#### Scenario: Decision-assisted Gate evidence
- **WHEN** a waiver, not-applicable choice, or Gate override contributes to readiness
- **THEN** the Companion SHALL retain typed Decision and receipt evidence and still route the formal Gate through user-confirmed Verify
