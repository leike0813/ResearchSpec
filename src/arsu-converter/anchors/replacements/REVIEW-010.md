> This block defines the `academic-paper full` generator/evaluator split. Resolve
> the frozen `writer_full` and `evaluator_full` contract JSON plus every Phase
> 4a/4b and 6a/6b artifact through
> `researchspec/runs/current/artifact-registry.json`. Preserve the four-call
> paper-blind/paper-visible separation, mode exclusions, baseline fields, system
> prompt text, lint rules, and writer/evaluator role distinction described
> below. Register each accepted phase output before it is consumed downstream;
> submit lint, disagreement, or failure-condition results to the responsible gate
> helper for `researchspec/runs/current/gate-ledger.jsonl`. The orchestrator may
> instantiate allowed runtime fields but must not mutate the frozen contract or
> write runtime records directly.
