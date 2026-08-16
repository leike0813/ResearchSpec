## ADDED Requirements

### Requirement: Script-Validated Plugin Capabilities

A selected plugin capability SHALL be allowed to declare script validators with the same runner
contract as bundled capabilities. The CLI SHALL invoke only the declared interpreter and argument
template during `advance`; install, update, status, and check SHALL NOT execute plugin scripts.

#### Scenario: Plugin script validator rejects incomplete evidence

- **WHEN** an eligible mixed-execution plugin capability node is advanced with an output that fails
  its declared script validator
- **THEN** `advance` SHALL return a validator diagnostic
- **AND** the node SHALL remain eligible without a state-file write

#### Scenario: Plugin script validator accepts complete evidence

- **WHEN** the same node is advanced after the output satisfies the declared script validator
- **THEN** `advance` SHALL mark the node complete through the normal atomic write path

#### Scenario: Static commands never execute plugin validators

- **WHEN** install, update, status, or check processes a plugin capability with script validators
- **THEN** those commands SHALL read manifests, paths, and hashes only
- **AND** they SHALL NOT invoke the validator interpreter
