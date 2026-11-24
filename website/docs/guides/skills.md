---
sidebar_position: 2
title: Skills and Procedures
description: The single Navigate entry and the on-demand Procedure catalog
---

# Skills and Procedures

ResearchSpec keeps one Skill in the host catalog and loads everything else on demand.

## The only entry: researchspec-navigate

`researchspec-navigate` is the fixed user-visible Agent surface. It routes vague,
cross-capability, resume, explanation, and export requests, and it reads the CLI
handbook and the ARSU route reference only when they are needed.

```bash
researchspec list procedures --query "systematic review screening"
researchspec show procedure:<procedure-id>
researchspec instructions procedure:<procedure-id>
```

Discovery starts from the original natural-language request and keeps Chinese,
English, or mixed wording. `list` returns compact cards with the match reason, `show`
returns one card, and `instructions` loads the full procedure with its resource
references and activation packet. The catalog is derived from the existing
registries at runtime; it is not a second persisted registry.

## Five ARSU workflows

| Workflow | Purpose |
| --- | --- |
| `deep-research` | Systematic literature discovery, acquisition, and synthesis |
| `academic-paper` | Progressive paper drafting from research questions to chapters |
| `academic-paper-reviewer` | Structured manuscript review with traceable comments |
| `academic-pipeline` | Cross-stage orchestration over research, writing, review, and revision |
| `sr-screener` | Screening, exclusion review, and PRISMA reporting for a systematic review |

## The hidden inventory

The five ARSU workflows, the other three Companion workflows, the registered core
capabilities, and plugin extensions are Procedures. They are not projected into the
host Skill catalog. A plugin Procedure is activated only after a domain selection, an
availability check, and a manifest-hash check, and the activated package is reviewed
static content that ResearchSpec never executes.

## The optional Zotero Adapter

Selecting `zotero-library` adds seven explicit Skills for library work. The Adapter
requires Zotero with the [Zotero-Agents plugin](https://github.com/leike0813/zotero-agents):

| Adapter Skill | Purpose |
| --- | --- |
| `zotero-library-agent` | Route and coordinate library research tasks |
| `zotero-library-query` | Retrieve current library content for source-grounded answers |
| `zotero-literature-acquisition` | Discover, evaluate, and import literature |
| `zotero-literature-analysis` | Analyze literature with traceable source evidence |
| `zotero-research-synthesis` | Synthesize literature into research context |
| `zotero-library-curation` | Plan and apply approved library maintenance |
| `zotero-bridge-cli` | Low-level Zotero operations and command discovery |

## Managed worker profiles

Hosts with project-local custom agent support also receive two non-entry profiles,
`researchspec-executor` and `researchspec-reviewer`. They add no Skill, Command, or
Procedure, and they never accept work on their own. Navigate uses one only when the
current activation packet recommends it, and the worker returns a brief that Navigate
validates before any CLI mutation happens.
