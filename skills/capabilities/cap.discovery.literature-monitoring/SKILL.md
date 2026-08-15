---
name: cap.discovery.literature-monitoring
description: "Post-publication monitoring configuration."
metadata:
  capability_id: cap.discovery.literature-monitoring
  node_kind: producer
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Literature Monitoring

Execute exactly one ResearchSpec capability node.

## Inputs

- `research_question` (research-question.v1)

## Outputs

- `monitoring_config` (monitoring-config.v1)

## Knowledge

- Load knowledge ID `monitoring-strategies` from `knowledge/monitoring-strategies.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
