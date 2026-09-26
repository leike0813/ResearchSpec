## Purpose

Define dialogue-first ARSU capability selection, graph-entry confirmation and converter-owned semantic catalog authority.

## Requirements

### Requirement: Dialogue Starts Academic Work

User-Agent dialogue SHALL choose between standalone and graph activation by required lifecycle guarantees. Bounded one-shot work SHALL prefer standalone procedures, and ordinary work that continues across sessions SHALL remain standalone with continuity carried by a plain task note outside `researchspec/` only when no unfinished related run exists. An unfinished related run SHALL take precedence over standalone continuation, and a completed historical run SHALL NOT block it. Formal Gates or Decisions, parallel joins, revision rounds, or audit state SHALL require a graph route. Persistent continuity SHALL NOT by itself require a graph route. Navigate SHALL use its generated ARSU route reference when intent is vague or crosses capabilities.

#### Scenario: User asks for bounded work
- **WHEN** the request can be completed through ordinary files without workflow state
- **THEN** Navigate searches procedures and may activate one directly

#### Scenario: Ordinary work continues without a graph
- **WHEN** a request needs persistence or continuation across sessions but no unfinished related run and no formal Gate, Decision, parallel join, revision round, or audit state
- **THEN** Navigate keeps the work standalone and represents progress with a task note outside `researchspec/`
- **AND** it does not start a graph run for continuity alone

#### Scenario: Bootstrap does not start work
- **WHEN** `researchspec init` completes
- **THEN** it prepares the workspace without activating a procedure or starting a run

#### Scenario: Vague goal enters Navigate
- **WHEN** the user provides a vague academic goal
- **THEN** Navigate loads its ARSU route reference, discovers candidate procedures, and chooses standalone or graph mode from lifecycle needs

#### Scenario: Expert request names a capability
- **WHEN** the user explicitly names a procedure or capability
- **THEN** Navigate validates its activation eligibility before returning instructions

#### Scenario: User asks for governed work
- **WHEN** the request needs a graph-owned lifecycle feature
- **THEN** Navigate reads status and graph instructions before requesting any mutation

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

### Requirement: Natural-Language CLI Discovery Loads Navigate References

Natural-language routing SHALL start with compact procedure and command discovery. Navigate SHALL load its local CLI handbook only when detailed command or payload guidance is needed and its local ARSU route catalog when semantic route comparison is needed.

#### Scenario: Compact discovery is sufficient
- **WHEN** candidate cards and selected procedure metadata resolve the user's intent
- **THEN** Navigate proceeds without loading either reference body

#### Scenario: Payload detail is needed
- **WHEN** a graph or governance payload cannot be constructed from compact metadata
- **THEN** Navigate reads `references/cli-handbook.md` before acting

#### Scenario: User asks for a CLI operation manual
- **WHEN** the user explicitly requests full CLI usage guidance
- **THEN** Navigate answers from its generated CLI handbook reference

#### Scenario: CLI discovery becomes a runtime action question
- **WHEN** static help leads to a requested workflow mutation
- **THEN** Navigate returns to status and graph instructions before acting

### Requirement: Alternate-Model Consent Is Run-Node Bound

Root-run confirmation SHALL NOT authorize alternate-model delegation. Before dispatch, an Agent SHALL separately disclose the host-available model, content category and cost, and obtain consent for the current run/node.

#### Scenario: Child run or new round becomes current

- **WHEN** a child run or dynamic round needs alternate-model review
- **THEN** prior consent does not carry forward
- **AND** the current run/node obtains fresh consent

#### Scenario: Consent is recorded in the Agent session

- **WHEN** the user confirms alternate-model delegation
- **THEN** no stable spec, run, node, handoff or model-configuration file records that consent

### Requirement: Navigate Owns Conditional Native Delegation

Navigate SHALL treat packet delegation as advisory. It SHALL delegate an eligible Reviewer by default when the active host profile and effective model satisfy the role contract, and SHALL delegate an eligible Executor only when isolation or parallel execution materially helps. It SHALL keep simple work inline, keep `mixed` and `script` work in the parent, dispatch at most one worker per independent frontier node with disjoint outputs, and serialize every CLI mutation in the parent after validating returned outputs.

#### Scenario: Independent review node is eligible
- **WHEN** current graph instructions recommend `researchspec-reviewer` and no alternate-model consent is required
- **THEN** Navigate delegates that node from a fresh worker context
- **AND** the worker may write only the declared review outputs

#### Scenario: Parallel producer nodes are independent
- **WHEN** multiple eligible producer nodes have disjoint declared outputs and no dependency between them
- **THEN** Navigate may delegate one Executor per node in parallel
- **AND** advances each node serially only after parent-side validation

#### Scenario: Worker cannot complete its packet
- **WHEN** a worker lacks an input, authority, or allowed tool
- **THEN** it returns a blocker to Navigate without asking the user or mutating workflow state

### Requirement: Native Workers Return A Fixed Brief

Each native worker SHALL execute exactly one packet, SHALL NOT invoke ResearchSpec mutation commands or delegate another agent, and SHALL return a brief containing status, Procedure identity and content hash, output role-to-path mappings, checks performed, and any blocker. The brief SHALL NOT itself complete a run, node, Gate, Decision, or consent action.

#### Scenario: Worker completes ordinary file work
- **WHEN** the worker produces all declared outputs within its authority
- **THEN** it reports `completed`, the exact Procedure hash, outputs, checks, and no blocker
- **AND** Navigate remains responsible for validation and any CLI mutation
