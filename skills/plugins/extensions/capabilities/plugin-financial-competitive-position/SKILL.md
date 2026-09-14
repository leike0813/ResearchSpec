---
name: plugin-financial-competitive-position
description: Compare a company with defensible peers and produce an evidence-backed competitive position brief for one graph node.
metadata:
  capability_id: plugin-financial-competitive-position
  node_kind: producer
  execution_type: llm
  gate_policy: advisory
  license: Apache-2.0
---

# Competitive Position Research

Execute exactly one ResearchSpec capability node.

## Inputs

- `task_request` (plugin-task.v1)

## Outputs

- `research_brief` (plugin-result.v1): a JSON object at the declared output path.

## Procedure

Work from `task_request` and produce a JSON `research_brief`. This package has no bundled calculation script because peer selection and comparability are semantic judgments.

1. Define the focal company, comparison question, as-of date, decision horizon, and candidate peer universe before collecting evidence.
2. Establish peer inclusion and exclusion criteria from economic drivers, not sector labels. Evaluate revenue model, end market, customer type, geography, scale, growth phase, margins, capital intensity, financing, and cyclicality. Record each candidate as included, excluded, or limited-purpose; use separate operating and valuation peer groups when appropriate.
3. Align reporting periods, currency, units, accounting definitions, enterprise value date, and exceptional events. Obtain evidence only through user-configured browser, filing, market-data, or local-corpus tools; disclose tool authority, fields, dates, and provenance.
4. Compare business model, segment mix, growth, margins, returns, balance-sheet capacity, cash conversion, capital allocation, valuation, and relevant operating indicators.
5. Test claimed advantages against persistence, substitutability, customer behavior, competitive response, and disconfirming evidence. Connect each moat or disadvantage claim to an observable mechanism and a falsifying metric.
6. Explain relative valuation only after identifying comparability limits and the operating differences that could justify a premium or discount.
7. Write the `research_brief` JSON with these required sections: `scope`, `source_ledger`, `peer_ledger`, `normalized_comparison`, `moat_assessment`, `valuation_interpretation`, and `conclusions`. Include counterevidence, limitations, and monitoring indicators.

## Hard constraints

- Do not select peers solely by industry code, company suggestion, or available market data.
- Do not compare unaligned periods, currencies, units, equity values, enterprise values, or adjusted metrics without a documented bridge.
- Do not infer moat, quality, rating, or investment attractiveness from a single multiple or growth rate.
- Preserve rejected peers, contradictory evidence, data gaps, and structural differences that limit comparison.
- Treat high margins and growth as evidence requiring causal explanation, not automatic proof of moat durability.
- External tools retrieve authorized evidence only; they never decide the peer set or the conclusion.

## Failure handling

- If no peer is sufficiently comparable, say so and use narrower reference groups for individual metrics.
- If periods or definitions cannot be reconciled, omit the comparison or present it as non-comparable.
- If a source conflicts with a filing, retain both and explain which is authoritative.
- If current-data tools are unavailable, use a dated local corpus and narrow the as-of claim.
- Stop when the available evidence cannot support the requested conclusion.

## Completion

Return the declared outputs and follow the active procedure packet. In standalone
mode, report ordinary output paths without modifying ResearchSpec workflow state.
In graph mode, use only the packet's handoff and exact advance selector.
