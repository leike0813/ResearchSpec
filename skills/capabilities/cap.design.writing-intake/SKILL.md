---
name: cap.design.writing-intake
description: "Collects paper configuration and style calibration for writing work."
metadata:
  capability_id: cap.design.writing-intake
  node_kind: producer
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Writing Intake

Execute exactly one ResearchSpec capability node.

## Inputs

- `project_intent` (specs.project)

## Outputs

- `writing_configuration` (writing-configuration.v1)

## Knowledge

- Load knowledge ID `style-calibration` from `knowledge/style-calibration.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
