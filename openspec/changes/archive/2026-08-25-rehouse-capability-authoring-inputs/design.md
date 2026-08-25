## Context

The three extraction trees are SSOT inputs for deterministic capability authoring. They contain schemas, scripts, templates, copied knowledge, and review records. Treating them as long-lived explanatory documentation makes `docs/` misleading and encourages downstream references to the wrong ownership layer.

## Decisions

### Use one explicit authoring root

The canonical roots are `authoring/ars`, `authoring/paper-humanizer`, and `authoring/revision-master`. Existing relative structure and bytes are preserved so converter behavior changes only through path identity.

### Keep generated reports outside authoring

`artifacts/generated/capability-parity-report.json` and generated ARS review HTML are derived outputs. They may be regenerated or replaced and do not become authoring inputs.

### Refresh only current maintenance anchors

Current ARSU and own-vendor anchors bind source paths and report locations. They are refreshed after the relocation using their maintenance Skills. Older archived OpenSpec changes and immutable historical audit evidence are not globally rewritten.

## Risks

- Missing one live path reference can make authoring or maintenance checks fail.
- Moving a source without updating its path-bearing extraction index can leave hashes valid while provenance paths drift.
- Generated review HTML must not be reclassified as authoring authority.

## Verification

Run extraction, authoring, parity, maintenance, registry, idempotence, package, and strict OpenSpec checks after the move. A repository search must find no live `docs/*_extraction` or `docs/ars_extraction` references outside archived history.
