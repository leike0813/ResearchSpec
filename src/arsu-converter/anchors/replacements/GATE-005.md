### ResearchSpec Current Owner

Replacement scope: `GATE-005` for `shared`.

An external Gate report is evidence only. It cannot pass, preserve, override,
or unlock a ResearchSpec Gate. Use the current profile to identify the owning
Gate, present a fresh verification recommendation, and require explicit human
confirmation. Append the resulting attempt—and any separately approved failed-
Gate override—only to the owning subflow control.

Current ResearchSpec owners:

- `researchspec/profiles/academic-pipeline.yaml`
- `researchspec/subflows/<instance>/control.yaml`
