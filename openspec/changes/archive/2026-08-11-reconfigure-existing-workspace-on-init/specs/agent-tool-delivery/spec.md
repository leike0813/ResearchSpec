## ADDED Requirements

### Requirement: Interactive re-init replaces current static selections

Interactive init against an existing current workspace SHALL present the same searchable Agent-tool and optional literature-Adapter selectors used for first initialization. Current selections SHALL be preselected, detected-only tools SHALL remain visible but unselected, and the confirmed selector results SHALL become the complete desired selections.

#### Scenario: Existing configuration is reopened

- **WHEN** a user runs `researchspec init` against an existing current workspace in a TTY without explicit selection options
- **THEN** the CLI presents Agent tools followed by optional literature Adapters
- **AND** each currently configured item is preselected
- **AND** detected-only Agent tools are not preselected

#### Scenario: A configured item is deselected

- **WHEN** the user confirms a re-init selection that omits a previously selected project-local tool or Adapter
- **THEN** the workspace config records the confirmed exact selection
- **AND** clean manifest-owned obsolete projections are removed
- **AND** drifted projections are preserved with ownership evidence and a structured diagnostic
- **AND** shared-global files are not deleted by the project deselection

#### Scenario: Unmanaged configuration remains outside init

- **WHEN** existing-workspace init reconfigures tools or literature Adapters
- **THEN** an omitted delivery option preserves `agent_tools.delivery`
- **AND** domain plugin selection remains unchanged
