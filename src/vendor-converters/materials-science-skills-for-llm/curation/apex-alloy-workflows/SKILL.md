---
name: materials-science-skills-apex-alloy-workflows
description: Plan and interpret reviewed APEX alloy property workflows using user-provided runtimes and configurations.
license: MIT
compatibility: Requires a user-configured APEX runtime and any selected simulation, remote, or scheduler backend. ResearchSpec does not configure services or credentials.
metadata:
  vendor: materials-science-skills-for-llm
  vendor-release: snapshot-fafd3ab
  upstream-skill-id: apex-alloy-workflows
  researchspec-role: semantic-helper
---

Use this Skill to prepare property-workflow inputs, review parameter choices, and
interpret outputs. Read [property parameters](references/property-parameters.md)
and the [quickstart](references/quickstart.md) before proposing a run.

Treat every runtime, endpoint, machine profile, potential, and container as a
user-provided prerequisite. Present the intended operation, target environment,
expected cost, and files that may change. Obtain explicit confirmation before a
remote submission, scheduler action, cancellation, deletion, or other state
change. Never request, reveal, or persist credentials.

Outputs from this Skill are advisory scientific artifacts. Use ResearchSpec CLI
contracts for workflow state, Gates, Decisions, and artifact registration.
