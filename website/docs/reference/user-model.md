---
sidebar_position: 2
title: User Model
description: How users enter, confirm, run, resume, and finish ResearchSpec work
---

# User Usage Model

This page summarizes the canonical source in `docs/user/usage-model.md`.

## Entry

`researchspec init` prepares a schema `"2" workspace and projects Navigate and the
selected profiles. It starts no academic work. User-Agent dialogue then starts from a
natural research task; vague, cross-capability, resume, explanation, and export
requests go to `researchspec-navigate`.

Navigate searches compact Procedure cards, shows the matching candidate, and loads one
activation packet. Ordinary work stays in standalone mode. Work that needs formal
Gates or Decisions, parallel and join steps, revision rounds, or auditable state
selects a profile and graph mode.

## Authorization

The user confirms one root profile entry. That confirmation authorizes only the frozen
graph of the new root run. Eligible execution nodes need no separate start
confirmation, and bound child runs inherit the parent graph authorization. Every
formal Gate, every graph Decision, and every failed-Gate override still requires its
own human confirmation.

## Work and state

Procedures write drafts, reports, and reviews at ordinary project paths outside
`researchspec/`. Run handoffs record their semantic roles and safe paths, and
ResearchSpec neither registers nor hash-binds those boundary files.

The CLI alone mutates run lifecycle and node records. A Gate or Decision record
satisfies a frontier condition but never completes an execution node; only a
successful `advance node:<run>/<node>` completes the node.

Sustained ordinary work continues from `work/researchspec-notes/<task-id>.md`, which
records the goal, the materials, the finished work, the open questions, and the next
step. An unfinished related run takes precedence over standalone continuation.

## Agent surface

The fixed base surface contains only `researchspec-navigate`. The five ARSU workflows,
the other three Companion workflows, the registered core capabilities, and plugin
extensions stay in a hidden, runtime-derived Procedure inventory. Selecting the
optional `zotero-library` Adapter still adds seven explicit Skills.
