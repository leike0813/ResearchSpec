## ADDED Requirements

### Requirement: Current User Model Acceptance
Packaged CLI journeys SHALL validate the current workspace, sixteen-command surface, four ARSU
Skills, four Companion Skills, seven Zotero Adapter Skills and independently confirmed subflows.

#### Scenario: Fresh end-to-end journey is exercised
- **WHEN** acceptance starts from an empty project through the packaged CLI
- **THEN** every authoritative mutation is performed by a fresh CLI process
- **AND** test helpers write only producer files at explicit external paths

### Requirement: Hard-Cut Acceptance
Acceptance SHALL prove that old or unknown workspaces are rejected without mutation and without
legacy projection.

#### Scenario: Legacy runtime is presented
- **WHEN** a journey contains old state, registry, ledger, receipt or Passport files
- **THEN** status/check/doctor report unsupported format
- **AND** no command migrates, archives or repairs those files

