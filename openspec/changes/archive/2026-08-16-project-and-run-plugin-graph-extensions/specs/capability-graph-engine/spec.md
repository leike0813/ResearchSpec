## ADDED Requirements

### Requirement: Selected Plugin Capability Registry Overlay

The graph CLI SHALL resolve runnable capabilities from a base bundled capability registry plus capabilities assigned to the workspace's selected plugin domains. The combined registry SHALL use the same capability package shape and validator execution rules as the base registry.

#### Scenario: Plugin profile is validated before run start

- **WHEN** `start profile:<plugin-profile-id>` selects a projected plugin profile
- **THEN** the CLI SHALL validate every capability reference against the base-plus-selected-extension registry
- **AND** an unknown capability SHALL block run creation

#### Scenario: Plugin capability node returns its manifest contract

- **WHEN** `instructions node:<run>/<node>` targets a capability node backed by a selected plugin capability
- **THEN** the node card SHALL include the capability manifest's title, class, node kind, execution type, typed inputs/outputs, validators, and knowledge refs

#### Scenario: Plugin capability validators run on advance

- **WHEN** an eligible plugin capability node is advanced
- **THEN** the CLI SHALL run the declared validators from the selected plugin capability manifest
- **AND** a failed validator SHALL leave the node eligible without writing node state
