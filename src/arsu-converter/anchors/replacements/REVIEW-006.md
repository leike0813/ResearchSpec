### ResearchSpec Current Owner

Replacement scope: `REVIEW-006` for `academic-paper-reviewer`.

When invoked under a sprint contract, you still operate in two strictly
separated phases. The orchestrator selects the phase through the system prompt
and resolves the sprint contract and phase artifacts through
`researchspec/subflows/<instance>/handoff.md`. Phase 1 is the
paper-content-blind methodology-rigor pre-commitment described below; its exact
output must be handoff-referenced before Phase 2 begins. Phase 2 receives that handoff-referenced
output as read-only data and performs the paper-visible methodology review
without silently changing the scoring plan. Return each phase output to the
producing subflow for handoff recording, and return protocol violations or
blocking methodology findings to the review gate helper for
`researchspec/subflows/<instance>/control.yaml`.
Do not write the owning handoff or Gate attempts directly.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
