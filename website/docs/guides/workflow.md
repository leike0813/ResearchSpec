---
title: Workflow
description: Understand current ResearchSpec subflows, handoffs, Gates, and transitions
---

# Workflow

ResearchSpec uses one file-based protocol:

```text
status → instructions <selector> → start / decide / advance → status
```

`init` prepares the workspace but starts no academic work. Before every standalone route, pipeline
parent, child, branch, or revision round, the Agent presents the Skill, mode, prerequisites, boundary
outputs, formal Gates, and cost. One confirmation authorizes one instance.

ARSU producers write semantic deliverables outside `researchspec/` and record their roles and safe
project-relative paths in the owning handoff. ResearchSpec does not ingest those files. Formal Gate
verdicts and local Decisions are written only to the owning subflow control by the CLI.

A confirmed Gate does not move the checkpoint. `advance` separately checks the project profile,
direct child controls, required Gates, Decisions, and handoff roles before recording a transition.

Pipeline parents derive child status by scanning controls whose parent reference points to that
parent. Each dynamic revision round receives its own confirmation and control.

Old or unknown workspaces are reported as unsupported and are left unchanged.
