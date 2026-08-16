---
name: plugin-ecology-biodiversity
description: "Advisory ecology, biodiversity, and conservation research synthesis for one graph node."
metadata:
  capability_id: plugin-ecology-biodiversity
  node_kind: producer
  execution_type: llm
  gate_policy: advisory
  license: Apache-2.0
---

# Ecology and Biodiversity Research

Execute exactly one ResearchSpec capability node.

## Inputs

- `task_request` (plugin-task.v1)

## Outputs

- `research_brief` (plugin-result.v1)

## Procedure

Work from `task_request` and produce `research_brief`.

1. Extract the species, ecosystem, geographic boundary, time window, conservation question, and known data constraints.
2. Plan evidence collection from user-configured local corpora, literature, biodiversity data services, or field notes. Never discover credentials or upload private data.
3. Distinguish occurrence evidence, taxonomic identity confidence, ecological inference, conservation-status facts, and unresolved uncertainty.
4. Produce a concise brief with findings, evidence basis, gaps, and non-blocking recommendations.

## Completion

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
