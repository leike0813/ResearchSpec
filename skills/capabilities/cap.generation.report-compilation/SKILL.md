---
name: cap.generation.report-compilation
description: "Compiles the synthesis and method blueprint into a complete APA-style research report."
metadata:
  capability_id: cap.generation.report-compilation
  node_kind: producer
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Research Report Compilation

Execute exactly one ResearchSpec capability node.

## Inputs

- `synthesis_report` (synthesis-report.v1)
- `methodology_blueprint` (methodology-blueprint.v1)

## Outputs

- `research_report` (research-report.v1)

## Knowledge

- Load knowledge ID `academic-writing-style` from `knowledge/academic-writing-style.md`.
- Load knowledge ID `writing-quality-check` from `knowledge/writing-quality-check.md`.

## Procedure

Perform only the procedure described by the referenced knowledge and extraction artifacts. Do not choose, start, or advance another node, phase, mode, or run.

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action.
