## MODIFIED Requirements

### Requirement: Route Summary And Start Authorization
Before starting any route, Navigate or a directly invoked ARSU Skill SHALL summarize Skill, mode,
stable-spec prerequisites, handoff input roles, boundary outputs, formal Gates and cost, then obtain a
confirmation scoped only to that instance.

#### Scenario: Route summary is confirmed
- **WHEN** the user confirms the displayed route summary
- **THEN** the CLI may create exactly that subflow instance
- **AND** the confirmation does not authorize future children, branches or rounds

### Requirement: Routing Catalog Is The Mapping Authority
The routing catalog SHALL map supported user intents to route references and semantic
prerequisites without embedding artifact IDs, registry state or fixed output paths.

#### Scenario: Route instructions are requested
- **WHEN** Navigate resolves a supported ARSU route
- **THEN** instructions identify stable-spec and handoff-role prerequisites from the catalog

