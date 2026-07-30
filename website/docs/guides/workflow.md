---
sidebar_position: 1
title: Workflow Guide
description: Understand the ResearchSpec workflow model — status, instructions, start, submit, advance
---

# Workflow Guide

ResearchSpec uses a **selector-based runtime protocol**. Instead of hard-coding
pipeline stages, the CLI returns dynamic action descriptors that tell agents
what they can do next.

## The Runtime Protocol

```
status → instructions <selector> → start / submit / advance → status
```

### 1. Check Status

```bash
researchspec status --json
```

Returns the current run state and pending items. The JSON envelope includes a
list of `next_selectors` — these are your available actions.

### 2. Read Instructions

```bash
researchspec instructions <selector> --json
```

Each selector resolves to an **action descriptor** containing:

- The exact semantic input schema (what JSON to provide)
- Execution policy (plan-bound vs. adaptive)
- Required action basis SHA-256 (for plan-bound execution)
- Returned `next_selectors` after completion

### 3. Start a Subflow

```bash
researchspec start <subflow> \
  --input start.json \
  --actor-kind agent \
  --actor-name "My Agent"
```

`start` atomically begins a confirmed template or delegated child subflow. The
`--input` file must match the semantic schema from `instructions`.

### 4. Submit Artifacts

```bash
researchspec submit <item> \
  --input payload.json \
  --actor-kind agent \
  --actor-name "My Agent"
```

Submits a runtime candidate, attempt, evidence, resolution, patch, or confirmed
gate verdict. Each submission is registered by hash and type.

### 5. Advance Transitions

```bash
researchspec advance <transition> \
  --actor-kind agent \
  --actor-name "My Agent"
```

Completes or advances one currently authorized runtime action. This moves the
workflow frontier forward.

## Selector Families

Selectors identify what kind of action is available:

| Family | Example | Description |
|--------|---------|-------------|
| `subflow:` | `subflow:deep-research` | Start a named ARSU subflow |
| `obligation:` | `obligation:submit-missing` | Complete a required task |
| `gate:` | `gate:literature-complete` | Confirm a gate verdict |
| `completion:` | `completion:subflow` | Mark a subflow as done |
| `work:` | `work:draft-section` | Perform open-ended work |
| `transition:` | `transition:to-review` | Advance to next stage |
| `patch:` | `patch:revision-1` | Apply a revision patch |
| `change:` | `change:scope-update` | Propose a contract change |
| `case-action:` | (internal) | Handle a runtime case |

## Runtime Profiles

### Adaptive (default)

Artifacts can be submitted freely. The system tracks hashes for reproducibility
but does not require pre-binding.

### Strict

Every write action requires a plan SHA-256 binding. The agent must:

1. Call `instructions` to get the action descriptor
2. Compute the plan SHA-256
3. Pass it as `--expected-plan-sha256` when executing

## Human Decisions

Changes to research intent, scope, claims, or structure require an explicit
human decision recorded in the **decision ledger**:

```bash
researchspec decide <item> \
  --decision accept \
  --actor-name "Dr. Researcher" \
  --reason "The broader scope is appropriate for the target journal"
```

Decisions are first-class records, not chat residue.

## Inspection Commands

| Command | Purpose |
|---------|---------|
| `researchspec check` | Validate workspace integrity |
| `researchspec list` | List runtime collections (paginated) |
| `researchspec show <item>` | Show a canonical item |
| `researchspec doctor` | Diagnose and repair runtime issues |

## Context Commands

| Command | Purpose |
|---------|---------|
| `researchspec handoff` | Render the current handoff view (for context sharing) |
| `researchspec pack` | Create a deterministic context ZIP bundle |
