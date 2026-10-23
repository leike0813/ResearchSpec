# research-task-usage Specification

## Purpose

Define the product-level default usage model in which a user's research task leads, ordinary work persists without a graph run, and only confirmed commitments live in stable research specifications.

## Requirements

### Requirement: Research Tasks Lead The Product

The product SHALL treat a natural research request as the entry condition for its capabilities. When a project contains a current workspace and the request concerns academic research work such as literature work, paper planning or writing, evidence checking, peer review, review response, or patent research and document preparation, the Agent SHALL discover and use applicable capabilities without the user naming ResearchSpec, a procedure, or any internal selector. When the user explicitly opts out of ResearchSpec for the current request, direct user instructions SHALL take precedence and the Agent SHALL NOT route that request into a ResearchSpec workflow. Requests unrelated to supported research work SHALL NOT be routed into a ResearchSpec workflow.

#### Scenario: Natural request selects a capability
- **WHEN** a user in a current workspace asks to accomplish a supported research task in ordinary language without naming ResearchSpec
- **THEN** the Agent discovers applicable capabilities and proceeds on the task
- **AND** it does not require the user to name a procedure, profile, or selector

#### Scenario: Unrelated request stays outside the framework
- **WHEN** a user asks for work unrelated to supported research tasks
- **THEN** the Agent does not route the request into a ResearchSpec workflow

#### Scenario: User explicitly opts out
- **WHEN** the user explicitly declines ResearchSpec for the current request
- **THEN** the Agent does not route that request into a ResearchSpec workflow
- **AND** it honors the direct user instruction over proactive discovery

#### Scenario: Patent task uses the same entry
- **WHEN** a user asks to turn technical materials into a patent disclosure or interpret a patent
- **THEN** Navigate discovers the fixed patent Procedures through the existing catalog

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

### Requirement: Manuscript Production Follows Collaborative Preparation

Before new manuscript writing or substantive revision, the coordinating Agent SHALL inspect current materials, discuss unresolved goals and arguments, investigate evidence gaps within the authorized source policy, and align the intended writing direction with the user. Discovery and provisional working outlines SHALL remain available during preparation.

#### Scenario: Topic alone is supplied
- **WHEN** a user requests a manuscript with an unresolved research question or argument
- **THEN** the Agent inspects available materials and discusses the direction before producing manuscript prose
- **AND** it does not replace discussion with an assumed thesis

#### Scenario: Evidence remains insufficient
- **WHEN** a proposed central claim lacks adequate evidence or faces conflicting findings
- **THEN** the Agent investigates the relevant gap and explains support, counterevidence and limitations
- **AND** unresolved evidence blocks only dependent assertions, with a limited alternative agreed with the user

#### Scenario: Direction was already confirmed
- **WHEN** current materials establish an unchanged, user-confirmed direction and adequate evidence
- **THEN** the Agent reuses that agreement and avoids repeating an interview or unnecessary external research

### Requirement: Manuscript Delivery Preferences Are Resolved Before Production

The Agent SHALL resolve working source format, final deliverables, venue or general requirements, and citation style from current confirmed context before substantive manuscript production. Unresolved choices SHALL be asked of the user; defaults SHALL be recommendations or explicitly delegated choices. Minor wording edits SHALL preserve established requirements with a simplified preparation path.

#### Scenario: Delivery preferences are unknown
- **WHEN** source format or a material delivery choice cannot be established from confirmed context
- **THEN** the Agent asks a focused question before dependent manuscript production
- **AND** it does not silently choose Markdown or APA

#### Scenario: Confirmed format is reused
- **WHEN** the task has confirmed QMD or LaTeX source and a citation style
- **THEN** production preserves those requirements and protected source structures
- **AND** final delivery is distinguished from working source format

#### Scenario: Small wording correction
- **WHEN** the user requests a bounded wording correction that leaves claims, structure and delivery unchanged
- **THEN** the Agent proceeds using the established requirements without a full interview

### Requirement: Coordinators Retain Preparation Across Delegation

The coordinating Agent SHALL own user discussion and preparation before worker dispatch, pass required confirmed context through existing material bindings or resolved inputs, and keep work inline when the packet cannot carry necessary context. Sustained task notes SHALL retain confirmed preferences, evidence limits and unresolved choices without becoming workflow authority.

#### Scenario: Worker lacks delivery context
- **WHEN** a worker packet cannot express necessary confirmed manuscript requirements
- **THEN** the coordinator executes the work inline or supplies the missing context through the existing packet contract
- **AND** a worker does not choose missing user preferences or conduct the interview

#### Scenario: Ordinary work resumes
- **WHEN** the user continues manuscript work recorded in a task note
- **THEN** the coordinator checks that recorded preferences and materials remain applicable and reuses them
- **AND** changed commitments follow the existing project change lifecycle
