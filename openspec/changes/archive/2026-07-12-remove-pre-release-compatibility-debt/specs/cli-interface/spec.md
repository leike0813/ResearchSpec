## MODIFIED Requirements

### Requirement: New workspaces use the universal profile
`researchspec init` SHALL always create an unstarted `arsu-v0-1` workspace and SHALL expose no profile selection option.

#### Scenario: Init receives a profile option
- **WHEN** a caller supplies `--profile`
- **THEN** CLI parsing SHALL reject the unknown option without writing a workspace
