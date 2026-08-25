---
sidebar_position: 1
title: Introduction
description: ResearchSpec — agent-neutral, spec-driven framework for academic research writing
---

# ResearchSpec

ResearchSpec is an **agent-neutral, file-based research contract framework** for
academic paper writing workflows. It orchestrates the Academic Research Skills
Universal (ARSU) skill package through structured contracts, explicit human
decisions, and reproducible workflow state.

## What It Does

- **Initiates research workspaces** with a single `researchspec init` command
- **Guides agents through structured workflows** — literature acquisition,
  synthesis, drafting, review, and revision
- **Keeps humans in control** of high-impact decisions through explicit Gates
  and graph Decisions
- **Works with any AI agent** — no platform-specific runtime assumptions
- **Maintains reproducible runtime state** — frozen graphs, node outputs and human decisions remain inspectable

## Core Concepts

| Concept | Description |
|---------|-------------|
| **Contract** | A typed file (YAML/JSON/JSONL) that holds structured research intent, claims, sources, and state |
| **Boundary deliverable** | An ordinary project file outside `researchspec/`, referenced by role and safe path |
| **Gate** | A graph-declared checkpoint whose verdict requires human confirmation |
| **Decision** | A graph-declared human choice stored in its owning node instance |
| **Selector** | A runtime action token returned by `researchspec instructions` that tells agents what to do next |

## Four ARSU Skills

ResearchSpec integrates four core ARSU skills:

- **deep-research** — systematic literature discovery, acquisition, and synthesis
- **academic-paper** — progressive paper drafting from research questions to chapters
- **academic-paper-reviewer** — structured manuscript review with traceable comments
- **academic-pipeline** — graph-profile orchestration across research stages

## Where to Start

- [Quick Start](/quick-start) — install and run your first workspace
- [CLI Reference](/cli) — complete command reference (auto-generated from source)
- [Workflow Guide](/guides/workflow) — understand the research workflow model
