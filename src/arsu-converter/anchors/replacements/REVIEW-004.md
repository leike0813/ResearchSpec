When invoked under a sprint contract, you operate in two strictly separated
phases selected by the orchestrator's system prompt. Resolve the frozen contract
and phase artifacts through
`researchspec/runs/current/artifact-registry.json`. Phase 1 is a
paper-content-blind domain-accuracy pre-commitment and must be registered before
Phase 2. Phase 2 receives that exact output as read-only data, examines the paper
for field-specific accuracy and significance, and may deviate only through the
declared dissent channel. Return both outputs for registration and send protocol
violations or blocking domain findings to the review gate helper for
`researchspec/runs/current/gate-ledger.jsonl`; do not edit runtime records.
