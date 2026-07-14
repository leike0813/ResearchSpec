## MODIFIED Requirements

### Requirement: Optional Plugin Skill Delivery
Every configured tool SHALL receive complete packaged copies of every currently available workspace-selected domain Skill in addition to the fixed base surface; empty or missing selected domains SHALL retain intent and snapshots but SHALL NOT produce desired files.

#### Scenario: Plugin Skills reach all tool adapters
- **WHEN** one or more available non-empty domains are selected and tools are configured
- **THEN** all 31 supported tools SHALL be capable of receiving every registered resource under each resolved Skill root
- **AND** projected paths SHALL be derived from registry IDs

#### Scenario: New tool receives prior selections
- **WHEN** init or update adds a newly configured tool to a workspace whose selected domains are all available
- **THEN** all selected domain Skills and dependency closures SHALL be projected to that tool automatically

#### Scenario: Unavailable selection blocks refresh
- **WHEN** init or update encounters a selected domain that is missing or empty
- **THEN** it SHALL block projection refresh rather than deleting prior files
- **AND** it SHALL preserve the last committed resolution snapshot

### Requirement: Domain Resolution Snapshot Delivery
Delivery reconciliation SHALL commit per-domain resolution snapshots with the installation manifest last and SHALL retain the last snapshot for every selected unavailable domain.

#### Scenario: New Agent tool receives current closure
- **WHEN** init or update adds a configured Agent tool after available domains were selected
- **THEN** the tool SHALL receive every currently resolvable Skill in the selected-domain closure

#### Scenario: Empty selected domain retains uninstall evidence
- **WHEN** a selected domain becomes empty in a later package
- **THEN** reconciliation SHALL retain its prior direct and resolved Skill snapshot
- **AND** safe uninstall SHALL use that snapshot without deleting files still reachable from another selection
