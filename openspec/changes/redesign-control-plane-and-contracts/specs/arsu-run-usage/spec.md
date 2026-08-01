## ADDED Requirements

### Requirement: Current File-Based ARSU Runtime Protocol
ARSU Skills SHALL read stable specs and CLI instructions, write semantic outputs outside
`researchspec/`, maintain their own handoff, and request formal control mutations through the CLI.

#### Scenario: Producer completes ordinary work
- **WHEN** an ARSU producer creates a boundary deliverable
- **THEN** it records the explicit role and project-relative path in its handoff
- **AND** it does not submit, register or hash-bind the deliverable

### Requirement: Independent Subflow Confirmation
Every standalone, child, branch and dynamic revision-round start SHALL receive a route summary and a
separate human confirmation.

#### Scenario: Pipeline parent is confirmed
- **WHEN** a user confirms an academic-pipeline parent
- **THEN** no child is created until that child has its own confirmation

## REMOVED Requirements

### Requirement: Dual-Runtime Producer Protocol
**Reason**: Strict/adaptive producer behavior is replaced by one current contract.
**Migration**: Use a fresh current workspace and current instructions.

### Requirement: External Passport Mid-Entry Journey
**Reason**: Material Passport is not part of the current runtime.
**Migration**: Reintroduce selected external files through explicit handoff inputs.

