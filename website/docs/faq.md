---
title: FAQ
---

# Frequently Asked Questions

### Does `researchspec init` start my research?

No. It creates the workspace and static Agent projections. Academic work starts only after a profile
entry summary and root-run confirmation.

### Where are papers and reports stored?

At explicit ordinary project paths outside `researchspec/`. The producing run records their
roles and paths in its handoff.

### Can I edit ResearchSpec files directly?

You may directly edit stable specs, project changes, and run handoffs. Use the CLI for run/node
mutations such as Gate verdicts, Decisions, and node completion.

### Does confirming a Gate advance the workflow?

No. Confirmation records a Gate attempt. A separate `advance` validates all current requirements.

### How do I resume?

Run `researchspec status --json`, select the exact instance ID, then request its instructions. If
multiple instances could match, choose explicitly.

### What happens to an old workspace?

ResearchSpec reports it as unsupported and leaves it unchanged. Preserve useful files externally and
introduce them explicitly into a fresh current workspace.

### Does Doctor repair my project?

No. Doctor is read-only and reports current owner damage, unsafe paths, and generated drift.
