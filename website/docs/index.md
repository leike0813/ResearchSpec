---
sidebar_position: 1
title: Introduction
description: ResearchSpec — agent-neutral, spec-driven framework for academic research writing
---

# ResearchSpec

ResearchSpec helps an Agent carry out academic research work through reusable
capabilities and ordinary project files. You describe the research goal; the Agent
finds a suitable capability, delivers a usable result, and records the progress
needed to continue. Formal graph runs add Gates, Decisions, parallel work, revision
rounds, and auditable state when a task calls for them.

Version 0.1.0 is a release candidate. The npm package is not published yet, so
[Installation](/installation) starts from the source checkout.

## One entry, capabilities on demand

The fixed user-visible Agent surface is exactly one Skill: `researchspec-navigate`.
Everything else is discovered on demand through the Procedure catalog:

```bash
researchspec list procedures --query "screen abstracts against eligibility criteria"
researchspec show procedure:<procedure-id>
researchspec instructions procedure:<procedure-id>
```

`list` returns compact cards, `show` returns one card, and `instructions` loads the
full procedure only after a selection. The five ARSU workflows, the other three
Companion workflows, the registered core capabilities, and plugin extensions stay in
that hidden inventory. They are not projected into the host Skill catalog.

## Five ARSU workflows

| Workflow | Purpose |
| --- | --- |
| `deep-research` | Systematic literature discovery, acquisition, and synthesis |
| `academic-paper` | Progressive paper drafting from research questions to chapters |
| `academic-paper-reviewer` | Structured manuscript review with traceable comments |
| `academic-pipeline` | Cross-stage orchestration over research, writing, review, and revision |
| `sr-screener` | Screening, exclusion review, and PRISMA reporting for a systematic review |

## Two ways to work

| Mode | When | What it records |
| --- | --- | --- |
| Standalone | Ordinary research that needs no formal control | Ordinary project files and, for sustained work, a task note |
| Graph | Formal Gates or Decisions, parallel and join steps, revision rounds, or auditable state | A frozen graph, run and node records, Gate verdicts, Decisions, and handoffs |

Standalone work writes only outside `researchspec/`. It never creates or changes a run,
node, handoff, Gate, or Decision.

## Core concepts

| Concept | Description |
| --- | --- |
| **Contract** | A typed file (Markdown, YAML, JSON) that holds research intent, sources, claims, and workflow state |
| **Procedure** | A loadable capability with declared input and output roles |
| **Boundary deliverable** | An ordinary project file outside `researchspec/`, referenced by role and safe path |
| **Gate** | A graph-declared academic checkpoint whose verdict requires human confirmation |
| **Decision** | A graph-declared human choice stored in its owning node instance |
| **Selector** | A runtime action token returned by `researchspec instructions` |

## Where to start

- [Installation](/installation) — install the release candidate
- [Quick Start](/quick-start) — create a workspace and run your first task
- [CLI Reference](/cli) — the full command surface, generated from the source catalog
- [Workflow Guide](/guides/workflow) — standalone work, graph runs, Gates, and Decisions
- [Skills and Procedures](/guides/skills) — the single entry and the on-demand catalog
