# Spec Delta

## Purpose

Define the product-level default usage model in which a user's research task leads, ordinary work persists without a graph run, and only confirmed commitments live in stable research specifications.

## ADDED Requirements

### Requirement: Research Tasks Lead The Product

The product SHALL treat a natural research request as the entry condition for its capabilities. When a project contains a current workspace and the request concerns academic research work such as literature work, paper planning or writing, evidence checking, peer review, or review response, the Agent SHALL discover and use applicable capabilities without the user naming ResearchSpec, a procedure, or any internal selector. When the user explicitly opts out of ResearchSpec for the current request, direct user instructions SHALL take precedence and the Agent SHALL NOT route that request into a ResearchSpec workflow. Requests unrelated to academic research SHALL NOT be routed into a ResearchSpec workflow.

#### Scenario: Natural request selects a capability
- **WHEN** a user in a current workspace asks to accomplish an academic research task in ordinary language without naming ResearchSpec
- **THEN** the Agent discovers applicable capabilities and proceeds on the task
- **AND** it does not require the user to name a procedure, profile, or selector

#### Scenario: Unrelated request stays outside the framework
- **WHEN** a user asks for work that is not academic research
- **THEN** the Agent does not route the request into a ResearchSpec workflow

#### Scenario: User explicitly opts out
- **WHEN** the user explicitly declines ResearchSpec for the current request
- **THEN** the Agent does not route that request into a ResearchSpec workflow
- **AND** it honors the direct user instruction over proactive discovery

### Requirement: Ordinary Task Notes Carry Continuity

Sustained ordinary research work SHALL persist in plain Markdown task notes under `work/researchspec-notes/<task-id>.md` outside `researchspec/`. A task note SHALL record the user's goal and delivery expectations, inputs and produced files with their purpose, completed substantive work with evidence limits, open questions and the next step, and any related run selector. The Agent SHALL update the note when it reaches a stage output, becomes blocked, or ends a work session. A task note SHALL NOT be workflow state: ResearchSpec SHALL NOT register it in an installation manifest, scan it in `status`, validate it, or expose a CLI selector for it.

#### Scenario: Sustained task is recorded
- **WHEN** ordinary work spans more than a single exchange or is expected to continue
- **THEN** the Agent maintains a task note at the defined path describing goal, inputs and outputs, completed work, open questions, and next step

#### Scenario: One-off request needs no note
- **WHEN** a request is a single self-contained exchange
- **THEN** the Agent does not create a task note

#### Scenario: Task note is not workflow authority
- **WHEN** a caller inspects a workspace with existing task notes
- **THEN** `status` and `check` ignore the notes and report no task state
- **AND** no CLI selector addresses a task note

### Requirement: Continuing Ordinary Work Does Not Require A Graph

Continuing ordinary research work SHALL NOT by itself require a graph run, and persistent continuity SHALL be provided by task notes rather than by a run. Standalone continuation SHALL apply only when no unfinished related run exists; when a related run is unfinished, the Agent SHALL read `status --json` and exact node instructions and SHALL NOT continue that work as an ordinary task. A completed historical run SHALL NOT block standalone continuation of a new task. Work that needs a formal Gate or Decision, parallel or joined execution, revision rounds, or auditable workflow state SHALL still use a graph run.

#### Scenario: Ordinary task continues in a new session
- **WHEN** a user returns in a new session to continue ordinary work
- **THEN** the Agent restores context from the task note and the current materials
- **AND** it does not require the user to enter a graph run

#### Scenario: Formal run resume stays separate
- **WHEN** a workspace contains an unfinished confirmed run
- **THEN** the Agent reads `status --json` and exact node instructions before acting on that run
- **AND** it does not substitute a task note for run state

#### Scenario: Related confirmed run is not bypassed
- **WHEN** ordinary work relates to an unfinished confirmed run
- **THEN** the Agent continues that work through the run using status and exact node instructions
- **AND** it does not treat the work as standalone task-note continuation

#### Scenario: Completed historical run does not block a new task
- **WHEN** ordinary work is new and relates only to a completed run
- **THEN** the Agent may continue it standalone with a task note
- **AND** it does not require re-entering the completed run

### Requirement: Stable Specs Hold Confirmed Commitments Only

The stable research specifications SHALL hold only accepted research commitments: accepted scope, claims, limitations, and delivery requirements. Exploratory material such as candidate research questions, provisional positions, and draft outlines SHALL remain in ordinary working files outside `researchspec/` and MAY be iterated freely. Promoting a candidate to a commitment, or changing an existing commitment, SHALL use the existing project change lifecycle.

#### Scenario: Exploration stays in working files
- **WHEN** the Agent drafts candidate questions, tentative positions, or outlines
- **THEN** the material lives in ordinary working files and is not written into stable research specifications as a commitment

#### Scenario: Commitment is promoted through a project change
- **WHEN** a candidate becomes an accepted commitment or an existing commitment changes
- **THEN** the change is carried through the existing project change lifecycle
- **AND** the stable specification is edited only after that decision

### Requirement: Success Is Measured By Research Outcomes

Product success SHALL be measured by observable research outcomes: proactive capability discovery without a reminder, correct continuation of prior work, and usable deliverables. Adding modules, capability counts, or test counts SHALL NOT by itself count as product improvement.

#### Scenario: Progress is reported in research terms
- **WHEN** the Agent reports progress on a research task
- **THEN** it states what was completed, the supporting evidence, what is missing, and the next step
- **AND** it exposes internal selectors and protocol detail only when detail is needed
