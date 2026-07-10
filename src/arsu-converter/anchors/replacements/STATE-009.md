When importing an ARS Material Passport with `ARS_PASSPORT_RESET=1`, interpret
the following Schema 9 `reset_boundary[]` structure only as a compatibility
payload. Project stage, mode, and consumption state into
`researchspec/runs/current/state.yaml`; register the passport and referenced
outputs through `researchspec/runs/current/artifact-registry.json`; return human
branch choices to the decision runtime for
`researchspec/runs/current/decision-ledger.jsonl`; and submit verification or
staleness findings to the resume gate for
`researchspec/runs/current/gate-ledger.jsonl`. Do not append to this schema as a
substitute for those ResearchSpec-owned writes.
