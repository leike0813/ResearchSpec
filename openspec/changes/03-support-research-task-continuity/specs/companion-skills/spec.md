## MODIFIED Requirements

### Requirement: Companions Use Current File Contracts

Navigate, Propose, Decide and Verify SHALL use stable specs, graph profiles, run/node files, run handoffs and project changes. Navigate SHALL additionally maintain ordinary task notes under `work/researchspec-notes/<task-id>.md` for sustained standalone research work, which SHALL be non-authoritative and SHALL NOT be treated as workflow state. When resuming ordinary work, Navigate SHALL check the note against the recorded project materials and SHALL NOT report or act on any run, node, Gate, Decision, or handoff state that the CLI does not confirm. Companions SHALL NOT reconstruct or guess the workflow frontier from Skill prose.

#### Scenario: Navigate explains current work
- **WHEN** a user asks to understand a project
- **THEN** Navigate uses status and directed selectors, identifies known facts and unknowns, and does not start a run without a confirmed profile entry

#### Scenario: Frontier is requested
- **WHEN** an Agent asks which action is legal next
- **THEN** the Companion returns the graph-derived `status --json` frontier and the corresponding selector instructions
- **AND** it does not present a prose-derived next-step plan

#### Scenario: Navigate continues an ordinary task
- **WHEN** a user returns to continue sustained standalone work
- **THEN** Navigate reads the related task note and current materials to restore context
- **AND** it does not require or create graph state for that continuation

#### Scenario: Navigate distinguishes ordinary continuation from run resume
- **WHEN** both a task note and an unfinished confirmed run are present
- **THEN** Navigate keeps them separate and uses status plus exact node instructions to resume the run
- **AND** it does not substitute the task note for run state

#### Scenario: Ordinary task resume verifies materials
- **WHEN** Navigate resumes a noted ordinary task
- **THEN** it checks the recorded materials and outputs before continuing
- **AND** it asks one focused question only when a difference changes the task identity, its inputs, or the next step and the materials do not settle it
