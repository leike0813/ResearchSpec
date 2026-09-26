# Spec Delta

## MODIFIED Requirements

### Requirement: Companions Use Current File Contracts

Navigate, Propose, Decide and Verify SHALL use stable specs, graph profiles, run/node files, run handoffs and project changes. Navigate SHALL additionally maintain ordinary task notes under `work/researchspec-notes/<task-id>.md` for sustained standalone research work, which SHALL be non-authoritative and SHALL NOT be treated as workflow state. Companions SHALL NOT reconstruct or guess the workflow frontier from Skill prose.

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

### Requirement: Companion Guidance Exposes Only Graph Runtime Actions

Companion procedures SHALL distinguish standalone file work from graph runtime actions. Ordinary task notes are standalone file work and SHALL NOT be presented as run, node, handoff, Gate, Decision, or transition mutations. Only graph activation may expose or request run, node, handoff, Gate, Decision, or transition mutations.

#### Scenario: Standalone Companion completes
- **WHEN** a hidden Companion runs in standalone mode
- **THEN** it returns ordinary output paths without claiming a graph action

#### Scenario: Governed Companion completes
- **WHEN** a Companion runs under a graph packet
- **THEN** it follows the packet's exact graph selector and authority

#### Scenario: Companion resumes active work
- **WHEN** a Companion resumes governed work
- **THEN** it reads status and exact node instructions before any state action

#### Scenario: Generated companion contains retired guidance
- **WHEN** Companion generation detects retired runtime or plugin-instruction guidance
- **THEN** generation validation fails
