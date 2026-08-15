---
name: cap.check.pdf-read-preflight
description: "Deterministic PDF extraction preflight."
metadata:
  capability_id: cap.check.pdf-read-preflight
  node_kind: checker
  execution_type: script
  gate_policy: required
  license: CC BY-NC 4.0
---

# PDF Read Preflight

Execute exactly one ResearchSpec capability node.

## Inputs

- `pdf_path` (pdf.v1)

## Outputs

- `pdf_preflight_report` (pdf-preflight.v1)

## Knowledge



## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
