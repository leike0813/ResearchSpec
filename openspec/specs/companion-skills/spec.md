## Purpose
Define the five generated Companion Skills and their authority boundaries over current file contracts.

## Requirements

### Requirement: Canonical Five-Workflow Manifest

ResearchSpec SHALL keep five canonical Companion identities but SHALL expose only `researchspec-navigate` as a host-visible Skill. Propose, Decide, Verify, and the CLI handbook SHALL be hidden procedures in the runtime-derived catalog.

#### Scenario: Companion catalog is loaded
- **WHEN** Agent delivery and procedure discovery read the Companion catalog
- **THEN** delivery selects only Navigate while procedure discovery includes the other four identities exactly once

#### Scenario: Manifest is the only companion registry
- **WHEN** delivery and procedure discovery resolve Companions
- **THEN** both derive identities and content from the canonical Companion manifest

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

Navigate SHALL be a compact entry procedure that uses CLI procedure search, metadata, and instruction packets. It SHALL NOT embed a generated route catalog, full CLI handbook, or full literature policy.

#### Scenario: Request is ambiguous
- **WHEN** the user asks for broad or cross-capability work
- **THEN** Navigate reads bounded status when a workspace exists and searches compact procedure cards before selecting one body

#### Scenario: Detailed CLI help is needed
- **WHEN** Navigate cannot construct a payload from compact command metadata
- **THEN** it loads the CLI handbook procedure on demand

#### Scenario: User asks which command or option to use
- **WHEN** the user asks a CLI discovery question
- **THEN** Navigate starts with compact catalog help and loads the handbook only when needed

#### Scenario: Static discovery reaches a workspace action
- **WHEN** static discovery leads to a graph action
- **THEN** Navigate reads current status and exact instructions before acting

### Requirement: Independent CLI Handbook Companion

The CLI handbook SHALL remain a canonical Companion procedure with one generated content owner and SHALL NOT be installed as a separate Skill.

#### Scenario: Handbook procedure is activated
- **WHEN** a caller requests `instructions procedure:researchspec-cli-handbook`
- **THEN** the returned procedure body is generated from the same command and payload catalogs as CLI help

#### Scenario: ResearchSpec use triggers the handbook Skill
- **WHEN** detailed CLI operation guidance is required
- **THEN** the hidden handbook procedure is activated on demand rather than projected

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

Companion procedures SHALL distinguish standalone file work from graph runtime actions. Only graph activation may expose or request run, node, handoff, Gate, Decision, or transition mutations.

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
