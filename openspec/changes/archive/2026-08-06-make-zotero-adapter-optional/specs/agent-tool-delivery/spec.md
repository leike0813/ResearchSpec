## MODIFIED Requirements

### Requirement: Complete Companion Skill Delivery

Every selected tool SHALL receive generated copies of all four canonical
ResearchSpec Companion Skills together with the four ARSU and two Core Skills;
selected literature Adapter Skills SHALL be projected separately from their
catalog.

#### Scenario: Every tool receives the default ten-Skill surface

- **WHEN** any of the 31 registered tools is selected without optional Adapter selection
- **THEN** it SHALL receive four ARSU, two Core and four Companion Skills
- **AND** desired projection counts and files SHALL be derived from their owning catalogs rather than a second member list

#### Scenario: Selected Adapter reaches every tool

- **WHEN** `zotero-library` and one or more Agent tools are selected
- **THEN** all seven Adapter Skills SHALL be projected to every selected tool
- **AND** their complete trees SHALL use the normal managed ownership records

#### Scenario: Obsolete generated projections are cleaned safely

- **WHEN** a manifest-owned project-local file is no longer desired
- **THEN** init and update SHALL remove it only when its bytes match the recorded hash
- **AND** a modified file SHALL be preserved, reported as `generated_file_drift`, and retained in the manifest
- **AND** a missing stale file SHALL be removed from the manifest without error

### Requirement: Interactive And Detected Selection

Interactive initialization SHALL provide searchable Agent-tool selection
followed by optional literature-Adapter selection with catalog-backed guidance.

#### Scenario: First initialization preselects detected tools

- **WHEN** no tool configuration exists and a TTY is available
- **THEN** detected tools SHALL be preselected

#### Scenario: Optional Adapter choices are presented

- **WHEN** Agent-tool selection completes in an interactive init
- **THEN** the CLI SHALL present `zotero-library` unselected by default
- **AND** its description SHALL identify the seven-Skill bundle, require Zotero with `zotero-agents`, and link to `https://github.com/leike0813/zotero-agents`

#### Scenario: Non-interactive selection is deterministic

- **WHEN** no TTY is available
- **THEN** tool selection SHALL use `--tools` or detected tools under the existing rules
- **AND** Adapter selection SHALL default to none unless `--literature-adapters` is supplied

### Requirement: Local Selection And Ownership Facts

ResearchSpec SHALL store selected tool and literature-Adapter intent in
`researchspec/config.yaml` and all generated ownership evidence in the strict
current-state `tool-installation-manifest.json` schema version `1`.

#### Scenario: Successful writes update the manifest last

- **WHEN** tool or selected literature-Adapter files are installed or refreshed
- **THEN** the manifest SHALL record only successful paths through structured owner, source, target, executable and SHA-256 evidence
- **AND** it SHALL record resolutions only for selected literature Adapters
- **AND** it SHALL be committed after generated files

#### Scenario: Optional Skill IDs are reserved

- **WHEN** the plugin registry validates a vendor Skill ID
- **THEN** it SHALL reject collisions with packaged literature Adapter Skill IDs even when the Adapter is not selected
- **AND** reserved IDs SHALL NOT be counted as installed fixed Skills

#### Scenario: Previous current config shape is read

- **WHEN** a workspace config lacks required `literature_adapters.selected`
- **THEN** validation SHALL reject it as an unsupported current contract
- **AND** ResearchSpec SHALL NOT migrate, dual-write, or infer selection from old manifest records
