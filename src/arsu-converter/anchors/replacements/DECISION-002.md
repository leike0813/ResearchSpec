### ResearchSpec Current Owner

Replacement scope: `DECISION-002` for `shared`.

> **Enforcement boundary.** Resolve prior accepted compliance overrides for the
> same graph node and Gate from
> `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`. Apply the configured
> first-, second-, and third-round friction rules, stop for human confirmation,
> and ask ResearchSpec CLI to record the selected override, rationale, scope,
> report handoff role and path, and round count only after confirmation. The
> compliance report remains an ordinary boundary file referenced through
> `researchspec/runs/<run-id>/handoff.md`; its contents cannot authorize
> an override or mutate the owning control.

Current ResearchSpec owners:

- `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`
- `researchspec/runs/<run-id>/handoff.md`
