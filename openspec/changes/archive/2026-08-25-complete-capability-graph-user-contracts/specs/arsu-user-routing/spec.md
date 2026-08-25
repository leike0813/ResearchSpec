## MODIFIED Requirements

### Requirement: Profile Entry Summary Authorizes One Root Run

Before starting a root run, Navigate or a directly invoked ARSU Skill SHALL resolve the selected profile entry through its routing-catalog binding and summarize the entry node, stable-spec prerequisites, handoff inputs, boundary outputs, formal Gates, Decisions, risk, and cost. Confirmation SHALL be scoped to that root run and its frozen graph; the routing record SHALL describe meaning but SHALL NOT become runtime authority.

#### Scenario: Entry summary is confirmed

- **WHEN** the user confirms the displayed profile entry summary
- **THEN** the CLI may create exactly one human-authorized root run
- **AND** nodes and bound child runs declared by its frozen graph inherit that authorization
- **AND** each declared Gate and Decision still requires separate confirmation

#### Scenario: Route meaning and graph availability disagree

- **WHEN** the routing catalog describes an entry that the projected graph does not expose
- **THEN** the Agent reports the unavailable graph entry and SHALL NOT construct or start it from routing prose
