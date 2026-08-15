---
name: cap.analysis.risk-of-bias-assessment
description: "RoB 2 and ROBINS-I assessments."
metadata:
  capability_id: cap.analysis.risk-of-bias-assessment
  node_kind: checker
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Risk of Bias Assessment

Execute exactly one ResearchSpec capability node.

## Inputs

- `systematic_review_corpus` (systematic-review-corpus.v1)

## Outputs

- `rob_assessment` (rob-assessment.v1)

## Knowledge



## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
