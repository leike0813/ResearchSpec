---
title: Selector Protocol
description: Address current ResearchSpec routes and owning files with stable selectors
---

# Selector Protocol

Use `status --json` to discover exact machine IDs, then request `instructions <selector> --json`.

| Selector | Purpose |
| --- | --- |
| `route:<skill-id>:<mode>` | Preview a route before confirmation |
| `subflow:<instance-id>` | Inspect or advance one subflow |
| `gate:<instance-id>/<gate-id>` | Inspect or decide one formal Gate |
| `decision:<instance-id>/<decision-id>` | Inspect or record one local Decision |
| `change:<change-id>` | Inspect or decide a project change |
| `handoff:<instance-id>` | Inspect one subflow handoff |

`show` additionally accepts stable-spec, project-profile, and tool selectors. Never infer a selector
from a directory name, similar filename, or “latest” timestamp when more than one item exists.

Read commands do not modify project files. Mutation commands validate their semantic input against
the selected current owner.
