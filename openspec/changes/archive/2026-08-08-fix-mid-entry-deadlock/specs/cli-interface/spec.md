## ADDED Requirements

### Requirement: Mid-entry instructions expose executable choices
Instructions for a mid-entry profile route SHALL expose each legal entry point as structured data with its route, prerequisites, required input roles, formal Gates, risks, and cost. The descriptor-owned Start template SHALL include `entry_point`; instructions for routes that do not accept it SHALL omit that field.

#### Scenario: Mid-entry instructions are requested
- **WHEN** a caller requests instructions for `academic-pipeline:mid-entry`
- **THEN** the packet lists every profile-declared executable entry point with its confirmation context
- **AND** its Start template identifies `entry_point` as required

#### Scenario: End-to-end instructions are requested
- **WHEN** a caller requests instructions for `academic-pipeline:end-to-end`
- **THEN** the Start template does not offer `entry_point`

### Requirement: Workspace checks reject invalid profile checkpoints
Subflow checking SHALL verify that a profile parent checkpoint names a child or parallel-group checkpoint in its current profile. An invalid checkpoint SHALL produce the stable `subflow_checkpoint_invalid` diagnostic and SHALL NOT be inferred or migrated.

#### Scenario: Legacy synthetic entry parent is checked
- **WHEN** a current-schema parent control has checkpoint `entry` but the current profile has no such checkpoint
- **THEN** `check subflows --json` reports `subflow_checkpoint_invalid`
- **AND** the control remains unchanged
