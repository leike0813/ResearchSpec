## Purpose

Define durable public-CLI journey acceptance and machine-checkable traceability for ARSU user model v0.1.

## Requirements

### Requirement: Public CLI User Journey Acceptance

ResearchSpec SHALL maintain black-box acceptance journeys for bootstrap,
adaptive and strict routing, standalone and pipeline execution, explicit
subflow/run completion, parallel work, scoped failure and retry, Gate challenge
and override, dynamic revisions, patch and contract-change lifecycle, resume,
bounded status, Doctor, context export, Zotero direct tasks, Adapter-native
research and terminal completion.

#### Scenario: Journey mutates authority only through public CLI

- **WHEN** an acceptance journey starts, submits, decides, advances, repairs or
  exports workflow state
- **THEN** it SHALL use an independent public CLI process with the exact
  descriptor or approved plan and returned hash
- **AND** it SHALL NOT import a core planner or hand-edit state, registries,
  receipts or ledgers

#### Scenario: Semantic work is simulated at the allowed boundary

- **WHEN** instructions request an ARSU candidate, provider handoff or validator
  verdict
- **THEN** the harness MAY create only the minimal declared candidate or
  evidence-linked payload
- **AND** the CLI SHALL remain responsible for validation, registration,
  confirmation, Decisions, receipts and completion

#### Scenario: Journey follows adaptive availability

- **WHEN** an adaptive standalone or pipeline journey progresses
- **THEN** it SHALL obtain obligations, allowed actions and descriptors from
  Status and instructions
- **AND** it SHALL NOT reconstruct a unique internal stage order in the harness

#### Scenario: Journey follows strict process

- **WHEN** a strict profile journey progresses
- **THEN** it SHALL obey the declared graph, parallel joins, Gates and
  transitions
- **AND** the harness SHALL still use the public CLI rather than internal
  evaluators

### Requirement: Observable User-Model Acceptance

ResearchSpec SHALL demonstrate the canonical user model through observable CLI
and runtime journeys rather than documentation-title or archived-change
traceability.

#### Scenario: Main behavior is accepted through public interfaces

- **WHEN** acceptance exercises routing, runtime, recovery, completion, export,
  or plugin journeys
- **THEN** it SHALL assert stable CLI results, state, receipts, Gate events,
  Decisions, and generated interfaces
- **AND** it SHALL NOT require exact documentation headings, prose wording,
  archived change IDs, or source-code layout

#### Scenario: Fixed product surface is checked structurally

- **WHEN** acceptance enumerates the public product surface
- **THEN** it SHALL verify seventeen commands, fifteen fixed Skills, eight
  wrappers, and the registered and command-capable tool counts through
  structured interfaces

### Requirement: Acceptance Preserves Product Boundaries

The acceptance capability SHALL validate the canonical user model while allowing
the optional package-owned domain Skill extension without expanding workflow
authority or base wrappers.

#### Scenario: Public contracts remain fixed

- **WHEN** acceptance assets are installed and executed
- **THEN** CLI help SHALL expose exactly seventeen top-level commands, Agent
  delivery SHALL retain four ARSU, four Companion, and seven Adapter fixed
  Skills, and command-capable tools SHALL retain exactly eight base wrappers
- **AND** optional plugin Skills SHALL be projected only when selected
- **AND** no production dependency, migration, hidden state, acceptance-only
  runtime command, or plugin-owned workflow authority SHALL be introduced

#### Scenario: Export and resume do not invent authority

- **WHEN** acceptance resumes in a new process or produces handoff and pack outputs
- **THEN** it SHALL derive them from persisted workspace contracts and runtime evidence
- **AND** those derived views SHALL NOT advance workflow state or become runtime sources of truth

### Requirement: Domain Plugin User Journey Acceptance
ResearchSpec SHALL maintain black-box acceptance for package-only non-empty discovery, workspace selection, projection, refresh, empty or retired recovery, drift-safe uninstall, and advisory recommendation.

#### Scenario: Plugin lifecycle uses public CLI only
- **WHEN** an acceptance journey selects, updates, or removes fixture domains
- **THEN** it SHALL invoke independent public CLI processes
- **AND** it SHALL verify config selection, projected resources, and manifest evidence without hand-editing authority files

#### Scenario: Empty domain remains comfortable for users
- **WHEN** the internal registry contains empty discipline or tool domains
- **THEN** normal public discovery SHALL hide them and direct show or install SHALL reject them
- **AND** a previously selected empty domain SHALL remain visible only as unavailable recovery state until uninstalled or repopulated

#### Scenario: Plugin execution boundary remains external
- **WHEN** a fixture Skill contains a Python script
- **THEN** acceptance SHALL verify byte-for-byte projection
- **AND** ResearchSpec SHALL NOT execute the script or install its dependencies

### Requirement: Agent-Assisted Plugin Journey Acceptance
ResearchSpec SHALL maintain black-box acceptance for optional plugin discovery,
batch consent, Agent installation, immediate instruction access, advisory
dispatch, rejection, and graceful fallback.

#### Scenario: User accepts relevant augmentation
- **WHEN** a route or ready work item has a matching uninstalled Skill and the
  user confirms the previewed batch
- **THEN** independent CLI processes SHALL execute the matching plan hash and
  return hash-clean Skill instructions
- **AND** the canonical workflow selector and ARSU producer SHALL remain
  unchanged

#### Scenario: User rejects or installation fails
- **WHEN** consent is declined or installation cannot complete
- **THEN** the journey SHALL continue through the same public core runtime
  protocol
- **AND** no new top-level command, wrapper, workflow node, or authority record
  SHALL appear

### Requirement: Fixed Surface Acceptance

Acceptance SHALL verify exactly seventeen top-level commands, fifteen fixed
Skills across all 31 tools, and exactly eight command wrappers across the 28
command-capable tools.

#### Scenario: Fixed surface is projected

- **WHEN** the release acceptance matrix installs every registered tool
- **THEN** each tool SHALL receive four ARSU, four Companion and seven Adapter
  Skills
- **AND** only command-capable tools SHALL receive the eight ResearchSpec
  wrappers

### Requirement: Recovery And Completion Journeys

Acceptance SHALL verify that standalone completion leaves a run open, explicit
run completion makes it terminal, and Doctor handles invalid YAML,
schema-invalid state, retryable orphan transactions and conflicting evidence
without fabricating semantics.

#### Scenario: Standalone work is followed by another subflow

- **WHEN** the first standalone subflow has completed
- **THEN** the same run SHALL allow another valid subflow start
- **AND** only a later `complete_run` action SHALL produce terminal blocking

#### Scenario: Doctor sees conflicting receipts

- **WHEN** the fixture contains incompatible receipt evidence
- **THEN** Doctor SHALL report `conflicting_evidence`
- **AND** no repair execution SHALL be offered

### Requirement: Adapter-Native User Journeys

Acceptance SHALL cover ordinary Adapter-native gap supplementation,
systematic multi-source behavior, private library-bound pause,
candidate-only acquisition and managed-library import limited to accepted
items in one authorized collection.

#### Scenario: Managed-library journey runs

- **WHEN** a user authorizes one run and collection after route confirmation
- **THEN** only screened accepted items SHALL be imported through Acquisition
- **AND** Curation and unrelated library state SHALL remain unchanged

#### Scenario: Adapter runtime metadata is packaged

- **WHEN** the fixed seven-Skill bundle is installed and checked
- **THEN** seven runner files and seven output schemas SHALL match audited bytes
- **AND** no acceptance path SHALL execute them through ResearchSpec

### Requirement: Converged Runtime Guidance Has Black-Box Acceptance

Acceptance SHALL verify that public CLI behavior, the generated CLI handbook,
generated ARSU guidance, Companion guidance, canonical usage documentation, and
runtime documentation describe the same adaptive-default and strict-compatible
protocol without requiring literal prose snapshots. It SHALL distinguish
catalog-backed static command discovery from workspace-bound authorization
through current status and action descriptors.

#### Scenario: Adaptive and strict guidance is exercised

- **WHEN** acceptance initializes adaptive and strict workspaces and obtains
  current descriptors
- **THEN** the journeys SHALL exercise the selector and execution-policy families
  valid for each mode
- **AND** they SHALL not use a strict-only selector to progress an adaptive run

#### Scenario: Static help is discoverable without a workspace

- **WHEN** acceptance invokes top-level help and representative command and
  `plugin` subcommand help without an initialized workspace
- **THEN** the help surfaces SHALL expose catalog-derived command identities,
  usage, options, and contextual discovery guidance
- **AND** assertions SHALL verify stable structure and command semantics rather
  than complete help prose, whitespace, or field order

#### Scenario: Navigate falls back when its handbook reference is unavailable

- **WHEN** the projected Navigate CLI handbook reference is absent, unreadable,
  or rejected by generated-file integrity checks
- **THEN** Navigate SHALL use the installed CLI top-level and relevant
  command-level help as the read-only static discovery fallback
- **AND** handbook failure SHALL NOT create workflow authority, authorize an
  action, invent a command, or block an otherwise valid ARSU route

#### Scenario: Static guidance does not authorize a runtime action

- **WHEN** a user asks what to execute in a current workspace after consulting
  static help or the CLI handbook
- **THEN** Navigate SHALL obtain bounded status and the current selector's
  instructions before dispatch or execution
- **AND** current availability, semantic input, execution policy, confirmation,
  action basis, and next selectors SHALL come from the action descriptor rather
  than static guidance

#### Scenario: Documentation facts are checked structurally

- **WHEN** acceptance validates current runtime documentation and the generated
  CLI handbook
- **THEN** it SHALL verify command count, fixed Skill count, runtime mode,
  selector families, recovery, migration, Material Passport compatibility, and
  the static-help versus dynamic-authorization boundary through stable
  structured assertions
- **AND** it SHALL not assert complete natural-language paragraphs or field order

## ADDED Requirements

### Requirement: Observable user-model acceptance
User-model acceptance SHALL be demonstrated through observable CLI and runtime journeys rather than a prose-title traceability manifest.

#### Scenario: Current surface remains fixed
- **WHEN** release acceptance enumerates the public product surface
- **THEN** it SHALL verify seventeen commands, fifteen fixed Skills, eight wrappers, and the registered and command-capable tool counts through structured interfaces

#### Scenario: Runtime journey acceptance
- **WHEN** release acceptance exercises adaptive default, strict compatibility, migration, Doctor, patch/change, or recovery
- **THEN** it SHALL assert stable state, receipt, Gate, Decision, and result behavior without requiring exact documentation headings or archived-change IDs
