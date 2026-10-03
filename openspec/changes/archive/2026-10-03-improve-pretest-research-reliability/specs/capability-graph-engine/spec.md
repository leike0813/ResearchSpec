## ADDED Requirements

### Requirement: Recovery Summaries Share Current Graph Derivation

Status and run instructions SHALL derive run summaries from current run, frozen graph, handoff, node and frontier records. Summaries SHALL identify entry, expected delivery, eligible selectors, pending controls and structured blockers with applicable round and material details. They SHALL NOT select a run by recency, create authority, scan task notes, or probe external material readability.

#### Scenario: Several unfinished runs exist
- **WHEN** status is requested
- **THEN** each unfinished run has its own deterministic summary without an automatically selected task

#### Scenario: A revision input cannot resolve
- **WHEN** a round's input role is unresolved
- **THEN** the recovery summary identifies the exact round/selector and available role/path detail with a legal inspection suggestion

