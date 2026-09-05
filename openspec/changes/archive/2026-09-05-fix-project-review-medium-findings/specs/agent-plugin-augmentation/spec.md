## MODIFIED Requirements

### Requirement: Batch-Confirmed Agent Installation
An Agent SHALL install a proposed domain batch only after showing the exact
domain IDs and dry-run impact and receiving explicit human confirmation.

#### Scenario: User confirms a batch
- **WHEN** the user confirms the displayed domain batch and installation impact
- **THEN** the Agent SHALL execute the same exact domain selection non-interactively with `--yes`
- **AND** it SHALL reload plugin status before using the Skills

#### Scenario: Installation fails
- **WHEN** the requested domain selection changes, projection is blocked, or execution fails
- **THEN** no stale confirmation SHALL authorize a different installation batch
- **AND** the Agent SHALL continue core work without the augmentation
