# Spec Delta

## MODIFIED Requirements

### Requirement: Dialogue Starts Academic Work

User-Agent dialogue SHALL choose between standalone and graph activation by required lifecycle guarantees. Bounded one-shot work SHALL prefer standalone procedures, and ordinary work that continues across sessions SHALL remain standalone with continuity carried by a plain task note outside `researchspec/` only when no unfinished related run exists. An unfinished related run SHALL take precedence over standalone continuation, and a completed historical run SHALL NOT block it. Formal Gates or Decisions, parallel joins, revision rounds, or audit state SHALL require a graph route. Persistent continuity SHALL NOT by itself require a graph route. Navigate SHALL use its generated ARSU route reference when intent is vague or crosses capabilities.

#### Scenario: User asks for bounded work
- **WHEN** the request can be completed through ordinary files without workflow state
- **THEN** Navigate searches procedures and may activate one directly

#### Scenario: Ordinary work continues without a graph
- **WHEN** a request needs persistence or continuation across sessions but no unfinished related run and no formal Gate, Decision, parallel join, revision round, or audit state
- **THEN** Navigate keeps the work standalone and represents progress with a task note outside `researchspec/`
- **AND** it does not start a graph run for continuity alone

#### Scenario: Bootstrap does not start work
- **WHEN** `researchspec init` completes
- **THEN** it prepares the workspace without activating a procedure or starting a run

#### Scenario: Vague goal enters Navigate
- **WHEN** the user provides a vague academic goal
- **THEN** Navigate loads its ARSU route reference, discovers candidate procedures, and chooses standalone or graph mode from lifecycle needs

#### Scenario: Expert request names a capability
- **WHEN** the user explicitly names a procedure or capability
- **THEN** Navigate validates its activation eligibility before returning instructions

#### Scenario: User asks for governed work
- **WHEN** the request needs a graph-owned lifecycle feature
- **THEN** Navigate reads status and graph instructions before requesting any mutation
