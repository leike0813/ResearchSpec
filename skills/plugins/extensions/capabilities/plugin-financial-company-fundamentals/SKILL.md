---
name: plugin-financial-company-fundamentals
description: Build an evidence-backed company fundamentals brief with deterministic metrics and scenario forecasts for one graph node.
metadata:
  capability_id: plugin-financial-company-fundamentals
  node_kind: producer
  execution_type: mixed
  gate_policy: advisory
  license: Apache-2.0
---

# Company Fundamentals Research

Execute exactly one ResearchSpec capability node.

## Inputs

- `task_request` (plugin-task.v1)

## Outputs

- `research_brief` (plugin-result.v1): a JSON object at the declared output path.

## Knowledge

- Load knowledge ID `company-fundamentals-tool` from `tools/fundamentals.py`.
- Load knowledge ID `financial-support` from `tools/financial_support.py`.

## Procedure

Work from `task_request` and produce a JSON `research_brief`.

1. Define the company and legal entity, reporting currency, unit, as-of date, period range, and decision question before collecting evidence. Ask when entity scope, currency, as-of date, or decision purpose would materially change the result.
2. Build a source ledger separating audited filings, company disclosures, market data, third-party research, and user assumptions. Prefer primary filings for reported facts and record every provider, requested field, date boundary, and returned provenance.
3. Describe the business model, segments, customers, geography, and revenue logic from cited evidence.
4. Write normalized periods into one purpose-specific JSON file and run the packaged tool through the host Agent's Python runtime:
   `python3 tools/fundamentals.py metrics --input periods.json --output metrics.json`.
   Inspect growth, margins, returns, leverage, cash conversion, and missing denominators.
5. Choose base, upside, and downside driver assumptions. Record each value, applicable years, source, rationale, confidence, and invalidation condition, then run:
   `python3 tools/fundamentals.py forecast --input forecast-input.json --output forecast-results.json`.
6. Interpret the calculated output. Separate historical facts, deterministic calculations, assumptions, forecasts, and Agent judgments.
7. Write the `research_brief` JSON with these required sections: `scope`, `source_ledger`, `business_model`, `historical_metrics`, `scenarios`, `forecast_tables`, and `conclusions`. Include thesis, catalysts, risks, valuation implications, rating rationale, limitations, and monitoring indicators in the conclusions or supporting fields.

## Hard constraints

- Preserve source dates, reporting periods, currencies, units, and restatement status; never silently coerce incomparable data.
- Treat management targets as attributed guidance rather than observed performance, and preserve original and overridden assumptions.
- Do not invent missing values, citations, peers, management guidance, ratings, targets, or probabilities.
- Do not let the script choose source quality, forecast assumptions, business meaning, materiality, thesis, or rating.
- The tool uses only Python 3.11 and the standard library. It performs no network, credential, installation, or repository access and refuses to overwrite without explicit `--overwrite`.
- If the support library is missing, stop; the copied tool tree is incomplete.

## Failure handling

- If required scope is ambiguous, ask one focused question before collecting more data.
- If sources conflict, preserve both and explain the resolution or leave the point unresolved.
- If a script rejects input, fix the named field; do not bypass validation.
- If current-data tools are unavailable, continue only with a clearly dated user-provided corpus and narrow the conclusion.
- Preserve existing outputs unless replacement is explicitly authorized.

## Completion

Return the declared outputs and follow the active procedure packet. In standalone
mode, report ordinary output paths without modifying ResearchSpec workflow state.
In graph mode, use only the packet's handoff and exact advance selector.
