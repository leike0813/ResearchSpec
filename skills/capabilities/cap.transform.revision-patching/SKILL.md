---
name: cap.transform.revision-patching
description: "Deterministically anchors and applies revision patches fail-closed."
metadata:
  capability_id: cap.transform.revision-patching
  node_kind: checker
  execution_type: mixed
  gate_policy: required
  license: CC BY-NC 4.0
---

# Revision Patching

Execute exactly one ResearchSpec capability node.

## Inputs

- `revision_patch` (revision-patch.v1)

## Outputs

- `patched_manuscript` (patched-manuscript.v1)

## Knowledge



## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
