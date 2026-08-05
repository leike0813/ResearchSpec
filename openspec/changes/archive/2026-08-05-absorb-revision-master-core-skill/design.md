# Design

`review-response` is the ResearchSpec-facing name for the absorbed `revision-master` workflow. The upstream release package is the capability source; ResearchSpec owns only installation, route/profile projection, and workflow authority.

The package keeps the upstream semantic model: raw review threads, canonical atomic comments, mapping and coverage, workboard, strategy cards, evidence supplements, manuscript execution items, semantic revision logs, thread-level response rows, localization, and deterministic views/export.

Runtime paths are resolved through one `artifact_paths()` function. The database and local working material are below `work/review-response/`; all rendered views are below `views/`. `gate-and-render` reads the current `control.yaml` and `handoff.md`, compares their hashes with `researchspec_control_projection`, and maps ResearchSpec checkpoints to SQLite stages. It stops before rendering when the projection or checkpoint is stale.

The control projection is diagnostic synchronization state only. It cannot authorize a Gate, Decision, transition, or output path. Those actions remain in ResearchSpec CLI control mutations.
