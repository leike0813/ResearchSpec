---
name: cap.analysis.evidence-synthesis
description: "Synthesizes graded sources into a convergent/divergent evidence map with claim-intent and citation emissions."
metadata:
  capability_id: cap.analysis.evidence-synthesis
  node_kind: producer
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Evidence Synthesis

Execute exactly one ResearchSpec capability node.

## Inputs

- `graded_sources` (graded-sources.v1)

## Outputs

- `synthesis_report` (synthesis-report.v1)

## Knowledge

- Load knowledge ID `claim-intent-emission` from `knowledge/claim-intent-emission.md`.
- Load knowledge ID `claim-intent-canonical` from `knowledge/claim-intent-canonical.md`.
- Load knowledge ID `three-layer-citation` from `knowledge/three-layer-citation.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
