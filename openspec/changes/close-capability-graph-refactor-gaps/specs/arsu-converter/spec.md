## ADDED Requirements

### Requirement: Generated ARSU Guidance Uses The Graph Protocol Exclusively

The converter SHALL project the current status, instructions, start, decide and advance graph protocol into all four ARSU Skills and SHALL reject generated operational guidance that references route, subflow, control-file or subflow-handoff authority.

#### Scenario: ARSU output is regenerated

- **WHEN** converter output is validated
- **THEN** every runtime selector resolves through the current graph CLI catalog
- **AND** no removed selector family appears in an operational instruction

### Requirement: Preset Profiles Have One Converter-Owned Registry

The converter SHALL emit the preset profile registry and profile files used by bootstrap, cross-validate their capability and entry references, and include them in deterministic idempotence checking.

#### Scenario: Profile source changes

- **WHEN** an authored preset graph changes without regeneration
- **THEN** converter checking fails instead of allowing core runtime data to mask the drift

