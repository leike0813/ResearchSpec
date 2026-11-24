---
title: Glossary
---

# Glossary

**Boundary deliverable** — An ordinary project file outside `researchspec/`, referenced
from a handoff by role and safe path.

**Companion workflow** — A framework-level Procedure such as proposing, deciding, or
verifying. Companion workflows are hidden Procedures, not host Skills.

**Decision** — A human-confirmed scope, claim, structure, branch, or failed-Gate
override choice stored in the owning node instance, or a project-change resolution
stored in that change.

**Formal Gate** — A profile-declared academic checkpoint whose verdict requires human
confirmation.

**Frozen graph** — The run-local copy of a profile that remains authoritative for that
run.

**Graph profile** — A converter-owned graph template projected into the workspace.

**Handoff** — A directly editable run document that records boundary input and output
roles, paths, purposes, sources, consumers, and limits.

**Navigate** — The only user-visible Agent Skill. It discovers and activates the
hidden Procedure inventory and owns the dialogue with the user.

**Procedure** — A loadable capability with declared input and output roles, activated
on demand through `instructions procedure:<procedure-id>`.

**Project change** — A proposed high-impact update kept separate from stable specs
until accepted, explicitly applied, and validated.

**Run** — One frozen graph execution. Root runs are human-authorized; bound child runs
inherit graph authorization.

**Stable specs** — The four owners for project intent, sources, claims, and manuscript
structure.

**Standalone mode** — Ordinary work that produces project files without creating a run,
node, handoff, Gate, or Decision.

**Task note** — A Markdown note at `work/researchspec-notes/<task-id>.md` that carries
sustained ordinary work between sessions. It is informal material, not workflow
state.
