**Mode A — orchestrator-driven (default):** `pipeline_orchestrator_agent` runs
the academic-paper phases end to end. It reads the configured stage graph from
`researchspec/specs/workflow.yaml`, reads the active phase and mode from
`researchspec/runs/current/state.yaml`, and resolves outlines, drafts, reviews,
and other phase inputs by artifact id through
`researchspec/runs/current/artifact-registry.json`. The orchestrator requests
state transitions from the ResearchSpec runtime; it does not carry state in a
Material Passport.

**Mode B — phase-by-phase (cross-session resume):** the user invokes one agent
per phase across sessions. Each invocation reads the same ResearchSpec state and
registered artifacts, performs only its assigned phase, and returns new outputs
for runtime registration. A legacy Material Passport may be imported as
compatibility evidence, but it never replaces the current ResearchSpec state or
artifact records.
