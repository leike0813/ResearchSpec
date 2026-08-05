## Why

Review-response work needs durable semantic CRUD and resumable local rendering, while ResearchSpec must remain the sole workflow authority. The current repository has no independent route or profile for this post-submission workflow and no contract for separating private runtime state from user-readable instance views.

## What Changes

- Add the standalone `review-response:full` route and `review-response` workflow profile with six checkpoints and required review-response Gates.
- Add the fixed `review-response` core Skill and install it alongside the existing fifteen fixed Skills without adding a CLI command or pipeline node.
- Add a standard-library SQLite workspace initializer and deterministic gate/render helper with a read-only ResearchSpec control projection and fail-closed checkpoint synchronization.
- Place derived views under `subflows/<instance>/views/` and keep the SQLite database and local working materials under `work/review-response/`; exclude both from `pack`.
- Extend manuscript and handoff contracts for Markdown, QMD, single-file LaTeX, and LaTeX project delivery without changing existing ARSU route responsibilities.
- Add route near-miss guidance for real post-submission revision requests and regression coverage for the fixed sixteen-Skill surface.

## Capabilities

### New Capabilities

- `review-response`: standalone review-response route, profile, SQLite runtime, control projection, and instance view rendering.

### Modified Capabilities

- `agent-surface-model`: the fixed base Skill surface grows by one core Skill.
- `agent-tool-delivery`: every tool receives the core Skill while command wrappers remain unchanged.
- `arsu-routing-catalog`: Navigate exposes the review-response route and post-submission near-miss guidance.
- `subflow-instance-control-plane`: standalone profiles and instance-root views are recognized while authority stays in control/handoff.
- `quarto-manuscript-delivery`: manuscript delivery accepts LaTeX forms.
- `cli-interface`: pack scope remains bounded to control-plane files and excludes runtime work/views.

## Impact

Affected areas include `src/arsu-converter/routing`, workflow profile loading and control runtime, installation/delivery projections, manuscript contracts, pack selection, the fixed Skill tree, and focused CLI/contract tests. No runtime dependency or CLI top-level command is added.
