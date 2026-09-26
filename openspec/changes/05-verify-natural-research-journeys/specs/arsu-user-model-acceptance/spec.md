# Spec Delta

## ADDED Requirements

### Requirement: Natural Research Task Acceptance

Installed-surface acceptance SHALL verify that a researcher's ordinary request is served
without the user naming ResearchSpec, a capability, a Procedure, a profile or a CLI command.
Acceptance SHALL use natural prompts in the user's language, SHALL run each natural journey
in a fresh Agent session, and SHALL record the exact prompt, the Agent's tool trace, the
human-correction count and the resulting deliverable.

#### Scenario: Literature synthesis is served without naming the framework
- **WHEN** a fresh session receives a natural request to synthesize the provided sources
- **THEN** the Agent SHALL discover and run the applicable capability without being told about ResearchSpec
- **AND** the boundary deliverable SHALL be an ordinary project file outside `researchspec/`

#### Scenario: Writing, evidence checking and review are served
- **WHEN** a fresh session receives natural requests to write or revise manuscript prose, to check claims against the provided evidence, or to review a manuscript and prepare a response
- **THEN** each request SHALL resolve to an applicable capability
- **AND** the Agent SHALL report what it produced, what evidence it used, what remains uncertain, and the next step

#### Scenario: Unrelated work does not trigger research routing
- **WHEN** a request has no research-task relationship
- **THEN** the Agent SHALL use ordinary host capability
- **AND** no research Procedure, profile, run or workspace mutation SHALL occur

#### Scenario: The user declines the framework
- **WHEN** the user asks to proceed without ResearchSpec
- **THEN** the Agent SHALL comply
- **AND** SHALL NOT create or mutate runs, nodes, Gates, Decisions or handoffs

#### Scenario: Missing material or unresolved task identity is clarified
- **WHEN** the natural request is missing a required input, or more than one task or run could match and the materials do not settle which is intended
- **THEN** the Agent SHALL ask one targeted clarifying question naming the candidates or the affected material
- **AND** SHALL NOT select a task by recency or fabricate the missing input
- **AND** a candidate set the materials do identify SHALL be continued without a clarifying question

### Requirement: Standalone And Graph Natural Journeys Are Distinct

Acceptance SHALL distinguish a run-free standalone Procedure journey from a graph-run journey,
and SHALL label neither as the other. Both continuity shapes SHALL be covered: continuing an
ordinary non-graph task, and resuming an accepted graph run.

#### Scenario: Standalone natural task creates no run state
- **WHEN** a natural one-off research task is served through an on-demand Procedure
- **THEN** no run, node, Gate, Decision or handoff SHALL be created
- **AND** the deliverable SHALL remain an ordinary project file

#### Scenario: Ordinary task continues across sessions without a graph
- **WHEN** an ordinary non-graph task is continued in a new session with no prior chat
- **THEN** the Agent SHALL recover it from the task material and the ordinary task note
- **AND** SHALL NOT create a run or treat the note as workflow authority

#### Scenario: Existing unfinished confirmed run takes priority over ordinary treatment
- **WHEN** work for the request already has an unfinished confirmed governed run
- **THEN** the Agent SHALL continue that run through its current status and instructions
- **AND** SHALL NOT bypass the formal control by treating the work as a run-free task

#### Scenario: Note divergence is reported and only material uncertainty is asked about
- **WHEN** the note disagrees with the current materials
- **THEN** the Agent SHALL report the difference
- **AND** SHALL ask one focused question only when the difference changes the task identity, its required inputs, or the next step and the materials do not settle it
- **AND** SHALL continue from the recorded next step when the task identity, inputs and next step are unaffected
- **AND** SHALL NOT claim completion, Gates or Decisions that the files do not support

#### Scenario: Graph journey is resumed after the chat is gone
- **WHEN** an accepted graph run is continued in a new session with no prior chat
- **THEN** the Agent SHALL recover it from `status` and exact selectors plus run, graph, node and handoff files
- **AND** the recovery SHALL NOT create a duplicate run or rely on shared-chat state

### Requirement: Per-Host Behavioural Verification Status Is Tracked

Manual acceptance SHALL keep one human verification record with a row for every registered
target. Target identity SHALL come from the runtime registry (`researchspec list tools --json`,
the `TOOL_IDS` catalog) and its entry/discovery metadata SHALL come from the catalog and
generated matrix, so the record is behavioural evidence and never a second target registry.

#### Scenario: Record covers every registered target
- **WHEN** the verification record is validated
- **THEN** its target ids SHALL equal the runtime registry's target ids
- **AND** a target present in the registry SHALL NOT be missing from the record

#### Scenario: Unrun targets remain unverified
- **WHEN** a target has no recorded natural-journey evidence
- **THEN** its status SHALL read `unverified`
- **AND** absence of a run SHALL NOT be reported as a pass

#### Scenario: Installation checks do not confer verification
- **WHEN** only the installation matrix, static parity or fixture-based technical journeys have completed
- **THEN** no target SHALL be marked behaviourally verified

#### Scenario: An unrun shared-projection target stays unverified
- **WHEN** two registered targets share one project projection root
- **THEN** they SHALL NOT be counted as two verified behavioural hosts
- **AND** a target without its own runnable host SHALL remain `unverified` and SHALL NOT be given a version, two sessions or another target's verdict
- **AND** it SHALL be recorded as shared or delegated evidence only when genuinely transferable evidence exists, referencing that evidence without copying its conclusion

#### Scenario: Verified status requires recorded evidence
- **WHEN** a target is marked verified
- **THEN** the record SHALL contain the host and model versions, two independent sessions, the human-correction count, resume attempts and successes, and the quality score
- **AND** `resume_attempts: 0` SHALL leave the resume success rate recorded as not applicable
