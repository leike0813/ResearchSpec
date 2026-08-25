## Why

The capability graph refactor established the current schema 2 contract, but several public behaviors remain split between typed catalogs, generated profiles, handlers, and documentation. Users can currently receive instructions or handbook promises that the runtime cannot honor, especially for pipeline entries, Quarto formatting, change inspection, bounded listing, packing, confirmation, and static health reporting.

## What Changes

- Bind converter-owned ARSU profile entries to routing metadata so profile instructions can present one complete, user-confirmable entry summary without duplicating risk or cost facts.
- Generate every declared academic-pipeline end-to-end and mid-entry path, including the format and final-integrity boundary, from the converter-owned profile source.
- Complete the existing Quarto delivery contract by recording the confirmed delivery/probe snapshot in run authority and blocking formatting while Quarto is unavailable, without adding probes to read-only commands.
- Bring `instructions`, `show`, `list`, `pack`, `status`, `check`, `doctor`, and non-interactive plugin installation into agreement with their public typed contracts.
- Remove the stale two-Core-Skill claim from the fixed delivered surface.
- Preserve `completion_ready` as a derived run condition; this change does not add a public run-finalization command or an implicit status transition.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `capability-graph-engine`: Bind ARSU profile entries to route metadata and enforce the complete generated pipeline graph, including delivery-aware formatting boundaries.
- `cli-interface`: Align selector support, entry instructions, pagination, packing, static status/check/doctor summaries, and confirmation behavior with the public CLI contract.
- `arsu-user-routing`: Resolve user-confirmable profile entry summaries from the routing catalog and graph entry binding.
- `quarto-manuscript-delivery`: Persist the confirmed delivery/probe snapshot in run authority and gate formatting without probing from read-only commands.
- `agent-tool-delivery`: Define the fixed base surface as four ARSU Skills, five Companion Skills, and registered capability packages, with no Core Skills.

## Impact

- Typed contracts and runtime logic under `src/core`, `src/cli`, `src/graph-profiles`, `src/arsu-converter`, plugin handlers, and Companion workflows.
- Converter-generated ARSU profiles, Skills, registries, handbook output, and package verification fixtures.
- Existing behavior-focused CLI, graph runtime, converter, Quarto, plugin, and delivery tests.
- No new dependency, top-level command, model integration, network probe, or schema 1 compatibility path.
