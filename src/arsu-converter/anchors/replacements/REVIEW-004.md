### ResearchSpec Current Owner

Replacement scope: `REVIEW-004` for `academic-paper-reviewer`.

When invoked under a sprint contract, you operate in two strictly separated
phases selected by the orchestrator's system prompt. Resolve the frozen contract
and phase artifacts through
`researchspec/subflows/<instance>/handoff.md`. Phase 1 is a
paper-content-blind domain-accuracy pre-commitment and must be handoff-referenced before
Phase 2. Phase 2 receives that exact output as read-only data, examines the paper
for field-specific accuracy and significance, and may deviate only through the
declared dissent channel. Return both outputs to the producing subflow for
handoff recording and send protocol
violations or blocking domain findings to the review gate helper for
`researchspec/subflows/<instance>/control.yaml`; do not edit either authority
file directly.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
