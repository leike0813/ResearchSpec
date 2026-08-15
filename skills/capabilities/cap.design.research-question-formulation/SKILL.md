---
name: cap.design.research-question-formulation
description: "Turns a project intent into a FINER-scored research question brief with scope boundaries and bound sub-questions."
metadata:
  capability_id: cap.design.research-question-formulation
  node_kind: producer
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Research Question Formulation

Execute exactly one ResearchSpec capability node.

## Inputs

- `project_intent` (specs.project)

## Outputs

- `rq_brief` (rq-brief.v1)

## Knowledge

- Load knowledge ID `finer-framework` from `knowledge/finer-framework.md`.
- Load knowledge ID `finer-socratic-questions` from `knowledge/finer-socratic-questions.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
