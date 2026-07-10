## MODIFIED Requirements

### Requirement: Next Workflow

`researchspec-next` SHALL restore cross-session context and recommend exactly one primary next action from authoritative lifecycle state and the CLI-derived workflow frontier.

#### Scenario: Recommendation follows fixed priority

- **WHEN** the user asks what to do next
- **THEN** the skill SHALL prioritize blocking diagnostics, blocking gates, pending changes or patches, archivable resolved items, ready work items, and workflow configuration or transition boundaries in that order
- **AND** it SHALL map decision events to their originating pending item
- **AND** it SHALL provide one primary action and no more than two alternatives
- **AND** it SHALL perform no high-impact write

#### Scenario: Ready work item uses dynamic instructions

- **GIVEN** status exposes one ready `work:<id>` selector after higher-priority lifecycle work is exhausted
- **WHEN** the skill prepares its recommendation
- **THEN** it SHALL call `researchspec instructions work:<id> --json`
- **AND** it SHALL use the returned producer Skill, dependencies, output, allowed writes, validation, and completion policy
- **AND** it SHALL NOT reconstruct those facts from static Skill text

#### Scenario: Ambiguous or unavailable frontier is not guessed

- **WHEN** several equal-priority work items are ready, the graph is absent or invalid, or the active stage requires an unavailable transition
- **THEN** the skill SHALL respectively request a user choice, route to configuration/check, or report the transition boundary
- **AND** it SHALL NOT infer a producer Skill, edit state, or claim the run is complete
