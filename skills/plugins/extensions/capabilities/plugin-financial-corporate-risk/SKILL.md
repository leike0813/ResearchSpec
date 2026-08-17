---
name: plugin-financial-corporate-risk
description: Identify, trace, prioritize, and monitor corporate and investment risks in an evidence-backed brief for one graph node.
metadata:
  capability_id: plugin-financial-corporate-risk
  node_kind: producer
  execution_type: llm
  gate_policy: advisory
  license: Apache-2.0
---

# Corporate Risk Research

Execute exactly one ResearchSpec capability node.

## Inputs

- `task_request` (plugin-task.v1)

## Outputs

- `research_brief` (plugin-result.v1): a JSON object at the declared output path.

## Procedure

Work from `task_request` and produce a JSON `research_brief`. Risk judgment is performed by the Agent; no script assigns semantic probability or severity.

1. Define the entity, decision horizon, as-of date, risk owner or audience, materiality frame, and the financial variables, legal entities, jurisdictions, and stakeholders in scope before collecting evidence.
2. Separate observed conditions, disclosed risks, inferred exposures, scenarios, and unsupported allegations. Record source incentives, corroboration, publication and event dates, and whether evidence establishes exposure, likelihood, impact, or only plausibility. Filing boilerplate establishes a disclosed category, not entity-specific probability or materiality.
3. For each candidate risk, identify source, exposure, trigger, transmission path, affected financial or operational variables, timing, and reversibility.
4. Evaluate likelihood or probability, impact, confidence, and interaction with other risks using explicit evidence and counterevidence. Every numeric score needs a rationale and invalidation condition.
5. Assess existing controls and mitigants, then state residual exposure rather than treating mitigation as elimination. Evaluate control coverage, tested effectiveness, capacity, timing, and new risks introduced.
6. Rank risks for the stated decision and horizon, explain dependencies and nonlinearities, and state what would change the ranking.
7. Write the `research_brief` JSON with these required sections: `scope`, `source_ledger`, `risk_register`, `transmission_paths`, `mitigants`, `residual_exposure`, `monitoring_indicators`, and `conclusions`. Include scenario effects, counterevidence, and limitations.

## Hard constraints

- Do not invent probabilities, quantify impact without a basis, or turn generic boilerplate into entity-specific evidence.
- Do not suppress low-probability/high-impact risks, correlated risks, counterevidence, or uncertainty.
- Do not let source recency, repetition, market movement, or management language mechanically determine materiality.
- Preserve confidentiality and user authority for private data and external retrieval.
- Distinguish gross exposure, mitigants, and residual exposure.
- Treat market movements as observations requiring a causal explanation, not proof of the event attributed to them.

## Failure handling

- If an allegation lacks reliable evidence, label it unverified and exclude it from conclusions.
- If probability or impact cannot be supported, use a bounded qualitative statement and explain the missing evidence.
- If sources conflict, preserve both and lower confidence.
- If the task requests legal, compliance, or investment authorization, provide research only and state the authority limit.

## Completion

When the brief is written, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
