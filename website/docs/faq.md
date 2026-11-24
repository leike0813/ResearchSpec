---
title: FAQ
---

# Frequently Asked Questions

### What does ResearchSpec do?

It gives an Agent a way to carry out academic research tasks through reusable
capabilities and ordinary project files. You describe the goal; the Agent selects a
capability, delivers the work, and records what is needed to continue it.

### Do I have to know the CLI first?

No. The fixed user-visible Skill is `researchspec-navigate`, and the Agent discovers
the matching Procedure from your own request. The CLI matters when you want to inspect
state, confirm a Gate, or resume a run yourself.

### Is the npm package published?

Not yet. Version 0.1.0 is a release candidate, and publication is blocked until the
release checklist is signed. Use the source installation on the
[Installation](/installation) page.

### Does `researchspec init` start my research?

No. It creates the workspace, the stable specs, the profiles, and the Agent
projection. Academic work starts after the Agent matches a capability and, for graph
work, after you confirm a profile entry.

### Can ordinary research run without a graph?

Yes. Ordinary work stays in standalone mode: the Agent writes project files outside
`researchspec/` and creates no run, node, handoff, Gate, or Decision. A graph is only
needed for formal Gates or Decisions, parallel and join steps, revision rounds, or
auditable workflow state.

### Where are papers and reports stored?

At explicit ordinary project paths outside `researchspec/`. The producing run records
their roles and paths in its handoff. ResearchSpec does not copy, hash-bind, or manage
those files.

### Can I edit ResearchSpec files directly?

You may directly edit stable specs, project changes, and run handoffs. Use the CLI for
run and node mutations such as Gate verdicts, Decisions, and node completion.

### Does confirming a Gate advance the workflow?

No. Confirmation records a Gate attempt. A separate `advance node:<run>/<node>`
validates the current requirements and completes the node.

### How do I resume?

Run `researchspec status --json`, select the exact instance ID, then request its
instructions. If several instances could match, choose explicitly. Sustained ordinary
work resumes from its task note instead.

### What happens to an old workspace?

ResearchSpec reports it as unsupported and leaves it unchanged. Preserve useful files
externally and introduce them explicitly into a fresh current workspace.

### Does Doctor repair my project?

No. Doctor is read-only and reports current owner damage, unsafe paths, and generated
drift.
