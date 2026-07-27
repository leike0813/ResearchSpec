## ADDED Requirements

### Requirement: Bounded Static Adapter Health Appears In Status

Default status SHALL project a bounded static summary of each fixed literature
adapter from the installation-inspection SSOT. The summary SHALL include adapter
identity, installation/runtime/projection state, compact diagnostic counts, and
the directed `check:literature-adapters` selector; it SHALL not perform a live
probe, execute adapter assets, contact a provider, or read credentials.

#### Scenario: Adapter files are degraded

- **WHEN** static inspection finds missing, drifted, unsupported, or conflicted
  adapter files
- **THEN** status SHALL expose the corresponding compact state and diagnostics
- **AND** detailed inspection SHALL remain available through the directed check
  selector without changing workspace authority

