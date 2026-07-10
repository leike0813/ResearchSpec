Return a `compliance_report` conforming to
`shared/compliance_report.schema.json` (Schema 12) as a standalone artifact. The
orchestrator must first validate the report, then pass its path, hash, producer,
stage, and mode to the runtime registration helper for
`researchspec/runs/current/artifact-registry.json`. Pass the validated decision,
tiered findings, evidence, and material gaps to the compliance gate helper for
`researchspec/runs/current/gate-ledger.jsonl`. The compliance agent and
orchestrator MUST NOT append the report to a Material Passport or edit either
ResearchSpec runtime file directly.
