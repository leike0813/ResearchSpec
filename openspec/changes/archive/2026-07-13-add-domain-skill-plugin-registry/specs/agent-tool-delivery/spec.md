## ADDED Requirements

### Requirement: Optional Plugin Skill Delivery
Every configured tool SHALL receive complete packaged copies of every available workspace-selected plugin Skill in addition to the fixed base surface.

#### Scenario: Plugin Skills reach all tool adapters
- **WHEN** one or more plugins are selected and tools are configured
- **THEN** all 31 supported tools SHALL be capable of receiving every registered resource under each selected plugin Skill root
- **AND** projected paths SHALL be derived from registry IDs

#### Scenario: New tool receives prior selections
- **WHEN** init or update adds a newly configured tool to a workspace with selected plugins
- **THEN** all available selected plugin Skills SHALL be projected to that tool automatically

### Requirement: Plugin Projection Ownership Evidence
Plugin projection SHALL reuse the installation manifest and record optional plugin ID, plugin version, and Skill ID in addition to existing path, hash, source, adapter, scope, and version evidence.

#### Scenario: Plugin writes commit manifest last
- **WHEN** plugin files are installed or refreshed successfully
- **THEN** their manifest entries SHALL identify the owning plugin and Skill
- **AND** the manifest SHALL be committed after the resource writes

### Requirement: Plugin Delivery Adds No Wrappers
Optional plugin Skills SHALL NOT create tool command wrappers.

#### Scenario: Command-capable tool receives plugins
- **WHEN** a selected plugin is projected to one of the 28 command-capable tools
- **THEN** the tool SHALL still contain exactly the eight base command wrappers managed by ResearchSpec
- **AND** the plugin SHALL be invoked as an installed Skill

### Requirement: Plugin Reconciliation Preserves Drift
Plugin desired-file refresh and retirement SHALL use existing manifest hash and drift rules, with stricter whole-transaction preflight for explicit uninstall.

#### Scenario: Desired plugin file is modified
- **WHEN** install or update encounters a desired plugin file whose current bytes differ from the recorded hash
- **THEN** it SHALL preserve and report the file by default
- **AND** `--force` MAY refresh that desired file

#### Scenario: Explicit uninstall contains drift
- **WHEN** any requested plugin file has manifest-recorded ownership but modified bytes
- **THEN** no file or selection in that uninstall transaction SHALL change
