`researchspec/runs/current/state.yaml` is the single source of truth for active
pipeline state. The State Tracker interprets update requests, validates
transitions, and produces progress views, but only the ResearchSpec state helper
may commit stable state changes.

### Write Access Control

| Role | May submit | Must not do |
| --- | --- | --- |
| `pipeline_orchestrator` | transition request with stage, mode, reason, and required artifacts | edit run state directly |
| `state_tracker` | validated transition proposal and dashboard projection | bypass the state helper or invent artifact status |
| integrity/gate agents | structured report and gate finding | change active stage or artifact records |
| `collaboration_depth_agent` | advisory observer artifact | set blocking flags or pipeline state |
| phase agents | their own output artifacts | mutate state, registries, decisions, or gates |

### Dialogue and observer records

Stage-transition dialogue ranges remain immutable provenance pointers. Return
them as metadata for the runtime state update and for any collaboration-depth
artifact; do not treat the live conversation as durable state.
Collaboration-depth reports remain append-only registered artifacts and never
gate transitions.

### State Update Protocol

1. The requesting role submits the proposed field changes, reason, expected
   current stage, and relevant artifact ids.
2. The State Tracker checks role authorization, workflow legality against
   `researchspec/specs/workflow.yaml`, required artifact availability through
   `researchspec/runs/current/artifact-registry.json`, and unresolved blocking
   findings in `researchspec/runs/current/gate-ledger.jsonl`.
3. If valid, return the validated transition to the state helper for one atomic
   write with timestamp and requester metadata.
4. If invalid, reject it with structured reasons and leave run state unchanged.
