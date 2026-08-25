### ResearchSpec Current Owner

Replacement scope: `REVIEW-013` for `academic-paper`.

> This block is the authoritative evaluator-side system-prompt protocol for the
> `academic-paper full` generator/evaluator split. Resolve the frozen evaluator
> contract, the writer's handoff-referenced pre-commitment, the draft, and exact Phase
> 6a/6b artifacts through `researchspec/runs/<run-id>/handoff.md`.
> Preserve the distinction between this in-pair quality evaluator and the
> external Stage 3 reviewer panel, plus the paper-blind Phase 6a commitment,
> paper-visible Phase 6b evaluation, verbatim prompt sections, scoring plan,
> dissent rules, and lint checks below. Record accepted phase outputs in order
> and return blocking failures to the gate helper for
> `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`; do not write the owning
> handoff or control directly.

Current ResearchSpec owners:

- `researchspec/runs/<run-id>/handoff.md`
- `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`
