---
title: Workflow
description: Understand current ResearchSpec graph runs, handoffs, Gates, and Decisions
---

# Workflow

ResearchSpec uses one file-based protocol:

```text
status → instructions <selector> → start / decide / advance → status
```

`init` prepares the workspace but starts no academic work. Before a root run, the Agent presents the
profile entry, prerequisites, boundary outputs, formal Gates, Decisions, and cost. One confirmation
authorizes that root run and the nodes and bound child runs declared by its frozen graph.

ARSU producers write semantic deliverables outside `researchspec/` and record their roles and safe
project-relative paths in the owning handoff. ResearchSpec does not ingest those files. Formal Gate
verdicts and graph Decisions are written only to the owning node instance by the CLI.

A confirmed Gate does not complete an execution node. `advance node:<run>/<node>` separately checks
the frozen graph, required Gates, Decisions, handoff roles, outputs and validators.

Child-profile nodes create typed, uniquely bound child runs without a second run-level confirmation.
Every Gate and Decision in each child or dynamic round still requires separate confirmation.

Old or unknown workspaces are reported as unsupported and are left unchanged.
