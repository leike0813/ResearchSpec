## MODIFIED Requirements

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

## ADDED Requirements

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

