## Context

ARS maintenance is anchored by `scripts/arsu-maintenance.mjs` and `audits/arsu/`. Paper Humanizer
and Revision Master were migrated through the same extraction/authoring/graph path, but their
maintenance artifacts were not cataloged or hash-frozen. Future owned vendors should not require a
new maintenance script.

## Decisions

### One catalog owns every vendor

`audits/own-vendors/catalog.json` is the single source of truth for vendor identity, upstream root,
extraction index, authoring script, anchor, and capability IDs. A new project is an additive catalog
entry.

### Anchor scope is vendor-local

Each manifest freezes only its vendor's upstream tree, extraction index, registry subset, package
tree, and parity slice. This prevents one vendor's regeneration from invalidating another vendor's
anchor even though all packages share `skills/capabilities/registry.json` and the global parity
report.

### `artifacts` regenerates packages and writes a per-vendor parity slice

The command runs the vendor authoring script, runs the global parity audit once, then writes the
filtered package list and thresholds to
`audits/own-vendors/<vendor>/<anchor>/artifacts/parity-packages.json`. Records and manifests consume
that slice, so human review can inspect exactly the vendor under maintenance.

### Semantic review remains mandatory

`records` generates 01–04 and never overwrites an existing `05-semantic-review.md`. `baseline`
refuses a missing, placeholder, or conclusion-less review before writing a manifest.

## Risks

- The catalog is mutable and shared; `baseline` therefore freezes `catalog.json` itself into every
  manifest and `check` reports drift immediately.
- Vendor anchors do not include ARSU HTML artifacts; each vendor has one machine-review artifact
  (parity slice) rather than three HTML reports. A future vendor with mode-level review needs can
  extend the artifact command and record template.
