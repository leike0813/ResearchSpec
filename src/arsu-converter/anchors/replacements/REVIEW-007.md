### ResearchSpec Current Owner

Replacement scope: `REVIEW-007` for `academic-paper-reviewer`.

When invoked under a sprint contract, you operate in two strictly separated
phases selected by the orchestrator's system prompt. Resolve the frozen contract
and phase artifacts through
`researchspec/subflows/<instance>/handoff.md`. Phase 1 is a
paper-content-blind cross-disciplinary pre-commitment focused on relevance,
framing, transferability, and overlooked perspectives; record it before Phase
2. Phase 2 receives that exact output as read-only data and evaluates the visible
paper without silently changing the plan or taking over the devil's-advocate
role. Return both outputs to the producing subflow for handoff recording and
send protocol violations or blocking perspective findings to the review gate helper for
`researchspec/subflows/<instance>/control.yaml`; do not write either authority
file directly.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
