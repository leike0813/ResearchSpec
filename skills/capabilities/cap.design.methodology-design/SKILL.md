---
name: cap.design.methodology-design
description: "Selects a paradigm, methods, data strategy and analysis framework coherent with the confirmed research question."
metadata:
  capability_id: cap.design.methodology-design
  node_kind: producer
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Methodology Design

Execute exactly one ResearchSpec capability node.

## Inputs

- `rq_brief` (rq-brief.v1)

## Outputs

- `methodology_blueprint` (methodology-blueprint.v1)

## Knowledge



## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
