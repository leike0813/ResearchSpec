## Purpose

Define dialogue-first ARSU capability selection, graph-entry confirmation and converter-owned semantic catalog authority.

## Requirements

### Requirement: Dialogue Starts Academic Work

ResearchSpec SHALL treat user-Agent dialogue as the entry to academic work and SHALL keep workspace initialization separate from root-run start.

#### Scenario: Bootstrap does not start work

- **WHEN** a user initializes a ResearchSpec workspace
- **THEN** the system prepares workspace contracts and installs selected Skills
- **AND** it does not select a graph entry or create a run

#### Scenario: Vague goal enters Navigate

- **WHEN** a request is vague, spans capabilities, resumes prior work, asks for state explanation or asks for context export
- **THEN** the Agent uses `researchspec-navigate` and reads current status

#### Scenario: Expert request names a capability

- **WHEN** the user specifies an unambiguous ARSU capability
- **THEN** the Agent may invoke that producer directly after the same graph selector and prerequisite checks

### Requirement: Profile Entry Summary Authorizes One Root Run

Before starting a root run, Navigate or a directly invoked ARSU Skill SHALL resolve the selected profile entry through its routing-catalog binding and summarize the entry node, stable-spec prerequisites, handoff inputs, boundary outputs, formal Gates, Decisions, risk, and cost. Confirmation SHALL be scoped to that root run and its frozen graph; the routing record SHALL describe meaning but SHALL NOT become runtime authority.

#### Scenario: Entry summary is confirmed

- **WHEN** the user confirms the displayed profile entry summary
- **THEN** the CLI may create exactly one human-authorized root run
- **AND** nodes and bound child runs declared by its frozen graph inherit that authorization
- **AND** each declared Gate and Decision still requires separate confirmation

#### Scenario: Route meaning and graph availability disagree

- **WHEN** the routing catalog describes an entry that the projected graph does not expose
- **THEN** the Agent reports the unavailable graph entry and SHALL NOT construct or start it from routing prose

### Requirement: Routing Catalog Describes Capability Meaning

The converter-owned routing catalog SHALL map user intents to ARSU capability and entry meaning without acting as a runtime selector registry. Current availability and the executable frontier SHALL come only from status and graph instructions.

#### Scenario: Capability guidance is requested

- **WHEN** Navigate recognizes a supported ARSU intent
- **THEN** catalog guidance identifies semantic prerequisites, likely outputs, risk and cost
- **AND** status and profile instructions provide the executable entry and selector

### Requirement: ARSU And Zotero Entry Remain Distinct

Dialogue classification SHALL distinguish academic research owned by an ARSU producer from bounded Zotero library tasks. Adapter use inside an ARSU run SHALL remain a provider operation rather than graph authority.

#### Scenario: User asks a broad Zotero question

- **WHEN** the primary request spans multiple library operations
- **THEN** the Agent recommends `zotero-library-agent`
- **AND** the Adapter router chooses task Skills within the confirmed library scope

#### Scenario: User explicitly requests a library query

- **WHEN** the request is bounded to current Zotero items, notes, attachments, collections or selection
- **THEN** the Agent may use `zotero-library-query` directly
- **AND** it does not create a ResearchSpec run merely to access the library

#### Scenario: Academic research needs sources

- **WHEN** a confirmed ARSU run includes literature work
- **THEN** the ARSU producer remains the owner
- **AND** it may use relevant Zotero task Skills through the provider boundary

### Requirement: Source Policy And Library Consent Are Separate

The root entry summary SHALL describe source policy and Adapter readiness expectations. Managed-library authorization SHALL be a separate confirmation bound to the current run and collection.

#### Scenario: Ordinary research skips Adapter setup

- **WHEN** the user skips an unchecked Adapter for the current run
- **THEN** the producer may continue with disclosed external or user-supplied sources
- **AND** the skip does not become a formal graph Decision

#### Scenario: Private collection is required

- **WHEN** the user authorizes library-bound work
- **THEN** failure to establish live readiness pauses that provider operation
- **AND** the Agent does not silently change the source policy

### Requirement: Natural-Language CLI Discovery Loads The Handbook Companion

ResearchSpec SHALL load `researchspec-cli-handbook` for requests to use, discover, explain, inspect, troubleshoot or modify public CLI commands, payloads, selectors, status, checks, projections or workspace contracts. Navigate MAY also participate when the same request requires capability selection, resume, explanation or export.

#### Scenario: User asks for a CLI operation manual

- **WHEN** a user asks about a command, option, payload, plugin subcommand, selector family or workspace contract
- **THEN** the Agent loads `researchspec-cli-handbook`
- **AND** static guidance does not authorize a workspace write or start a run

#### Scenario: CLI discovery becomes a runtime action question

- **WHEN** the request asks what action is currently available
- **THEN** the Agent reads bounded status, selects a returned graph item and obtains its instructions
- **AND** handbook text does not replace runtime authorization

### Requirement: Alternate-Model Consent Is Run-Node Bound

Root-run confirmation SHALL NOT authorize alternate-model delegation. Before dispatch, an Agent SHALL separately disclose the host-available model, content category and cost, and obtain consent for the current run/node.

#### Scenario: Child run or new round becomes current

- **WHEN** a child run or dynamic round needs alternate-model review
- **THEN** prior consent does not carry forward
- **AND** the current run/node obtains fresh consent

#### Scenario: Consent is recorded in the Agent session

- **WHEN** the user confirms alternate-model delegation
- **THEN** no stable spec, run, node, handoff or model-configuration file records that consent
