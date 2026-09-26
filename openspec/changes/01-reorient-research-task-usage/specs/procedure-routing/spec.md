# Spec Delta

## MODIFIED Requirements

### Requirement: Standalone Activation Is Stateless And Open-World

Standalone activation SHALL require a current schema `"2"` workspace, MAY read and write ordinary project files outside `researchspec/`, including plain task notes under `work/researchspec-notes/`, and SHALL NOT create or mutate runs, nodes, handoffs, Gates, Decisions, profiles, or workflow state. Procedures MAY compose by passing explicit ordinary file paths. If no procedure matches, Navigate SHALL permit host-native Agent work clearly identified as outside a governed ResearchSpec run.

#### Scenario: Bounded one-shot work is requested
- **WHEN** the request does not need formal controls, parallel joins, or audit state
- **THEN** Navigate may return one standalone procedure packet whose completion returns ordinary output paths to the caller

#### Scenario: Sustained ordinary work is recorded outside the workspace
- **WHEN** standalone work spans sessions
- **THEN** continuity is carried by an ordinary task note outside `researchspec/`
- **AND** no run, node, or handoff state is created for that continuity

#### Scenario: Standalone work reaches a formal Gate rule
- **WHEN** a directly activated procedure contains findings relevant to a formal Gate
- **THEN** it may produce working evidence but SHALL NOT claim that the Gate was completed or confirmed

#### Scenario: No procedure matches
- **WHEN** deterministic discovery returns no suitable procedure
- **THEN** Navigate may continue with native Agent capabilities
- **AND** it SHALL state that the work is not a governed ResearchSpec run

### Requirement: Graph Activation Retains Closed-World Authority

Requests needing formal Gates or Decisions, parallel or joined work, revision rounds, or auditable workflow state SHALL use graph activation. Persistence and continuation alone SHALL NOT require graph activation. An unfinished related run SHALL take precedence over standalone task-note continuation; a completed historical run SHALL NOT. Graph packets SHALL retain the existing frozen-graph eligibility, role resolution, handoff, validation, and exact advance-selector rules.

#### Scenario: Governed work is requested
- **WHEN** the user's intent requires any graph-owned lifecycle feature
- **THEN** Navigate routes through profile and node selectors
- **AND** no procedure packet expands the frozen graph's legal frontier

#### Scenario: Continuity alone does not enter a graph
- **WHEN** the only reason to persist is that the user expects to continue the work later
- **THEN** Navigate keeps the work standalone with an ordinary task note
- **AND** it does not create a run
