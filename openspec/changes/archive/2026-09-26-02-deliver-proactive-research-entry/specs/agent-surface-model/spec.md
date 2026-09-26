## ADDED Requirements

### Requirement: Project Agreements Are Non-Entry Context

A project research agreement SHALL direct relevant ordinary academic requests to the existing Navigate entry without adding a Skill, command, Procedure or worker. Discovery SHALL NOT authorize graph starts, formal controls or external effects.

#### Scenario: Ordinary academic request omits the product name
- **WHEN** the user requests academic work in an initialized project
- **THEN** the agreement directs the Agent to discover applicable current capabilities without requiring an explicit ResearchSpec mention

#### Scenario: User opts out
- **WHEN** the user requests unrelated work or explicitly declines ResearchSpec for the task
- **THEN** the agreement does not require ResearchSpec routing
