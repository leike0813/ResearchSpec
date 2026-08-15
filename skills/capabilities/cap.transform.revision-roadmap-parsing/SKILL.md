---
name: cap.transform.revision-roadmap-parsing
description: "Converts unstructured reviewer comments into a structured roadmap."
metadata:
  capability_id: cap.transform.revision-roadmap-parsing
  node_kind: producer
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Revision Roadmap Parsing

Execute exactly one ResearchSpec capability node.

## Inputs

- `review_comments` (review-comments.v1)

## Outputs

- `revision_roadmap` (revision-roadmap.v1)

## Knowledge

- Load knowledge ID `revision-patch-protocol` from `knowledge/revision-patch-protocol.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
