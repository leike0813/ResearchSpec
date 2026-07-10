## ADDED Requirements

### Requirement: Dialogue-First ARSU Routing
ResearchSpec SHALL treat user-Agent dialogue as the entry to academic work and SHALL keep workspace initialization separate from subflow start.

#### Scenario: Bootstrap does not start work
- **WHEN** a user initializes a ResearchSpec workspace
- **THEN** the system SHALL prepare workspace contracts and install available Skills
- **AND** it SHALL NOT select an ARSU mode or start a subflow

#### Scenario: Vague goal enters Navigate
- **WHEN** the request is vague, spans multiple Skills, resumes prior work, asks for state explanation, or asks for context export
- **THEN** the Agent SHALL route the request through `researchspec-navigate`

#### Scenario: Expert request goes directly to an ARSU Skill
- **WHEN** the user specifies an unambiguous ARSU Skill or mode
- **THEN** the Agent SHALL permit direct routing to that Skill and mode
- **AND** it SHALL still validate prerequisites and request route confirmation

### Requirement: Route Summary And Start Authorization
ResearchSpec SHALL present one route summary and obtain explicit user confirmation before starting any new subflow.

#### Scenario: Route summary is complete
- **WHEN** a route candidate has been resolved
- **THEN** the Agent SHALL present the selected Skill, mode, prerequisite expansion, expected artifacts, formal Gates, and cost summary

#### Scenario: Missing prerequisites expand the route
- **WHEN** the selected route lacks required upstream work
- **THEN** the route summary SHALL include the required prerequisite subflows
- **AND** the Agent SHALL NOT silently start them before confirmation

#### Scenario: Confirmation authorizes one route
- **WHEN** the user confirms the displayed route
- **THEN** the Agent SHALL authorize start of that exact subflow plan
- **AND** a materially different route SHALL require a new summary and confirmation

### Requirement: Routing Catalog Is The Mapping Authority
ResearchSpec SHALL derive ARSU routing and Skill-description projections from one typed converter-owned routing catalog.

#### Scenario: Mode mapping is projected consistently
- **WHEN** Navigate or an installed Skill describes an ARSU mode
- **THEN** skill identity, primary artifacts, prerequisites, risk, Gate policy, and near-miss guidance SHALL originate from the same catalog entry

#### Scenario: Near-miss intent is disambiguated
- **WHEN** a user request can plausibly map to evidence synthesis, manuscript writing, manuscript review, or a cross-stage pipeline
- **THEN** the Agent SHALL use catalog near-miss guidance to expose the distinction before route confirmation
