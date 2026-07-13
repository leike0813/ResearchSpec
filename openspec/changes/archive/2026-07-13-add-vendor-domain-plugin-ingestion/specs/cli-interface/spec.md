## MODIFIED Requirements

### Requirement: Plugin Command Group
The CLI SHALL expose `plugin list [--installed]`, `plugin show <domain-id>`, `plugin install <domain-ids...>`, `plugin uninstall <domain-ids...>`, and `plugin update [domain-ids...]` while treating domain IDs as the only lifecycle selection unit.

#### Scenario: Domain catalog is listed outside a workspace
- **WHEN** a user runs `plugin list` without a workspace
- **THEN** the CLI SHALL list stable domains without vendor names

#### Scenario: Domain details expose provenance
- **WHEN** a user runs `plugin show <domain-id>`
- **THEN** the CLI SHALL distinguish direct and resolved Skills
- **AND** it MAY expose vendor, revision, license, and dependency provenance

#### Scenario: Machine output distinguishes intent and projection
- **WHEN** plugin lifecycle or status JSON is requested
- **THEN** it SHALL distinguish selected domains, resolved Skills, and projected Skills

