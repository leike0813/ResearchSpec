---
name: cap.discovery.source-quality-grading
description: "Grades each source by evidence level, predatory-journal red flags and conflicts of interest."
metadata:
  capability_id: cap.discovery.source-quality-grading
  node_kind: checker
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Source Quality Grading

Execute exactly one ResearchSpec capability node.

## Inputs

- `annotated_bibliography` (annotated-bibliography.v1)

## Outputs

- `graded_sources` (graded-sources.v1)

## Knowledge

- Load knowledge ID `evidence-hierarchy` from `knowledge/evidence-hierarchy.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
