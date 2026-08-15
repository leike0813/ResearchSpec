---
name: cap.discovery.literature-search-screening
description: "Runs a systematic, reproducible search and screening process and produces an annotated bibliography with PRISMA-style documentation."
metadata:
  capability_id: cap.discovery.literature-search-screening
  node_kind: producer
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Literature Search And Screening

Execute exactly one ResearchSpec capability node.

## Inputs

- `rq_brief` (rq-brief.v1)
- `methodology_blueprint` (methodology-blueprint.v1)

## Outputs

- `annotated_bibliography` (annotated-bibliography.v1)

## Knowledge

- Load knowledge ID `prisma-documentation` from `knowledge/prisma-documentation.md`.
- Load knowledge ID `corpus-iron-rules` from `knowledge/corpus-iron-rules.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
