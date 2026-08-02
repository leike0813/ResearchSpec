### ResearchSpec Current Owner

Replacement scope: `REVIEW-012` for `academic-paper`.

> This block is the authoritative writer-side system-prompt protocol for the
> `academic-paper full` generator/evaluator split. Resolve the frozen writer
> contract and the exact handoff-referenced Phase 4a/4b inputs and outputs through
> `researchspec/subflows/<instance>/handoff.md`. Preserve the paper-blind
> Phase 4a pre-commitment, paper-visible Phase 4b drafting, verbatim system-prompt
> subsections, data-delimiter rules, and lint checks below. Record an accepted
> Phase 4a output before Phase 4b consumes it, then record the Phase 4b draft.
> Return lint or contract failures to the gate helper for
> `researchspec/subflows/<instance>/control.yaml`; the writer and orchestrator do
> not write the owning handoff or Gate records directly.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
