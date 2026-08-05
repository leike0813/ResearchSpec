## Design

`review-response` is a standalone route and profile. Its six checkpoints are `intake`, `manuscript-analysis`, `comment-atomization`, `workboard`, `strategy-execution`, and `final-assembly`. It is never a child of `academic-pipeline` and is resolved through the same ResearchSpec `start`, `instructions`, `decide`, and `advance` commands.

`control.yaml` and `handoff.md` remain the only ResearchSpec-owned files. The Skill-local SQLite database stores semantic review data and local state, but its workflow fields cannot authorize a transition. A control projection table records instance ID, checkpoint, status, control hash, and synchronization time. `gate-and-render` compares that projection with current control/handoff bytes before reading or rendering; mismatch fails closed. Rendering writes only `subflows/<instance>/views/`.

The runtime scripts use Python's standard-library `sqlite3`, `json`, `hashlib`, and `pathlib`. They initialize schema with foreign keys enabled, expose small CRUD helpers, render deterministic Markdown views, and never edit ResearchSpec control files. The scripts are shipped as Skill content and are not imported or executed by ResearchSpec conversion, installation, checking, or packaging.

The existing profile schema is generalized from a single literal profile ID to the two current built-in IDs. Existing `academic-pipeline` behavior remains the default; the index loads both generated profiles and selects the profile by route. Pack selection continues to include only control-plane files.
