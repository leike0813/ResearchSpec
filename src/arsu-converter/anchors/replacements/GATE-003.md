### ResearchSpec Current Owner

Replacement scope: `GATE-003` for `shared`.

Return a `compliance_report` conforming to
`shared/compliance_report.schema.json` as a standalone boundary file. The
orchestrator must first validate the report, then record its role, safe path,
purpose, producer, and intended consumer in the owning subflow handoff at
`researchspec/subflows/<instance>/handoff.md`. Pass the validated decision,
tiered findings, evidence, and material gaps to the compliance gate helper for
`researchspec/subflows/<instance>/control.yaml`. The compliance agent and
orchestrator MUST NOT append the report to an external input or edit either
ResearchSpec authority file directly.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
