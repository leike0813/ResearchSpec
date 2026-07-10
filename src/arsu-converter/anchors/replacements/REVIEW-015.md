**Consumer:** academic-paper revision mode and the pipeline orchestrator resolve
Schema 11 commitment artifacts through
`researchspec/runs/current/artifact-registry.json`. Research-meaning commitments
become proposed `researchspec/changes/<change-id>/contract-patch.yaml` files;
manuscript edits trace to `researchspec/draft-patches/<patch-id>.json`; accepted
or rejected strategic choices are returned to the decision runtime for
`researchspec/runs/current/decision-ledger.jsonl`. An imported Material Passport
may carry a Schema 11 compatibility copy, but it is not the cross-stage source
of truth.
