### ResearchSpec Current Owner

Replacement scope: `DECISION-002` for `shared`.

> **Enforcement boundary.** Resolve prior accepted compliance overrides for the
> same subflow and Gate from
> `researchspec/subflows/<instance>/control.yaml`. Apply the configured
> first-, second-, and third-round friction rules, stop for human confirmation,
> and ask ResearchSpec CLI to record the selected override, rationale, scope,
> report handoff role and path, and round count only after confirmation. The
> compliance report remains an ordinary boundary file referenced through
> `researchspec/subflows/<instance>/handoff.md`; its contents cannot authorize
> an override or mutate the owning control.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/control.yaml`
- `researchspec/subflows/<instance>/handoff.md`
