## Why

`docs/` currently contains converter inputs, copied scripts, templates, review notes, generated HTML, and a parity report. These files are executable maintenance material or temporary output, so their current location obscures the boundary between durable documentation and authoring authority.

## What Changes

- Move ARS, paper-humanizer, and revision-master extraction trees to `authoring/` as the canonical converter-input roots.
- Move generated parity and review reports to `artifacts/generated/`.
- Update converters, maintenance catalogs, tests, package scripts, and maintainer guidance to use the new roots.
- Refresh current maintenance anchors after the pure path relocation; preserve immutable historical audit snapshots.

## Capabilities

### Modified Capabilities

- `arsu-converter`: Authoring inputs live under `authoring/`, not `docs/`.
- `arsu-maintenance`: Current anchors record the relocated source paths.
- `own-vendor-maintenance`: Owned-vendor catalogs and anchors resolve relocated extraction indexes.
- `revision-master-domain-skill-audit`: Revision-master authoring sources resolve from the authoring root.
