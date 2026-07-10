**Mode A — orchestrator-driven (default):** `pipeline_orchestrator_agent` runs
all stages end to end using `researchspec/specs/workflow.yaml` as the configured
stage graph and `researchspec/runs/current/state.yaml` as active run state.
`state_tracker_agent`, integrity verification, collaboration-depth observation,
and claim-reference audit remain the specialized roles dispatched at their
configured checkpoints; produced material is resolved and registered through
`researchspec/runs/current/artifact-registry.json`, and gate outcomes are
submitted to the appropriate helper for
`researchspec/runs/current/gate-ledger.jsonl`.

**Mode B — phase-by-phase (cross-session resume):** the user invokes one phase
agent at a time. Each session resumes from current ResearchSpec state and the
registered artifacts required by that phase. `ARS_PASSPORT_RESET=1` and
`resume_from_passport=<hash>` remain optional compatibility export/import
mechanisms, not the run-state source of truth.
