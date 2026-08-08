## ADDED Requirements

### Requirement: Mid-entry Start binds the confirmed entry point
A parent Start for a mid-entry profile route SHALL include one `entry_point` selected from that profile entry's declared choices. The Start confirmation SHALL preserve the selected value, the initial parent checkpoint SHALL equal it, and the parent Start SHALL NOT pre-create the child. `entry_point` SHALL be rejected for end-to-end, standalone, and child Starts.

#### Scenario: Confirmed mid-entry parent starts
- **WHEN** the Start payload names a declared mid-entry point and otherwise satisfies the route contract
- **THEN** the parent control stores that value in `start_confirmation.entry_point`
- **AND** its checkpoint is the selected child node
- **AND** the selected child still requires its own independent Start confirmation

#### Scenario: Mid-entry choice is missing or unknown
- **WHEN** a mid-entry parent Start omits `entry_point` or names a value not declared by the selected profile entry
- **THEN** Start fails before creating a subflow directory

#### Scenario: Entry point is used on another Start kind
- **WHEN** an end-to-end parent, standalone route, or child Start carries `entry_point`
- **THEN** Start fails before creating a subflow directory
