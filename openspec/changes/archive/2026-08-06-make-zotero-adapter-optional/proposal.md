## Why

ResearchSpec currently installs the Zotero literature Adapter for every workspace even when the user has no compatible Zotero setup. The Adapter should be an explicit opt-in selected during initialization, with enough guidance for users to understand that it requires Zotero with the `zotero-agents` plugin.

## What Changes

- **BREAKING**: add `literature_adapters.selected` to the strict current workspace config and stop installing `zotero-library` by default.
- Mark `zotero-library` as an optional catalog entry while continuing to reserve its seven Skill IDs and package its reviewed assets.
- Add an interactive Adapter selector after Agent-tool selection and document the Zotero plus `zotero-agents` prerequisite with a direct project link.
- Add `--literature-adapters <none|all|ids>` to `init` and `update`; non-interactive init without the option selects no Adapter.
- Reconcile only selected Adapters, safely retire deselected managed files, and preserve drifted files with diagnostics.
- Report an unselected Adapter as `not-selected` without treating its absent runtime, profile, resolution, or Skill projections as an error.
- Update the canonical user model, installation guidance, generated CLI documentation, and packaged-surface acceptance journeys.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `literature-system-adapters`: replace fixed installation with config-backed opt-in selection, deselection reconciliation, and non-blocking unselected inspection.
- `agent-surface-model`: distinguish the ten-Skill default surface from the optional seven-Skill Zotero surface.
- `agent-tool-delivery`: project and retire Adapter Skills according to the workspace selection while retaining managed ownership and reserved IDs.
- `cli-interface`: add interactive and non-interactive Adapter selection to `init` and `update`.
- `arsu-user-model-acceptance`: make Zotero Adapter setup an explicit initialization choice while preserving workflow and authorization boundaries.
- `mvp-release-readiness`: verify default and opted-in packaged CLI journeys without changing the packaged Adapter release set.

## Impact

The change affects the strict workspace config schema and template, CLI option catalog and bootstrap handlers, workspace and Adapter delivery planning, static inspection, plugin reconciliation, tests, generated CLI references, the canonical user model, and Zotero installation documentation. It adds no dependency, top-level command, live Zotero probe, external write, credential handling, or migration path for prior workspace shapes.
