---
sidebar_position: 2
title: User Model
description: How users interact with ResearchSpec — the canonical usage model
---

# User Usage Model

The canonical user model defines how users enter, run, and complete research
work through ResearchSpec. This page summarizes the model; the full canonical
source is in the repository's `docs/arsu_user_usage_model.md`.

## Entry Points

1. **`researchspec init`** prepares the workspace and installs selected Skills.
   Agent tools are selected first; optional literature Adapters are selected
   separately and default to none. Init does not start academic work.
2. **User-Agent dialogue** starts the actual research. Vague or cross-Skill
   requests route through `researchspec-navigate`.
3. **Explicit ARSU Skill or mode** requests may route directly after
   prerequisite and route-summary checks.

## Starting Work

Before starting a subflow, the agent must present a **confirmed summary**:

- Skill and mode selection
- Prerequisites
- Expected artifacts
- Formal gates
- Estimated cost

The user confirms this summary before execution begins.

## Producing Work

- ARSU Skills produce **semantic artifacts** (drafts, reports, reviews)
- `academic-pipeline` dispatches only from the CLI frontier
- Candidate artifacts may be submitted automatically with hash binding
- Every formal gate requires **human confirmation**

## Human Decisions

Only these choices belong in the owning subflow control:

- Scope changes
- Claim changes
- Structure changes
- Branch choices
- Override choices

Ordinary exploration belongs in working material, not formal Decisions.

## Verifying and Finishing

- `researchspec verify` checks implementation against contracts
- `researchspec pack` creates a deterministic context bundle
- `researchspec archive` finalizes completed changes

## Agent Surface

The user-visible agent surface consists of:

- **4 ARSU Skills**: deep-research, academic-paper, academic-paper-reviewer, academic-pipeline
- **2 Core Skills**: review-response, paper-humanizer
- **4 Companion Skills**: researchspec-navigate, researchspec-propose, researchspec-decide, researchspec-verify
- **Optional 7-Skill Zotero Adapter**: selected for literature query, acquisition, analysis, synthesis, and curation; requires the [Zotero-Agents plugin](https://github.com/leike0813/zotero-agents)
- **Optional domain plugins**: from 218 ANZSRC research fields
