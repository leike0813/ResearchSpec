## ADDED Requirements

### Requirement: Gate Authority Is Local To The Owning Control
Formal Gate attempts SHALL append to the Gate entry in the owning subflow control and contain a
verdict, human confirmer, timestamp, summary and optional handoff evidence.

#### Scenario: Gate is reverified
- **WHEN** a user confirms a new verdict after a prior attempt
- **THEN** the new attempt is appended without rewriting or duplicating the prior attempt

### Requirement: Failed-Gate Override Is One Decision
A failed-Gate override SHALL be embedded under that Gate with one Decision ID, approver, timestamp
and reason, and SHALL NOT be copied to another ledger.

#### Scenario: Failed Gate is overridden
- **WHEN** the user explicitly approves an override with a reason
- **THEN** only the owning control is atomically updated

### Requirement: Advance Is Separate From Confirmation
Gate confirmation or branch choice SHALL NOT advance a checkpoint; `advance` SHALL independently
validate the profile and directly dependent child controls before recording a transition.

#### Scenario: Gate passes
- **WHEN** a Gate attempt is confirmed as pass
- **THEN** the checkpoint remains unchanged until a valid advance occurs

## REMOVED Requirements

### Requirement: Confirmed Receipt-Backed Gate Submit
**Reason**: Gate authority is stored directly in the owning control and `submit` is removed.
**Migration**: Use `decide gate:<instance>/<gate>` followed by explicit `advance`.

### Requirement: Unique Receipt-Backed Transition Advancement
**Reason**: Transition history in the owning control is sufficient authority.
**Migration**: Use atomic control mutation without a receipt.

