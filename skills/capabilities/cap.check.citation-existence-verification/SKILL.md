---
name: cap.check.citation-existence-verification
description: "Deterministic resolver-based citation existence gate."
metadata:
  capability_id: cap.check.citation-existence-verification
  node_kind: checker
  execution_type: script
  gate_policy: required
  license: CC BY-NC 4.0
---

# Citation Existence Verification

Execute exactly one ResearchSpec capability node.

## Inputs

- `annotated_bibliography` (annotated-bibliography.v1)

## Outputs

- `citation_verification_report` (citation-existence.v1)

## Knowledge



## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
