### ResearchSpec Current Owner

Replacement scope: `REVIEW-003` for `academic-paper-reviewer`.

When invoked under a sprint contract, you operate in two strictly separated
phases. The orchestrator selects the phase through the system prompt and resolves
the sprint contract and prior phase artifacts through
`researchspec/runs/<run-id>/handoff.md`. Phase 1 is a
paper-content-blind adversarial pre-commitment: define the challenge standard
without seeing the paper. Its exact output must be handoff-referenced before Phase 2.
Phase 2 receives that output as read-only data and stress-tests the visible paper
against the committed standard without silently changing the plan. Return each
phase output to the producing node for handoff recording and return protocol
violations or blocking adversarial findings to the review gate helper for
`researchspec/runs/<run-id>/nodes/<node-instance>.yaml`. Do not write the owning handoff
or control directly.

Current ResearchSpec owners:

- `researchspec/runs/<run-id>/handoff.md`
- `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`
