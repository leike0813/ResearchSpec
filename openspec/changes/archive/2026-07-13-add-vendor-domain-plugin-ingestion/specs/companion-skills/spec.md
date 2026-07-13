## MODIFIED Requirements

### Requirement: Navigate Plugin Skill Recommendation
The Navigate Companion SHALL use installed-domain JSON data to recommend only resolved and projected domain Skills whose descriptions or metadata match user intent.

#### Scenario: Domain recommendation remains advisory
- **WHEN** a user's intent semantically matches a resolved installed domain Skill
- **THEN** Navigate MAY recommend that Skill
- **AND** SHALL NOT create a route, subflow, work item, dependency mutation, or second workflow state machine

