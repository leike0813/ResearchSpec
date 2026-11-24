---
title: Selector Protocol
description: Address procedures, profiles, runs, nodes, and changes with stable selectors
---

# Selector Protocol

Use `researchspec status --json` to discover exact machine IDs, then request
`researchspec instructions <selector> --json` for the action contract of that item.

## show selectors

`researchspec show <selector>` inspects one exact item:

| Selector | Inspects |
| --- | --- |
| `procedure:<procedure-id>` | One Procedure card |
| `profile:<profile-id>` | One graph profile |
| `run:<run-id>` | One frozen graph run |
| `node:<run-id>/<node-id>[@round]` | One node instance |
| `change:<change-id>` | One project change |

`show` does not accept stable spec, tool, Gate, or Decision selectors.

## instructions selectors

`researchspec instructions <selector>` returns the contract of the selected item:
`procedure:<procedure-id>`, `profile:<profile-id>`, `run:<run-id>`,
`node:<run-id>/<node-id>[@round]`, `gate:<run-id>/<gate-id>[@round]`,
`decision:<run-id>/<decision-id>[@round]`, and `change:<change-id>`.

## Inspection selectors

Stable specs and tools use their own inspection selectors, for example
`spec:project`, `spec:sources`, `spec:claims`, `spec:manuscript`, and
`tool:<tool-id>`. They belong to the inspection commands such as `list` and `check`,
not to `show`.

`handoff` accepts `run:<run-id>`. Never infer a selector from a directory name, a
similar file name, or the newest timestamp when more than one item exists.

Read commands do not modify project files. Mutation commands validate their semantic
input against the selected current owner.
