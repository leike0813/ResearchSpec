## ADDED Requirements

### Requirement: Companion Guidance Exposes Only Graph Runtime Actions

All five Companion Skills SHALL derive resume, navigation, proposal, decision and verification guidance from `status --json` and graph selectors. Their generated instructions SHALL NOT reference removed route, subflow, control-file or subflow-handoff commands.

#### Scenario: Companion resumes active work

- **WHEN** a Companion Skill inspects an active graph run
- **THEN** it directs the Agent to an eligible node, Gate, Decision or pending child-run selector returned by current status

#### Scenario: Generated companion contains legacy guidance

- **WHEN** Companion generation or checking finds a removed selector family
- **THEN** generation validation fails

