---
sidebar_position: 2
title: User Model
description: How users interact with ResearchSpec — the canonical usage model
---

# User Usage Model

This page summarizes the canonical source in `docs/user/usage-model.md`.

## Entry

1. `researchspec init` prepares a schema 2 workspace and projects Navigate and selected profiles. It
   starts no academic work.
2. User-Agent dialogue selects the academic capability. Vague, cross-capability, resume,
   explanation and export requests use `researchspec-navigate`.
3. Navigate searches compact Procedure cards and loads one activation packet. One-off work uses
   standalone mode; resumable or governed work selects a profile and graph mode.

## Authorization

The user confirms one root profile entry. That confirmation authorizes only the frozen graph in the
new root run. Eligible execution nodes need no separate start confirmation; bound child runs inherit
the parent graph authorization. Every declared Gate and Decision still requires human confirmation.

## Work and state

Procedures write drafts, reports and reviews at ordinary project paths outside `researchspec/`.
Run handoffs record their semantic roles and safe paths. ResearchSpec does not register or hash-bind
those boundary files.

The CLI alone mutates run lifecycle and node records. Gate and Decision records satisfy frontier
conditions but never complete execution nodes; successful `advance node:<run>/<node>` does that.

## Agent surface

The fixed base surface contains only `researchspec-navigate`. Four ARSU workflows, four other
Companions, core capabilities and plugin extensions stay in a hidden runtime-derived Procedure
inventory. Selecting `zotero-library` still adds seven Adapter Skills.
