---
title: Selector Protocol
description: Address current ResearchSpec graph runs and owning files with stable selectors
---

# Selector Protocol

Use `status --json` to discover exact machine IDs, then request `instructions <selector> --json`.

| Selector | Purpose |
| --- | --- |
| `profile:<profile-id>` | Inspect a graph profile or start a confirmed root run |
| `run:<run-id>` | Inspect one frozen graph run or its handoff |
| `node:<run-id>/<node-id>[@round]` | Inspect, start a bound child, or advance one node |
| `gate:<run-id>/<gate-id>[@round]` | Inspect or decide one formal Gate |
| `decision:<run-id>/<decision-id>[@round]` | Inspect or record one graph Decision |
| `change:<change-id>` | Inspect or decide a project change |

`show` additionally accepts stable-spec and tool selectors. `handoff` accepts `run:<run-id>`. Never infer a selector
from a directory name, similar filename, or “latest” timestamp when more than one item exists.

Read commands do not modify project files. Mutation commands validate their semantic input against
the selected current owner.
