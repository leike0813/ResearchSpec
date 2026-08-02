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
- **Keeps humans in control** of high-impact decisions through explicit gates
  and explicit per-subflow Decisions
- **Works with any AI agent** — no platform-specific runtime assumptions
- **Maintains a reproducible paper trail** — every artifact, decision, and gate
  verdict is tracked by hash

## Core Concepts

| Concept | Description |
|---------|-------------|
| **Contract** | A typed file (YAML/JSON/JSONL) that holds structured research intent, claims, sources, and state |
| **Artifact** | A draft, report, review, or generated file registered by hash and type |
| **Gate** | A deterministic check that blocks progress until conditions are met (e.g., all required artifacts present) |
| **Decision** | An explicit human choice recorded in the ledger (e.g., "accept this claim wording") |
| **Selector** | A runtime action token returned by `researchspec instructions` that tells agents what to do next |

## Four ARSU Skills

ResearchSpec integrates four core ARSU skills:

- **deep-research** — systematic literature discovery, acquisition, and synthesis
- **academic-paper** — progressive paper drafting from research questions to chapters
- **academic-paper-reviewer** — structured manuscript review with traceable comments
- **academic-pipeline** — workflow orchestration across stages (not yet implemented)

## Where to Start

- [Quick Start](/quick-start) — install and run your first workspace
- [CLI Reference](/cli) — complete command reference (auto-generated from source)
- [Workflow Guide](/guides/workflow) — understand the research workflow model
