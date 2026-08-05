## MODIFIED Requirements

### Requirement: Current User Model Acceptance

Packaged CLI journeys SHALL validate the current workspace, sixteen-command
surface, ten fixed Skills, optional seven-Skill Zotero Adapter and independently
confirmed subflows.

#### Scenario: Fresh default journey is exercised

- **WHEN** acceptance starts from an empty project through the packaged CLI without Adapter selection
- **THEN** every authoritative mutation SHALL be performed by a fresh CLI process
- **AND** the workspace SHALL contain no `.zotero-bridge` runtime or Adapter Skill projection

#### Scenario: Fresh Zotero journey is exercised

- **WHEN** acceptance initializes with explicit `zotero-library` selection
- **THEN** the selected Agent host SHALL receive all seven Adapter Skills and the project SHALL receive the current-platform runtime and profile template
- **AND** test helpers SHALL not execute Adapter assets or contact Zotero
