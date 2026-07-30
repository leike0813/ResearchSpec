---
sidebar_position: 99
title: FAQ
description: Frequently asked questions about ResearchSpec
---

# Frequently Asked Questions

## General

### What does ResearchSpec actually do?

ResearchSpec is a file-based framework that orchestrates academic paper writing
workflows. It initializes a workspace, installs Skills (instructions for AI
agents), manages workflow state, and enforces gates and human decisions through
a typed contract system.

### Do I need to know how to code?

No. ResearchSpec is used through a command-line interface, but the research
work itself happens through natural language interaction with an AI agent. You
confirm decisions and review outputs; the agent handles the mechanics.

### Which AI agents does it work with?

ResearchSpec is **agent-neutral**. It works with any AI agent that can:
- Run CLI commands
- Read and write files
- Follow structured instructions

It does not depend on Claude Code, Codex, or any other platform-specific
runtime.

## Setup

### I ran `researchspec init` twice. Did I break anything?

No. `init` is idempotent — it safely extends an existing workspace without
overwriting your work. It updates managed files and installs any missing
Skills.

### What's the difference between adaptive and strict runtime?

| | Adaptive | Strict |
|---|---|---|
| **Hash binding** | Auto-recorded | Required before every write |
| **Flexibility** | Agents can submit freely | Every write must match a previewed plan |
| **Use case** | Most research work | High-reproducibility requirements |

Switch during `init` with `--profile` or migrate later with `update
--migrate-runtime`.

## Skills

### Can I add my own Skills?

ResearchSpec supports domain plugins from 218 ANZSRC research fields. You
can install pre-vetted plugins via `researchspec plugin install`. Creating
new Skills requires authoring them to the Skill standard and (for
distribution) going through the vendor converter pipeline.

### What if a Skill does something I don't agree with?

Skills are **instructions**, not autonomous agents. Your AI agent reads the
instructions and follows them under your supervision. You always have the
final say through the decision system.

## Workflow

### How do I know what to do next?

Run `researchspec status --json`. It returns available selectors. For each
selector, run `researchspec instructions <selector> --json` to get the exact
action descriptor.

### Can I skip a gate?

Gates can be overridden, but every override requires an explicit human
decision recorded in the decision ledger with a rationale. This ensures
traceability.

### What happens if I close my terminal mid-workflow?

ResearchSpec state is **file-based**. All workflow state lives in
`.researchspec/` within your workspace. No server, no database, no runtime
processes. When you return, `researchspec status` picks up exactly where you
left off.

## Troubleshooting

### The CLI says "Unknown command"

Run `researchspec --help` to see all available commands. Make sure you're in
a directory containing `.researchspec/` (or use `--cwd` to point to one).

### A command failed with a hash mismatch

Under strict runtime, the expected plan SHA-256 didn't match the actual
execution. Re-run `researchspec instructions` to get the current action basis,
then execute with the updated hash.

### `researchspec doctor` found issues

`doctor` is a diagnostic tool. It reports findings but does not auto-repair
unless you explicitly pass `--repair <finding-id>`. Review findings before
applying repairs.
