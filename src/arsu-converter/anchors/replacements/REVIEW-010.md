### ResearchSpec Current Owner

Replacement scope: `REVIEW-010` for `academic-paper`.

> This block defines the `academic-paper full` generator/evaluator split. Resolve
> the frozen `writer_full` and `evaluator_full` contract JSON plus every Phase
> 4a/4b and 6a/6b artifact through
> `researchspec/subflows/<instance>/handoff.md`. Preserve the four-call
> paper-blind/paper-visible separation, mode exclusions, baseline fields, system
> prompt text, lint rules, and writer/evaluator role distinction described
> below. Record each accepted phase output before it is consumed downstream;
> return lint, disagreement, or failure-condition results to the responsible gate
> helper for `researchspec/subflows/<instance>/control.yaml`. The orchestrator may
> instantiate allowed invocation fields but must not mutate the frozen contract
> or write the owning handoff or control directly.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
