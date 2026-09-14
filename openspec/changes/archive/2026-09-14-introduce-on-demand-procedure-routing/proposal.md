## Why

Projecting every research procedure as a host-visible Skill makes the Agent catalog grow with ResearchSpec's capability library, wasting prompt context and forcing host-side catalog compression. ResearchSpec needs one narrow discovery entry while preserving direct, open-ended Agent work and the graph runtime's stricter authority model.

## What Changes

- **BREAKING** Replace the fixed base Agent surface with one `researchspec-navigate` Skill; retain the optional seven-Skill Zotero Adapter unchanged.
- **BREAKING** Replace sixteen command wrappers with one Navigate wrapper for command-capable hosts. Skill-only hosts fall back to the Navigate Skill when `delivery: commands` is selected.
- Add a runtime-derived Procedure catalog covering ARSU workflows, hidden Companion procedures, core capabilities, and plugin extension capabilities without adding a second persisted registry.
- Add progressive CLI discovery through compact procedure search results, procedure metadata, and one selected instruction packet.
- Support two activation modes from the same procedure package: stateless standalone work over ordinary project files, and governed graph-node execution under existing run, Gate, Decision, handoff, and advance rules.
- Keep discovery global, require a schema `"2"` workspace for activation, and require domain selection before activating an unselected plugin procedure.
- **BREAKING** Remove `plugin instructions`; `instructions procedure:<id>` becomes the single direct-activation API and `instructions node:<run>/<node>` embeds the same procedure packet under graph authority.
- Make generated capability Completion text and ARSU preflight text activation-mode-neutral so packages do not hard-code a lifecycle.
- Stop projecting selected domain Skills and extension capabilities into host Skill roots; keep domain selection, resolution, profile projection, provenance, and package validation intact.
- Safely retire obsolete managed projections only when their recorded hashes still match, preserving and diagnosing drifted files and retaining existing shared-global authorization rules.

## Capabilities

### New Capabilities

- `procedure-routing`: Runtime-derived procedure discovery, metadata, activation packets, mode selection, and standalone authority boundaries.

### Modified Capabilities

- `agent-surface-model`: Replace the catalog-sized base surface and wrapper set with one Navigate entry per selected delivery channel.
- `agent-tool-delivery`: Deliver and safely reconcile only Navigate plus unchanged optional Zotero Skills, without projecting domain procedures.
- `companion-skills`: Keep Navigate as the sole visible Companion and expose Propose, Decide, Verify, and the CLI handbook only as on-demand procedures.
- `cli-interface`: Add procedure list/show/instructions selectors, extend node instructions with a procedure packet, and remove plugin instructions without adding a top-level command.
- `agent-plugin-augmentation`: Discover plugin procedures globally but require selected domains for activation and keep plugin use advisory.
- `arsu-user-routing`: Route bounded work to standalone activation and persistent or governed work to graph activation without turning Navigate into an execution whitelist.
- `arsu-run-usage`: Distinguish stateless standalone composition from graph-owned runs, Gates, Decisions, handoffs, and transitions.
- `capability-manifest`: Make package completion mode-neutral while retaining node-local scope and one package identity across both activation modes.
- `skill-browser-harness`: Show the production-visible entry surface separately from the hidden procedure/package inventory.

## Impact

- Affects Agent delivery planning and reconciliation, Companion rendering, CLI catalogs and dispatch, graph node instruction rendering, plugin activation, capability package authoring/generation, ARSU conversion, the development browser harness, documentation, and tests.
- Requires deterministic regeneration and maintenance checks for ARSU-derived and six vendor-derived extension package families.
- Does not change workspace schema `"2"`, add a public top-level command, add dependencies, call models, introduce embeddings, or change Zotero Adapter packaging.
