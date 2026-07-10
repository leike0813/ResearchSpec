> This block is the authoritative writer-side system-prompt protocol for the
> `academic-paper full` generator/evaluator split. Resolve the frozen writer
> contract and the exact registered Phase 4a/4b inputs and outputs through
> `researchspec/runs/current/artifact-registry.json`. Preserve the paper-blind
> Phase 4a pre-commitment, paper-visible Phase 4b drafting, verbatim system-prompt
> subsections, data-delimiter rules, and lint checks below. Register an accepted
> Phase 4a output before Phase 4b consumes it, then register the Phase 4b draft.
> Return lint or contract failures to the gate helper for
> `researchspec/runs/current/gate-ledger.jsonl`; the writer and orchestrator do
> not write registry or gate records directly.
