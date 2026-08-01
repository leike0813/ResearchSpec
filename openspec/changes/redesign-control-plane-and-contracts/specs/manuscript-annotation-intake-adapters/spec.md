## MODIFIED Requirements

### Requirement: Mutable Intake Sessions Preserve Working Context
Free-form intake SHALL preserve raw source material, stable annotation IDs, normalized
interpretations and patch mappings inside the owning revision subflow's `work/annotation-intake/`
directory without registry, receipt or frozen-set authority.

#### Scenario: Intake is resumed
- **WHEN** the Agent reopens an existing intake session
- **THEN** it reads the session's explicit private files and preserves raw observations separately
  from interpretation

### Requirement: Public Headless Adapter API
The headless intake adapter SHALL accept explicit source and destination paths and SHALL return
structured diagnostics without loading workspace snapshot, registry or control state.

#### Scenario: Adapter input is invalid
- **WHEN** source material or annotation mapping fails validation
- **THEN** the adapter returns a structured error and does not write a completed annotation set

