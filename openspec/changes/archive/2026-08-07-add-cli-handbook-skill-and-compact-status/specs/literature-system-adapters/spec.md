## MODIFIED Requirements

### Requirement: Bounded Static Adapter Health Appears In Status

Default status SHALL project only compact static health for each selected literature Adapter: identity, selection/state, connection state, projection state, diagnostic counts, and the directed `check:literature-adapters` selector. It SHALL not expose expected/projected/missing tool ID arrays or full diagnostic objects. Detailed Adapter inspection SHALL remain available through `check`.

#### Scenario: Adapter is not selected

- **WHEN** an optional Adapter is absent from the workspace selection
- **THEN** status SHALL expose `not-selected` with compact projection and diagnostic counts
- **AND** detailed inspection SHALL remain available without changing workspace authority

#### Scenario: Selected Adapter files are degraded

- **WHEN** static inspection finds missing, drifted, unsupported, or conflicted desired Adapter files
- **THEN** status SHALL expose the corresponding compact state and diagnostic counts
- **AND** detailed inspection SHALL remain available through the directed check selector
