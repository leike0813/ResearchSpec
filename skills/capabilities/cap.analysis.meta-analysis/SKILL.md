---
name: cap.analysis.meta-analysis
description: "Quantitative synthesis for systematic review."
metadata:
  capability_id: cap.analysis.meta-analysis
  node_kind: producer
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Meta Analysis

Execute exactly one ResearchSpec capability node.

## Inputs

- `systematic_review_corpus` (systematic-review-corpus.v1)

## Outputs

- `meta_analysis_report` (meta-analysis.v1)

## Knowledge

- Load knowledge ID `systematic-review-protocol` from `knowledge/systematic-review-protocol.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
