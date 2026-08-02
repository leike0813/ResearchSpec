## ADDED Requirements

### Requirement: Per-Subflow Authority File
Every started subflow SHALL have exactly one `control.yaml` that owns its immutable instance ID,
route, optional profile/parent/round, start confirmation, lifecycle status, checkpoint, Gate attempts,
local Decisions and formal transitions.

#### Scenario: Standalone subflow starts
- **WHEN** a confirmed standalone route is started
- **THEN** the CLI atomically creates one control, one handoff and an optional private work directory
- **AND** no global state, ledger, receipt or registry is created

### Requirement: Child Relationship Has One Owner
The child control's parent reference SHALL be the only stored parent/child relationship fact; parent
views SHALL be derived by scanning controls.

#### Scenario: Parent status is requested
- **WHEN** status displays a pipeline parent
- **THEN** child summaries are derived from controls that reference the parent instance ID

### Requirement: Start Is Independently Confirmed And Idempotent
Each start SHALL bind its own semantic input and human confirmation; an exact retry SHALL resolve to
the same instance without reusing confirmation for a different instance.

#### Scenario: Parent confirmation exists
- **WHEN** a child route becomes available
- **THEN** starting the child still requires a new child-scoped confirmation

## REMOVED Requirements

### Requirement: Atomic Receipt-Backed Start
**Reason**: The owning control is the authority; a separate start receipt duplicates it.
**Migration**: Use atomic creation and the confirmation embedded in `control.yaml`.

### Requirement: Parent confirmation delegates exact child starts
**Reason**: Every child requires independent human confirmation.
**Migration**: Present and confirm a child-specific route summary.

