## MODIFIED Requirements

### Requirement: Plugin Command Group
The CLI SHALL expose `plugin list [--installed]`, `plugin show <domain-id>`, `plugin install <domain-ids...>`, `plugin uninstall <domain-ids...>`, and `plugin update [domain-ids...]` while treating available non-empty domain IDs as the only lifecycle selection unit and retaining selected unavailable domains only for recovery.

#### Scenario: Domain catalog is listed outside a workspace
- **WHEN** a user runs normal `plugin list` without a workspace
- **THEN** the CLI SHALL list only stable non-empty domains without vendor names
- **AND** empty internal domains SHALL be absent from human and JSON output

#### Scenario: Empty domain is not installable
- **WHEN** a user shows or installs an internally registered domain with no reviewed Skills
- **THEN** the CLI SHALL reject it as unavailable without changing workspace state

#### Scenario: Installed unavailable domain remains recoverable
- **WHEN** an already selected domain is missing or empty and the user runs installed list or status
- **THEN** machine and human output SHALL identify the selection as unavailable
- **AND** uninstall SHALL remain available through saved resolution evidence while update SHALL block

#### Scenario: Domain details expose provenance
- **WHEN** a user runs `plugin show <domain-id>` for an available domain
- **THEN** the CLI SHALL distinguish direct and resolved Skills
- **AND** it MAY expose domain type, ANZSRC Group code, vendor, revision, license, and dependency provenance

#### Scenario: Machine output distinguishes intent and projection
- **WHEN** plugin lifecycle or status JSON is requested
- **THEN** it SHALL distinguish selected domains, available domains, unavailable selections, resolved Skills, and projected Skills
