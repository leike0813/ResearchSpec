## Purpose

Give maintainers a repeatable, inspectable way to exercise natural ResearchSpec tasks in real Agent hosts while keeping machine observations separate from human acceptance and preserving the existing release authority.

## Requirements

### Requirement: Campaign selection and host configuration
The maintainer harness SHALL derive all target identities from the ResearchSpec tool catalog and run an init projection check for every target in `skills`, `commands` and `both` modes. It SHALL optionally accept exactly one runnable behavior host with an explicit model and freeze that host, scenarios, assessor model, source and fixture identities for a campaign. The shared `agents` target SHALL participate in static checks but SHALL not be runnable as an Agent behavior host.

#### Scenario: A maintainer selects a static matrix
- **WHEN** no behavior host is selected
- **THEN** the harness plans the all-target init matrix without a model, host binary or Orca requirement
- **AND** reports the exact local CLI case count before execution

#### Scenario: A maintainer selects one behavior host
- **WHEN** a configured host and declared scenario are selected
- **THEN** the harness plans two independent attempts by default and reports the exact model, scenario, matrix count and expected behavior and assessor calls before execution

#### Scenario: An enabled target has no adapter or model
- **WHEN** a selected target lacks an execution adapter or configured model
- **THEN** preflight refuses execution and does not silently skip or substitute the target or model

### Requirement: Orca-supervised isolated execution
Every init matrix case SHALL run locally in a fresh disposable project and record projected files, manifest, diagnostics and Procedure selector results. Its pass SHALL establish project delivery and ResearchSpec CLI discoverability only. After the complete matrix passes, each selected-host Agent attempt SHALL start through an Orca-managed terminal in a fresh disposable project, use the current local ResearchSpec build, and preserve raw responses, tool events, state snapshots and deliverables outside the test project. Linux isolation SHALL prevent an attempt from reading sibling fixture projects or prior host conversations.

#### Scenario: A campaign runs
- **WHEN** the maintainer starts a campaign
- **THEN** its progress and local review URL are available before the first init case
- **AND** each attempt has a distinct project, host session and evidence record

#### Scenario: Isolation or prerequisite fails
- **WHEN** Orca, the host binary, the requested model or the isolation prerequisite cannot run
- **THEN** the affected attempt is reported as blocked without running it outside the required boundary

#### Scenario: Execution is interrupted
- **WHEN** the campaign stops during an attempt
- **THEN** partial evidence remains identified as interrupted, and a later resume never treats that fragment as a complete independent session

### Requirement: Live evidence review and bounded human writes
The harness SHALL serve a loopback-only HTML page showing init matrix progress, selected-host scenario status, assessment reports, incremental tool events, full sealed evidence and evidence gaps. Evidence requests SHALL be read-only; only a same-origin, authenticated human review request may write a review record. Browser requests SHALL never mutate ResearchSpec workflow state; arbitrary filesystem paths and executable content SHALL not be served as active page content.

#### Scenario: A maintainer opens the page during execution
- **WHEN** an Agent attempt is still running
- **THEN** its state and newly captured events appear without a page reload
- **AND** a review cannot be submitted until that attempt's evidence is sealed

#### Scenario: A campaign is reopened
- **WHEN** the runner has stopped and the maintainer serves a saved campaign
- **THEN** the same recorded evidence and human review progress are available

### Requirement: Human verdicts govern acceptance
Machine observations SHALL be advisory. A formal pass SHALL require a sealed, complete attempt, applicable scenario preconditions, all hard assertions satisfied, four human rubric scores totaling at least nine with no zero, and an evidence-bound human review. Invalid preconditions and interrupted attempts SHALL not count toward independent sessions.

#### Scenario: A reviewer imports a decision
- **WHEN** a browser-exported review matches the sealed campaign evidence and satisfies the rubric
- **THEN** the CLI records the human verdict without modifying raw evidence

#### Scenario: A reviewer adjudicates on the page
- **WHEN** the human confirms or explicitly revises a report-backed decision on the local page
- **THEN** the server applies the same evidence and rubric checks as CLI import, keeps previous revisions, and refreshes the displayed human status

#### Scenario: A stale or unsupported pass is submitted
- **WHEN** the evidence changed, required evidence is missing, or a pass violates an assertion or score rule
- **THEN** the import is rejected without replacing the existing review

#### Scenario: A partial suite is reviewed
- **WHEN** only selected scenarios have two reviewed passing sessions
- **THEN** only those scenario results are reported, and the host and release record do not inherit a full-suite pass

### Requirement: Legacy evidence remains qualified
The harness SHALL ingest the existing four-host campaign for read-only historical review while showing missing raw traces or deliverables and marking its previous heuristic verdicts as provisional.

#### Scenario: A legacy record is opened
- **WHEN** a maintainer inspects an imported legacy session
- **THEN** available evidence and explicit gaps are shown
- **AND** the prior result is not counted as an imported human verdict
- **AND** the campaign cannot be resumed, reassessed or adjudicated

### Requirement: Independent report drafting
Each sealed or blocked attempt SHALL receive an evidence-bound, structured report drafted by an independently launched, configurable host Agent. Its recommendation SHALL remain advisory; missing evidence SHALL be shown and SHALL prevent a pass recommendation. A failed assessment SHALL be retryable without rerunning or modifying the tested attempt.

#### Scenario: An attempt seals during a live campaign
- **WHEN** its assessment completes
- **THEN** the page shows the exact test prompt, observed actions, deliverables, per-assertion and score reasoning, recommendation and links to the supporting evidence

### Requirement: Maintainer audit Skill
A project-local maintainer Skill SHALL confirm the all-target static matrix and any selected behavior host, scenarios, host model and assessor model with the user, preview the run, launch the confirmed harness and open the live review service. It SHALL not add a ResearchSpec user-facing Skill or publish a behavior acceptance result without human adjudication.

#### Scenario: A maintainer starts an audit through the Skill
- **WHEN** the user confirms the static matrix and any concrete single-host behavior suite and models
- **THEN** the Skill runs the matching harness plan and campaign, opens the live review URL, and directs the user to the per-attempt reports for final adjudication

### Requirement: Release evidence uses static coverage and one behavior host
The dogfooding release gate SHALL require a passing init matrix for every registered target in all three delivery modes and a complete, human-reviewed `natural-18` suite on one selected runnable host. The selected host's behavior result SHALL remain project-level evidence and SHALL not certify behavior on untested hosts.

#### Scenario: Static matrix and one behavior suite pass
- **WHEN** every init matrix case passes and every natural scenario has two independent human-reviewed passing attempts on the selected host
- **THEN** this dogfooding release gate is satisfied

### Requirement: Behavior scenarios start from executable preconditions
The harness SHALL establish and record each selected behavior scenario's necessary fixture preconditions before launching a host Agent. A scenario setup failure SHALL stop that attempt before a model call and SHALL be distinguishable from an Agent behavior failure. An Agent that omits a required action after a valid setup SHALL remain assessable as a behavior failure.

#### Scenario: First query has no result
- **WHEN** the first-search-miss scenario is staged
- **THEN** the harness SHALL run a real Procedure query with the scenario's declared term, confirm it returns no candidates, and give the recorded result to the Agent
- **AND** the Agent's later alternate query and candidate decision SHALL be evaluated against that recorded first result

#### Scenario: The first-query fixture no longer misses
- **WHEN** the declared term returns a candidate after catalog changes
- **THEN** the harness SHALL stop before launching the host Agent and report the fixture mismatch

#### Scenario: Standalone procedures are composed
- **WHEN** the two-capability scenario is staged from the review-cycle fixture
- **THEN** the selected Procedure pair SHALL have compatible declared output and input roles and all required source materials in the fixture
- **AND** the intended second step SHALL be executable from the first step's ordinary project-relative output path without an undeclared intermediate capability, graph run, or ungranted human decision

#### Scenario: A related unfinished run takes precedence
- **WHEN** the run-precedence scenario is staged with an ordinary task note and an unfinished confirmed run
- **THEN** the note SHALL identify the exact run, the confirmed project intent SHALL match the note's task and materials, and the root handoff SHALL plan the entry node's required outputs
- **AND** the harness SHALL verify those conditions before launching the host Agent, so the Agent can determine the relationship and continue through the run's exact instructions without unrelated fixture repair

### Requirement: Campaign review uses its frozen scenario contract
The harness SHALL preserve the scenario catalog used by each new campaign and SHALL use that version for subsequent assessment, display, reporting, and human review. A saved catalog SHALL match the campaign's recorded catalog hash. Existing awaiting-review campaigns with a verified copy of their original catalog SHALL remain reviewable after the project catalog changes; their sealed attempt evidence and verdicts SHALL remain unchanged.

#### Scenario: Project scenarios change after an attempt
- **WHEN** a maintainer reviews or reopens a completed campaign after the project scenario catalog changes
- **THEN** the report and review SHALL use the campaign's frozen prompts, assertions, and fixture identities
- **AND** current scenario wording SHALL not rewrite historical evidence or review criteria

#### Scenario: A saved catalog is damaged
- **WHEN** a campaign's catalog copy does not match its recorded hash
- **THEN** the harness SHALL reject assessment and human review of that campaign rather than substitute the current catalog
- **AND** the other registered hosts retain no inferred behavior verdict