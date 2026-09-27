## Purpose
Define black-box acceptance at the packaged CLI and installed Agent surface.

## Requirements

### Requirement: Current User Model Acceptance

Packaged CLI journeys SHALL validate the current schema `"2"` workspace, sixteen-command surface,
registry-derived fixed Skill surface, optional seven-Skill Zotero Adapter and graph-authorized child runs.

#### Scenario: Fresh default journey is exercised

- **WHEN** acceptance starts from an empty project through the packaged CLI without Adapter selection
- **THEN** every authoritative mutation SHALL be performed by a fresh CLI process
- **AND** every graph run and node instance uses only schema `"2"` files and selectors
- **AND** the workspace SHALL contain no `.zotero-bridge` runtime or Adapter Skill projection

#### Scenario: Fresh Zotero journey is exercised

- **WHEN** acceptance initializes with explicit `zotero-library` selection
- **THEN** the selected Agent host SHALL receive all seven Adapter Skills and the project SHALL receive the current-platform runtime and profile template
- **AND** test helpers SHALL not execute Adapter assets or contact Zotero

### Requirement: Hard-Cut Acceptance
Acceptance SHALL prove that old or unknown workspaces are rejected without mutation and without
legacy projection.

#### Scenario: Legacy runtime is presented
- **WHEN** a journey contains old state, registry, ledger, receipt or Passport files
- **THEN** status/check/doctor report unsupported format
- **AND** no command migrates, archives or repairs those files

### Requirement: User journeys expose format intake and final delivery order
The packaged CLI and installed Skills SHALL make format selection part of writing intake, allow QMD writing when Quarto is unavailable, block formatting when probe status is `unavailable` or `unknown`, route formatting before final-integrity, and keep manuscript/rendered files external and excluded from `pack`.

#### Scenario: QMD writing is possible without Quarto
- **WHEN** the user selects QMD and the probe reports `unavailable`
- **THEN** writing may start with the unavailable probe recorded, while the formatting child remains blocked

#### Scenario: Formatting precedes final integrity
- **WHEN** the user follows an accepted review or dynamic revision round
- **THEN** the route summary and frontier require formatting before the final-integrity Gate

#### Scenario: Pack excludes external deliverables
- **WHEN** a workspace contains the QMD source and rendered output outside `researchspec/`
- **THEN** `pack` does not copy or register either file

### Requirement: Packaged mid-entry journeys can start the selected child
Packaged CLI acceptance SHALL cover every declared academic-pipeline mid-entry point and SHALL prove that a confirmed parent exposes only the selected first child-profile node and starts exactly one bound child run without a second run-level confirmation.

#### Scenario: Existing research materials enter at writing
- **WHEN** a packaged CLI journey confirms the academic-pipeline writing entry and starts its eligible child-profile node
- **THEN** exactly one writing child run is frozen at the declared child entry
- **AND** the child records the parent run and graph binding

#### Scenario: Every declared entry is exercised
- **WHEN** acceptance parameterizes academic-pipeline start over all declared entry points
- **THEN** each parent begins at the selected checkpoint and exposes only the corresponding first child
- **AND** revision and re-review entries begin at local round 1

#### Scenario: Existing end-to-end and standalone journeys run
- **WHEN** the packaged acceptance suite exercises end-to-end, formatting, final-integrity and standalone profiles
- **THEN** all work progresses through current node, Gate, Decision and child-run selectors

### Requirement: Canonical User Model Matches The Graph Product

The canonical user model SHALL explain ResearchSpec as a file-based capability-graph control plane.
It SHALL cover initialization, dialogue routing, route-bound entry summaries, root-run confirmation,
inherited child-run authorization, separate Gate and Decision confirmations, capability execution,
delivery snapshots, resume, static health, plugins, Adapters, and bounded export.

#### Scenario: A new user reads the mental model

- **WHEN** they need to understand how work begins and advances
- **THEN** the documentation presents one lifecycle from conversation to completion
- **AND** it identifies the file owner and CLI authority at each mutation boundary

#### Scenario: Documentation describes child work

- **WHEN** a profile node binds a child graph
- **THEN** the model states that the child inherits the confirmed frozen parent graph authorization
- **AND** it states that formal child Gates, Decisions, model review, plugin installation, and render
  execution retain their own consent boundaries

### Requirement: Installed pipeline acceptance reaches persisted completion

Release verification SHALL complete an academic-pipeline root and its bound child runs through the installed npm tarball, using fresh public CLI processes for authoritative mutations. The journey SHALL include human Gates, Decisions, two revision and re-review rounds, resume and final delivery. Test material SHALL remain external producer output; the harness SHALL NOT edit workflow authority or generated profiles.

#### Scenario: Pipeline resumes across revisions

- **WHEN** installed-package acceptance completes review and two revision rounds
- **THEN** the first revision outcome SHALL continue and the second SHALL complete through public Decisions
- **AND** fresh status and instructions calls SHALL recover the eligible work at child, Gate and round boundaries

#### Scenario: Root and child runs finish

- **WHEN** the final required integrity Gate completes
- **THEN** new CLI processes SHALL observe all participating root and child runs as persistently complete, with no active runs and an empty frontier
- **AND** strict workspace checking SHALL succeed

#### Scenario: Acceptance evidence identifies its execution boundary

- **WHEN** tests or release documentation describe a CLI journey
- **THEN** they SHALL distinguish source-compiled CLI execution from installed-tarball execution
- **AND** automated workflow fixtures SHALL NOT be presented as human research-quality acceptance

### Requirement: Installed Native Roles Preserve Model Consent Boundaries

Installed-surface acceptance SHALL verify that native Procedure profiles do not pin vendor model identifiers and do not configure model services. A same-model or documented inherited-model worker MAY execute without additional model consent; an unknown, non-inherited, or alternate effective model SHALL require the existing current run/node disclosure and consent before dispatch, otherwise Navigate SHALL execute inline.

#### Scenario: Host inherits the parent model
- **WHEN** an eligible packet is delegated through a profile whose effective model is documented as inherited
- **THEN** no new model-consent record or ResearchSpec configuration is created

#### Scenario: Effective model is alternate or unknown
- **WHEN** Navigate cannot establish same-model inheritance for the current worker
- **THEN** it obtains the existing exact run/node-bound model, content-category, and cost consent before dispatch
- **AND** without that consent it keeps the work inline

#### Scenario: Installed profile surface is inspected
- **WHEN** acceptance initializes each supported adapter
- **THEN** both non-entry role profiles are present at their declared project-local targets
- **AND** no unsupported adapter receives a profile


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

### Requirement: All-Target Init Projection And Single-Host Behaviour Are Tracked

Acceptance SHALL check the init projection for every registered target in `skills`, `commands`
and `both` delivery modes, including shared `agents`, without launching host models. Each case
SHALL verify the project files and manifest plus ResearchSpec CLI status, strict check, and
Procedure discovery and instruction selectors. This establishes project delivery and CLI
callability; it SHALL NOT certify native host invocation or Agent behavior. Natural research
behavior SHALL be assessed on one explicitly selected runnable host through two independent
sessions per scenario and evidence-bound human review. The behavior result SHALL be reported
at project level and SHALL NOT transfer to untested hosts.

#### Scenario: Matrix covers every registered target
- **WHEN** the init matrix is validated
- **THEN** its target ids SHALL equal the runtime registry's target ids
- **AND** every target SHALL have one result for each of the three delivery modes

#### Scenario: Unrun behavior remains unverified
- **WHEN** a target has no recorded natural-journey evidence
- **THEN** no behavior pass SHALL be inferred for that target

#### Scenario: Installation checks do not confer behavior verification
- **WHEN** only the init matrix, static parity or fixture-based technical journeys have completed
- **THEN** no target SHALL be marked behaviourally verified

#### Scenario: Shared projection stays separate
- **WHEN** two registered targets share one project projection root
- **THEN** each SHALL have its own init matrix cases
- **AND** a target without its own runnable host SHALL NOT receive a behavior verdict or host version

#### Scenario: Selected behavior suite passes
- **WHEN** every natural scenario on the selected host has two independent human-reviewed passing sessions
- **THEN** the project behavior result SHALL cite the host and model versions, sessions, human-correction count, resume attempts and successes, and quality scores
- **AND** `resume_attempts: 0` SHALL leave the resume success rate recorded as not applicable
- **AND** untested hosts SHALL receive no inferred behavior verdict

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
