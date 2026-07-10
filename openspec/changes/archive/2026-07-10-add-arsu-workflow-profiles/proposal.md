## Why

ResearchSpec can route all supported ARSU modes and can execute work, Gate, Decision, and transition transactions, but its only executable workflow profile is a partial research slice. It cannot yet instantiate pipeline stages as child subflows or create unbounded revision rounds, so the canonical ARSU usage model is not runnable from the CLI frontier.

## What Changes

- Add the `arsu-v0-1` universal workflow profile covering all 25 supported operational modes, both academic-pipeline entry routes, and an internal dynamic revision-round template.
- Make `arsu-v0-1` the default for newly initialized workspaces while preserving legacy profiles and existing Schema 0.1/0.2 workspaces without migration.
- Extend Schema 0.2 with declarative child-subflow nodes, parent-scoped selectors, delegated start authorization, child joins, route ownership, and instance-scoped outputs.
- Extend artifact submission with controlled ARSU artifact contracts and deterministic text and binary-file validation.
- Project the converter-owned workflow catalog into runtime and generated Skill guidance, and validate exact coverage against the routing catalog.
- Keep the public CLI at fifteen top-level commands; existing commands render and execute the new frontier.

## Capabilities

### New Capabilities

- `arsu-workflow-profiles`: Complete ARSU standalone and pipeline workflow graphs, artifact contracts, coverage validation, and dynamic revision-round composition.

### Modified Capabilities

- `framework-core`: Schema 0.2 gains generic child-subflow graph and instance-scoped output contracts.
- `subflow-instance-control-plane`: Start planning and execution support parent-scoped child candidates and delegated confirmation.
- `gate-transition-control-plane`: Parent workflow transitions and Decisions govern pipeline entry, revision loops, and terminal advancement.
- `artifact-submit`: Work candidates support controlled text and binary validation profiles and typed ARSU artifact references.
- `cli-interface`: Status, instructions, start, and init expose the universal profile without adding top-level commands.
- `arsu-converter`: Converter-owned workflow sources generate and validate the runtime profile and Skill projections.
- `companion-skills`: Agent guidance dispatches only from the child-aware CLI frontier and preserves human Gate and branch boundaries.

## Impact

- Affects workflow, run-state, selector, receipt, artifact, snapshot, and validation contracts in `src/core`.
- Adds converter-owned workflow and artifact catalogs plus a generated runtime profile.
- Changes only the default profile for new workspaces; existing workspace files and explicit legacy profile selection remain unchanged.
- Updates generated ARSU Skills, documentation, and workflow/CLI/converter tests.
- Adds no runtime dependency, public command, migration, or LLM integration.
