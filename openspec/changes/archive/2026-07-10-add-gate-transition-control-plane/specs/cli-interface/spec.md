## ADDED Requirements

### Requirement: Public Gate Submit Command
ResearchSpec SHALL dispatch `submit gate:<instance>/<node>` through a strict, dry-runnable and receipt-backed Gate transaction while preserving `submit work:` behavior.

#### Scenario: Non-interactive Gate submit is fully bound
- **WHEN** Gate submit runs outside an interactive TTY
- **THEN** it SHALL require strict input, validator actor, `confirmed_by`, matching `--expected-plan-sha256` and `--yes`
- **AND** `--yes` SHALL NOT substitute for the named human confirmation

#### Scenario: Gate results use stable classes
- **WHEN** Gate submit is previewed, committed or exactly retried
- **THEN** JSON data SHALL report `would_submit`, `submitted` or `already_submitted`
- **AND** usage, domain and conflict failures SHALL retain exit classes 2, 1 and 3

### Requirement: Public Transition Advance Command
ResearchSpec SHALL expose `advance transition:<instance>/<node>` as the only public state-transition transaction.

#### Scenario: Advance binds the previewed state plan
- **WHEN** Advance runs non-interactively
- **THEN** it SHALL require actor identity, a matching expected plan hash and `--yes`

#### Scenario: Advance reports scoped effects
- **WHEN** Advance previews, commits or exactly retries
- **THEN** JSON data SHALL report plan, receipt, from/to state, basis, state effect and post-transaction workflow control

### Requirement: Gate And Transition Instructions Are Executable
`researchspec instructions` SHALL return executable packets for ready scoped Gate and transition selectors.

#### Scenario: Unavailable selector is rejected
- **WHEN** a Gate or transition is unknown, blocked, stale, ambiguous or already complete
- **THEN** instructions SHALL return a stable domain error and SHALL NOT infer missing workflow facts
