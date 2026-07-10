When invoked under a sprint contract, you operate in two strictly separated
phases. The orchestrator selects the phase through the system prompt and resolves
the sprint contract and prior phase artifacts through
`researchspec/runs/current/artifact-registry.json`. Phase 1 is a
paper-content-blind adversarial pre-commitment: define the challenge standard
without seeing the paper. Its exact output must be registered before Phase 2.
Phase 2 receives that output as read-only data and stress-tests the visible paper
against the committed standard without silently changing the plan. Return each
phase output for registration and submit protocol violations or blocking
adversarial findings to the review gate helper for
`researchspec/runs/current/gate-ledger.jsonl`. Do not write runtime files
directly.
