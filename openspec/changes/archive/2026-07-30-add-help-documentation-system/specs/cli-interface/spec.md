## MODIFIED Requirements

### Requirement: Complete Public Command Surface

ResearchSpec SHALL expose `init`, `update`, `status`, `instructions`, `start`,
`submit`, `advance`, `check`, `list`, `show`, `handoff`, `pack`, `propose`,
`decide`, `archive`, `doctor`, and `plugin` as the complete public CLI command
set.

#### Scenario: Help lists public commands

- **WHEN** a user runs `researchspec --help`
- **THEN** the CLI SHALL list all seventeen public commands
- **AND** it SHALL NOT list ARSU converter or upstream-maintenance commands
- **AND** it SHALL display a link to the documentation website at the end of
  the help output
- **AND** the link SHALL point to `https://leike0813.github.io/ResearchSpec/`

#### Scenario: Unsupported syntax is a usage error

- **WHEN** a user supplies an unknown command, option, target, or conflicting
  option combination
- **THEN** the CLI SHALL return exit code 2
- **AND** it SHALL direct the user to the relevant help surface
