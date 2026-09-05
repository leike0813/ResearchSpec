## Why

Review finding 3 shows that a graph can omit a capability's required materials while instructions and advance still accept it. Research and writing presets currently exercise this gap, allowing completion without the declared evidence inputs.

## What Changes

- Enforce required roles, declared sources and explicit producer-role mappings at graph admission and node consumption.
- Allow a capability to declare one source or an explicit non-empty list of permitted sources; each graph binding still selects one source.
- Complete the minimal research chain using existing capabilities without formal Gates; repair research, writing and reviewer bindings and pipeline handoffs.
- Share input resolution between instructions and runtime, checking external material readability only on consumption and failing before state writes.
- Regenerate converter-owned packages, profiles and review records and extend existing behavioral tests.
- **BREAKING**: Profiles and frozen runs with incomplete input contracts are rejected; they are not automatically repaired.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `capability-manifest`: explicit input source alternatives and required-role semantics.
- `capability-graph-engine`: input admission and consumption checks and complete preset bindings.

## Impact

Capability DTOs and registry validation, graph runtime and CLI read models, converter authoring, generated projections and existing tests. No new CLI commands, dependencies, model calls or boundary-file lifecycle management.
