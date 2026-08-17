---
name: plugin-financial-statement-analysis
description: Normalize financial statement records and produce an evidence-backed statement analysis brief for one graph node.
metadata:
  capability_id: plugin-financial-statement-analysis
  node_kind: producer
  execution_type: mixed
  gate_policy: advisory
  license: Apache-2.0
---

# Financial Statement Analysis

Execute exactly one ResearchSpec capability node.

## Inputs

- `task_request` (plugin-task.v1)

## Outputs

- `research_brief` (plugin-result.v1): a JSON object at the declared output path.

## Knowledge

- Load knowledge ID `statement-tool` from `tools/statements.py`.
- Load knowledge ID `financial-support` from `tools/financial_support.py`.

## Procedure

Work from `task_request` and produce a JSON `research_brief`.

1. Define the entity, reporting periods, currency, unit, consolidation scope, and accounting basis before collecting records.
2. Extract statement records with provenance into purpose-specific JSON.
3. Run the packaged tool through the host Agent's Python runtime for normalization and metrics:
   `python3 tools/statements.py normalize --input records.json --output normalized.json`,
   then `python3 tools/statements.py metrics --input normalized.json --output metrics.json`.
   Run `python3 tools/statements.py forecast --input forecast-input.json --output forecast-results.json`
   only when the task requires a scenario forecast.
4. Inspect every output and the tool's printed path and SHA-256 before interpreting results.
5. Interpret earnings quality, trajectory, anomalies, restatements, adjustments, and unresolved accounting definitions.
6. Write the `research_brief` JSON with these required sections: `scope`, `source_ledger`,
   `normalized_statements`, `metrics`, and `conclusions`. Separate facts, calculations,
   assumptions, forecasts, and Agent judgments.

## Hard constraints

- Preserve source dates, reporting periods, currencies, units, restatement status, and
  reported labels; never silently coerce incomparable data.
- Do not invent missing line items, values, citations, restatement details, or conclusions.
- Do not let the script choose source quality, accounting interpretation, materiality, or conclusions.
- The tool uses only Python 3.11 and the standard library. It performs no network, credential,
  installation, or repository access and refuses to overwrite without explicit `--overwrite`.
- If the support library is missing, stop; the copied tool tree is incomplete.

## Failure handling

- If required scope is ambiguous, ask one focused question before collecting more data.
- If sources conflict, preserve both and explain the resolution or leave the point unresolved.
- If a script rejects input, fix the named field; do not bypass validation.
- Preserve existing outputs unless replacement is explicitly authorized.
- Stop when the available evidence cannot support the requested conclusion.

## Completion

When the brief is written, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
