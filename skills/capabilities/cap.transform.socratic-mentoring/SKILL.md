---
name: cap.transform.socratic-mentoring
description: "Guided question-driven research or planning dialogue."
metadata:
  capability_id: cap.transform.socratic-mentoring
  node_kind: producer
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Socratic Mentoring

Execute exactly one ResearchSpec capability node.

## Inputs

- `project_intent` (specs.project)

## Outputs

- `socratic_session_notes` (socratic-session.v1)

## Knowledge

- Load knowledge ID `socratic-protocol` from `knowledge/socratic-protocol.md`.
- Load knowledge ID `socratic-framework` from `knowledge/socratic-framework.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
