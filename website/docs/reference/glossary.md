---
sidebar_position: 1
title: Glossary
description: Key terms and concepts in the ResearchSpec framework
---

# Glossary

## A

**Action Descriptor** — The structured JSON returned by `researchspec instructions <selector> --json`. Describes the exact semantic input schema, execution policy, and action basis for a selector.

**Adaptive Runtime** — The default runtime profile. Artifacts can be submitted freely without pre-bound SHA-256 plans. Hashes are auto-recorded for reproducibility.

**ARSU** — Academic Research Skills Universal. The upstream skill package that provides `deep-research`, `academic-paper`, `academic-paper-reviewer`, and `academic-pipeline`.

## C

**Candidate** — A proposed artifact submitted via `researchspec submit`. May be accepted, rejected, or revised.

**Claim** — A structured statement with an ID, support level, strength, and wording constraints. Claims are first-class research objects, not prose fragments.

**Companion Skill** — A ResearchSpec framework-level Skill (`researchspec-navigate`, `researchspec-propose`, `researchspec-decide`, `researchspec-verify`) that assists with framework operations rather than academic work.

**Contract** — A typed file (YAML/JSON/JSONL) that holds structured research intent, claims, sources, manuscript structure, and workflow state. The SSOT for machine-checkable research facts.

## D

**Decision** — An explicit human choice recorded in the decision ledger (e.g., accepting a proposal, resolving a gate override, changing scope). Decisions are first-class runtime records.

**Decision Ledger** — A JSONL file recording all human decisions with timestamps, actors, and rationales.

**Domain Plugin** — An optional, project-maintained vendor Skill bundle organized by ANZSRC 2020 Field of Research. Provides domain-specific research assistance.

## G

**Gate** — A deterministic check that blocks workflow progress until its conditions are met. Gates verify state, blockers, required artifacts, schema validity, hashes, and pending decisions. Gates do not replace academic judgment.

**Gate Ledger** — A JSONL file recording all gate verdicts with confirmation metadata.

## H

**Handoff** — A rendered view of the current workspace state, designed for sharing context between agents or sessions.

**Hash Binding** — Under strict runtime, every write action requires a SHA-256 hash binding (`--expected-plan-sha256` or `--expected-action-basis-sha256`) to ensure deterministic execution.

## P

**Plan-Bound Execution** — A strict execution mode where every write must be previewed, its plan SHA-256 computed, and that hash passed at execution time. Prevents drift between preview and execution.

## R

**Runtime Profile** — Either `adaptive` (default, flexible) or `strict` (plan-bound, hash-verified). Set during `researchspec init --profile`.

## S

**Selector** — A runtime action token in the form `family:identifier` returned by `researchspec status`. Selectors tell agents what actions are available. See [Selector Protocol](/guides/selector-protocol).

**Subflow** — A named workflow sub-process started via `researchspec start`. Can be an ARSU Skill flow or a delegated child subflow.

## W

**Workflow Frontier** — The set of currently available actions (selectors) at the current stage of the research workflow.

**Workspace** — A directory containing a `.researchspec/` subdirectory. The unit of research work managed by ResearchSpec.
