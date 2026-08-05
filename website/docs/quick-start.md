---
title: Quick Start
---

# Quick Start

```bash
mkdir my-research
cd my-research
researchspec init . --tools codex
researchspec check all --strict
```

Initialization creates a schema `"1"` workspace, four stable specs, the project pipeline profile,
and selected Agent projections. It does not start academic work.

To work with an existing Zotero library, install the
[Zotero-Agents plugin](https://github.com/leike0813/zotero-agents) and select the
optional Adapter during interactive init, or pass it explicitly:

```bash
researchspec init . --tools codex --literature-adapters zotero-library
```

Open your Agent in the same project and describe your research goal. Navigate will inspect status,
propose at most the relevant routes, and show each route's prerequisites, outputs, Gates, and cost.
After you confirm one route, the Agent creates a semantic start input and calls:

```bash
researchspec start <route-ref> --input start.yaml --confirmed-by "Your Name"
```

The ARSU producer writes its deliverables at explicit project paths outside `researchspec/` and
updates its handoff. For formal review, the Agent asks Verify for a recommendation, obtains your
verdict, and records it with `decide`. Progress changes only after a separate `advance`.

Resume later with `researchspec status --json`; use returned instance IDs with `instructions` or
`show`. Use `pack --output <file>` to export bounded context without private work or external file
bytes.
