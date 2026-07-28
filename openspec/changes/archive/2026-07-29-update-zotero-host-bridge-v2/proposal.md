## Why

The pinned Zotero adapter still ships Host Bridge v1 and CLI schema v4, while the
upstream v0.8.3 release publishes a reviewed v2 bridge contract. Updating the
immutable release set is required to keep the packaged runtime, command cards,
and project profile aligned with the supported upstream bridge.

## What Changes

- Replace the admitted Zotero bundle with immutable release set
  `hbrs-8c6de08010d459a0e87e74f2`.
- Update the fixed adapter identity to Host Bridge v2, CLI schema v5, CLI 0.5.1,
  and seven Adapter Skills at 0.5.2.
- Regenerate the static adapter tree and its complete offline audit, including
  platform binaries, command references, and `/bridge/v2` profile template.
- Verify that `researchspec update --force` refreshes manifest-owned adapter
  files while unowned paths remain protected.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `zotero-literature-adapter-conversion`: admit and generate the v2 immutable
  bundle instead of the v1 release set.
- `literature-system-adapters`: deliver and reconcile the new v2 adapter
  identity through the fixed catalog.

## Impact

Affected areas are the Zotero vendor submodule and audit, converter-generated
adapter assets, fixed literature-adapter catalog, attribution/documentation,
and release-bound tests. No public command, workflow authority, or live Zotero
operation is added.
