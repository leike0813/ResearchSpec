## ADDED Requirements

### Requirement: Natural-Language CLI Discovery Uses Navigate Without Starting Work

ResearchSpec SHALL route a natural-language request to discover, explain, or
compare public CLI commands, options, selector families, or the CLI handbook
through `researchspec-navigate`. CLI discovery is distinct from an academic
goal and SHALL NOT select an ARSU mode, create a route summary, or start a
subflow merely because the user asks how to operate ResearchSpec.

#### Scenario: User asks for a CLI operation manual

- **WHEN** a user asks how to use a ResearchSpec command, global option,
  `plugin` subcommand, selector family, or the CLI handbook
- **THEN** Navigate SHALL provide the relevant static discovery guidance or
  direct the user to the corresponding workspace-less help surface
- **AND** it SHALL explain that static help does not authorize a runtime write
- **AND** it SHALL leave the current run and subflow set unchanged

#### Scenario: CLI discovery becomes a runtime action question

- **WHEN** a user asking about command syntax also asks what action is currently
  available in a workspace
- **THEN** Navigate SHALL first distinguish static command discovery from the
  workspace-bound question
- **AND** for the latter it SHALL read bounded `status`, select a returned
  selector, and obtain its current `instructions` descriptor before proposing a
  write
- **AND** it SHALL follow the descriptor's execution policy and returned
  `next_selectors` rather than treating handbook text as authority

#### Scenario: Discovery is requested before workspace initialization

- **WHEN** a user requests CLI discovery without an existing workspace
- **THEN** Navigate SHALL allow static root, command, or plugin help to be
  explained without asking the user to initialize a research run
- **AND** it SHALL offer `init` only when the user asks to prepare a workspace
  or begin work
