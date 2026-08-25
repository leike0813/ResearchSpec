### ResearchSpec Current Owner

Replacement scope: `HANDOFF-003` for `shared`.

> **Convention**: ARSU Markdown contracts remain human-readable payload formats,
> while ResearchSpec specs, controls, and handoffs are the stable project
> interfaces. Producers must validate every required payload field, write the
> boundary file outside `researchspec/`, and record its role and path in
> `researchspec/runs/<run-id>/handoff.md`. Project research intent,
> sources, claims, and manuscript constraints into their corresponding
> `researchspec/specs/*` files only through accepted contract changes. Missing
> required fields trigger `HANDOFF_INCOMPLETE`; consumers must not proceed with
> a partial handoff.

Current ResearchSpec owners:

- `researchspec/specs/project.md`
- `researchspec/specs/sources.yaml`
- `researchspec/specs/claims.yaml`
- `researchspec/specs/manuscript.yaml`
- `researchspec/runs/<run-id>/handoff.md`
