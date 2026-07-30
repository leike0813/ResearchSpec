## ADDED Requirements

### Requirement: Annotation Selector Command Integration

ResearchSpec SHALL support canonical `annotation:<safe-id>` selectors through
the existing `instructions`, `submit`, and `show` commands, and SHALL support
`list annotations`, without adding a top-level command.

#### Scenario: Annotation action is discovered

- **WHEN** a normalized candidate session exists or a frozen Annotation Set is
  registered
- **THEN** status SHALL expose only the bounded `list:annotations` discovery
  entry
- **AND** instructions and show SHALL resolve current annotation metadata
  without embedding annotation bodies in status

#### Scenario: Non-interactive annotation submit is confirmed

- **WHEN** an Agent submits `annotation:<id>` outside a TTY
- **THEN** it SHALL provide the current action basis, `--confirmed-by`, and
  `--yes`
- **AND** it SHALL not require a plan hash

#### Scenario: Annotation command fails

- **WHEN** selector syntax, confirmation, candidate content, target evidence, or
  retry state is invalid
- **THEN** the CLI SHALL return the stable usage, domain, or write-conflict exit
  class and one parseable JSON failure envelope in JSON mode
