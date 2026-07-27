## Purpose

Define the canonical user-visible active-run, subflow, frontier, Gate, transition, and Decision protocol.
## Requirements
### Requirement: Active Run And Dynamic Subflows
ResearchSpec SHALL maintain at most one active run per workspace and SHALL represent standalone work, pipeline work, and revision rounds as identifiable subflow instances.

#### Scenario: Standalone work starts under the active run
- **WHEN** a confirmed standalone route is started
- **THEN** the system SHALL create a subflow instance under the workspace active run
- **AND** it SHALL preserve the selected Skill, mode, parent identity, and instance identity

#### Scenario: Revision round is instantiated dynamically
- **WHEN** an accepted review branch requires another revision
- **THEN** the system SHALL instantiate the workflow's revision-round template with parent and round identity
- **AND** it SHALL NOT require a statically predeclared maximum number of rounds

### Requirement: CLI-Owned Workflow Frontier

ResearchSpec CLI SHALL be the authoritative evaluator of hard obligations,
accepted evidence, formal Gates and Decisions, case actions and completion.
ARSU Skills SHALL perform semantic work from bounded CLI action summaries and
descriptors while selecting their own soft plan within those commitments.

#### Scenario: Adaptive work follows current commitments

- **WHEN** an ARSU producer operates an adaptive run
- **THEN** it SHALL obtain allowed and recommended actions from ResearchSpec
- **AND** it MAY reorder, parallelize, retry, replace or rework semantic tasks
  that have no declared hard dependency

#### Scenario: Strict pipeline is active

- **WHEN** `academic-pipeline` coordinates a strict profile
- **THEN** it SHALL request status and instructions from ResearchSpec
- **AND** it SHALL NOT maintain an independent graph, Gate or readiness truth

### Requirement: Uniform Runtime Protocol

ResearchSpec SHALL expose subflows, obligations, case actions, Gates and
completion through bounded status plus selector-based instructions. A caller
SHALL execute only an allowed descriptor and SHALL use directed reads for
detail rather than requiring a full status round trip after every mechanical
step.

#### Scenario: Agent executes one durable action

- **WHEN** an Agent reaches a durable commitment boundary
- **THEN** it SHALL obtain the selected action descriptor and execute the
  corresponding `start`, `submit`, `advance`, `decide` or `propose` transaction
- **AND** it SHALL use returned next selectors to continue

#### Scenario: Working material remains provisional

- **WHEN** an ARSU Skill has produced intermediate or provider-derived material
- **THEN** it SHALL retain that material as scoped working evidence
- **AND** it SHALL use a durable submit only when a declared artifact,
  evidence, patch or case-action boundary is reached

### Requirement: Human-Confirmed Gates And Controlled Transitions
ResearchSpec SHALL require user confirmation for every formal Gate and SHALL distinguish Gate challenge, override, and transition authorization.

#### Scenario: Gate submission includes confirmation
- **WHEN** a validator proposes a Gate verdict
- **THEN** the Agent SHALL show the validator and evidence to the user
- **AND** `submit gate:<id>` SHALL persist the evidence, verdict, and `confirmed_by`

#### Scenario: User challenges a Gate verdict
- **WHEN** the user disagrees with the proposed Gate verdict
- **THEN** the Agent SHALL re-run verification before offering an override
- **AND** advancing past a failed verdict SHALL require an explicit `researchspec-decide` override record

#### Scenario: Unique transition advances automatically
- **WHEN** a passed Gate or accepted branch decision leaves exactly one eligible transition
- **THEN** the Agent SHALL advance that transition without requesting a second semantic decision

#### Scenario: Ambiguous transition requires Decision
- **WHEN** multiple transitions are eligible or the next step changes scope, claims, structure, or branch semantics
- **THEN** the Agent SHALL route the choice through `researchspec-decide`

### Requirement: Decisions Capture Only High-Impact Interaction
ResearchSpec SHALL persist user choices in the Decision ledger only when they affect scope, claims, manuscript structure, workflow branch, or Gate override.

#### Scenario: Ordinary exploration remains with the artifact
- **WHEN** a user asks exploratory questions or gives low-impact working feedback
- **THEN** the interaction SHALL remain in the relevant working artifact or conversation context
- **AND** it SHALL NOT create a Decision ledger event solely for audit volume

### Requirement: External Passport Mid-Entry Journey
ResearchSpec SHALL route a user continuing from an ARS Material Passport through the current mid-entry summary, confirmation and workflow frontier.

#### Scenario: User imports a Passport
- **WHEN** Navigate identifies a local Material Passport and the user confirms the import summary
- **THEN** the Agent SHALL preview and execute the hash-bound Start transaction
- **AND** subsequent work SHALL use current status and scoped instructions

#### Scenario: Imported claims require current authority
- **WHEN** the Passport contains a branch, Gate pass or override
- **THEN** the Agent SHALL expose it as imported evidence and use the current Gate or Decision flow before advancing

### Requirement: Plugin Helpers Do Not Enter The Runtime Frontier
ResearchSpec SHALL treat domain Skill invocation as nested semantic assistance
inside the current ARSU producer rather than a selector-addressable runtime
entity.

#### Scenario: Helper is used during a work item
- **WHEN** the Agent invokes a plugin Skill while producing a ready work
  candidate
- **THEN** status and instructions SHALL retain the original work selector and
  producer
- **AND** Submit SHALL register only the producer-reviewed candidate

#### Scenario: Helper is unavailable
- **WHEN** helper discovery, installation, or invocation fails
- **THEN** the current selector SHALL remain ready or active according to the
  existing core evaluator
- **AND** no plugin-specific blocker SHALL be added to workflow state

