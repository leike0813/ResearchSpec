---
name: paper-humanizer
description: Diagnose and improve mechanical or AI-like academic prose while preserving scholarly meaning and protected document syntax. Use when reviewing or revising manuscript prose.
---

# paper-humanizer

Use this Skill for manuscript prose only. Load the reference material silently before drafting or changing prose. Keep citations, links, equations, code, front matter, and venue-required markup unchanged unless the user explicitly authorizes a structural change.

## Modes

- `review`: read-only diagnosis with sentence-level observations and a revision plan.
- `full`: interactive revision. Present the plan, ask for approval, validate each candidate against the source analysis, and require final human acceptance.

ResearchSpec owns lifecycle state, Gates, Decisions, and transitions. Store runtime material under the current subflow's `work/paper-humanizer/`; never edit `control.yaml`, profile files, or handoff authority from this Skill.

## Boundaries

Do not invent evidence, alter claim strength, remove citations, or flatten disciplinary voice. Preserve source language and return ordinary boundary files outside `researchspec/`.

