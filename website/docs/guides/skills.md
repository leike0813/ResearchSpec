---
sidebar_position: 2
title: Skills Guide
description: How ARSU Skills work in ResearchSpec — deep-research, academic-paper, academic-paper-reviewer, academic-pipeline
---

# Skills Guide

ARSU (Academic Research Skills Universal) provides the core research
capabilities that ResearchSpec orchestrates. Each Skill is a bundle of
instructions the agent follows during a workflow.

## The Four ARSU Skills

### deep-research

Systematic literature discovery, acquisition, and synthesis.

- Searches and retrieves literature from configured sources
- Builds a structured bibliography corpus
- Produces synthesis reports with traceable source evidence

### academic-paper

Progressive paper drafting from research questions to chapter-level sections.

- Designs research questions and paper structure
- Drafts sections with evidence checks and style profiling
- Maintains claim traceability throughout the manuscript

### academic-paper-reviewer

Structured manuscript review with traceable comments.

- Reviews papers in stages (structure, argumentation, evidence, style)
- Generates structured review reports
- Links comments to specific claims and sections

### academic-pipeline

Coordinates research, writing, review and revision through a frozen capability graph.

- Dispatches between deep-research, academic-paper, and reviewer stages
- Reads the current frontier and produces semantic work; the CLI records graph state
- Presents each formal Gate and Decision for human confirmation

## Companion Skills

ResearchSpec also includes five companion Skills that assist with
framework-level operations:

| Companion | Purpose |
|-----------|---------|
| `researchspec-navigate` | Route vague or cross-Skill requests to the right Skill |
| `researchspec-propose` | Create structured contract change proposals |
| `researchspec-decide` | Guide human decision-making on proposals |
| `researchspec-verify` | Verify implementation against contracts |
| `researchspec-cli-handbook` | Read the current CLI commands and input contracts |

The installed base surface also includes every capability package in the bundled
capability registry. A package marked `operational` has a curated execution
procedure; this label does not certify the academic quality of a real Agent run.

## Optional Literature Adapter Skills

Selecting `zotero-library` adds seven Skills for library management and analysis.
The Adapter requires Zotero with the
[Zotero-Agents plugin](https://github.com/leike0813/zotero-agents):

| Adapter | Purpose |
|---------|---------|
| `zotero-library-agent` | Route and coordinate library research tasks |
| `zotero-library-query` | Retrieve and answer questions from library content |
| `zotero-literature-acquisition` | Discover, evaluate, and import literature |
| `zotero-literature-analysis` | Analyze literature with traceable evidence |
| `zotero-research-synthesis` | Synthesize literature into research context |
| `zotero-library-curation` | Apply approved library maintenance |
| `zotero-bridge-cli` | Low-level Zotero operations |

## Skill Discovery

Use `researchspec status --json` to discover which Skills are available in
your workspace. The `instructions` command tells the agent exactly how to use
each Skill.

Skills are **agent-neutral** — they work with any AI agent that can follow
structured instructions and operate through the CLI protocol.
