## MODIFIED Requirements

### Requirement: Plugin Command Group
The CLI SHALL expose `plugin list [--installed] [--summary]`,
`plugin show <domain-id> [--summary]`, `plugin install <domain-ids...>`,
`plugin uninstall <domain-ids...>`, `plugin update [domain-ids...]`, and
`plugin instructions <skill-id>` while retaining `plugin` as the single
sixteenth top-level command.

#### Scenario: Compact catalog views are requested
- **WHEN** `--summary` is used for list or show
- **THEN** output SHALL omit full license and upstream provenance
- **AND** it SHALL retain identity, availability, installation, projection,
  counts, descriptions, dependencies, and entry hashes needed for Agent
  discovery

#### Scenario: Exact installed instructions are requested
- **WHEN** the caller requests an eligible installed Skill
- **THEN** the command SHALL return one versioned read-only instruction packet
- **AND** it SHALL not enter the runtime selector protocol or modify workspace

### Requirement: Agent-Bound Plugin Install
Non-interactive plugin installation SHALL bind execution to the exact current
dry-run plan.

#### Scenario: Install preview is produced
- **WHEN** plugin install runs with `--dry-run --json`
- **THEN** output SHALL include a deterministic `plan_sha256`, selected domain
  versions, resolved Skills, projected tools, and summarized writes

#### Scenario: Non-interactive install executes
- **WHEN** plugin install runs outside an interactive terminal
- **THEN** it SHALL require `--yes` and a matching
  `--expected-plan-sha256`
- **AND** mismatch or omission SHALL write nothing
