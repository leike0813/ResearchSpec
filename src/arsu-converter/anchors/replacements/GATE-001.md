Per audit run, emit one immutable claim-audit artifact containing all six
aggregates listed below plus the pass-through claim-intent inputs and any Stage 6
self-reflection appendix. Return the artifact path, hash, producer, stage, and
sampling metadata to the runtime registration helper for
`researchspec/runs/current/artifact-registry.json`. Submit HIGH-WARN constraint
violations and other configured blockers to the claim-integrity gate helper for
`researchspec/runs/current/gate-ledger.jsonl`; keep LOW/MED warnings as findings
without silently promoting them. The audit agent does not mutate claim
contracts, manifests, the registry, or the gate ledger.
