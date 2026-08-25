## Purpose
Define the five generated Companion Skills and their authority boundaries over current file contracts.

## Requirements

### Requirement: Canonical Five-Workflow Manifest

ResearchSpec SHALL define exactly five Companion workflows named `researchspec-navigate`, `researchspec-propose`, `researchspec-decide`, `researchspec-verify`, and `researchspec-cli-handbook` in one typed manifest.

#### Scenario: Manifest is the only companion registry

- **WHEN** Companion Skills or command wrappers are projected
- **THEN** all five unique IDs SHALL come from the same typed manifest
- **AND** every entry SHALL provide an installed Skill ID, description, name, and canonical workflow content
- **AND** the four ARSU intents SHALL remain a separate family

### Requirement: Self-Contained Workflow Skills

Each installed companion SHALL be usable from its own `SKILL.md` without a runtime companion reference or companion-owned executable.

#### Scenario: Installed skill contains actionable guidance

- **WHEN** a companion is rendered
- **THEN** its `SKILL.md` SHALL contain Mission, When to Use, Do Not Use, Inputs, CLI Examples, Workflow, Decision Table, Failure Recovery, Output Contract, Guardrails, and Completion sections
- **AND** required common CLI discipline and any catalog-derived capability guidance SHALL be inlined at build time
- **AND** it SHALL NOT install companion scripts, state, assets, `agents/openai.yaml`, or `references/cli-discipline.md`

#### Scenario: Near-miss routes to the correct owner

- **WHEN** a request belongs to an ARSU producer, deterministic check, control mutation, or archive transaction
- **THEN** the skill SHALL route to that ARSU workflow or existing CLI command instead of expanding its own responsibility

### Requirement: Navigate Distinguishes Research And Zotero Tasks

Navigate SHALL classify a request as ResearchSpec/ARSU research or a
Zotero-bound library task before root-run confirmation. A broad Zotero request
SHALL use `zotero-library-agent`; an already explicit Zotero task MAY go
directly to the matching task Skill.

#### Scenario: Broad research request needs literature

- **WHEN** the user asks for research whose literature work is one part of an
  ARSU producer request
- **THEN** Navigate SHALL retain the ARSU producer
- **AND** it SHALL describe Zotero as a nested provider rather than a separate
  ResearchSpec run

#### Scenario: User asks to inspect a Zotero collection

- **WHEN** the user's primary intent is a bounded current-library query
- **THEN** Navigate SHALL use the Zotero query task through the Adapter
  surface
- **AND** it SHALL NOT start a ResearchSpec workflow merely to access the
  library

### Requirement: Navigate Presents Contextual Source Policy

Each literature-bearing run entry SHALL present a compact source-policy card before
root-run confirmation. Full Adapter setup or consent SHALL be requested only when
first needed, readiness changed, private scope is requested, or library-bound
or managed-library behavior applies.

#### Scenario: User previously skipped Adapter setup

- **WHEN** ordinary literature research starts and live readiness is unchecked
- **THEN** Navigate SHALL offer contextual setup, a one-run skip and the
  workspace prompt preference
- **AND** skipping SHALL not block ordinary external research

#### Scenario: Managed-library mode is proposed

- **WHEN** the producer would import accepted literature into a collection
- **THEN** Navigate SHALL request separate run- and collection-bound consent
- **AND** plugin or root-run confirmation SHALL NOT imply that consent

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

### Requirement: Independent CLI Handbook Companion

`researchspec-cli-handbook` SHALL provide the generated static CLI command, payload, selector, and workspace-contract reference. Its description SHALL require loading whenever an Agent uses, invokes, explains, inspects, troubleshoots, or modifies ResearchSpec CLI or workspace behavior.

#### Scenario: ResearchSpec use triggers the handbook Skill

- **WHEN** an Agent works with ResearchSpec commands, payloads, selectors, status, checks, workspace contracts, or generated projections
- **THEN** it SHALL load `researchspec-cli-handbook`
- **AND** Navigate SHALL remain responsible for workflow routing rather than owning the handbook tree

### Requirement: Companions Use Current File Contracts
Navigate, Propose, Decide and Verify SHALL use stable specs, graph profiles, run/node files, run
handoffs and project changes. Companions SHALL
NOT reconstruct or guess the workflow frontier from Skill prose.

#### Scenario: Navigate explains current work
- **WHEN** a user asks to resume or understand a project
- **THEN** Navigate uses status and directed selectors, identifies known facts and unknowns, and does
  not start a run without a confirmed profile entry

#### Scenario: Frontier is requested
- **WHEN** an Agent asks which action is legal next
- **THEN** the Companion returns the graph-derived `status --json` frontier and the corresponding
  selector instructions
- **AND** it does not present a prose-derived next-step plan

### Requirement: Companion Decisions Respect File Ownership
Verify SHALL propose Gate findings, Decide SHALL record only the relevant owning run/node decision,
and Propose SHALL create adaptable project change documents.

#### Scenario: Formal Gate is reviewed
- **WHEN** Verify has prepared a recommendation and the user confirms a verdict
- **THEN** Decide updates only the Gate in the owning node/run file

#### Scenario: Node completion is requested
- **WHEN** a producer has submitted outputs
- **THEN** the Companion SHALL direct `advance node:<run>/<node>` through the CLI and SHALL NOT edit
  node state directly

### Requirement: Navigate Separates Alternate-Model Consent

Navigate SHALL keep host-native alternate-model delegation separate from run-entry, plugin, Adapter,
Gate and branch confirmations. It SHALL present the proposed host model, disclosed content category,
and cost before dispatch and scope the consent to the current run/node instance.

#### Scenario: Alternate model is not confirmed or unavailable

- **WHEN** the user declines, the host cannot dispatch the model, or the result is structurally invalid
- **THEN** Navigate SHALL leave the run frontier unchanged
- **AND** the producer SHALL disclose single-model fallback rather than configure or call a model service

#### Scenario: Another instance starts

- **WHEN** a child, branch, node or run instance becomes current
- **THEN** Navigate SHALL obtain a fresh alternate-model confirmation if the producer proposes one

### Requirement: Companion Guidance Exposes Only Graph Runtime Actions

All five Companion Skills SHALL derive resume, navigation, proposal, decision and verification guidance from `status --json` and graph selectors. Their generated instructions SHALL expose only current profile, run, node, Gate, Decision and change actions.

#### Scenario: Companion resumes active work

- **WHEN** a Companion Skill inspects an active graph run
- **THEN** it directs the Agent to an eligible node, Gate, Decision or pending child-run selector returned by current status

#### Scenario: Generated companion contains retired guidance

- **WHEN** Companion generation or checking finds a retired selector family
- **THEN** generation validation fails
