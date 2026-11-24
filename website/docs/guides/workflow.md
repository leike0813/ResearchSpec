---
title: Workflow
description: Understand standalone work, graph runs, handoffs, Gates, and Decisions
---

# Workflow

ResearchSpec uses one file-based protocol:

```text
status -> instructions <selector> -> start / decide / advance -> status
```

`init` prepares the workspace but starts no academic work.

## Standalone work

Ordinary research that needs no formal control runs in standalone mode. A Procedure
writes ordinary files outside `researchspec/` and returns their paths. It creates no
run, node, handoff, Gate, or Decision.

Sustained ordinary work continues from the task note at
`work/researchspec-notes/<task-id>.md`. The note records the goal, the inputs and
outputs, the finished work and its evidence limits, the open questions, and the next
step. It is not a run record: it cannot prove that a run, node, or Gate completed, and
`status` and `check` do not scan it.

## Graph work

A graph run is needed when the task requires a formal Gate or Decision, parallel work
with a join, repeated revision rounds, or auditable workflow state.

Before a root run starts, the Agent presents a profile entry summary with the
prerequisites, the boundary outputs, the formal Gates, the Decisions, and the cost.
Your confirmation authorizes the nodes, repeated rounds, and bound child runs declared
by the frozen graph of that root run.

```text
researchspec/runs/<run-id>/
  run.yaml
  graph.yaml
  handoff.md
  nodes/<node-instance>.yaml
```

`graph.yaml` is the frozen scheduling authority for that run. The CLI derives the
current frontier from it and from the node records.

## Boundary deliverables

Papers, reports, reviews, figures, and data are ordinary project files outside
`researchspec/`. ResearchSpec does not copy, hash-bind, or manage their lifecycle.
Each handoff records the role, type, path, and purpose of every boundary file, plus
the source run of an input and the intended consumer of an output. Paths are safe
project-relative paths outside `researchspec/`.

## Gates and Decisions

A Gate records an academic checkpoint. An agent or validator may prepare findings,
but the verdict comes from a human and is written with `decide gate:<run>/<gate>`.
`pass`, `pass_with_conditions`, and `fail` never complete the owning node.

A failed Gate can be overridden only with a separate confirmation, a reason, and a
Decision identity. Graph Decisions are confirmed one by one, and recording a choice
opens the matching branch and nothing else.

```text
decide gate:<run-id>/<gate-id> --verdict pass --actor-name "Your Name"
advance node:<run-id>/<node-id>
```

Child-profile nodes create one uniquely bound child run without a second run-level
confirmation. The child inherits the graph authorization, keeps its own frozen graph,
node files, and handoff, and still asks for every Gate and Decision inside it.

Old or unknown workspaces are reported as unsupported and are left unchanged.
