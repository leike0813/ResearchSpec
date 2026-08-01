## ADDED Requirements

### Requirement: Companions Use Current File Contracts
Navigate, Propose, Decide and Verify SHALL use stable specs, route metadata, per-subflow controls,
handoffs and project changes without reading or writing removed runtime authorities.

#### Scenario: Navigate explains current work
- **WHEN** a user asks to resume or understand a project
- **THEN** Navigate uses status and directed selectors, identifies known facts and unknowns, and does
  not create a subflow without confirmation

### Requirement: Companion Decisions Respect File Ownership
Verify SHALL propose Gate findings, Decide SHALL record only the relevant owning-control or
project-change decision, and Propose SHALL create adaptable project change documents.

#### Scenario: Formal Gate is reviewed
- **WHEN** Verify has prepared a recommendation and the user confirms a verdict
- **THEN** Decide updates only the Gate in the owning control

## REMOVED Requirements

### Requirement: Current Companion Submission Guidance
**Reason**: The current contract has no artifact or Gate submit command.
**Migration**: Use handoffs for outputs and Decide/Advance for formal control changes.

### Requirement: Companions Consume Runtime Descriptors
**Reason**: Case action descriptors and action-basis hashes are removed.
**Migration**: Consume selector-specific current instructions.

