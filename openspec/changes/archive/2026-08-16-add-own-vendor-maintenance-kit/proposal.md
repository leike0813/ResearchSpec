## Why

Paper Humanizer and Revision Master now follow the same vendor absorption path as ARS, but their
maintenance evidence is still implicit: extraction indexes and authored packages exist without a
unified anchor audit, and there is no catalog for adding future user-owned upstream projects. ARS
has a dedicated maintenance kit; the two user-owned vendors need an equivalent kit that is merged
into one extensible catalog rather than duplicated per project.

## What Changes

- Add `audits/own-vendors/catalog.json` with `paper-humanizer` and `revision-master` entries:
  upstream snapshot, extraction index, authoring script, anchor ID, and capability IDs.
- Add `scripts/own-vendor-maintenance.mjs` with `artifacts`, `records`, `baseline`, `check`, and
  `diff` commands. Without a vendor argument, records/baseline/check/artifacts operate on every
  catalog vendor.
- Add first anchors for both vendors under `audits/own-vendors/<vendor>/<anchor>/` with records
  01–05, a parity slice artifact, and a hash manifest.
- Add `.agents/skills/own-vendor-maintenance/SKILL.md` with the five-stage path, an Agent semantic
  review gate, and an `add-vendor` procedure for future user-owned upstream projects.
- Add package scripts `own-vendor-maintenance:{artifacts,records,baseline,check}` and regression
  tests.

## Impact

- New vendor projects can be incrementally merged by adding an extraction index, authoring source
  set, and one catalog entry; the maintenance script and Skill require no code change.
- The two current vendors now have independently verifiable anchors that freeze upstream tree,
  extraction index, capability registry subset, package tree, parity slice, maintenance Skill, and
  audit record hashes.
- No public CLI command, runtime protocol, or capability package semantics change.

## Capabilities

### New Capabilities

- `own-vendor-maintenance`: catalog-driven maintenance for user-owned upstream vendors.

### Modified Capabilities

None.
