---
title: Quick Start
---

# Quick Start

Install the release candidate first (see [Installation](/installation)). Then:

```bash
mkdir my-research
cd my-research
researchspec init . --tools codex
researchspec check all --strict
```

`init` creates a schema `"2"` workspace with four stable specs, preset graph profiles,
and the selected Agent projection. It starts no academic work. Run `init` again on the
same project to replace the complete tool and Adapter selection; use `update` to
refresh managed projections after a CLI upgrade.

To work with an existing Zotero library, install the
[Zotero-Agents plugin](https://github.com/leike0813/zotero-agents) and select the
optional Adapter explicitly:

```bash
researchspec init . --tools codex --literature-adapters zotero-library
```

Open your Agent in the same project and describe the research goal in your own words.
Navigate inspects the workspace, matches a capability, and asks for confirmation
before anything with formal authority is written.

## Ordinary work

For a task without formal Gates or Decisions, the Agent stays in standalone mode. It
writes the manuscript, report, or review to an ordinary project path outside
`researchspec/` and reports that path. Sustained ordinary work continues from
`work/researchspec-notes/<task-id>.md`; no graph is needed to resume it.

## Graph work

When the task needs a formal Gate, a Decision, parallel and join steps, revision
rounds, or auditable state, Navigate presents a profile entry summary:

- the selected route, entry, and first node;
- prerequisites and confirmed handoff inputs;
- expected boundary outputs;
- the formal Gates and Decisions in the graph;
- expected cost, external tools, and interaction load.

After you confirm that entry, the Agent starts the run:

```bash
researchspec start profile:<profile-id> --input start.yaml --confirmed-by "Your Name"
```

That confirmation authorizes only the frozen graph of this root run. Every formal
Gate and Decision inside it still needs its own confirmation.

The producer writes semantic deliverables outside `researchspec/` and records their
roles and safe relative paths in the owning handoff. A confirmed Gate does not finish
a node: the Agent submits the declared outputs and completes the node with a separate
`advance`.

## Resume

```bash
researchspec status --json
```

Use the exact returned selectors with `instructions` or `show`, then finish the
current step with `start`, `decide`, or `advance`. `pack --output <file>` exports a
bounded context bundle without copying external deliverable bytes.
