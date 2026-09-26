## Purpose

Define how an ongoing, non-graph research task is carried across sessions: the main Agent keeps one plain Markdown note under `work/researchspec-notes/`, a later session checks that note against the real project materials before continuing, and the note never stands in for workflow state.

## ADDED Requirements

### Requirement: Ordinary Task Notes Are Main-Agent Owned

The main Agent SHALL maintain the ordinary task note for a sustained non-graph research task. A note SHALL live at `work/researchspec-notes/<task-id>.md` outside `researchspec/`. The note SHALL NOT be registered in an installation manifest, indexed, scanned by `status`, validated by the CLI, or addressed by a CLI selector. A delegated worker executing one procedure packet SHALL NOT create or update a note; the main Agent updates it after validating returned outputs.

#### Scenario: Sustained task gets a note

- **WHEN** ordinary work spans more than a single exchange or is expected to continue
- **THEN** the main Agent SHALL maintain that task's note at the defined path

#### Scenario: One-shot exchange creates no note

- **WHEN** a request is a single self-contained exchange with no continuing deliverable
- **THEN** the Agent does not create a task note and does not claim a task identity

#### Scenario: Worker does not write the note

- **WHEN** a delegated worker completes one packet for an ongoing task
- **THEN** it returns its brief without touching the task note
- **AND** the main Agent owns any note update after validating the returned paths and outputs

### Requirement: Resume Checks Real Materials And Resolves Scope

Resuming non-graph work SHALL read the task note and then check the recorded materials and outputs in the project. The Agent SHALL NOT infer the current task from modification order. When the note and the materials differ in a way that changes the task identity, its required inputs, or the next step, and the materials do not settle the question, the Agent SHALL ask one focused question naming the candidates or the affected material. A difference that leaves the task identity, the required inputs, and the next step intact SHALL be reported and the work continued.

#### Scenario: New session continues a noted task

- **WHEN** the user returns to an ongoing non-graph task in a new session
- **THEN** the Agent checks the note's recorded materials and outputs and continues from the recorded next step

#### Scenario: Several candidate tasks

- **WHEN** more than one note could match the request and the materials do not identify the intended task
- **THEN** the Agent asks one focused question naming the candidates
- **AND** it does not default to the most recently modified note

#### Scenario: Material changed without changing the work

- **WHEN** a recorded material or output differs from the note but the task identity, required inputs, and next step are unaffected
- **THEN** the Agent reports the difference and continues without requesting confirmation

### Requirement: A Note Is Not Workflow State

A task note SHALL NOT authorize any claim about a run, node, handoff, Gate, Decision, or transition. The Agent SHALL report workflow state only from current CLI output, and when the work requires graph-owned formal controls or scheduling it SHALL follow the existing graph entry and confirmation rules. Passing declared ordinary file inputs between standalone procedures does not itself require graph scheduling.

#### Scenario: Note cannot stand in for run state

- **WHEN** the Agent reports the status of a task that has a note
- **THEN** it reports run, node, Gate, and Decision state only from `status --json` and exact selector instructions
- **AND** it does not present the note as authority for any workflow action

#### Scenario: Formal control appears mid-task

- **WHEN** ordinary work requires a formal Gate, Decision, or graph-owned scheduling
- **THEN** the Agent follows the existing graph entry and confirmation rules instead of recording control state in the note
