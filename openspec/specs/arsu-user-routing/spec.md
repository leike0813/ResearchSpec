## Purpose

Define dialogue-first ARSU routing, complete route confirmation, and the converter-owned catalog authority.

## Requirements

### Requirement: Dialogue-First ARSU Routing
ResearchSpec SHALL treat user-Agent dialogue as the entry to academic work and SHALL keep workspace initialization separate from subflow start.

#### Scenario: Bootstrap does not start work
- **WHEN** a user initializes a ResearchSpec workspace
- **THEN** the system SHALL prepare workspace contracts and install available Skills
- **AND** it SHALL NOT select an ARSU mode or start a subflow

#### Scenario: Vague goal enters Navigate
- **WHEN** the request is vague, spans multiple Skills, resumes prior work, asks for state explanation, or asks for context export
- **THEN** the Agent SHALL route the request through `researchspec-navigate`

#### Scenario: Expert request goes directly to an ARSU Skill
- **WHEN** the user specifies an unambiguous ARSU Skill or mode
- **THEN** the Agent SHALL permit direct routing to that Skill and mode
- **AND** it SHALL still validate prerequisites and request route confirmation

### Requirement: Route Summary And Start Authorization
ResearchSpec SHALL present one route summary and obtain explicit user confirmation before starting any new subflow.

#### Scenario: Route summary is complete
- **WHEN** a route candidate has been resolved
- **THEN** the Agent SHALL present the selected Skill, mode, prerequisite expansion, expected artifacts, formal Gates, and cost summary

#### Scenario: Missing prerequisites expand the route
- **WHEN** the selected route lacks required upstream work
- **THEN** the route summary SHALL include the required prerequisite subflows
- **AND** the Agent SHALL NOT silently start them before confirmation

#### Scenario: Confirmation authorizes one route
- **WHEN** the user confirms the displayed route
- **THEN** the Agent SHALL authorize start of that exact subflow plan
- **AND** a materially different route SHALL require a new summary and confirmation

### Requirement: Routing Catalog Is The Mapping Authority
ResearchSpec SHALL derive ARSU routing and Skill-description projections from one typed converter-owned routing catalog.

#### Scenario: Mode mapping is projected consistently
- **WHEN** Navigate or an installed Skill describes an ARSU mode
- **THEN** skill identity, primary artifacts, prerequisites, risk, Gate policy, and near-miss guidance SHALL originate from the same catalog entry

#### Scenario: Near-miss intent is disambiguated
- **WHEN** a user request can plausibly map to evidence synthesis, manuscript writing, manuscript review, or a cross-stage pipeline
- **THEN** the Agent SHALL use catalog near-miss guidance to expose the distinction before route confirmation

### Requirement: Routing Distinguishes ARSU And Zotero Entry

Dialogue routing SHALL distinguish academic research owned by an ARSU producer
from bounded Zotero library tasks. Adapter use inside an ARSU route SHALL remain
a nested provider operation rather than a ResearchSpec workflow node.

#### Scenario: User asks a broad Zotero question

- **WHEN** the primary request spans multiple library operations
- **THEN** routing SHALL recommend `zotero-library-agent`
- **AND** the Adapter router SHALL choose task Skills within the confirmed
  library scope

#### Scenario: User explicitly requests a library query

- **WHEN** the request is already bounded to current Zotero items, notes,
  attachments, collections or selection
- **THEN** routing MAY enter `zotero-library-query` directly
- **AND** it SHALL NOT require an ARSU subflow confirmation

#### Scenario: Academic research needs sources

- **WHEN** a confirmed ARSU producer route includes literature work
- **THEN** the producer SHALL remain the route owner
- **AND** it MAY call the relevant Zotero task Skills through the
  provider-handoff boundary

### Requirement: Source Policy And Library Consent Are Separate

Route confirmation SHALL summarize the source policy and Adapter readiness
expectation. Managed-library authorization SHALL be a separate confirmation
bound to the current run and collection.

#### Scenario: Ordinary research skips Adapter setup

- **WHEN** the user elects to skip an unchecked Adapter for the current route
- **THEN** the route MAY continue with disclosed external or user-supplied
  sources
- **AND** the skip SHALL NOT become a formal research Decision

#### Scenario: Private collection is required

- **WHEN** the user confirms a library-bound route
- **THEN** failure to establish live readiness SHALL pause the route
- **AND** routing SHALL NOT silently change the source policy

### Requirement: Natural-Language CLI Discovery Uses Navigate Without Starting Work

ResearchSpec SHALL route a natural-language request to discover, explain, or
compare public CLI commands, options, selector families, or the CLI handbook
through `researchspec-navigate`. CLI discovery is distinct from an academic
goal and SHALL NOT select an ARSU mode, create a route summary, or start a
subflow merely because the user asks how to operate ResearchSpec.

#### Scenario: User asks for a CLI operation manual

- **WHEN** a user asks how to use a ResearchSpec command, global option,
  `plugin` subcommand, selector family, or the CLI handbook
- **THEN** Navigate SHALL provide the relevant static discovery guidance or
  direct the user to the corresponding workspace-less help surface
- **AND** it SHALL explain that static help does not authorize a runtime write
- **AND** it SHALL leave the current run and subflow set unchanged

#### Scenario: CLI discovery becomes a runtime action question

- **WHEN** a user asking about command syntax also asks what action is currently
  available in a workspace
- **THEN** Navigate SHALL first distinguish static command discovery from the
  workspace-bound question
- **AND** for the latter it SHALL read bounded `status`, select a returned
  selector, and obtain its current `instructions` descriptor before proposing a
  write
- **AND** it SHALL follow the descriptor's execution policy and returned
  `next_selectors` rather than treating handbook text as authority

#### Scenario: Discovery is requested before workspace initialization

- **WHEN** a user requests CLI discovery without an existing workspace
- **THEN** Navigate SHALL allow static root, command, or plugin help to be
  explained without asking the user to initialize a research run
- **AND** it SHALL offer `init` only when the user asks to prepare a workspace
  or begin work
