## ADDED Requirements

### Requirement: Navigate Plugin Skill Recommendation
`researchspec-navigate` SHALL use `plugin list --installed --json` to recommend semantically matching installed plugin Skills as advisory options.

#### Scenario: Installed domain Skill matches user intent
- **WHEN** Navigate receives a domain intent matching an installed plugin's domain, description, or Skill metadata
- **THEN** it MAY recommend that installed Skill and explain the match
- **AND** it SHALL keep the canonical ARSU route and CLI frontier distinct

#### Scenario: Plugin is not installed or does not match
- **WHEN** a registry plugin is uninstalled, unavailable, or not semantically relevant
- **THEN** Navigate SHALL NOT recommend its Skills as executable workspace capabilities

#### Scenario: Recommendation remains advisory
- **WHEN** Navigate recommends a plugin Skill
- **THEN** the recommendation SHALL NOT create a route, subflow, work item, Gate, Decision, receipt, or second state machine
