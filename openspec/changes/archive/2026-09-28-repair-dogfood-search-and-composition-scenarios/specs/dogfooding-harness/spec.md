# Spec Delta

## ADDED Requirements

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
