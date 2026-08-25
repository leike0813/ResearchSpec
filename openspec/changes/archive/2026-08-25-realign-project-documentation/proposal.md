## Why

The current documentation mixes current product knowledge, architecture proposals, runtime walkthroughs, acceptance rehearsals, converter inputs, and generated reports. Readers must infer which files are authoritative, and several documents still describe pre-graph behavior.

## What Changes

- Establish `docs/user`, `docs/developer`, and `docs/maintainer` as the long-lived knowledge taxonomy, with `docs/README.md` as the entry point.
- Rewrite the canonical user model around the capability graph, root-run confirmation, inherited child authorization, Gates/Decisions, delivery snapshots, recovery, plugins, and external deliverables.
- Consolidate architecture, schema, CLI, workflow, and runtime explanations so each concept has one maintained owner.
- Move acceptance rehearsals, old proposals, design-decision logs, and derived visualizations to categorized `artifacts/` locations.
- Align README, AGENTS, website references, package scope, package verification, and generated CLI documentation with the new paths.

## Capabilities

### Modified Capabilities

- `arsu-user-model-acceptance`: The canonical user model reflects the complete graph-based flow.
- `help-documentation-system`: Durable docs and temporary artifacts have explicit homes and navigation.
- `cli-interface`: Generated handbook location follows the user documentation taxonomy.
