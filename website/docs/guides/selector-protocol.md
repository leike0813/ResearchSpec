---
sidebar_position: 5
title: Selector Protocol
description: Understanding the action selector system that drives ResearchSpec workflows
---

# Selector Protocol

The selector protocol is ResearchSpec's mechanism for dynamically communicating
available actions to agents. Instead of a fixed pipeline graph, the system
returns **action selectors** that describe what can be done next.

## Anatomy of a Selector

A selector has the form `family:identifier`. Examples:

- `subflow:deep-research`
- `gate:literature-acquired`
- `transition:to-drafting`
- `work:draft-introduction`
- `patch:revision-round-1`
- `change:scope-broaden`

## Selector Families

| Family | Purpose | Parameters |
|--------|---------|------------|
| `subflow:` | Start a named ARSU subflow or delegated child | Subflow name |
| `obligation:` | Complete a required runtime task | Obligation ID |
| `gate:` | Confirm or override a gate verdict | Gate ID |
| `completion:` | Mark a subflow or phase as complete | Completion target |
| `case-action:` | Handle a runtime case | Case reference |
| `work:` | Perform open-ended semantic work | Work item ID |
| `transition:` | Move to the next workflow stage | Transition ID |
| `patch:` | Apply a revision patch | Patch ID |
| `change:` | Propose a contract change | Change ID |

## How Agents Use Selectors

1. **Discover available selectors** via `researchspec status --json`
2. **Read action descriptor** via `researchspec instructions <selector> --json`
3. **Execute the action** via `start`, `submit`, or `advance`
4. **Discover new selectors** from the returned `next_selectors`

## Selector Validity

A selector string that matches a valid family pattern does not guarantee the
action is available in the current workspace. Always check `status` and read
`instructions` before executing.

## Plan-Bound vs. Adaptive

Under **strict** runtime, selectors include an action basis SHA-256. The agent
must pass this hash as `--expected-action-basis-sha256` when executing. Under
**adaptive** runtime, hash binding is optional and the system auto-records
hashes for reproducibility.
