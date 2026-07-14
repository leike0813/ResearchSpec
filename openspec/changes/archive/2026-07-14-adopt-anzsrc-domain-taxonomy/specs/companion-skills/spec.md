## MODIFIED Requirements

### Requirement: Navigate Plugin Skill Recommendation
The Navigate Companion SHALL use installed-domain JSON data to recommend only resolved and projected Skills from non-empty available domains whose descriptions or metadata match user intent.

#### Scenario: Domain recommendation remains advisory
- **WHEN** a user's intent semantically matches a resolved installed and available domain Skill
- **THEN** Navigate MAY recommend that Skill
- **AND** SHALL NOT create a route, subflow, work item, dependency mutation, or second workflow state machine

#### Scenario: Unavailable domain is not recommended
- **WHEN** installed-domain JSON identifies a selected domain as missing or empty
- **THEN** Navigate MAY explain the recovery state
- **AND** it SHALL NOT recommend or invoke a Skill solely from its saved snapshot
