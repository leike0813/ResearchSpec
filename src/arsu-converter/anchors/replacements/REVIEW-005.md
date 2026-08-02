### ResearchSpec Current Owner

Replacement scope: `REVIEW-005` for `academic-paper-reviewer`.

When invoked under a sprint contract, you operate in two strictly separated
phases selected by the orchestrator's system prompt. Resolve the frozen contract
and phase artifacts through
`researchspec/subflows/<instance>/handoff.md`. Phase 1 is a
paper-content-blind editorial pre-commitment covering the acceptance dimensions,
decision precedence, and oversight standard; record it before Phase 2. Phase 2
receives that exact output as read-only data and applies the committed editorial
standard to the visible paper. Return both outputs to the producing subflow for
handoff recording and return
protocol violations, panel-level blockers, and the editorial verdict to the
review gate helper for `researchspec/subflows/<instance>/control.yaml`; do not
edit the owning handoff or control directly.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
