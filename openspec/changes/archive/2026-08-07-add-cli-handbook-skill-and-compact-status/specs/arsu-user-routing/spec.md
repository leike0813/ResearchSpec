## MODIFIED Requirements

### Requirement: Natural-Language CLI Discovery Loads The Handbook Companion

ResearchSpec SHALL load `researchspec-cli-handbook` for any request to use, discover, explain, compare, inspect, troubleshoot, or modify public CLI commands, options, payloads, selector families, status, checks, generated projections, or workspace contracts. When the same request also requires vague workflow routing, resume, explanation, or export, Navigate MAY participate without owning the handbook.

#### Scenario: User asks for a CLI operation manual

- **WHEN** a user asks about a ResearchSpec command, option, payload, plugin subcommand, selector family, or workspace contract
- **THEN** the Agent SHALL load `researchspec-cli-handbook`
- **AND** static guidance SHALL not authorize a runtime write or start academic work

#### Scenario: CLI discovery becomes a runtime action question

- **WHEN** the request asks what action is currently available in a workspace
- **THEN** the Agent SHALL read bounded `status`, select a returned frontier item, and obtain its current `instructions` descriptor
- **AND** handbook text SHALL not replace runtime authorization

#### Scenario: Discovery is requested before workspace initialization

- **WHEN** a user requests CLI discovery without an existing workspace
- **THEN** the handbook SHALL explain root, command, or plugin help without requiring initialization
- **AND** it SHALL offer `init` only when the user asks to prepare a workspace

## RENAMED Requirements

- FROM: `### Requirement: Natural-Language CLI Discovery Uses Navigate Without Starting Work`
- TO: `### Requirement: Natural-Language CLI Discovery Loads The Handbook Companion`
