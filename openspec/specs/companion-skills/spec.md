## Purpose
Define the five generated Companion Skills and their authority boundaries over current file contracts.

## Requirements

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

### Requirement: Companions Use Current File Contracts

Navigate, Propose, Decide and Verify SHALL use stable specs, graph profiles, run/node files, run handoffs and project changes. Navigate SHALL additionally maintain ordinary task notes under `work/researchspec-notes/<task-id>.md` for sustained standalone research work, which SHALL be non-authoritative and SHALL NOT be treated as workflow state. When resuming ordinary work, Navigate SHALL check the note against the recorded project materials and SHALL NOT report or act on any run, node, Gate, Decision, or handoff state that the CLI does not confirm. Companions SHALL NOT reconstruct or guess the workflow frontier from Skill prose.

#### Scenario: Navigate explains current work
- **WHEN** a user asks to understand a project
- **THEN** Navigate uses status and directed selectors, identifies known facts and unknowns, and does not start a run without a confirmed profile entry

#### Scenario: Frontier is requested
- **WHEN** an Agent asks which action is legal next
- **THEN** the Companion returns the graph-derived `status --json` frontier and the corresponding selector instructions
- **AND** it does not present a prose-derived next-step plan

#### Scenario: Navigate continues an ordinary task
- **WHEN** a user returns to continue sustained standalone work
- **THEN** Navigate reads the related task note and current materials to restore context
- **AND** it does not require or create graph state for that continuation

#### Scenario: Navigate distinguishes ordinary continuation from run resume
- **WHEN** both a task note and an unfinished confirmed run are present
- **THEN** Navigate keeps them separate and uses status plus exact node instructions to resume the run
- **AND** it does not substitute the task note for run state

#### Scenario: Ordinary task resume verifies materials
- **WHEN** Navigate resumes a noted ordinary task
- **THEN** it checks the recorded materials and outputs before continuing
- **AND** it asks one focused question only when a difference changes the task identity, its inputs, or the next step and the materials do not settle it

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

Companion procedures SHALL distinguish standalone file work from graph runtime actions. Ordinary task notes are standalone file work and SHALL NOT be presented as run, node, handoff, Gate, Decision, or transition mutations. A standalone capability SHALL select procedures from a natural request and report each produced ordinary file path without claiming a graph action. Only graph activation may expose or request run, node, handoff, Gate, Decision, or transition mutations.

#### Scenario: Standalone Companion completes

- **WHEN** a hidden Companion runs in standalone mode
- **THEN** it returns ordinary output paths without claiming a graph action

#### Scenario: Governed Companion completes

- **WHEN** a Companion runs under a graph packet
- **THEN** it follows the packet's exact graph selector and authority

#### Scenario: Companion resumes active work

- **WHEN** a Companion resumes governed work
- **THEN** it reads status and exact node instructions before any state action

#### Scenario: Generated companion contains retired guidance

- **WHEN** Companion generation detects retired runtime or plugin-instruction guidance
- **THEN** generation validation fails

#### Scenario: Natural request names no procedure

- **WHEN** the user describes a research task in ordinary language without naming a procedure, capability, or command
- **THEN** Navigate discovers and chains capabilities from the request and reports each produced ordinary file path
- **AND** it does not require the user to name the procedure before work can start
