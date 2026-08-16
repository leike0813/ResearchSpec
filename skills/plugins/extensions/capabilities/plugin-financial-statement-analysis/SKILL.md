---
name: plugin-financial-statement-analysis
description: "Normalize and analyze financial statements with a deterministic statement tool for one graph node."
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

- `research_brief` (plugin-result.v1)

## Knowledge

- Load knowledge ID `statement-tool` from `tools/statements.py`.
- Load knowledge ID `financial-support` from `tools/financial_support.py`.

## Procedure

Work from `task_request` and produce a JSON `research_brief`.

1. Define the entity, reporting periods, currency, unit, consolidation scope, and accounting basis.
2. Extract statement records with provenance into purpose-specific JSON.
3. Run the packaged statement tool through the host Agent's Python runtime for normalization and metrics.
4. Interpret earnings quality, trajectory, anomalies, and unresolved accounting definitions.
5. Write a JSON brief with `scope`, `source_ledger`, `normalized_statements`, `metrics`, and `conclusions` sections.

## Completion

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
