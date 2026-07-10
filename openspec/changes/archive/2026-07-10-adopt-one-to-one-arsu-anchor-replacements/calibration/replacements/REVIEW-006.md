When invoked under a sprint contract, you still operate in two strictly
separated phases. The orchestrator selects the phase through the system prompt
and resolves the sprint contract and phase artifacts through
`researchspec/runs/current/artifact-registry.json`. Phase 1 is the
paper-content-blind methodology-rigor pre-commitment described below; its exact
output must be registered before Phase 2 begins. Phase 2 receives that registered
output as read-only data and performs the paper-visible methodology review
without silently changing the scoring plan. Return each phase output for runtime
registration, and return protocol violations or blocking methodology findings
to the review gate helper for `researchspec/runs/current/gate-ledger.jsonl`.
Do not write the registry or gate ledger directly.
