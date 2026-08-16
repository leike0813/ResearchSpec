## ADDED Requirements

### Requirement: Graph Extension Projection Ownership

Selected domain graph extensions SHALL be projected through the same plugin lifecycle reconciliation as raw plugin Skills. Extension capability files SHALL be manifest-owned agent-tool installations with kind `plugin-capability`; extension graph profiles SHALL be manifest-owned framework installations with kind `plugin-profile` under `researchspec/profiles/`.

#### Scenario: Domain install projects graph extensions

- **WHEN** a domain with graph-extension assignments is installed and skill-capable tools are configured
- **THEN** every configured tool SHALL receive the complete extension capability package files
- **AND** the workspace SHALL receive the assigned graph profile file
- **AND** the manifest SHALL record both projection kinds with content hashes

#### Scenario: Extension projection obeys drift and uninstall rules

- **WHEN** an extension file or profile has user modifications during refresh or uninstall
- **THEN** refresh SHALL preserve and report the modified file
- **AND** explicit uninstall SHALL fail closed without changing the selection or removing the modified file

#### Scenario: Domain snapshots include extension closures

- **WHEN** an available domain with graph extensions is selected
- **THEN** its `plugin_resolutions` snapshot SHALL include `resolved_skill_ids`, `resolved_capability_ids`, and `resolved_profile_ids`
- **AND** unavailable selected domains SHALL retain their last complete snapshot
