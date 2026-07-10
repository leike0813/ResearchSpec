**Mode A — orchestrator-driven (default):** `pipeline_orchestrator_agent` runs
the deep-research phases using stable project intent from
`researchspec/specs/project.md`, the configured stage graph from
`researchspec/specs/workflow.yaml`, and active run state from
`researchspec/runs/current/state.yaml`. Research briefs, bibliographies,
synthesis outputs, and related evidence are resolved and returned by artifact id
through `researchspec/runs/current/artifact-registry.json`.

**Mode B — phase-by-phase (cross-session resume):** each invocation reads only
the current ResearchSpec contracts, state, and registered inputs required for
its assigned phase, then returns its deliverables for registration. A Material
Passport reset tag may be used to locate legacy compatibility evidence, but it
does not carry active ResearchSpec state.
