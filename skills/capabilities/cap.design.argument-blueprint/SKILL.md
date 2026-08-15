---
name: cap.design.argument-blueprint
description: "Builds claim-evidence-reasoning chains and handles counterarguments."
metadata:
  capability_id: cap.design.argument-blueprint
  node_kind: producer
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Argument Blueprint

Execute exactly one ResearchSpec capability node.

## Inputs

- `paper_outline` (paper-outline.v1)

## Outputs

- `argument_blueprint` (argument-blueprint.v1)

## Knowledge



## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
